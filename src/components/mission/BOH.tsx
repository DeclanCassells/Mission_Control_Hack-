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
            <div className="flex gap-3">
              {/* Ready Tickets - Left Column */}
              <div className="w-72 shrink-0">
                <div className="text-sm font-semibold text-gray-500 mb-2">Ready Orders</div>
                <div className="space-y-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                  {inProg
                    .sort((a, b) => a.openedAt - b.openedAt) // Sort by oldest first
                    .map((ticket) => (
                      <EnhancedTicketCard
                        key={ticket.id}
                        ticket={ticket}
                        urgency={getTicketUrgency(ticket)}
                        timeElapsed={getTimeElapsed(ticket)}
                        onMarkReady={() => fulfillTicket(ticket.id)}
                      />
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
  
  // Generate random 8-hour shift for BOH staff (same logic as FOH)
  const getShiftTimes = useMemo(() => {
    const hash = member.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Possible start times: 11:00, 11:30, 12:00, 12:30, 1:00, 1:30, 2:00, 2:30, 3:00, 3:30, 4:00
    const startOptions = [
      { hour: 11, minute: 0 },   // 11:00 AM
      { hour: 11, minute: 30 },  // 11:30 AM
      { hour: 12, minute: 0 },   // 12:00 PM
      { hour: 12, minute: 30 },  // 12:30 PM
      { hour: 13, minute: 0 },   // 1:00 PM
      { hour: 13, minute: 30 },  // 1:30 PM
      { hour: 14, minute: 0 },   // 2:00 PM
      { hour: 14, minute: 30 },  // 2:30 PM
      { hour: 15, minute: 0 },   // 3:00 PM
      { hour: 15, minute: 30 },  // 3:30 PM
      { hour: 16, minute: 0 },   // 4:00 PM
    ];
    
    const startTime = startOptions[Math.abs(hash) % startOptions.length];
    
    // Calculate end time (8 hours later)
    const endHour = startTime.hour + 8;
    const endMinute = startTime.minute;
    
    // Format times
    const formatTime = (hour: number, minute: number) => {
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const minuteStr = minute === 0 ? ':00' : `:${minute}`;
      return `${hour12}${minuteStr} ${ampm}`;
    };
    
    return {
      start: formatTime(startTime.hour, startTime.minute),
      end: formatTime(endHour, endMinute)
    };
  }, [member.id]);
  // Map BOH staff names to avatar images
  const getAvatarPath = (staffName: string): string => {
    const nameMap: Record<string, string> = {
      "Maria Lopez": "/avatars/chef1.png",
      "James Wu": "/avatars/chef2.png",
      "Priya Singh": "/avatars/dishwasher1.png"
    };
    return nameMap[staffName] || "/avatars/newemployee.png";
  };

  // Determine status and styling based on overtime
  const getStaffStatus = () => {
    if (member.overtimeMinutes > 0) return "OVERTIME";
    if (member.overtimeMinutes < 0) return "Approaching Overtime";
    return "Clocked in";
  };

  const getStatusStyle = () => {
    if (member.overtimeMinutes > 0) return { color: '#C62828' };
    return {};
  };

  const getBorderColor = () => {
    if (member.overtimeMinutes > 0) return "border-red-500 border-pulse-red";
    if (member.overtimeMinutes < 0) return "border-orange-500 border-pulse-orange";
    return "border-[#C2BBA3]";
  };

  const getStatusColor = () => {
    if (member.overtimeMinutes > 0) return "text-red-600";
    if (member.overtimeMinutes < 0) return "text-orange-600";
    return "text-[#C26E00]";
  };

  return (
    <div className="w-80 shrink-0">
      <div className={`rounded-lg border ${getBorderColor()} bg-white ${member.overtimeMinutes === 0 ? 'shadow-sm' : ''} p-3`}>
        
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
            animation: border-pulse-orange 4s ease-in-out infinite;
            position: relative;
          }
        `}</style>

        {/* Header with avatar, name, and status */}
        <div className="flex items-center gap-2 mb-2">
          <ServerAvatar name={member.name} size="40" useAI={false} avatarPath={getAvatarPath(member.name)} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[#1A1A1A] text-sm">{member.name}</div>
            <div className="text-xs text-[#6B6B6B] flex items-center gap-1">
              <span className="capitalize">{member.role}</span>
              <span className="w-1 h-1 bg-[#C26E00] rounded-full"></span>
              <span className="font-medium" style={member.overtimeMinutes > 0 ? getStatusStyle() : { color: '#6B6B6B' }}>{getStaffStatus()}</span>
            </div>
          </div>
        </div>

        {/* Clock info - matching FOH design */}
        <div className="mb-2 p-2 bg-[#F8F7F4] rounded border border-[#E8E6DD]">
          {/* Top row: Total hours and scheduled time */}
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1">
              <span className="text-[#6B6B6B] font-medium">
                {Math.floor((Date.now() - member.clockInAt) / (1000 * 60 * 60))}h
              </span>
            </div>
            <div className="flex items-center gap-1">
              <img src="/clock.png" alt="clock" className="w-3 h-3" />
              <span className="font-medium text-[#1A1A1A]">
                {getShiftTimes.start}-{getShiftTimes.end}
              </span>
            </div>
          </div>
          
          {/* Bottom row: Status and hourly wage */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[#6B6B6B] font-medium">${member.hourlyWageUsd}/hr</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#1A1A1A] font-medium">{getStaffStatus()}</span>
            </div>
          </div>
        </div>

        {/* Performance metrics - simplified for BOH */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-[#F8F7F4] rounded border border-[#E8E6DD]">
            <div className="font-bold text-[#1A1A1A]">
              {member.overtimeMinutes > 0 ? `+${Math.floor(member.overtimeMinutes / 60)}h` : "0h"}
            </div>
            <div className="text-[#6B6B6B]">Overtime</div>
          </div>
          <div className="text-center p-2 bg-[#F8F7F4] rounded border border-[#E8E6DD]">
            <div className="font-bold text-[#1A1A1A]">
              ${(member.hourlyWageUsd * Math.floor((Date.now() - member.clockInAt) / (1000 * 60 * 60))).toFixed(2)}
            </div>
            <div className="text-[#6B6B6B]">Today</div>
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