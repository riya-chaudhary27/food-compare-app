"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();
  // Function to handle new user registration
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Creating account...");
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus("Success! Account created. You can now log in.");
      setPassword(""); // Clear password field for safety
    }
  };

  // Function to handle returning users
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Logging in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus("Success! You are securely logged in.");
      // In the future, we will redirect them to the home page here
      router.push("/"); // This teleports them to the home page
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h1>
        
        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="you@example.com" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="••••••••" 
              required 
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-4">
            <button 
              onClick={handleLogin} 
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Log In
            </button>
            <button 
              onClick={handleSignUp} 
              className="w-full bg-white text-blue-600 font-bold py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition"
            >
              Create Account
            </button>
          </div>
        </form>

        {status && (
          <div className="mt-6 p-3 bg-gray-100 text-center rounded text-sm font-medium text-gray-800">
            {status}
          </div>
        )}
      </div>
    </main>
  );
}