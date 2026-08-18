"use client";

import { useEffect, useCallback, useState, FormEvent } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Receipt as PaymentIcon,
  Plus,
} from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { InfoCard } from "@/components/shared/info-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getPurchaseInvoiceRequest,
  addInvoicePaymentRequest,
} from "@/lib/api/purchasing";
import { getApiErrorMessage } from "@/lib/api/client";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import type { PurchaseInvoice, PurchaseInvoiceItem, SupplierPayment } from "@/lib/purchasing-types";

const STATUS_STYLES: Record<string, string> = {
  unpaid: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  partially_paid: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { showSuccess, showError } = useFormFeedback();
  const [loading, setLoading] = useState(true);
  const [recordOpen, setRecordOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [po, setPo] = useState<PurchaseInvoice | null>(null);

  function load() {
    setLoading(true);
    getPurchaseInvoiceRequest(id)
      .then((data) => setPo(data))
      .catch((err) => {
        if (err?.status === 404) notFound();
        showError(getApiErrorMessage(err, "Failed to load invoice."));
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { void load(); }, [id]);

  const balanceDue = po ? po.total - po.paid_amount : 0;
  const canPay = balanceDue > 0.01 && po?.status !== "cancelled";

  async function submitPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!po) return;
    const fd = new FormData(e.currentTarget);
    const amt = parseFloat(String(fd.get("amount")));
    if (!amt || amt <= 0 || amt > balanceDue + 0.009) {
      showError(`Enter a valid amount (<= ${formatCurrency(balanceDue)}).`);
      return;
    }
    setPaying(true);
    try {
      const updated = await addInvoicePaymentRequest(po.id, {
        amount: amt,
        payment_date: String(fd.get("date") || new Date().toISOString().slice(0, 10)),
        payment_method: String(fd.get("method") || "bank_transfer"),
        reference: String(fd.get("reference") || ""),
        notes: String(fd.get("notes") || "") || undefined,
      });
      setPo(updated);
      setRecordOpen(false);
      showSuccess("Payment recorded.");
    } catch (err) {
      showError(getApiErrorMessage(err, "Failed to record payment."));
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <LoadingSpinner containerClassName="min-h-[60vh]" />;
  if (!po) return null;

  return (
    <PermissionGuard permission="purchases.view">
      <PageHeader
        title={`Invoice ${po.invoice_number}`}
        description={
          <span className="inline-flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[po.status] || ""}`}>
              {po.status.replace(/_/g, " ")}
            </span>
            <span className="text-muted-foreground">
              {new Date(po.invoice_date).toLocaleDateString()}
              {po.due_date && <> · Due {new Date(po.due_date).toLocaleDateString()}</>}
            </span>
          </span>
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/purchases/invoices">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <InfoCard label="Invoice Number" value={po.invoice_number} icon={<FileText className="size-4" />} />
          <InfoCard
            label="Supplier"
            value={
              <span className="font-mono">
                {po.supplier?.name ?? "—"}
              </span>
            }
          />
          {po.purchaseOrder && (
            <InfoCard
              label="Purchase Order"
              value={
                <span className="font-mono">
                  {po.purchaseOrder.reference}
                </span>
              }
            />
          )}
          {po.notes && <InfoCard label="Notes" value={po.notes} />}
          {po.payment_notes && (
            <InfoCard label="Payment Notes" value={po.payment_notes} />
          )}

          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Tax %</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(po.items || []).map((it: PurchaseInvoiceItem) => (
                    <TableRow key={it.id}>
                      <TableCell className="text-sm">{it.description}</TableCell>
                      <TableCell className="text-right text-sm">{it.quantity}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(it.unit_price)}</TableCell>
                      <TableCell className="text-right text-sm">{it.tax_rate}%</TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {formatCurrency(it.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(po.items || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                        No items
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {(po.payments?.length ?? 0) > 0 && (
            <Card>
              <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Recorded By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(po.payments as SupplierPayment[]).map((pm) => (
                      <TableRow key={pm.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {new Date(pm.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right text-sm font-mono">
                          {formatCurrency(pm.amount)}
                        </TableCell>
                        <TableCell className="text-sm capitalize">
                          {(pm.payment_method || "bank_transfer").replace("_", " ")}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{pm.reference ?? "—"}</TableCell>
                        <TableCell className="text-sm">{pm.creator?.name ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatCurrency(po.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono">{formatCurrency(po.tax_amount)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span className="font-mono">{formatCurrency(po.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-mono">
                  {formatCurrency(po.paid_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Balance Due</span>
                <span className="font-mono">{formatCurrency(balanceDue)}</span>
              </div>
            </CardContent>
          </Card>

          {canPay && (
            <PermissionGuard permission="purchases.pay" fallback={null}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2">
                  <PaymentIcon className="size-4" /> Record Payment
                </CardTitle></CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSaving(true);
                      setRecordOpen(true);
                      setSaving(false);
                    }}
                    disabled={saving}
                  >
                    <Plus className="mr-2 size-4" /> Record Payment
                  </Button>
                </CardContent>
              </Card>
            </PermissionGuard>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        title="Record Payment"
        description={
          <form id="pay-form" onSubmit={submitPayment} className="space-y-4">
            <div>
              <Label>Amount * (Max {formatCurrency(balanceDue)})</Label>
              <Input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                max={balanceDue.toFixed(2)}
                required
                autoFocus
                className="font-mono"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select name="method" defaultValue="bank_transfer">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference</Label>
              <Input name="reference" placeholder="TXN-001" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" rows={2} />
            </div>
          </form>
        }
        confirmLabel={paying ? "Recording..." : "Confirm Payment"}
        onConfirm={() => {
          const form = document.getElementById("pay-form") as HTMLFormElement | null;
          form?.requestSubmit();
        }}
        loading={paying}
      />
    </PermissionGuard>
  );
}

function formatCurrency(v: number): string {
  return "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}