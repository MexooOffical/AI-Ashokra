import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  X,
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
  const selectedModels = AVAILABLE_MODELS.filter((m) => selectedModelIds.includes(m.id));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setIsAttachOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submit = () => {
    if (value.trim()) onSubmit(value, isAutoMode ? 'Auto' : 'Ashokra Pro', selectedModelIds);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    window.setTimeout(() => {
      if (!value) onChange('Generate a clean React dashboard for analytics');
      setIsRecording(false);
    }, 3000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setAttachedFiles((previousFiles) => [
        ...previousFiles,
        ...files.map((file) => file.name),
      ]);
      setIsAttachOpen(false);
      event.target.value = '';
    }
  };

  const selectFeature = (feature: string) => {
    setActiveFeature((current) => (current === feature ? null : feature));
    setIsAttachOpen(false);
  };

  return (
    <div className="w-full max-w-3xl sm:max-w-[780px] mx-auto relative">
      {(attachedFiles.length > 0 || activeFeature) && (
        <div className="flex flex-wrap items-center gap-2 mb-2.5 px-3">
          {activeFeature && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-[13px] font-medium text-emerald-800 shadow-2xs animate-in fade-in">
              {activeFeature === 'Web Search' && <Globe className="w-4 h-4 text-emerald-600" />}
              {activeFeature === 'Compare' && <Columns3 className="w-4 h-4 text-emerald-600" />}
              {activeFeature === 'Deep Research' && <Atom className="w-4 h-4 text-emerald-600" />}
              <span>{activeFeature} Active</span>
              <button type="button" onClick={() => setActiveFeature(null)} className="text-emerald-500 hover:text-emerald-800 ml-0.5 cursor-pointer font-bold" aria-label={`Remove ${activeFeature}`}>×</button>
            </span>
          )}
          {attachedFiles.map((file, index) => (
            <span key={`${file}-${index}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs sm:text-[13px] text-neutral-700 shadow-2xs animate-in fade-in">
              <Paperclip className="w-3.5 h-3.5 text-neutral-400" />
              <span className="max-w-[160px] truncate">{file}</span>
              <button type="button" onClick={() => setAttachedFiles((files) => files.filter((_, i) => i !== index))} className="text-neutral-400 hover:text-neutral-700 ml-0.5 cursor-pointer font-bold" aria-label={`Remove ${file}`}>×</button>
            </span>
          ))}
        </div>
      )}

      <div id="prompt-box" className="relative bg-white rounded-full border border-neutral-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] focus-within:shadow-[0_10px_36px_rgba(16,185,129,0.12),0_2px_8px_rgba(0,0,0,0.04)] focus-within:border-emerald-400/80 transition-all duration-200 px-3.5 sm:px-5 py-3 sm:py-3.5 min-h-[58px] sm:min-h-[64px] flex items-center gap-2 sm:gap-3">
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

        <div className="relative shrink-0" ref={attachMenuRef}>
          <button
            id="attach-button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Add images"
            aria-label="Add images"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          >
            <span className="relative w-5 h-5 sm:w-[22px] sm:h-[22px] block" aria-hidden="true">
              <Plus className="absolute inset-0 w-full h-full transition-all duration-300 ease-out rotate-0 scale-100 opacity-100" />
              <X className="absolute inset-0 w-full h-full transition-all duration-300 ease-out -rotate-90 scale-0 opacity-0" />
            </span>
          </button>
        </div>

        <input ref={inputRef} id="prompt-input" type="text" value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="flex-1 min-w-0 bg-transparent border-0 outline-none text-neutral-900 placeholder:text-neutral-400 text-base sm:text-[17px] font-normal tracking-tight px-2 py-1 select-text" />

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button id="mode-selector-btn" type="button" onClick={() => setIsChooseModelOpen(true)} className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-[13px] font-medium text-neutral-800 hover:text-neutral-950 bg-[#f4f3ef] hover:bg-[#eae8e1] transition-all cursor-pointer">
            {isAutoMode || selectedModels.length === 0 ? <span>Auto</span> : <span>{selectedModels.length === 1 ? selectedModels[0].name : `${selectedModels.length} models`}</span>}
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
          </button>
          {value.trim() ? (
            <button id="prompt-submit-btn" type="button" onClick={submit} title="Submit prompt" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-900 hover:bg-black text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"><ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" /></button>
          ) : (
            <button id="mic-button" type="button" onClick={toggleRecording} title={isRecording ? 'Listening...' : 'Voice Input'} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isRecording ? 'bg-red-50 text-red-600 animate-pulse' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'}`}>{isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
          )}
        </div>
      </div>

      <ChooseModelModal isOpen={isChooseModelOpen} onClose={() => setIsChooseModelOpen(false)} isAutoMode={isAutoMode} selectedModelIds={selectedModelIds} onApply={(isAuto, modelIds) => { setIsAutoMode(isAuto); setSelectedModelIds(modelIds); }} onUpgradeRequired={onOpenUpgrade} />
      {isRecording && <div className="absolute -bottom-6 left-0 right-0 text-center animate-fade-in"><span className="text-xs text-red-600 font-medium">● Listening to voice input... speak now</span></div>}
    </div>
  );
};
