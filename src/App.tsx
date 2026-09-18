/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Flame } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './components/home/HomePage';
import { ChatInterface } from './components/chat/ChatInterface';
import { SearchModal } from './components/common/SearchModal';
import { UpgradeModal } from './components/common/UpgradeModal';
import { FirebaseConsoleModal } from './components/common/FirebaseConsoleModal';
import { NavItemId, UserProfileData, ChatMessage, ChatSession, PromptMode } from './types';
import { initAuth, syncUserProfile } from './lib/firebase';
import { streamOpenRouterChat } from './lib/openrouter';

export default function App() {
  const [activeNavId, setActiveNavId] = useState<NavItemId>('new-chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isFirebaseOpen, setIsFirebaseOpen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [savedPromptsCount, setSavedPromptsCount] = useState(0);

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active chat session object
  const activeSession = chatSessions.find((s) => s.id === activeChatId);
  const messages = activeSession?.messages || [];

  // Active models & mode state
  const [currentAutoMode, setCurrentAutoMode] = useState(true);
  const [currentSelectedModelIds, setCurrentSelectedModelIds] = useState<string[]>([]);

  // User state corresponding to reference screenshot
  const [user, setUser] = useState<UserProfileData>({
    name: 'Spectar',
    plan: 'Free',
    avatarLetter: 'S',
    avatarColor: '#10b981',
    messagesUsed: 6,
    messagesLimit: 10,
  });

  // Initialize Firebase anonymous auth session once on mount and sync user profile
  useEffect(() => {
    initAuth()
      .then((u) => {
        if (u) {
          setIsFirebaseConnected(true);
        }
      })
      .catch(() => {});
  }, []);

  // Sync user profile when user changes
  useEffect(() => {
    syncUserProfile(user);
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

  // Send message and execute OpenRouter streaming
  const handleStartOrSendMessage = async (
    prompt: string,
    mode?: PromptMode,
    modelIds?: string[]
  ) => {
    if (!prompt.trim() || isGenerating) return;

    let sessionId = activeChatId;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = `assistant-${Date.now() + 1}`;
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      modelName: currentAutoMode ? 'Auto Mode' : 'Selected Model',
      isFindingModel: true,
      isStreaming: true,
    };

    if (!sessionId) {
      // Create a brand new session
      const newSession: ChatSession = {
        id: `chat-${Date.now()}`,
        title: prompt.slice(0, 30),
        createdAt: Date.now(),
        messages: [userMessage, assistantMessage],
        selectedModelIds: modelIds || currentSelectedModelIds,
        isAutoMode: currentAutoMode,
      };
      sessionId = newSession.id;
      setChatSessions((prev) => [newSession, ...prev]);
      setActiveChatId(newSession.id);
    } else {
      // Append to existing session
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, messages: [...s.messages, userMessage, assistantMessage] }
            : s
        )
      );
    }

    setIsGenerating(true);

    // Increment user usage counter
    setUser((prev) => {
      const updated = {
        ...prev,
        messagesUsed: Math.min(prev.messagesLimit, prev.messagesUsed + 1),
      };
      syncUserProfile(updated);
      return updated;
    });

    // "Finding the best model to answer..." transition delay (600ms) to match screenshot UI
    setTimeout(async () => {
      // Update isFindingModel to false
      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantPlaceholderId
                ? { ...m, isFindingModel: false }
                : m
            ),
          };
        })
      );

      // Call OpenRouter streaming
      try {
        const targetModelId =
          modelIds && modelIds.length > 0
            ? modelIds[0]
            : currentSelectedModelIds[0] || 'deepseek-chat';

        const history = (
          activeSession?.messages.filter(
            (m) => m.id !== userMessage.id && m.id !== assistantPlaceholderId
          ) || []
        ).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        await streamOpenRouterChat(prompt, history, targetModelId, {
          onChunk: (chunk) => {
            setChatSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sessionId) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: m.content + chunk }
                      : m
                  ),
                };
              })
            );
          },
          onDone: (fullText) => {
            setChatSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sessionId) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: fullText, isStreaming: false, isFindingModel: false }
                      : m
                  ),
                };
              })
            );
            setIsGenerating(false);
          },
          onError: (err) => {
            setChatSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sessionId) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? {
                          ...m,
                          content:
                            m.content ||
                            'I am currently experiencing a connection issue with OpenRouter. Please verify the network or API key.',
                          isStreaming: false,
                          isFindingModel: false,
                        }
                      : m
                  ),
                };
              })
            );
            setIsGenerating(false);
          },
        });
      } catch (e) {
        setIsGenerating(false);
      }
    }, 700);
  };

  const handleLikeMessage = (messageId: string) => {
    if (!activeChatId) return;
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeChatId) return s;
        return {
          ...s,
          messages: s.messages.map((m) =>
            m.id === messageId ? { ...m, liked: !m.liked, disliked: false } : m
          ),
        };
      })
    );
  };

  const handleDislikeMessage = (messageId: string) => {
    if (!activeChatId) return;
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeChatId) return s;
        return {
          ...s,
          messages: s.messages.map((m) =>
            m.id === messageId ? { ...m, disliked: !m.disliked, liked: false } : m
          ),
        };
      })
    );
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setActiveNavId('new-chat');
  };

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
          onNavSelect={(id) => {
            setActiveNavId(id);
            if (id === 'new-chat') {
              setActiveChatId(null);
            }
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenUpgrade={() => setIsUpgradeOpen(true)}
          onOpenFirebase={() => setIsFirebaseOpen(true)}
          user={user}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          chatHistory={chatSessions.map((c) => ({
            id: c.id,
            title: c.title,
          }))}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setActiveNavId('new-chat');
          }}
        />

        {/* Content View with dynamic left offset matching sidebar width */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'
          }`}
        >
          {activeNavId === 'new-chat' && !activeChatId ? (
            <HomePage
              userName={user.name}
              onNavigateTo={(section) => setActiveNavId(section as NavItemId)}
              onPromptSaved={(count) => setSavedPromptsCount(count)}
              onOpenFirebaseModal={() => setIsFirebaseOpen(true)}
              onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
              onStartChat={(prompt, mode, selectedModels) => {
                handleStartOrSendMessage(prompt, mode, selectedModels);
              }}
            />
          ) : activeNavId === 'new-chat' && activeChatId ? (
            <ChatInterface
              messages={messages}
              isLoading={isGenerating}
              onSendMessage={(txt) => handleStartOrSendMessage(txt)}
              selectedModelIds={currentSelectedModelIds}
              isAutoMode={currentAutoMode}
              onModelChange={(auto, ids) => {
                setCurrentAutoMode(auto);
                setCurrentSelectedModelIds(ids);
              }}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
              onLike={handleLikeMessage}
              onDislike={handleDislikeMessage}
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
                    onClick={handleNewChat}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-medium hover:bg-black transition-colors"
                  >
                    Back to Chat
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
        onSelectNav={(id: NavItemId) => {
          setActiveNavId(id);
          setIsSearchOpen(false);
        }}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
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
