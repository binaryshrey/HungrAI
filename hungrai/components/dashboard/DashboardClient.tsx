"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Search,
  UtensilsCrossed,
  CheckCircle,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";
import { GET_PREDICTIONS_ENDPOINT } from "@/utils/Constants";

interface PredictionRecord {
  id: string;
  user_id: string;
  user_email: string;
  predictions: any[];
  ingredients: string[];
  recipes: any[];
  candidate_count: number;
  metadata?: any;
  created_at: string;
}

interface DashboardClientProps {
  userName: string;
  userEmail: string;
}

export default function DashboardClient({
  userName,
  userEmail,
}: DashboardClientProps) {
  const router = useRouter();
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Store user email in localStorage for use in other components
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!userEmail) {
        console.log("No user email provided");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Build URL with query parameters
        const url = new URL(GET_PREDICTIONS_ENDPOINT);
        url.searchParams.append("user_email", userEmail);
        url.searchParams.append("limit", "50");

        console.log("Fetching predictions from:", url.toString());

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched predictions:", data);

        setPredictions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching predictions:", err);
        setError(err?.message || "Failed to load predictions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [userEmail]);

  const handleRowClick = (prediction: PredictionRecord) => {
    router.push(`/prediction/${prediction.id}`);
  };

  const handleNewUploadClick = () => {
    router.push("/upload_ingredients");
  };

  // Filter predictions based on search query
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const displayedPredictions = normalizedQuery
    ? predictions.filter((p) => {
        const ingredients = (p.ingredients || []).join(" ").toLowerCase();
        const createdAt = new Date(p.created_at)
          .toLocaleDateString()
          .toLowerCase();
        return (
          ingredients.includes(normalizedQuery) ||
          createdAt.includes(normalizedQuery)
        );
      })
    : predictions;

  // Calculate metrics
  const totalPredictions = predictions.length;
  const totalRecipes = predictions.reduce(
    (sum, p) => sum + (p.recipes?.length || 0),
    0
  );
  const avgRecipesPerPrediction =
    totalPredictions > 0 ? (totalRecipes / totalPredictions).toFixed(1) : "0.0";
  const totalIngredients = predictions.reduce(
    (sum, p) => sum + (p.ingredients?.length || 0),
    0
  );

  return (
    <div>
      {/* Top bar with search and button */}
      <div className="flex items-center justify-between mb-4 mx-4">
        <div className="relative w-64 lg:w-120">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-3 h-3" />
          <Input
            type="text"
            placeholder="Search your ingredients..."
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-neutral-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={handleNewUploadClick}
          className="bg-[#22c55e] hover:bg-[#16a34a] cursor-pointer text-white px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
        >
          <span className="hidden sm:inline">+ Upload New Ingredients</span>
          <span className="sm:hidden">+ Upload</span>
        </Button>
      </div>

      {/* Horizontal line */}
      <hr className="border-zinc-800 mb-3" />

      {/* Date and Greeting */}
      <div className="mb-4 mx-4">
        <p className="text-sm text-neutral-500">{getFormattedDate()}</p>
        <h1 className="text-2xl font-medium text-white">
          {getGreeting()}, {userName}!
        </h1>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 mb-6 mt-2">
        {/* Total Predictions */}
        <div className="bg-[#22c55e] rounded-xl p-6 shadow-lg cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-gray-900 text-sm font-medium">
              Total Predictions
            </h3>
            <div className="bg-[#16a34a] p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-gray-900 text-3xl font-bold">
            {isLoading ? "..." : totalPredictions}
          </p>
        </div>

        {/* Total Recipes Found */}
        <div className="bg-[#22c55e] rounded-xl p-6 shadow-lg cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-gray-900 text-sm font-medium">
              Total Recipes Found
            </h3>
            <div className="bg-[#16a34a] p-2 rounded-lg">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-gray-900 text-3xl font-bold">
            {isLoading ? "..." : totalRecipes}
          </p>
        </div>

        {/* Average Recipes */}
        <div className="bg-[#22c55e] rounded-xl p-6 shadow-lg cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-gray-900 text-sm font-medium">
              Avg Recipes/Prediction
            </h3>
            <div className="bg-[#16a34a] p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-gray-900 text-3xl font-bold">
            {isLoading ? "..." : avgRecipesPerPrediction}
          </p>
        </div>

        {/* Total Ingredients */}
        <div className="bg-[#22c55e] rounded-xl p-6 shadow-lg cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-gray-900 text-sm font-medium">
              Total Ingredients
            </h3>
            <div className="bg-[#16a34a] p-2 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-gray-900 text-3xl font-bold">
            {isLoading ? "..." : totalIngredients}
          </p>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="mt-6 bg-neutral-900 rounded-lg overflow-hidden border border-zinc-800">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">
            Recent Predictions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-900 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ingredients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Recipes Found
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-900 divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-neutral-500"
                  >
                    <div className="flex items-center justify-center gap-2 flex-col">
                      <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                      <span>Loading predictions</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-red-500"
                  >
                    Error: {error}
                  </td>
                </tr>
              ) : predictions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-neutral-500"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <p>No predictions yet</p>
                      <Button
                        onClick={handleNewUploadClick}
                        className="bg-[#22c55e] hover:bg-[#16a34a] text-white"
                      >
                        Upload Your First Ingredients
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : displayedPredictions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-neutral-500"
                  >
                    No predictions match your search.
                  </td>
                </tr>
              ) : (
                displayedPredictions.map((p, idx) => (
                  <tr
                    key={p.id || idx}
                    className="hover:bg-zinc-800 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(p)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      <div className="max-w-xs truncate">
                        {(p.ingredients || []).join(", ") || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                      {p.recipes?.length || 0} recipes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-green-400 border border-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
