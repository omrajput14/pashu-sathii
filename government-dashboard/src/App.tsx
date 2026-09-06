import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './core/context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { CommandOverviewPage } from './pages/CommandOverviewPage';
import { SurveillanceMapPage } from './pages/SurveillanceMapPage';
import { OutbreakIntelligencePage } from './pages/OutbreakIntelligencePage';
import { EpidemiologicalAnalyticsPage } from './pages/EpidemiologicalAnalyticsPage';
import { FieldSurveillanceReportsPage } from './pages/FieldSurveillanceReportsPage';
import { VaccinationIntelligencePage } from './pages/VaccinationIntelligencePage';
import { AlertsManagementPage } from './pages/AlertsManagementPage';
import { LaboratorySurveillancePage } from './pages/LaboratorySurveillancePage';
import { ProtocolsReferencePage } from './pages/ProtocolsReferencePage';
import { SettingsPage } from './pages/SettingsPage';
import { diseaseService } from './core/api/diseaseService';
import { OutbreakResponse } from './core/types/outbreak.types';
import { ShieldAlert, LogOut } from 'lucide-react';
import { Button } from './components/ui/Button';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10000,
    },
  },
});

// Helper to parse route and params from window location
const parseCurrentRoute = (): { route: string; paramId: string | null } => {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!path || path === 'overview') {
    return { route: 'overview', paramId: null };
  }
  if (path === 'surveillance' || path === 'surveillance-map') {
    return { route: 'surveillance-map', paramId: null };
  }
  if (path.startsWith('outbreaks')) {
    const parts = path.split('/');
    return { route: 'outbreaks', paramId: parts[1] || null };
  }
  if (path.startsWith('reports')) {
    const parts = path.split('/');
    return { route: 'reports', paramId: parts[1] || null };
  }
  if (path === 'vaccination') {
    return { route: 'vaccination', paramId: null };
  }
  if (path.startsWith('alerts')) {
    const parts = path.split('/');
    return { route: 'alerts', paramId: parts[1] || null };
  }
  if (path.startsWith('labs')) {
    const parts = path.split('/');
    return { route: 'labs', paramId: parts[1] || null };
  }
  if (path.startsWith('protocols')) {
    const parts = path.split('/');
    return { route: 'protocols', paramId: parts[1] ? decodeURIComponent(parts[1]) : null };
  }
  if (path === 'analytics') {
    return { route: 'analytics', paramId: null };
  }
  if (path === 'settings') {
    return { route: 'settings', paramId: null };
  }
  return { route: path, paramId: null };
};

