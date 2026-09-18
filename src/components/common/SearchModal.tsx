import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, MessageSquare, Image, Film, Presentation, BookOpen } from 'lucide-react';
import { NavItemId } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNav: (id: NavItemId) => void;
}

interface SearchItem {
  id: NavItemId;
  title: string;
  category: string;
  icon: React.ReactNode;
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: 'new-chat', title: 'New Chat conversation', category: 'Chat', icon: <MessageSquare className="w-4 h-4 text-emerald-600" /> },
  { id: 'image-studio', title: 'Image Studio: Text to Image generator', category: 'Create', icon: <Image className="w-4 h-4 text-purple-600" /> },
  { id: 'video-studio', title: 'Video Studio: Cinematic AI generation', category: 'Create', icon: <Film className="w-4 h-4 text-blue-600" /> },
  { id: 'slides', title: 'Slides Studio: Presentation deck builder', category: 'Productivity', icon: <Presentation className="w-4 h-4 text-amber-600" /> },
  { id: 'library', title: 'Saved assets & generations library', category: 'Workspace', icon: <BookOpen className="w-4 h-4 text-teal-600" /> },
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectNav,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = SEARCH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div
        id="search-modal-content"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-100 gap-3">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, studios, and features..."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-72 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectNav(item.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-neutral-100 group-hover:bg-white transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-neutral-900">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {item.category}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-700 transition-colors" />
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-neutral-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Navigate with mouse or arrow keys</span>
          <span>ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
