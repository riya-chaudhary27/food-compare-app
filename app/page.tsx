"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [foodData, setFoodData] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & UI State
  const [budgetLimit, setBudgetLimit] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  
  // 👈 NEW: Sort State
  const [sortBy, setSortBy] = useState<string>("default");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: favs } = await supabase
          .from('user_favorites')
          .select('menu_item_id')
          .eq('user_id', currentUser.id);

        if (favs) {
          setFavoriteIds(favs.map(f => f.menu_item_id));
        }
      }

      setTimeout(async () => {
        const { data: menuItems, error } = await supabase.from("menu_items").select("*");
        if (!error && menuItems) {
          setFoodData(menuItems);
        }
        setIsLoading(false);
      }, 800); 
    }
    loadData();
  }, []);

  const toggleFavorite = async (itemId: number) => {
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }

    const isFavorited = favoriteIds.includes(itemId);
    if (isFavorited) {
      await supabase.from("user_favorites").delete().match({ user_id: user.id, menu_item_id: itemId });
      setFavoriteIds(prev => prev.filter(id => id !== itemId));
    } else {
      await supabase.from("user_favorites").insert({ user_id: user.id, menu_item_id: itemId });
      setFavoriteIds(prev => [...prev, itemId]);
    }
  };

  const toggleDetails = (itemId: number) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  // 👈 NEW: Calculating Total Savings using .reduce()
  // It looks at all your favorited items and calculates how much you save by picking the cheaper app.
  const totalSavings = favoriteIds.reduce((total, id) => {
    const item = foodData.find(f => f.id === id);
    if (item) {
      const difference = Math.abs(item.zomato_total - item.swiggy_total);
      return total + difference;
    }
    return total;
  }, 0);

  // 👈 UPDATED: Filtering AND Sorting chained together
  const processedFood = foodData
    .filter((item) => {
      let meetsBudget = true;
      if (budgetLimit) {
        const maxPrice = parseFloat(budgetLimit);
        meetsBudget = item.zomato_total <= maxPrice || item.swiggy_total <= maxPrice;
      }
      let meetsSearch = true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        meetsSearch = item.dish.toLowerCase().includes(query) || item.restaurant.toLowerCase().includes(query);
      }
      return meetsBudget && meetsSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        const minA = Math.min(a.zomato_total, a.swiggy_total);
        const minB = Math.min(b.zomato_total, b.swiggy_total);
        return minA - minB;
      }
      if (sortBy === "price-high") {
        const minA = Math.min(a.zomato_total, a.swiggy_total);
        const minB = Math.min(b.zomato_total, b.swiggy_total);
        return minB - minA; // Reverse order
      }
      if (sortBy === "savings") {
        const savingsA = Math.abs(a.zomato_total - a.swiggy_total);
        const savingsB = Math.abs(b.zomato_total - b.swiggy_total);
        return savingsB - savingsA; // Highest savings first
      }
      return 0; // Default: database order
    });

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans tracking-tight">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Find the <span className="text-blue-600">Best Deal.</span>
          </h1>
          
          {/* 👈 NEW: The Total Savings Dashboard Banner */}
          {!isLoading && favoriteIds.length > 0 && totalSavings > 0 && (
            <div className="w-full max-w-2xl mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <p className="font-medium text-sm md:text-base">
                  By choosing the Best Value for your <span className="font-bold">{favoriteIds.length} favorite items</span>, you are saving:
                </p>
              </div>
              <span className="font-black text-2xl text-emerald-600 bg-white px-3 py-1 rounded-lg shadow-sm border border-emerald-100">
                ₹{totalSavings}
              </span>
            </div>
          )}

          {/* Search, Budget, & Sort Container */}
          <div className="w-full max-w-3xl flex flex-col md:flex-row gap-3 relative">
            <input 
              type="text" 
              placeholder="Search dishes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-2/5 p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
            />
            <input 
              type="number" 
              placeholder="Max budget (₹)" 
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="w-full md:w-1/5 p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
            />
            
            {/* 👈 NEW: The Smart Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-2/5 p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
            >
              <option value="default">Sort by: Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="savings">Biggest Savings Gap</option>
            </select>
          </div>
        </div>

        {/* Dynamic Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {isLoading ? (
            // Skeleton Loader (Untouched)
            [1, 2, 3, 4].map((skeleton) => (
              <div key={skeleton} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-2/3">
                    <div className="h-6 bg-slate-200 rounded-md mb-2 w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
                  </div>
                  <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                </div>
                <div className="h-16 bg-slate-100 rounded-xl mb-4 mt-6"></div>
                <div className="h-12 bg-slate-100 rounded-xl"></div>
              </div>
            ))
          ) : processedFood.length > 0 ? (
            
            // Actual Data Cards using processedFood
            processedFood.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative transition-all duration-200 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-6 right-6 text-2xl hover:scale-110 transition-transform active:scale-95"
                >
                  {favoriteIds.includes(item.id) ? "❤️" : "🤍"}
                </button>

                <h2 className="text-2xl font-bold text-slate-900 mb-1 pr-10">{item.dish}</h2>
                <p className="text-slate-500 font-medium mb-6 text-sm">{item.restaurant}</p>

                <div className="bg-green-50 border border-green-100 text-green-800 p-4 rounded-xl flex justify-between items-center mb-5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 mb-1">Best Value</span>
                    <span className="font-semibold">{item.best_value}</span>
                  </div>
                  <span className="font-black text-2xl">
                    ₹{item.best_value === 'Zomato' ? item.zomato_total : item.swiggy_total}
                  </span>
                </div>

                <button 
                  onClick={() => toggleDetails(item.id)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
                >
                  {expandedItemId === item.id ? "Hide Details" : "View Breakdown"}
                </button>

                {expandedItemId === item.id && (
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col h-full">
                      <div>
                        <h3 className="font-black text-red-600 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-600"></span> Zomato
                        </h3>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span>Base Price</span> <span className="font-medium text-slate-800">₹{item.zomato_base}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span>Delivery</span> <span className="font-medium text-slate-800">₹{item.zomato_fee}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-3">
                          <span>Taxes</span> <span className="font-medium text-slate-800">₹{item.zomato_tax}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-slate-900 mt-2 pt-2 border-t border-slate-200">
                          <span>Total</span> <span>₹{item.zomato_total}</span>
                        </div>
                      </div>
                      <div className="mt-auto pt-4">
                        <a 
                          href={`https://www.zomato.com/search?q=${encodeURIComponent(item.restaurant + ' ' + item.dish)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold rounded-lg transition-colors text-xs"
                        >
                          Find on Zomato ↗
                        </a>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col h-full">
                      <div>
                        <h3 className="font-black text-orange-600 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-600"></span> Swiggy
                        </h3>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span>Base Price</span> <span className="font-medium text-slate-800">₹{item.swiggy_base}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span>Delivery</span> <span className="font-medium text-slate-800">₹{item.swiggy_fee}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-3">
                          <span>Taxes</span> <span className="font-medium text-slate-800">₹{item.swiggy_tax}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-slate-900 mt-2 pt-2 border-t border-slate-200">
                          <span>Total</span> <span>₹{item.swiggy_total}</span>
                        </div>
                      </div>
                      <div className="mt-auto pt-4">
                        <a 
                          href={`https://www.swiggy.com/search?query=${encodeURIComponent(item.restaurant + ' ' + item.dish)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-semibold rounded-lg transition-colors text-xs"
                        >
                          Find on Swiggy ↗
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center text-slate-500 py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
              <span className="text-4xl mb-3 block">🔍</span>
              <p className="text-lg font-medium text-slate-700">No dishes found matching your search.</p>
              <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}