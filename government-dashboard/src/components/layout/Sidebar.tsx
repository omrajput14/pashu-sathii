import React from 'react';
import {
  LayoutDashboard,
  Map,
  Flame,
  BarChart3,
  FileSpreadsheet,
  Syringe,
  AlertTriangle,
  FlaskConical,
  BookOpen,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeRoute: string;
  onRouteChange: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeRoute, onRouteChange }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'surveillance-map', label: 'Surveillance Map', icon: Map },
    { id: 'outbreaks', label: 'Outbreaks', icon: Flame },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'vaccination', label: 'Vaccination', icon: Syringe },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'labs', label: 'Labs', icon: FlaskConical },
    { id: 'protocols', label: 'Protocols', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className="w-56 bg-[#0E1A2B] text-[#9FB1C4] flex flex-col justify-between shrink-0 border-r border-[#1B2B40] select-none h-screen"
      aria-label="Sidebar Navigation"
    >
      <div>
        {/* Navy Header / System Marker */}
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-[#1B2B40]">
          <div className="w-7 h-7 rounded-[4px] bg-white flex items-center justify-center p-0.5 shrink-0 shadow-sm">
            <img src="/pashu-sathi-icon.png" alt="PASHU SATHI" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#F4F7FA] font-semibold">
            PASHU SATHI
          </span>
        </div>

        {/* Navigation Item List */}
        <nav className="p-2 space-y-1" role="navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onRouteChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E5C97] ${
                  isActive
                    ? 'bg-[#1E5C97] text-[#FFFFFF] font-semibold shadow-sm'
                    : 'text-[#9FB1C4] hover:bg-[#142337] hover:text-[#F4F7FA]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#9FB1C4]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Footer Metadata */}
      <div className="p-3 border-t border-[#1B2B40] text-[11px] font-mono text-[#526074]">
        <div className="flex items-center justify-between text-[#9FB1C4]">
          <span>DAHD SURVEILLANCE</span>
          <span className="text-[10px] text-[#3E7C4A]">v1.0-RC</span>
        </div>
        <p className="text-[10px] text-[#93A1B0] mt-0.5">PostgreSQL + PostGIS GIS</p>
      </div>
    </aside>
  );
};
