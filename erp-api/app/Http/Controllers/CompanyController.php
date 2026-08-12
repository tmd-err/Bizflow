<?php

namespace App\Http\Controllers;

use App\Services\CompanyService;
use App\Http\Requests\StoreCompanyRequest;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    public function __construct(
        private CompanyService $companyService
    ) {}

    public function store(StoreCompanyRequest $request): JsonResponse
    {
        $company = $this->companyService->create(
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'message' => 'Company created successfully.',
            'company' => $company,
        ], 201);
    }
}