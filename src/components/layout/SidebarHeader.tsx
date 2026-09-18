import React, { useState } from 'react';
import { Search, PanelLeftClose, PanelLeft } from 'lucide-react';
import { IconButton } from '../common/IconButton';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSearch?: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenSearch,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id="sidebar-header"
      className={`transition-all duration-300 ease-in-out ${
        isCollapsed
          ? 'flex items-center justify-center px-2 py-4'
          : 'flex items-center justify-between px-4 pt-4 pb-2'
      }`}
    >
      {isCollapsed ? (
        /* Collapsed state: Logo turns into the Expand Sidebar button on hover with smooth animation */
        <div className="relative flex items-center justify-center">
          <button
            id="collapsed-logo-toggle-btn"
            type="button"
            onClick={onToggleCollapse}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-neutral-100 active:scale-95 cursor-pointer focus:outline-none"
          >
            {/* AI Ashokra Logo */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
                isHovered
                  ? 'opacity-0 scale-70 -rotate-12 pointer-events-none'
                  : 'opacity-100 scale-100 rotate-0'
              }`}
            >
              <img
                src="/assets/ai-ashokra-logo.png"
                alt="AI Ashokra"
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-logo')) {
                    const fallback = document.createElement('div');
                    fallback.className =
                      'fallback-logo w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-base';
                    fallback.innerText = 'A';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>

            {/* Expand Sidebar Icon on hover */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
                isHovered
                  ? 'opacity-100 scale-100 rotate-0 text-neutral-900'
                  : 'opacity-0 scale-70 rotate-12 pointer-events-none text-neutral-500'
              }`}
            >
              <PanelLeft className="w-5 h-5 stroke-[1.8] text-neutral-800" />
            </div>

            {isHovered && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-left-1 pointer-events-none">
                Expand sidebar
              </div>
            )}
          </button>
        </div>
      ) : (
        /* Expanded state: Full logo + name on left, search and panel sidebar toggle on right */
        <>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0 flex items-center justify-center w-7 h-7 overflow-hidden">
              <img
                src="/assets/ai-ashokra-logo.png"
                alt="AI Ashokra"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-logo')) {
                    const fallback = document.createElement('div');
                    fallback.className =
                      'fallback-logo w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-base';
                    fallback.innerText = 'A';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>

            <span className="font-semibold text-neutral-900 text-[15px] tracking-tight truncate select-none">
              AI Ashokra
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              id="sidebar-search-btn"
              type="button"
              aria-label="Search"
              title="Search (Ctrl + K)"
              onClick={onOpenSearch}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100/80 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.6]" />
            </button>

            <button
              id="sidebar-toggle-btn"
              type="button"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              onClick={onToggleCollapse}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100/80 transition-colors cursor-pointer"
            >
              <PanelLeft className="w-5 h-5 stroke-[1.6]" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
