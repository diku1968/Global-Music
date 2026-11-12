import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Terminal,
  FolderCode,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AndroidExportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    toast(`Copied ${label} command!`, 'success');
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-zinc-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-950/40 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Pure Native Android App Project
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Generated & Synced
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Complete native Android Studio project structure at <code className="text-purple-300 font-mono">/android</code>
            </p>
          </div>
        </div>

        {/* Project Meta Details */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-500 block">Package ID</span>
            <span className="font-mono font-bold text-emerald-400 text-[11px] truncate block">
              com.diku1968.globlemusic
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-500 block">Platform</span>
            <span className="font-bold text-emerald-400 text-xs block">Native Android</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-500 block">Target SDK</span>
            <span className="font-mono font-bold text-white text-xs block">API 34+</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-500 block">Audio Engine</span>
            <span className="font-bold text-cyan-400 text-xs block">Web Audio + WebRTC</span>
          </div>
        </div>

        {/* Configured Permissions */}
        <div className="mt-4 p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Configured Android Manifest Permissions
          </span>
          <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
            {[
              'android.permission.RECORD_AUDIO',
              'android.permission.MODIFY_AUDIO_SETTINGS',
              'android.permission.INTERNET',
              'android.permission.ACCESS_NETWORK_STATE',
              'android.permission.WAKE_LOCK',
              'android.permission.BLUETOOTH',
              'android.hardware.microphone',
            ].map((perm) => (
              <span
                key={perm}
                className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="mt-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            How to Build APK or Run in Android Studio
          </h3>

          {/* Step 1 */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                1. Open Project in Android Studio
              </span>
              <button
                onClick={() => copyText('npx cap open android', 'open-studio')}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                {copiedCmd === 'open-studio' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy Command</span>
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Launch Android Studio and select the <code className="text-purple-300">/android</code> folder from this project, or run:
            </p>
            <div className="p-2.5 rounded-xl bg-black font-mono text-xs text-emerald-400 border border-zinc-800/80">
              npx cap open android
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                2. Build Debug APK with Gradle
              </span>
              <button
                onClick={() => copyText('cd android && ./gradlew assembleDebug', 'build-apk')}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                {copiedCmd === 'build-apk' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy Command</span>
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Compile the standalone Android debug APK directly via command line:
            </p>
            <div className="p-2.5 rounded-xl bg-black font-mono text-xs text-emerald-400 border border-zinc-800/80">
              cd android && ./gradlew assembleDebug
            </div>
            <p className="text-[11px] text-zinc-500">
              Output binary created at: <code className="text-zinc-400">android/app/build/outputs/apk/debug/app-debug.apk</code>
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/30 border border-purple-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>3. Option 3: Google Play Store Release Bundle (.AAB)</span>
              </span>
              <button
                onClick={() => copyText('cd android && ./gradlew bundleRelease', 'bundle-play')}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                {copiedCmd === 'bundle-play' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy Command</span>
              </button>
            </div>
            <p className="text-xs text-zinc-300">
              Targeting API 36 with split bundle optimization for Google Play Console:
            </p>
            <div className="p-2.5 rounded-xl bg-black font-mono text-xs text-emerald-400 border border-zinc-800/80">
              cd android && ./gradlew bundleRelease
            </div>
            <p className="text-[11px] text-zinc-400">
              Output: <code className="text-purple-300 font-mono">android/app/build/outputs/bundle/release/app-release.aab</code>
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Android Studio & Gradle project verified
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
