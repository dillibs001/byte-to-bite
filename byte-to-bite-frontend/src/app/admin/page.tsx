'use client'; 

import { useState } from 'react'; 
import axios from 'axios';

// TypeScript interface so our code knows what a 'meal' looks like
interface Meal {
  _id: string;
  numberId: number;
  name: string;
  price: number;
}

export default function AdminDashboard() {
  // Form State
  const [numberId, setNumberId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [status, setStatus] = useState({ message: '', isError: false });

  // NEW: Menu Display State
  const [menuItems, setMenuItems] = useState<Meal[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  // NEW: Function to Fetch the Menu (Requires the secret key!)
  const fetchActiveMenu = async () => {
    if (!secretKey) {
      setStatus({ message: '⚠️ Please enter your Admin Secret Key first to load the menu.', isError: true });
      return;
    }

    setIsLoadingMenu(true);
    try {
      const response = await axios.get('http://localhost:3000/api/admin/menu', {
        headers: { 'X-Admin-API-Key': secretKey }
      });
      setMenuItems(response.data.menu);
      setStatus({ message: '✅ Menu loaded successfully!', isError: false });
    } catch (error: any) {
      setStatus({ message: '❌ Failed to load menu. Check your secret key.', isError: true });
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // Form Submit Handler
  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ message: 'Sending to server...', isError: false });

    try {
      const response = await axios.post(
        'http://localhost:3000/api/admin/menu',
        {
          numberId: parseInt(numberId),
          name: name,
          price: parseInt(price),
        },
        {
          headers: { 'X-Admin-API-Key': secretKey },
        }
      );

      setStatus({ message: response.data.message, isError: false });
      setNumberId('');
      setName('');
      setPrice('');

      // 🔥 Automatically refresh the menu list after a successful addition!
      fetchActiveMenu();

    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to connect to server';
      setStatus({ message: errorMsg, isError: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      {/* Expanded to a 2-column grid layout on larger screens */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: THE INPUT FORM                */}
        {/* ========================================== */}
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md h-fit">
          <h1 className="text-2xl font-black mb-2 text-emerald-400">Byte-to-Bite Admin</h1>
          <p className="text-sm text-slate-400 mb-8">Securely manage the restaurant database.</p>

          <form onSubmit={handleAddMeal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Menu Number ID</label>
              <input
                type="number"
                value={numberId}
                onChange={(e) => setNumberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                placeholder="e.g., 6"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Meal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                placeholder="e.g., Suya Skewers"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Price (₦)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                placeholder="e.g., 2500"
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-bold text-rose-400 uppercase tracking-wide mb-1">Admin Secret Key</label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full bg-slate-950 border border-rose-900/50 rounded-lg px-4 py-2.5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all outline-none"
                placeholder="Enter your VIP password..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
            >
              Deploy to Database
            </button>
          </form>

          {status.message && (
            <div className={`mt-6 p-4 rounded-lg text-sm font-medium ${status.isError ? 'bg-rose-950/50 text-rose-400 border border-rose-900' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900'}`}>
              {status.message}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: THE LIVE MENU DISPLAY        */}
        {/* ========================================== */}
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md h-fit max-h-[85vh] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-200">Active Menu List</h2>
            
            {/* The manual fetch button */}
            <button 
              type="button"
              onClick={fetchActiveMenu}
              disabled={isLoadingMenu}
              className="bg-slate-800 hover:bg-slate-700 text-xs font-bold py-2 px-4 rounded-lg transition-all border border-slate-700"
            >
              {isLoadingMenu ? 'Loading...' : 'Load / Refresh'}
            </button>
          </div>

          {/* We use Array.map() to loop through the menuItems and draw them on screen! */}
          <div className="overflow-y-auto pr-2 space-y-3">
            {menuItems.length === 0 ? (
              <div className="text-center text-slate-500 py-10 border-2 border-dashed border-slate-800 rounded-xl">
                Type your Secret Key and click Load to view the menu.
              </div>
            ) : (
              menuItems.map((meal) => (
                <div key={meal._id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-900/30 text-emerald-400 text-sm font-black px-3 py-1 rounded-md border border-emerald-900/50">
                      #{meal.numberId}
                    </span>
                    <span className="font-bold text-slate-200">{meal.name}</span>
                  </div>
                  <div className="text-emerald-400 font-mono font-bold">
                    ₦{meal.price.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}