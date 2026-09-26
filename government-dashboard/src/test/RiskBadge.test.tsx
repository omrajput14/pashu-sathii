import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskBadge } from '../components/ui/RiskBadge';
import {
  RISK_THRESHOLDS,
  RISK_CONFIG,
  classifyScoreToRiskLevel,
  resolveRiskToken,
} from '../core/theme/tokens';

describe('Risk Taxonomy & RiskBadge Component', () => {
  it('strictly adheres to backend MultiSignalRiskEngine thresholds', () => {
    // Backend: CRITICAL >= 80, HIGH >= 55, MEDIUM >= 30, LOW < 30
    expect(RISK_THRESHOLDS.CRITICAL_MIN).toBe(80);
    expect(RISK_THRESHOLDS.HIGH_MIN).toBe(55);
    expect(RISK_THRESHOLDS.MEDIUM_MIN).toBe(30);
    expect(RISK_THRESHOLDS.LOW_MAX).toBe(29);

    expect(classifyScoreToRiskLevel(95)).toBe('CRITICAL');
    expect(classifyScoreToRiskLevel(80)).toBe('CRITICAL');
    expect(classifyScoreToRiskLevel(79)).toBe('HIGH');
    expect(classifyScoreToRiskLevel(55)).toBe('HIGH');
    expect(classifyScoreToRiskLevel(54)).toBe('MEDIUM');
    expect(classifyScoreToRiskLevel(30)).toBe('MEDIUM');
    expect(classifyScoreToRiskLevel(29)).toBe('LOW');
    expect(classifyScoreToRiskLevel(0)).toBe('LOW');
  });

  it('renders CRITICAL risk badge with correct token styles', () => {
    render(<RiskBadge level="CRITICAL" score={88} />);
    const badge = screen.getByTestId('risk-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('CRITICAL');
    expect(badge).toHaveTextContent('(88)');
  });

  it('renders HIGH risk badge with score', () => {
    render(<RiskBadge level="HIGH" score={65} />);
    const badge = screen.getByTestId('risk-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('HIGH');
    expect(badge).toHaveTextContent('(65)');
  });

  it('renders MEDIUM risk badge', () => {
    render(<RiskBadge level="MEDIUM" score={42} />);
    const badge = screen.getByTestId('risk-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('MEDIUM');
    expect(badge).toHaveTextContent('(42)');
  });

  it('renders LOW risk badge as default for null level', () => {
    render(<RiskBadge level={null} />);
    const badge = screen.getByTestId('risk-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('LOW');
  });

  // OutbreakScheduler stamps riskScore=LOW when it auto-resolves a cluster but
  // leaves compositeRiskScore alone, so these two fields routinely disagree.
  it('never shows a label that contradicts the score it prints', () => {
    render(<RiskBadge level="LOW" score={71} />);
    const badge = screen.getByTestId('risk-badge');
    expect(badge).toHaveTextContent('(71)');
    expect(badge).toHaveTextContent('HIGH');
    expect(badge).not.toHaveTextContent('LOW');
  });

  it('resolveRiskToken derives colour from the score, not the stale enum', () => {
    expect(resolveRiskToken({ level: 'LOW', score: 71 }).color).toBe(RISK_CONFIG.HIGH.color);
    expect(resolveRiskToken({ level: 'LOW', score: 85 }).color).toBe(RISK_CONFIG.CRITICAL.color);
    expect(resolveRiskToken({ level: 'LOW', score: 36 }).color).toBe(RISK_CONFIG.MEDIUM.color);
    // falls back to the enum when no score is available
    expect(resolveRiskToken({ level: 'CRITICAL', score: null }).color).toBe(
      RISK_CONFIG.CRITICAL.color
    );
  });

  it('gives equal scores the same colour regardless of cluster status', () => {
    // A resolved 71 and an active 71 must not be coloured differently - status is
    // carried by the status field and filter, not by the risk palette.
    expect(resolveRiskToken({ level: 'LOW', score: 71 }).color).toBe(
      resolveRiskToken({ level: 'HIGH', score: 71 }).color
    );
  });
});
