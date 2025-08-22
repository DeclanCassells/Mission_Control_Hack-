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

  // Generate random 8-hour shift for server (same logic as FOH)
  const getServerShiftTimes = (serverId: string) => {
    if (!serverId) return { start: '11:00 AM', end: '7:00 PM' };
    
    const hash = serverId.split('').reduce((a, b) => {
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
  };

  const serverShift = getServerShiftTimes(server?.id || '');

  // Generate realistic modifiers based on item name
  const getItemModifier = (itemName: string, index: number) => {
    const modifiers: Record<string, string[]> = {
      'Martini': ['Vodka (Grey Goose)', 'Gin (Hendricks)', 'Extra Dry', 'Dirty'],
      'Wine': ['Pinot Noir', 'Chardonnay', 'Sauvignon Blanc', 'Merlot'],
      'Beer': ['IPA', 'Lager', 'Wheat', 'Stout'],
      'Burger': ['No Onions', 'Extra Cheese', 'Medium Rare', 'Side Fries'],
      'Salad': ['Dressing on Side', 'No Croutons', 'Extra Chicken', 'Light Vinaigrette'],
      'Pizza': ['Thin Crust', 'Extra Cheese', 'No Mushrooms', 'Well Done'],
      'Pasta': ['Gluten Free', 'Extra Sauce', 'Parmesan on Side', 'Al Dente'],
      'Steak': ['Medium Rare', 'Garlic Butter', 'Side Asparagus', 'No Salt'],
      'Fish': ['Grilled', 'Lemon on Side', 'No Butter', 'Medium'],
      'Sandwich': ['No Mayo', 'Extra Pickles', 'Toasted', 'Side Chips']
    };

    // Find matching category
    for (const [category, options] of Object.entries(modifiers)) {
      if (itemName.toLowerCase().includes(category.toLowerCase())) {
        // Use item index to get consistent modifier for each item
        return options[index % options.length];
      }
    }

    // Default modifiers for unknown items
    const defaultModifiers = ['No modifications', 'Extra sauce', 'On the side', 'Light seasoning', 'Extra garnish'];
    return Math.random() > 0.6 ? defaultModifiers[index % defaultModifiers.length] : '';
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-lg bg-white shadow-2xl border border-gray-200 overflow-hidden">
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
            <h3 className="text-lg font-bold text-gray-900 mb-6">Check #{checkNumber} ({check.status === 'closed' ? 'Closed' : check.status === 'paid' ? 'Paid' : 'Open'})</h3>
            
            {/* Three Column Layout */}
            <div className="grid grid-cols-3 gap-12 text-sm" style={{ color: '#252525' }}>
              {/* Column 1: Check Details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">Time Opened:</span>
                  <span>{formatDate(openedDate)}, {formatTime(openedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Server:</span>
                  <span>{server?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Opened by Server:</span>
                  <span>{openedByStaff?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Shift:</span>
                  <span>{server?.name || 'Unknown'}</span>
                </div>
                <div className="text-xs text-right" style={{ color: '#666' }}>({formatDate(openedDate)}, {serverShift.start} - {serverShift.end})</div>
                <div className="flex justify-between">
                  <span className="font-bold">Tab Name:</span>
                  <span>C#</span>
                </div>
              </div>

              {/* Column 2: Financial Details 1 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">Discounts:</span>
                  <span>${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Credits:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Subtotal:</span>
                  <span>${discountedSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Column 3: Financial Details 2 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">TOTAL:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Balance Due:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Tip:</span>
                  <span>${tip.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <h4 className="font-bold mb-4" style={{ color: '#252525' }}>Items</h4>
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="min-w-full text-sm border-collapse bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '150px' }}>Menu Item</th>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '200px' }}>Modifiers</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '80px' }}>Price</th>
                    <th className="text-center py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '60px' }}>Qty</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '80px' }}>Discount</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '80px' }}>Net</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '80px' }}>Tax</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '80px' }}>Total</th>
                    <th className="text-center py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '80px' }}>Voided?</th>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '100px' }}>Reason</th>
                    <th className="text-center py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '100px' }}>Refund Qty</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '80px' }}>Refund</th>
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
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">{item.name}</span>
                        </td>
                        <td className="py-3 px-4" style={{ color: '#252525' }}>
                          {getItemModifier(item.name, index)}
                        </td>
                        <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>${item.priceUsd.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center" style={{ color: '#252525' }}>{item.quantity}</td>
                        <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>${itemDiscount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>${itemNet.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>${itemTax.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>${itemFinalTotal.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center" style={{ color: '#252525' }}>false</td>
                        <td className="py-3 px-4" style={{ color: '#252525' }}></td>
                        <td className="py-3 px-4 text-center" style={{ color: '#252525' }}>0</td>
                        <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>$0.00</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discounts Section */}
          <div className="mb-6">
            <h4 className="font-bold mb-4" style={{ color: '#252525' }}>Discounts</h4>
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="min-w-full text-sm border-collapse bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '200px' }}>Name</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '100px' }}>Amount</th>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '150px' }}>Applied Date</th>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '120px' }}>Approver</th>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '100px' }}>Reason</th>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '150px' }}>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4" style={{ color: '#252525' }}>Employee Meal 50% ($0.00%)</td>
                    <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>${discountAmount.toFixed(2)}</td>
                    <td className="py-3 px-4" style={{ color: '#252525' }}>{formatDate(openedDate)}, {formatTime(openedDate)}</td>
                    <td className="py-3 px-4" style={{ color: '#252525' }}>{openedByStaff?.name || 'Unknown'}</td>
                    <td className="py-3 px-4" style={{ color: '#252525' }}></td>
                    <td className="py-3 px-4" style={{ color: '#252525' }}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments Section */}
          <div className="mb-6">
            <h4 className="font-bold mb-4" style={{ color: '#252525' }}>Payments</h4>
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="min-w-full text-sm border-collapse bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '250px' }}>Payment</th>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '150px' }}>Date</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '100px' }}>Amount</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '80px' }}>Tip</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '100px' }}>Gratuity</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '100px' }}>Total</th>
                    <th className="text-right py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '80px' }}>Refund</th>
                    <th className="text-left py-3 px-4 font-bold border-b border-gray-200" style={{ color: '#252525', minWidth: '100px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {check.status === 'closed' ? (
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium" style={{ color: '#252525' }}>CREDIT: Visa 2957</p>
                          <p className="text-xs" style={{ color: '#666' }}>ID: {transactionId}</p>
                          <p className="text-xs" style={{ color: '#666' }}>Entry Mode: Contactless</p>
                          <p className="text-xs" style={{ color: '#666' }}>Created By: {server?.name || 'Unknown'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4" style={{ color: '#252525' }}>{formatDate(closedDate)}, {formatTime(closedDate)}</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>${total.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>${tip.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>$0.00</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>${finalTotal.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#252525' }}>$0.00</td>
                      <td className="py-3 px-4" style={{ color: '#252525' }}>CAPTURED</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 px-4 text-center" style={{ color: '#666' }}>
                        No payments - check is not closed
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 