const DashboardRoot: React.FC = () => {
  const { user, isAuthenticated, isGovernmentAuthorized, isLoading, logout } = useAuth();
  
  // Initialize route from window.location
  const initial = parseCurrentRoute();
  const [activeRoute, setActiveRoute] = useState(initial.route);
  const [inspectedParamId, setInspectedParamId] = useState<string | null>(initial.paramId);
  const [selectedScope, setSelectedScope] = useState('Maharashtra (Statewide)');

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseCurrentRoute();
      setActiveRoute(parsed.route);
      setInspectedParamId(parsed.paramId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: string, paramId: string | null = null) => {
    setActiveRoute(route);
    setInspectedParamId(paramId);

    let newUrl = `/${route}`;
    if (paramId) {
      newUrl = `/${route}/${encodeURIComponent(paramId)}`;
    }
    if (window.location.pathname !== newUrl) {
      window.history.pushState(null, '', newUrl);
    }
  };

  // TopBar stats query
  const { data: stats } = useQuery({
    queryKey: ['outbreakStats'],
    queryFn: diseaseService.getOutbreakStatistics,
    enabled: isAuthenticated && isGovernmentAuthorized,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#F6F8FA] flex flex-col items-center justify-center font-mono text-xs text-[#526074]">
        <div className="w-8 h-8 border-2 border-[#1E5C97] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-semibold text-[#101826]">INITIALIZING PASHU SATHI COMMAND TELEMETRY</p>
        <p className="text-[11px] text-[#93A1B0] mt-1">Verifying 256-bit JWT Security Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Unauthorized screen for non-government roles
  if (!isGovernmentAuthorized) {
    return (
      <div className="min-h-screen w-screen bg-[#F6F8FA] flex items-center justify-center p-4 select-none">
        <div className="w-full max-w-md bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle p-6 text-center">
          <div className="w-12 h-12 rounded-px bg-[#FBEBEB] text-[#6E1423] flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-base font-bold text-[#101826] uppercase font-mono">
            Restricted Government Terminal
          </h1>
          <p className="text-xs text-[#526074] mt-2 leading-relaxed">
            Your account role (<strong className="font-mono text-[#101826]">{user?.role || 'UNKNOWN'}</strong>) is not authorized to access the PASHU SATHI Government Surveillance Command Center.
          </p>
          <p className="text-[11px] text-[#93A1B0] mt-1">
            Access is strictly reserved for designated State/District Officers and System Administrators.
          </p>
          <div className="mt-5">
            <Button variant="secondary" size="md" onClick={() => logout()} className="w-full font-mono">
              <LogOut className="w-4 h-4 mr-1.5" />
              <span>Sign Out & Return to Login</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSelectOutbreakFromOverview = (outbreak: OutbreakResponse) => {
    navigateTo('outbreaks', outbreak.id);
  };

  const renderContent = () => {
    switch (activeRoute) {
      case 'overview':
        return (
          <CommandOverviewPage
            onNavigateToMap={() => navigateTo('surveillance-map')}
            onSelectOutbreak={handleSelectOutbreakFromOverview}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
          />
        );
      case 'surveillance-map':
        return (
          <SurveillanceMapPage
            onBackToOverview={() => navigateTo('overview')}
            initialSelectedOutbreakId={inspectedParamId}
            onNavigateToIntelligence={(id) => navigateTo('outbreaks', id)}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
          />
        );
      case 'outbreaks':
        return (
          <OutbreakIntelligencePage
            initialOutbreakId={inspectedParamId}
            onNavigateToMap={(id) => navigateTo('surveillance-map', id)}
            onBackToOverview={() => navigateTo('overview')}
            onSelectOutbreakId={(id) => {
              setInspectedParamId(id);
              const url = id ? `/outbreaks/${id}` : '/outbreaks';
              if (window.location.pathname !== url) {
                window.history.pushState(null, '', url);
              }
            }}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
          />
        );
      case 'analytics':
        return (
          <EpidemiologicalAnalyticsPage
            onNavigateToOutbreak={(id) => navigateTo('outbreaks', id)}
            onBackToOverview={() => navigateTo('overview')}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
          />
        );
      case 'reports':
        return (
          <FieldSurveillanceReportsPage
            inspectedReportId={inspectedParamId}
            onNavigateToOutbreak={(id) => navigateTo('outbreaks', id)}
            onNavigateToMap={() => navigateTo('surveillance-map')}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
          />
        );
      case 'vaccination':
        return (
          <VaccinationIntelligencePage
            onNavigateToOutbreak={(id) => navigateTo('outbreaks', id)}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
          />
        );
      case 'alerts':
        return (
          <AlertsManagementPage
            onNavigateToOutbreak={(id) => navigateTo('outbreaks', id)}
            onNavigateToMap={() => navigateTo('surveillance-map')}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
          />
        );
      case 'labs':
        return (
          <LaboratorySurveillancePage
            inspectedReportId={inspectedParamId}
            onNavigateToOutbreak={(id) => navigateTo('outbreaks', id)}
            onNavigateToMap={() => navigateTo('surveillance-map')}
            selectedScope={selectedScope}
          />
        );
      case 'protocols':
        return (
          <ProtocolsReferencePage
            initialDiseaseName={inspectedParamId}
            selectedScope={selectedScope}
            onNavigateToOutbreak={(id) => navigateTo('outbreaks', id)}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            selectedScope={selectedScope}
          />
        );
      default:
        return (
          <CommandOverviewPage
            onNavigateToMap={() => navigateTo('surveillance-map')}
            onSelectOutbreak={handleSelectOutbreakFromOverview}
          />
        );
    }
  };

  return (
    <AppLayout
      activeRoute={activeRoute}
      onRouteChange={(route) => navigateTo(route, null)}
      stats={stats}
      selectedScope={selectedScope}
      onScopeChange={setSelectedScope}
    >
      {renderContent()}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DashboardRoot />
      </AuthProvider>
    </QueryClientProvider>
  );
};
export default App;
