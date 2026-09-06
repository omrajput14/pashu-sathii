import React from 'react';
import { Network, Database, QrCode, Building2, TestTube2, Lock, ArrowUpRight } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const FutureLimsIntegrationPanel: React.FC = () => {
  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#E1E6EC] gap-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#1E5C97]" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#101826] font-mono uppercase tracking-wider text-xs">
                External Laboratory Integration Bridge (LIMS / LIS)
              </h2>
              <Badge variant="outline" size="sm" className="text-[#1E5C97] border-[#1E5C97]">
                PLANNED (LIMS v2.0 SPECIFICATION)
              </Badge>
            </div>
            <p className="text-[10px] font-mono text-[#526074] mt-0.5">
              Architectural specification for automated machine-to-machine laboratory data ingestion.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-[#526074] bg-[#F1F4F8] px-2 py-1 rounded">
          Status: Future Architecture (Zero Synthetic Results)
        </span>
      </div>

      {/* Blueprint Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Sample & Accession */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#1E5C97]" />
            <h3 className="font-bold text-[#101826] text-xs">Specimen Accessioning</h3>
          </div>
          <p className="text-[11px] font-mono text-[#526074] leading-relaxed">
            Barcode-driven chain of custody linking specimen sample tubes directly to PASHU SATHI Animal QR Passports and
            field GPS coordinates.
          </p>
          <div className="text-[10px] font-mono text-[#1E5C97] pt-1">
            • Serum, Blood, Swab, Tissue Matrices
          </div>
        </div>

        {/* Card 2: Laboratory Network */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1E5C97]" />
            <h3 className="font-bold text-[#101826] text-xs">Reference Lab Network</h3>
          </div>
          <p className="text-[11px] font-mono text-[#526074] leading-relaxed">
            Secure bidirectional routing to National (ICAR-NIHSAD, ICAR-IVRI) and State Disease Diagnostic Laboratories
            (DDLs).
          </p>
          <div className="text-[10px] font-mono text-[#1E5C97] pt-1">
            • Automated Sample Dispatch & Routing
          </div>
        </div>

        {/* Card 3: Assays & Protocols */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
          <div className="flex items-center gap-2">
            <TestTube2 className="w-4 h-4 text-[#1E5C97]" />
            <h3 className="font-bold text-[#101826] text-xs">Assay Types & Biomarkers</h3>
          </div>
          <p className="text-[11px] font-mono text-[#526074] leading-relaxed">
            Structured capture of Real-Time RT-PCR (Ct values), ELISA titers, Serum Neutralization Tests (SNT), and
            viral genomics.
          </p>
          <div className="text-[10px] font-mono text-[#1E5C97] pt-1">
            • Molecular & Serological Panels
          </div>
        </div>

        {/* Card 4: Automated Ingestion */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#1E5C97]" />
            <h3 className="font-bold text-[#101826] text-xs">HL7 / FHIR Ingestion</h3>
          </div>
          <p className="text-[11px] font-mono text-[#526074] leading-relaxed">
            Automated webhooks that transition field reports to{' '}
            <code className="text-[#101826] font-bold">LAB_CONFIRMED</code> and trigger instant outbreak cluster recalculation.
          </p>
          <div className="text-[10px] font-mono text-[#1E5C97] pt-1">
            • Real-time Epidemiological Triggers
          </div>
        </div>
      </div>

      {/* Safety & Compliance Notice */}
      <div className="mt-3 p-2.5 bg-[#F6F8FA] border border-[#E1E6EC] rounded-[4px] flex items-center justify-between text-[10px] font-mono text-[#526074]">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#526074]" />
          <span>
            <strong>Compliance Constraint:</strong> External LIMS integration will adhere to ISO/IEC 17025 laboratory
            data integrity standards. PASHU SATHI strictly avoids simulated test outputs.
          </span>
        </div>
        <span className="text-[#1E5C97] font-semibold flex items-center gap-0.5">
          <span>Target: Phase 5</span>
          <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
