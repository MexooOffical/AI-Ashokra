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
