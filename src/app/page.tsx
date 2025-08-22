"use client";

import { Header } from "@/components/mission/Header";
import { FooterMetrics } from "@/components/mission/FooterMetrics";
import { ScrollingMessages } from "@/components/mission/ScrollingMessages";
import { FOH } from "@/components/mission/FOH";
import { BOH } from "@/components/mission/BOH";
import { MissionStoreProvider, useMissionStore } from "@/lib/missionStore";
import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <MissionStoreProvider>
      {/* Mobile Warning Message */}
      <div className="block md:hidden fixed inset-0 z-50 bg-black text-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="mb-6">
            <img 
              src="/Toast_logo.png" 
              alt="Toast" 
              className="h-12 mx-auto mb-4"
            />
          </div>
          <h1 className="text-2xl font-bold mb-4">Toast Mission Control</h1>
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-orange-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-300 mb-2 leading-relaxed">
            This app is designed for larger screens.
          </p>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Please switch to a laptop or tablet device for the best experience.
          </p>
          <div className="text-sm text-gray-400">
            Hack by Declan Cassells
          </div>
        </div>
      </div>
      
      <div className="hidden md:block h-screen flex flex-col bg-gray-50 relative overflow-hidden">
        {/* Noise texture background */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px'
          }} />
        </div>
        <Header />
        <MainView />
        <div className="hidden md:block">
          <ScrollingMessages />
        </div>
        <FooterMetrics />
        <WelcomeModal />
      </div>
    </MissionStoreProvider>
  );
}

function MainView() {
  const { view } = useMissionStore();
  return <div className="flex-1 overflow-auto">{view === "foh" ? <FOH /> : <BOH />}</div>;
}

function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(true);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-[#C2BBA3] overflow-hidden">
        {/* Toast Hackathon Header */}
        <div className="relative px-8 py-6 text-center overflow-hidden">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 animate-gradient-x"></div>
          
          {/* Matrix Code Effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="matrix-container">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="matrix-column" style={{ left: `${i * 5}%`, animationDelay: `${i * 0.1}s` }}>
                  <div className="matrix-letter"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Toast Logo */}
          <div className="mb-4">
            <img 
              src="/Toast_logo.png" 
              alt="Toast" 
              className="h-10 mx-auto"
            />
          </div>
          
          {/* Main Title */}
          <div className="mb-3">
            <h1 className="text-white text-6xl font-black tracking-tight leading-none">
              HACKATHON
            </h1>
          </div>
          
          {/* Divider Line */}
          <div className="flex items-center justify-center">
            <div className="h-px bg-white/40 flex-1 max-w-24"></div>
            <div className="px-4 text-white text-lg font-bold tracking-widest">
              ACCELERATE WITH AI
            </div>
            <div className="h-px bg-white/40 flex-1 max-w-24"></div>
          </div>
          

          </div>
          
          {/* Custom CSS for animated gradient and matrix effect */}
          <style jsx>{`
            @property --timer {
              syntax: '<integer>';
              inherits: false;
              initial-value: 1;
            }
            
            @keyframes gradient-x {
              0%, 100% {
                background-size: 200% 200%;
                background-position: left center;
              }
              50% {
                background-size: 200% 200%;
                background-position: right center;
              }
            }
            
            @keyframes animate-matrix {
              to {
                --timer: 26;
              }
            }
            
            @keyframes matrix-fall {
              0% {
                transform: translateY(-100vh);
                opacity: 0;
              }
              10%, 90% {
                opacity: 1;
              }
              100% {
                transform: translateY(100vh);
                opacity: 0;
              }
            }
            
            .animate-gradient-x {
              background: linear-gradient(-45deg, #f97316, #ef4444, #ec4899, #f97316);
              background-size: 400% 400%;
              animation: gradient-x 4s ease infinite;
            }
            
            .matrix-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
            
            .matrix-column {
              position: absolute;
              top: 0;
              width: 20px;
              height: 100%;
              font-family: 'Courier New', monospace;
              font-size: 14px;
              color: rgba(255, 255, 255, 0.8);
              animation: matrix-fall 6s linear infinite;
            }
            
            .matrix-letter {
              counter-reset: timer-1 calc(var(--timer) + 1) timer-2 calc(var(--timer) + 3) timer-3 calc(var(--timer) + 5) timer-4 calc(var(--timer) + 7) timer-5 calc(var(--timer) + 9);
              animation: animate-matrix 4s linear infinite;
              writing-mode: vertical-rl;
              text-orientation: upright;
              line-height: 1.2;
            }
            
            .matrix-letter:before {
              content: counter(timer-1, lower-alpha) counter(timer-2, lower-alpha) counter(timer-3, lower-alpha) counter(timer-4, lower-alpha) counter(timer-5, lower-alpha);
            }
          `}</style>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Welcome to Toast Mission Control</h2>
            <p className="text-[#6B6B6B]">Hack by Declan Cassells</p>
          </div>

          {/* Mocked Data Notice */}
          <div className="bg-[#F8F7F4] border border-[#E8E6DD] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-black mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A1A] mb-1">Demo Mode</h3>
                <p className="text-[#6B6B6B] text-sm">
                  All data in this application is mocked for demonstration purposes. 
                  This simulates a real restaurant management system with realistic 
                  orders, staff, and metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#1A1A1A] text-lg">Keyboard Shortcuts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Open Tickets */}
              <div className="bg-[#F8F7F4] border border-[#E8E6DD] rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-black rounded-lg p-2">
                    <span className="text-white font-mono font-bold text-lg">O</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">Open More Tickets</h4>
                    <p className="text-[#6B6B6B] text-sm">Creates additional open checks for servers</p>
                  </div>
                </div>
              </div>

              {/* Close Tickets */}
              <div className="bg-[#F8F7F4] border border-[#E8E6DD] rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-black rounded-lg p-2">
                    <span className="text-white font-mono font-bold text-lg">C</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">Close Random Check</h4>
                    <p className="text-[#6B6B6B] text-sm">Closes a random open check</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#1A1A1A] text-lg">Features</h3>
            <ul className="space-y-2 text-sm text-[#6B6B6B]">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full"></span>
                Real-time restaurant simulation with staff and orders
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full"></span>
                Automatic check progression (open → paid → closed)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full"></span>
                Table service management with unique table numbers
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full"></span>
                Live metrics and performance tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full"></span>
                BOH and FOH views for complete restaurant visibility
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full"></span>
                Check search functionality to quickly find orders
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F7F4] px-6 py-4 border-t border-[#E8E6DD]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B6B6B]">
              Press <kbd className="px-2 py-1 bg-[#E8E6DD] rounded text-xs font-mono text-[#1A1A1A]">ESC</kbd> to close
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
