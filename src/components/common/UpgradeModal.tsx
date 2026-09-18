import React from 'react';
import { X, Crown, Check, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="upgrade-modal-backdrop"
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="upgrade-modal-card"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200/80 p-6 sm:p-7 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mb-4 text-amber-600">
          <Crown className="w-6 h-6 stroke-[1.8]" />
        </div>

        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Upgrade to AI Ashokra Pro
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Unlock unlimited high-speed generations, 4K video rendering, and deep reasoning models.
        </p>

        <div className="mt-5 space-y-2.5">
          {[
            'Unlimited messages with Ashokra Ultra & Pro',
            'Full access to Video Studio & 4K generation',
            'Deep Research agent with citation mapping',
            'Unlimited collaborative slide decks',
            'Priority queue & zero peak-time latency',
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-700">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-neutral-900">$20</span>
            <span className="text-xs text-neutral-500 font-normal"> / month</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                alert('Plan selection UI preview: Pro upgrade requested.');
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-neutral-900 hover:bg-black text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
