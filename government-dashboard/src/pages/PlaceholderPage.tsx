import React from 'react';
import { ArrowLeft, Clock, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface PlaceholderPageProps {
  title: string;
  description: string;
  onBackToOverview: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  onBackToOverview,
}) => {
  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-8 text-center max-w-2xl mx-auto my-12 shadow-subtle">
      <div className="w-12 h-12 bg-[#E4EDF6] text-[#1E5C97] rounded-[6px] flex items-center justify-center mx-auto mb-4">
        <Shield className="w-6 h-6" />
      </div>

      <div className="inline-flex items-center gap-1 text-[11px] font-mono uppercase bg-[#F6F8FA] border border-[#E1E6EC] text-[#526074] px-2 py-0.5 rounded-[2px] mb-3">
        <Clock className="w-3 h-3" />
        <span>PASHU SATHI Government Phase 2 Integration Module</span>
      </div>

      <h1 className="text-lg font-bold text-[#101826]">{title}</h1>
      <p className="text-xs text-[#526074] mt-2 leading-relaxed max-w-md mx-auto">
        {description}
      </p>

      <div className="mt-6">
        <Button variant="secondary" size="md" onClick={onBackToOverview} className="font-mono">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Return to Command Overview</span>
        </Button>
      </div>
    </div>
  );
};
