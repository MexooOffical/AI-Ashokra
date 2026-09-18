import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  ToggleLeft,
  Brain,
  Crown,
  Gift,
  User,
  Monitor,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { UserProfileData } from '../../types';

export type SettingsTab =
  | 'general'
  | 'preferences'
  | 'memory'
  | 'subscription'
  | 'refer'
  | 'profile';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileData;
  onUpdateUser?: (updated: Partial<UserProfileData>) => void;
  initialTab?: SettingsTab;
  onOpenUpgrade?: () => void;
}

export const ACCENT_COLORS = [
  { id: 'green', hex: '#10b981', label: 'Emerald' },
  { id: 'blue', hex: '#2563eb', label: 'Blue' },
  { id: 'purple', hex: '#8b5cf6', label: 'Purple' },
  { id: 'orange', hex: '#e28724', label: 'Orange' },
  { id: 'red', hex: '#ef4444', label: 'Coral' },
];

export const FONT_OPTIONS = [
  {
    id: 'google-sans',
    name: 'Google Sans Flex',
    subtitle: 'Ask AI Fiesta anything',
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  {
    id: 'figtree',
    name: 'Figtree',
    subtitle: 'Ask AI Fiesta anything',
    fontFamily: "'Figtree', system-ui, sans-serif",
  },
  {
    id: 'geist',
    name: 'Geist',
    subtitle: 'Ask AI Fiesta anything',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  {
    id: 'instrument-sans',
    name: 'Instrument Sans',
    subtitle: 'Ask AI Fiesta anything',
    fontFamily: "'Instrument Sans', system-ui, sans-serif",
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    subtitle: 'Ask AI Fiesta anything',
    fontFamily: "'JetBrains Mono', monospace",
  },
  {
    id: 'ibm-plex-sans',
    name: 'IBM Plex Sans',
    subtitle: 'Ask AI Fiesta anything',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  {
    id: 'source-serif',
    name: 'Source Serif',
    subtitle: 'Ask AI Fiesta anything',
    fontFamily: "'Source Serif 4', Georgia, serif",
  },
  {
    id: 'system',
    name: 'System (SF Pro)',
    subtitle: 'Ask AI Fiesta anything',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  initialTab = 'general',
  onOpenUpgrade,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [appearance, setAppearance] = useState<'system' | 'light' | 'dark'>('light');
  const [selectedAccentHex, setSelectedAccentHex] = useState<string>(
    user.avatarColor || '#10b981'
  );
  const [selectedFontId, setSelectedFontId] = useState<string>('google-sans');

  if (!isOpen) return null;

  const handleSelectAccent = (hex: string) => {
    setSelectedAccentHex(hex);
    onUpdateUser?.({ avatarColor: hex });
  };

  const handleSelectFont = (font: (typeof FONT_OPTIONS)[0]) => {
    setSelectedFontId(font.id);
    document.documentElement.style.fontFamily = font.fontFamily;
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="settings-modal-card"
        className="bg-white rounded-[26px] shadow-2xl w-full max-w-[760px] h-[540px] max-h-[90vh] flex overflow-hidden border border-neutral-200/80 animate-in zoom-in-95 duration-200"
      >
        {/* Left Navigation Sidebar */}
        <div className="w-[220px] shrink-0 border-r border-neutral-100 flex flex-col p-4 bg-white select-none">
          <h2 className="text-[17px] font-semibold text-neutral-900 px-3 pt-1 pb-4">
            Settings
          </h2>

          <nav className="space-y-1">
            {/* General */}
            <button
              type="button"
              id="settings-nav-general"
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'general'
                  ? 'bg-[#ececec] text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <SettingsIcon className="w-4 h-4 stroke-[1.8] shrink-0" />
              <span>General</span>
            </button>

            {/* AI Preferences */}
            <button
              type="button"
              id="settings-nav-preferences"
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-normal transition-colors cursor-pointer text-left ${
                activeTab === 'preferences'
                  ? 'bg-[#ececec] text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <ToggleLeft className="w-4 h-4 stroke-[1.8] shrink-0" />
              <span>AI Preferences</span>
            </button>

            {/* Memory */}
            <button
              type="button"
              id="settings-nav-memory"
              onClick={() => setActiveTab('memory')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-normal transition-colors cursor-pointer text-left ${
                activeTab === 'memory'
                  ? 'bg-[#ececec] text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Brain className="w-4 h-4 stroke-[1.8] shrink-0" />
              <span>Memory</span>
            </button>

            {/* Subscription */}
            <button
              type="button"
              id="settings-nav-subscription"
              onClick={() => setActiveTab('subscription')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-normal transition-colors cursor-pointer text-left ${
                activeTab === 'subscription'
                  ? 'bg-[#ececec] text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Crown className="w-4 h-4 stroke-[1.8] shrink-0" />
              <span>Subscription</span>
            </button>

            {/* Refer & Earn */}
            <button
              type="button"
              id="settings-nav-refer"
              onClick={() => setActiveTab('refer')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-normal transition-colors cursor-pointer text-left ${
                activeTab === 'refer'
                  ? 'bg-[#ececec] text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Gift className="w-4 h-4 stroke-[1.8] shrink-0" />
              <span>Refer & Earn</span>
            </button>

            {/* Profile */}
            <button
              type="button"
              id="settings-nav-profile"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-normal transition-colors cursor-pointer text-left ${
                activeTab === 'profile'
                  ? 'bg-[#ececec] text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <User className="w-4 h-4 stroke-[1.8] shrink-0" />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-white">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-neutral-900 leading-tight">
                {activeTab === 'general' && 'General'}
                {activeTab === 'preferences' && 'AI Preferences'}
                {activeTab === 'memory' && 'Memory'}
                {activeTab === 'subscription' && 'Subscription'}
                {activeTab === 'refer' && 'Refer & Earn'}
                {activeTab === 'profile' && 'Profile'}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {activeTab === 'general' && 'Make AI Fiesta look the way you like.'}
                {activeTab === 'preferences' && 'Configure AI model behavior, system instructions, and response style.'}
                {activeTab === 'memory' && 'Manage what AI remembers about you across conversations.'}
                {activeTab === 'subscription' && 'Manage your plan, limits, and billing details.'}
                {activeTab === 'refer' && 'Invite friends to earn additional message credits.'}
                {activeTab === 'profile' && 'Manage your account details and display name.'}
              </p>
            </div>

            <button
              type="button"
              id="settings-close-btn"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-800 p-1 rounded-lg transition-colors cursor-pointer -mt-1 -mr-1"
              aria-label="Close settings"
            >
              <X className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>

          {/* TAB CONTENT: General (Exact UI from user reference screenshot) */}
          {activeTab === 'general' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Appearance Section */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 mb-2.5">
                  Appearance
                </h4>
                <div className="bg-[#f4f4f4] rounded-full p-1 flex items-center border border-neutral-200/50">
                  {/* System */}
                  <button
                    type="button"
                    onClick={() => setAppearance('system')}
                    className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      appearance === 'system'
                        ? 'bg-[#18181b] text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>System</span>
                  </button>

                  {/* Light (Selected in reference) */}
                  <button
                    type="button"
                    onClick={() => setAppearance('light')}
                    className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      appearance === 'light'
                        ? 'bg-[#18181b] text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>

                  {/* Dark */}
                  <button
                    type="button"
                    onClick={() => setAppearance('dark')}
                    className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      appearance === 'dark'
                        ? 'bg-[#18181b] text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-100" />

              {/* Accent Color Section */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 mb-3">
                  Accent Color
                </h4>
                <div className="flex items-center gap-3.5">
                  {ACCENT_COLORS.map((color) => {
                    const isSelected = selectedAccentHex === color.hex;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => handleSelectAccent(color.hex)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                        style={{ backgroundColor: color.hex }}
                        aria-label={`Select ${color.label} accent color`}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-100" />

              {/* Font Section */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 mb-3">
                  Font
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {FONT_OPTIONS.map((font) => {
                    const isSelected = selectedFontId === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => handleSelectFont(font)}
                        className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#eaecef] border-transparent'
                            : 'bg-white hover:bg-neutral-50/80 border-neutral-200/80'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p
                            className="text-[13px] font-medium text-neutral-900 leading-snug truncate"
                            style={{ fontFamily: font.fontFamily }}
                          >
                            {font.name}
                          </p>
                          <p
                            className="text-[11px] text-neutral-500 leading-tight truncate mt-0.5"
                            style={{ fontFamily: font.fontFamily }}
                          >
                            {font.subtitle}
                          </p>
                        </div>

                        {/* Radio selection circle indicator */}
                        <div className="shrink-0">
                          {isSelected ? (
                            <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center text-white">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-neutral-300 bg-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: AI Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-neutral-700">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-neutral-900 block">Stream reasoning tokens</span>
                    <span className="text-neutral-500 text-[11px]">Display real-time chain-of-thought thought process</span>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle-checkbox accent-emerald-600 cursor-pointer" />
                </div>
                <div className="border-t border-neutral-200/50 pt-3 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-neutral-900 block">Auto-translate voice to English</span>
                    <span className="text-neutral-500 text-[11px]">Automatically translate non-English audio inputs to English</span>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle-checkbox accent-emerald-600 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Memory */}
          {activeTab === 'memory' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-neutral-700">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-2">
                <span className="font-medium text-neutral-900 block">Personalized Context Memory</span>
                <p className="text-neutral-500 text-[11px]">
                  Memory allows AI Ashokra to remember your details, coding style, and preferences across sessions.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium rounded-full text-[11px]">
                    ● Memory is active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Subscription */}
          {activeTab === 'subscription' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-neutral-700">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900 text-sm block">Current Plan: {user.plan}</span>
                    <span className="text-neutral-500 text-[11px]">{user.messagesUsed} of {user.messagesLimit} free messages used</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenUpgrade?.();
                    }}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl font-medium text-xs cursor-pointer shadow-xs"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Refer & Earn */}
          {activeTab === 'refer' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-neutral-700">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-2">
                <span className="font-medium text-neutral-900 block">Invite Friends, Get Free Messages</span>
                <p className="text-neutral-500 text-[11px]">
                  Share your invitation link with friends to get +10 additional daily model queries for each referral who joins.
                </p>
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    readOnly
                    value="https://ai-ashokra.app/ref/spectar"
                    className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText('https://ai-ashokra.app/ref/spectar')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-neutral-700">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-3">
                <div>
                  <label className="font-medium text-neutral-900 block mb-1">Display Name</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    onChange={(e) => onUpdateUser?.({ name: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-900 block mb-1">Avatar Letter</label>
                  <input
                    type="text"
                    maxLength={2}
                    defaultValue={user.avatarLetter}
                    onChange={(e) => onUpdateUser?.({ avatarLetter: e.target.value.toUpperCase() })}
                    className="w-20 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 text-center font-bold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
