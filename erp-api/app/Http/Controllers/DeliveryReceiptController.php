<?php

namespace App\Http\Controllers;

use App\Services\DeliveryReceiptService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeliveryReceiptController extends Controller
{
    public function __construct(private DeliveryReceiptService $service) {}

    /**
     * List delivery receipts for the authenticated user's company.
     */
    public function index(Request $request): JsonResponse
    {
        $receipts = $this->service->listForCompany($request->user());

        $items = [];
        foreach ($receipts as $r) {
            $items[] = [
                'id' => $r->id,
                'company_id' => $r->company_id,
                'supplier_id' => $r->supplier_id,
                'purchase_order_id' => $r->purchase_order_id,
                'warehouse_id' => $r->warehouse_id,
                'reference' => $r->reference,
                'receipt_date' => $r->receipt_date?->format('Y-m-d'),
                'status' => $r->status,
                'notes' => $r->notes,
                'created_by' => $r->created_by,
                'created_at' => $r->created_at?->toIso8601String(),
                'updated_at' => $r->updated_at?->toIso8601String(),
                'supplier' => $r->supplier ? [
                    'id' => $r->supplier->id,
                    'name' => $r->supplier->name,
                    'code' => $r->supplier->code,
                ] : null,
                'warehouse' => $r->warehouse ? [
                    'id' => $r->warehouse->id,
                    'name' => $r->warehouse->name,
                    'code' => $r->warehouse->code,
                ] : null,
                'purchaseOrder' => $r->purchaseOrder ? [
                    'id' => $r->purchaseOrder->id,
                    'reference' => $r->purchaseOrder->reference,
                ] : null,
                'creator' => $r->creator ? [
                    'id' => $r->creator->id,
                    'name' => $r->creator->name,
                ] : null,
                'items_count' => $r->items_count ?? $r->items()->count(),
                'items' => ($r->relationLoaded('items') ? $r->items : collect())->map(fn ($it) => [
                    'id' => $it->id,
                    'delivery_receipt_id' => $it->delivery_receipt_id,
                    'purchase_order_item_id' => $it->purchase_order_item_id,
                    'product_id' => $it->product_id,
                    'description' => $it->description,
                    'ordered_qty' => (float) $it->ordered_qty,
                    'received_qty' => (float) $it->received_qty,
                    'unit' => $it->unit,
                    'product' => $it->product ? [
                        'id' => $it->product->id,
                        'name' => $it->product->name,
                        'sku' => $it->product->sku,
                    ] : null,
                ])->all(),
            ];
        }

        return response()->json(['delivery_receipts' => $items]);
    }

    /**
     * Show a single delivery receipt.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $receipt = $this->service->findForCompany($request->user(), $id);

        $r = $receipt;

        $payload = [
            'id' => $r->id,
            'company_id' => $r->company_id,
            'supplier_id' => $r->supplier_id,
            'purchase_order_id' => $r->purchase_order_id,
            'warehouse_id' => $r->warehouse_id,
            'reference' => $r->reference,
            'receipt_date' => $r->receipt_date?->format('Y-m-d'),
            'status' => $r->status,
            'notes' => $r->notes,
            'created_by' => $r->created_by,
            'created_at' => $r->created_at?->toIso8601String(),
            'updated_at' => $r->updated_at?->toIso8601String(),
            'supplier' => $r->supplier ? [
                'id' => $r->supplier->id,
                'name' => $r->supplier->name,
                'code' => $r->supplier->code,
            ] : null,
            'warehouse' => $r->warehouse ? [
                'id' => $r->warehouse->id,
                'name' => $r->warehouse->name,
                'code' => $r->warehouse->code,
            ] : null,
            'purchaseOrder' => $r->purchaseOrder ? [
                'id' => $r->purchaseOrder->id,
                'reference' => $r->purchaseOrder->reference,
            ] : null,
            'creator' => $r->creator ? [
                'id' => $r->creator->id,
                'name' => $r->creator->name,
            ] : null,
            'items_count' => $r->items()->count(),
            'items' => $r->items->map(fn ($it) => [
                'id' => $it->id,
                'delivery_receipt_id' => $it->delivery_receipt_id,
                'purchase_order_item_id' => $it->purchase_order_item_id,
                'product_id' => $it->product_id,
                'description' => $it->description,
                'ordered_qty' => (float) $it->ordered_qty,
                'received_qty' => (float) $it->received_qty,
                'unit' => $it->unit,
                'product' => $it->product ? [
                    'id' => $it->product->id,
                    'name' => $it->product->name,
                    'sku' => $it->product->sku,
                ] : null,
            ])->all(),
        ];

        return response()->json(['delivery_receipt' => $payload]);
    }

    /**
     * Store a new delivery receipt.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'nullable|integer|exists:suppliers,id',
            'purchase_order_id' => 'nullable|integer|exists:purchase_orders,id',
            'reference' => 'required|string|max:255|unique:delivery_receipts,reference',
            'receipt_date' => 'required|date',
            'warehouse_id' => 'required|integer|exists:warehouses,id',
            'notes' => 'nullable|string|max:5000',
            'items' => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'nullable|integer|exists:purchase_order_items,id',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.description' => 'nullable|string|max:500',
            'items.*.ordered_qty' => 'required|numeric|min:0',
            'items.*.received_qty' => 'required|numeric|min:0.01',
            'items.*.unit' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // supplier_id is required unless purchase_order_id is provided (supplier comes from PO)
        if (empty($data['purchase_order_id']) && empty($data['supplier_id'])) {
            return response()->json(['errors' => ['supplier_id' => ['The supplier is required when no purchase order is linked.']]], 422);
        }

        $receipt = $this->service->create($request->user(), $data);

        return response()->json([
            'message' => 'Delivery receipt created.',
            'delivery_receipt' => $this->formatReceipt($receipt),
        ], 201);
    }

    private function formatReceipt($receipt): array
    {
        return [
            'id' => $receipt->id,
            'company_id' => $receipt->company_id,
            'supplier_id' => $receipt->supplier_id,
            'purchase_order_id' => $receipt->purchase_order_id,
            'warehouse_id' => $receipt->warehouse_id,
            'reference' => $receipt->reference,
            'receipt_date' => $receipt->receipt_date?->format('Y-m-d'),
            'status' => $receipt->status,
            'notes' => $receipt->notes,
            'created_by' => $receipt->created_by,
            'created_at' => $receipt->created_at?->toIso8601String(),
            'updated_at' => $receipt->updated_at?->toIso8601String(),
            'supplier' => $receipt->supplier ? [
                'id' => $receipt->supplier->id,
                'name' => $receipt->supplier->name,
                'code' => $receipt->supplier->code,
            ] : null,
            'warehouse' => $receipt->warehouse ? [
                'id' => $receipt->warehouse->id,
                'name' => $receipt->warehouse->name,
                'code' => $receipt->warehouse->code,
            ] : null,
            'purchaseOrder' => $receipt->purchaseOrder ? [
                'id' => $receipt->purchaseOrder->id,
                'reference' => $receipt->purchaseOrder->reference,
            ] : null,
            'creator' => $receipt->creator ? [
                'id' => $receipt->creator->id,
                'name' => ($receipt->relationLoaded('creator') && $receipt->creator) ? $receipt->creator->name : null,
            ] : null,
            'items' => ($receipt->relationLoaded('items') ? $receipt->items : collect())->map(fn ($it) => [
                'id' => $it->id,
                'delivery_receipt_id' => $it->delivery_receipt_id,
                'purchase_order_item_id' => $it->purchase_order_item_id,
                'product_id' => $it->product_id,
                'description' => $it->description,
                'ordered_qty' => (float) $it->ordered_qty,
                'received_qty' => (float) $it->received_qty,
                'unit' => $it->unit,
                'product' => $it->product ? [
                    'id' => $it->product->id,
                    'name' => $it->product->name,
                    'sku' => $it->product->sku,
                ] : null,
            ])->all(),
        ];
    }
}