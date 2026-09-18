import React from 'react';

interface WelcomeSectionProps {
  userName?: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  userName = 'Spectar',
}) => {
  return (
    <div id="welcome-section" className="text-center mb-8 sm:mb-10 px-2">
      <h1 className="text-4xl sm:text-5xl md:text-[50px] font-normal tracking-[-0.025em] text-neutral-900 select-none leading-[1.18]">
        {userName ? `Hi ${userName}, how can I help you today?` : 'Hi, how can I help you today?'}
      </h1>
    </div>
  );
};
