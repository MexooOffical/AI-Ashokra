import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Square, ArrowUp } from 'lucide-react';
import { AIModel } from '../../types';
import { AVAILABLE_MODELS } from '../../data/models';
import { ChooseModelModal } from '../common/ChooseModelModal';

interface ChatBottomInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  selectedModelIds: string[];
  isAutoMode: boolean;
  onModelChange: (isAuto: boolean, modelIds: string[]) => void;
  onOpenUpgrade?: () => void;
}

export const ChatBottomInput: React.FC<ChatBottomInputProps> = ({
  onSend,
  isLoading,
  onStop,
  selectedModelIds,
  isAutoMode,
  onModelChange,
  onOpenUpgrade,
}) => {
  const [text, setText] = useState('');
  const [isChooseModelOpen, setIsChooseModelOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedModels = AVAILABLE_MODELS.filter((m) =>
    selectedModelIds.includes(m.id)
  );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5 pt-2">
      <div className="relative flex items-center bg-white border border-neutral-200/90 rounded-full px-3.5 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:border-neutral-400 transition-all">
        {/* Plus Button */}
        <button
          type="button"
          aria-label="Add attachment"
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask another question..."
          className="flex-1 bg-transparent border-0 outline-none px-3 text-[14px] sm:text-[15px] text-neutral-800 placeholder:text-neutral-400 font-normal"
        />

        {/* Right side controls: Stop red square when loading or Send / Model selector */}
        <div className="flex items-center gap-2 shrink-0">
          {isLoading ? (
            <button
              id="chat-stop-button"
              type="button"
              onClick={onStop}
              title="Stop generating"
              aria-label="Stop generating"
              className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
            >
              <Square className="w-2.5 h-2.5 fill-white text-white group-hover:scale-110 transition-transform" />
            </button>
          ) : text.trim() ? (
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.2]" />
            </button>
          ) : null}

          {/* Model selector pill matching screenshot: Red square/dot icon + Auto v */}
          <button
            type="button"
            onClick={() => setIsChooseModelOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            {/* Small red badge or model logo */}
            {isAutoMode ? (
              <span className="w-2.5 h-2.5 rounded-2xs bg-[#f43f5e]" />
            ) : (
              <div className="flex -space-x-1 overflow-hidden">
                {selectedModels.map((m) => (
                  <img
                    key={m.id}
                    src={m.logo}
                    alt={m.name}
                    className="w-3.5 h-3.5 object-contain"
                  />
                ))}
              </div>
            )}

            <span className="text-neutral-800 font-normal">
              {isAutoMode
                ? 'Auto'
                : selectedModels.length === 1
                ? selectedModels[0].name
                : `${selectedModels.length} models`}
            </span>

            <ChevronDown className="w-3 h-3 text-neutral-400 stroke-[2]" />
          </button>
        </div>
      </div>

      <ChooseModelModal
        isOpen={isChooseModelOpen}
        onClose={() => setIsChooseModelOpen(false)}
        isAutoMode={isAutoMode}
        selectedModelIds={selectedModelIds}
        onApply={(auto, ids) => {
          onModelChange(auto, ids);
          setIsChooseModelOpen(false);
        }}
        onUpgradeRequired={onOpenUpgrade}
      />
    </div>
  );
};
