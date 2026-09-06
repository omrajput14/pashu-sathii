import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'neutral' | 'confirmed' | 'suspected' | 'success' | 'outline' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles: Record<string, string> = {
    default: 'bg-[#E4EDF6] text-[#1E5C97] border-[#C5D9EB]',
    neutral: 'bg-[#F6F8FA] text-[#526074] border-[#E1E6EC]',
    confirmed: 'bg-[#FBEBEB] text-[#B7301F] border-[#F5C2C7]',
    suspected: 'bg-[#FEF3E8] text-[#D97B1F] border-[#F9D7B5]',
    success: 'bg-[#EDF7F0] text-[#3E7C4A] border-[#BFE4C9]',
    danger: 'bg-[#FBEBEB] text-[#B7301F] border-[#F5C2C7]',
    warning: 'bg-[#FEF3E8] text-[#D97B1F] border-[#F9D7B5]',
    info: 'bg-[#E4EDF6] text-[#1E5C97] border-[#C5D9EB]',
    outline: 'bg-transparent text-[#526074] border-[#C7D0DB]',
  };

  const sizeStyles = size === 'sm' ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[2px] border font-mono font-medium ${sizeStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
