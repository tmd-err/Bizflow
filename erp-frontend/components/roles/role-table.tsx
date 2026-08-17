"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isDefaultRole, type Role } from "@/lib/api/roles";
import { usePermission } from "@/hooks/use-permission";

interface RoleTableProps {
  roles: Role[];
  onDelete: (role: Role) => void;
}

export function RoleTable({ roles, onDelete }: RoleTableProps) {
  const { hasPermission } = usePermission();

  if (roles.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {roles.map((role) => {
        const permissionCount = role.permissions?.length ?? 0;

        return (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{role.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {role.description || "No description provided."}
                  </CardDescription>
                </div>
                {isDefaultRole(role.name) ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Default
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {permissionCount} permission{permissionCount === 1 ? "" : "s"}
              </p>
              <div className="flex flex-wrap gap-2">
                {hasPermission("roles.update") ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/roles/${role.id}`}>
                      <Pencil />
                      Edit
                    </Link>
                  </Button>
                ) : null}
                {hasPermission("roles.delete") && !isDefaultRole(role.name) ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(role)}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
