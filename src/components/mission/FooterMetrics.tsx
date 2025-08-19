import { useState, useEffect } from "react";
import { useMissionStore } from "@/lib/missionStore";
import type { StaffMember } from "@/types/mission";

// Animated Flip Counter Component
function AnimatedCounter({ value, label, noRightBorder = false }: { value: number | string; label: string; noRightBorder?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [simulatedValue, setSimulatedValue] = useState(value);

  // Simulate number changes every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof value === 'number') {
        setSimulatedValue(prev => {
          if (typeof prev === 'number') {
            const newValue = prev + Math.floor(Math.random() * 5) + 1; // Random increment 1-5
            return newValue;
          }
          return prev;
        });
      }
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [value]);

  useEffect(() => {
    if (displayValue !== simulatedValue) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(simulatedValue);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [simulatedValue, displayValue]);

  return (
    <div className={`text-center p-2 ${noRightBorder ? '' : 'border-r border-white'}`}>
      <div className="bg-gray-900 rounded-lg p-2 mx-1 shadow-inner border border-gray-700">
        <div className={`text-amber-400 text-lg font-mono font-bold tracking-wider drop-shadow-lg transition-all duration-300 truncate ${
          isAnimating ? 'scale-110 text-yellow-300 animate-pulse' : 'scale-100'
        }`}>
          {displayValue}
        </div>
      </div>
      <div className="text-slate-300 text-xs font-medium mt-2 uppercase opacity-70 truncate">{label}</div>
    </div>
  );
}

