"use client";

import { useState, useEffect } from "react";
import { useMissionStore } from "@/lib/missionStore";

interface EventMessage {
  id: string;
  message: string;
  timestamp: number;
}

export function ScrollingMessages() {
  const { servers, bohStaff } = useMissionStore();
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);

  // Generate random customer names
  const getRandomCustomerName = (): string => {
    const customerNames = [
      "Sarah Martinez", "Michael Johnson", "Emily Chen", "David Rodriguez", "Jessica Williams",
      "Alex Thompson", "Maria Garcia", "James Wilson", "Lisa Anderson", "Robert Taylor",
      "Amanda Davis", "Kevin Brown", "Jennifer Miller", "Ryan Clark", "Nicole White",
      "Christopher Lee", "Ashley Johnson", "Daniel Harris", "Michelle Lewis", "Andrew Martin",
      "Stephanie Moore", "Brandon Hall", "Rachel Adams", "Justin Walker", "Lauren Young"
    ];
    return customerNames[Math.floor(Math.random() * customerNames.length)];
  };

  // Generate star rating display
  const getStarRating = (rating: number): string => {
    const filledStars = "★".repeat(rating);
    const emptyStars = "☆".repeat(5 - rating);
    return filledStars + emptyStars;
  };

  // Generate random restaurant events
  const generateRandomEvent = (): string => {
    const allStaff = [...servers, ...bohStaff];
    if (allStaff.length === 0) return "Welcome to Toast Mission Control - Real-time restaurant events will appear here";

    const randomStaff = allStaff[Math.floor(Math.random() * allStaff.length)];
    const customerName = getRandomCustomerName();
    const tableNumber = Math.floor(Math.random() * 20) + 1;
    const starRating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
    const stars = getStarRating(starRating);
    const orderNumber = Math.floor(Math.random() * 9000) + 1000;
    
    // Menu items that can go out of stock
    const menuItems = [
      "Carne Asada", "Fish Tacos", "Guacamole", "Churros", "Margaritas", 
      "Cerveza Corona", "Chiles Rellenos", "Fajitas", "Carnitas", "Horchata",
      "Queso Fundido", "Enchiladas Verdes", "Pozole", "Tres Leches Cake"
    ];
    const randomMenuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
    
    const eventTypes = [
      // Staff achievements and upsells
      `${randomStaff.name} just made an upsell`,
      `${randomStaff.name} received a ${starRating}-star review from ${customerName} ${stars}`,
      `${randomStaff.name} completed a large party order for ${customerName}`,
      `${randomStaff.name} achieved 100% accuracy today`,
      `${randomStaff.name} processed a special dietary request for ${customerName}`,
      `${randomStaff.name} earned customer praise from table ${tableNumber}`,
      `${randomStaff.name} hit their sales target`,
      `${randomStaff.name} successfully handled a rush order`,
      `${randomStaff.name} received a generous tip from ${customerName}`,
      `Service excellence: ${randomStaff.name} earned ${getStarRating(5)} from ${customerName}`,
      
      // Customer reviews and feedback
      `${customerName} left a ${starRating}-star review ${stars}`,
      `${customerName} complimented ${randomStaff.name} on excellent service`,
      `Customer feedback: "Best service ever!" - ${customerName} ${getStarRating(5)}`,
      `Review alert: ${customerName} gave the restaurant ${starRating} stars ${stars}`,
      `${customerName} became a regular customer today`,
      `${customerName} requested to speak with the manager - to give compliments!`,
      
      // Orders and kitchen updates
      `New order: Table ${tableNumber} ordered the chef's special`,
      `Kitchen update: Prep time improved by 15%`,
      `Daily special: ${randomMenuItem} selling fast`,
      `Quality check: All dishes meeting standards`,
      `Rush hour: Peak efficiency maintained`,
      `Table ${tableNumber}: ${customerName} ordered the premium wine pairing`,
      `Birthday celebration: ${customerName} is celebrating at table ${tableNumber}`,
      `Staff milestone: ${randomStaff.name} completed 50 orders today`,
      `Achievement unlocked: Zero wait times this hour`,
      `Inventory alert: Fresh guacamole just prepared`,
      
      // TAKEOUT PICKUPS
      `Takeout order #${orderNumber} picked up by ${customerName}`,
      `${customerName} collected their takeout order - ${randomMenuItem}`,
      `Pickup complete: Order #${orderNumber} collected on time`,
      `${customerName} arrived for takeout pickup - Order ready`,
      `Express pickup: ${customerName} collected order in under 2 minutes`,
      `Takeout ready: ${customerName}'s order of ${randomMenuItem} collected`,
      
      // OUT OF STOCK ITEMS  
      `Alert: ${randomMenuItem} marked out of stock`,
      `Inventory update: ${randomMenuItem} temporarily unavailable`,
      `Kitchen alert: Last ${randomMenuItem} just served`,
      `Menu update: ${randomMenuItem} sold out for today`,
      `Stock alert: ${randomMenuItem} needs immediate restock`,
      `Chef note: ${randomMenuItem} unavailable until tomorrow`,
      `Popular item alert: ${randomMenuItem} completely sold out`,
      
      // DELIVERY DELAYS (orders sitting 10+ minutes)
      `Delivery alert: Order #${orderNumber} waiting 12 minutes for pickup`,
      `Driver needed: ${customerName}'s delivery sitting for 15 minutes`,
      `Delivery delay: Order #${orderNumber} ready but no driver available`,
      `Priority delivery: Order for ${customerName} waiting 18 minutes`,
      `Dispatch alert: Multiple orders waiting over 10 minutes`,
      `Delivery backup: ${randomMenuItem} order sitting 14 minutes`,
      `Driver shortage: ${customerName}'s order delayed 20 minutes`,
      `Rush delivery needed: Order #${orderNumber} waiting 16 minutes`,
      
      // Additional variety
      `Peak hour efficiency: All stations running smoothly`,
      `Customer loyalty: ${customerName} visits 3x per week`,
      `Dietary accommodation: Gluten-free ${randomMenuItem} prepared`,
      `Team achievement: 100% on-time delivery rate this hour`,
      `Special request: ${customerName} asked for extra spicy ${randomMenuItem}`,
      `VIP guest: ${customerName} reserved the chef's table`,
      `Feedback received: "${randomMenuItem} was absolutely perfect!" - ${customerName}`,
      `Staff recognition: ${randomStaff.name} nominated for employee of the month`,
      `Kitchen innovation: New ${randomMenuItem} recipe tested successfully`,
      `Customer satisfaction: ${customerName} praised the quick service`
    ];

    return eventTypes[Math.floor(Math.random() * eventTypes.length)];
  };

  // Initialize with messages and set up synchronized timing
  useEffect(() => {
    // Add initial messages
    if (servers.length > 0 && messages.length === 0) {
      const initialMessages: EventMessage[] = [
        {
          id: "1",
          message: "Alex Kim just made an upsell",
          timestamp: Date.now()
        },
        {
          id: "2", 
          message: "Sarah Martinez left a 5-star review ★★★★★",
          timestamp: Date.now() - 5000
        },
        {
          id: "3",
          message: "Takeout order #1234 picked up by Michael Johnson",
          timestamp: Date.now() - 10000
        },
        {
          id: "4",
          message: "Alert: Carne Asada marked out of stock",
          timestamp: Date.now() - 15000
        },
        {
          id: "5",
          message: "Delivery alert: Order #5678 waiting 15 minutes for pickup",
          timestamp: Date.now() - 20000
        }
      ];
      setMessages(initialMessages);
    }

    // Set up synchronized timing - new messages only appear when scroll completes
    const addNewMessage = () => {
      const newMessage: EventMessage = {
        id: Date.now().toString(),
        message: generateRandomEvent(),
        timestamp: Date.now()
      };

      setMessages(prev => {
        const updated = [...prev, newMessage];
        // Keep only the last 8 messages for more content
        return updated.slice(-8);
      });
    };

    // Add new message every 60 seconds (synchronized with scroll duration)
    const interval = setInterval(addNewMessage, 60000);

    return () => clearInterval(interval);
  }, [servers, bohStaff, messages.length]);

  return (
    <div className="bg-black border-t-8 border-b-8 border-black overflow-hidden flex items-center" style={{ height: '60px' }}>
      <div className="w-full">
        <div className="animate-scroll whitespace-nowrap">
          {messages.map((msg, index) => (
            <span key={msg.id} className="inline-block text-white text-lg font-medium mr-16">
              {msg.message}
              {index < messages.length - 1 && (
                <span className="mx-8 text-orange-400">•</span>
              )}
            </span>
          ))}
          {messages.length === 0 && (
            <span className="text-white text-lg font-medium">
              Welcome to Toast Mission Control - Real-time restaurant events will appear here
            </span>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  );
} 