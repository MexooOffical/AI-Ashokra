import React, { useState, useEffect } from 'react';
import { ExternalLink, Database, Sparkles } from 'lucide-react';
import { WelcomeSection } from './WelcomeSection';
import { PromptBox } from './PromptBox';
import { QuickActions } from './QuickActions';
import { PromptMode, QuickAction } from '../../types';
import { savePrompt, getRecentPrompts, FIRESTORE_CONSOLE_URL } from '../../lib/firebase';

interface HomePageProps {
  userName?: string;
  onNavigateTo?: (section: string) => void;
  onPromptSaved?: (count: number) => void;
  onOpenFirebaseModal?: () => void;
  onOpenUpgradeModal?: () => void;
  onStartChat?: (prompt: string, mode: PromptMode, selectedModels?: string[]) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  userName = 'Spectar',
  onPromptSaved,
  onOpenFirebaseModal,
  onOpenUpgradeModal,
  onStartChat,
}) => {
  // Empty default prompt so placeholder appears clean
  const [promptText, setPromptText] = useState('');
  const [activeNotification, setActiveNotification] = useState<{
    msg: string;
    isFirebase?: boolean;
    docId?: string;
  } | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  // Initial fetch of saved prompts from Firebase Firestore
  useEffect(() => {
    let isMounted = true;
    getRecentPrompts(10).then((prompts) => {
      if (isMounted) {
        setSavedCount(prompts.length);
        onPromptSaved?.(prompts.length);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [onPromptSaved]);

  const showNotification = (msg: string, isFirebase = false, docId?: string) => {
    setActiveNotification({ msg, isFirebase, docId });
    setTimeout(() => {
      setActiveNotification((current) => (current?.msg === msg ? null : current));
    }, 4500);
  };

  const handlePromptSubmit = async (
    prompt: string,
    mode: PromptMode,
    selectedModels?: string[]
  ) => {
    // Save to Cloud Firestore
    savePrompt(prompt, mode).catch(() => {});

    // Delegate immediately to chat conversation stream
    if (onStartChat) {
      onStartChat(prompt, mode, selectedModels);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.promptSuggestion) {
      setPromptText(action.promptSuggestion);
      showNotification(`Loaded ${action.label} prompt template`);
    }
  };

  return (
    <main
      id="home-page-container"
      className="relative flex-1 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-12 overflow-hidden bg-[#fafaf9]"
    >
      {/* Soft ethereal mint/emerald ambient glow with radiant presence */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[940px] max-w-[95vw] h-[560px] pointer-events-none select-none -z-0"
        style={{
          background:
            'radial-gradient(55% 55% at 50% 50%, rgba(167, 243, 208, 0.5) 0%, rgba(209, 250, 229, 0.3) 45%, rgba(240, 253, 244, 0.15) 70%, rgba(250, 250, 249, 0) 100%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Centered Main Interactive Canvas */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Welcome Greeting */}
        <WelcomeSection userName={userName} />

        {/* Central Search & Prompt Input */}
        <PromptBox
          value={promptText}
          onChange={setPromptText}
          onSubmit={handlePromptSubmit}
          placeholder="What would you like to create?"
          onOpenUpgrade={onOpenUpgradeModal}
        />

        {/* Quick Action Category Pills */}
        <QuickActions onActionSelect={handleQuickAction} />
      </div>

      {/* Floating notification for prompt actions and Firebase sync */}
      {activeNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-medium py-2.5 px-4 rounded-xl shadow-lg border border-neutral-800 animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{activeNotification.msg}</span>

          {activeNotification.isFirebase && (
            <button
              type="button"
              onClick={onOpenFirebaseModal}
              className="ml-1 text-emerald-300 hover:text-emerald-200 underline font-normal flex items-center gap-1 cursor-pointer"
            >
              <span>View in Console</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </main>
  );
};
