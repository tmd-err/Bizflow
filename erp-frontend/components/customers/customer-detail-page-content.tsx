"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { usePermission } from "@/hooks/use-permission";
import { getApiErrorMessage } from "@/lib/api/client";
import { getCustomerRequest, type Customer } from "@/lib/api/customers";
export function CustomerDetailPageContent({ customerId }: { customerId: number }) { const { hasPermission } = usePermission(); const { showError } = useFormFeedback(); const [customer, setCustomer] = useState<Customer | null>(null); useEffect(() => { getCustomerRequest(customerId).then((r) => setCustomer(r.customer)).catch((e) => showError(getApiErrorMessage(e, "Failed to load customer."))); }, [customerId, showError]); if (!customer) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>; const entries = [["Email", customer.email], ["Phone", customer.phone], ["Address", customer.address], ["City", customer.city], ["Country", customer.country], ["Tax number", customer.tax_number], ["Status", customer.is_active ? "Active" : "Inactive"]]; return <PermissionGuard permission="customers.view"><PageHeader title={customer.name} description="Customer details" actions={<><Button asChild variant="outline"><Link href="/dashboard/customers"><ArrowLeft />Back</Link></Button>{hasPermission("customers.update") ? <Button asChild><Link href={`/dashboard/customers/${customer.id}/edit`}><Pencil />Edit</Link></Button> : null}</>} /><Card className="max-w-3xl"><CardHeader><CardTitle>Customer information</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2">{entries.map(([label, value]) => <div key={label}><p className="text-xs font-medium uppercase text-muted-foreground">{label}</p><p className="mt-1 text-sm">{value || "—"}</p></div>)}<div className="sm:col-span-2"><p className="text-xs font-medium uppercase text-muted-foreground">Notes</p><p className="mt-1 whitespace-pre-wrap text-sm">{customer.notes || "—"}</p></div></CardContent></Card></PermissionGuard>; }
