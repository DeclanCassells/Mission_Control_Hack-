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
      <div className="h-screen flex flex-col bg-gray-50 relative overflow-hidden">
        {/* Noise texture background */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px'
          }} />
        </div>
        <Header />
        <MainView />
        <ScrollingMessages />
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
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF4C00] to-[#C26E00] px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-bold">Welcome to Toast Mission Control</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Mocked Data Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Demo Mode</h3>
                <p className="text-blue-700 text-sm">
                  All data in this application is mocked for demonstration purposes. 
                  This simulates a real restaurant management system with realistic 
                  orders, staff, and metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Keyboard Shortcuts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Open Tickets */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-lg p-2">
                    <span className="text-green-700 font-mono font-bold text-lg">O</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Open More Tickets</h4>
                    <p className="text-green-700 text-sm">Creates additional open checks for servers</p>
                  </div>
                </div>
              </div>

              {/* Close Tickets */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 rounded-lg p-2">
                    <span className="text-red-700 font-mono font-bold text-lg">C</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-900">Close Random Check</h4>
                    <p className="text-red-700 text-sm">Closes a random open check</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-lg">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF4C00] rounded-full"></span>
                Real-time restaurant simulation with staff and orders
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF4C00] rounded-full"></span>
                Automatic check progression (open → paid → closed)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF4C00] rounded-full"></span>
                Takeout order management with realistic menu pricing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF4C00] rounded-full"></span>
                Live metrics and performance tracking
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">ESC</kbd> to close
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-[#FF4C00] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#E04500] transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
