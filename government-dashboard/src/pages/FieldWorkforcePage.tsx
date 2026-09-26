import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Stethoscope, Syringe, UserCheck, Users, X } from 'lucide-react';
import { workforceService, WorkforceMember } from '../core/api/workforceService';
import { Button } from '../components/ui/Button';

const STATUS_BADGE: Record<string, string> = {
  VERIFIED: 'bg-[#EDF7F0] text-[#1B806A] border-[#C2E7DA]',
  PENDING: 'bg-[#FEF3E8] text-[#D97B1F] border-[#FADCC0]',
  REJECTED: 'bg-[#FBEBEB] text-[#B7301F] border-[#F5C2C7]',
};

/** Vets and para-vets in the field, what each has done, and para-vet approval. */
export const FieldWorkforcePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PARA_VET' | 'VETERINARIAN'>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { data: members = [], isLoading, isError } = useQuery({
    queryKey: ['workforce'],
    queryFn: () => workforceService.list(),
  });

  const decide = async (m: WorkforceMember, approve: boolean) => {
    setBusyId(m.userId);
    setMessage(null);
    try {
      await (approve ? workforceService.approve(m.userId) : workforceService.reject(m.userId));
      setMessage(`${m.name} ${approve ? 'approved' : 'not approved'}; they have been notified.`);
      await queryClient.invalidateQueries({ queryKey: ['workforce'] });
    } catch (err: any) {
      setMessage(`Could not save: ${err?.response?.data?.message || err?.message || 'network error'}`);
    } finally {
      setBusyId(null);
    }
  };

  const paraVets = members.filter((m) => m.role === 'PARA_VET');
  const pending = paraVets.filter((m) => m.status === 'PENDING');
  const shown = members.filter((m) => roleFilter === 'ALL' || m.role === roleFilter);
  const kpis = [
    { label: 'Approved para-vets', value: paraVets.filter((m) => m.status === 'VERIFIED').length, icon: UserCheck },
    { label: 'Waiting for approval', value: pending.length, icon: Users },
    { label: 'Veterinarians', value: members.length - paraVets.length, icon: Stethoscope },
    { label: 'Drive doses by para-vets', value: paraVets.reduce((n, m) => n + m.dosesGiven, 0), icon: Syringe },
  ];

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle">
        <h1 className="text-lg font-semibold text-[#101826]">Field Workforce</h1>
        <p className="text-xs font-mono text-[#526074] mt-1">
          Para-vets field-check farmers' AI scans and give vaccination doses; vets confirm diagnoses. New para-vets
          start only after an officer approves them.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-[#E1E6EC] rounded-[6px] p-3 flex items-center gap-3">
            <k.icon className="w-5 h-5 text-[#1E5C97]" />
            <div>
              <div className="text-[10px] font-mono uppercase text-[#526074]">{k.label}</div>
              <div className="text-xl font-bold text-[#101826] tabular-nums">{isLoading ? '—' : k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {message && <div className="text-xs font-mono p-2 rounded border border-[#C4D6EA] bg-[#E4EDF6] text-[#1E5C97]">{message}</div>}
      {isError && <div className="text-xs font-mono text-[#B7301F]">Could not load the field workforce.</div>}

      {pending.length > 0 && (
        <div className="bg-white border border-[#FADCC0] rounded-[6px] shadow-subtle" data-testid="paravet-approvals">
          <div className="px-4 py-3 border-b border-[#FADCC0] bg-[#FFF9F5] text-xs font-mono font-semibold uppercase text-[#D97B1F]">
            Para-vets waiting for approval ({pending.length})
          </div>
          {pending.map((m) => (
            <div key={m.userId} className="px-4 py-3 flex items-center justify-between border-b border-[#F4E5D5] last:border-0">
              <div>
                <div className="text-sm font-semibold text-[#101826]">{m.name}</div>
                <div className="text-[11px] font-mono text-[#526074]">{[m.district, m.taluka].filter(Boolean).join(' · ') || 'No district given'}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={busyId === m.userId} onClick={() => decide(m, true)}>
                  <Check className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
                <Button variant="secondary" size="sm" disabled={busyId === m.userId} onClick={() => decide(m, false)}>
                  <X className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-x-auto">
        <div className="px-4 py-3 border-b border-[#E1E6EC] bg-[#FAFBFC] flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase text-[#101826]">Field staff and activity</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="text-xs font-mono border border-[#C7D0DB] rounded px-2 py-1"
          >
            <option value="ALL">All</option>
            <option value="PARA_VET">Para-vets</option>
            <option value="VETERINARIAN">Veterinarians</option>
          </select>
        </div>
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[#526074] border-b border-[#E1E6EC]">
            <tr>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">District</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3 text-right">Scans escalated</th>
              <th className="py-2 px-3 text-right">Scans closed / ruled out</th>
              <th className="py-2 px-3 text-right">Cases confirmed</th>
              <th className="py-2 px-3 text-right">Doses given</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((m) => (
              <tr key={m.userId} className="border-b border-[#F1F4F8]">
                <td className="py-2 px-3 font-semibold text-[#101826]">{m.name}</td>
                <td className="py-2 px-3">{m.role === 'PARA_VET' ? 'Para-vet' : 'Veterinarian'}</td>
                <td className="py-2 px-3">{[m.district, m.taluka].filter(Boolean).join(' · ') || '—'}</td>
                <td className="py-2 px-3">
                  {m.status && (
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${STATUS_BADGE[m.status] ?? ''}`}>{m.status}</span>
                  )}
                </td>
                <td className="py-2 px-3 text-right tabular-nums">{m.role === 'PARA_VET' ? m.scansEscalated : '—'}</td>
                <td className="py-2 px-3 text-right tabular-nums">{m.role === 'PARA_VET' ? m.scansClosed : m.scansRejected}</td>
                <td className="py-2 px-3 text-right tabular-nums">{m.role === 'PARA_VET' ? '—' : m.casesConfirmed}</td>
                <td className="py-2 px-3 text-right tabular-nums">{m.dosesGiven}</td>
              </tr>
            ))}
            {!isLoading && shown.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-[#526074]">No field staff registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
