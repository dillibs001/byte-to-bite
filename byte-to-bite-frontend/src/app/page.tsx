'use client';

import { useChat } from '../hooks/useChat'; // Ensure this matches your file structure
import { useRef, useEffect } from 'react';

export default function Home() {
  const { messages, inputValue, setInputValue, isLoading, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll smoothly down to the newest chat bubble on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <main className="flex h-screen w-screen flex-col bg-slate-950 text-slate-100 antialiased font-sans">
      
      {/* 🌟 Modern Acrylic Blur Header Panel */}
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800/60 bg-slate-900/60 backdrop-blur-md px-8 shadow-xl shadow-slate-950/20 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="flex h-10 w-10 items-center bg-linear-to-tr from-blue-500 to-indigo-600 rounded-2xl shadow-md shadow-blue-500/20 text-xl justify-center">
            🍔
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-50 uppercase">Byte-to-Bite</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">Automated Ordering Core</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 py-1.5 px-4 rounded-full shadow-inner shadow-emerald-900/10">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="tracking-wide uppercase text-[10px]">Live API Linked</span>
        </div>
      </header>

      {/* 💬 Premium Smooth Scroll Conversation Viewport */}
      <section className="flex-1 overflow-y-auto px-6 py-8 space-y-6 max-w-3xl w-full mx-auto custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full animate-fadeIn ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md px-5 py-4 rounded-3xl text-[14px] font-medium shadow-md transition-all duration-200 border ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white border-blue-500/40 rounded-tr-none shadow-blue-950/20'
                  : 'bg-slate-900 text-slate-200 border-slate-800/80 rounded-tl-none shadow-slate-950/50'
              }`}
            >
              {/* 1. Standard text rendering (keeps your markdown bold formatting) */}
              <span className="whitespace-pre-line leading-relaxed">
                {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
              </span>

              {/* 2. 🆕 THE NEW UI COMPONENT: Uses your exact Tailwind classes! */}
              {msg.link && (
                <a
                  href={msg.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 px-5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-950/40 hover:shadow-emerald-500/20 transform active:scale-[0.98] animate-pulse tracking-wide uppercase text-xs"
                >
                  💳 Proceed to Secure Payment
                </a>
              )}
            </div>
          </div>
        ))}
        
        {/* Dynamic Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-slate-900/50 border border-slate-800/40 text-slate-400 px-5 py-3 rounded-3xl rounded-tl-none text-xs flex items-center space-x-1.5 shadow-md">
              <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </section>

      {/* 📥 Balanced Sticky Footer Action Input Panel */}
      <footer className="border-t border-slate-800/40 bg-slate-900/40 backdrop-blur-md p-5 shadow-2xl shadow-slate-950 sticky bottom-0">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex max-w-3xl mx-auto items-center space-x-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-1.5 focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-300 shadow-inner"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type an option key number or command..."
            className="flex-1 bg-transparent rounded-xl px-4 py-3 text-sm focus:outline-none text-slate-100 placeholder-slate-600 transition font-medium"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 disabled:text-slate-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-950/20 active:scale-95 shrink-0"
          >
            Send Message
          </button>
        </form>
      </footer>
    </main>
  );
}