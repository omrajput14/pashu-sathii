export interface SurveillanceConfig {
  weightCluster: number;
  weightWeather: number;
  weightHistory: number;
  weightVaccination: number;
  lowThreshold: number;
  mediumThreshold: number;
  highThreshold: number;
  confirmedCaseMultiplier: number;
  suspectedCaseMultiplier: number;
}

export interface WeatherConfig {
  provider: string;
  enabled: boolean;
  cacheTtlMinutes: number;
  timeoutSeconds: number;
  connectTimeoutSeconds: number;
  apiEndpoint: string;
}

export interface AlertConfig {
  epidemiologicalRiskThreshold: number;
  operationalPriorityFormula: string;
  evaluationMode: string;
}

export interface SystemMetadata {
  serviceName: string;
  environment: string;
  version: string;
  databaseEngine: string;
  connectionPool: string;
  securityStandard: string;
  auditTelemetry: string;
}

export interface SystemConfigurationResponse {
  surveillance: SurveillanceConfig;
  weather: WeatherConfig;
  alerts: AlertConfig;
  system: SystemMetadata;
}

export interface HealthResponse {
  status: string;
  timestamp?: string;
}
