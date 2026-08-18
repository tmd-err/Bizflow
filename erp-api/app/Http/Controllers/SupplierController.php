<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function __construct(
        private SupplierService $supplierService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $suppliers = $this->supplierService->listForCompany($request->user());

        return response()->json(['suppliers' => $suppliers]);
    }

    public function show(Request $request, Supplier $supplier): JsonResponse
    {
        $supplier = $this->supplierService->findForCompany($request->user(), $supplier);

        return response()->json(['supplier' => $supplier]);
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $supplier = $this->supplierService->create($request->user(), $request->validated());

        return response()->json([
            'message' => 'Supplier created successfully.',
            'supplier' => $supplier,
        ], 201);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $supplier = $this->supplierService->update($request->user(), $supplier, $request->validated());

        return response()->json([
            'message' => 'Supplier updated successfully.',
            'supplier' => $supplier,
        ]);
    }

    public function destroy(Request $request, Supplier $supplier): JsonResponse
    {
        $this->supplierService->deactivate($request->user(), $supplier);

        return response()->json(['message' => 'Supplier deactivated successfully.']);
    }

    public function reactivate(Request $request, Supplier $supplier): JsonResponse
    {
        $supplier = $this->supplierService->reactivate($request->user(), $supplier);

        return response()->json([
            'message' => 'Supplier reactivated successfully.',
            'supplier' => $supplier,
        ]);
    }
}