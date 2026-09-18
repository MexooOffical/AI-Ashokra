import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  ChevronDown,
  ArrowUp,
  Paperclip,
  Globe,
  Columns3,
  Atom,
  Lock,
  Mic,
  MicOff,
} from 'lucide-react';
import { PromptMode } from '../../types';
import { AVAILABLE_MODELS } from '../../data/models';
import { ChooseModelModal } from '../common/ChooseModelModal';

interface PromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (prompt: string, mode: PromptMode, selectedModels?: string[]) => void;
  placeholder?: string;
  onOpenUpgrade?: () => void;
}

export const PromptBox: React.FC<PromptBoxProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'What would you like to create?',
  onOpenUpgrade,
}) => {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [isChooseModelOpen, setIsChooseModelOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const attachMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedModels = AVAILABLE_MODELS.filter((m) =>
    selectedModelIds.includes(m.id)
  );

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(e.target as Node)
      ) {
        setIsAttachOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value, isAutoMode ? 'Auto' : 'Ashokra Pro', selectedModelIds);
      }
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      const timer = setTimeout(() => {
        if (!value) {
          onChange('Generate a clean React dashboard for analytics');
        }
        setIsRecording(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFiles((prev) => [...prev, file.name]);
      setIsAttachOpen(false);
    }
  };

  const handleActionSelect = (actionKey: string) => {
    if (actionKey === 'attach') {
      fileInputRef.current?.click();
      setIsAttachOpen(false);
    } else if (actionKey === 'web-search') {
      setActiveFeature((prev) => (prev === 'Web Search' ? null : 'Web Search'));
      setIsAttachOpen(false);
    } else if (actionKey === 'compare') {
      setActiveFeature((prev) => (prev === 'Compare' ? null : 'Compare'));
      setIsAttachOpen(false);
    } else if (actionKey === 'deep-research') {
      setActiveFeature((prev) => (prev === 'Deep Research' ? null : 'Deep Research'));
      setIsAttachOpen(false);
    }
  };

  return (
    <div className="w-full max-w-3xl sm:max-w-[780px] mx-auto relative">
      {/* Attached files and active feature pills */}
      {(attachedFiles.length > 0 || activeFeature) && (
        <div className="flex flex-wrap items-center gap-2 mb-2.5 px-3">
          {activeFeature && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-[13px] font-medium text-emerald-800 shadow-2xs animate-in fade-in">
              {activeFeature === 'Web Search' && <Globe className="w-4 h-4 text-emerald-600" />}
              {activeFeature === 'Compare' && <Columns3 className="w-4 h-4 text-emerald-600" />}
              {activeFeature === 'Deep Research' && <Atom className="w-4 h-4 text-emerald-600" />}
              <span>{activeFeature} Active</span>
              <button
                type="button"
                onClick={() => setActiveFeature(null)}
                className="text-emerald-500 hover:text-emerald-800 text-sm ml-0.5 cursor-pointer font-bold"
              >
                ×
              </button>
            </span>
          )}

          {attachedFiles.map((file, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs sm:text-[13px] text-neutral-700 shadow-2xs animate-in fade-in"
            >
              <Paperclip className="w-3.5 h-3.5 text-neutral-400" />
              <span className="max-w-[160px] truncate">{file}</span>
              <button
                type="button"
                onClick={() =>
                  setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))
                }
                className="text-neutral-400 hover:text-neutral-700 text-sm ml-0.5 cursor-pointer font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Main Prompt Capsule - Substantial, prominent, roomy, and radiant */}
      <div
        id="prompt-box"
        className="relative bg-white rounded-full border border-neutral-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] focus-within:shadow-[0_10px_36px_rgba(16,185,129,0.12),0_2px_8px_rgba(0,0,0,0.04)] focus-within:border-emerald-400/80 transition-all duration-200 px-3.5 sm:px-5 py-3 sm:py-3.5 min-h-[58px] sm:min-h-[64px] flex items-center gap-2 sm:gap-3"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Plus / Cross Animated Action Button */}
        <div className="relative shrink-0" ref={attachMenuRef}>
          <button
            id="attach-button"
            type="button"
            onClick={() => setIsAttachOpen(!isAttachOpen)}
            title={isAttachOpen ? 'Close menu' : 'Attach files and tools'}
            aria-label={isAttachOpen ? 'Close menu' : 'Attach files and tools'}
            aria-expanded={isAttachOpen}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${
              isAttachOpen
                ? 'bg-neutral-150 text-neutral-900 shadow-inner'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {/* Animated icon: rotates smoothly by 45 degrees between Plus and Cross */}
            <div
              className={`transition-transform duration-300 ease-out flex items-center justify-center ${
                isAttachOpen ? 'rotate-45 text-neutral-800 scale-105' : 'rotate-0 text-neutral-600 scale-100'
              }`}
            >
              <Plus className="w-5 h-5 sm:w-[22px] sm:h-[22px] stroke-[2]" />
            </div>
          </button>

          {/* Action Menu Dropdown - Opens DOWNWARDS matching provided screenshot */}
          {isAttachOpen && (
            <div
              id="prompt-actions-dropdown"
              className="absolute left-0 top-full mt-3 w-72 sm:w-80 bg-white rounded-[26px] shadow-[0_16px_40px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.04)] border border-neutral-200/90 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ transformOrigin: 'top left' }}
            >
              {/* Option 1: Attach Files */}
              <button
                type="button"
                onClick={() => handleActionSelect('attach')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-neutral-50/90 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Paperclip className="w-[18px] h-[18px] text-neutral-800 stroke-[1.9] group-hover:text-neutral-900 transition-colors" />
                  <span className="text-[15px] font-medium text-neutral-800 tracking-tight">
                    Attach Files
                  </span>
                </div>
                <Lock className="w-4 h-4 text-neutral-400 fill-neutral-400/80" />
              </button>

              {/* Faint subtle separator matching reference image */}
              <div className="my-1.5 border-t border-neutral-100" />

              {/* Option 2: Web Search */}
              <button
                type="button"
                onClick={() => handleActionSelect('web-search')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-neutral-50/90 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Globe className="w-[18px] h-[18px] text-neutral-800 stroke-[1.9] group-hover:text-neutral-900 transition-colors" />
                  <span className="text-[15px] font-medium text-neutral-800 tracking-tight">
                    Web Search
                  </span>
                </div>
                <Lock className="w-4 h-4 text-neutral-400 fill-neutral-400/80" />
              </button>

              {/* Option 3: Compare */}
              <button
                type="button"
                onClick={() => handleActionSelect('compare')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-neutral-50/90 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Columns3 className="w-[18px] h-[18px] text-neutral-800 stroke-[1.9] group-hover:text-neutral-900 transition-colors" />
                  <span className="text-[15px] font-medium text-neutral-800 tracking-tight">
                    Compare
                  </span>
                </div>
              </button>

              {/* Option 4: Deep Research */}
              <button
                type="button"
                onClick={() => handleActionSelect('deep-research')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-neutral-50/90 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Atom className="w-[18px] h-[18px] text-neutral-800 stroke-[1.9] group-hover:text-neutral-900 transition-colors" />
                  <span className="text-[15px] font-medium text-neutral-800 tracking-tight">
                    Deep Research
                  </span>
                </div>
                <Lock className="w-4 h-4 text-neutral-400 fill-neutral-400/80" />
              </button>
            </div>
          )}
        </div>

        {/* Text Input - Generous font size & comfortable height */}
        <input
          ref={inputRef}
          id="prompt-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 outline-none text-neutral-900 placeholder:text-neutral-400 text-base sm:text-[17px] font-normal tracking-tight px-2 py-1 select-text leading-normal"
        />

        {/* Right side controls: Mode Selector + Mic or Send */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* AI Model Selector Button */}
          {isAutoMode || selectedModelIds.length === 0 ? (
            <button
              id="mode-selector-btn"
              type="button"
              onClick={() => setIsChooseModelOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-[13px] font-medium text-neutral-800 hover:text-neutral-950 bg-[#f4f3ef] hover:bg-[#eae8e1] transition-all cursor-pointer select-none border border-neutral-200/60 shadow-2xs"
            >
              <span>Auto</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 stroke-[2.2]" />
            </button>
          ) : (
            <button
              id="mode-selector-btn"
              type="button"
              onClick={() => setIsChooseModelOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-[13px] font-normal text-neutral-800 hover:text-neutral-950 bg-[#f4f3ef] hover:bg-[#eae8e1] transition-all cursor-pointer select-none border border-neutral-200/60 shadow-2xs"
            >
              {/* Overlapping circular logos with dark background exactly matching user screenshot */}
              <div className="flex -space-x-1.5 overflow-hidden shrink-0 items-center">
                {selectedModels.map((m) => (
                  <div
                    key={m.id}
                    className="w-5 h-5 rounded-full bg-[#18181b] ring-1.5 ring-white flex items-center justify-center overflow-hidden shrink-0"
                    title={`${m.name} (${m.provider || ''})`}
                  >
                    <img
                      src={m.logo}
                      alt={m.name}
                      className="w-3.5 h-3.5 object-contain"
                    />
                  </div>
                ))}
              </div>

              {/* Model count label or single model name */}
              <span className="font-medium text-neutral-900">
                {selectedModelIds.length === 1
                  ? selectedModels[0]?.name || '1 model'
                  : `${selectedModelIds.length} models`}
              </span>

              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 stroke-[2]" />
            </button>
          )}

          {/* Microphone Button or Submit Arrow */}
          {value.trim() ? (
            <button
              id="prompt-submit-btn"
              type="button"
              onClick={() =>
                onSubmit(value, isAutoMode ? 'Auto' : 'Ashokra Pro', selectedModelIds)
              }
              title="Submit prompt"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-900 hover:bg-black text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>
          ) : (
            <button
              id="mic-button"
              type="button"
              onClick={toggleRecording}
              title={isRecording ? 'Listening...' : 'Voice Input'}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isRecording
                  ? 'bg-red-50 text-red-600 animate-pulse'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.9]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Choose a Model Modal */}
      <ChooseModelModal
        isOpen={isChooseModelOpen}
        onClose={() => setIsChooseModelOpen(false)}
        isAutoMode={isAutoMode}
        selectedModelIds={selectedModelIds}
        onApply={(isAuto, modelIds) => {
          setIsAutoMode(isAuto);
          setSelectedModelIds(modelIds);
        }}
        onUpgradeRequired={onOpenUpgrade}
      />

      {/* Voice listening status indicator */}
      {isRecording && (
        <div className="absolute -bottom-6 left-0 right-0 text-center animate-fade-in">
          <span className="text-xs text-red-600 font-medium tracking-tight">
            ● Listening to voice input... speak now
          </span>
        </div>
      )}
    </div>
  );
};
