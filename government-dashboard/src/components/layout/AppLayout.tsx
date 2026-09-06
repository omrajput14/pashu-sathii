import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { OutbreakStatisticsResponse } from '../../core/types/outbreak.types';

interface AppLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
  onRouteChange: (route: string) => void;
  stats?: OutbreakStatisticsResponse;
  selectedScope: string;
  onScopeChange?: (scope: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeRoute,
  onRouteChange,
  stats,
  selectedScope,
  onScopeChange,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F6F8FA] text-[#101826]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar activeRoute={activeRoute} onRouteChange={onRouteChange} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <TopBar
          stats={stats}
          selectedScope={selectedScope}
          onScopeChange={onScopeChange}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F6F8FA]">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
