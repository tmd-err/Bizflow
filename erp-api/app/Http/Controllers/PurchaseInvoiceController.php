<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseInvoiceRequest;
use App\Services\PurchaseInvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseInvoiceController extends Controller
{
    public function __construct(
        private PurchaseInvoiceService $invoiceService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $invoices = $this->invoiceService->listForCompany($request->user());

        return response()->json(["purchase_invoices" => $invoices]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $invoice = $this->invoiceService->findForCompany($request->user(), $id);

        return response()->json(["purchase_invoice" => $invoice]);
    }

    public function store(StorePurchaseInvoiceRequest $request): JsonResponse
    {
        $invoice = $this->invoiceService->create($request->user(), $request->validated());

        return response()->json([
            "message"        => "Invoice created successfully.",
            "purchase_invoice" => $invoice,
        ], 201);
    }

    public function addPayment(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            "amount"        => ["required", "numeric", "min:0.01"],
            "payment_date"  => ["nullable", "date"],
            "payment_method"=> ["nullable", "string", "max:50"],
            "reference"     => ["nullable", "string", "max:100"],
            "notes"         => ["nullable", "string"],
        ]);

        $invoice = $this->invoiceService->addPayment($request->user(), $id, $data);

        return response()->json([
            "message"        => "Payment recorded successfully.",
            "purchase_invoice" => $invoice,
        ]);
    }
}