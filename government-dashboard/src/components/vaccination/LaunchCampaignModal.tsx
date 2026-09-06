import React, { useState, useEffect } from 'react';
import { CreateVaccinationCampaignRequest, CampaignPriority } from '../../core/types/campaign.types';
import { campaignService } from '../../core/api/campaignService';
import { diseaseService } from '../../core/api/diseaseService';
import { gisService } from '../../core/api/gisService';
import { Button } from '../ui/Button';
import { Syringe, X, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface LaunchCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<CreateVaccinationCampaignRequest>;
}

export const LaunchCampaignModal: React.FC<LaunchCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [campaignName, setCampaignName] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [targetDistrict, setTargetDistrict] = useState('');
  const [targetTaluka, setTargetTaluka] = useState('');
  const [targetLivestockCount, setTargetLivestockCount] = useState<number | ''>('');
  const [plannedDoses, setPlannedDoses] = useState<number | ''>('');
  const [priority, setPriority] = useState<CampaignPriority>('HIGH');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [outbreakId, setOutbreakId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const [availableDiseases, setAvailableDiseases] = useState<string[]>([
    'Foot and Mouth Disease',
    'Rabies',
    'Brucellosis',
    'Anthrax',
    'Avian Influenza',
    'African Swine Fever',
    'Lumpy Skin Disease',
    'Bovine Mastitis',
  ]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([
    'Pune',
    'Satara',
    'Ahmednagar',
    'Solapur',
    'Kolhapur',
    'Nashik',
    'Sangli',
    'Thane',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      diseaseService.getDiseaseRegistry()
        .then((diseases) => {
          setAvailableDiseases(diseases.map((d: any) => d.diseaseName));
        })
        .catch(() => {
          setAvailableDiseases([
            'Foot and Mouth Disease',
            'Rabies',
            'Brucellosis',
            'Anthrax',
            'Avian Influenza',
            'African Swine Fever',
            'Lumpy Skin Disease',
            'Bovine Mastitis',
          ]);
        });

      gisService.getDistricts()
        .then((districts) => {
          setAvailableDistricts(districts);
        })
        .catch(() => {
          setAvailableDistricts(['Pune', 'Satara', 'Ahmednagar', 'Solapur', 'Kolhapur', 'Nashik', 'Sangli', 'Thane']);
        });

      if (initialData) {
        setCampaignName(initialData.campaignName || '');
        let normalizedDisease = initialData.diseaseName || '';
        if (normalizedDisease.includes("Foot and Mouth")) normalizedDisease = "Foot and Mouth Disease";
        else if (normalizedDisease.includes("Lumpy Skin")) normalizedDisease = "Lumpy Skin Disease";
        else if (normalizedDisease.includes("Avian")) normalizedDisease = "Avian Influenza";
        else if (normalizedDisease.includes("Swine")) normalizedDisease = "African Swine Fever";
        setDiseaseName(normalizedDisease);
        setTargetDistrict(initialData.targetDistrict || 'Pune');
        setTargetTaluka(initialData.targetTaluka || '');
        setTargetLivestockCount(initialData.targetLivestockCount ?? '');
        setPlannedDoses(initialData.plannedDoses ?? '');
        setPriority(initialData.priority || 'HIGH');
        setStartDate(initialData.startDate || new Date().toISOString().split('T')[0]);
        setEndDate(initialData.endDate || '');
        setOutbreakId(initialData.outbreakId || undefined);
        setNotes(initialData.notes || '');
      } else {
        setCampaignName('');
        setDiseaseName('');
        setTargetDistrict('Pune');
        setTargetTaluka('');
        setTargetLivestockCount('');
        setPlannedDoses('');
        setPriority('MEDIUM');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setOutbreakId(undefined);
        setNotes('');
      }
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!campaignName.trim()) {
      setErrorMessage('Campaign name is required');
      return;
    }
    if (!diseaseName) {
      setErrorMessage('Please select a targeted disease/pathogen');
      return;
    }
    if (!targetDistrict) {
      setErrorMessage('Target administrative district is required');
      return;
    }
    if (!plannedDoses || Number(plannedDoses) <= 0) {
      setErrorMessage('Planned doses must be greater than zero');
      return;
    }
    if (!startDate) {
      setErrorMessage('Start date is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestPayload: CreateVaccinationCampaignRequest = {
        campaignName: campaignName.trim(),
        diseaseName,
        targetDistrict,
        targetTaluka: targetTaluka.trim() || null,
        targetLivestockCount: targetLivestockCount ? Number(targetLivestockCount) : null,
        plannedDoses: Number(plannedDoses),
        priority,
        startDate,
        endDate: endDate || null,
        outbreakId: outbreakId || null,
        notes: notes.trim() || null,
      };

      const idempotencyKey = `vac-launch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      await campaignService.createCampaign(requestPayload, idempotencyKey);

      setSuccessMessage('Campaign successfully launched and persisted!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setErrorMessage('Authorization Error: Access denied. Only Government Officers and Administrators can launch vaccination campaigns.');
      } else if (err.response?.status === 400 || err.response?.status === 422) {
        setErrorMessage(err.response?.data?.message || 'Validation error: please check required parameters.');
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setErrorMessage('Network Error: Unable to reach backend server. Please verify connection.');
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to create campaign. Server error.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-[6px] border border-[#E1E6EC] shadow-xl w-full max-w-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#0E1A2B] text-white flex items-center justify-between border-b border-[#1B2B40]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#1E5C97] rounded">
              <Syringe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="modal-title" className="text-sm font-bold tracking-tight">
                {outbreakId ? 'Launch Emergency Ring Vaccination Campaign' : 'Launch Official Vaccination Campaign'}
              </h2>
              <p className="text-[11px] text-gray-300 font-mono">
                PASHU SATHI Department of Animal Husbandry & Dairying
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          {outbreakId && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[4px] flex items-center gap-2 text-[#991B1B]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <div className="text-[11px]">
                <strong>Linked Outbreak Containment:</strong> This operation is linked to Outbreak ID{' '}
                <span className="font-bold underline">{outbreakId.substring(0, 8)}...</span>. Priority and parameters pre-filled from surveillance telemetry.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] flex items-start gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-[4px] flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div className="text-xs font-bold">{successMessage}</div>
            </div>
          )}

          {/* Campaign Name */}
          <div>
            <label className="block text-[11px] font-bold text-[#101826] uppercase mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. Pune FMD Emergency Ring Drive 2026"
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded bg-white text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Disease */}
            <div>
              <label className="block text-[11px] font-bold text-[#101826] uppercase mb-1">
                Target Pathogen / Disease *
              </label>
              <select
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded bg-white text-[#101826] focus:outline-none focus:border-[#1E5C97]"
                required
              >
                <option value="">Select Pathogen...</option>
                {availableDiseases.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-bold text-[#101826] uppercase mb-1">
                Operational Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CampaignPriority)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded bg-white text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              >
                <option value="LOW">LOW — Routine Schedule</option>
                <option value="MEDIUM">MEDIUM — Surveillance Deficit</option>
                <option value="HIGH">HIGH — Containment Priority</option>
                <option value="CRITICAL">CRITICAL — Emergency Ring Outbreak</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* District */}
            <div>
              <label className="block text-[11px] font-bold text-[#101826] uppercase mb-1">
                Target Administrative District *
              </label>
              <select
                value={targetDistrict}
                onChange={(e) => setTargetDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded bg-white text-[#101826] focus:outline-none focus:border-[#1E5C97]"
                required
              >
                <option value="">Select District...</option>
                {availableDistricts.map((dst) => (
                  <option key={dst} value={dst}>
                    {dst}
                  </option>
                ))}
              </select>
            </div>

            {/* Taluka */}
            <div>
              <label className="block text-[11px] font-bold text-[#101826] uppercase mb-1">
                Target Taluka / Block (Optional)
              </label>
              <input
                type="text"
                value={targetTaluka}
                onChange={(e) => setTargetTaluka(e.target.value)}
                placeholder="e.g. Baramati, Koregaon"
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded bg-white text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Planned Doses */}
            <div>
              <label className="block text-[11px] font-bold text-[#101826] uppercase mb-1">
                Planned Vaccine Doses *
              </label>
              <input
                type="number"
                min="1"
                value={plannedDoses}
                onChange={(e) => setPlannedDoses(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded bg-white text-[#101826] focus:outline-none focus:border-[#1E5C97]"
                required
              />
              <span className="text-[10px] text-[#526074] mt-0.5 block">
                Must be at least 1 dose. Administered doses will initialize at 0.
              </span>
            </div>

            {/* Target Livestock Count */}
            <div>
              <label className="block text-[11px] font-bold text-[#101826] uppercase mb-1">
                Target Susceptible Population (Optional)
              </label>
              <input
                type="number"
                min="0"
                value={targetLivestockCount}
                onChange={(e) => setTargetLivestockCount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Auto-calculated from deficit if blank"
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded bg-white text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              />
              <span className="text-[10px] text-[#526074] mt-0.5 block">
                Unvaccinated livestock count in selected sector.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-bold text-[#101826] uppercase mb-1">
                Operation Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded bg-white text-[#101826] focus:outline-none focus:border-[#1E5C97]"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-bold text-[#101826] uppercase mb-1">
                Estimated Target Completion (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded bg-white text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-[#101826] uppercase mb-1">
              Operational Directives & Field Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cold-chain logistical notes, veterinary team assignments, containment radius details..."
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded bg-white text-[#101826] focus:outline-none focus:border-[#1E5C97]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E1E6EC]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#1E5C97] text-white hover:bg-[#154370]"
            >
              {isSubmitting ? 'Launching Campaign...' : 'Authorize & Launch Campaign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
