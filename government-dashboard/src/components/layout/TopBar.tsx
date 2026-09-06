import React from 'react';
import { MapPin, Radio, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { OutbreakStatisticsResponse } from '../../core/types/outbreak.types';

interface TopBarProps {
  stats?: OutbreakStatisticsResponse;
  selectedScope: string;
  onScopeChange?: (scope: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  stats,
  selectedScope,
  onScopeChange,
}) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const highRiskCount = stats?.highRiskOutbreaks ?? 0;

  return (
    <header className="h-14 bg-[#FFFFFF] border-b border-[#E1E6EC] px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Geographic Scope */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-[#E1E6EC]">
          <div className="w-8 h-8 rounded-[6px] bg-white border border-[#E1E6EC] flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
            <img src="/pashu-sathi-icon.png" alt="PASHU SATHI" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold tracking-tight text-sm text-[#101826]">PASHU SATHI</span>
              <span className="text-[10px] uppercase font-mono px-1 py-0.5 bg-[#E4EDF6] text-[#1E5C97] rounded-[2px] font-semibold">GOV</span>
            </div>
            <p className="text-[10px] text-[#526074] font-medium leading-tight">Government Animal Health &amp; Disease Surveillance</p>
          </div>
        </div>

        {/* Administrative Scope Cascade Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#101826] bg-[#F6F8FA] border border-[#E1E6EC] rounded-[4px] hover:bg-[#F1F4F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E5C97]"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-label="Select Geographic Scope"
          >
            <MapPin className="w-3.5 h-3.5 text-[#1E5C97]" />
            <span>Scope: <strong className="font-semibold">{selectedScope}</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-[#526074]" />
          </button>

          {isDropdownOpen && (
            <div
              className="absolute left-0 mt-1 w-64 bg-white border border-[#C7D0DB] rounded-[4px] shadow-md py-1 z-50 text-xs font-medium"
              role="menu"
            >
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[#93A1B0] border-b border-[#E1E6EC]">
                Administrative Scope
              </div>
              {['Maharashtra (Statewide)', 'Pune District', 'Baramati Block / Taluka', 'Ahmednagar District', 'Nashik District'].map((scope) => (
                <button
                  key={scope}
                  onClick={() => {
                    onScopeChange?.(scope);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-[#F6F8FA] flex items-center justify-between ${
                    selectedScope === scope ? 'text-[#1E5C97] font-semibold bg-[#E4EDF6]' : 'text-[#101826]'
                  }`}
                  role="menuitem"
                >
                  <span>{scope}</span>
                  {selectedScope === scope && <span className="w-1.5 h-1.5 rounded-full bg-[#1E5C97]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Status, Threat Alert Pill & User Profile */}
      <div className="flex items-center gap-4">
        {/* Live Telemetry Pulse */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#F6F8FA] border border-[#E1E6EC] rounded-[4px] text-xs font-mono text-[#526074]">
          <Radio className="w-3 h-3 text-[#3E7C4A] animate-pulse" />
          <span>LIVE TELEMETRY</span>
          <span className="text-[#93A1B0]">|</span>
          <span className="tabular-nums text-[#101826]">{currentTime} IST</span>
        </div>

        {/* Priority Threat Alert Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-[4px] border ${
            highRiskCount > 0
              ? 'bg-[#FBEBEB] text-[#6E1423] border-[#F5C2C7]'
              : 'bg-[#EDF7F0] text-[#3E7C4A] border-[#BFE4C9]'
          }`}
          data-testid="topbar-alert-pill"
        >
          <span className={`w-2 h-2 rounded-full ${highRiskCount > 0 ? 'bg-[#6E1423] animate-ping' : 'bg-[#3E7C4A]'}`} />
          <span>
            {highRiskCount > 0 ? `${highRiskCount} HIGH/CRIT THREATS` : 'ALL CLEAR (NORMAL)'}
          </span>
        </div>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#E1E6EC]">
          <div className="w-7 h-7 rounded-[4px] bg-[#E4EDF6] text-[#1E5C97] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-[#101826] leading-tight">
              {user?.fullName || user?.email || 'Officer'}
            </p>
            <p className="text-[10px] font-mono uppercase text-[#526074] leading-none">
              {user?.role || 'GOVERNMENT'}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 text-[#526074] hover:text-[#6E1423] hover:bg-[#FBEBEB] rounded-[4px] transition-colors focus:outline-none"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
