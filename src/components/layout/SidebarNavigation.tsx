import React from 'react';
import {
  SquarePen,
  Image as ImageIcon,
  Clapperboard,
  Folder,
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
    <line x1="12" y1="8.5" x2="16.5" y2="9.2" />
    <line x1="11" y1="16.5" x2="15.5" y2="17.2" />
  </svg>
);

interface NavConfig {
  id: NavItemId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavConfig[] = [
  {
    id: 'new-chat',
    label: 'New Chat',
    icon: SquarePen,
  },
  {
    id: 'image-studio',
    label: 'Image Studio',
    icon: ImageIcon,
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

interface SidebarNavigationProps {
  activeId: NavItemId;
  isCollapsed: boolean;
  onSelect: (id: NavItemId) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeId,
  isCollapsed,
  onSelect,
}) => {
  return (
    <nav
      id="sidebar-navigation"
      aria-label="Main Navigation"
      className="flex flex-col gap-1 px-3 py-2 flex-1 overflow-y-auto"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;

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
                : 'px-3.5 py-2.5 gap-3.5 justify-between rounded-[20px]'
            } ${
              isActive
                ? 'bg-[#ece9e2] text-neutral-900 font-medium'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70 font-normal'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Icon
                className={`w-[19px] h-[19px] shrink-0 ${
                  isActive
                    ? 'text-neutral-900 stroke-[1.8]'
                    : 'text-neutral-600 group-hover:text-neutral-900 stroke-[1.6]'
                }`}
              />

              {!isCollapsed && (
                <span className="text-[15px] truncate leading-tight tracking-tight">
                  {item.label}
                </span>
              )}
            </div>

            {!isCollapsed && item.badge && (
              <span
                id={`badge-${item.id}`}
                className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#eceae6] text-neutral-600 border border-neutral-300/40"
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
    </nav>
  );
};
