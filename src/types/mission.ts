export type ServiceType = "dine-in" | "takeout" | "delivery";
export type CheckStatus = "open" | "paid" | "closed";
export type TicketState = "in-progress" | "ready";
export type PickupState = "needs-approval" | "scheduled" | "active" | "ready" | "completed";

export interface StaffMember {
  id: string;
  name: string;
  role: "server" | "chef" | "runner" | "dishwasher" | "sous-chef";
  hourlyWageUsd: number;
  clockInAt: number; // epoch ms
  scheduledClockOutAt?: number; // epoch ms
  tipsUsd: number;
  salesUsd: number;
  slph: number; // Sales Per Labor Hour
  voids: number;
  discounts: number;
  overtimeMinutes: number;
}

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  priceUsd: number;
  category: "drinks" | "entrees" | "dessert" | "sides" | "appetizers";
}

export interface Check {
  id: string; // human readable, e.g., Ch. #1234
  amountUsd: number;
  openedAt: number; // epoch ms
  status: CheckStatus;
  serviceType: ServiceType;
  tableNumber?: number;
  quoteTimeMinutes?: number; // for pickup
  serverId?: string; // for dine-in
  guestName?: string;
  guests: number;
  items: LineItem[];
  orderGroupId?: string; // multi-check orders
}

export interface Ticket {
  id: string; // e.g., #4001
  checkId: string;
  tableNumber?: number;
  serviceType: ServiceType;
  items: LineItem[];
  openedAt: number;
  state: TicketState;
  readyAt?: number; // when turned ready
}

export interface PickupOrder {
  id: string; // e.g., P1
  checkId: string;
  quoteMinutes: number;
  delayMinutes: number;
  state: PickupState;
}

export interface MissionMetrics {
  netSalesUsd: number;
  laborCostUsd: number;
  availableForInstantDepositUsd: number;
  totalChecks: number;
  guests: number;
  voids: number;
  refunds: number;
  discounts: number;
  overtimeMinutes: number;
  averageCheckSizeUsd: number;
  clockedInStaffCount: number;
} 