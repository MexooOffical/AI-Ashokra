import React, { useState } from 'react';
import {
  X,
  Search,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AIModel } from '../../types';
import { AVAILABLE_MODELS } from '../../data/models';

interface ChooseModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAutoMode: boolean;
  selectedModelIds: string[];
  onApply: (isAuto: boolean, modelIds: string[]) => void;
  onUpgradeRequired?: () => void;
}

export const ChooseModelModal: React.FC<ChooseModelModalProps> = ({
  isOpen,
  onClose,
  isAutoMode: initialIsAuto,
  selectedModelIds: initialSelectedIds,
  onApply,
  onUpgradeRequired,
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'intelligent' | 'latest'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuto, setIsAuto] = useState(initialIsAuto);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // Synchronize when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsAuto(initialIsAuto);
      setSelectedIds(initialSelectedIds);
      setLockedNotice(null);
    }
  }, [isOpen, initialIsAuto, initialSelectedIds]);

  if (!isOpen) return null;

  // Filter models based on search query and category tabs
  const filteredModels = AVAILABLE_MODELS.filter((model) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      return (
        model.name.toLowerCase().includes(q) ||
        (model.provider && model.provider.toLowerCase().includes(q))
      );
    }
    if (activeTab === 'popular') return true; // show all models in popular tab
    return model.category === activeTab;
  });

  const handleToggleModel = (model: AIModel) => {
    if (model.isLocked) {
      setLockedNotice(`"${model.name}" is locked. Upgrade to Pro membership.`);
      if (onUpgradeRequired) {
        setTimeout(() => {
          onUpgradeRequired();
        }, 500);
      }
      return;
    }

    setLockedNotice(null);
    setIsAuto(false);

    setSelectedIds((prev) => {
      if (prev.includes(model.id)) {
        const next = prev.filter((id) => id !== model.id);
        if (next.length === 0) {
          setIsAuto(true);
        }
        return next;
      } else {
        // Enforce max 4 selectable models if user reaches limit
        if (prev.length >= 4) {
          return prev;
        }
        return [...prev, model.id];
      }
    });
  };

  const handleSelectAuto = () => {
    setIsAuto(true);
    setSelectedIds([]);
    setLockedNotice(null);
  };

  const handleReset = () => {
    setIsAuto(true);
    setSelectedIds([]);
    setLockedNotice(null);
  };

  const handleConfirm = () => {
    onApply(isAuto, isAuto ? [] : selectedIds);
    onClose();
  };

  // Determine button text matching screenshot
  const getButtonText = () => {
    if (isAuto || selectedIds.length === 0) {
      return 'Continue with Auto Mode';
    }
    if (selectedIds.length === 1) {
      const selectedModel = AVAILABLE_MODELS.find((m) => m.id === selectedIds[0]);
      return `Continue with ${selectedModel?.name || 'Selected Model'}`;
    }
    return 'Apply for this chat';
  };

  return (
    <div
      id="choose-model-backdrop"
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="choose-model-card"
        className="w-full max-w-[700px] bg-white rounded-[24px] sm:rounded-[28px] shadow-2xl border border-neutral-200/80 p-5 sm:p-7 relative my-auto animate-in fade-in zoom-in-95 duration-150 text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-[22px] font-bold text-neutral-900 tracking-tight">
              Choose a model
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5 font-normal">
              picks the best model for your task
            </p>
          </div>

          <button
            id="close-choose-model-btn"
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>

        {/* Filters & Search Row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* Tabs: Popular, Intelligent, Latest */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('popular')}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'popular'
                  ? 'bg-[#18181b] text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Popular
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('intelligent')}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-medium transition-all cursor-pointer ${
                activeTab === 'intelligent'
                  ? 'bg-[#18181b] text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Intelligent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('latest')}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-medium transition-all cursor-pointer ${
                activeTab === 'latest'
                  ? 'bg-[#18181b] text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Latest
            </button>
          </div>

          {/* Search Input matching exact placeholder and magnifying icon */}
          <div className="flex-1 min-w-[150px] relative">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200/90 bg-white focus-within:border-neutral-400 transition-all">
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-[13px] text-neutral-800 placeholder:text-neutral-400 font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Filter button with funnel icon */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200/90 text-xs sm:text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span>Filter</span>
          </button>
        </div>

        {/* Auto Mode (Super Ashokra) Card */}
        <div
          id="auto-mode-card"
          onClick={handleSelectAuto}
          className={`rounded-2xl p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-all duration-150 border ${
            isAuto
              ? 'bg-[#f4f3ef] border-neutral-300/80 shadow-2xs'
              : 'bg-[#fafaf8] hover:bg-[#f4f3ef] border-neutral-200/60'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Auto Mode Icon */}
            <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src="/assets/ai-ashokra-logo.png"
                alt="Auto Mode"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-neutral-900 tracking-tight">
                Auto Mode <span className="font-normal text-neutral-500">(Super Ashokra)</span>
              </div>
              <div className="text-xs text-neutral-500">
                routes the best model for you
              </div>
            </div>
          </div>

          {/* Checkmark indicator */}
          {isAuto && (
            <div className="w-5 h-5 flex items-center justify-center text-neutral-800 shrink-0">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
        </div>

        {/* Divider with models counter: e.g., "0/4 models selected" or "1/4 models selected" */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-neutral-200/70" />
          <span className="absolute bg-white px-3 text-[11px] font-normal text-neutral-400 select-none">
            {selectedIds.length}/4 models selected
          </span>
        </div>

        {/* Locked alert notice */}
        {lockedNotice && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between animate-in fade-in">
            <span>{lockedNotice}</span>
            <button
              type="button"
              onClick={onUpgradeRequired}
              className="font-semibold underline ml-2 cursor-pointer hover:text-amber-950"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* Models Grid (2 columns matching the user screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[310px] overflow-y-auto pr-1">
          {filteredModels.map((model) => {
            const isSelected = !isAuto && selectedIds.includes(model.id);

            return (
              <div
                key={model.id}
                id={`model-item-${model.id}`}
                onClick={() => handleToggleModel(model)}
                className={`rounded-2xl p-3 sm:py-3 sm:px-3.5 flex items-center justify-between transition-all duration-150 border cursor-pointer select-none ${
                  isSelected
                    ? 'bg-white border-2 border-[#10a37f] shadow-[0_2px_8px_rgba(16,163,127,0.08)]'
                    : 'bg-[#fafaf8] hover:bg-[#f3f2ee] border-neutral-200/60'
                }`}
              >
                {/* Logo and Name/Provider */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-transparent">
                    <img
                      src={model.logo}
                      alt={model.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.model-fallback-badge')) {
                          const fallback = document.createElement('div');
                          fallback.className =
                            'model-fallback-badge w-6 h-6 rounded-md bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-700';
                          fallback.innerText = model.name.slice(0, 2).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="text-[13px] sm:text-[14px] font-medium text-neutral-900 truncate leading-snug">
                      {model.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate leading-snug">
                      {model.provider}
                    </div>
                  </div>
                </div>

                {/* Right side status: Locked Diamond Badge + Lock Icon OR Radio/Circle */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {model.isLocked ? (
                    <div className="flex items-center gap-1.5">
                      {model.multiplier && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fbf5e6] text-[#b45309] border border-amber-300/60 text-[11px] font-semibold">
                          <span className="text-[9px]">◆</span>
                          <span>{model.multiplier}</span>
                        </span>
                      )}
                      {/* Square lock icon matching screenshot */}
                      <div className="w-3.5 h-3.5 rounded-[3px] border border-neutral-400/80 flex items-center justify-center text-[8px] text-neutral-500">
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-2xs" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      {isSelected ? (
                        /* Selected circle with inner green dot matching reference */
                        <div className="w-5 h-5 rounded-full border-2 border-[#10a37f] flex items-center justify-center bg-white">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#10a37f]" />
                        </div>
                      ) : (
                        /* Empty subtle circle matching reference */
                        <div className="w-5 h-5 rounded-full border border-neutral-300/80 bg-white" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Footer */}
        <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between">
          {/* Reset / Clear Button */}
          <button
            id="reset-model-selection-btn"
            type="button"
            onClick={handleReset}
            title="Reset to Auto Mode"
            aria-label="Reset selection"
            className="w-9 h-9 rounded-full border border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[1.8]" />
          </button>

          {/* Action confirmation button: e.g. "Continue with Qwen3.5" or "Apply for this chat" */}
          <button
            id="apply-model-selection-btn"
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-full bg-[#18181b] hover:bg-black text-white text-xs sm:text-[13px] font-semibold tracking-tight transition-all active:scale-[0.98] shadow-xs cursor-pointer"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};
