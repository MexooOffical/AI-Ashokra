import React from 'react';
import {
  SquarePen,
  Image as ImageIcon,
  Clapperboard,
  Folder,
  Sun,
  Columns,
} from 'lucide-react';
import { NavItemId } from '../../types';

// Precise custom SVG for Slides icon matching reference screenshot: center slide with side rails
const SlidesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6.5" y="4.5" width="11" height="15" rx="2" />
    <line x1="2.5" y1="7.5" x2="2.5" y2="16.5" />
    <line x1="21.5" y1="7.5" x2="21.5" y2="16.5" />
  </svg>
);

// Precise custom SVG for Experts icon: circle with user bust matching screenshot
const ExpertsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 18.5a5.5 5.5 0 0 1 10 0" />
  </svg>
);

// Precise custom SVG for Library icon: book spines standing on a shelf with horizontal bands matching screenshot
const LibraryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* First upright book */}
    <rect x="4" y="4" width="4.5" height="16" rx="1" />
    <line x1="4" y1="8" x2="8.5" y2="8" />
    <line x1="4" y1="16" x2="8.5" y2="16" />
    {/* Second slightly tilted book */}
    <rect x="11" y="4" width="4.5" height="16" rx="1" transform="rotate(7 13.25 12)" />
    <line x1="11" y1="9" x2="15.5" y2="9" transform="rotate(7 13.25 12)" />
    {/* Shelf line */}
    <line x1="2" y1="21" x2="22" y2="21" strokeWidth="2" />
  </svg>
);

interface NavItemConfig {
  id: NavItemId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'new-chat',
    label: 'New Chat',
    icon: SquarePen,
  },
  {
    id: 'video-studio',
    label: 'Video Studio',
    icon: Clapperboard,
    badge: 'PRO',
  },
  {
    id: 'slides',
    label: 'Slides',
    icon: SlidesIcon,
  },
  {
    id: 'experts',
    label: 'Experts',
    icon: ExpertsIcon,
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Folder,
  },
  {
    id: 'library',
    label: 'Library',
    icon: LibraryIcon,
  },
];

export interface ChatHistoryItem {
  id: string;
  title: string;
  dateStr?: string;
}

interface SidebarNavigationProps {
  activeId: NavItemId;
  isCollapsed: boolean;
  onSelect: (id: NavItemId) => void;
  chatHistory?: ChatHistoryItem[];
  activeChatId?: string | null;
  onSelectChat?: (id: string) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeId,
  isCollapsed,
  onSelect,
  chatHistory = [],
  activeChatId,
  onSelectChat,
}) => {
  return (
    <nav
      id="sidebar-navigation"
      aria-label="Main Navigation"
      className="flex flex-col gap-1 px-3 py-2 flex-1 overflow-y-auto"
    >
      {/* Top Main Navigation Items */}
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id && !activeChatId;

        return (
          <button
            key={item.id}
            id={`nav-item-${item.id}`}
            type="button"
            onClick={() => onSelect(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={`group relative flex items-center w-full transition-all duration-150 cursor-pointer select-none ${
              isCollapsed
                ? 'justify-center p-2.5 rounded-xl'
                : 'px-3 py-2 gap-3.5 justify-between rounded-[18px]'
            } ${
              isActive
                ? 'bg-[#ece9e2] text-neutral-900 font-medium'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70 font-normal'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive
                    ? 'text-neutral-900 stroke-[1.8]'
                    : 'text-neutral-600 group-hover:text-neutral-900 stroke-[1.6]'
                }`}
              />

              {!isCollapsed && (
                <span className="text-[14px] truncate leading-tight tracking-tight">
                  {item.label}
                </span>
              )}
            </div>

            {!isCollapsed && item.badge && (
              <span
                id={`badge-${item.id}`}
                className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-[#eceae6] text-neutral-600 border border-neutral-300/40"
              >
                {item.badge}
              </span>
            )}

            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {item.label}
                {item.badge && ` (${item.badge})`}
              </div>
            )}
          </button>
        );
      })}

      {/* History section matching screenshot */}
      {!isCollapsed && chatHistory.length > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <div className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            History
          </div>
          <div className="px-3 text-[10px] text-neutral-400 mb-2">
            Today
          </div>

          <div className="flex flex-col gap-0.5">
            {chatHistory.map((chat, idx) => {
              const isSelected = activeChatId === chat.id;
              // Alternate subtle icons: Sun and Columns matching screenshot
              const HistoryIcon = idx % 2 === 0 ? Sun : Columns;

              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat?.(chat.id)}
                  title={chat.title}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs sm:text-[13px] transition-colors cursor-pointer select-none group ${
                    isSelected
                      ? 'bg-[#ece9e2] text-neutral-900 font-medium'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
                  }`}
                >
                  <HistoryIcon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 shrink-0" />
                  <span className="truncate flex-1">{chat.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};
