"use client";

import { useState, useEffect } from "react";
import { useMissionStore } from "@/lib/missionStore";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { Check, StaffMember } from "@/types/mission";

export function Header() {
  const { view, setView, search, checksByServerId, closeCheck, servers, createNewCheck } = useMissionStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [selectedCheck, setSelectedCheck] = useState<{ check: Check; server?: StaffMember } | null>(null);
  const results = q ? search(q) : [];

  // Map server names to avatar images
  const getAvatarPath = (serverName: string): string => {
    const nameMap: Record<string, string> = {
      "Alex Kim": "/avatars/alex.png",
      "Jamie Lee": "/avatars/jamie.png",
      "Morgan Patel": "/avatars/morgan.png",
      "Riley Jones": "/avatars/riley.png"
    };
    return nameMap[serverName] || "/avatars/newemployee.png";
  };

  // Keyboard shortcuts and escape key handling
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Close modals with Escape key
      if (event.key === 'Escape') {
        if (selectedCheck) {
          setSelectedCheck(null);
          return;
        }
        if (open) {
          setOpen(false);
          return;
        }
      }
      
      // Don't process other shortcuts when search or modal is open
      if (open || selectedCheck) return;
      
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
  }, [checksByServerId, closeCheck, servers, createNewCheck, open, selectedCheck]);

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

      {/* Full-Screen Morphing Search */}
      {open && (
        <div 
          className="fixed inset-0 z-[9999] bg-white search-overlay"
          onClick={(e) => {
            // Close if clicking on the overlay background
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          {/* Morphing Search Bar */}
          <div className="search-bar-morph h-full">
            {/* Close Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              className="fixed top-8 right-8 w-12 h-12 rounded-full bg-black text-white hover:bg-gray-800 transition-all duration-300 flex items-center justify-center text-xl font-bold z-[10000] opacity-0 animate-fade-in shadow-lg"
              style={{ animationDelay: '0.6s' }}
            >
              ×
            </button>

            {/* Search Input Container */}
            <div className="flex flex-col h-full">
              {/* Top Section with Search */}
              <div className="flex-shrink-0 pt-20 pb-12 px-8">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <h1 className="text-4xl font-bold text-black mb-4">Find a Check</h1>
                    <p className="text-gray-600 text-lg">Search by check number, guest name, table number, or last 4 digits</p>
                  </div>
                  
                  {/* Large Search Input - This morphs from the original button */}
                  <div className="relative search-input-container">
                    <input 
                      value={q} 
                      onChange={(e) => setQ(e.target.value)} 
                      placeholder="Search checks..." 
                      className="w-full border-2 border-black rounded-none px-6 py-4 pr-14 text-xl text-black placeholder-gray-500 focus:border-[#FF4C00] focus:outline-none transition-all duration-300 bg-white"
                      autoFocus
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {q ? (
                        <button
                          onClick={() => setQ('')}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                          title="Clear search"
                        >
                          <span className="text-gray-600 text-sm font-bold">×</span>
                        </button>
                      ) : (
                        <img src="/search.png" alt="search" className="w-6 h-6 opacity-50" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {!q ? (
                /* Suggested Content Columns */
                <div className="max-w-7xl mx-auto px-8 h-full">
                  <div className="grid grid-cols-3 gap-12 h-full">
                                         {/* Recently Closed */}
                     <div className="space-y-6">
                       <h2 className="text-2xl font-bold text-black border-b-2 border-black pb-2">Recently Closed</h2>
                       <div className="space-y-4">
                         {Object.values(checksByServerId).flat().filter(check => check.status === "closed").slice(0, 8).map((check) => (
                           <div key={check.id} className="cursor-pointer hover:bg-gray-50 p-3 -mx-3 transition-colors duration-200" onClick={() => setQ(check.id)}>
                             <div className="font-semibold text-black">{check.id}</div>
                             <div className="text-sm text-gray-600 flex items-center gap-2">
                               <img src="/guest.png" alt="guest" className="w-3 h-3" />
                               {check.guestName} • ${check.amountUsd.toFixed(2)}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>

                    {/* Servers */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-black border-b-2 border-black pb-2">Servers</h2>
                      <div className="space-y-4">
                        {servers.map((server) => {
                          const serverChecks = checksByServerId[server.id] || [];
                          const openCount = serverChecks.filter(c => c.status === "open").length;
                          return (
                            <div key={server.id} className="cursor-pointer hover:bg-gray-50 p-3 -mx-3 transition-colors duration-200" onClick={() => setQ(server.name)}>
                              <div className="font-semibold text-black flex items-center gap-2">
                                <img src={getAvatarPath(server.name)} alt="server" className="w-4 h-4 rounded-full" />
                                {server.name}
                              </div>
                              <div className="text-sm text-gray-600">{openCount} open checks • ${server.tipsUsd.toFixed(0)} tips</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Table Numbers */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-black border-b-2 border-black pb-2">Active Tables</h2>
                      <div className="space-y-4">
                        {Array.from(new Set(
                          Object.values(checksByServerId).flat()
                            .filter(c => c.status === "open" && c.tableNumber)
                            .map(c => c.tableNumber)
                            .sort((a, b) => (a || 0) - (b || 0))
                        )).slice(0, 8).map((tableNum) => {
                          const tableCheck = Object.values(checksByServerId).flat()
                            .find(c => c.status === "open" && c.tableNumber === tableNum);
                          return (
                            <div key={tableNum} className="cursor-pointer hover:bg-gray-50 p-3 -mx-3 transition-colors duration-200" onClick={() => setQ(`Table ${tableNum}`)}>
                              <div className="font-semibold text-black flex items-center gap-2">
                                <img src="/table.png" alt="table" className="w-4 h-4" />
                                Table {tableNum}
                              </div>
                              <div className="text-sm text-gray-600">{tableCheck?.guestName} • ${tableCheck?.amountUsd.toFixed(2) || '0.00'}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Search Results */
                <div className="max-w-4xl mx-auto px-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-black">Search Results</h2>
                    <p className="text-gray-600">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
                  </div>
                  
                  <div className="space-y-4">
                    {results.map((r, index) => (
                      <div 
                        key={r.check.id} 
                        className="border-2 border-gray-200 p-6 hover:border-black transition-all duration-300 cursor-pointer group bg-white"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => {
                          setSelectedCheck({ check: r.check, server: r.server });
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-bold text-black text-xl mb-2 group-hover:text-[#FF4C00] transition-colors duration-300">
                              {r.check.id}
                            </div>
                                                         <div className="text-gray-600 mb-2 flex items-center gap-4">
                               <span className="flex items-center gap-2">
                                 <img src="/guest.png" alt="guest" className="w-4 h-4" />
                                 {r.check.guestName}
                               </span>
                               {r.check.tableNumber && (
                                 <span className="flex items-center gap-2">
                                   <img src="/table.png" alt="table" className="w-4 h-4" />
                                   Table {r.check.tableNumber}
                                 </span>
                               )}
                               <span className="flex items-center gap-2">
                                 <img src={r.server ? getAvatarPath(r.server.name) : "/takeout.png"} alt="server" className="w-4 h-4 rounded-full" />
                                 {r.server?.name ?? "Takeout"}
                               </span>
                             </div>
                                                         <div className="flex items-center gap-2">
                               <span className={`px-3 py-1 rounded border text-sm font-medium ${
                                 r.check.status === "open" ? "bg-[#F8F7F4] border-[#E8E6DD] text-[#1A1A1A]" :
                                 r.check.status === "paid" ? "bg-[#F8F7F4] border-[#E8E6DD] text-[#C26E00]" :
                                 "bg-[#F8F7F4] border-[#E8E6DD] text-[#6B6B6B]"
                               }`}>
                                 {r.check.status.charAt(0).toUpperCase() + r.check.status.slice(1)}
                               </span>
                               <span className={`px-3 py-1 rounded border text-sm font-medium ${
                                 r.check.serviceType === "dine-in" 
                                   ? "bg-[#F8F7F4] border-[#E8E6DD] text-[#1A1A1A]" 
                                   : "bg-[#F8F7F4] border-[#E8E6DD] text-[#C26E00]"
                               }`}>
                                 {r.check.serviceType === "dine-in" ? "Dine-in" : "Takeout"}
                               </span>
                             </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-black group-hover:text-[#FF4C00] transition-colors duration-300">
                              ${r.check.amountUsd.toFixed(2)}
                            </div>
                            <div className="text-gray-500 mt-1">
                              {r.check.guests} guest{r.check.guests !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                                         {!results.length && (
                       <div className="text-center py-16">
                         <div className="mb-4 flex justify-center">
                           <img src="/search.png" alt="search" className="w-16 h-16 opacity-30" />
                         </div>
                         <div className="text-2xl font-bold text-black mb-2">No results found</div>
                         <div className="text-gray-600">Try searching with different terms or check the suggestions above</div>
                       </div>
                     )}
                  </div>
                </div>
                             )}
             </div>
           </div>
           </div>

           {/* Enhanced Custom Styles */}
           <style jsx>{`
             .search-overlay {
               animation: overlayExpand 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
               transform-origin: calc(100% - 120px) 20px;
               overflow: hidden;
             }
             
             .search-bar-morph {
               animation: morphContainer 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
               will-change: transform, opacity;
               backface-visibility: hidden;
             }
             
             .search-input-container {
               animation: searchInputReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
               animation-delay: 0.3s;
               opacity: 0;
               transform: scale(0.8) translateY(20px);
               animation-fill-mode: both;
               will-change: transform, opacity;
             }
             
                           @keyframes overlayExpand {
                0% {
                  clip-path: circle(30px at calc(100% - 120px) 20px);
                  background-color: rgba(255, 255, 255, 0.9);
                }
                30% {
                  clip-path: circle(100px at calc(100% - 120px) 20px);
                  background-color: rgba(255, 255, 255, 0.95);
                }
                100% {
                  clip-path: circle(200vmax at calc(100% - 120px) 20px);
                  background-color: rgba(255, 255, 255, 1);
                }
              }
             
             @keyframes morphContainer {
               0% {
                 transform: scale(0.05) translate(800px, -400px);
                 opacity: 0.7;
                 filter: blur(2px);
               }
               20% {
                 transform: scale(0.2) translate(200px, -100px);
                 opacity: 0.85;
                 filter: blur(1px);
               }
               60% {
                 transform: scale(0.8) translate(20px, -10px);
                 opacity: 0.95;
                 filter: blur(0.5px);
               }
               100% {
                 transform: scale(1) translate(0, 0);
                 opacity: 1;
                 filter: blur(0);
               }
             }
             
             @keyframes searchInputReveal {
               0% {
                 opacity: 0;
                 transform: scale(0.8) translateY(30px) rotateX(10deg);
                 filter: blur(3px);
               }
               60% {
                 opacity: 0.8;
                 transform: scale(1.02) translateY(-5px) rotateX(-2deg);
                 filter: blur(1px);
               }
               100% {
                 opacity: 1;
                 transform: scale(1) translateY(0) rotateX(0deg);
                 filter: blur(0);
               }
             }
             
             @keyframes fade-in {
               0% {
                 opacity: 0;
                 transform: translateY(20px) scale(0.9);
                 filter: blur(2px);
               }
               100% {
                 opacity: 1;
                 transform: translateY(0) scale(1);
                 filter: blur(0);
               }
             }
             
             .animate-fade-in {
               animation: fade-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
               will-change: transform, opacity;
             }
             
             /* Performance optimizations */
             .search-overlay * {
               transform-style: preserve-3d;
             }
           `}</style>
         </div>
       )}

      {/* Order Details Modal */}
      {selectedCheck && (
        <OrderDetailsModal
          check={selectedCheck.check}
          server={selectedCheck.server}
          isOpen={!!selectedCheck}
          onClose={() => setSelectedCheck(null)}
        />
      )}
    </div>
  );
} 