import UploadIngredients from "@/components/upload_ingredients/UploadIngredientsPage";
import { withAuth } from "@workos-inc/authkit-nextjs";

export default async function UploadIngredientsPage() {
  const { user } = await withAuth();

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  return <UploadIngredients user={user} />;
}
