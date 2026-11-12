import React from 'react';
import {
  Home,
  Compass,
  Disc3,
  Radio,
  Sliders,
  MessageSquare,
  User,
  Music,
  Activity,
} from 'lucide-react';
import { NavTab } from '../../types';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'projects', label: 'My Projects', icon: Disc3 },
  { id: 'livejam', label: 'Live Jam', icon: Radio, badge: 'WebRTC' },
  { id: 'studio', label: 'Studio', icon: Sliders, badge: 'Sync' },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
];

export const Sidebar: React.FC<{
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  pendingInvitesCount?: number;
}> = ({ currentTab, onNavigate, pendingInvitesCount = 0 }) => {
  return (
    <>
      {/* Desktop Studio Rack Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 bg-zinc-950 border-r border-zinc-800/80 p-4 min-h-[calc(100vh-65px)] sticky top-[65px]">
        <div className="space-y-6">
          {/* Audio Master Bus Status Widget */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <span>Studio Master Clock</span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                48.0 kHz
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
              <span>BPM Grid: 120</span>
              <span className="text-purple-400">0.00ms Jitter</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-purple-600/20 border border-purple-500/40 text-purple-200 shadow-sm shadow-purple-950/40'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.id === 'home' && pendingInvitesCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white">
                        {pendingInvitesCount}
                      </span>
                    )}
                    {item.badge && (
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-purple-500/30 text-purple-200'
                            : 'bg-zinc-800/80 text-zinc-500 group-hover:text-zinc-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Studio Specs Footer */}
        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-[11px] text-zinc-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Global Audio Grid</span>
            <span className="text-zinc-400 font-mono">v1.0-prod</span>
          </div>
          <p className="text-[10px] text-zinc-600 leading-tight">
            Designed for mobile & desktop DAW collaboration
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-2 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-medium transition-all relative ${
                isActive ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.id === 'home' && pendingInvitesCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
