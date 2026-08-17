import { EditRolePageContent } from "@/components/roles/edit-role-page-content";

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params;

  return <EditRolePageContent roleId={Number(id)} />;
}
