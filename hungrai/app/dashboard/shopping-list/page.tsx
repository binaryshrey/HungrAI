"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, ExternalLink } from "lucide-react";
import {
  getShoppingList,
  removeFromShoppingList,
  clearShoppingList,
} from "@/utils/shoppingList";

export default function ShoppingListPage() {
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user email from localStorage or session
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
      loadShoppingList(storedEmail);
    }
    setLoading(false);
  }, []);

  const loadShoppingList = (email: string) => {
    const list = getShoppingList(email);
    setShoppingList(list);
  };

  const handleRemoveItem = (ingredient: string) => {
    if (!userEmail) return;
    removeFromShoppingList(ingredient, userEmail);
    loadShoppingList(userEmail);
  };

  const handleClearList = () => {
    if (!userEmail) return;
    if (confirm("Are you sure you want to clear your shopping list?")) {
      clearShoppingList(userEmail);
      setShoppingList([]);
    }
  };

  const handleBuyGroceries = () => {
    // Create a search query with all items
    const searchQuery = "instacart : " + shoppingList.join(", ");
    const googleShoppingUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
      searchQuery
    )}`;
    window.open(googleShoppingUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white font-semibold text-2xl">Shopping List</h1>
        </div>
        <div className="shrink-0 border-t border-zinc-800 mt-4 mb-8"></div>
        <p className="text-neutral-400">Loading</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen px-4 lg:px-2">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-white font-semibold text-2xl">Shopping List</h1>
          <p className="text-neutral-400 text-sm mt-2">
            {shoppingList.length} item{shoppingList.length !== 1 ? "s" : ""} in
            your list
          </p>
        </div>
        {shoppingList.length > 0 && (
          <Button
            onClick={handleBuyGroceries}
            className="bg-white text-black hover:bg-neutral-200 flex items-center gap-2 hover:cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            Buy Groceries
          </Button>
        )}
      </div>

      <div className="shrink-0 border-t border-zinc-800 mt-4 mb-8"></div>

      {shoppingList.length === 0 ? (
        <div className="text-center mt-16">
          <div className="flex justify-center mb-4">
            <ShoppingCart className="h-16 w-16 text-neutral-700" />
          </div>
          <p className="text-neutral-400 text-lg mb-2">
            Your shopping list is empty
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            Add ingredients from recipe pages to start building your list
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-lg font-semibold">
              Items to Purchase
            </h2>
            <Button
              onClick={handleClearList}
              variant="outline"
              className="border-red-900 text-red-600 text-sm hover:text-red-600 hover:cursor-pointer"
              size="sm"
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {shoppingList.map((ingredient, index) => (
              <div
                key={index}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white capitalize flex-1">
                    {ingredient}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(ingredient)}
                    className="ml-2 text-neutral-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Remove ${ingredient}`}
                  >
                    <Trash2 className="h-4 w-4 hover:cursor-pointer" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
