"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      
      if (!session || session?.user?.email !== "chaudharyriyakundu@gmail.com") {
        router.push("/"); 
      }
    });
  }, [router]);
  
  // We initialize these as empty strings now so the inputs start completely blank
  const [status, setStatus] = useState<string>("");
  const [formData, setFormData] = useState({
    restaurant: "", dish: "",
    zomato_base: "", zomato_fee: "", zomato_tax: "",
    swiggy_base: "", swiggy_fee: "", swiggy_tax: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Uploading to cloud...");

    // We force the inputs into Numbers so the math doesn't break
    const zomato_total = Number(formData.zomato_base) + Number(formData.zomato_fee) + Number(formData.zomato_tax);
    const swiggy_total = Number(formData.swiggy_base) + Number(formData.swiggy_fee) + Number(formData.swiggy_tax);
    const best_value = swiggy_total <= zomato_total ? "Swiggy" : "Zomato";

    const { error } = await supabase
      .from('menu_items')
      .insert([
        { 
          restaurant: formData.restaurant, 
          dish: formData.dish,
          zomato_base: Number(formData.zomato_base), zomato_fee: Number(formData.zomato_fee), zomato_tax: Number(formData.zomato_tax), zomato_total,
          swiggy_base: Number(formData.swiggy_base), swiggy_fee: Number(formData.swiggy_fee), swiggy_tax: Number(formData.swiggy_tax), swiggy_total,
          best_value
        }
      ]);

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus("Success! Food added to live database.");
      // Reset the form to blank states
      setFormData({
        restaurant: "", dish: "", zomato_base: "", zomato_fee: "", zomato_tax: "", swiggy_base: "", swiggy_fee: "", swiggy_tax: ""
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard: Add Food</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-md flex flex-col gap-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Name</label>
            <input required name="restaurant" value={formData.restaurant} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50" placeholder="e.g. Domino's Pizza" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Dish Name</label>
            <input required name="dish" value={formData.dish} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50" placeholder="e.g. Margherita Pizza" />
          </div>
        </div>

        {/* Zomato Section with Explicit Labels */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h2 className="font-bold text-red-700 mb-3 border-b border-red-200 pb-2">Zomato Pricing (₹)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-red-800 mb-1">Base Price</label>
              <input required type="number" name="zomato_base" value={formData.zomato_base} onChange={handleChange} className="w-full p-2 border border-red-200 rounded" />
            </div>
            <div>
              <label className="block text-xs font-bold text-red-800 mb-1">Delivery Fee</label>
              <input required type="number" name="zomato_fee" value={formData.zomato_fee} onChange={handleChange} className="w-full p-2 border border-red-200 rounded" />
            </div>
            <div>
              <label className="block text-xs font-bold text-red-800 mb-1">Taxes</label>
              <input required type="number" name="zomato_tax" value={formData.zomato_tax} onChange={handleChange} className="w-full p-2 border border-red-200 rounded" />
            </div>
          </div>
        </div>

        {/* Swiggy Section with Explicit Labels */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <h2 className="font-bold text-orange-700 mb-3 border-b border-orange-200 pb-2">Swiggy Pricing (₹)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-orange-800 mb-1">Base Price</label>
              <input required type="number" name="swiggy_base" value={formData.swiggy_base} onChange={handleChange} className="w-full p-2 border border-orange-200 rounded" />
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-800 mb-1">Delivery Fee</label>
              <input required type="number" name="swiggy_fee" value={formData.swiggy_fee} onChange={handleChange} className="w-full p-2 border border-orange-200 rounded" />
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-800 mb-1">Taxes</label>
              <input required type="number" name="swiggy_tax" value={formData.swiggy_tax} onChange={handleChange} className="w-full p-2 border border-orange-200 rounded" />
            </div>
          </div>
        </div>

        <button type="submit" className="mt-2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-sm">
          Push to Cloud Database
        </button>

        {status && <p className="text-center font-bold mt-2 text-gray-800 bg-green-100 py-2 rounded">{status}</p>}
      </form>
    </main>
  );
}