import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', header, footer }) => {
  return (
    <div
      className={`bg-[#FFFFFF] border border-[#E1E6EC] rounded-[6px] shadow-subtle ${className}`}
    >
      {header && (
        <div className="px-4 py-3 border-b border-[#E1E6EC] bg-[#FAFBFC] rounded-t-[6px]">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-[#E1E6EC] bg-[#FAFBFC] rounded-b-[6px]">
          {footer}
        </div>
      )}
    </div>
  );
};
