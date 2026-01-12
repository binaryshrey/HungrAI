import React from "react";
import { withAuth } from "@workos-inc/authkit-nextjs";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
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

  const userName = user.firstName || user.email?.split("@")[0] || "User";
  const userEmail = user.email || "";

  return (
    <div className="bg-black min-h-screen py-2 px-1">
      <div className="max-w-7xl mx-auto">
        <DashboardClient userName={userName} userEmail={userEmail} />
      </div>
    </div>
  );
}
