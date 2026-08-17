import { CustomerDetailPageContent } from "@/components/customers/customer-detail-page-content";
export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <CustomerDetailPageContent customerId={Number(id)} />; }
