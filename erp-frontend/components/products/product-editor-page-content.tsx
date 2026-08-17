"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import type { ProductFormValues } from "@/app/features/products/schemas";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  getProductRequest,
  createProductRequest,
  updateProductRequest,
  getProductImageUrl,
  type Product,
} from "@/lib/api/products";
import { ProductForm } from "./product-form";

const toFormValues = (p: Product): ProductFormValues => ({
  sku: p.sku,
  name: p.name,
  description: p.description ?? "",
  unit: p.unit,
  cost_price: Number(p.cost_price),
  selling_price: Number(p.selling_price),
  tax_rate: Number(p.tax_rate ?? 0),
  is_active: p.is_active,
});

export function ProductEditorPageContent({
  
}: {
  productId?: number;
}) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const { showError, showSuccess } = useFormFeedback();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    getProductRequest(productId)
      .then((r) => setProduct(r.product))
      .catch((e) => showError(getApiErrorMessage(e, "Failed to load product.")))
      .finally(() => setLoading(false));
  }, [productId, showError]);

  async function submit(data: ProductFormValues, image: File | null) {
    setSubmitting(true);
    try {
      const payload = image ? { ...data, image } : data;
      const response = productId
        ? await updateProductRequest(productId, payload)
        : await createProductRequest(payload);
      showSuccess(
        productId ? "Product updated successfully." : "Product created successfully."
      );
      router.push(`/dashboard/products/${response.product.id}`);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to save product."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PermissionGuard
      permission={productId ? "products.update" : "products.create"}
    >
      <PageHeader
        title={productId ? "Edit product" : "Add product"}
        description="Manage product information for your company."
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
      ) : (
        <Card className="max-w-3xl">
          <CardContent className="pt-6">
            <ProductForm
              defaultValues={product ? toFormValues(product) : undefined}
              imageUrl={product ? getProductImageUrl(product) : null}
              isSubmitting={submitting}
              submitLabel={productId ? "Update product" : "Create product"}
              onSubmit={submit}
            />
          </CardContent>
        </Card>
      )}
    </PermissionGuard>
  );
}
