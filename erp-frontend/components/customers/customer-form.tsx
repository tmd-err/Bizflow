"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { customerSchema, type CustomerFormValues } from "@/app/features/customers/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function CustomerForm({ defaultValues, isSubmitting, submitLabel = "Save customer", onSubmit }: { defaultValues?: CustomerFormValues; isSubmitting?: boolean; submitLabel?: string; onSubmit: (values: CustomerFormValues) => Promise<void> | void }) {
  const form = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema), defaultValues: defaultValues ?? { name: "", email: "", phone: "", address: "", city: "", country: "", tax_number: "", notes: "", is_active: true } });
  const fields: Array<{ name: "name" | "email" | "phone" | "address" | "city" | "country" | "tax_number"; label: string; type?: string }> = [{ name: "name", label: "Customer name" }, { name: "email", label: "Email", type: "email" }, { name: "phone", label: "Phone" }, { name: "address", label: "Address" }, { name: "city", label: "City" }, { name: "country", label: "Country" }, { name: "tax_number", label: "Tax number" }];
  return <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2">{fields.map(({ name, label, type }) => <FormField key={name} control={form.control} name={name} render={({ field }) => <FormItem className={name === "address" ? "sm:col-span-2" : ""}><FormLabel>{label}</FormLabel><FormControl><Input type={type} {...field} /></FormControl><FormMessage /></FormItem>} />)}</div><FormField control={form.control} name="notes" render={({ field }) => <FormItem><FormLabel>Notes</FormLabel><FormControl><textarea className="min-h-24 w-full rounded-lg border bg-transparent p-3 text-sm" {...field} /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="is_active" render={({ field }) => <FormItem><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={field.value} onChange={field.onChange} />Active customer</label></FormItem>} /><Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="animate-spin" />Saving...</> : submitLabel}</Button></form></Form>;
}
