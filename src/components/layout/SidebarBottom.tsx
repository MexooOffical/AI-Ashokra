import React from 'react';
import { Tag, Crown, Flame } from 'lucide-react';
import { UserProfileData } from '../../types';
import { UserProfile } from './UserProfile';

interface SidebarBottomProps {
  user: UserProfileData;
  isCollapsed: boolean;
  onUpgradeClick: () => void;
  onOpenFirebase?: () => void;
}

export const SidebarBottom: React.FC<SidebarBottomProps> = ({
  user,
  isCollapsed,
  onUpgradeClick,
  onOpenFirebase,
}) => {
  const usagePercentage = Math.min(
    100,
    Math.round((user.messagesUsed / user.messagesLimit) * 100)
  );

  return (
    <div id="sidebar-bottom" className="mt-auto">
      {!isCollapsed ? (
        <>
          {/* Subtle horizontal divider line separating nav from bottom card */}
          <div className="w-full border-t border-neutral-200/60 mb-2.5" />

          {/* Outer warm gray card containing both Free Plan card and User Profile */}
          <div
            id="bottom-plan-container"
            className="bg-[#f4f3ef] border border-neutral-200/70 rounded-[24px] p-2.5 mx-3 mb-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            {/* Inner White Free Plan Card */}
            <div
              id="free-plan-card"
              className="bg-white rounded-[20px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-neutral-100/80"
            >
              {/* Centered Free Plan Header with Tag */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <Tag className="w-4 h-4 text-neutral-800 stroke-[1.8] -rotate-45" />
                <span className="text-[15px] font-medium text-neutral-900 tracking-tight">
                  {user.plan} Plan
                </span>
              </div>

              {/* Centered Usage Stat */}
              <p className="text-center text-[13px] text-neutral-500 mb-3 font-normal">
                {user.messagesUsed} out of {user.messagesLimit} messages used
              </p>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-neutral-200/80 rounded-full overflow-hidden mb-3.5">
                <div
                  className="h-full bg-[#10a37f] rounded-full transition-all duration-300"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>

              {/* Full-width black Upgrade Now Button */}
              <button
                id="upgrade-plan-btn"
                type="button"
                onClick={onUpgradeClick}
                className="w-full bg-[#18181b] hover:bg-black text-white text-[14px] font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Crown className="w-4 h-4 stroke-[1.8] text-white" />
                <span>Upgrade Now</span>
              </button>
            </div>

            {/* User Profile row placed directly inside the outer card */}
            <div className="mt-2.5">
              <UserProfile
                user={user}
                isCollapsed={false}
                onOpenUpgrade={onUpgradeClick}
                onOpenFirebase={onOpenFirebase}
              />
            </div>
          </div>
        </>
      ) : (
        /* Collapsed view upgrade & profile */
        <div className="p-2 flex flex-col items-center gap-2 mb-3">
          <div className="w-full border-t border-neutral-200/60 mb-2" />
          <button
            type="button"
            onClick={onOpenFirebase}
            title="Firebase Database"
            className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onUpgradeClick}
            title="Upgrade to Pro"
            className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer shadow-xs"
          >
            <Crown className="w-4 h-4 stroke-[1.8]" />
          </button>
          <UserProfile
            user={user}
            isCollapsed={true}
            onOpenUpgrade={onUpgradeClick}
            onOpenFirebase={onOpenFirebase}
          />
        </div>
      )}
    </div>
  );
};
