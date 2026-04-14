"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function Favorites() {
  const [favoriteFood, setFavoriteFood] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  useEffect(() => {
    async function loadFavorites() {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setIsLoading(false);
        return; // If not logged in, stop here.
      }

      // 1. Find out WHICH items the user favorited
      const { data: favs } = await supabase
        .from('user_favorites')
        .select('menu_item_id')
        .eq('user_id', currentUser.id);

      if (favs && favs.length > 0) {
        const ids = favs.map(f => f.menu_item_id);
        setFavoriteIds(ids);

        // 2. Fetch ONLY the food items that match those IDs
        const { data: menuItems, error } = await supabase
          .from("menu_items")
          .select("*")
          .in('id', ids);

        if (!error && menuItems) {
          setFavoriteFood(menuItems);
        }
      }
      
      setIsLoading(false);
    }
    loadFavorites();
  }, []);

  const toggleFavorite = async (itemId: number) => {
    if (!user) return;

    // Because this is the favorites page, clicking the heart removes it instantly
    await supabase.from("user_favorites").delete().match({ user_id: user.id, menu_item_id: itemId });
    
    // Update the UI instantly by filtering out the removed item
    setFavoriteIds(prev => prev.filter(id => id !== itemId));
    setFavoriteFood(prev => prev.filter(food => food.id !== itemId));
  };

  const toggleDetails = (itemId: number) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  // Calculate Total Savings for ALL favorited items
  const totalSavings = favoriteFood.reduce((total, item) => {
    const difference = Math.abs(item.zomato_total - item.swiggy_total);
    return total + difference;
  }, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans tracking-tight">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Your <span className="text-rose-500">Favorites.</span>
          </h1>

          {/* The Total Savings Dashboard Banner */}
          {!isLoading && favoriteFood.length > 0 && totalSavings > 0 && (
            <div className="w-full max-w-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <p className="font-medium text-sm md:text-base">
                  By choosing the Best Value for your saved items, you save:
                </p>
              </div>
              <span className="font-black text-2xl text-emerald-600 bg-white px-3 py-1 rounded-lg shadow-sm border border-emerald-100">
                ₹{totalSavings}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {isLoading ? (
            // Skeleton Loader
            [1, 2].map((skeleton) => (
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
          ) : favoriteFood.length > 0 ? (
            
            // The Actual Data Cards (Identical to Main Page)
            favoriteFood.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative transition-all duration-200 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-6 right-6 text-2xl hover:scale-110 transition-transform active:scale-95"
                  title="Remove from favorites"
                >
                  ❤️
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
            
            // Beautiful Empty State if no favorites
            <div className="col-span-1 md:col-span-2 text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-5xl mb-4 block">🤍</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No favorites yet</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                You haven't saved any dishes yet. Head back to the main menu to find the best delivery deals!
              </p>
              <Link 
                href="/" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm"
              >
                Browse Menu
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}