import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[4px] border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E5C97] disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#1E5C97] text-white border-[#164A7C] hover:bg-[#164A7C] active:bg-[#0F355C]',
    secondary: 'bg-[#FFFFFF] text-[#101826] border-[#C7D0DB] hover:bg-[#F8FAFC] active:bg-[#F1F4F8]',
    outline: 'bg-transparent text-[#526074] border-[#E1E6EC] hover:bg-[#F6F8FA] hover:text-[#101826]',
    danger: 'bg-[#6E1423] text-white border-[#540F1B] hover:bg-[#540F1B]',
    ghost: 'bg-transparent text-[#526074] border-transparent hover:bg-[#F6F8FA] hover:text-[#101826]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span
          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};
