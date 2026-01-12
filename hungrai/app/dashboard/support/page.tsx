"use client";

import { useEffect } from "react";

export default function SupportPage() {
  useEffect(() => {
    // Redirect to GitHub issues page
    window.open("https://github.com/binaryshrey/HungrAI/issues", "_blank");
    // Go back to previous page
    window.history.back();
  }, []);

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-lg">Redirecting to support...</p>
      </div>
    </div>
  );
}
