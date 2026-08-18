<?php

namespace App\Services;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PurchaseOrderService
{
    public function listForCompany(User $actor): Collection
    {
        $this->ensureCompany($actor);

        return PurchaseOrder::query()
            ->where("company_id", $actor->company_id)
            ->with(["supplier:id,name,code", "warehouse:id,name,code", "creator:id,name"])
            ->orderByDesc("created_at")
            ->get();
    }

    public function findForCompany(User $actor, int $id): PurchaseOrder
    {
        $po = PurchaseOrder::where("company_id", $actor->company_id)
            ->where("id", $id)
            ->firstOrFail();
        return $po->load(["supplier", "warehouse", "creator", "items.product"]);
    }

    public function create(User $actor, array $data): PurchaseOrder
    {
        $this->ensureCompany($actor);

        $supplier = Supplier::where("company_id", $actor->company_id)
            ->where("id", $data["supplier_id"])
            ->firstOrFail();
        $warehouse = Warehouse::where("company_id", $actor->company_id)
            ->where("id", $data["warehouse_id"])
            ->firstOrFail();

        return DB::transaction(function () use ($actor, $supplier, $warehouse, $data) {
            $items = collect($data["items"])->map(function ($item) use ($actor) {
                $product = Product::where("company_id", $actor->company_id)
                    ->where("id", $item["product_id"])
                    ->firstOrFail();

                $qty     = (float) $item["quantity"];
                $price   = (float) $item["unit_price"];
                $taxRate = (float) ($item["tax_rate"] ?? 0) / 100;
                $subtotal = $qty * $price;
                $tax     = $subtotal * $taxRate;
                $total   = $subtotal + $tax;

                return [
                    "product_id"       => $product->id,
                    "quantity"         => $qty,
                    "unit_price"       => $price,
                    "tax_rate"         => $item["tax_rate"] ?? 0,
                    "tax_amount"       => $tax,
                    "subtotal"         => $subtotal,
                    "total"            => $total,
                    "received_quantity"=> 0,
                ];
            })->all();

            $totals = $this->calcTotals($items);

            $po = PurchaseOrder::create([
                "company_id"   => $actor->company_id,
                "supplier_id"  => $supplier->id,
                "warehouse_id" => $warehouse->id,
                "reference"    => $data["reference"],
                "order_date"   => $data["order_date"] ?? now()->toDateString(),
                "expected_date"=> $data["expected_date"] ?? null,
                "status"       => $data["status"] ?? "draft",
                "subtotal"     => $totals["subtotal"],
                "tax_amount"   => $totals["tax"],
                "total"        => $totals["total"],
                "notes"        => $data["notes"] ?? null,
                "created_by"   => $actor->id,
            ]);

            foreach ($items as $item) {
                $po->items()->create($item);
            }

            return $po->load(["supplier", "warehouse", "creator", "items.product"]);
        });
    }

    public function update(User $actor, int $id, array $data): PurchaseOrder
    {
        $po = PurchaseOrder::where("company_id", $actor->company_id)
            ->where("id", $id)
            ->firstOrFail();

        $allowed = ["order_date", "expected_date", "notes", "status"];
        $update  = array_intersect_key($data, array_flip($allowed));
        if (isset($update["status"]) && !in_array($update["status"], ["draft", "ordered", "partially_received", "received", "cancelled"])) {
            $update["status"] = $po->status;
        }

        $po->update($update);
        return $po->fresh()->load(["supplier", "warehouse", "creator", "items.product"]);
    }

    public function markOrdered(User $actor, int $id): PurchaseOrder
    {
        $po = PurchaseOrder::where("company_id", $actor->company_id)
            ->where("id", $id)
            ->firstOrFail();

        if ($po->status !== "draft") {
            throw new \InvalidArgumentException("Only draft orders can be marked as ordered.");
        }

        $po->update(["status" => "ordered"]);
        return $po->fresh()->load(["supplier", "warehouse", "creator", "items.product"]);
    }

    public function cancel(User $actor, int $id): PurchaseOrder
    {
        $po = PurchaseOrder::where("company_id", $actor->company_id)
            ->where("id", $id)
            ->firstOrFail();

        if (in_array($po->status, ["received", "cancelled"])) {
            throw new \InvalidArgumentException("This order cannot be cancelled.");
        }

        $po->update(["status" => "cancelled"]);
        return $po->fresh()->load(["supplier", "warehouse", "creator", "items.product"]);
    }

    public function receive(User $actor, int $id, array $receivedItems): array
    {
        $po = PurchaseOrder::where("company_id", $actor->company_id)
            ->where("id", $id)
            ->firstOrFail();

        if (in_array($po->status, ["draft", "cancelled"])) {
            throw new \InvalidArgumentException("This order cannot be received.");
        }

        $fullyReceived = true;

        return DB::transaction(function () use ($actor, $po, $receivedItems, &$fullyReceived) {
            $totalReceived = 0;
            $allReceived = true;

            foreach ($receivedItems as $ri) {
                $item = PurchaseOrderItem::where("purchase_order_id", $po->id)
                    ->where("id", $ri["purchase_order_item_id"])
                    ->firstOrFail();

                $receiveQty = (float) $ri["quantity"];
                $remaining  = (float) $item->quantity - (float) $item->received_quantity;

                if ($receiveQty > $remaining) {
                    throw new \InvalidArgumentException("Cannot receive more than remaining quantity for item {$item->product_id}.");
                }

                $newReceived = (float) $item->received_quantity + $receiveQty;
                $item->update(["received_quantity" => $newReceived]);

                // Create stock movement
                StockMovement::create([
                    "company_id"     => $po->company_id,
                    "product_id"     => $item->product_id,
                    "warehouse_id"   => $po->warehouse_id,
                    "type"           => "goods_receipt",
                    "quantity"       => $receiveQty,
                    "reference_type" => PurchaseOrder::class,
                    "reference_id"   => $po->id,
                    "created_by"     => $actor->id,
                    "notes"          => "PO {$po->reference}",
                ]);

                if ($newReceived < (float) $item->quantity) {
                    $allReceived = false;
                }
                $totalReceived += $receiveQty;
            }

            $newStatus = $allReceived ? "received" : "partially_received";
            $po->update(["status" => $newStatus]);

            return [
                "status"     => $newStatus,
                "received"   => $totalReceived,
                "po"         => $po->fresh()->load(["supplier", "warehouse", "creator", "items.product"]),
            ];
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