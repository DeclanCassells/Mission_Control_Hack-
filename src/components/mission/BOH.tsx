"use client";

import { useMissionStore } from "@/lib/missionStore";
import { useState, useEffect, useMemo } from "react";
import type { StaffMember, Ticket, LineItem } from "@/types/mission";
import { ServerAvatar } from "./ServerAvatar";

export function BOH() {
  const { tickets, fulfillTicket, bohStaff, servers } = useMissionStore();
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [readyTicketTimers, setReadyTicketTimers] = useState<Record<string, number>>({});
  
  // Calculate total clocked-in staff
  const totalClockedInStaff = useMemo(() => {
    return servers.length + bohStaff.length;
  }, [servers.length, bohStaff.length]);

  const sorted = [...tickets].sort((a, b) => a.openedAt - b.openedAt);
  const ready = sorted.filter((t) => t.state === "ready");
  const inProg = sorted.filter((t) => t.state === "in-progress");

  // Update current time every second for live counters
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate timing for urgency and auto-transition
  const getTicketUrgency = (ticket: Ticket) => {
    const minutesOpen = (currentTime - ticket.openedAt) / (1000 * 60);
    if (minutesOpen > 2) return "urgent";
    if (minutesOpen > 1.5) return "warning";
    return "normal";
  };

  const getTimeElapsed = (ticket: Ticket) => {
    const minutes = Math.floor((currentTime - ticket.openedAt) / (1000 * 60));
    const seconds = Math.floor(((currentTime - ticket.openedAt) % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Auto-transition tickets to ready after 1-2 minutes (more realistic timing)
  useEffect(() => {
    const now = Date.now();
    inProg.forEach(ticket => {
      const minutesOpen = (now - ticket.openedAt) / (1000 * 60);
      // Keep tickets open for 1-2 minutes before moving to ready
      if (minutesOpen >= 1.5 + (Math.random() * 0.5)) { // Random time between 1.5-2.0 minutes
        fulfillTicket(ticket.id);
      }
    });
  }, [currentTime, inProg, fulfillTicket]);

  // Handle ready ticket fade-out over 10 seconds
  useEffect(() => {
    ready.forEach(ticket => {
      if (!readyTicketTimers[ticket.id]) {
        // Start 10-second timer for this ready ticket
        setReadyTicketTimers(prev => ({
          ...prev,
          [ticket.id]: Date.now()
        }));
      }
    });

    // Clean up ready tickets after 10 seconds
    const now = Date.now();
    Object.entries(readyTicketTimers).forEach(([ticketId, startTime]) => {
      if (now - startTime >= 10000) { // 10 seconds
        // Remove the timer and the ticket will disappear from the ready list
        setReadyTicketTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[ticketId];
          return newTimers;
        });
      }
    });
  }, [ready, readyTicketTimers]);

  // Filter ready tickets to only show those still in their 10-second window
  const visibleReadyTickets = ready.filter(ticket => {
    const startTime = readyTicketTimers[ticket.id];
    if (!startTime) return false;
    return (Date.now() - startTime) < 10000; // Only show if less than 10 seconds old
  });

  return (
    <div className="flex flex-col h-full">
      {/* Top Row - BOH Staff Details + Today's Metrics */}
      <div className="border-b bg-white">
        <div className="px-6 py-4">
          <div className="flex gap-6">
            {/* BOH Staff Cards */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {bohStaff.map((member) => (
                <BOHStaffCard key={member.id} member={member} totalClockedInStaff={totalClockedInStaff} />
              ))}
            </div>
            
            {/* Today's Metrics Card */}
            <div className="shrink-0">
              <div className="bg-white rounded-lg border border-slate-200 p-4 w-80">
                <h4 className="font-semibold text-slate-900 mb-3">Today&apos;s Metrics</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Avg Prep Time:</span>
                    <span className="font-medium">12.5 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Orders/Hour:</span>
                    <span className="font-medium">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Efficiency:</span>
                    <span className="font-medium text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Quality Score:</span>
                    <span className="font-medium text-blue-600">4.8/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Kitchen Tickets */}
      <div className="flex flex-1 overflow-hidden">

        
        {/* Right Side - Kitchen Tickets */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F0F0F2' }}>
          <div className="p-6">
            {/* Kitchen Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                              {/* Station Filter */}
              <div className="flex gap-1 p-1 rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
                {["all", "hot", "cold", "grill", "fryer"].map((station) => (
                  <button
                    key={station}
                    onClick={() => setSelectedStation(station)}
                    className={`flex-1 px-4 py-2 text-xs rounded-lg border transition-all duration-200 ${
                      selectedStation === station
                        ? "bg-white border-gray-300 shadow-sm text-gray-900 font-bold"
                        : "bg-transparent border-transparent hover:bg-white hover:border-gray-200 text-gray-600 hover:text-gray-900 font-medium"
                    }`}
                  >
                    {station.charAt(0).toUpperCase() + station.slice(1)}
                  </button>
                ))}
              </div>
                
                {/* Order Counters */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Active Orders:</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
                    {inProg.length}
                  </span>
                  <span className="text-sm text-slate-500 ml-4">Ready:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-bold">
                    {visibleReadyTickets.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Tickets Grid */}
            <div className="flex gap-8">
              {/* Ready Tickets - Left Column */}
              <div className="w-72 shrink-0">
                <div className="text-sm font-semibold text-gray-500 mb-2">Ready Orders</div>
                <div className="space-y-4">
                  {visibleReadyTickets.map((ticket) => (
                    <ReadyTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      timeElapsed={getTimeElapsed(ticket)}
                      startTime={readyTicketTimers[ticket.id] || 0}
                    />
                  ))}
                </div>
              </div>
              
              {/* In Progress Tickets - Grid Layout */}
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-500 mb-2">Open Orders</div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {inProg
                    .sort((a, b) => a.openedAt - b.openedAt) // Sort by oldest first
                    .map((ticket) => (
                      <div key={ticket.id}>
                        <EnhancedTicketCard
                          ticket={ticket}
                          urgency={getTicketUrgency(ticket)}
                          timeElapsed={getTimeElapsed(ticket)}
                          onMarkReady={() => fulfillTicket(ticket.id)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// BOH Staff Card - Matching FOH Server Card Design
function BOHStaffCard({ member, totalClockedInStaff }: { member: StaffMember; totalClockedInStaff: number }) {
  return (
    <div className="shrink-0">
      <div className="bg-white rounded-lg border border-slate-200 p-4 w-64">
        {/* Header with avatar and name */}
        <div className="flex items-center gap-3 mb-3">
          <ServerAvatar name={member.name} size="40" useAI={false} avatarPath={`/avatars/${member.role.toLowerCase()}1.png`} />
          <div>
            <div className="font-bold text-[#1A1A1A]">{member.name}</div>
            <div className="text-xs text-[#6B6B6B] flex items-center gap-1">
              <span>{member.role}</span>
              <span className="w-1 h-1 bg-[#C26E00] rounded-full"></span>
              <span className="text-[#C26E00] font-medium">On Duty</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-[#F8F7F4] rounded border border-[#E8E6DD] p-2">
            <div className="font-bold text-[#C26E00]">${member.hourlyWageUsd}/hr</div>
            <div className="text-[10px] text-[#6B6B6B] font-medium">Wage</div>
          </div>
          <div className="bg-[#F8F7F4] rounded border border-[#E8E6DD] p-2">
            <div className="font-bold text-[#C26E00]">{totalClockedInStaff}</div>
            <div className="text-[10px] text-[#6B6B6B] font-medium">Staff On Duty</div>
          </div>
        </div>
      </div>
    </div>
  );
}



// Enhanced Ticket Card - KDS Style
function EnhancedTicketCard({ 
  ticket, 
  urgency, 
  timeElapsed, 
  onMarkReady, 
  isReady = false 
}: { 
  ticket: Ticket; 
  urgency: string; 
  timeElapsed: string; 
  onMarkReady: () => void;
  isReady?: boolean;
}) {
  // Get header color based on service type and urgency
  const getHeaderColor = () => {
    if (isReady) return "bg-green-500"; // Green for ready orders
    
    switch (urgency) {
      case "urgent": return "bg-red-500"; // Red for urgent
      case "warning": return "bg-orange-500"; // Orange for warning
      default: return "bg-gray-600"; // Dark gray for normal
    }
  };

  // Get header text based on ticket type
  const getHeaderText = () => {
    if (ticket.serviceType === "dine-in" && ticket.tableNumber) {
      return `Table ${ticket.tableNumber}`;
    } else if (ticket.serviceType === "takeout") {
      return "Pick Up";
    } else if (ticket.serviceType === "delivery") {
      return "Delivery";
    }
    return `#${ticket.id}`;
  };

  // Get sub-header text
  const getSubHeaderText = () => {
    if (ticket.serviceType === "dine-in") {
      return "DINE IN";
    } else if (ticket.serviceType === "takeout") {
      return "TAKEOUT";
    } else {
      return "DELIVERY";
    }
  };

  // Categorize items by type
  const categorizedItems = ticket.items.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, LineItem[]>);

  return (
    <div className="w-72 shrink-0">
      <div className="rounded-t-lg overflow-hidden">
        {/* Header - Colored background with ticket info */}
        <div className={`${getHeaderColor()} text-white p-3`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-lg">{getHeaderText()}</div>
              <div className="text-sm opacity-90">{getSubHeaderText()}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{timeElapsed}</div>
              <div className="text-xs opacity-75">#{ticket.id}</div>
            </div>
          </div>
        </div>

        {/* Body - White background with order details */}
        <div className="bg-white p-3">
          {/* Categorized Items */}
          {Object.entries(categorizedItems).map(([category, items]) => (
            <div key={category} className="mb-2 last:mb-0">
              {/* Category Header */}
              <div className="bg-gray-100 px-2 py-1 mb-1 rounded">
                <div className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                  {getCategoryIcon(category)} {category}
                </div>
              </div>
              
              {/* Items in this category */}
              <div className="space-y-1">
                {items.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    {/* Main item */}
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-gray-900 min-w-[20px]">{item.quantity}</span>
                      <span className="text-gray-900 flex-1">{item.name}</span>
                      <span className="text-gray-500 text-xs">${item.priceUsd.toFixed(2)}</span>
                    </div>
                    
                    {/* Modifiers/Notes - if we had them, they'd go here */}
                    {/* Example: <div className="text-xs text-blue-600 ml-6">- Extra cheese</div> */}
                  </div>
                ))}
              </div>
            </div>
          ))}


        </div>
      </div>
    </div>
  );
}

// Ready Ticket Card - Specific for fade-out effect
function ReadyTicketCard({ ticket, timeElapsed, startTime }: { ticket: Ticket, timeElapsed: string, startTime: number }) {
  const fadeOutTime = 10000; // 10 seconds
  const timeLeft = fadeOutTime - (Date.now() - startTime);

  if (timeLeft <= 0) {
    return null; // Hide if expired
  }

  return (
    <EnhancedTicketCard
      ticket={ticket}
      urgency="ready"
      timeElapsed={timeElapsed}
      onMarkReady={() => {}} // No action on ready for this specific card
      isReady={true}
    />
  );
}

// Helper function for category icons
function getCategoryIcon(category: string) {
  switch (category) {
    case "appetizers": return "";
    case "entrees": return "";
    case "sides": return "";
    case "drinks": return "";
    case "dessert": return "";
    default: return "";
  }
} 