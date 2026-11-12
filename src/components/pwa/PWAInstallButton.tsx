import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  Share,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already running in standalone native mobile mode, hide install trigger
  if (isInstalled) {
    return (
      <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-[11px] text-purple-300 font-medium">
        <Smartphone className="w-3.5 h-3.5" />
        <span>Mobile App Mode</span>
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (installed) return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-cyan-500/30 hover:from-purple-600/50 hover:to-cyan-500/50 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold shadow-sm transition-all"
      >
        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden md:inline">Install Mobile App</span>
        <span className="md:hidden">App</span>
      </button>

      {/* Mobile App & Android Packaging Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-7 text-zinc-100 my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-purple-950/40 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Global Music Jam Mobile App</h3>
                <p className="text-xs text-zinc-400">
                  Run as a full-screen mobile app with low-latency Web Audio & WebRTC
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Option 1: Instant Install (PWA) */}
              <div className="p-4 rounded-2xl bg-zinc-900/70 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Option 1: Direct 1-Tap Mobile Install (PWA)
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Zero Download Delay
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Install directly from your phone's browser. Launches full-screen from your home screen with zero browser URL bar, offline caching, and instant startup:
                </p>

                {isInstallable ? (
                  <button
                    onClick={async () => {
                      await install();
                      setShowModal(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install on This Device Now</span>
                  </button>
                ) : isIOS ? (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                    <span className="font-semibold text-white block">iPhone / iPad Safari:</span>
                    <p className="flex items-center gap-2 text-zinc-400">
                      1. Tap the <Share className="w-3.5 h-3.5 text-blue-400" /> <strong>Share</strong> button in Safari toolbar.
                    </p>
                    <p className="flex items-center gap-2 text-zinc-400">
                      2. Scroll down and tap <PlusSquare className="w-3.5 h-3.5 text-zinc-300" /> <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                    <span className="font-semibold text-white block">Android Chrome / Edge:</span>
                    <p className="text-zinc-400">
                      Tap the <strong>three dots (⋮)</strong> menu in the top right corner and tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Option 2: Native Android APK / AAB Packaging */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Option 2: Android APK & Google Play Packaging
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Capacitor / TWA</span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  The codebase is built with 100% Android-ready standards (Web Audio API, AudioWorklet, WebRTC, Tailwind, and Firebase SDK). It can be compiled into a native Android APK or Google Play Store Bundle (.AAB) using:
                </p>

                <ul className="space-y-1.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Capacitor / Cordova:</strong> Wrap this project with <code className="text-purple-300 font-mono text-[11px]">npx cap add android</code> for native Android Studio builds.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Trusted Web Activity (Bubblewrap):</strong> Generate a signed Google Play Store APK/AAB package in 2 minutes.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Mobile Features Summary */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="font-bold text-white block">Touch DAW Layout</span>
                  <span className="text-[11px] text-zinc-400">Mobile bottom navigation & faders</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="font-bold text-white block">Offline Stems</span>
                  <span className="text-[11px] text-zinc-400">Service worker caching</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-850 flex items-center justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