export function FooterMetrics() {
  const { metrics, servers, bohStaff } = useMissionStore();
  const canDeposit = metrics.availableForInstantDepositUsd > 0;

  function Metric({ label, value }: { label: string; value: string }) {
    return (
      <div className="flex flex-col group">
        <div className="text-slate-300 text-xs font-medium tracking-wide uppercase mb-2">{label}</div>
        <div className="bg-[#C2BBA3] rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer w-fit">
          <div className="text-slate-900 font-bold text-2xl tracking-tight leading-tight">
            {value}
          </div>
        </div>
      </div>
    );
  }

  function Small({ label, value }: { label: string; value: number | string }) {
    return (
      <div className="flex items-center justify-between md:block group">
        <div className="text-slate-400 text-xs font-medium tracking-wide uppercase mb-1">{label}</div>
        <div className="font-bold text-white group-hover:text-amber-300 transition-colors duration-300">{value}</div>
      </div>
    );
  }

  function StaffMetric({ label, value, staff }: { label: string; value: number; staff: StaffMember[] }) {
    const [isHovered, setIsHovered] = useState(false);
    const clockedInStaff = staff.filter(s => s.clockInAt > 0); // Filter for staff with clock-in time

    // Close tooltip when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.staff-tooltip') && !target.closest('.staff-metric-trigger')) {
        setIsHovered(false);
      }
    };

    // Add click outside listener
    useEffect(() => {
      if (isHovered) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isHovered]);

    return (
      <div className="relative group">
        <div
          className="staff-metric-trigger flex items-center justify-between md:block cursor-pointer transition-all duration-300 hover:scale-105"
          onClick={() => setIsHovered(!isHovered)}
        >
          <div className="text-slate-400 text-xs font-medium tracking-wide uppercase mb-1">{label}</div>
          <div className="font-bold text-white flex items-center gap-2 group-hover:scale-110 transition-all duration-300">
            {value}
            <span className="text-emerald-400 text-xs animate-pulse">●</span>
            <span className="text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300">👥</span>
            <span className={`text-slate-400 text-xs ml-1 transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`}>⌄</span>
          </div>
        </div>

        {/* Premium Staff List Tooltip - Bandit-inspired design */}
        {isHovered && (
          <div className="staff-tooltip absolute bottom-full right-0 mb-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden transform transition-all duration-500 ease-out animate-in slide-in-from-bottom-2 fade-in-0 scale-95 origin-bottom-right backdrop-blur-sm">
            {/* Premium Header - Bandit-style gradient */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6 text-white relative">
              <button
                onClick={(e) => { e.stopPropagation(); setIsHovered(false); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center text-white text-lg font-bold hover:scale-110"
              >
                ×
              </button>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-2xl tracking-tight">🕐 Clocked-in Staff</h3>
                <div className="text-sm font-medium opacity-90 bg-white/10 px-3 py-1 rounded-full">{clockedInStaff.length} active</div>
              </div>
              <div className="text-sm opacity-75 tracking-wide">Real-time performance monitoring</div>
            </div>

            {/* Enhanced Staff List */}
            <div className="max-h-80 overflow-y-auto">
              {clockedInStaff.map((member, index) => (
                <StaffCard
                  key={member.id}
                  member={member}
                  index={index}
                  isVisible={isHovered}
                />
              ))}
            </div>

            {/* Premium Footer */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-t border-slate-100">
              <div className="text-xs text-slate-600 text-center font-medium">
                💡 Click any staff member to expand details • Click outside to close
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function StaffCard({ member, index, isVisible }: { member: StaffMember; index: number; isVisible: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Compute derived values
    const isClockedIn = true; // All staff in this list are clocked in
    const clockInTime = new Date(member.clockInAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const overtimeMinutes = member.overtimeMinutes;

    return (
      <div
        className={`p-4 border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer transform ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
        }`}
        style={{
          transitionDelay: `${index * 100}ms`,
          animation: isVisible ? 'slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* Premium Avatar with enhanced animations */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {member.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full"></div>
          </div>

          {/* Enhanced Staff Info */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 text-lg truncate">{member.name}</div>
            <div className="text-sm text-slate-600 flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1">🕐 {clockInTime}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                member.overtimeMinutes > 0
                  ? 'bg-red-100 text-red-700 animate-pulse shadow-sm'
                  : 'bg-emerald-100 text-emerald-700 shadow-sm'
              }`}>
                {member.overtimeMinutes > 0 ? '⚠️ Overtime' : '✅ On time'}
              </span>
            </div>
          </div>

          {/* Enhanced Performance Metrics */}
          <div className="text-right">
            <div className="text-slate-700 font-bold text-lg">${member.tipsUsd.toFixed(0)}</div>
            <div className="text-slate-500 text-sm font-medium">tips</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">
              {member.slph.toFixed(1)} SLPH
            </div>
          </div>
        </div>

        {/* Premium Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 animate-in slide-in-from-top-2 fade-in-0 duration-300">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="font-bold text-blue-700 text-lg">${member.hourlyWageUsd.toFixed(2)}</div>
                <div className="text-blue-600 font-medium">hourly</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                <div className="font-bold text-emerald-700 text-lg">{member.slph.toFixed(1)}</div>
                <div className="text-emerald-600 font-medium">SLPH</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="font-bold text-amber-700 text-lg">${(member.hourlyWageUsd * 4).toFixed(2)}</div>
                <div className="text-amber-600 font-medium">today</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500 text-center font-medium">
              Click to collapse
            </div>
          </div>
        )}
      </div>
    );
  }

  // Enhanced CSS animations inspired by Bandit Running's smooth interactions
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInFromRight {
        from {
          transform: translateX(30px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .animate-in {
        animation-fill-mode: both;
      }

      .slide-in-from-bottom-2 {
        animation: slideInFromBottom 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      .slide-in-from-top-2 {
        animation: slideInTop 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      .fade-in-0 {
        animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      .scale-95 {
        animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      @keyframes slideInFromBottom {
        from {
          transform: translateY(20px) scale(0.95);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      @keyframes slideInTop {
        from {
          transform: translateY(-15px);
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

      @keyframes scaleIn {
        from {
          transform: scale(0.95);
        }
        to {
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="sticky bottom-0 z-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-t border-[#C26E00] border-t-[1px]">
      {/* 12-Column Grid Layout */}
      <div className="px-6 py-4 grid grid-cols-12 gap-12 items-center">
        
        {/* Left 6 columns - Secondary Metrics Table */}
        <div className="col-span-6">
          <div className="rounded-xl p-3 shadow-lg border border-white border-[1px]">
            <div className="grid grid-cols-8 gap-0">
              {/* Table Values with Labels Below - Flip Counter Style */}
              <AnimatedCounter value={metrics.totalChecks} label="Checks" />
              <AnimatedCounter value={metrics.guests} label="Guests" />
              <AnimatedCounter value={metrics.voids} label="Voids" />
              <AnimatedCounter value={metrics.refunds} label="Refunds" />
              <AnimatedCounter value={metrics.discounts} label="Discounts" />
              <AnimatedCounter value={metrics.overtimeMinutes} label="Overtime" />
              <AnimatedCounter value={`$${metrics.averageCheckSizeUsd.toFixed(2)}`} label="Avg Check" />
              <AnimatedCounter value={metrics.clockedInStaffCount} label="Clocked-in" noRightBorder />
            </div>
          </div>
        </div>

        {/* Right 6 columns - Primary Metrics */}
        <div className="col-span-6">
          <div className="grid grid-cols-3 gap-4">
            <Metric label="Net Sales" value={`$${metrics.netSalesUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
            <Metric label="Labor Cost" value={`$${metrics.laborCostUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
            <div className="flex flex-col">
              <div className="text-slate-300 text-xs font-medium tracking-wide uppercase mb-2">Available to deposit</div>
              <div className="flex items-center gap-3">
                <div className="bg-[#C2BBA3] rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-fit">
                  <div className="text-slate-900 font-bold text-2xl tracking-tight leading-tight">
                    ${metrics.availableForInstantDepositUsd.toFixed(2)}
                  </div>
                </div>
                <button
                  disabled={!canDeposit}
                  className={`rounded-lg px-4 py-3 text-sm font-bold tracking-wide transition-all duration-300 ${
                    canDeposit
                      ? "bg-white text-black hover:bg-gray-100 hover:scale-105 shadow-lg hover:shadow-xl"
                      : "bg-slate-700 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {canDeposit ? "🚀 Deposit Now" : "Deposit Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 