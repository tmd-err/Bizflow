<?php

namespace App\Services;
use App\Http\Requests\StoreCompanyRequest;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CompanyService
{
    public function __construct(
        private CompanyRoleSetupService $companyRoleSetupService,
        private RoleService $roleService,
    ) {}

    public function create(array $data, User $user): Company
    {
        return DB::transaction(function () use ($data, $user) {
            $company = Company::create($data);

            $user->update([
                'company_id' => $company->id,
            ]);

            $roles = $this->companyRoleSetupService->setupDefaultRoles($company);

            if (isset($roles['Admin'])) {
                $this->roleService->assignRole($user, $user, $roles['Admin']);
            }

            return $company;
        });
    }
}
