"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { CustomerFormValues } from "@/app/features/customers/schemas";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getApiErrorMessage } from "@/lib/api/client";
import { createCustomerRequest, getCustomerRequest, updateCustomerRequest, type Customer } from "@/lib/api/customers";

const values = (customer: Customer): CustomerFormValues => ({ name: customer.name, email: customer.email ?? "", phone: customer.phone ?? "", address: customer.address ?? "", city: customer.city ?? "", country: customer.country ?? "", tax_number: customer.tax_number ?? "", notes: customer.notes ?? "", is_active: customer.is_active });
export function CustomerEditorPageContent({ customerId }: { customerId?: number }) {
  const router = useRouter(); const { showError, showSuccess } = useFormFeedback(); const [customer, setCustomer] = useState<Customer | null>(null); const [loading, setLoading] = useState(Boolean(customerId)); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (!customerId) return; getCustomerRequest(customerId).then((r) => setCustomer(r.customer)).catch((e) => showError(getApiErrorMessage(e, "Failed to load customer."))).finally(() => setLoading(false)); }, [customerId, showError]);
  async function submit(data: CustomerFormValues) { setSubmitting(true); try { const response = customerId ? await updateCustomerRequest(customerId, data) : await createCustomerRequest(data); showSuccess(customerId ? "Customer updated successfully." : "Customer created successfully."); router.push(`/dashboard/customers/${response.customer.id}`); } catch (e) { showError(getApiErrorMessage(e, "Failed to save customer.")); } finally { setSubmitting(false); } }
  return <PermissionGuard permission={customerId ? "customers.update" : "customers.create"}><PageHeader title={customerId ? "Edit customer" : "Add customer"} description="Manage customer information for your company." actions={<Button asChild variant="outline"><Link href="/dashboard/customers"><ArrowLeft />Back to customers</Link></Button>} />{loading ? <LoadingSpinner containerClassName="min-h-40" /> : <Card className="max-w-3xl"><CardContent className="pt-6"><CustomerForm defaultValues={customer ? values(customer) : undefined} isSubmitting={submitting} submitLabel={customerId ? "Update customer" : "Create customer"} onSubmit={submit} /></CardContent></Card>}</PermissionGuard>;
}
