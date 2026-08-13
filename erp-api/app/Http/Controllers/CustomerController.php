<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(private CustomerService $customerService) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(['customers' => $this->customerService->listForCompany($request->user(), $request->string('search')->toString() ?: null)]);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        return response()->json(['message' => 'Customer created successfully.', 'customer' => $this->customerService->create($request->user(), $request->validated())], 201);
    }

    public function show(Request $request, Customer $customer): JsonResponse
    {
        return response()->json(['customer' => $this->customerService->findForCompany($request->user(), $customer)]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        return response()->json(['message' => 'Customer updated successfully.', 'customer' => $this->customerService->update($request->user(), $customer, $request->validated())]);
    }

    public function destroy(Request $request, Customer $customer): JsonResponse
    {
        $this->customerService->delete($request->user(), $customer);
        return response()->json(['message' => 'Customer deleted successfully.']);
    }
}
