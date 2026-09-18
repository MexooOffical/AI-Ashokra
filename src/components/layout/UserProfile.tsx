import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, Settings, LogOut, Sparkles, SlidersHorizontal, ShieldCheck, Flame } from 'lucide-react';
import { UserProfileData } from '../../types';

interface UserProfileProps {
  user: UserProfileData;
  isCollapsed: boolean;
  onOpenUpgrade?: () => void;
  onOpenFirebase?: () => void;
  onOpenSettings?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  isCollapsed,
  onOpenUpgrade,
  onOpenFirebase,
  onOpenSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="user-profile-menu"
          className="absolute bottom-full left-0 mb-2.5 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="px-3.5 py-2.5 border-b border-neutral-100">
            <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
            <p className="text-xs text-neutral-500">{user.plan} Account</p>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenFirebase?.();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl transition-colors cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Firebase Database</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenUpgrade?.();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Upgrade to Pro</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenSettings?.();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-neutral-500" />
              <span>Settings & Preferences</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
              <span>Model Configuration</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-[13px] text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-neutral-500" />
              <span>Data & Privacy</span>
            </button>
          </div>

          <div className="pt-1 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-[13px] text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Trigger Button */}
      <button
        id="user-profile-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center transition-colors cursor-pointer select-none ${
          isCollapsed
            ? 'justify-center p-2 rounded-xl hover:bg-neutral-100'
            : 'justify-between px-1.5 py-1 rounded-xl hover:bg-neutral-200/40 group'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-full bg-[#10a37f] text-white font-semibold text-base flex items-center justify-center shrink-0 select-none shadow-xs"
            style={{ backgroundColor: user.avatarColor || '#10a37f' }}
          >
            {user.avatarLetter}
          </div>

          {!isCollapsed && (
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[15px] font-semibold text-neutral-900 truncate leading-tight">
                {user.name}
              </span>
              <span className="text-xs text-neutral-400 font-normal leading-tight mt-0.5">
                {user.plan}
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <ChevronUp
            className={`w-4 h-4 text-neutral-400 group-hover:text-neutral-600 shrink-0 transition-transform duration-150 stroke-[2] ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
    </div>
  );
};
