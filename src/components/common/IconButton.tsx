import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'ghost' | 'subtle' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'ghost',
  size = 'md',
  tooltip,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs p-1',
    md: 'w-8 h-8 text-sm p-1.5',
    lg: 'w-10 h-10 text-base p-2',
  }[size];

  const variantClasses = {
    ghost: 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100',
    subtle: 'text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100',
    outline: 'text-neutral-600 hover:text-neutral-900 border border-neutral-200 bg-white hover:bg-neutral-50',
  }[variant];

  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip || props['aria-label']}
      className={`inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
