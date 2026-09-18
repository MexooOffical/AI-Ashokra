export type NavItemId =
  | 'new-chat'
  | 'image-studio'
  | 'video-studio'
  | 'slides'
  | 'experts'
  | 'projects'
  | 'library'
  | 'compare'
  | 'deep-research'
  | 'settings';

export interface NavItem {
  id: NavItemId;
  label: string;
  iconName: string;
  badge?: string;
  shortcut?: string;
}

export interface UserProfileData {
  name: string;
  plan: string;
  avatarLetter: string;
  avatarColor?: string;
  messagesUsed: number;
  messagesLimit: number;
}

export type PromptMode = 'Auto' | 'Ashokra Fast' | 'Ashokra Ultra' | 'Ashokra Pro';

export interface QuickAction {
  id: string;
  label: string;
  iconName: string;
  promptSuggestion?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider?: string;
  logo: string;
  isFree?: boolean;
  isLocked?: boolean;
  multiplier?: string;
  category?: 'popular' | 'intelligent' | 'latest';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelName?: string;
  isFindingModel?: boolean;
  isStreaming?: boolean;
  liked?: boolean;
  disliked?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
  selectedModelIds?: string[];
  isAutoMode?: boolean;
}
