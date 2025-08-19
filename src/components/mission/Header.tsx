"use client";

import { useState, useEffect } from "react";
import { useMissionStore } from "@/lib/missionStore";

export function Header() {
  const { view, setView, search, checksByServerId, closeCheck, servers, createNewCheck } = useMissionStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const results = q ? search(q) : [];

  // Keyboard shortcut to close random check
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'c' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        // Get all open checks
        const allChecks = Object.values(checksByServerId).flat();
        const openChecks = allChecks.filter(check => check.status === "open");
        
        if (openChecks.length > 0) {
          // Select a random open check
          const randomCheck = openChecks[Math.floor(Math.random() * openChecks.length)];
          
          // Close the random check
          closeCheck(randomCheck.id);
          
          console.log(`Closed random check: ${randomCheck.id}`);
        }
      } else if (event.key.toLowerCase() === 'o' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        // Open more tickets - create new checks for random servers
        const serverIds = Object.keys(checksByServerId).filter(id => id !== "takeout");
        
        if (serverIds.length > 0) {
          // Create 2-3 new checks
          const numNewChecks = 2 + Math.floor(Math.random() * 2);
          
          for (let i = 0; i < numNewChecks; i++) {
            // Select a random server
            const randomServerId = serverIds[Math.floor(Math.random() * serverIds.length)];
            
            // Create new check using the store function
            createNewCheck(randomServerId);
          }
          
          console.log(`Opened ${numNewChecks} new checks`);
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [checksByServerId, closeCheck, servers, createNewCheck]);

  // Add CSS animations for the modal
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .animate-in {
        animation-fill-mode: both;
      }
      
      .slide-in-from-top-2 {
        animation: slideInFromTop 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      
      .fade-in-0 {
        animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      
      @keyframes slideInFromTop {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="sticky top-0 z-20 bg-black text-white border-b border-slate-700/50 shadow-lg">
      <div className="px-6 py-4 flex items-center gap-4">
        {/* Premium Brand Section */}
        <div className="flex items-center gap-3">
          <div className="text-[#FF4C00] font-bold text-xl tracking-tight">toast</div>
          <div className="text-slate-300 text-lg font-medium tracking-wide">Mission Control</div>
          
          {/* Keyboard shortcut feedback */}
          {/* Removed showShortcutFeedback and feedbackMessage as per edit hint */}
        </div>
        
        {/* Enhanced Controls */}
        <div className="ml-auto flex items-center gap-4">
          <button 
            onClick={() => setOpen(true)} 
            className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-full transition-all duration-200 hover:shadow-sm text-gray-600 hover:text-gray-700 min-w-[200px]"
          >
            <img src="/search.png" alt="search" className="w-4 h-4" />
            <span className="text-sm font-medium">Find a check</span>
          </button>
          
          {/* Premium Toggle Switch */}
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className={`transition-colors duration-300 ${view === "foh" ? "text-white font-bold" : "text-slate-400"}`}>
              Front of House
            </span>
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={view === "boh"} 
                onChange={(e) => setView(e.target.checked ? "boh" : "foh")} 
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 relative transition-all duration-300 peer-checked:shadow-lg">
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5 shadow-md" />
              </div>
            </label>
            <span className={`transition-colors duration-300 ${view === "boh" ? "text-white font-bold" : "text-slate-400"}`}>
              Back of House
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Search Modal */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-start justify-center p-6" onClick={() => setOpen(false)}>
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200/50 overflow-hidden animate-in slide-in-from-top-2 fade-in-0 duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Premium Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🔍</div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Find a Check</h2>
                  <p className="text-slate-300 text-sm mt-1">Search by check number, guest name, or table</p>
                </div>
                <button 
                  onClick={() => setOpen(false)} 
                  className="ml-auto w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center text-white font-bold hover:scale-110"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Enhanced Search Input */}
            <div className="p-6 border-b border-slate-100">
              <input 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="Search checks..." 
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:outline-none transition-all duration-300 focus:ring-4 focus:ring-blue-100" 
                autoFocus
              />
            </div>
            
            {/* Enhanced Results */}
            <div className="max-h-[60vh] overflow-auto divide-y divide-slate-100">
              {results.map((r, index) => (
                <div 
                  key={r.check.id} 
                  className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors duration-300">
                        {r.check.id}
                      </div>
                      <div className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          {r.server?.name ? "👤" : "📦"} {r.server?.name ?? "Pickup"}
                        </span>
                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.check.serviceType === "dine-in" 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {r.check.serviceType === "dine-in" ? "Dine-in" : "Pickup"}
                        </span>
                        {r.check.tableNumber && (
                          <>
                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                            <span>Table #{r.check.tableNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                        ${r.check.amountUsd.toFixed(2)}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {r.check.guests} guest{r.check.guests !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!results.length && q && (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <div className="text-lg font-medium text-slate-600 mb-2">No results found</div>
                  <div className="text-sm text-slate-500">Try searching with different terms</div>
                </div>
              )}
              {!q && (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">✨</div>
                  <div className="text-lg font-medium text-slate-600 mb-2">Ready to search</div>
                  <div className="text-sm text-slate-500">Enter a check number, guest name, or table number above</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 