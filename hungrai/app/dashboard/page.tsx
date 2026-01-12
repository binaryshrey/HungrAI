"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white font-semibold text-3xl md:text-4xl">
            Dashboard
          </h1>
          <Button
            onClick={() => router.push("/upload_ingredients")}
            className="bg-white text-black hover:bg-neutral-200"
          >
            Upload Ingredients
          </Button>
        </div>

        <div className="shrink-0 border-t border-zinc-800 mb-8"></div>

        {/* Dashboard Content */}
        <div className="text-center py-16">
          <p className="text-neutral-400 text-lg mb-4">
            Welcome to your dashboard
          </p>
          <p className="text-neutral-500 text-sm">
            This page is available for future features
          </p>
        </div>
      </div>
    </div>
  );
}
