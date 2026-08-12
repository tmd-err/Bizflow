<?php

namespace App\Services;
use App\Http\Requests\StoreCompanyRequest;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CompanyService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }
    public function create(array $data, User $user): Company
    {
        return DB::transaction(function () use ($data, $user) {
            $company = Company::create($data);

            $user->update([
                'company_id' => $company->id,
            ]);

            return $company;
        });
    }
}
