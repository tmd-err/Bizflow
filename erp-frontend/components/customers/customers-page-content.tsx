"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { usePermission } from "@/hooks/use-permission";
import { getApiErrorMessage } from "@/lib/api/client";
import { deleteCustomerRequest, getCustomersRequest, type Customer } from "@/lib/api/customers";

export function CustomersPageContent() {
  const { hasPermission } = usePermission(); const { showError, showSuccess } = useFormFeedback(); const [customers, setCustomers] = useState<Customer[]>([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState(""); const [target, setTarget] = useState<Customer | null>(null); const [deleting, setDeleting] = useState(false);
  async function load(value = search) { setLoading(true); try { setCustomers((await getCustomersRequest(value)).customers); } catch (e) { showError(getApiErrorMessage(e, "Failed to load customers.")); } finally { setLoading(false); } }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `load` intentionally uses the current debounced search value.
  useEffect(() => { const timeout = setTimeout(() => void load(search), 250); return () => clearTimeout(timeout); }, [search]);
  async function remove() { if (!target) return; setDeleting(true); try { await deleteCustomerRequest(target.id); showSuccess("Customer deleted successfully."); setTarget(null); await load(); } catch (e) { showError(getApiErrorMessage(e, "Failed to delete customer.")); } finally { setDeleting(false); } }
  return <PermissionGuard permission="customers.view"><PageHeader title="Customers" description="Manage your company’s customer records." actions={hasPermission("customers.create") ? <Button asChild><Link href="/dashboard/customers/create"><Plus />Add customer</Link></Button> : null} /><div className="mb-6 max-w-md"><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers" className="pl-9" /></div></div>{loading ? <LoadingSpinner containerClassName="min-h-40" /> : customers.length === 0 ? <EmptyState icon={Users} title="No customers found" description="Add your first customer to start building your sales workflow." action={hasPermission("customers.create") ? <Button asChild><Link href="/dashboard/customers/create"><Plus />Add customer</Link></Button> : undefined} /> : <div className="overflow-hidden rounded-xl border"><table className="min-w-full divide-y"><thead className="bg-muted/40"><tr><th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">Customer</th><th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">Contact</th><th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">Status</th><th /></tr></thead><tbody className="divide-y bg-card">{customers.map((customer) => <tr key={customer.id}><td className="px-4 py-4"><p className="font-medium">{customer.name}</p><p className="text-sm text-muted-foreground">{customer.city || customer.country || "—"}</p></td><td className="px-4 py-4 text-sm">{customer.email || customer.phone || "—"}</td><td className="px-4 py-4 text-sm">{customer.is_active ? "Active" : "Inactive"}</td><td className="px-4 py-4 text-right"><Button asChild size="sm" variant="outline"><Link href={`/dashboard/customers/${customer.id}`}>View</Link></Button>{hasPermission("customers.delete") ? <Button size="sm" variant="ghost" className="ml-2" onClick={() => setTarget(customer)}>Delete</Button> : null}</td></tr>)}</tbody></table></div>}<ConfirmDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)} title="Delete customer" description={`Delete ${target?.name}? Customers with quotations may need to be deactivated instead.`} confirmLabel="Delete customer" isLoading={deleting} onConfirm={remove} /></PermissionGuard>;
}
