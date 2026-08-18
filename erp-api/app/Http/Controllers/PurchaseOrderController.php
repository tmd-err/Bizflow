<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderRequest;
use App\Services\PurchaseOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{
    public function __construct(
        private PurchaseOrderService $purchaseOrderService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $pos = $this->purchaseOrderService->listForCompany($request->user());

        return response()->json(["purchase_orders" => $pos]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $po = $this->purchaseOrderService->findForCompany($request->user(), $id);

        return response()->json(["purchase_order" => $po]);
    }

    public function store(StorePurchaseOrderRequest $request): JsonResponse
    {
        $po = $this->purchaseOrderService->create($request->user(), $request->validated());

        return response()->json([
            "message"  => "Purchase order created successfully.",
            "purchase_order" => $po,
        ], 201);
    }

    public function update(UpdatePurchaseOrderRequest $request, int $id): JsonResponse
    {
        $po = $this->purchaseOrderService->update($request->user(), $id, $request->validated());

        return response()->json([
            "message"  => "Purchase order updated successfully.",
            "purchase_order" => $po,
        ]);
    }

    public function markOrdered(Request $request, int $id): JsonResponse
    {
        $po = $this->purchaseOrderService->markOrdered($request->user(), $id);

        return response()->json([
            "message"  => "Purchase order marked as ordered.",
            "purchase_order" => $po,
        ]);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $po = $this->purchaseOrderService->cancel($request->user(), $id);

        return response()->json([
            "message"  => "Purchase order cancelled.",
            "purchase_order" => $po,
        ]);
    }

    public function receive(Request $request, int $id): JsonResponse
    {
        $items = $request->validate([
            "items"   => ["required", "array", "min:1"],
            "items.*.purchase_order_item_id" => ["required", "integer", "exists:purchase_order_items,id"],
            "items.*.quantity"               => ["required", "numeric", "min:0.01"],
        ]);

        $result = $this->purchaseOrderService->receive($request->user(), $id, $items["items"]);

        return response()->json([
            "message"  => "Goods received successfully. Inventory has been updated.",
            ...$result,
        ]);
    }
}