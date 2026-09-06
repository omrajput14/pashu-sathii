import { DiseaseMetadata } from '../types/disease.types';
import { DiseaseProtocolRecord, ProtocolSection } from '../types/protocol.types';

/**
 * Maps DiseaseMetadata from the VETRA Disease Registry API into a structured DiseaseProtocolRecord.
 * Strictly avoids hardcoding or fabricating clinical, legal, or statutory SOP guidance.
 */
export function mapDiseaseMetadataToProtocol(meta: DiseaseMetadata): DiseaseProtocolRecord {
  const severity = meta.severity || null;
  const isZoonotic = meta.zoonotic != null ? meta.zoonotic : null;
  const isReportable = meta.reportable != null ? meta.reportable : null;
  const mortality = meta.mortality || null;
  const radiusKm = meta.defaultRadiusKm != null ? meta.defaultRadiusKm : null;
  const minCases = meta.minimumCases != null ? meta.minimumCases : null;
  const windowHours = meta.evaluationWindowHours != null ? meta.evaluationWindowHours : null;
  const species = meta.speciesAffected || null;
  const transmission = meta.transmissionType || null;
  const vaccineAvailable = meta.vaccineAvailable != null ? meta.vaccineAvailable : null;

  const category =
    isZoonotic === true
      ? 'Zoonotic Pathogen (Disease Registry)'
      : isReportable === true
      ? 'Notifiable Pathogen (Disease Registry)'
      : 'Livestock Pathogen (Disease Registry)';

  const surveillanceBullets: string[] = [];
  if (radiusKm != null) {
    surveillanceBullets.push(`Default Surveillance Radius: ±${radiusKm.toFixed(1)} km`);
  } else {
    surveillanceBullets.push('Default Surveillance Radius: Not configured');
  }

  if (minCases != null) {
    surveillanceBullets.push(`Minimum Cluster Trigger Threshold: ${minCases} ${minCases === 1 ? 'case' : 'cases'}`);
  } else {
    surveillanceBullets.push('Minimum Cluster Trigger Threshold: Not configured');
  }

  if (windowHours != null) {
    surveillanceBullets.push(`Temporal Evaluation Window: ${windowHours} hours`);
  } else {
    surveillanceBullets.push('Temporal Evaluation Window: Not configured');
  }

  if (isZoonotic != null) {
    surveillanceBullets.push(`Zoonotic Potential: ${isZoonotic ? 'YES (Human transmission risk recorded)' : 'NO (Host-specific)'}`);
  } else {
    surveillanceBullets.push('Zoonotic Potential: Not configured');
  }

  if (isReportable != null) {
    surveillanceBullets.push(`Reporting Mandate: ${isReportable ? 'REPORTABLE (Mandatory notification)' : 'NON-REPORTABLE'}`);
  } else {
    surveillanceBullets.push('Reporting Mandate: Not configured');
  }

  const sections: ProtocolSection[] = [
    {
      id: 'surveillance-context',
      title: '1. Epidemiological Surveillance Parameters',
      classification: 'EXISTING_PROJECT_DATA',
      content: radiusKm != null && minCases != null && windowHours != null
        ? `Spatial-temporal clustering evaluates ${minCases} cases within ±${radiusKm.toFixed(1)} km over a ${windowHours}-hour window.`
        : 'Surveillance clustering parameters loaded from VETRA Disease Registry.',
      bullets: surveillanceBullets,
      isConfigured: true,
    },
    {
      id: 'clinical-recognition',
      title: '2. Field Syndromic Recognition',
      classification: 'CONFIGURATION_REQUIRED',
      content: 'Protocol content not configured. Authoritative departmental SOP required for clinical recognition criteria.',
      bullets: species ? [`Susceptible Species: ${species}`] : undefined,
      isConfigured: false,
    },
    {
      id: 'containment-biosecurity',
      title: '3. Containment & Biosecurity Guidance',
      classification: 'CONFIGURATION_REQUIRED',
      content: 'Protocol content not configured. Authoritative departmental standard operating procedure required.',
      bullets: radiusKm != null
        ? [`Spatial Reference: Surveillance cluster boundary is ±${radiusKm.toFixed(1)} km.`]
        : undefined,
      isConfigured: false,
    },
    {
      id: 'vaccination-protocol',
      title: '4. Vaccination & Immunization Protocol',
      classification: 'CONFIGURATION_REQUIRED',
      content: 'Protocol content not configured. Authoritative departmental vaccination schedule required.',
      bullets: vaccineAvailable != null
        ? [`Vaccine Status in Registry: ${vaccineAvailable ? 'Available / Recorded' : 'Not recorded in registry'}`]
        : undefined,
      isConfigured: false,
    },
    {
      id: 'laboratory-escalation',
      title: '5. Diagnostic Escalation & Laboratory Confirmation',
      classification: 'DERIVED_FROM_EXISTING_DATA',
      content: 'VETRA surveillance separates clinical field reporting (VETERINARIAN) from definitive diagnostic assay verification (LAB_CONFIRMED).',
      bullets: [
        'Field clinical observations are recorded under VETERINARIAN confidence source.',
        'Biological laboratory assay results update confidence source to LAB_CONFIRMED.',
        'Chain of custody preserves Animal Tag Number and GPS coordinates.',
      ],
      isConfigured: true,
    },
    {
      id: 'statutory-annexure',
      title: '6. Departmental Gazette & Statutory Orders',
      classification: 'CONFIGURATION_REQUIRED',
      content: 'Protocol content not configured. Official departmental gazette circular numbers and statutory legal orders must be uploaded through the administrative configuration panel.',
      isConfigured: false,
    },
  ];

  return {
    diseaseName: meta.diseaseName,
    status: 'REFERENCE_CONTENT',
    metadata: meta,
    category,
    severity,
    isZoonotic,
    isReportable,
    mortality,
    surveillanceRadiusKm: radiusKm,
    minimumClusterCases: minCases,
    evaluationWindowHours: windowHours,
    susceptibleSpecies: species,
    transmissionMode: transmission,
    vaccineAvailable,
    sections,
    source: 'VETRA Disease Registry Service (System Catalog)',
    lastUpdated: 'System Baseline (Real-time)',
  };
}
