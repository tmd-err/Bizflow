import { ProductEditorPageContent } from "@/components/products/product-editor-page-content";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <ProductEditorPageContent productId={Number(params.id)} />;
}