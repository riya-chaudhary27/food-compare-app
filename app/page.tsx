"use client"; // This line is crucial for interactivity

import { useState } from "react";
import { mockData } from "./mockData";

// Sub-component for each food card to handle its own expansion state
type FoodItem = typeof mockData[0];

function PriceBreakdownCard({
  item,
  budget
}: {
  item: FoodItem;
  budget: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-2">
      <h2 className="text-xl font-bold text-gray-900">{item.dish}</h2>
      <p className="text-gray-500 mb-6">{item.restaurant}</p>

      <div className="flex justify-between gap-4">
        {/* Zomato Column */}
        <div
          className={`flex-1 p-4 rounded-lg border ${
            item.zomato.total <= budget
              ? "bg-red-50 border-red-100"
              : "bg-gray-100 border-gray-200 opacity-50"
          }`}
        >
          <h3 className="font-bold text-red-600 text-lg mb-2">Zomato</h3>
          <p>Base: ₹{item.zomato.basePrice}</p>
          <p className="text-sm text-gray-600">
            Fees: ₹{item.zomato.deliveryFee + item.zomato.taxes}
          </p>
          <p
            className={`font-bold mt-2 text-lg ${
              item.zomato.total > budget ? "text-red-500" : ""
            }`}
          >
            Total: ₹{item.zomato.total}
          </p>
        </div>

        {/* Swiggy Column */}
        <div
          className={`flex-1 p-4 rounded-lg border ${
            item.swiggy.total <= budget
              ? item.bestValue === "Swiggy"
                ? "bg-green-50 border-green-200"
                : "bg-orange-50 border-orange-200"
              : "bg-gray-100 border-gray-200 opacity-50"
          }`}
        >
          <h3 className="font-bold text-orange-600 text-lg mb-2">Swiggy</h3>
          <p>Base: ₹{item.swiggy.basePrice}</p>
          <p className="text-sm text-gray-600">
            Fees: ₹{item.swiggy.deliveryFee + item.swiggy.taxes}
          </p>
          <p
            className={`font-bold mt-2 text-lg ${
              item.swiggy.total > budget ? "text-red-500" : ""
            }`}
          >
            Total: ₹{item.swiggy.total}
          </p>
        </div>
      </div>

      {/* View Details button and animated expansion */}
      <div className="mt-6 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="text-blue-600 border border-blue-100 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
        >
          {isExpanded ? "Hide Details" : "View Details"}
        </button>
        {isExpanded && (
          <div className="w-full mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Zomato Receipt */}
              <div className="flex-1 bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="text-red-500 font-semibold text-base mb-2 flex items-center gap-1">
                  <svg fill="none" height="16" width="16" viewBox="0 0 16 16" className="inline mr-1"><circle cx="8" cy="8" r="7" stroke="#F87171" strokeWidth="2"/></svg>
                  Zomato: Receipt
                </h4>
                <ul className="text-sm text-gray-700 mb-2">
                  <li className="flex justify-between py-1">
                    <span>Base Price</span>
                    <span>₹{item.zomato.basePrice}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span>Delivery Fee</span>
                    <span>₹{item.zomato.deliveryFee}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span>Taxes</span>
                    <span>₹{item.zomato.taxes}</span>
                  </li>
                  <li className="border-t my-1"></li>
                  <li className="flex justify-between font-semibold py-1">
                    <span>Total</span>
                    <span>₹{item.zomato.total}</span>
                  </li>
                </ul>
              </div>
              {/* Swiggy Receipt */}
              <div className="flex-1 bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="text-orange-500 font-semibold text-base mb-2 flex items-center gap-1">
                  <svg fill="none" height="16" width="16" viewBox="0 0 16 16" className="inline mr-1"><circle cx="8" cy="8" r="7" stroke="#FB923C" strokeWidth="2"/></svg>
                  Swiggy: Receipt
                </h4>
                <ul className="text-sm text-gray-700 mb-2">
                  <li className="flex justify-between py-1">
                    <span>Base Price</span>
                    <span>₹{item.swiggy.basePrice}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span>Delivery Fee</span>
                    <span>₹{item.swiggy.deliveryFee}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span>Taxes</span>
                    <span>₹{item.swiggy.taxes}</span>
                  </li>
                  <li className="border-t my-1"></li>
                  <li className="flex justify-between font-semibold py-1">
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
  // This state holds the user's budget. It starts at 500.
  const [budget, setBudget] = useState<number>(500);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recommended" | "lowToHigh" | "highToLow">("recommended");

  // Chain: filter by search, then budget, then sort
  const filteredAndSortedFood = mockData
    // 1. filter by search query (case-insensitive on dish or restaurant)
    .filter(item => {
      if (!searchQuery.trim()) return true;
      const lower = searchQuery.trim().toLowerCase();
      return (
        item.dish.toLowerCase().includes(lower) ||
        item.restaurant.toLowerCase().includes(lower)
      );
    })
    // 2. filter by budget
    .filter(item => item.zomato.total <= budget || item.swiggy.total <= budget)
    // 3. sorting
    .sort((a, b) => {
      // Get minimum price for each item
      const minA = Math.min(a.zomato.total, a.swiggy.total);
      const minB = Math.min(b.zomato.total, b.swiggy.total);

      if (sortBy === "lowToHigh") {
        return minA - minB;
      } else if (sortBy === "highToLow") {
        return minB - minA;
      }
      // 'Recommended': preserve original mockData order
      return 0;
    });

  return (
    <main className="min-h-screen p-8 bg-gray-50 flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold text-gray-800">Live Price Comparison</h1>

      {/* The Budget Input Control */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          What is your maximum budget? (₹)
        </label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter budget..."
        />
      </div>

      {/* New: Search Bar and Sort Dropdown */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 mb-2">
        {/* Search bar */}
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search for a dish or restaurant..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={e => setSortBy(
            e.target.value === "lowToHigh"
              ? "lowToHigh"
              : e.target.value === "highToLow"
                ? "highToLow"
                : "recommended"
          )}
          className="w-full sm:w-56 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium"
        >
          <option value="recommended">Recommended</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
        </select>
      </div>

      {/* If no food is affordable, show a message */}
      {filteredAndSortedFood.length === 0 && (
        <p className="text-red-500 font-bold">
          No items found{searchQuery ? ` for "${searchQuery}"` : ""} under ₹{budget}. Time to cook!
        </p>
      )}

      {filteredAndSortedFood.map((item) => (
        <PriceBreakdownCard key={item.id} item={item} budget={budget} />
      ))}
    </main>
  );
}