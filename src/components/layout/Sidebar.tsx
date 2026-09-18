import React from 'react';
import { NavItemId, UserProfileData } from '../../types';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation, ChatHistoryItem } from './SidebarNavigation';
import { SidebarBottom } from './SidebarBottom';

interface SidebarProps {
  activeNavId: NavItemId;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavSelect: (id: NavItemId) => void;
  onOpenSearch: () => void;
  onOpenUpgrade: () => void;
  onOpenFirebase?: () => void;
  user: UserProfileData;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  chatHistory?: ChatHistoryItem[];
  activeChatId?: string | null;
  onSelectChat?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNavId,
  isCollapsed,
  onToggleCollapse,
  onNavSelect,
  onOpenSearch,
  onOpenUpgrade,
  onOpenFirebase,
  user,
  isMobileOpen,
  onCloseMobile,
  chatHistory,
  activeChatId,
  onSelectChat,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-neutral-200/80 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        } ${
          isMobileOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        <SidebarHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onOpenSearch={onOpenSearch}
        />

        <SidebarNavigation
          activeId={activeNavId}
          isCollapsed={isCollapsed}
          onSelect={(id) => {
            onNavSelect(id);
            if (isMobileOpen) onCloseMobile();
          }}
          chatHistory={chatHistory}
          activeChatId={activeChatId}
          onSelectChat={onSelectChat}
        />

        <SidebarBottom
          user={user}
          isCollapsed={isCollapsed}
          onUpgradeClick={onOpenUpgrade}
          onOpenFirebase={onOpenFirebase}
        />
      </aside>
    </>
  );
};
