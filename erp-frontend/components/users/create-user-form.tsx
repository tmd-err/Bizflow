"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  createUserSchema,
  type CreateUserFormValues,
} from "@/app/features/users/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Role } from "@/lib/api/roles";

interface CreateUserFormProps {
  roles: Role[];
  isSubmitting?: boolean;
  onSubmit: (values: CreateUserFormValues) => Promise<void> | void;
}

export function CreateUserForm({
  roles,
  isSubmitting = false,
  onSubmit,
}: CreateUserFormProps) {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role_ids: [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Full name</FormLabel><FormControl><Input placeholder="Jane Doe" autoComplete="name" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email address</FormLabel><FormControl><Input type="email" placeholder="jane@company.com" autoComplete="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>Temporary password</FormLabel><FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="password_confirmation" render={({ field }) => (
            <FormItem><FormLabel>Confirm password</FormLabel><FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="role_ids" render={({ field }) => (
          <FormItem>
            <FormLabel>Initial roles</FormLabel>
            <div className="space-y-2 rounded-lg border p-3">
              {roles.length ? roles.map((role) => {
                const checked = field.value.includes(role.id);
                return <label key={role.id} className="flex cursor-pointer items-start gap-3 rounded-md px-1 py-1 text-sm">
                  <input type="checkbox" checked={checked} onChange={() => field.onChange(checked ? field.value.filter((id) => id !== role.id) : [...field.value, role.id])} className="mt-0.5 size-4" />
                  <span><span className="font-medium">{role.name}</span>{role.description ? <span className="block text-muted-foreground">{role.description}</span> : null}</span>
                </label>;
              }) : <p className="text-sm text-muted-foreground">No roles are available. You can assign one later.</p>}
            </div>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="animate-spin" />Creating user...</> : "Create user"}
        </Button>
      </form>
    </Form>
  );
}
