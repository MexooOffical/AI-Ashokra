/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Flame, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './components/home/HomePage';
import { ChatInterface } from './components/chat/ChatInterface';
import { SearchModal } from './components/common/SearchModal';
import { UpgradeModal } from './components/common/UpgradeModal';
import { FirebaseConsoleModal } from './components/common/FirebaseConsoleModal';
import { SettingsModal } from './components/common/SettingsModal';
import { NavItemId, UserProfileData, ChatMessage, ChatSession, PromptMode } from './types';
import {
  initAuth,
  syncUserProfile,
  testConnection,
  subscribeQuotaStatus,
  QuotaStatus,
  getStoredUserProfile,
  FIRESTORE_UPGRADE_URL,
  FIRESTORE_PRICING_URL,
} from './lib/firebase';
import { streamOpenRouterChat } from './lib/openrouter';

export default function App() {
  const [activeNavId, setActiveNavId] = useState<NavItemId>('new-chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isFirebaseOpen, setIsFirebaseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [savedPromptsCount, setSavedPromptsCount] = useState(0);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus>({ isExceeded: false });
  const [isQuotaBannerDismissed, setIsQuotaBannerDismissed] = useState(false);
  const isInitialUserMount = useRef(true);

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

  // Generation cancellation refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const findingModelTimeoutRef = useRef<any>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);

  // User state corresponding to reference screenshot
  const [user, setUser] = useState<UserProfileData>(() => {
    const stored = getStoredUserProfile();
    if (stored) return stored;
    return {
      name: 'Spectar',
      plan: 'Free',
      avatarLetter: 'S',
      avatarColor: '#10b981',
      messagesUsed: 6,
      messagesLimit: 10,
    };
  });

  // Initialize Firebase anonymous auth session once on mount, test connection, and monitor quota
  useEffect(() => {
    testConnection();
    const unsub = subscribeQuotaStatus((status) => {
      setQuotaStatus(status);
    });

    initAuth()
      .then((u) => {
        if (u) {
          setIsFirebaseConnected(true);
        }
      })
      .catch(() => {});

    return () => {
      unsub();
    };
  }, []);

  // Sync user profile when user changes (skipping initial mount)
  useEffect(() => {
    if (isInitialUserMount.current) {
      isInitialUserMount.current = false;
      return;
    }
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

  // Stop/cancel active generation immediately
  const handleStopGenerating = () => {
    if (findingModelTimeoutRef.current) {
      clearTimeout(findingModelTimeoutRef.current);
      findingModelTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsGenerating(false);

    const targetSessionId = activeSessionIdRef.current || activeChatId;
    const targetAssistantId = activeAssistantIdRef.current;

    if (targetSessionId && targetAssistantId) {
      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === targetAssistantId
                ? {
                    ...m,
                    isStreaming: false,
                    isFindingModel: false,
                    content: m.content || 'Response generation stopped by user.',
                  }
                : m
            ),
          };
        })
      );
    }
  };

  // Send message and execute OpenRouter streaming
  const handleStartOrSendMessage = async (
    prompt: string,
    mode?: PromptMode,
    modelIds?: string[]
  ) => {
    if (!prompt.trim() || isGenerating) return;

    // Abort any existing generation
    if (findingModelTimeoutRef.current) {
      clearTimeout(findingModelTimeoutRef.current);
      findingModelTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

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

    activeAssistantIdRef.current = assistantPlaceholderId;

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
      activeSessionIdRef.current = newSession.id;
      setChatSessions((prev) => [newSession, ...prev]);
      setActiveChatId(newSession.id);
    } else {
      activeSessionIdRef.current = sessionId;
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
    findingModelTimeoutRef.current = setTimeout(async () => {
      findingModelTimeoutRef.current = null;
      if (abortController.signal.aborted) return;

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

        await streamOpenRouterChat(
          prompt,
          history,
          targetModelId,
          {
            onChunk: (chunk) => {
              if (abortController.signal.aborted) return;
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
              abortControllerRef.current = null;
            },
            onError: (err) => {
              if (abortController.signal.aborted) return;
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
              abortControllerRef.current = null;
            },
          },
          abortController.signal
        );
      } catch (e) {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    }, 600);
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
          onOpenSettings={() => setIsSettingsOpen(true)}
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
          {/* Quota Exceeded Notice Banner */}
          {quotaStatus.isExceeded && !isQuotaBannerDismissed && (
            <div
              id="firestore-quota-banner"
              className="bg-amber-50/95 border-b border-amber-200/90 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-amber-950 z-20 sticky top-0 backdrop-blur-xs gap-2"
            >
              <div className="flex items-center gap-2 max-w-2xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Firestore Daily Write Quota Reached:</strong> Operating safely in local storage mode until quota resets tomorrow.
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={FIRESTORE_UPGRADE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-black underline"
                >
                  <span>Upgrade Database</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsQuotaBannerDismissed(true)}
                  className="p-1 text-amber-700 hover:text-amber-950 rounded cursor-pointer"
                  aria-label="Dismiss notice"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

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
              onStop={handleStopGenerating}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />
    </div>
  );
}
