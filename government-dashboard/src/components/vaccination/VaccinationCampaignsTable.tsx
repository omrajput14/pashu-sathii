import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '../../core/api/campaignService';
import {
  VaccinationCampaignDto,
  CampaignStatus,
  CampaignPriority,
  VaccinationCampaignAuditLogDto,
} from '../../core/types/campaign.types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Syringe,
  Play,
  CheckCircle2,
  XCircle,
  History,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface VaccinationCampaignsTableProps {
  onOpenLaunchModal: () => void;
}

export const VaccinationCampaignsTable: React.FC<VaccinationCampaignsTableProps> = ({
  onOpenLaunchModal,
}) => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'ALL'>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [activeAuditCampaign, setActiveAuditCampaign] = useState<VaccinationCampaignDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['vaccinationCampaigns', selectedStatus, selectedDistrict],
    queryFn: () =>
      campaignService.listCampaigns({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        district: selectedDistrict === 'ALL' ? undefined : selectedDistrict,
      }),
  });

  const {
    data: auditLogs,
    isLoading: isLoadingAudit,
  } = useQuery({
    queryKey: ['campaignAuditLogs', activeAuditCampaign?.id],
    queryFn: () =>
      activeAuditCampaign ? campaignService.getAuditLogs(activeAuditCampaign.id) : Promise.resolve([]),
    enabled: !!activeAuditCampaign,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: CampaignStatus; notes?: string }) =>
      campaignService.updateCampaignStatus(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinationCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['vaccinationCampaignStatistics'] });
      setActionError(null);
    },
    onError: (err: any) => {
      if (err.response?.status === 403) {
        setActionError('Authorization Error: Access denied. Only Government Officers and Administrators can update campaign status.');
      } else if (err.response?.status === 422 || err.response?.status === 400) {
        setActionError(err.response?.data?.message || 'Invalid status transition.');
      } else {
        setActionError(err.response?.data?.message || 'Status transition failed.');
      }
    },
  });

  const getPriorityBadge = (priority: CampaignPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <Badge variant="danger" size="sm">CRITICAL</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="sm">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="neutral" size="sm">MEDIUM</Badge>;
      case 'LOW':
      default:
        return <Badge variant="outline" size="sm">LOW</Badge>;
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success" size="sm">ACTIVE</Badge>;
      case 'COMPLETED':
        return <Badge variant="neutral" size="sm">COMPLETED</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" size="sm">CANCELLED</Badge>;
      case 'PLANNED':
      default:
        return <Badge variant="outline" size="sm">PLANNED</Badge>;
    }
  };

  const campaigns = data?.content || [];

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden text-xs select-none">
      {/* Header & Controls */}
      <div className="p-4 border-b border-[#E1E6EC] bg-[#F8FAFC] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Syringe className="w-4 h-4 text-[#1E5C97]" />
          <div>
            <h2 className="font-bold text-[#101826] font-mono uppercase tracking-wider text-xs">
              Official Vaccination Campaigns & Containment Operations
            </h2>
            <p className="text-[11px] text-[#526074] font-mono mt-0.5">
              Targeted disease control, emergency ring vaccination drives, and dose execution tracking
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-2.5 py-1.5 border border-[#CBD5E1] rounded bg-white text-[#101826] font-mono text-xs focus:outline-none focus:border-[#1E5C97]"
          >
            <option value="ALL">All Districts</option>
            <option value="Pune">Pune</option>
            <option value="Satara">Satara</option>
            <option value="Ahmednagar">Ahmednagar</option>
            <option value="Solapur">Solapur</option>
            <option value="Kolhapur">Kolhapur</option>
            <option value="Nashik">Nashik</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-2.5 py-1.5 border border-[#CBD5E1] rounded bg-white text-[#101826] font-mono text-xs focus:outline-none focus:border-[#1E5C97]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Refresh */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="font-mono text-xs text-[#526074]"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          {/* Launch Campaign */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenLaunchModal}
            className="bg-[#1E5C97] text-white hover:bg-[#154370] font-mono text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Launch Campaign</span>
          </Button>
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content / Error / Empty States */}
      {isLoading ? (
        <div className="p-8 text-center text-xs font-mono text-[#526074]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#1E5C97] mb-2" />
          Loading persisted vaccination campaigns...
        </div>
      ) : isError ? (
        <div className="p-6 text-center text-xs font-mono">
          {(error as any)?.response?.status === 403 ? (
            <div className="text-amber-800 bg-amber-50 border border-amber-200 p-4 rounded max-w-md mx-auto">
              <ShieldCheck className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <strong>Authorization Required:</strong> Access to vaccination campaign records is restricted to authenticated Government Officers and Administrators.
            </div>
          ) : (
            <div className="text-red-700 bg-red-50 border border-red-200 p-4 rounded max-w-md mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <strong>Backend Unavailable:</strong> Unable to connect to vaccination campaign service. Please verify network connectivity.
            </div>
          )}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-10 text-center text-xs font-mono text-[#526074]">
          <Syringe className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
          <div className="font-bold text-[#101826] text-sm">No vaccination campaigns found</div>
          <p className="mt-1 text-[#526074]">
            No campaigns match the selected filters. Use the "Launch Campaign" button above or initiate a Ring Campaign from a priority deficit zone.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenLaunchModal}
            className="mt-3 font-mono text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Launch New Campaign</span>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" role="table">
            <thead>
              <tr className="bg-[#F1F4F8] border-b border-[#E1E6EC] text-[11px] font-mono uppercase tracking-wider text-[#526074]">
                <th scope="col" className="py-2.5 px-3 font-semibold">Campaign / Disease</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Jurisdiction</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Target Pop.</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Dose Progress</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Priority</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Status</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Schedule</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6EC]">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[#F8FAFC] transition-colors">
                  {/* Campaign Name & Disease */}
                  <td className="py-2.5 px-3 max-w-[220px]">
                    <div className="font-bold text-[#101826] truncate">{camp.campaignName}</div>
                    <div className="text-[11px] font-mono text-[#1E5C97] font-semibold mt-0.5">
                      {camp.diseaseName}
                    </div>
                    {camp.outbreakId && (
                      <span className="text-[9px] font-mono bg-red-100 text-red-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        RING CONTAINMENT
                      </span>
                    )}
                  </td>

                  {/* Jurisdiction */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                    <strong className="text-[#101826]">{camp.targetDistrict}</strong>
                    {camp.targetTaluka && (
                      <div className="text-[10px] text-[#526074]">Taluka: {camp.targetTaluka}</div>
                    )}
                  </td>

                  {/* Target Livestock Count */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#101826]">
                    {camp.targetLivestockCount ? camp.targetLivestockCount.toLocaleString() : '—'} head
                  </td>

                  {/* Dose Progress */}
                  <td className="py-2.5 px-3 font-mono min-w-[150px]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-[#101826]">
                        {camp.administeredDoses.toLocaleString()} / {camp.plannedDoses.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#526074]">
                        {camp.coverageProgressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#1E5C97] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, camp.coverageProgressPercentage)}%` }}
                      />
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-2.5 px-3">
                    {getPriorityBadge(camp.priority)}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3">
                    {getStatusBadge(camp.status)}
                  </td>

                  {/* Timeline */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                    <div>Start: {camp.startDate}</div>
                    {camp.endDate && <div className="text-[10px]">End: {camp.endDate}</div>}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {camp.status === 'PLANNED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            statusMutation.mutate({
                              id: camp.id,
                              status: 'ACTIVE',
                              notes: 'Campaign deployed to field teams.',
                            })
                          }
                          disabled={statusMutation.isPending}
                          className="font-mono text-[11px] py-1 px-2 text-green-700 hover:bg-green-50 border-green-200"
                        >
                          <Play className="w-3 h-3 mr-1 text-green-600" />
                          <span>Activate</span>
                        </Button>
                      )}

                      {camp.status === 'ACTIVE' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            statusMutation.mutate({
                              id: camp.id,
                              status: 'COMPLETED',
                              notes: 'Dose administration goals verified completed.',
                            })
                          }
                          disabled={statusMutation.isPending}
                          className="font-mono text-[11px] py-1 px-2 text-blue-700 hover:bg-blue-50 border-blue-200"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" />
                          <span>Complete</span>
                        </Button>
                      )}

                      {(camp.status === 'PLANNED' || camp.status === 'ACTIVE') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel campaign "${camp.campaignName}"?`)) {
                              statusMutation.mutate({
                                id: camp.id,
                                status: 'CANCELLED',
                                notes: 'Operation cancelled by government officer.',
                              });
                            }
                          }}
                          disabled={statusMutation.isPending}
                          className="font-mono text-[11px] py-1 px-2 text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <XCircle className="w-3 h-3 mr-1 text-red-500" />
                          <span>Cancel</span>
                        </Button>
                      )}

                      {/* Audit Log Modal Trigger */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveAuditCampaign(camp)}
                        className="font-mono text-[11px] py-1 px-2 text-[#526074]"
                        title="View chronological officer actions and audit trail"
                      >
                        <History className="w-3 h-3 text-[#1E5C97]" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Log Modal / Drawer */}
      {activeAuditCampaign && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-[6px] border border-[#E1E6EC] shadow-xl w-full max-w-xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#0E1A2B] text-white flex items-center justify-between border-b border-[#1B2B40]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#1E5C97]" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Audit History: {activeAuditCampaign.campaignName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveAuditCampaign(null)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto space-y-3 font-mono text-xs">
              {isLoadingAudit ? (
                <div className="text-center py-6 text-[#526074]">Loading audit trail...</div>
              ) : !auditLogs || auditLogs.length === 0 ? (
                <div className="text-center py-6 text-[#526074]">No audit records available.</div>
              ) : (
                auditLogs.map((log: VaccinationCampaignAuditLogDto) => (
                  <div key={log.id} className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-[#101826]">{log.action}</span>
                      <span className="text-[#526074] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {log.previousStatus && log.newStatus && (
                      <div className="text-[11px] text-[#526074] mb-1">
                        Status Transition: <strong className="text-red-700">{log.previousStatus}</strong> →{' '}
                        <strong className="text-green-700">{log.newStatus}</strong>
                      </div>
                    )}
                    {log.performedByName && (
                      <div className="text-[10px] text-[#526074]">
                        Officer: <span className="text-[#101826] font-semibold">{log.performedByName}</span>
                      </div>
                    )}
                    {log.notes && (
                      <div className="text-[11px] text-[#101826] bg-white border border-[#E1E6EC] p-2 rounded mt-2">
                        {log.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-[#E1E6EC] bg-[#F8FAFC] text-right">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveAuditCampaign(null)}
                className="font-mono text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
