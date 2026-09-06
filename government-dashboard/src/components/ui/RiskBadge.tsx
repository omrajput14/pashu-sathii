import React from 'react';
import { OutbreakRiskScore, getRiskToken } from '../../core/theme/tokens';

interface RiskBadgeProps {
  level?: OutbreakRiskScore | string | null;
  score?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showScore = true,
}) => {
  const token = getRiskToken(level);

  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 tracking-wider',
    md: 'text-xs px-2 py-0.5 font-medium tracking-wide',
    lg: 'text-sm px-2.5 py-1 font-semibold tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] border font-mono font-medium uppercase ${sizeClasses[size]}`}
      style={{
        color: token.color,
        backgroundColor: token.bg,
        borderColor: token.border,
      }}
      data-testid="risk-badge"
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-[1px]"
        style={{ backgroundColor: token.color }}
        aria-hidden="true"
      />
      <span>{token.label}</span>
      {showScore && score !== undefined && score !== null && (
        <span className="opacity-80 font-normal tabular-nums">({score})</span>
      )}
    </span>
  );
};
