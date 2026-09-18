/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, Flame } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './components/home/HomePage';
import { SearchModal } from './components/common/SearchModal';
import { UpgradeModal } from './components/common/UpgradeModal';
import { FirebaseConsoleModal } from './components/common/FirebaseConsoleModal';
import { NavItemId, UserProfileData } from './types';
import { initAuth, syncUserProfile } from './lib/firebase';

export default function App() {
  const [activeNavId, setActiveNavId] = useState<NavItemId>('new-chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isFirebaseOpen, setIsFirebaseOpen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [savedPromptsCount, setSavedPromptsCount] = useState(0);

  // User state corresponding to reference screenshot
  const [user, setUser] = useState<UserProfileData>({
    name: 'Spectar',
    plan: 'Free',
    avatarLetter: 'S',
    avatarColor: '#10b981',
    messagesUsed: 6,
    messagesLimit: 10,
  });

  // Initialize Firebase anonymous auth session and sync user profile to Firestore
  useEffect(() => {
    initAuth()
      .then((u) => {
        if (u) {
          setIsFirebaseConnected(true);
          syncUserProfile(user);
        }
      })
      .catch((err) => {
        console.warn('Firebase init:', err);
      });
  }, [user]);

  // Global keyboard shortcut: Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#fafaf9] border-b border-neutral-200/80 sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/assets/ai-ashokra-logo.png"
            alt="AI Ashokra"
            className="w-6 h-6 object-contain"
          />
          <span className="font-semibold text-neutral-900 text-sm">AI Ashokra</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsFirebaseOpen(true)}
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
            title="Firebase Console"
          >
            <Flame className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsUpgradeOpen(true)}
            className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-900 text-white shadow-2xs"
          >
            Pro
          </button>
        </div>
      </div>

      {/* Main Layout: Fixed Sidebar + Dynamic Content Canvas */}
      <div className="flex flex-1 relative">
        <Sidebar
          activeNavId={activeNavId}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNavSelect={(id) => setActiveNavId(id)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenUpgrade={() => setIsUpgradeOpen(true)}
          onOpenFirebase={() => setIsFirebaseOpen(true)}
          user={user}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content View with dynamic left offset matching sidebar width */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'
          }`}
        >
          {activeNavId === 'new-chat' ? (
            <HomePage
              userName={user.name}
              onNavigateTo={(section) => setActiveNavId(section as NavItemId)}
              onPromptSaved={(count) => {
                setSavedPromptsCount(count);
                // Increment messages used on user profile
                setUser((prev) => {
                  const updated = {
                    ...prev,
                    messagesUsed: Math.min(prev.messagesLimit, prev.messagesUsed + 1),
                  };
                  syncUserProfile(updated);
                  return updated;
                });
              }}
              onOpenFirebaseModal={() => setIsFirebaseOpen(true)}
              onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
            />
          ) : (
            /* Ready studio container for subsequent modules */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fafaf9]">
              <div className="max-w-md p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <img
                    src="/assets/ai-ashokra-logo.png"
                    alt="AI Ashokra"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 capitalize">
                  {activeNavId.replace('-', ' ')}
                </h2>
                <p className="text-xs text-neutral-500 mt-1 mb-4">
                  This studio workspace is ready to connect with AI Ashokra models and Cloud Firestore.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFirebaseOpen(true)}
                    className="text-xs font-medium px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>View Firestore</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNavId('new-chat')}
                    className="text-xs font-medium px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white transition-colors cursor-pointer"
                  >
                    Return to New Chat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNav={(id) => setActiveNavId(id)}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onSelectPlan={(planName) => {
          const updatedUser = {
            ...user,
            plan: planName,
            messagesLimit: planName === 'Pro' ? 100 : 30,
          };
          setUser(updatedUser);
          syncUserProfile(updatedUser);
        }}
      />

      <FirebaseConsoleModal
        isOpen={isFirebaseOpen}
        onClose={() => setIsFirebaseOpen(false)}
        isConnected={isFirebaseConnected}
        savedPromptsCount={savedPromptsCount}
      />
    </div>
  );
}
