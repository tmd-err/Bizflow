"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Users } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { usePermission } from "@/hooks/use-permission";
import { getApiErrorMessage } from "@/lib/api/client";
import { getUsersRequest, type CompanyUser } from "@/lib/api/users";

export function EmployeesPageContent() {
  const { hasPermission } = usePermission();
  const { showError } = useFormFeedback();
  const [employees, setEmployees] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    getUsersRequest()
      .then((response) => {
        if (isMounted) {
          setEmployees(response.users);
        }
      })
      .catch((error) => {
        if (isMounted) {
          showError(getApiErrorMessage(error, "Failed to load employees."));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const filteredEmployees = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return employees;
    }

    return employees.filter((employee) => {
      const roles = employee.roles?.map((role) => role.name).join(" ") ?? "";

      return `${employee.name} ${employee.email} ${roles}`
        .toLowerCase()
        .includes(value);
    });
  }, [employees, search]);

  return (
    <PermissionGuard permission="users.view">
      <PageHeader
        title="Employees"
        description="View employees and their company access roles."
        actions={
          hasPermission("users.create") ? (
            <Button asChild>
              <Link href="/dashboard/users/create">
                <Plus />
                Add employee
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employees"
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner containerClassName="min-h-40" />
      ) : employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description="Employees will appear here once they belong to your company."
          action={
            hasPermission("users.create") ? (
              <Button asChild>
                <Link href="/dashboard/users/create">
                  <Plus />
                  Add employee
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching employees"
          description="Try changing your search term to find another employee."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="min-w-full divide-y">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Roles
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-card">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-4 py-4">
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.email}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {employee.roles?.length ? (
                        employee.roles.map((role) => (
                          <span
                            key={role.id}
                            className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                          >
                            {role.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No roles assigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {employee.created_at
                      ? new Date(employee.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/users/${employee.id}`}>
                        {hasPermission("users.update") ? "Manage" : "View"}
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PermissionGuard>
  );
}
