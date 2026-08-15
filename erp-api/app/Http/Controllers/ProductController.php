<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private ProductService $productService) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'products' => $this->productService->listForCompany(
                $request->user(),
                $request->string('search')->toString() ?: null,
                $request->has('is_active')
                ? $request->boolean('is_active')
                : null
            ),
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        return response()->json([
            'message' => 'Product created successfully.',
            'product' => $this->productService->create($request->user(), $request->validated()),
        ], 201);
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        return response()->json([
            'product' => $this->productService->findForCompany($request->user(), $product),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $this->productService->update($request->user(), $product, $request->validated()),
        ]);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->productService->deactivate($request->user(), $product);
        return response()->json(['message' => 'Product deactivated successfully.']);
    }
}