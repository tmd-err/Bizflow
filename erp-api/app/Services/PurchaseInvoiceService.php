<?php

namespace App\Services;

use App\Models\PurchaseInvoice;
use App\Models\PurchaseInvoiceItem;
use App\Models\PurchaseOrderItem;
use App\Models\SupplierPayment;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PurchaseInvoiceService
{
    public function listForCompany(User $actor): Collection
    {
        $this->ensureCompany($actor);

        return PurchaseInvoice::query()
            ->where("company_id", $actor->company_id)
            ->with(["supplier:id,name,code", "purchaseOrder:reference,id"])
            ->orderByDesc("invoice_date")
            ->get();
    }

    public function findForCompany(User $actor, int $id): PurchaseInvoice
    {
        $invoice = PurchaseInvoice::where("company_id", $actor->company_id)
            ->where("id", $id)
            ->firstOrFail();
        return $invoice->load(["supplier", "purchaseOrder", "creator", "items", "payments.creator"]);
    }

    public function create(User $actor, array $data): PurchaseInvoice
    {
        $this->ensureCompany($actor);

        $supplierId  = $data["supplier_id"];
        $poId        = $data["purchase_order_id"] ?? null;
        $invoiceDate = $data["invoice_date"] ?? now()->toDateString();

        $items = collect($data["items"])->map(function ($item) {
            $qty     = (float) $item["quantity"];
            $price   = (float) $item["unit_price"];
            $taxRate = (float) ($item["tax_rate"] ?? 0) / 100;
            $subtotal = $qty * $price;
            $tax     = $subtotal * $taxRate;
            $total   = $subtotal + $tax;

            return [
                "description"          => $item["description"],
                "purchase_order_item_id" => $item["purchase_order_item_id"] ?? null,
                "quantity"             => $qty,
                "unit_price"           => $price,
                "tax_rate"             => $item["tax_rate"] ?? 0,
                "tax_amount"           => $tax,
                "subtotal"             => $subtotal,
                "total"                => $total,
            ];
        })->all();

        $totals = $this->calcTotals($items);
        $initialStatus = $totals["total"] > 0 ? "unpaid" : "paid";

        return DB::transaction(function () use ($actor, $supplierId, $poId, $invoiceDate, $data, $items, $totals, $initialStatus) {
            $invoice = PurchaseInvoice::create([
                "company_id"        => $actor->company_id,
                "supplier_id"       => $supplierId,
                "purchase_order_id" => $poId,
                "invoice_number"    => $data["invoice_number"],
                "invoice_date"      => $invoiceDate,
                "due_date"          => $data["due_date"] ?? null,
                "subtotal"          => $totals["subtotal"],
                "tax_amount"        => $totals["tax"],
                "total"             => $totals["total"],
                "paid_amount"       => 0,
                "status"            => $initialStatus,
                "notes"             => $data["notes"] ?? null,
                "created_by"        => $actor->id,
            ]);

            foreach ($items as $item) {
                $invoice->items()->create($item);
            }

            return $invoice->load(["supplier", "purchaseOrder", "creator", "items"]);
        });
    }

    public function addPayment(User $actor, int $invoiceId, array $data): PurchaseInvoice
    {
        $this->ensureCompany($actor);

        return DB::transaction(function () use ($actor, $invoiceId, $data) {
            $invoice = PurchaseInvoice::where("company_id", $actor->company_id)
                ->where("id", $invoiceId)
                ->firstOrFail();

            $amount = (float) $data["amount"];
            $remaining = (float) $invoice->total - (float) $invoice->paid_amount;

            if ($amount > $remaining) {
                throw new \InvalidArgumentException("Payment amount exceeds the outstanding balance.");
            }

            SupplierPayment::create([
                "company_id"         => $actor->company_id,
                "supplier_invoice_id" => $invoice->id,
                "amount"             => $amount,
                "payment_date"       => $data["payment_date"] ?? now()->toDateString(),
                "payment_method"     => $data["payment_method"] ?? null,
                "reference"          => $data["reference"] ?? null,
                "notes"              => $data["notes"] ?? null,
                "created_by"         => $actor->id,
            ]);

            $newPaid = (float) $invoice->paid_amount + $amount;
            $newStatus = $newPaid >= (float) $invoice->total ? "paid" : ($newPaid > 0 ? "partially_paid" : "unpaid");

            $invoice->update([
                "paid_amount" => round($newPaid, 2),
                "status"      => $newStatus,
                "payment_notes" => $data["notes"] ?? $invoice->payment_notes,
            ]);

            return $invoice->fresh()->load(["supplier", "purchaseOrder", "creator", "items", "payments.creator"]);
        });
    }

    private function calcTotals(array $items): array
    {
        $subtotal = 0;
        $tax      = 0;
        foreach ($items as $item) {
            $subtotal += round($item["subtotal"], 2);
            $tax      += round($item["tax_amount"], 2);
        }
        return [
            "subtotal" => round($subtotal, 2),
            "tax"      => round($tax, 2),
            "total"    => round($subtotal + $tax, 2),
        ];
    }

    private function ensureCompany(User $actor): void
    {
        if (! $actor->company_id) {
            throw new AuthorizationException("You must belong to a company.");
        }
    }
}