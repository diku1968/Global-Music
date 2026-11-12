import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Terminal,
  Shield,
  FileText,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
  Award,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const GooglePlayBundleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'build' | 'checklist' | 'privacy'>('build');

  if (!isOpen) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-zinc-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-purple-950/40 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Option 3: Google Play Store Release Bundle (.AAB)
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Ready to Publish
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Complete production packaging and Google Play Console release workflow
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-5 border-b border-zinc-850 pb-3 text-xs">
          <button
            onClick={() => setActiveTab('build')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors ${
              activeTab === 'build'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1. Build Release .AAB
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors ${
              activeTab === 'checklist'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            2. Google Play Checklist
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors ${
              activeTab === 'privacy'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            3. Microphone Privacy Policy
          </button>
        </div>

        {/* Tab 1: Build Steps */}
        {activeTab === 'build' && (
          <div className="mt-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Bundle Format</span>
                <span className="font-bold text-white">Android App Bundle (.AAB)</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Target SDK</span>
                <span className="font-bold text-cyan-400 font-mono">API 36 (Android 15)</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Package ID</span>
                <span className="font-mono text-emerald-400 font-bold">com.diku1968.globlemusic</span>
              </div>
            </div>

            {/* VS Code & Custom Sign Key Guide */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-indigo-950/30 border border-emerald-500/30 space-y-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Build in VS Code with Your Custom Signing Key
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                You can open this entire project in <strong>VS Code</strong>. We have pre-configured Gradle to automatically read your private signing credentials from <code className="text-emerald-400 font-mono">android/key.properties</code>.
              </p>
            </div>

            {/* Step 1: Create key.properties */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px]">1</span>
                  Configure Your Key in android/key.properties
                </span>
                <button
                  onClick={() =>
                    copyText(
                      `storePassword=YOUR_PASSWORD\nkeyPassword=YOUR_PASSWORD\nkeyAlias=globlemusic\nstoreFile=app/my-release-key.keystore`,
                      'key-prop'
                    )
                  }
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {copiedKey === 'key-prop' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Template</span>
                </button>
              </div>
              <p className="text-xs text-zinc-400">
                In VS Code, create a file named <code className="text-purple-300 font-mono">android/key.properties</code> (or see <code className="text-zinc-300 font-mono">android/key.properties.example</code>):
              </p>
              <div className="p-2.5 rounded-xl bg-black font-mono text-[11px] text-emerald-400 border border-zinc-850">
                storePassword=YOUR_KEYSTORE_PASSWORD<br />
                keyPassword=YOUR_KEY_PASSWORD<br />
                keyAlias=YOUR_KEY_ALIAS<br />
                storeFile=app/my-release-key.keystore
              </div>
            </div>

            {/* Step 2: Generate or Place Keystore */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px]">2</span>
                  Generate Keystore in VS Code Terminal (If you don't have one yet)
                </span>
                <button
                  onClick={() =>
                    copyText(
                      'keytool -genkey -v -keystore android/app/my-release-key.keystore -alias globlemusic -keyalg RSA -keysize 2048 -validity 10000',
                      'keystore'
                    )
                  }
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {copiedKey === 'keystore' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Command</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-black font-mono text-[11px] text-emerald-400 border border-zinc-850 overflow-x-auto">
                keytool -genkey -v -keystore android/app/my-release-key.keystore -alias globlemusic -keyalg RSA -keysize 2048 -validity 10000
              </div>
            </div>

            {/* Step 3: Run Build in VS Code Terminal */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px]">3</span>
                  Build .AAB in VS Code Terminal
                </span>
                <button
                  onClick={() =>
                    copyText('cd android && ./gradlew bundleRelease', 'bundle-cmd')
                  }
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {copiedKey === 'bundle-cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy (Mac/Linux)</span>
                </button>
              </div>
              <p className="text-xs text-zinc-400">
                Run inside VS Code terminal (Bash/Zsh or WSL):
              </p>
              <div className="p-2.5 rounded-xl bg-black font-mono text-xs text-emerald-400 border border-zinc-850">
                cd android && ./gradlew bundleRelease
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                On Windows PowerShell in VS Code:
              </p>
              <div className="p-2.5 rounded-xl bg-black font-mono text-xs text-cyan-400 border border-zinc-850 flex items-center justify-between">
                <span>cd android; .\gradlew.bat bundleRelease</span>
                <button
                  onClick={() => copyText('cd android; .\\gradlew.bat bundleRelease', 'win-cmd')}
                  className="text-[10px] text-zinc-400 hover:text-white"
                >
                  {copiedKey === 'win-cmd' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Output File Details */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-1.5">
              <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Signed Bundle Output Ready for Google Play:
              </span>
              <p className="font-mono text-xs text-emerald-300 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
                android/app/build/outputs/bundle/release/app-release.aab
              </p>
              <p className="text-[11px] text-zinc-400">
                Packaged as <strong className="text-white">com.diku1968.globlemusic</strong> with your custom signature!
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Google Play Checklist */}
        {activeTab === 'checklist' && (
          <div className="mt-5 space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="font-bold text-white block">1. App Category & Details</span>
              <p className="text-zinc-400">
                Category: <strong>Music & Audio</strong> • Title: <strong>Global Music Jam</strong> • Short Description: <em>Professional collaborative music creation platform for musicians worldwide.</em>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="font-bold text-white block">2. Required Store Assets</span>
              <ul className="space-y-1 text-zinc-400 list-disc list-inside">
                <li>App Icon: 512 x 512 PNG (generated at <code className="text-purple-300 font-mono">/public/pwa-512x512.png</code>)</li>
                <li>Feature Graphic: 1024 x 500 PNG / JPEG</li>
                <li>At least 4 phone screenshots (16:9 or 18:9)</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="font-bold text-white block">3. Content Rating Questionnaire</span>
              <p className="text-zinc-400">
                Mark "Users can interact or exchange content" as <strong>YES</strong> (for direct messaging, sharing audio tracks, and live jam sessions).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="font-bold text-white block">4. Target Audience</span>
              <p className="text-zinc-400">
                Target Age Group: <strong>13 and older</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Microphone Privacy Policy */}
        {activeTab === 'privacy' && (
          <div className="mt-5 space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Mandatory Google Play Audio Permission Disclosure
                </span>
                <button
                  onClick={() =>
                    copyText(
                      `Global Music Jam Privacy Policy:
Microphone & Audio Recording: Global Music Jam requires microphone access (RECORD_AUDIO) solely to allow musicians to record their instruments or vocal stems into multitrack projects and transmit live peer-to-peer audio during Live Jam rooms with explicit user activation. We do not record background audio or sell personal audio data. All stem recordings are stored securely in Cloud Firestore and Cloud Storage with user permissions.`,
                      'privacy-policy'
                    )
                  }
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {copiedKey === 'privacy-policy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Policy Text</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black font-sans text-xs text-zinc-300 border border-zinc-850 leading-relaxed whitespace-pre-line">
                {`Global Music Jam Privacy Policy:
Microphone & Audio Recording: Global Music Jam requires microphone access (RECORD_AUDIO) solely to allow musicians to record their instruments or vocal stems into multitrack projects and transmit live peer-to-peer audio during Live Jam rooms with explicit user activation. We do not record background audio or sell personal audio data. All stem recordings are stored securely in Cloud Firestore and Cloud Storage with user permissions.`}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">
            Output: app-release.aab
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
