"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Check if a user is already logged in when the page loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Set up a "listener" to watch for logins/logouts in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup the listener when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white border-b border-gray-200 p-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        
        {/* The App Logo / Home Button */}
        <Link href="/" className="text-xl font-black text-gray-900 tracking-tight">
          Food<span className="text-blue-600">Compare</span>
        </Link>

        {/* The Dynamic Menu */}
        <div className="flex gap-6 items-center">
        {user && (
            <Link href="/favorites" className="text-sm font-bold text-gray-600 hover:text-red-500 transition">
              My Favorites
            </Link>
          )}
          
          {user?.email === "chaudharyriyakundu@gmail.com" && (
          <Link href="/admin" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">
          + Add Food
         </Link>
       )}

          {/* Swap between Sign In and Sign Out based on auth state */}
          {user ? (
            <button 
              onClick={handleSignOut} 
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-bold transition"
            >
              Sign Out
            </button>
          ) : (
            <Link 
              href="/login" 
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-bold transition shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}