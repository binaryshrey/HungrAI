"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ChefHat, Clock, Users, Check } from "lucide-react";
import { GET_PREDICTIONS_ENDPOINT } from "@/utils/Constants";
import { addToShoppingList, isInShoppingList } from "@/utils/shoppingList";

interface Recipe {
  id: number;
  title: string;
  score: number;
  matched: string[];
  missing: string[];
  instructions: string[];
}

interface PredictionRecord {
  id: string;
  user_email: string;
  user_id: string;
  predictions?: any[];
  ingredients?: string[];
  recipes?: Recipe[];
  candidate_count?: number;
  created_at: string;
}

interface RecipesClientProps {
  user: {
    email?: string | null;
  };
}

export default function RecipesClient({ user }: RecipesClientProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [shoppingListItems, setShoppingListItems] = useState<Set<string>>(
    new Set()
  );

  // Load shopping list items on mount
  useEffect(() => {
    if (user?.email) {
      const items = isInShoppingList("", user.email); // We'll check each item individually
      setShoppingListItems(new Set());
    }
  }, [user?.email]);

  const handleAddToShoppingList = (ingredient: string) => {
    if (!user?.email) return;

    const added = addToShoppingList(ingredient, user.email);
    if (added) {
      setShoppingListItems(
        (prev) => new Set([...prev, ingredient.toLowerCase()])
      );
    }
  };

  const checkIfInShoppingList = (ingredient: string): boolean => {
    if (!user?.email) return false;
    return isInShoppingList(ingredient, user.email);
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.email) {
          setError("Please sign in to view your recipes");
          setLoading(false);
          return;
        }

        // Fetch all predictions for the user
        const response = await fetch(
          `${GET_PREDICTIONS_ENDPOINT}?user_email=${encodeURIComponent(
            user.email
          )}&limit=100`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch predictions");
        }

        const predictions: PredictionRecord[] = await response.json();

        console.log("Fetched predictions:", predictions);
        console.log("Number of predictions:", predictions.length);

        // Combine all recipes from all predictions
        const allRecipes: Recipe[] = [];
        const seenRecipeIds = new Set<string>();

        predictions.forEach((prediction) => {
          console.log("Processing prediction:", prediction);
          console.log("Recipes in this prediction:", prediction.recipes);

          if (prediction.recipes) {
            prediction.recipes.forEach((recipe) => {
              // Create a unique identifier based on title and matched ingredients
              const recipeKey = `${recipe.title}-${recipe.matched
                .sort()
                .join("-")}`;

              // Only add if we haven't seen this recipe before
              if (!seenRecipeIds.has(recipeKey)) {
                seenRecipeIds.add(recipeKey);
                allRecipes.push(recipe);
              }
            });
          }
        });

        console.log("Total recipes found:", allRecipes.length);
        console.log("All recipes:", allRecipes);

        // Sort recipes by score (highest first)
        allRecipes.sort((a, b) => b.score - a.score);

        setRecipes(allRecipes);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError("Failed to load recipes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user?.email]);

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setRecipeDialogOpen(true);
  };

  const getRandomCookingTime = () => {
    const times = ["20 mins", "30 mins", "45 mins", "1 hour"];
    return times[Math.floor(Math.random() * times.length)];
  };

  const getRandomServings = () => {
    const servings = [2, 4, 6];
    return servings[Math.floor(Math.random() * servings.length)];
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
          <div className="text-white text-xl">Loading your recipes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white font-semibold text-2xl ">Recipes</h1>
        </div>
        <div className="shrink-0 border-t border-zinc-800 mt-4 mb-8"></div>
        <div className="text-center mt-16">
          <p className="text-red-400 text-lg mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-white font-semibold text-2xl">Recipes</h1>
          <p className="text-neutral-400 text-sm mt-2">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} from your
            ingredient history
          </p>
        </div>
      </div>

      <div className="shrink-0 border-t border-zinc-800 mt-4 mb-8"></div>

      {recipes.length === 0 ? (
        <div className="text-center mt-16">
          <p className="text-neutral-400 text-lg mb-4">
            No recipes found yet. Upload some ingredients to get started!
          </p>
          <Button
            onClick={() => (window.location.href = "/upload_ingredients")}
            className="bg-white text-black hover:bg-neutral-200"
          >
            Upload Ingredients
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <div
              key={`${recipe.id}-${index}`}
              className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-700 transition-all hover:shadow-xl cursor-pointer"
              onClick={() => handleRecipeClick(recipe)}
            >
              {/* Recipe Image Placeholder with Geometric Pattern */}
              <div
                className="w-full h-48 flex items-center justify-center"
                style={{
                  background: `
                    conic-gradient(at calc(250%/3) calc(100%/3), #999999 0 120deg, #0000 0),
                    conic-gradient(from -120deg at calc(50%/3) calc(100%/3), #cdcbcc 0 120deg, #0000 0),
                    conic-gradient(from 120deg at calc(100%/3) calc(250%/3), #f2f2f2 0 120deg, #0000 0),
                    conic-gradient(from 120deg at calc(200%/3) calc(250%/3), #f2f2f2 0 120deg, #0000 0),
                    conic-gradient(from -180deg at calc(100%/3) 50%, #cdcbcc 60deg, #f2f2f2 0 120deg, #0000 0),
                    conic-gradient(from 60deg at calc(200%/3) 50%, #f2f2f2 60deg, #999999 0 120deg, #0000 0),
                    conic-gradient(from -60deg at 50% calc(100%/3), #f2f2f2 120deg, #cdcbcc 0 240deg, #999999 0)
                  `,
                  backgroundSize: "calc(84px * 1.732) 84px",
                }}
              ></div>

              {/* Recipe Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex-1 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-900/30 text-green-400 border-green-800"
                  >
                    {Math.round(recipe.score * 100)}%
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{getRandomCookingTime()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{getRandomServings()} servings</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-neutral-500 mb-2">
                    Matched Ingredients:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {recipe.matched.slice(0, 3).map((ingredient, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-neutral-800 text-neutral-300 border-neutral-700 text-xs"
                      >
                        {ingredient}
                      </Badge>
                    ))}
                    {recipe.matched.length > 3 && (
                      <Badge
                        variant="outline"
                        className="bg-neutral-800 text-neutral-400 border-neutral-700 text-xs"
                      >
                        +{recipe.matched.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {recipe.missing.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">
                      You'll need:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.missing.slice(0, 2).map((ingredient, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-neutral-800/50 text-neutral-400 border-neutral-700 text-xs"
                        >
                          {ingredient}
                        </Badge>
                      ))}
                      {recipe.missing.length > 2 && (
                        <Badge
                          variant="outline"
                          className="bg-neutral-800/50 text-neutral-500 border-neutral-700 text-xs"
                        >
                          +{recipe.missing.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
        <DialogContent className="bg-neutral-900 text-white border-neutral-800 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedRecipe?.title}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Match Score:{" "}
              {selectedRecipe && Math.round(selectedRecipe.score * 100)}%
            </DialogDescription>
          </DialogHeader>

          {selectedRecipe && (
            <div className="space-y-6">
              {/* Matched Ingredients */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-white">
                  Matched Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.matched.map((ingredient, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-green-900/30 text-green-300 border-green-800"
                    >
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Missing Ingredients */}
              {selectedRecipe.missing.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">
                    Additional Ingredients Needed (Click to add to shopping
                    list)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.missing.map((ingredient, idx) => {
                      const inList = checkIfInShoppingList(ingredient);
                      return (
                        <Badge
                          key={idx}
                          variant="outline"
                          className={`${
                            inList
                              ? "bg-green-900/30 text-green-300 border-green-800"
                              : "bg-orange-900/30 text-orange-300 border-orange-800"
                          } cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
                          onClick={() => handleAddToShoppingList(ingredient)}
                        >
                          {ingredient}
                          {inList && <Check className="h-3 w-3" />}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {selectedRecipe.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-sm">
                        {idx + 1}
                      </span>
                      <span className="text-neutral-300 flex-1">
                        {instruction}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
