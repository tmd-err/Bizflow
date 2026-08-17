import { UserDetailPageContent } from "@/components/users/user-detail-page-content";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  return <UserDetailPageContent userId={Number(id)} />;
}
