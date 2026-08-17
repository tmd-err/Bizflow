"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search, Tag } from "lucide-react";
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
import {
  getProductsRequest,
  deleteProductRequest,
  getProductImageUrl,
  type Product,
} from "@/lib/api/products";

export function ProductsPageContent() {
  const { hasPermission } = usePermission();
  const { showError, showSuccess } = useFormFeedback();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load(value = search) {
    setLoading(true);
    try {
      const result = await getProductsRequest(value || undefined);
      setProducts(result.products);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to load products."));
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(() => void load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  
  async function remove() {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteProductRequest(target.id);
      showSuccess("Product deactivated successfully.");
      setTarget(null);
      await load();
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to deactivate product."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PermissionGuard permission="products.view">
      <PageHeader
        title="Products"
        description="Manage your product catalog, SKUs, and pricing."
        actions={
          hasPermission("products.create") ? (
            <Button asChild>
              <Link href="/dashboard/products/create">
                <Plus />
                Add product
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by SKU or name"
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner containerClassName="min-h-40" />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No products found"
          description="Add your first product to start building your catalog."
          action={
            hasPermission("products.create") ? (
              <Button asChild>
                <Link href="/dashboard/products/create">
                  <Plus />
                  Add product
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="min-w-full divide-y">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Unit
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Purchase Price
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Selling Price
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Tax
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Status
                </th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y bg-card">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-4">
                    {getProductImageUrl(product) ? (
                      <img
                        src={getProductImageUrl(product) ?? undefined}
                        alt=""
                        className="size-10 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">
                    {product.sku}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.description
                        ? product.description.slice(0, 60) + (product.description.length > 60 ? "..." : "")
                        : "—"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm">{product.unit}</td>
                  <td className="px-4 py-4 text-sm">
                    {Number(product.cost_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {Number(product.selling_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {product.tax_rate != null ? `${Number(product.tax_rate)}%` : "0%"}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.is_active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/products/${product.id}`}>
                        View
                      </Link>
                    </Button>
                    {hasPermission("products.update") && (
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="ml-2"
                      >
                        <Link href={`/dashboard/products/${Number(product.id)}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    )}
                    {hasPermission("products.delete") && product.is_active && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2"
                        onClick={() => setTarget(product)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Deactivate product"
        description={`Deactivate "${target?.name}"? The product will be hidden from active listings but remain in historical records.`}
        confirmLabel="Deactivate"
        isLoading={deleting}
        onConfirm={remove}
      />
    </PermissionGuard>
  );
}
