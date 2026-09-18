import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Check,
  Square,
} from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatMessageViewProps {
  message: ChatMessage;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onRetry?: (id: string) => void;
  onStop?: () => void;
}

export const ChatMessageView: React.FC<ChatMessageViewProps> = ({
  message,
  onLike,
  onDislike,
  onStop,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AI Ashokra Answer',
        text: message.content,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(message.content);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end my-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="max-w-[85%] sm:max-w-[70%] bg-[#f4f3ef] text-neutral-900 px-4 py-3 rounded-[20px] rounded-tr-md text-[14px] sm:text-[15px] leading-relaxed shadow-2xs">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex flex-col my-6 animate-in fade-in slide-in-from-bottom-2 duration-150 max-w-3xl w-full">
      {/* Finding the best model to answer status or Active Model pill */}
      {message.isFindingModel ? (
        <div className="flex items-center justify-between gap-2 mb-2 text-neutral-600 text-xs sm:text-[13px] font-normal">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0" />
            <span className="text-neutral-600">Finding the best model to answer...</span>
          </div>
          {onStop && (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 transition-colors cursor-pointer"
            >
              <Square className="w-2.5 h-2.5 fill-red-600" />
              <span>Stop</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between text-[12px] sm:text-[13px] text-neutral-400 font-normal mb-2">
          <span>{message.modelName || 'Auto Mode'}</span>
          {message.isStreaming && onStop && (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-neutral-600 hover:text-red-600 bg-neutral-100 hover:bg-red-50 transition-colors cursor-pointer border border-neutral-200/60"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>Stop</span>
            </button>
          )}
        </div>
      )}

      {/* Answer content with professional markdown & real-time typing rendering */}
      <div className="text-neutral-800 text-[14px] sm:text-[15px] leading-relaxed font-normal selection:bg-emerald-100">
        {message.content ? (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="markdown-table-wrapper">
                    <table>{children}</table>
                  </div>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-neutral-900">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-neutral-800">{children}</em>
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');
                  return isInline ? (
                    <code className="bg-neutral-100 text-neutral-900 px-1.5 py-0.5 rounded text-[13px] font-mono border border-neutral-200/60" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Smooth live cursor while typing */}
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-600 animate-pulse align-middle" />
            )}
          </div>
        ) : message.isFindingModel ? (
          <div className="h-4 w-40 bg-neutral-100 rounded-md animate-pulse mt-1" />
        ) : null}
      </div>

      {/* Action buttons matching screenshot: Copy, Like, Dislike, Share */}
      <div className="flex items-center gap-3.5 mt-3.5 text-neutral-400">
        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          title="Copy answer"
          aria-label="Copy answer"
          className="hover:text-neutral-800 transition-colors p-1 -m-1 rounded-md hover:bg-neutral-100 cursor-pointer"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600 stroke-[2]" />
          ) : (
            <Copy className="w-4 h-4 stroke-[1.7]" />
          )}
        </button>

        {/* Like button */}
        <button
          type="button"
          onClick={() => onLike?.(message.id)}
          title="Good response"
          aria-label="Like"
          className={`hover:text-neutral-800 transition-colors p-1 -m-1 rounded-md hover:bg-neutral-100 cursor-pointer ${
            message.liked ? 'text-neutral-900 font-bold' : ''
          }`}
        >
          <ThumbsUp
            className={`w-4 h-4 stroke-[1.7] ${
              message.liked ? 'fill-neutral-800 text-neutral-800' : ''
            }`}
          />
        </button>

        {/* Dislike button */}
        <button
          type="button"
          onClick={() => onDislike?.(message.id)}
          title="Bad response"
          aria-label="Dislike"
          className={`hover:text-neutral-800 transition-colors p-1 -m-1 rounded-md hover:bg-neutral-100 cursor-pointer ${
            message.disliked ? 'text-neutral-900 font-bold' : ''
          }`}
        >
          <ThumbsDown
            className={`w-4 h-4 stroke-[1.7] ${
              message.disliked ? 'fill-neutral-800 text-neutral-800' : ''
            }`}
          />
        </button>

        {/* Share button */}
        <button
          type="button"
          onClick={handleShare}
          title="Share response"
          aria-label="Share"
          className="hover:text-neutral-800 transition-colors p-1 -m-1 rounded-md hover:bg-neutral-100 cursor-pointer"
        >
          {shared ? (
            <Check className="w-4 h-4 text-emerald-600 stroke-[2]" />
          ) : (
            <Share2 className="w-4 h-4 stroke-[1.7]" />
          )}
        </button>
      </div>
    </div>
  );
};
