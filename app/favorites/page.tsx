"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function FavoritesPage() {
  const router = useRouter();
  const [favoriteFoods, setFavoriteFoods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      // 1. Check who is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login"); // Kick them to login if they aren't signed in
        return;
      }

      // 2. Ask the database: "Get all menu_items that this specific user has favorited"
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          menu_items (
            id, restaurant, dish, zomato_base, zomato_fee, zomato_tax, zomato_total, swiggy_base, swiggy_fee, swiggy_tax, swiggy_total, best_value
          )
        `)
        .eq('user_id', session.user.id);

      if (!error && data) {
        // Supabase returns nested data here, so we clean it up before saving to state
        const cleanedData = data.map((row: any) => row.menu_items);
        setFavoriteFoods(cleanedData);
      }
      setIsLoading(false);
    }

    fetchFavorites();
  }, [router]);

  if (isLoading)
    return (
      <div className="p-8 text-center font-bold text-gray-400 tracking-wide">
        Loading your favorites...
      </div>
    );

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-10 text-gray-900 tracking-tight drop-shadow">
          <span role="img" aria-label="Heart" className="mr-2">❤️</span>
          My Saved Deals
        </h1>
        {favoriteFoods.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-400 text-lg font-medium">
              You haven't saved any food yet!<br />
              Go back home and click the heart on some cheap eats.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {favoriteFoods.map((item) => (
              <div
                key={item.id}
                className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 
                  hover:-translate-y-1 hover:shadow-xl transition-all duration-300
                  flex flex-col gap-4"
              >
                <h2 className="text-2xl font-extrabold text-gray-900 leading-snug tracking-tight">
                  {item.dish}
                </h2>
                <p className="text-gray-400 text-base font-semibold mb-2">{item.restaurant}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-semibold text-gray-500">Best Value</span>
                  <span
                    className={
                      "inline-block px-4 py-2 rounded-xl font-bold text-base shadow " +
                      (item.best_value === 'Zomato'
                        ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white"
                        : "bg-gradient-to-r from-orange-400 to-yellow-300 text-gray-900")
                    }
                  >
                    {item.best_value}{" "}
                    <span className="font-black tracking-tight">
                      (₹
                      {item.best_value === 'Zomato' ? item.zomato_total : item.swiggy_total})
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}