// Shopping list utilities for localStorage management

export interface ShoppingListItem {
  ingredient: string;
  addedAt: string;
  userEmail: string;
}

const SHOPPING_LIST_KEY = "hungrai_shopping_list";

/**
 * Get shopping list items for a specific user
 */
export function getShoppingList(userEmail: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(SHOPPING_LIST_KEY);
    if (!stored) return [];

    const allItems: ShoppingListItem[] = JSON.parse(stored);
    return allItems
      .filter((item) => item.userEmail === userEmail)
      .map((item) => item.ingredient);
  } catch (error) {
    console.error("Error reading shopping list:", error);
    return [];
  }
}

/**
 * Add an ingredient to the shopping list
 */
export function addToShoppingList(
  ingredient: string,
  userEmail: string
): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem(SHOPPING_LIST_KEY);
    const allItems: ShoppingListItem[] = stored ? JSON.parse(stored) : [];

    // Check if item already exists for this user
    const exists = allItems.some(
      (item) =>
        item.ingredient.toLowerCase() === ingredient.toLowerCase() &&
        item.userEmail === userEmail
    );

    if (exists) {
      return false; // Already in list
    }

    // Add new item
    allItems.push({
      ingredient,
      addedAt: new Date().toISOString(),
      userEmail,
    });

    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(allItems));
    return true;
  } catch (error) {
    console.error("Error adding to shopping list:", error);
    return false;
  }
}

/**
 * Remove an ingredient from the shopping list
 */
export function removeFromShoppingList(
  ingredient: string,
  userEmail: string
): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(SHOPPING_LIST_KEY);
    if (!stored) return;

    const allItems: ShoppingListItem[] = JSON.parse(stored);
    const filtered = allItems.filter(
      (item) =>
        !(
          item.ingredient.toLowerCase() === ingredient.toLowerCase() &&
          item.userEmail === userEmail
        )
    );

    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing from shopping list:", error);
  }
}

/**
 * Check if an ingredient is in the shopping list
 */
export function isInShoppingList(
  ingredient: string,
  userEmail: string
): boolean {
  if (typeof window === "undefined") return false;

  try {
    const list = getShoppingList(userEmail);
    return list.some((item) => item.toLowerCase() === ingredient.toLowerCase());
  } catch (error) {
    console.error("Error checking shopping list:", error);
    return false;
  }
}

/**
 * Clear all shopping list items for a user
 */
export function clearShoppingList(userEmail: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(SHOPPING_LIST_KEY);
    if (!stored) return;

    const allItems: ShoppingListItem[] = JSON.parse(stored);
    const filtered = allItems.filter((item) => item.userEmail !== userEmail);

    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error clearing shopping list:", error);
  }
}
