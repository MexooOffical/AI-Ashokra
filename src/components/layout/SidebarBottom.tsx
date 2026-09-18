import React, { useState, useRef, useEffect } from 'react';
import {
  Tag,
  Crown,
  ChevronDown,
  Settings,
  ToggleLeft,
  BookOpen,
  Terminal,
  LogOut,
} from 'lucide-react';
import { UserProfileData } from '../../types';

interface SidebarBottomProps {
  user: UserProfileData;
  isCollapsed: boolean;
  onUpgradeClick: () => void;
  onOpenFirebase?: () => void;
}

export const SidebarBottom: React.FC<SidebarBottomProps> = ({
  user,
  isCollapsed,
  onUpgradeClick,
  onOpenFirebase,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const usagePercentage = Math.min(
    100,
    Math.round((user.messagesUsed / user.messagesLimit) * 100)
  );

  // Close dropdown menu if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div id="sidebar-bottom" className="mt-auto relative" ref={containerRef}>
      {!isCollapsed ? (
        <>
          {/* Subtle horizontal divider line */}
          <div className="w-full border-t border-neutral-200/60 mb-2.5" />

          {/* Main Card Container with smooth upward expansion */}
          <div
            id="bottom-card-wrapper"
            className="bg-[#f4f3ef] border border-neutral-200/70 rounded-[24px] p-2.5 mx-3 mb-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out"
          >
            {/* Pop-up Panel that slides/expands upward when Spectar is clicked */}
            {isMenuOpen && (
              <div
                id="spectar-expanded-card"
                className="bg-white rounded-[20px] p-4 mb-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-neutral-100/90 animate-in fade-in slide-in-from-bottom-3 duration-200"
              >
                {/* Free Plan Header */}
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <Tag className="w-4 h-4 text-neutral-800 stroke-[1.8] -rotate-45" />
                  <span className="text-[15px] font-medium text-neutral-900 tracking-tight">
                    {user.plan} Plan
                  </span>
                </div>

                {/* Usage text */}
                <p className="text-center text-[13px] text-neutral-500 mb-3 font-normal">
                  {user.messagesUsed} out of {user.messagesLimit} messages used
                </p>

                {/* Green Progress Bar */}
                <div className="w-full h-2 bg-neutral-200/80 rounded-full overflow-hidden mb-3.5">
                  <div
                    className="h-full bg-[#10a37f] rounded-full transition-all duration-300"
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>

                {/* Black Upgrade Now Button with Crown */}
                <button
                  id="upgrade-plan-btn"
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onUpgradeClick();
                  }}
                  className="w-full bg-[#18181b] hover:bg-black text-white text-[14px] font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] mb-4"
                >
                  <Crown className="w-4 h-4 stroke-[1.8] text-white" />
                  <span>Upgrade Now</span>
                </button>

                {/* Navigation items list */}
                <div className="space-y-1 text-[13px] sm:text-[14px] text-neutral-700">
                  {/* Settings */}
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3 py-2 px-1 text-left hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-neutral-500 stroke-[1.8]" />
                    <span>Settings</span>
                  </button>

                  {/* AI Preferences */}
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3 py-2 px-1 text-left hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    <ToggleLeft className="w-4 h-4 text-neutral-500 stroke-[1.8]" />
                    <span>AI Preferences</span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-neutral-100 my-1" />

                  {/* How to use AI Fiesta / Ashokra */}
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3 py-2 px-1 text-left hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-neutral-500 stroke-[1.8]" />
                    <span>How to use AI Ashokra</span>
                  </button>

                  {/* PromptBook */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenFirebase?.();
                    }}
                    className="w-full flex items-center gap-3 py-2 px-1 text-left hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    <Terminal className="w-4 h-4 text-neutral-500 stroke-[1.8]" />
                    <span>PromptBook</span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-neutral-100 my-1" />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3 py-2 px-1 text-left text-red-500 hover:text-red-600 transition-colors cursor-pointer font-normal"
                  >
                    <LogOut className="w-4 h-4 stroke-[1.8]" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Spectar User Trigger Row (Always Visible at bottom) */}
            <button
              id="spectar-user-btn"
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-200/50 transition-colors cursor-pointer select-none group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Circular Avatar 'S' */}
                <div
                  className="w-9 h-9 rounded-full bg-[#10a37f] text-white font-semibold text-base flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: user.avatarColor || '#10a37f' }}
                >
                  {user.avatarLetter}
                </div>

                {/* Name and plan */}
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[15px] font-medium text-neutral-900 truncate leading-tight">
                    {user.name}
                  </span>
                  <span className="text-xs text-neutral-400 font-normal leading-tight mt-0.5">
                    {user.plan}
                  </span>
                </div>
              </div>

              {/* Chevron Down / Up indicator matching screenshot */}
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 group-hover:text-neutral-600 shrink-0 transition-transform duration-200 stroke-[2] ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </>
      ) : (
        /* Collapsed Icon-Only View */
        <div className="p-2 flex flex-col items-center gap-2 mb-3">
          <div className="w-full border-t border-neutral-200/60 mb-2" />
          <button
            type="button"
            onClick={onUpgradeClick}
            title="Upgrade to Pro"
            className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer shadow-xs"
          >
            <Crown className="w-4 h-4 stroke-[1.8]" />
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title={user.name}
            className="w-9 h-9 rounded-full bg-[#10a37f] text-white font-semibold text-sm flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:opacity-90"
            style={{ backgroundColor: user.avatarColor || '#10a37f' }}
          >
            {user.avatarLetter}
          </button>
        </div>
      )}
    </div>
  );
};
