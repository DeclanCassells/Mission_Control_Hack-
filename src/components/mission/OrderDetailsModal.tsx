"use client";
import { Check, StaffMember } from "@/types/mission";
import { useMissionStore } from "@/lib/missionStore";

interface OrderDetailsModalProps {
  check: Check;
  server?: StaffMember;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ check, server, isOpen, onClose }: OrderDetailsModalProps) {
  const { bohStaff } = useMissionStore();

  if (!isOpen) return null;

  // Calculate totals
  const subtotal = check.items.reduce((sum, item) => sum + (item.priceUsd * item.quantity), 0);
  const tax = subtotal * 0.0875; // 8.75% tax
  const discountAmount = subtotal * 0.5; // 50% employee meal discount
  const discountedSubtotal = subtotal - discountAmount;
  const total = discountedSubtotal + tax;
  const tip = total * 0.18; // 18% tip
  const finalTotal = total + tip;

  // Generate realistic IDs and dates
  const checkNumber = check.id.replace(/\D/g, '').slice(-2);
  const guid = `d91c49a0-4f50-4cf5-aa95-d700990c9bbc`;
  const transactionId = `3000000446871061${checkNumber}`;
  const openedDate = new Date(check.openedAt);
  const closedDate = new Date(check.openedAt + 25 * 60 * 1000); // 25 minutes later
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: '2-digit' 
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get random staff member for "opened by"
  const openedByStaff = bohStaff[Math.floor(Math.random() * bohStaff.length)] || server;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-lg bg-white shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <span className="text-gray-600 text-lg font-bold">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Check Header Info */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Check #{checkNumber} ({check.status === 'closed' ? 'Closed' : check.status === 'paid' ? 'Paid' : 'Open'})</h3>
            
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p><span className="font-medium">ID:</span> {transactionId}</p>
                <p><span className="font-medium">GUID:</span> {guid}</p>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Discounts:</span> ${discountAmount.toFixed(2)}</p>
                    <p><span className="font-medium">Credits:</span> $0.00</p>
                    <p><span className="font-medium">Subtotal:</span> ${discountedSubtotal.toFixed(2)}</p>
                    <p><span className="font-medium">Tax:</span> ${tax.toFixed(2)}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">TOTAL:</span> ${total.toFixed(2)}</p>
                    <p><span className="font-medium">Balance Due:</span> $0.00</p>
                    <p><span className="font-medium">Tip:</span> ${tip.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-4 text-sm">
              <div>
                <p><span className="font-medium">Time Opened:</span> {formatDate(openedDate)}, {formatTime(openedDate)}</p>
                <p><span className="font-medium">Server:</span> {server?.name || 'Unknown'}</p>
                <p><span className="font-medium">Opened by Server:</span> {openedByStaff?.name || 'Unknown'}</p>
                <p><span className="font-medium">Shift:</span> {server?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500 mt-1">({formatDate(openedDate)}, 2:50 PM - 10:27 PM)</p>
              </div>
              <div>
                <p><span className="font-medium">Tab Name:</span> C#</p>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-4">Items</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-1 font-medium">Menu Item</th>
                    <th className="text-left py-2 px-1 font-medium">Modifiers</th>
                    <th className="text-right py-2 px-1 font-medium">Price</th>
                    <th className="text-center py-2 px-1 font-medium">Qty</th>
                    <th className="text-right py-2 px-1 font-medium">Discount</th>
                    <th className="text-right py-2 px-1 font-medium">Net</th>
                    <th className="text-right py-2 px-1 font-medium">Tax</th>
                    <th className="text-right py-2 px-1 font-medium">Total</th>
                    <th className="text-center py-2 px-1 font-medium">Voided?</th>
                    <th className="text-left py-2 px-1 font-medium">Reason</th>
                    <th className="text-center py-2 px-1 font-medium">Refund Qty</th>
                    <th className="text-right py-2 px-1 font-medium">Refund</th>
                  </tr>
                </thead>
                <tbody>
                  {check.items.map((item, index) => {
                    const itemTotal = item.priceUsd * item.quantity;
                    const itemDiscount = itemTotal * 0.5; // 50% discount
                    const itemNet = itemTotal - itemDiscount;
                    const itemTax = itemNet * 0.0875;
                    const itemFinalTotal = itemNet + itemTax;
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-2 px-1">
                          <span className="text-blue-600 underline cursor-pointer">{item.name}</span>
                        </td>
                        <td className="py-2 px-1 text-gray-600">
                          {index === 0 && "Lake Life Vodka (New Holland)"}
                        </td>
                        <td className="py-2 px-1 text-right">${item.priceUsd.toFixed(2)}</td>
                        <td className="py-2 px-1 text-center">{item.quantity}</td>
                        <td className="py-2 px-1 text-right">${itemDiscount.toFixed(2)}</td>
                        <td className="py-2 px-1 text-right">${itemNet.toFixed(2)}</td>
                        <td className="py-2 px-1 text-right">${itemTax.toFixed(2)}</td>
                        <td className="py-2 px-1 text-right">${itemFinalTotal.toFixed(2)}</td>
                        <td className="py-2 px-1 text-center">false</td>
                        <td className="py-2 px-1"></td>
                        <td className="py-2 px-1 text-center">0</td>
                        <td className="py-2 px-1 text-right">$0.00</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discounts Section */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-4">Discounts</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-1 font-medium">Name</th>
                    <th className="text-right py-2 px-1 font-medium">Amount</th>
                    <th className="text-left py-2 px-1 font-medium">Applied Date</th>
                    <th className="text-left py-2 px-1 font-medium">Approver</th>
                    <th className="text-left py-2 px-1 font-medium">Reason</th>
                    <th className="text-left py-2 px-1 font-medium">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-1">Employee Meal 50% ($0.00%)</td>
                    <td className="py-2 px-1 text-right">${discountAmount.toFixed(2)}</td>
                    <td className="py-2 px-1">{formatDate(openedDate)}, {formatTime(openedDate)}</td>
                    <td className="py-2 px-1">{openedByStaff?.name || 'Unknown'}</td>
                    <td className="py-2 px-1"></td>
                    <td className="py-2 px-1"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments Section */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-4">Payments</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-1 font-medium">Payment</th>
                    <th className="text-left py-2 px-1 font-medium">Date</th>
                    <th className="text-right py-2 px-1 font-medium">Amount</th>
                    <th className="text-right py-2 px-1 font-medium">Tip</th>
                    <th className="text-right py-2 px-1 font-medium">Gratuity</th>
                    <th className="text-right py-2 px-1 font-medium">Total</th>
                    <th className="text-right py-2 px-1 font-medium">Refund</th>
                    <th className="text-left py-2 px-1 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-1">
                      <div>
                        <p className="font-medium">CREDIT: Visa 2957</p>
                        <p className="text-xs text-gray-500">ID: {transactionId}</p>
                        <p className="text-xs text-gray-500">Entry Mode: Contactless</p>
                        <p className="text-xs text-gray-500">Created By: {server?.name || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="py-2 px-1">{formatDate(closedDate)}, {formatTime(closedDate)}</td>
                    <td className="py-2 px-1 text-right">${total.toFixed(2)}</td>
                    <td className="py-2 px-1 text-right">${tip.toFixed(2)}</td>
                    <td className="py-2 px-1 text-right">$0.00</td>
                    <td className="py-2 px-1 text-right">${finalTotal.toFixed(2)}</td>
                    <td className="py-2 px-1 text-right">$0.00</td>
                    <td className="py-2 px-1">CAPTURED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 