import { withAuth, signOut } from "@workos-inc/authkit-nextjs";
import Image from "next/image";

export default async function ProfilePage() {
  const { user } = await withAuth();

  if (!user) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Not signed in</h1>
          <p className="text-neutral-400">
            You should have been redirected. Try going back to the homepage.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen -m-1 -mx-1 sm:-mx-1 md:-mx-1 -my-3 overflow-x-hidden">
      {/* Header Background */}
      <div className="relative h-64 bg-linear-to-r from-green-600 to-green-500"></div>

      {/* Profile Content */}
      <div className="relative px-8 pb-8 max-w-7xl mx-auto min-h-screen">
        {/* Profile Image */}
        <div className="absolute -top-40 left-8">
          <div className="relative">
            {user?.profilePictureUrl ? (
              <Image
                className="rounded-full border-4 border-black shadow-xl"
                src={user.profilePictureUrl}
                alt="Profile"
                width={128}
                height={128}
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-black shadow-xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {user.firstName?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase() ||
                    "U"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Account Details Section */}
        <div className="mt-20">
          <h2 className="text-lg font-semibold text-white mb-4">
            Account Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
              <span className="text-sm text-neutral-400">Name</span>
              <span className="text-sm font-medium text-white">
                {user.firstName || "N/A"} {user.lastName || ""}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
              <span className="text-sm text-neutral-400">Email</span>
              <span className="text-sm font-medium text-white">
                {user.email}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-neutral-400">Email Verified</span>
              <span className="text-sm font-medium text-white">
                {user.emailVerified ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="w-full px-4 py-3 bg-white text-black rounded-md hover:bg-neutral-200 transition-colors font-medium cursor-pointer"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
