import React, { useState } from 'react';
import {
  X,
  Search,
  SlidersHorizontal,
  Rocket,
  Check,
  Lock,
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

  // Filter models based on active tab and search query
  const filteredModels = AVAILABLE_MODELS.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (model.provider && model.provider.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    // When searching, show all matching models
    if (searchQuery.trim()) return true;

    // Otherwise prioritize the tab
    if (activeTab === 'popular') return true; // show all models on popular tab as in reference screenshot
    return model.category === activeTab;
  });

  const handleToggleModel = (model: AIModel) => {
    if (model.isLocked) {
      setLockedNotice(`"${model.name}" requires Pro membership.`);
      if (onUpgradeRequired) {
        setTimeout(() => {
          onUpgradeRequired();
        }, 600);
      }
      return;
    }

    setLockedNotice(null);
    setIsAuto(false);
    setSelectedIds((prev) => {
      if (prev.includes(model.id)) {
        const next = prev.filter((id) => id !== model.id);
        // If everything is unselected, revert back to Auto Mode
        if (next.length === 0) {
          setIsAuto(true);
        }
        return next;
      } else {
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

  return (
    <div
      id="choose-model-backdrop"
      className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="choose-model-card"
        className="w-full max-w-[620px] bg-white rounded-[28px] shadow-2xl border border-neutral-200/90 p-5 sm:p-6 relative my-auto animate-in fade-in zoom-in-95 duration-150"
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
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('popular')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'latest'
                  ? 'bg-[#18181b] text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Latest
            </button>
          </div>

          {/* Search Input */}
          <div className="flex-1 min-w-[140px] relative">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200/90 bg-[#fafaf8] focus-within:bg-white focus-within:border-neutral-400 transition-all">
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="w-full bg-transparent border-0 outline-none text-xs text-neutral-800 placeholder:text-neutral-400 font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-neutral-400 hover:text-neutral-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Filter button */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200/90 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <span>Filter</span>
          </button>
        </div>

        {/* Auto Mode Card */}
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
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-neutral-900 tracking-tight">
                Auto Mode <span className="font-normal text-neutral-500">(Super Fiesta)</span>
              </div>
              <div className="text-xs text-neutral-500">
                routes the best model for you
              </div>
            </div>
          </div>

          {/* Selected Green Checkmark */}
          {isAuto ? (
            <div className="w-5 h-5 rounded-full bg-[#10a37f] text-white flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-neutral-300 shrink-0" />
          )}
        </div>

        {/* Centered Divider: or pick your own */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-neutral-200/70" />
          <span className="absolute bg-white px-3 text-[11px] font-normal text-neutral-400 select-none">
            or pick your own
          </span>
        </div>

        {/* Locked alert notice if user clicked locked model */}
        {lockedNotice && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between animate-in fade-in">
            <span>{lockedNotice}</span>
            <button
              type="button"
              onClick={onUpgradeRequired}
              className="font-semibold underline ml-2 cursor-pointer hover:text-amber-950"
            >
              Upgrade
            </button>
          </div>
        )}

        {/* Models Grid (2 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {filteredModels.map((model) => {
            const isSelected = !isAuto && selectedIds.includes(model.id);

            return (
              <div
                key={model.id}
                id={`model-item-${model.id}`}
                onClick={() => handleToggleModel(model)}
                className={`rounded-2xl p-3 flex items-center justify-between transition-all duration-150 border cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#f4f3ef] border-neutral-400/80 shadow-2xs'
                    : 'bg-[#fafaf8] hover:bg-[#f3f2ee] border-neutral-200/60'
                } ${model.isLocked ? 'opacity-85' : ''}`}
              >
                {/* Logo and Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white border border-neutral-200/60 p-0.5">
                    <img
                      src={model.logo}
                      alt={model.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback icon placeholder if image url is restricted
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.model-fallback-badge')) {
                          const fallback = document.createElement('div');
                          fallback.className =
                            'model-fallback-badge w-full h-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-700';
                          fallback.innerText = model.name.slice(0, 2).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>

                  <span className="text-[13px] sm:text-[14px] font-medium text-neutral-900 truncate">
                    {model.name}
                  </span>
                </div>

                {/* Right side status: Locked badge OR Checkbox */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {model.isLocked ? (
                    <div className="flex items-center gap-1.5">
                      {model.multiplier && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#fbf5e6] text-[#b45309] border border-amber-300/60 text-[11px] font-semibold">
                          <span>💎</span>
                          <span>{model.multiplier}</span>
                        </span>
                      )}
                      <Lock className="w-3.5 h-3.5 text-neutral-400 fill-neutral-400" />
                    </div>
                  ) : (
                    <div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#10a37f] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-neutral-300" />
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

          {/* Action confirmation button */}
          <button
            id="apply-model-selection-btn"
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-full bg-[#18181b] hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-tight transition-all active:scale-[0.98] shadow-xs cursor-pointer"
          >
            {isAuto
              ? 'Continue with Auto Mode'
              : selectedIds.length > 0
              ? 'Apply for this chat'
              : 'Continue with Auto Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};
