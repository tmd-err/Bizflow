"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { usePermission } from "@/hooks/use-permission";
import { getApiErrorMessage } from "@/lib/api/client";
import { getRolesRequest, type Role } from "@/lib/api/roles";
import {
  assignUserRoleRequest,
  removeUserRoleRequest,
  type CompanyUser,
} from "@/lib/api/users";

interface UserRoleManagerProps {
  user: CompanyUser;
  onUpdated: (user: CompanyUser) => void;
}

export function UserRoleManager({ user, onUpdated }: UserRoleManagerProps) {
  const { hasPermission } = usePermission();
  const { showError, showSuccess } = useFormFeedback();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingRoleId, setRemovingRoleId] = useState<number | null>(null);

  useEffect(() => {
    getRolesRequest()
      .then((response) => setRoles(response.roles))
      .catch((error) =>
        showError(getApiErrorMessage(error, "Failed to load roles."))
      )
      .finally(() => setIsLoadingRoles(false));
  }, []);

  const availableRoles = useMemo(() => {
    const assignedIds = new Set(user.roles?.map((role) => role.id) ?? []);
    return roles.filter((role) => !assignedIds.has(role.id));
  }, [roles, user.roles]);

  async function handleAssign() {
    if (!selectedRoleId) return;

    setIsSubmitting(true);

    try {
      const response = await assignUserRoleRequest(user.id, Number(selectedRoleId));
      onUpdated({ ...user, roles: response.roles });
      setSelectedRoleId("");
      showSuccess("Role assigned successfully.");
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to assign role."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(roleId: number) {
    setRemovingRoleId(roleId);

    try {
      const response = await removeUserRoleRequest(user.id, roleId);
      onUpdated({ ...user, roles: response.roles });
      showSuccess("Role removed successfully.");
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to remove role."));
    } finally {
      setRemovingRoleId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned roles</CardTitle>
        <CardDescription>
          Roles determine which permissions this user receives.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {user.roles?.length ? (
            user.roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div>
                  <p className="font-medium">{role.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {role.description || "No description provided."}
                  </p>
                </div>
                {hasPermission("users.update") ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={removingRoleId === role.id}
                    onClick={() => handleRemove(role.id)}
                  >
                    {removingRoleId === role.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <X />
                    )}
                    Remove
                  </Button>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              This user has no roles assigned yet.
            </p>
          )}
        </div>

        {hasPermission("users.update") ? (
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm font-medium">Assign a role</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              {isLoadingRoles ? <LoadingSpinner inline className="size-5" /> : <select
                value={selectedRoleId}
                onChange={(event) => setSelectedRoleId(event.target.value)}
                disabled={isLoadingRoles || isSubmitting || availableRoles.length === 0}
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
              >
                <option value="">
                  {availableRoles.length === 0
                      ? "No more roles available"
                      : "Select a role"}
                </option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>}
              <Button
                onClick={handleAssign}
                disabled={!selectedRoleId || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Plus />
                    Assign role
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
