"use client";

import { useMissionStore } from "@/lib/missionStore";

export function BOH() {
  const { tickets, fulfillTicket } = useMissionStore();
  const sorted = [...tickets].sort((a, b) => a.openedAt - b.openedAt);
  const ready = sorted.filter((t) => t.state === "ready");
  const inProg = sorted.filter((t) => t.state === "in-progress");

  return (
    <div className="px-4 pb-24">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-500 mb-1">Ready</div>
          {ready.map((t) => (
            <TicketCard key={t.id} id={t.id} dineIn={t.serviceType === "dine-in"} table={t.tableNumber} items={t.items.map((i) => `${i.quantity} ${i.name}`)} state="ready" onReady={() => {}} />
          ))}
        </div>
        <div className="md:col-span-1 xl:col-span-2 space-y-3">
          <div className="text-xs font-semibold text-gray-500 mb-1">In Progress</div>
          {inProg.map((t) => (
            <TicketCard key={t.id} id={t.id} dineIn={t.serviceType === "dine-in"} table={t.tableNumber} items={t.items.map((i) => `${i.quantity} ${i.name}`)} state="in-progress" onReady={() => fulfillTicket(t.id)} />)
          )}
        </div>
      </div>
    </div>
  );
}

function TicketCard(props: { id: string; dineIn: boolean; table?: number; items: string[]; state: "in-progress" | "ready"; onReady: () => void }) {
  return (
    <div className={`rounded-xl border p-3 ${props.state === "ready" ? "bg-green-50 border-green-200" : "bg-white"}`}>
      <div className="flex items-center justify-between">
        <div className={`text-xs font-semibold rounded-full px-2 py-1 ${props.state === "ready" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>#{props.id}</div>
        {props.state === "in-progress" && (
          <button onClick={props.onReady} className="text-xs rounded-md bg-gray-100 px-2 py-1">Mark Ready</button>
        )}
      </div>
      <div className="mt-2 text-sm font-medium">{props.dineIn ? "Dine In" : "Take Out"}{props.table ? ` • Table ${props.table}` : ""}</div>
      <div className="mt-2">
        <div className="text-xs font-semibold text-gray-500 mb-1">ENTREES</div>
        <ul className="text-sm space-y-1">
          {props.items.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      </div>
    </div>
  );
} 