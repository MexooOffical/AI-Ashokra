import React from 'react';
import {
  Clapperboard,
  Image as ImageIcon,
  Atom,
} from 'lucide-react';
import { QuickAction } from '../../types';

// Precise custom SVG for Slides icon matching reference screenshot
const SlidesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="7" y="4" width="10" height="16" rx="2" />
    <path d="M3 7v10" />
    <path d="M21 7v10" />
  </svg>
);

// Precise custom SVG for Compare icon matching reference screenshot: two split comparison panes
const CompareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

interface QuickActionsProps {
  onActionSelect: (action: QuickAction) => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'videos',
    label: 'Videos',
    iconName: 'Clapperboard',
    promptSuggestion: 'Create a 15-second cinematic product video showing modern headphones',
  },
  {
    id: 'slides',
    label: 'Slides',
    iconName: 'Slides',
    promptSuggestion: 'Generate a 10-slide investor pitch deck for AI Ashokra enterprise',
  },
  {
    id: 'images',
    label: 'Images',
    iconName: 'ImageIcon',
    promptSuggestion: 'Generate a minimalist architectural photograph of a pavilion at golden hour',
  },
  {
    id: 'compare',
    label: 'Compare',
    iconName: 'Compare',
    promptSuggestion: 'Compare React 19 server actions vs traditional Next.js API routes with benchmarks',
  },
  {
    id: 'deep-research',
    label: 'Deep Research',
    iconName: 'Atom',
    promptSuggestion: 'Conduct a comprehensive deep research report on autonomous AI agent workflows in 2026',
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionSelect }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clapperboard':
        return <Clapperboard className="w-[18px] h-[18px] text-neutral-700 stroke-[1.9]" />;
      case 'Slides':
        return <SlidesIcon className="w-[18px] h-[18px] text-neutral-700" />;
      case 'ImageIcon':
        return <ImageIcon className="w-[18px] h-[18px] text-neutral-700 stroke-[1.9]" />;
      case 'Compare':
        return <CompareIcon className="w-[18px] h-[18px] text-neutral-700" />;
      case 'Atom':
        return <Atom className="w-[18px] h-[18px] text-neutral-700 stroke-[1.9]" />;
      default:
        return null;
    }
  };

  return (
    <div
      id="quick-actions"
      className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-6 sm:mt-8 max-w-3xl mx-auto px-3"
    >
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.id}
          id={`quick-action-${action.id}`}
          type="button"
          onClick={() => onActionSelect(action)}
          className="inline-flex items-center gap-2.5 px-4.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white border border-neutral-200/95 text-sm sm:text-[15px] font-medium text-neutral-800 hover:text-neutral-950 hover:bg-neutral-50/90 hover:border-neutral-300 transition-all duration-150 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] cursor-pointer select-none active:scale-[0.98]"
        >
          <span className="shrink-0">{getIcon(action.iconName)}</span>
          <span className="leading-none">{action.label}</span>
        </button>
      ))}
    </div>
  );
};
