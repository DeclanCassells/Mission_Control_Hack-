"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  Check,
  LineItem,
  MissionMetrics,
  PickupOrder,
  StaffMember,
  Ticket,
} from "@/types/mission";

interface MissionStoreValue {
  servers: StaffMember[];
  bohStaff: StaffMember[];
  checksByServerId: Record<string, Check[]>;
  pickup: PickupOrder[];
  tickets: Ticket[];
  metrics: MissionMetrics;
  laborCostHistory: {timestamp: number, value: number}[];
  netSalesHistory: {timestamp: number, value: number}[];
  laborPercentHistory: {timestamp: number, value: number}[];
  view: "foh" | "boh";
  setView: (view: "foh" | "boh") => void;
  serverCardsExpanded: boolean;
  toggleServerCardsExpanded: () => void;
  closeCheck: (checkId: string) => void;
  fulfillTicket: (ticketId: string) => void;
  addPickupOrder: (order: PickupOrder) => void;
  addCheck: (check: Check) => void;
  markCheckAsPaid: (checkId: string) => void;
  createNewCheck: (serverId: string) => void;
  search: (query: string) => { check: Check; server?: StaffMember }[];
}

const MissionStoreContext = createContext<MissionStoreValue | null>(null);

function uuid(): string {
  try {
    // @ts-ignore - runtime guard
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {}
  return Math.random().toString(36).slice(2);
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dollars(n: number): number {
  return Math.round(n * 100) / 100;
}

function generateItems(): LineItem[] {
  const menu: Array<[string, number, LineItem["category"]]> = [
    // Appetizers
    ["Guacamole & Chips", 12, "appetizers"],
    ["Queso Fundido", 14, "appetizers"],
    ["Ceviche", 18, "appetizers"],
    ["Tacos de Papa", 16, "appetizers"],
    ["Enchiladas Verdes", 22, "appetizers"],
    
    // Entrees
    ["Carne Asada", 32, "entrees"],
    ["Pescado Veracruzano", 28, "entrees"],
    ["Pollo en Mole", 26, "entrees"],
    ["Enchiladas Rojas", 24, "entrees"],
    ["Tacos de Carnitas", 20, "entrees"],
    ["Chiles Rellenos", 22, "entrees"],
    ["Fajitas Mixtas", 30, "entrees"],
    
    // Sides
    ["Arroz Mexicano", 8, "sides"],
    ["Frijoles Refritos", 7, "sides"],
    ["Ensalada Verde", 9, "sides"],
    ["Tortillas de Maíz", 4, "sides"],
    
    // Drinks
    ["Horchata", 5, "drinks"],
    ["Jamaica", 5, "drinks"],
    ["Agua Fresca", 4, "drinks"],
    ["Cerveza", 7, "drinks"],
    ["Margarita", 12, "drinks"],
    ["Tequila Shot", 8, "drinks"]
  ];
  
  const count = 1 + Math.floor(Math.random() * 4);
  const items: LineItem[] = [];
  for (let i = 0; i < count; i++) {
    const [name, price, category] = randomChoice(menu);
    items.push({ id: uuid(), name, priceUsd: price, quantity: 1 + (Math.random() < 0.2 ? 1 : 0), category });
  }
  return items;
}

function itemsTotalUsd(items: LineItem[]): number {
  return dollars(items.reduce((acc, it) => acc + it.priceUsd * it.quantity, 0));
}

// Global set to track used table numbers for open tickets
let usedTableNumbers = new Set<number>();

function getUniqueTableNumber(): number {
  const availableNumbers = [];
  for (let i = 1; i <= 40; i++) {
    if (!usedTableNumbers.has(i)) {
      availableNumbers.push(i);
    }
  }
  
  if (availableNumbers.length === 0) {
    // If all tables are taken, reset and start over
    usedTableNumbers.clear();
    return Math.floor(Math.random() * 40) + 1;
  }
  
  const tableNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
  usedTableNumbers.add(tableNumber);
  return tableNumber;
}

function generateGuestName(): string {
  const guestNames = [
    "Sarah Martinez", "Michael Johnson", "Emily Chen", "David Rodriguez", "Jessica Williams",
    "Alex Thompson", "Maria Garcia", "James Wilson", "Lisa Anderson", "Robert Taylor",
    "Amanda Davis", "Kevin Brown", "Jennifer Miller", "Ryan Clark", "Nicole White",
    "Christopher Lee", "Ashley Johnson", "Daniel Harris", "Michelle Lewis", "Andrew Martin",
    "Stephanie Moore", "Brandon Hall", "Rachel Adams", "Justin Walker", "Lauren Young",
    "Thomas Green", "Kimberly Scott", "Matthew Turner", "Samantha Parker", "Jonathan Evans"
  ];
  
  return guestNames[Math.floor(Math.random() * guestNames.length)];
}

function createCheck(server: StaffMember, service: "dine-in" | "takeout"): Check {
  const items = generateItems();
  const amount = itemsTotalUsd(items);
  const now = Date.now();
  const id = `Ch. #${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    id,
    amountUsd: amount,
    openedAt: now,
    status: "open",
    serviceType: service,
    tableNumber: service === "dine-in" ? getUniqueTableNumber() : undefined,
    quoteTimeMinutes: service === "takeout" ? 15 : undefined,
    serverId: service === "dine-in" ? server.id : undefined,
    guestName: generateGuestName(),
    guests: 1 + Math.floor(Math.random() * 4),
    items,
  };
}

function createTicketFromCheck(check: Check): Ticket {
  return {
    id: `#${Math.floor(4000 + Math.random() * 500)}`,
    checkId: check.id,
    serviceType: check.serviceType,
    tableNumber: check.tableNumber,
    items: check.items,
    openedAt: check.openedAt,
    state: "in-progress",
  };
}

function initialStaff(): { servers: StaffMember[]; boh: StaffMember[] } {
  const now = Date.now() - 60 * 60 * 1000; // clocked in an hour ago
  const servers: StaffMember[] = [
    { id: "s1", name: "Alex Kim", role: "server", hourlyWageUsd: 16, clockInAt: now, tipsUsd: 130, salesUsd: 650, slph: 35.2, voids: 1, discounts: 2, overtimeMinutes: -15 },
    { id: "s2", name: "Jamie Lee", role: "server", hourlyWageUsd: 15, clockInAt: now, tipsUsd: 80, salesUsd: 425, slph: 28.4, voids: 0, discounts: 1, overtimeMinutes: 0 },
    { id: "s3", name: "Morgan Patel", role: "server", hourlyWageUsd: 18, clockInAt: now, tipsUsd: 150, salesUsd: 785, slph: 40.1, voids: 2, discounts: 3, overtimeMinutes: 30 },
    { id: "s4", name: "Riley Jones", role: "server", hourlyWageUsd: 14, clockInAt: now, tipsUsd: 45, salesUsd: 320, slph: 22.8, voids: 0, discounts: 1, overtimeMinutes: 0 },
  ];
  const boh: StaffMember[] = [
    { id: "b1", name: "Maria Lopez", role: "chef", hourlyWageUsd: 20, clockInAt: now, tipsUsd: 0, salesUsd: 0, slph: 0, voids: 0, discounts: 0, overtimeMinutes: 0 },
    { id: "b2", name: "James Wu", role: "sous-chef", hourlyWageUsd: 18, clockInAt: now, tipsUsd: 0, salesUsd: 0, slph: 0, voids: 0, discounts: 0, overtimeMinutes: 0 },
    { id: "b3", name: "Priya Singh", role: "dishwasher", hourlyWageUsd: 16, clockInAt: now, tipsUsd: 0, salesUsd: 0, slph: 0, voids: 0, discounts: 0, overtimeMinutes: 0 },
  ];
  return { servers, boh };
}

function computeMetrics(servers: StaffMember[], boh: StaffMember[], checksByServerId: Record<string, Check[]>, laborCostUsd: number): MissionMetrics {
  const allChecks = Object.values(checksByServerId).flat();
  const closed = allChecks.filter((c) => c.status === "closed");
  const netSalesUsd = dollars(closed.reduce((acc, c) => acc + c.amountUsd, 0));
  
  // 1. Checks should be a count of total checks (not just closed)
  const totalChecks = allChecks.length;
  
  // 2. Guests is a count of total guests from all order cards (not just closed)
  const guests = allChecks.reduce((acc, c) => acc + c.guests, 0);
  
  // 3. Voids is a count of voids from the server cards (already correct)
  const voids = servers.reduce((acc, s) => acc + s.voids, 0);
  
  const discounts = servers.reduce((acc, s) => acc + s.discounts, 0);
  
  // 4. Overtime is a count of hours based on servers in overtime (only positive overtime, converted to hours)
  const overtimeHours = servers.reduce((acc, s) => acc + Math.max(0, s.overtimeMinutes), 0) / 60;
  
  // 5. Average check should be the average value of all checks
  const averageCheckSizeUsd = allChecks.length > 0 ? dollars(allChecks.reduce((acc, c) => acc + c.amountUsd, 0) / allChecks.length) : 0;

  return {
    netSalesUsd,
    laborCostUsd: dollars(laborCostUsd),
    availableForInstantDepositUsd: 0,
    totalChecks,
    guests,
    voids,
    refunds: 0,
    discounts,
    overtimeMinutes: Math.round(overtimeHours), // Display as hours (rounded)
    averageCheckSizeUsd,
    // 6. Clocked in is a count of FOH and BOH staff on page
    clockedInStaffCount: servers.length + boh.length,
  };
}

export function MissionStoreProvider({ children }: { children: React.ReactNode }) {
  const [servers, setServers] = useState<StaffMember[]>([]);
  const [boh, setBoh] = useState<StaffMember[]>([]);
  const [checksByServerId, setChecksByServerId] = useState<Record<string, Check[]>>({});
  const [pickup, setPickup] = useState<PickupOrder[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [laborCostUsd, setLaborCostUsd] = useState<number>(340);
  const [netSalesHistory, setNetSalesHistory] = useState<{timestamp: number, value: number}[]>([]);
  const [laborPercentHistory, setLaborPercentHistory] = useState<{timestamp: number, value: number}[]>([]);
  const [laborCostHistory, setLaborCostHistory] = useState<{timestamp: number, value: number}[]>(() => {
    // Generate realistic historical data for the last 33 minutes (100 points * 20 seconds)
    const history = [];
    const startTime = Date.now() - (100 * 20 * 1000); // 33+ minutes ago
    let currentValue = 340;
    
    for (let i = 0; i < 100; i++) {
      const timestamp = startTime + (i * 20 * 1000);
      const time = new Date(timestamp);
      const hour = time.getHours();
      const minute = time.getMinutes();
      
      // Simulate past rush patterns and variations
      let rushMultiplier = 1;
      if ((hour === 11 && minute >= 30) || (hour >= 12 && hour <= 14) || (hour === 14 && minute <= 30)) {
        rushMultiplier = 1.2; // Lunch rush
      } else if ((hour === 17 && minute >= 30) || (hour >= 18 && hour <= 21) || (hour === 21 && minute <= 30)) {
        rushMultiplier = 1.3; // Dinner rush
      } else if (hour >= 15 && hour <= 16) {
        rushMultiplier = 0.8; // Slow afternoon
      } else if (hour >= 22 || hour <= 10) {
        rushMultiplier = 0.7; // Late night/early morning
      }
      
      // Add some random variation and occasional staff changes
      const randomFactor = 0.9 + (Math.random() * 0.2);
      const staffChange = Math.random() < 0.05 ? (Math.random() < 0.5 ? 0.85 : 1.15) : 1;
      
      const baseIncrement = 2.5; // Base rate per 20 seconds
      const increment = baseIncrement * rushMultiplier * randomFactor * staffChange;
      currentValue += increment;
      
      history.push({ timestamp, value: Math.max(340, currentValue) });
    }
    
    return history;
  });
  const [view, setView] = useState<"foh" | "boh">("foh");
  const [serverCardsExpanded, setServerCardsExpanded] = useState<boolean>(true);

  // Initialize on client only to avoid hydration mismatch
  useEffect(() => {
    const { servers: s, boh: b } = initialStaff();
    setServers(s);
    setBoh(b);
    const seed: Record<string, Check[]> = {};
    for (const srv of s) {
      const c1 = createCheck(srv, "dine-in");
      const c2 = createCheck(srv, "dine-in");
      seed[srv.id] = [c2, c1];
    }
    setChecksByServerId(seed);
    const all = Object.values(seed).flat();
    setTickets(all.map(createTicketFromCheck));
  }, []);

  // Labor ticks every 20 seconds
  useEffect(() => {
    if (!servers.length && !boh.length) return;
    const tick = () => {
      const baseRate = (servers.reduce((acc, s) => acc + s.hourlyWageUsd / 60, 0) + boh.reduce((acc, s) => acc + s.hourlyWageUsd / 60, 0)) / 3;
      
      // Add realistic variations based on time and random factors
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Rush hour multipliers (lunch: 11:30-2:30, dinner: 5:30-9:30)
      let rushMultiplier = 1;
      if ((hour === 11 && minute >= 30) || (hour >= 12 && hour <= 14) || (hour === 14 && minute <= 30)) {
        rushMultiplier = 1.2; // Lunch rush
      } else if ((hour === 17 && minute >= 30) || (hour >= 18 && hour <= 21) || (hour === 21 && minute <= 30)) {
        rushMultiplier = 1.3; // Dinner rush
      } else if (hour >= 15 && hour <= 16) {
        rushMultiplier = 0.8; // Slow afternoon
      } else if (hour >= 22 || hour <= 10) {
        rushMultiplier = 0.7; // Late night/early morning
      }
      
      // Random variations (staff breaks, overtime, efficiency changes)
      const randomFactor = 0.9 + (Math.random() * 0.2); // ±10% variation
      
      // Occasional staff changes (5% chance each tick)
      let staffChangeMultiplier = 1;
      if (Math.random() < 0.05) {
        staffChangeMultiplier = Math.random() < 0.5 ? 0.85 : 1.15; // Staff leaving or joining
      }
      
      const adjustedRate = baseRate * rushMultiplier * randomFactor * staffChangeMultiplier;
      const newValue = dollars(laborCostUsd + adjustedRate);
      setLaborCostUsd(newValue);
      
      // Update history (keep last 100 points to show trend over ~33 minutes)
      setLaborCostHistory(prev => {
        const newHistory = [...prev, { timestamp: Date.now(), value: newValue }];
        return newHistory.slice(-100); // Keep only last 100 points
      });
    };
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, [servers, boh, laborCostUsd]);

  // Add new checks every 30s
  useEffect(() => {
    if (!servers.length) return;
    const id = setInterval(() => {
      const server = randomChoice(servers);
      const service = Math.random() < 0.25 ? "takeout" : "dine-in";
      const newCheck = createCheck(server, service);
      setChecksByServerId((prev) => ({ ...prev, [server.id]: [newCheck, ...(prev[server.id] ?? [])] }));
      setTickets((prev) => [createTicketFromCheck(newCheck), ...prev]);
      if (service === "takeout") {
        setPickup((prev) => [
          { id: `P${100 + Math.floor(Math.random() * 900)}`, checkId: newCheck.id, quoteMinutes: newCheck.quoteTimeMinutes ?? 15, delayMinutes: 0, state: "active" },
          ...prev,
        ]);
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [servers]);

  // Simulate ticket fulfillment and auto fade 30s after ready
  useEffect(() => {
    const id = setInterval(() => {
      setTickets((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((t) => t.state === "in-progress");
        if (idx >= 0 && Math.random() < 0.7) {
          copy[idx] = { ...copy[idx], state: "ready", readyAt: Date.now() } as Ticket;
        }
        return copy.filter((t) => !(t.state === "ready" && (t as any).readyAt && Date.now() - (t as any).readyAt > 30_000));
      });
    }, 5_000);
    return () => clearInterval(id);
  }, []);

  // Auto-close checks every 20-40 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setChecksByServerId((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        
        for (const [serverId, checks] of Object.entries(next)) {
          if (serverId === "takeout") continue; // Skip takeout checks for now
          
          const updatedChecks = checks.map(check => {
            if (check.status === "open" && Math.random() < 0.2) { // 20% chance to mark as paid
              hasChanges = true;
              return { ...check, status: "paid" as const };
            } else if (check.status === "paid" && Math.random() < 0.4) { // 40% chance to close paid checks
              hasChanges = true;
              return { ...check, status: "closed" as const };
            }
            return check;
          });
          
          if (hasChanges) {
            next[serverId] = updatedChecks;
          }
        }
        
        return hasChanges ? next : prev;
      });
    }, 20000 + Math.random() * 20000); // Random interval between 20-40 seconds
    
    return () => clearInterval(id);
  }, []);

  // Ensure servers always have open checks (check every 10 seconds)
  useEffect(() => {
    const id = setInterval(() => {
      setChecksByServerId((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        
        for (const [serverId, checks] of Object.entries(next)) {
          if (serverId === "takeout") continue; // Skip takeout checks
          
          const openChecks = checks.filter(c => c.status === "open");
          if (openChecks.length === 0) {
            // Server has no open checks, create a new one
            const server = servers.find(s => s.id === serverId);
            if (server) {
              const newCheck = createCheck(server, "dine-in");
              next[serverId] = [newCheck, ...checks];
              hasChanges = true;
              
              // Also create a ticket for the new check
              setTickets((prev) => [createTicketFromCheck(newCheck), ...prev]);
            }
          }
        }
        
        return hasChanges ? next : prev;
      });
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(id);
  }, [servers]);

  function closeCheck(checkId: string) {
    setChecksByServerId((prev) => {
      const next: Record<string, Check[]> = {};
      for (const [sid, arr] of Object.entries(prev)) {
        next[sid] = arr.map((c) => {
          if (c.id === checkId) {
            // Free up table number when closing dine-in check
            if (c.serviceType === "dine-in" && c.tableNumber && c.status === "open") {
              usedTableNumbers.delete(c.tableNumber);
            }
            return { ...c, status: "closed" };
          }
          return c;
        });
      }
      return next;
    });
  }

  function fulfillTicket(ticketId: string) {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? ({ ...t, state: "ready", readyAt: Date.now() } as any) : t)));
  }

  function addPickupOrder(order: PickupOrder) {
    setPickup((prev) => [...prev, order]);
  }

  function addCheck(check: Check) {
    if (check.serverId && check.serverId !== "takeout") {
      // Regular server check
      setChecksByServerId((prev) => ({ ...prev, [check.serverId!]: [check, ...(prev[check.serverId!] ?? [])] }));
    } else {
      // Takeout order - store in a dedicated takeout section
      setChecksByServerId((prev) => ({ ...prev, takeout: [check, ...(prev.takeout ?? [])] }));
    }
    setTickets((prev) => [createTicketFromCheck(check), ...prev]);
  }

  function markCheckAsPaid(checkId: string) {
    setChecksByServerId((prev) => {
      const next: Record<string, Check[]> = {};
      for (const [sid, arr] of Object.entries(prev)) {
        next[sid] = arr.map((c) => (c.id === checkId ? { ...c, status: "paid" } : c));
      }
      return next;
    });
  }

  function createNewCheck(serverId: string) {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      const newCheck = createCheck(server, "dine-in");
      setChecksByServerId((prev) => ({ ...prev, [serverId]: [newCheck, ...(prev[serverId] ?? [])] }));
      setTickets((prev) => [createTicketFromCheck(newCheck), ...prev]);
    }
  }

  function search(query: string) {
    const q = query.trim().toLowerCase();
    const results: { check: Check; server?: StaffMember }[] = [];
    
    // Check if query is 4 digits (for last 4 search)
    const isLast4Search = /^\d{4}$/.test(q);
    
    for (const s of servers) {
      for (const c of checksByServerId[s.id] ?? []) {
        let match = false;
        
        if (isLast4Search) {
          // Search by last 4 digits of check ID
          const checkLast4 = c.id.replace(/\D/g, '').slice(-4);
          match = checkLast4 === q;
        } else {
          // Regular search by check ID, guest name, table number, or server name
          const hay = `${c.id} ${c.guestName ?? ""} ${c.tableNumber ?? ""} ${s.name} table ${c.tableNumber ?? ""}`.toLowerCase();
          match = hay.includes(q);
        }
        
        if (match) results.push({ check: c, server: s });
      }
    }
    
    for (const p of pickup) {
      // find associated check
      for (const arr of Object.values(checksByServerId)) {
        const c = arr.find((x) => x.id === p.checkId);
        if (c) {
          let match = false;
          
          if (isLast4Search) {
            // Search by last 4 digits of check ID
            const checkLast4 = c.id.replace(/\D/g, '').slice(-4);
            match = checkLast4 === q;
          } else {
            // Regular search by check ID and guest name
            const hay = `${c.id} ${c.guestName ?? ""}`.toLowerCase();
            match = hay.includes(q);
          }
          
          if (match) results.push({ check: c });
        }
      }
    }
    
    return results;
  }

  const metrics = useMemo(() => computeMetrics(servers, boh, checksByServerId, laborCostUsd), [servers, boh, checksByServerId, laborCostUsd]);

  // Track metrics history
  useEffect(() => {
    const timestamp = Date.now();
    
    // Update net sales history
    setNetSalesHistory(prev => {
      const newHistory = [...prev, { timestamp, value: metrics.netSalesUsd }];
      return newHistory.slice(-100); // Keep only last 100 points
    });
    
    // Update labor percent history
    const laborPercent = metrics.netSalesUsd > 0 ? (metrics.laborCostUsd / metrics.netSalesUsd) * 100 : 0;
    setLaborPercentHistory(prev => {
      const newHistory = [...prev, { timestamp, value: laborPercent }];
      return newHistory.slice(-100); // Keep only last 100 points
    });
  }, [metrics.netSalesUsd, metrics.laborCostUsd]);

  const value: MissionStoreValue = {
    servers,
    bohStaff: boh,
    checksByServerId,
    pickup,
    tickets,
    metrics,
    laborCostHistory,
    netSalesHistory,
    laborPercentHistory,
    view,
    setView,
    serverCardsExpanded,
    toggleServerCardsExpanded: () => setServerCardsExpanded(prev => !prev),
    closeCheck,
    fulfillTicket,
    addPickupOrder,
    addCheck,
    markCheckAsPaid,
    createNewCheck,
    search,
  };

  return <MissionStoreContext.Provider value={value}>{children}</MissionStoreContext.Provider>;
}

export function useMissionStore() {
  const ctx = useContext(MissionStoreContext);
  if (!ctx) throw new Error("useMissionStore must be used within MissionStoreProvider");
  return ctx;
} 