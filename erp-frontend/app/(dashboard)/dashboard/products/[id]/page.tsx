"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermission } from "@/hooks/use-permission";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  getProductRequest,
  deleteProductRequest,
  getProductImageUrl,
} from "@/lib/api/products";
import type { Product } from "@/lib/api/products";
import { useFormFeedback } from "@/hooks/use-form-feedback";

export default function ProductDetailPage({
  
}: {
  params: { id: number };
}) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { hasPermission } = usePermission();
  const { showError, showSuccess } = useFormFeedback();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    getProductRequest(Number(params.id))
      .then((r) => setProduct(r.product))
      .catch((e) => showError(getApiErrorMessage(e, "Failed to load product.")))
      .finally(() => setLoading(false));
  }, [params.id, showError]);
    
  
  
  async function deactivate() {
    if (!product) return;
    setDeactivating(true);
    try {
      await deleteProductRequest(product.id);
      showSuccess("Product deactivated successfully.");
      router.push("/dashboard/products");
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to deactivate product."));
    } finally {
      setDeactivating(false);
    }
  }

  return (
    <PermissionGuard permission="products.view">
      <PageHeader
        title="Product details"
        description="View product information."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/products">
              <ArrowLeft />
              Back to products
            </Link>
          </Button>
        }
      />

      {loading ? (
        <LoadingSpinner containerClassName="min-h-40" />
      ) : product ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <p className="font-mono text-sm text-muted-foreground">
                  {product.sku}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {getProductImageUrl(product) && (
              <img
                src={getProductImageUrl(product) ?? undefined}
                alt={product.name}
                className="h-56 w-full rounded-lg border object-contain bg-muted/20"
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Description
                </p>
                <p className="text-sm">
                  {product.description ?? "No description"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Unit</p>
                <p className="text-sm">{product.unit}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Cost Price
                </p>
                <p className="text-sm">
                  {Number(product.cost_price).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Selling Price
                </p>
                <p className="text-sm">
                  {Number(product.selling_price).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Tax Rate</p>
                <p className="text-sm">{product.tax_rate ?? 0}%</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Status</p>
                <p className="text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.is_active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {hasPermission("products.update") && (
                <Button asChild>
                  <Link href={`/dashboard/products/${product.id}/edit`}>
                    Edit product
                  </Link>
                </Button>
              )}
              {hasPermission("products.delete") && product.is_active && (
                <Button
                  variant="destructive"
                  onClick={deactivate}
                  disabled={deactivating}
                >
                  {deactivating ? "Deactivating..." : "Deactivate"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </PermissionGuard>
  );
}
