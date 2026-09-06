import React from 'react';
import { Badge } from '../ui/Badge';
import { FileText, Lock, AlertCircle, UploadCloud } from 'lucide-react';

export const ProtocolConfigSection: React.FC = () => {
  return (
    <div className="bg-[#FFFDFB] border border-[#FAD8B6] rounded-[6px] p-4 shadow-subtle text-xs space-y-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#FAD8B6]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#D97B1F]" />
          <h2 className="text-sm font-bold font-mono text-[#101826] uppercase">
            Departmental Protocol & Statutory Document Configuration
          </h2>
        </div>
        <Badge variant="outline" size="sm" className="font-mono text-[#D97B1F] border-[#D97B1F]">
          CONFIGURATION REQUIRED
        </Badge>
      </div>

      <div className="p-3 bg-white border border-[#FAD8B6] rounded-[4px] space-y-2">
        <div className="flex items-start gap-2 text-[#D97B1F]">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <strong className="font-mono text-[#101826] text-xs block">
              Authoritative protocol configuration is not currently connected.
            </strong>
            <p className="text-[11px] font-mono text-[#526074] mt-1 leading-relaxed">
              Official standard operating procedures, state gazette notifications, chemical disinfection specifications, and statutory legal quarantine circulars must be registered via an authenticated departmental administrative upload workflow.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono text-[#526074]">
        <div className="p-2.5 bg-white border border-[#E1E6EC] rounded-[4px] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#93A1B0]">
            <span>GAZETTE NOTIFICATIONS</span>
            <Lock className="w-3.5 h-3.5 text-[#D97B1F]" />
          </div>
          <strong className="text-[#101826] text-xs block">Not Configured</strong>
          <span className="text-[10px]">Requires PDF / Circular Ingestion API</span>
        </div>

        <div className="p-2.5 bg-white border border-[#E1E6EC] rounded-[4px] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#93A1B0]">
            <span>STATUTORY DECREE PIPELINE</span>
            <Lock className="w-3.5 h-3.5 text-[#D97B1F]" />
          </div>
          <strong className="text-[#101826] text-xs block">Not Configured</strong>
          <span className="text-[10px]">Requires Digital Signature Verification</span>
        </div>

        <div className="p-2.5 bg-white border border-[#E1E6EC] rounded-[4px] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#93A1B0]">
            <span>STORAGE BACKEND</span>
            <UploadCloud className="w-3.5 h-3.5 text-[#526074]" />
          </div>
          <strong className="text-[#101826] text-xs block">Secure Document Store</strong>
          <span className="text-[10px]">Planned Phase 6 Integration</span>
        </div>
      </div>

      <div className="p-2 bg-[#FEF3E8] border border-[#FAD8B6] rounded text-[10px] font-mono text-[#D97B1F]">
        <strong>Operational Safety:</strong> No simulated file uploads or placeholder documents are accepted. The PASHU SATHI system strictly prohibits fabricating statutory legal decrees.
      </div>
    </div>
  );
};
