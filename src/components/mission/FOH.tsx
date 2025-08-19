"use client";

import { useMemo, useState, useEffect } from "react";
import { useMissionStore } from "@/lib/missionStore";
import type { Check, CheckStatus, ServiceType, PickupOrder } from "@/types/mission";
import { ServerAvatar } from "./ServerAvatar";
import { Source_Sans_3 } from "next/font/google";

const sourceSans = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600"] });

export function FOH() {
  const { servers, checksByServerId, view, setView, closeCheck } = useMissionStore();
  const [activeTab, setActiveTab] = useState<"open" | "paid" | "closed">("open");

  return (
    <div className="flex">
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 px-4 pb-24">
          <ServerColumns />
        </div>
      </div>
      <div className="w-80 shrink-0 border-l bg-white sticky top-0 h-screen hidden lg:block">
        <PickupColumn />
      </div>
    </div>
  );
}

function ServerColumns() {
  const { servers } = useMissionStore();
  return (
    <div className="flex gap-4">
      {servers.map((s) => (
        <ServerColumn key={s.id} serverId={s.id} />
      ))}
    </div>
  );
}

function ServerColumn({ serverId }: { serverId: string }) {
  const { servers, checksByServerId } = useMissionStore();
  
  const server = servers.find((s) => s.id === serverId)!;
  const checks = checksByServerId[serverId] ?? [];
  const [open, paid, closed] = useMemo(() => {
    const o: Check[] = [], p: Check[] = [], c: Check[] = [];
    for (const chk of checks) {
      if (chk.status === "open") o.push(chk);
      else if (chk.status === "paid") p.push(chk);
      else c.push(chk);
    }
    return [o, p, c];
  }, [checks]);

  const [activeTab, setActiveTab] = useState<CheckStatus>("open");
  const current = activeTab === "open" ? open : activeTab === "paid" ? paid : closed;

  // Generate random break time between 15-30 minutes for this server
  const breakMinutes = useMemo(() => {
    // Use server ID to generate consistent break time for each server
    const hash = serverId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 15 + (Math.abs(hash) % 16); // 15-30 range
  }, [serverId]);

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

  // Determine status and styling based on overtime
  const getServerStatus = () => {
    if (server.overtimeMinutes > 0) return "Overtime";
    if (server.overtimeMinutes < 0) return "Approaching Overtime";
    return "Clocked in";
  };

  const getBorderColor = () => {
    const borderClass = server.overtimeMinutes > 0 ? "border-red-500 border-pulse-red" 
                      : server.overtimeMinutes < 0 ? "border-orange-500 border-pulse-orange"
                      : "border-[#C2BBA3]";
    
    // Debug logging
    if (server.overtimeMinutes !== 0) {
      console.log(`${server.name}: overtimeMinutes=${server.overtimeMinutes}, borderClass="${borderClass}"`);
    }
    
    return borderClass;
  };

  const getStatusColor = () => {
    if (server.overtimeMinutes > 0) return "text-red-600";
    if (server.overtimeMinutes < 0) return "text-orange-600";
    return "text-[#C26E00]";
  };

  return (
    <div className="w-80 shrink-0">
      <div className={`rounded-lg border ${getBorderColor()} bg-white ${server.overtimeMinutes === 0 ? 'shadow-sm' : ''} p-3 mb-3`}>
        
        {/* Custom CSS for border pulse with glow effect */}
        <style jsx>{`
          @keyframes border-pulse-red {
            0%, 100% {
              border-color: #ef4444;
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
            }
            50% {
              border-color: #b91c1c;
              box-shadow: 0 0 0 4px rgba(185, 28, 28, 0.4), 0 0 20px rgba(239, 68, 68, 0.6);
            }
          }
          
          @keyframes border-pulse-orange {
            0%, 100% {
              border-color: #f97316;
              box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7);
            }
            50% {
              border-color: #c2410c;
              box-shadow: 0 0 0 4px rgba(194, 65, 12, 0.4), 0 0 20px rgba(249, 115, 22, 0.6);
            }
          }
          
          :global(.border-pulse-red) {
            animation: border-pulse-red 2s ease-in-out infinite;
            position: relative;
          }
          
          :global(.border-pulse-orange) {
            animation: border-pulse-orange 2s ease-in-out infinite;
            position: relative;
          }
        `}</style>
        {/* Header with avatar, name, and status */}
        <div className="flex items-center gap-2 mb-2">
          <ServerAvatar name={server.name} size="40" useAI={false} avatarPath={getAvatarPath(server.name)} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[#1A1A1A] text-sm">{server.name}</div>
            <div className="text-xs text-[#6B6B6B] flex items-center gap-1">
              <span>Server</span>
              <span className="w-1 h-1 bg-[#C26E00] rounded-full"></span>
              <span className={`${getStatusColor()} font-medium`}>{getServerStatus()}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Clock info - inspired by the provided layout */}
        <div className="mb-2 p-2 bg-[#F8F7F4] rounded border border-[#E8E6DD]">
          {/* Top row: Total hours and scheduled time */}
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1">
              <span className="text-[#6B6B6B] font-medium">8h</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Clock icon - using the actual clock.png file */}
              <img src="/clock.png" alt="clock" className="w-3 h-3" />
              <span className="font-medium text-[#1A1A1A]">
                {new Date(server.clockInAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}-{server.scheduledClockOutAt ? new Date(server.scheduledClockOutAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "5:00 PM"}
              </span>
            </div>
          </div>
          
          {/* Bottom row: Status and break time */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[#6B6B6B] font-medium">Clocked In</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Break icon - using the actual brreak.png file */}
              <img src="/brreak.png" alt="break" className="w-3 h-3" />
              <span className="font-medium text-[#1A1A1A]">{breakMinutes}m break</span>
            </div>
          </div>
        </div>

        {/* Key metrics - compressed */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="text-center p-2 bg-[#F8F7F4] rounded border border-[#E8E6DD]">
            <div className="font-bold text-[#C26E00] text-sm">${server.tipsUsd.toFixed(0)}</div>
            <div className="text-[#6B6B6B] text-[10px] font-medium">Tips</div>
          </div>
          <div className="text-center p-2 bg-[#F8F7F4] rounded border border-[#E8E6DD]">
            <div className="font-bold text-[#C26E00] text-sm">${server.slph.toFixed(2)}</div>
            <div className="text-[#6B6B6B] text-[10px] font-medium">SPLH</div>
          </div>
        </div>

        {/* Secondary metrics - compressed */}
        <div className="grid grid-cols-3 gap-1 text-[10px]">
          <div className="text-center p-1.5 bg-[#F8F7F4] rounded border border-[#E8E6DD]">
            <div className="font-semibold text-[#1A1A1A]">${(server.hourlyWageUsd * 4).toFixed(2)}</div>
            <div className="text-[#6B6B6B]">Wages</div>
          </div>
          <div className="text-center p-1.5 bg-[#F8F7F4] rounded border border-[#E8E6DD]">
            <div className="font-semibold text-[#1A1A1A]">{server.voids}</div>
            <div className="text-[#6B6B6B]">Voids</div>
          </div>
          <div className="text-center p-1.5 bg-[#F8F7F4] rounded border border-[#E8E6DD]">
            <div className="font-semibold text-[#1A1A1A]">{server.discounts}</div>
            <div className="text-[#6B6B6B]">Discounts</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-12 z-10 bg-white mb-4">
        <div className="flex gap-1 p-1 rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
          <TabButton label={`Open (${open.length})`} active={activeTab === "open"} onClick={() => setActiveTab("open")} />
          <TabButton label={`Paid (${paid.length})`} active={activeTab === "paid"} onClick={() => setActiveTab("paid")} />
          <TabButton label={`Closed (${closed.length})`} active={activeTab === "closed"} onClick={() => setActiveTab("closed")} />
        </div>
      </div>

      {/* List for active tab */}
      <div className="mt-3 space-y-2">
        {current.map((c, index) => (
          <CheckCard 
            key={`${c.id}-${c.openedAt}`} 
            check={c} 
            index={index}
          />
        ))}
        {!current.length && <div className="text-xs text-gray-500">No checks</div>}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-2 text-xs rounded-lg border transition-all duration-200 ${
        active 
          ? "bg-white border-gray-300 shadow-sm text-gray-900 font-bold" 
          : "bg-transparent border-transparent hover:bg-white hover:border-gray-200 text-gray-600 hover:text-gray-900 font-medium"
      }`}
    >
      {label}
    </button>
  );
}

function CheckCard({ check, index = 0 }: { check: Check; index?: number }) {
  const [isNew, setIsNew] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Animate new checks appearing at the top with staggered delay
  useEffect(() => {
    // Staggered delay based on index for multiple new checks
    const staggerDelay = index * 100;
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50 + staggerDelay);
    
    // Mark as not new after animation
    const newTimer = setTimeout(() => {
      setIsNew(false);
    }, 500 + staggerDelay);

    return () => {
      clearTimeout(timer);
      clearTimeout(newTimer);
    };
  }, [index]);

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case "open": return "/Open_badge.png";
      case "paid": return "/Paid_badge.png";
      case "closed": return "/closed.png";
      default: return "/Open_badge.png";
    }
  };

  const getServiceIcon = (serviceType: ServiceType) => {
    switch (serviceType) {
      case "dine-in":
        return <img src="/Dine In.png" alt="dine-in" className="w-6 h-6" />;
      case "takeout":
        return <img src="/takeout.png" alt="takeout" className="w-6 h-6" />;
      case "delivery":
        return <img src="/Delivery.png" alt="delivery" className="w-6 h-6" />;
      default:
        return <img src="/takeout.png" alt="service" className="w-6 h-6" />;
    }
  };

  return (
    <div 
      className={`rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-all duration-700 ease-out cursor-pointer group ${
        isNew 
          ? 'transform -translate-y-3 opacity-0 scale-90 shadow-xl border-blue-200' 
          : 'transform translate-y-0 opacity-100 scale-100'
      } ${isVisible ? 'translate-y-0 opacity-100 scale-100' : ''}`}
      style={{
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.9)',
        opacity: isVisible ? 1 : 0,
        transition: `all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)`,
        zIndex: isNew ? 10 : 1
      }}
    >
      {/* Header with check ID and status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getServiceIcon(check.serviceType)}
          <div>
            <div className="font-bold text-gray-900 text-sm">{check.id}</div>
            <div className="text-xs text-gray-500">
              {new Date(check.openedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </div>
          </div>
        </div>
        <img 
          src={getStatusIcon(check.status)} 
          alt={`${check.status} status`} 
        />
      </div>

      {/* Service details */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <img src="/table.png" alt="table" className="w-4 h-4" />
            <span className="font-medium text-gray-900">{check.tableNumber}</span>
          </div>
          {check.guests > 0 && (
            <div className="flex items-center gap-1 text-gray-500">
              <img src="/guest.png" alt="guests" className="w-3 h-3" />
              <span className="text-xs">{check.guests} guests</span>
            </div>
          )}
        </div>
        <div className="mt-1 text-xs text-gray-600">
          <span className="text-gray-500">Guest:</span> {check.guestName}
        </div>
      </div>

      {/* Amount and items summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="text-gray-500">{check.items.length} items</span>
        </div>
        <div className="font-bold text-lg text-gray-900">${check.amountUsd.toFixed(2)}</div>
      </div>

      {/* Quick items preview */}
      {check.items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Items:</div>
          <div className="flex flex-wrap gap-1">
            {check.items.slice(0, 3).map((item, index) => (
              <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                {item.quantity}x {item.name}
              </span>
            ))}
            {check.items.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-md">
                +{check.items.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PickupColumn() {
  const { pickup, checksByServerId, addPickupOrder, addCheck } = useMissionStore();
  const [isTakeoutActive, setIsTakeoutActive] = useState(true);
  const [quoteTime, setQuoteTime] = useState(20);
  const [delayTime, setDelayTime] = useState(0);

  // Helper function to get check details
  const getCheckDetails = (checkId: string) => {
    // Find the check in all server checks
    for (const serverChecks of Object.values(checksByServerId)) {
      const check = serverChecks.find(c => c.id === checkId);
      if (check) return check;
    }
    return null;
  };

  // Function to generate random guest names
  const generateGuestName = (checkId: string) => {
    const names = [
      "Sarah Johnson", "Mike Chen", "Emma Davis", "Alex Rodriguez", "Lisa Thompson",
      "David Kim", "Maria Garcia", "James Wilson", "Anna Lee", "Chris Brown",
      "Rachel Green", "Tom Anderson", "Jessica White", "Kevin Martinez", "Amanda Taylor",
      "Ryan Clark", "Michelle Lee", "Daniel Johnson", "Jennifer Smith", "Robert Davis"
    ];
    
    // Use checkId to generate consistent name for each order
    const index = parseInt(checkId.replace(/\D/g, '')) % names.length;
    return names[index];
  };

  // Function to generate realistic menu items from Sanchez Bistro
  const generateMenuItems = () => {
    const menu = [
      // Appetizers
      { name: "Guacamole & Chips", price: 12, category: "appetizer" },
      { name: "Queso Fundido", price: 14, category: "appetizer" },
      { name: "Ceviche", price: 18, category: "appetizer" },
      { name: "Tacos de Papa", price: 16, category: "appetizer" },
      { name: "Enchiladas Verdes", price: 22, category: "appetizer" },
      
      // Entrees
      { name: "Carne Asada", price: 32, category: "entree" },
      { name: "Pescado Veracruzano", price: 28, category: "entree" },
      { name: "Pollo en Mole", price: 26, category: "entree" },
      { name: "Enchiladas Rojas", price: 24, category: "entree" },
      { name: "Tacos de Carnitas", price: 20, category: "entree" },
      { name: "Chiles Rellenos", price: 22, category: "entree" },
      { name: "Fajitas Mixtas", price: 30, category: "entree" },
      
      // Sides
      { name: "Arroz Mexicano", price: 8, category: "side" },
      { name: "Frijoles Refritos", price: 7, category: "side" },
      { name: "Ensalada Verde", price: 9, category: "side" },
      { name: "Tortillas de Maíz", price: 4, category: "side" },
      
      // Drinks
      { name: "Horchata", price: 5, category: "drink" },
      { name: "Jamaica", price: 5, category: "drink" },
      { name: "Agua Fresca", price: 4, category: "drink" },
      { name: "Cerveza", price: 7, category: "drink" },
      { name: "Margarita", price: 12, category: "drink" },
      { name: "Tequila Shot", price: 8, category: "drink" }
    ];
    
    // Generate 2-5 items per order
    const itemCount = 2 + Math.floor(Math.random() * 4);
    const items = [];
    
    for (let i = 0; i < itemCount; i++) {
      const item = menu[Math.floor(Math.random() * menu.length)];
      const quantity = Math.random() < 0.3 ? 2 : 1; // 30% chance of quantity 2
      items.push({
        name: item.name,
        price: item.price,
        quantity: quantity,
        category: item.category
      });
    }
    
    return items;
  };

  // Function to calculate total from menu items
  const calculateTotal = (items: any[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Function to create new takeout ticket
  const handleCreateTakeoutTicket = () => {
    const newCheckId = `Ch. #${Math.floor(Math.random() * 9000) + 1000}`;
    const menuItems = generateMenuItems();
    const total = calculateTotal(menuItems);
    
    // Create a new check first - assign to a random server for storage purposes
    const randomServer = Object.keys(checksByServerId)[Math.floor(Math.random() * Object.keys(checksByServerId).length)];
    const serverId = randomServer || "takeout";
    
    const newCheck: Check = {
      id: newCheckId,
      amountUsd: total,
      openedAt: Date.now(),
      status: 'open',
      serviceType: 'takeout',
      quoteTimeMinutes: quoteTime,
      serverId: serverId, // Assign to a server so it gets stored properly
      guestName: generateGuestName(newCheckId),
      guests: 1 + Math.floor(Math.random() * 4),
      items: menuItems.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        quantity: item.quantity,
        priceUsd: item.price,
        category: item.category as any
      }))
    };
    
    const newPickupOrder: PickupOrder = {
      id: `P${pickup.length + 1}`,
      checkId: newCheckId,
      quoteMinutes: quoteTime,
      delayMinutes: delayTime,
      state: 'needs-approval'
    };
    
    // Add both the check and pickup order to the store
    addCheck(newCheck);
    addPickupOrder(newPickupOrder);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-white">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCreateTakeoutTicket}
            className="hover:opacity-80 transition-opacity cursor-pointer"
            title="Create new takeout ticket"
          >
            <img src="/orange_takout.png" alt="takeout" />
          </button>
          <div className="font-bold text-black text-lg">Takeout</div>
        </div>
        
        {/* Toggle Switch */}
        <div className="relative">
          <button
            onClick={() => setIsTakeoutActive(!isTakeoutActive)}
            className={`w-12 h-6 rounded-full transition-all duration-200 ${
              isTakeoutActive ? 'bg-[#71B314]' : 'bg-gray-300'
            }`}
            style={{
              boxShadow: isTakeoutActive ? '0 0.754px 0 0 rgba(0, 0, 0, 0.15) inset' : 'none'
            }}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-200 transform ${
              isTakeoutActive ? 'translate-x-6' : 'translate-x-0.5'
            }`}></div>
          </button>
        </div>
      </div>

      {/* Total Quote Time Display */}
      <div className="bg-gray-100 rounded-lg p-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="font-bold text-black">Total quote time = {quoteTime + delayTime} min</div>
          <img src="/Info.png" alt="info" className="w-5 h-5" />
        </div>
      </div>

      {/* Quote Time Configuration */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div
            className={sourceSans.className}
            style={{
              color: '#666',
              fontFeatureSettings: "'liga' off, 'clig' off",
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '24px',
              letterSpacing: '0.2px'
            }}
          >
            Quote time
          </div>
          <select 
            value={quoteTime} 
            onChange={(e) => setQuoteTime(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={15}>15 min</option>
            <option value={20}>20 min</option>
            <option value={25}>25 min</option>
            <option value={30}>30 min</option>
          </select>
        </div>
        <div className="text-gray-500 text-sm">Strategy: Manual</div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 mb-2"></div>

      {/* Add Delay Configuration */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div
            className={sourceSans.className}
            style={{
              color: '#666',
              fontFeatureSettings: "'liga' off, 'clig' off",
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '24px',
              letterSpacing: '0.2px'
            }}
          >
            Add delay
          </div>
          <div className="text-gray-600">+{delayTime} min</div>
        </div>
        
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max="30"
            value={delayTime}
            onChange={(e) => setDelayTime(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 100px;
              background: #FFF;
              box-shadow: 0 0.5px 4px 0 rgba(0, 0, 0, 0.12), 0 6px 13px 0 rgba(0, 0, 0, 0.12);
              cursor: pointer;
            }
            .slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 100px;
              background: #FFF;
              box-shadow: 0 0.5px 4px 0 rgba(0, 0, 0, 0.12), 0 6px 13px 0 rgba(0, 0, 0, 0.12);
              cursor: pointer;
            }
          `}</style>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2 overflow-y-auto flex-1 pr-2">
        {pickup.map((p, index) => {
          const check = getCheckDetails(p.checkId);
          return (
            <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-2 transition-all duration-200">
              <div className="flex items-center">
                {/* Left Section - Order Number + T-OUT Badge */}
                <div className="flex flex-col items-center justify-center w-16">
                  <div className="text-lg font-bold text-gray-900 mb-1">{p.checkId.replace('Ch. #', '')}</div>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img 
                      src={parseInt(p.id.slice(1)) % 2 === 0 ? "/takeout.png" : "/Delivery.png"} 
                      alt="service type" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                {/* Middle Section - Guest Info + Check Details + Started Time */}
                <div className="flex-1 px-3 border-l border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-0.5">
                    {check?.guestName || generateGuestName(p.checkId)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span className="whitespace-nowrap">Started {check ? new Date(check.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:45'}</span>
                  </div>
                </div>
                
                {/* Right Section - Amount */}
                <div className="text-right w-20">
                  <div className="text-lg font-bold text-gray-900">
                    ${check?.amountUsd.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {!pickup.length && (
          <div className="text-center py-6 text-gray-400">
            <img src="/orange_takout.png" alt="takeout" className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <div className="text-sm">No takeout orders</div>
          </div>
        )}
      </div>
    </div>
  );
} 