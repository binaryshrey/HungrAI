import RecipesClient from "./RecipesClient";
import { withAuth } from "@workos-inc/authkit-nextjs";

export default async function RecipesPage() {
  const { user } = await withAuth();

  if (!user) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">
            Please log in to view your recipes.
          </p>
        </div>
      </div>
    );
  }

  return <RecipesClient user={user} />;
}
