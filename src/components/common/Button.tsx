import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-neutral-900 hover:bg-black text-white shadow-xs',
    secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800',
    outline: 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90 shadow-xs hover:border-neutral-300',
    ghost: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
    pill: 'rounded-full bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:text-neutral-900',
  }[variant];

  const roundedClasses = variant === 'pill' ? 'rounded-full' : 'rounded-xl';

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${roundedClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </button>
  );
};
