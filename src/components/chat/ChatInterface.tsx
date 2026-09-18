import React, { useRef, useEffect } from 'react';
import { ChatMessageView } from './ChatMessageView';
import { ChatBottomInput } from './ChatBottomInput';
import { ChatMessage } from '../../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onStop?: () => void;
  selectedModelIds: string[];
  isAutoMode: boolean;
  onModelChange: (isAuto: boolean, modelIds: string[]) => void;
  onOpenUpgrade?: () => void;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onStop,
  selectedModelIds,
  isAutoMode,
  onModelChange,
  onOpenUpgrade,
  onLike,
  onDislike,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages[messages.length - 1]?.content]);

  return (
    <div className="flex-1 flex flex-col h-full min-h-screen bg-white relative">
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 pt-8 pb-32 max-w-4xl w-full mx-auto">
        {messages.map((msg) => (
          <ChatMessageView
            key={msg.id}
            message={msg}
            onLike={onLike}
            onDislike={onDislike}
            onStop={onStop}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Fixed bottom input bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[260px] bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-2 pointer-events-auto z-20">
        <ChatBottomInput
          onSend={onSendMessage}
          isLoading={isLoading}
          onStop={onStop}
          selectedModelIds={selectedModelIds}
          isAutoMode={isAutoMode}
          onModelChange={onModelChange}
          onOpenUpgrade={onOpenUpgrade}
        />
      </div>
    </div>
  );
};
