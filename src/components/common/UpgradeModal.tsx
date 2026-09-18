import React, { useState } from 'react';
import { X, Zap, Check } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planName: 'Basic' | 'Pro', billingCycle: 'monthly' | 'yearly') => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  const handleChoosePlan = (plan: 'Basic' | 'Pro') => {
    if (onSelectPlan) {
      onSelectPlan(plan, billingCycle);
    }
    onClose();
  };

  return (
    <div
      id="upgrade-modal-backdrop"
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="upgrade-modal-card"
        className="w-full max-w-[840px] bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl border border-neutral-200/80 p-6 sm:p-9 relative my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-upgrade-modal-btn"
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Main Headline */}
        <h2 className="text-2xl sm:text-[32px] font-semibold text-neutral-900 tracking-tight text-center mt-2 mb-6">
          One membership. Every latest model.
        </h2>

        {/* Monthly / Yearly Toggle Pill */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center p-1 bg-[#f0eee9] rounded-full">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Two Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Card 1: Basic Plan */}
          <div
            id="plan-card-basic"
            className="rounded-[24px] border border-neutral-200/90 p-6 sm:p-7 flex flex-col justify-between bg-white relative hover:border-neutral-300 transition-all"
          >
            <div>
              {/* Header: Name + Badge */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">Basic</h3>
                {billingCycle === 'yearly' && (
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[#18181b] text-white">
                    Save ₹1,989
                  </span>
                )}
              </div>

              {/* Pricing */}
              <div className="mb-1">
                <span className="text-3xl sm:text-[36px] font-bold text-neutral-900 tracking-tight">
                  {billingCycle === 'yearly' ? '₹833' : '₹999'}
                </span>
                <span className="text-sm text-neutral-500 font-normal ml-1">/month</span>
              </div>

              {/* Billed info */}
              <p className="text-xs text-neutral-500 mb-5">
                {billingCycle === 'yearly' ? '≈ ₹9,999 · billed yearly' : 'billed monthly'}
              </p>

              {/* Tokens Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f3f2ee] text-neutral-800 text-xs font-semibold mb-6">
                <Zap className="w-3.5 h-3.5 fill-neutral-800 text-neutral-800" />
                <span>3M tokens / month</span>
              </div>

              {/* Features List */}
              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3 text-sm text-neutral-700">
                  <div className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[2.5] text-neutral-500" />
                  </div>
                  <span>All standard models</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-neutral-700">
                  <div className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[2.5] text-neutral-500" />
                  </div>
                  <span>Only Image Studio</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-neutral-700">
                  <div className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[2.5] text-neutral-500" />
                  </div>
                  <span>Full deck generation with AI Slides</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <button
              id="select-basic-plan-btn"
              type="button"
              onClick={() => handleChoosePlan('Basic')}
              className="w-full py-3 px-4 rounded-full border border-neutral-200/90 text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer"
            >
              Upgrade to Basic
            </button>
          </div>

          {/* Card 2: Pro Plan (Highlighted with emerald border) */}
          <div
            id="plan-card-pro"
            className="rounded-[24px] border-2 border-[#10a37f] p-6 sm:p-7 flex flex-col justify-between bg-white relative shadow-[0_4px_20px_rgba(16,163,127,0.06)]"
          >
            <div>
              {/* Header: Name + Badge */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">Pro</h3>
                {billingCycle === 'yearly' && (
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[#10a37f] text-white">
                    Save ₹7,989
                  </span>
                )}
              </div>

              {/* Pricing */}
              <div className="mb-1">
                <span className="text-3xl sm:text-[36px] font-bold text-neutral-900 tracking-tight">
                  {billingCycle === 'yearly' ? '₹2,333' : '₹2,999'}
                </span>
                <span className="text-sm text-neutral-500 font-normal ml-1">/month</span>
              </div>

              {/* Billed info */}
              <p className="text-xs text-neutral-500 mb-5">
                {billingCycle === 'yearly' ? '≈ ₹27,999 · billed yearly' : 'billed monthly'}
              </p>

              {/* Tokens Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f3f2ee] text-neutral-800 text-xs font-semibold mb-3">
                <Zap className="w-3.5 h-3.5 fill-neutral-800 text-neutral-800" />
                <span>10M tokens / month</span>
              </div>

              {/* Section Subtitle */}
              <p className="text-[11px] font-bold tracking-wider text-[#10a37f] uppercase mb-3.5 mt-2">
                EVERYTHING IN BASIC, PLUS
              </p>

              {/* Features List with green checkmarks */}
              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3 text-sm text-neutral-700">
                  <div className="w-5 h-5 rounded-full bg-[#10a37f] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.8] text-white" />
                  </div>
                  <span>Every pro model, day one</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-neutral-700">
                  <div className="w-5 h-5 rounded-full bg-[#10a37f] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.8] text-white" />
                  </div>
                  <span>AI video generation — 1080p with audio</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-neutral-700">
                  <div className="w-5 h-5 rounded-full bg-[#10a37f] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.8] text-white" />
                  </div>
                  <span>10M tokens / month — 3.3x your Basic pool</span>
                </div>
              </div>
            </div>

            {/* Bottom Button - Solid green */}
            <button
              id="select-pro-plan-btn"
              type="button"
              onClick={() => handleChoosePlan('Pro')}
              className="w-full py-3.5 px-4 rounded-full bg-[#2a9d77] hover:bg-[#238766] active:scale-[0.99] text-sm font-semibold text-white shadow-xs transition-all cursor-pointer"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
