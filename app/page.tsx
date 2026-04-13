"use client"; // This line is crucial for interactivity

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// Define the structure matching the UI's expected format
type FoodItem = {
  id: number;
  restaurant: string;
  dish: string;
  zomato: {
    basePrice: number;
    deliveryFee: number;
    taxes: number;
    total: number;
  };
  swiggy: {
    basePrice: number;
    deliveryFee: number;
    taxes: number;
    total: number;
  };
  bestValue: string;
};

// Accept user and favoriteIds, and a toggle handler
function PriceBreakdownCard({
  item,
  budget,
  isFavorited,
  onToggleFavorite,
}: {
  item: FoodItem;
  budget: number;
  isFavorited: boolean;
  onToggleFavorite: (id: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper for the best value badge
  function BestValueBadge({ provider }: { provider: string }) {
    if (item.bestValue !== provider) return null;
    let color =
      provider === "Swiggy"
        ? "bg-gradient-to-r from-orange-400 to-orange-300 text-white"
        : "bg-gradient-to-r from-red-400 to-red-300 text-white";
    let label =
      provider === "Swiggy"
        ? "Best Value"
        : provider === "Zomato"
        ? "Best Value"
        : "";
    return (
      <span
        className={`inline-block ml-2 px-3 py-1 rounded-full shadow-sm text-xs font-semibold ${color} animate-pulse`}
        style={{ letterSpacing: "0.01em" }}
      >
        {label}
      </span>
    );
  }

  return (
    <div
      className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 mb-4
      hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            {item.dish}
            <button
              type="button"
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              onClick={() => onToggleFavorite(item.id)}
              className="ml-2 text-2xl cursor-pointer select-none p-0 bg-transparent border-none focus:outline-none"
              style={{ lineHeight: 1, background: "none" }}
            >
              {isFavorited ? "❤️" : "🤍"}
            </button>
          </h2>
        </div>
        <p className="text-sm text-gray-400 font-medium mb-7 pl-1 tracking-wide">
          {item.restaurant}
        </p>

        <div className="flex justify-between gap-4">
          {/* Zomato Column */}
          <div
            className={`flex-1 px-5 py-4 rounded-xl border relative transition-all duration-200 ${
              item.zomato.total <= budget
                ? "bg-red-50 border-red-100"
                : "bg-gray-100 border-gray-200 opacity-65"
            }`}
          >
            <div className="flex items-center mb-3">
              <h3 className="font-extrabold text-lg text-red-600 tracking-tight">
                Zomato
              </h3>
              <BestValueBadge provider="Zomato" />
            </div>
            <div className="space-y-0.5">
              <p className="text-gray-900 font-semibold text-sm">
                Base: <span className="font-bold">₹{item.zomato.basePrice}</span>
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Fees: <span className="font-semibold">₹{item.zomato.deliveryFee + item.zomato.taxes}</span>
              </p>
              <p
                className={`font-bold mt-2 text-lg ${
                  item.zomato.total > budget ? "text-red-400" : "text-gray-800"
                }`}
              >
                Total: ₹{item.zomato.total}
              </p>
            </div>
          </div>

          {/* Swiggy Column */}
          <div
            className={`flex-1 px-5 py-4 rounded-xl border relative transition-all duration-200 ${
              item.swiggy.total <= budget
                ? item.bestValue === "Swiggy"
                  ? "bg-gradient-to-br from-orange-100 to-green-50 border-green-200"
                  : "bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200"
                : "bg-gray-100 border-gray-200 opacity-65"
            }`}
          >
            <div className="flex items-center mb-3">
              <h3 className="font-extrabold text-lg text-orange-600 tracking-tight">
                Swiggy
              </h3>
              <BestValueBadge provider="Swiggy" />
            </div>
            <div className="space-y-0.5">
              <p className="text-gray-900 font-semibold text-sm">
                Base: <span className="font-bold">₹{item.swiggy.basePrice}</span>
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Fees: <span className="font-semibold">₹{item.swiggy.deliveryFee + item.swiggy.taxes}</span>
              </p>
              <p
                className={`font-bold mt-2 text-lg ${
                  item.swiggy.total > budget ? "text-red-400" : "text-gray-800"
                }`}
              >
                Total: ₹{item.swiggy.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Details button and animated expansion */}
      <div className="px-6 pb-6 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="text-blue-600 border border-blue-100 bg-blue-50 hover:bg-blue-100 px-5 py-2 rounded-lg text-sm font-semibold shadow-none mt-2 transition-all"
        >
          {isExpanded ? "Hide Details" : "View Details"}
        </button>
        {isExpanded && (
          <div className="w-full mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Zomato Receipt */}
              <div className="flex-1 bg-gradient-to-tl from-red-50 to-white rounded-xl shadow-md border border-red-100 p-6">
                <h4 className="text-red-500 font-bold text-base mb-2 flex items-center gap-1">
                  <svg fill="none" height="16" width="16" viewBox="0 0 16 16" className="inline mr-1"><circle cx="8" cy="8" r="7" stroke="#F87171" strokeWidth="2" /></svg>
                  Zomato: Receipt
                </h4>
                <ul className="text-sm text-gray-700 mb-2">
                  <li className="flex justify-between py-1">
                    <span className="text-gray-400">Base Price</span>
                    <span className="font-bold text-gray-800">₹{item.zomato.basePrice}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span className="text-gray-400">Delivery Fee</span>
                    <span>₹{item.zomato.deliveryFee}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span className="text-gray-400">Taxes</span>
                    <span>₹{item.zomato.taxes}</span>
                  </li>
                  <li className="border-t my-1"></li>
                  <li className="flex justify-between font-bold py-1">
                    <span>Total</span>
                    <span>₹{item.zomato.total}</span>
                  </li>
                </ul>
              </div>
              {/* Swiggy Receipt */}
              <div className="flex-1 bg-gradient-to-tl from-orange-50 to-white rounded-xl shadow-md border border-orange-100 p-6">
                <h4 className="text-orange-500 font-bold text-base mb-2 flex items-center gap-1">
                  <svg fill="none" height="16" width="16" viewBox="0 0 16 16" className="inline mr-1"><circle cx="8" cy="8" r="7" stroke="#FB923C" strokeWidth="2" /></svg>
                  Swiggy: Receipt
                </h4>
                <ul className="text-sm text-gray-700 mb-2">
                  <li className="flex justify-between py-1">
                    <span className="text-gray-400">Base Price</span>
                    <span className="font-bold text-gray-800">₹{item.swiggy.basePrice}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span className="text-gray-400">Delivery Fee</span>
                    <span>₹{item.swiggy.deliveryFee}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span className="text-gray-400">Taxes</span>
                    <span>₹{item.swiggy.taxes}</span>
                  </li>
                  <li className="border-t my-1"></li>
                  <li className="flex justify-between font-bold py-1">
                    <span>Total</span>
                    <span>₹{item.swiggy.total}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  // User, favorites, and other state
  const [user, setUser] = useState<any>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [budget, setBudget] = useState<number>(500);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recommended" | "lowToHigh" | "highToLow">("recommended");
  const [foodData, setFoodData] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user, favorites, and food (handling all async dependencies)
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setIsLoading(true);

      // Step 1: Get user session (authentication)
      const { data: sessionData } = await supabase.auth.getSession();
      const currUser = sessionData?.session?.user ?? null;
      if (!cancelled) setUser(currUser);

      // Step 2: Get food items
      const { data, error } = await supabase.from("menu_items").select("*");
      let mapped: FoodItem[] = [];
      if (data && !error) {
        mapped = (data || []).map((row: any) => ({
          id: row.id,
          restaurant: row.restaurant,
          dish: row.dish,
          zomato: {
            basePrice: row.zomato_base ?? row.zomato_basePrice ?? row.zomato_base_price ?? 0,
            deliveryFee:
              row.zomato_deliveryFee ??
              row.zomato_delivery_fee ??
              row.zomato_fee ??
              row.zomato_delivery ??
              0,
            taxes:
              row.zomato_taxes ??
              row.zomato_tax ??
              row.zomato_taxesAmount ??
              0,
            total: row.zomato_total ?? row.zomato_totalPrice ?? 0,
          },
          swiggy: {
            basePrice: row.swiggy_base ?? row.swiggy_basePrice ?? row.swiggy_base_price ?? 0,
            deliveryFee:
              row.swiggy_deliveryFee ??
              row.swiggy_delivery_fee ??
              row.swiggy_fee ??
              row.swiggy_delivery ??
              0,
            taxes:
              row.swiggy_taxes ??
              row.swiggy_tax ??
              row.swiggy_taxesAmount ??
              0,
            total: row.swiggy_total ?? row.swiggy_totalPrice ?? 0,
          },
          bestValue: row.best_value,
        })) as FoodItem[];
      }
      if (!cancelled) setFoodData(mapped);

      // Step 3: Get user's favorites if logged in
      if (currUser) {
        const { data: favs, error: favErr } = await supabase
          .from("user_favorites")
          .select("menu_item_id")
          .eq("user_id", currUser.id);
        if (!cancelled) {
          setFavoriteIds(
            Array.isArray(favs) ? favs.map((row: any) => row.menu_item_id) : []
          );
        }
      } else {
        if (!cancelled) setFavoriteIds([]);
      }
      if (!cancelled) setIsLoading(false);
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handler for toggling favorite state (handles DB and local state)
  async function toggleFavorite(itemId: number) {
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }
    // Already favorited
    if (favoriteIds.includes(itemId)) {
      // Remove from favorites in DB
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("menu_item_id", itemId);
      if (!error) {
        setFavoriteIds((ids) => ids.filter((id) => id !== itemId));
      }
    } else {
      // Add to favorites in DB
      const { error } = await supabase.from("user_favorites").insert([
        { user_id: user.id, menu_item_id: itemId },
      ]);
      if (!error) {
        setFavoriteIds((ids) => [...ids, itemId]);
      }
    }
  }

  // Chain: filter by search, then budget, then sort
  const filteredAndSortedFood = foodData
    // 1. filter by search query (case-insensitive on dish or restaurant)
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const lower = searchQuery.trim().toLowerCase();
      return (
        item.dish.toLowerCase().includes(lower) ||
        item.restaurant.toLowerCase().includes(lower)
      );
    })
    // 2. filter by budget
    .filter((item) => item.zomato.total <= budget || item.swiggy.total <= budget)
    // 3. sorting
    .sort((a, b) => {
      const minA = Math.min(a.zomato.total, a.swiggy.total);
      const minB = Math.min(b.zomato.total, b.swiggy.total);

      if (sortBy === "lowToHigh") {
        return minA - minB;
      } else if (sortBy === "highToLow") {
        return minB - minA;
      }
      // 'Recommended': preserve original foodData order (should match insertion order)
      return 0;
    });

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center gap-10">
      <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-sm mb-2 tracking-tight">
        Live Price Comparison
      </h1>

      {/* The Budget Input Control */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-2 flex flex-col sm:flex-row items-center gap-4">
        <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-0 flex-shrink-0 w-full sm:w-56">
          What is your maximum budget? (₹)
        </label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold shadow-inner transition-all"
          placeholder="Enter budget..."
        />
      </div>

      {/* New: Search Bar and Sort Dropdown */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 mb-2">
        {/* Search bar */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a dish or restaurant..."
          className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium transition-all"
        />
        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value === "lowToHigh"
                ? "lowToHigh"
                : e.target.value === "highToLow"
                ? "highToLow"
                : "recommended"
            )
          }
          className="w-full sm:w-56 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-gray-700 font-semibold"
        >
          <option value="recommended">Recommended</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
        </select>
      </div>

      {isLoading && (
        <div className="pt-8 pb-8 text-lg text-blue-500 font-bold animate-pulse">
          Loading live prices...
        </div>
      )}

      {!isLoading && filteredAndSortedFood.length === 0 && (
        <p className="text-red-500 font-extrabold text-xl drop-shadow-sm px-4 py-4 rounded-xl bg-white bg-opacity-80">
          No items found{searchQuery ? ` for "${searchQuery}"` : ""} under ₹{budget}. Time to cook!
        </p>
      )}

      {!isLoading &&
        filteredAndSortedFood.map((item) => (
          <PriceBreakdownCard
            key={item.id}
            item={item}
            budget={budget}
            isFavorited={favoriteIds.includes(item.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
    </main>
  );
}