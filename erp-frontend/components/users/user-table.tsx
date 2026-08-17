"use client";

import Link from "next/link";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CompanyUser } from "@/lib/api/users";
import { usePermission } from "@/hooks/use-permission";

interface UserTableProps {
  users: CompanyUser[];
}

export function UserTable({ users }: UserTableProps) {
  const { hasPermission } = usePermission();

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="min-w-full divide-y">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              User
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Roles
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y bg-card">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-4">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {user.roles?.length ? (
                    user.roles.map((role) => (
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
              <td className="px-4 py-4 text-right">
                {hasPermission("users.update") ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/users/${user.id}`}>Manage roles</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/users/${user.id}`}>View</Link>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UserSummaryCard({ user }: { user: CompanyUser }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {user.roles?.length ? (
            user.roles.map((role) => (
              <span
                key={role.id}
                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
              >
                {role.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              No roles assigned yet
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function UsersEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="size-8 text-muted-foreground" />
        <p className="mt-4 font-medium">No team members yet</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Users appear here after they register and join your company.
        </p>
      </CardContent>
    </Card>
  );
}
