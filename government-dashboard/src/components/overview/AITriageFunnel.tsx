import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bot, CheckCircle2, Send, XCircle } from 'lucide-react';
import { diseaseService } from '../../core/api/diseaseService';

/**
 * AI scan triage funnel: farmers' AI scans → para-vet field check → vet decision.
 * Only vet-confirmed scans become CONFIRMED cases for outbreak detection.
 */
export const AITriageFunnel: React.FC = () => {
  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['aiScreeningsAll'],
    queryFn: () => diseaseService.listAIScreenings(),
  });

  const count = (status: string) => scans.filter((s) => s.status === status).length;
  const steps = [
    { label: 'Farmer AI scans', value: scans.length, sub: `${count('COMPLETED')} awaiting field check`, icon: Bot, tone: 'text-[#1E5C97]' },
    {
      // Every scan a para-vet sent on, including ones a vet has since decided.
      label: 'Escalated by para-vets',
      value: scans.filter((s) => s.status === 'ESCALATED' || s.triagedByName).length,
      sub: `${count('ESCALATED')} still waiting for a vet`,
      icon: Send,
      tone: 'text-[#D97B1F]',
    },
    { label: 'Confirmed by vets', value: count('VERIFIED'), sub: 'Confirmed cases → outbreak engine', icon: CheckCircle2, tone: 'text-[#1B806A]' },
    { label: 'Rejected', value: count('REJECTED'), sub: 'Not a disease; farmer told why', icon: XCircle, tone: 'text-[#B7301F]' },
  ];

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle" data-testid="ai-triage-funnel">
      <div className="px-4 py-3 border-b border-[#E1E6EC] bg-[#FAFBFC] flex items-center justify-between">
        <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
          AI Scan Triage: Farmer → Para-vet → Vet
        </h2>
        <span className="text-[10px] font-mono text-[#526074]">Only vet-confirmed scans count as confirmed cases</span>
      </div>
      <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-2">
        {steps.map((step, i) => (
          <div key={step.label} className="relative flex items-center gap-3 p-3 rounded border border-[#E1E6EC] bg-[#F8FAFC]">
            <step.icon className={`w-5 h-5 shrink-0 ${step.tone}`} />
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase text-[#526074] tracking-wide">{step.label}</div>
              <div className="text-xl font-bold text-[#101826] tabular-nums">{isLoading ? '—' : step.value}</div>
              <div className="text-[10px] text-[#526074] truncate">{step.sub}</div>
            </div>
            {i < 2 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93A1B0] bg-white rounded-full z-10" />}
          </div>
        ))}
      </div>
    </div>
  );
};
