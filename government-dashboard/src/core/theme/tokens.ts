/**
 * VETRA Government Surveillance Command Center — Design Tokens & Authoritative Risk Taxonomy
 * Backend Source of Truth: app.vetra.disease.risk.RiskScoreProperties & MultiSignalRiskEngine
 */

export const RISK_THRESHOLDS = {
  CRITICAL_MIN: 80, // score >= 80 -> CRITICAL
  HIGH_MIN: 55,     // score >= 55 and < 80 -> HIGH
  MEDIUM_MIN: 30,   // score >= 30 and < 55 -> MEDIUM
  LOW_MAX: 29,      // score < 30 -> LOW
} as const;

export const RISK_CONFIG = {
  CRITICAL: {
    level: 'CRITICAL' as const,
    label: 'CRITICAL',
    scoreRangeLabel: 'Score ≥ 80',
    minScore: RISK_THRESHOLDS.CRITICAL_MIN,
    maxScore: 100,
    color: '#6E1423',
    bg: '#FBEBEB',
    border: '#F5C2C7',
    rank: 4,
  },
  HIGH: {
    level: 'HIGH' as const,
    label: 'HIGH',
    scoreRangeLabel: 'Score 55–79',
    minScore: RISK_THRESHOLDS.HIGH_MIN,
    maxScore: 79,
    color: '#D97B1F',
    bg: '#FEF3E8',
    border: '#F9D7B5',
    rank: 3,
  },
  MEDIUM: {
    level: 'MEDIUM' as const,
    label: 'MEDIUM',
    scoreRangeLabel: 'Score 30–54',
    minScore: RISK_THRESHOLDS.MEDIUM_MIN,
    maxScore: 54,
    color: '#C9A227',
    bg: '#FDF8E7',
    border: '#F4E5A8',
    rank: 2,
  },
  LOW: {
    level: 'LOW' as const,
    label: 'LOW',
    scoreRangeLabel: 'Score 0–29',
    minScore: 0,
    maxScore: RISK_THRESHOLDS.LOW_MAX,
    color: '#3E7C4A',
    bg: '#EDF7F0',
    border: '#BFE4C9',
    rank: 1,
  },
} as const;

export const COLORS = {
  navBg: '#0E1A2B',
  navText: '#9FB1C4',
  navTextActive: '#F4F7FA',
  navBorder: '#1B2B40',
  navHover: '#142337',

  workspaceBg: '#F6F8FA',
  surface: '#FFFFFF',
  surfaceHover: '#F8FAFC',
  surfaceActive: '#F1F4F8',
  border: '#E1E6EC',
  borderStrong: '#C7D0DB',

  textPrimary: '#101826',
  textSecondary: '#526074',
  textMuted: '#93A1B0',

  accent: '#1E5C97',
  accentHover: '#164A7C',
  accentSubtle: '#E4EDF6',

  // 4-Tier Backend-aligned Risk Taxonomy
  risk: RISK_CONFIG,

  casePoint: {
    confirmed: '#B7301F',
    suspected: '#D97B1F',
  },
} as const;

export type OutbreakRiskScore = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DiagnosisStatus = 'CONFIRMED' | 'SUSPECTED' | 'REJECTED';
export type OutbreakStatus = 'ACTIVE' | 'CONTAINED' | 'RESOLVED';

export function getRiskToken(level?: OutbreakRiskScore | string | null) {
  if (!level) return RISK_CONFIG.LOW;
  const upper = level.toUpperCase() as OutbreakRiskScore;
  return RISK_CONFIG[upper] || RISK_CONFIG.LOW;
}

export function classifyScoreToRiskLevel(score: number): OutbreakRiskScore {
  if (score >= RISK_THRESHOLDS.CRITICAL_MIN) return 'CRITICAL';
  if (score >= RISK_THRESHOLDS.HIGH_MIN) return 'HIGH';
  if (score >= RISK_THRESHOLDS.MEDIUM_MIN) return 'MEDIUM';
  return 'LOW';
}

/**
 * Single source of truth for how an outbreak is coloured.
 *
 * `OutbreakScheduler` stamps `riskScore = LOW` when it auto-resolves a cluster
 * but leaves `compositeRiskScore` at whatever the cluster last scored. Reading
 * the colour from the enum while printing the number therefore renders things
 * like a green "71" sitting next to an orange "67". Deriving the colour from
 * the numeric score keeps the two in agreement everywhere the score is shown.
 *
 * Status is deliberately not a factor: the marker communicates risk magnitude,
 * and whether a cluster is still open is carried separately by the status field
 * and the status filter.
 */
export function resolveRiskToken(input: {
  level?: OutbreakRiskScore | string | null;
  score?: number | null;
}) {
  if (input.score !== null && input.score !== undefined && Number.isFinite(input.score)) {
    return getRiskToken(classifyScoreToRiskLevel(input.score));
  }
  return getRiskToken(input.level);
}
