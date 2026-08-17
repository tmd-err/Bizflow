import { CustomerEditorPageContent } from "@/components/customers/customer-editor-page-content";
export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <CustomerEditorPageContent customerId={Number(id)} />; }
