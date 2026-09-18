import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Database,
  ShieldCheck,
  Check,
  Copy,
  Flame,
} from 'lucide-react';
import {
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  FIREBASE_CONSOLE_URL,
  FIRESTORE_CONSOLE_URL,
} from '../../lib/firebase';

interface FirebaseConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  savedPromptsCount: number;
}

export const FirebaseConsoleModal: React.FC<FirebaseConsoleModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  savedPromptsCount,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div
      id="firebase-modal-backdrop"
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="firebase-modal-card"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200/90 p-6 sm:p-7 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600">
            <Flame className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
              <span>Firebase Integration</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </h2>
            <p className="text-xs text-neutral-500">
              Live Cloud Firestore database connected to AI Ashokra
            </p>
          </div>
        </div>

        {/* Access Links Box */}
        <div className="space-y-3 mt-4">
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Firestore Database URL</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(FIRESTORE_CONSOLE_URL, 'firestore')}
                className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink === 'firestore' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] font-mono text-neutral-600 truncate mb-2 select-all bg-white p-2 rounded-lg border border-neutral-200/60">
              {FIRESTORE_CONSOLE_URL}
            </p>
            <a
              href={FIRESTORE_CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>Open Firestore in Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Firebase Project Overview</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(FIREBASE_CONSOLE_URL, 'project')}
                className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink === 'project' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] font-mono text-neutral-600 truncate mb-2 select-all bg-white p-2 rounded-lg border border-neutral-200/60">
              {FIREBASE_CONSOLE_URL}
            </p>
            <a
              href={FIREBASE_CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors"
            >
              <span>Open Project Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Meta Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60">
            <span className="text-[10px] uppercase text-neutral-400 font-medium block">
              Project ID
            </span>
            <span className="font-mono text-neutral-800 truncate block mt-0.5">
              {FIREBASE_PROJECT_ID}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60">
            <span className="text-[10px] uppercase text-neutral-400 font-medium block">
              Saved Prompts
            </span>
            <span className="font-medium text-neutral-800 block mt-0.5">
              {savedPromptsCount} recorded
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium bg-neutral-900 hover:bg-black text-white rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
