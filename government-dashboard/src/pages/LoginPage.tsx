import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../core/context/AuthContext';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both your registered officer email/phone and security password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ identifier: identifier.trim(), password });
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        (typeof err?.message === 'string' ? err.message : null) ||
        'Authentication failed. Please verify your officer credentials and role permissions.';
      setError(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleFillDemo = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
  };

  const handleDirectLogin = async (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ identifier: id, password: pass });
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        (typeof err?.message === 'string' ? err.message : null) ||
        'Authentication failed. If connected to campus Wi-Fi, the network firewall may block external APIs. Try again or switch to mobile hotspot.';
      setError(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F6F8FA] flex flex-col justify-between select-none">
      {/* Top Institutional Header */}
      <header className="h-14 bg-[#0E1A2B] border-b border-[#1B2B40] px-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-[6px] flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
            <img src="/pashu-sathi-icon.png" alt="PASHU SATHI" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              PASHU SATHI GOVERNMENT COMMAND PORTAL
            </h1>
            <p className="text-[10px] text-[#9FB1C4] font-mono leading-tight mt-0.5">
              Department of Animal Husbandry & Dairying (DAHD)
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-[#9FB1C4] bg-[#142337] px-2 py-1 rounded-[2px] border border-[#1B2B40]">
          SIH26128 SURVEILLANCE
        </span>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E1E6EC] rounded-[6px] shadow-subtle p-6 sm:p-8">
          <div className="text-left mb-6">
            <div className="flex items-center justify-center mb-4 pb-3 border-b border-[#E1E6EC]">
              <img src="/pashu-sathi-logo.png" alt="PASHU SATHI" className="h-14 w-auto object-contain" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono uppercase bg-[#E4EDF6] text-[#1E5C97] rounded-[2px] font-semibold mb-2">
              Government Officer Sign-In
            </div>
            <h2 className="text-xl font-bold text-[#101826] tracking-tight">
              Surveillance Command Station
            </h2>
            <p className="text-xs text-[#526074] mt-1 leading-relaxed">
              Enter your authorized government officer credentials to access real-time livestock epidemiological intelligence and cluster alerts.
            </p>
          </div>

          {error && (
            <div
              className="mb-5 p-3 bg-[#FBEBEB] border border-[#F5C2C7] rounded-[4px] text-xs text-[#6E1423] flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-[#101826] uppercase tracking-wider font-mono mb-1.5"
              >
                Officer Identifier (Email / Phone)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#526074]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. officer@vetra.gov.in"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white border border-[#C7D0DB] rounded-[4px] text-[#101826] placeholder-[#93A1B0] focus:outline-none focus:border-[#1E5C97] focus:ring-1 focus:ring-[#1E5C97]"
                  disabled={isSubmitting}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#101826] uppercase tracking-wider font-mono mb-1.5"
              >
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#526074]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white border border-[#C7D0DB] rounded-[4px] text-[#101826] placeholder-[#93A1B0] focus:outline-none focus:border-[#1E5C97] focus:ring-1 focus:ring-[#1E5C97]"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 font-semibold font-mono"
              isLoading={isSubmitting}
            >
              <span>Authenticate & Access Command Center</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Demonstration Officer Accounts Quick-Fill Card */}
          <div className="mt-5 p-3.5 bg-[#F6F8FA] border border-[#E1E6EC] rounded-[4px] text-xs font-mono text-[#526074]">
            <div className="text-[11px] font-semibold text-[#101826] uppercase mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#1E5C97]" />
              <span>Demonstration Officer Accounts</span>
            </div>
            <div className="flex flex-col gap-2 text-[11px]">
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-[#E1E6EC]">
                <div>
                  <span className="text-[#101826] font-semibold">Chief Administrator:</span>
                  <div className="text-[#1E5C97]">admin@vetra.gov.in · Password@123</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin@vetra.gov.in', 'Password@123')}
                    className="text-[10px] bg-[#F6F8FA] text-[#526074] border border-[#C7D0DB] px-2 py-1 rounded font-semibold hover:bg-[#E1E6EC] transition-colors cursor-pointer"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectLogin('admin@vetra.gov.in', 'Password@123')}
                    className="text-[10px] bg-[#1E5C97] text-white px-2.5 py-1 rounded font-semibold hover:bg-[#164877] transition-colors cursor-pointer shadow-sm"
                  >
                    Direct Login
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-[#E1E6EC]">
                <div>
                  <span className="text-[#101826] font-semibold">Surveillance Officer:</span>
                  <div className="text-[#1E5C97]">officer@vetra.gov.in · Password@123</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('officer@vetra.gov.in', 'Password@123')}
                    className="text-[10px] bg-[#F6F8FA] text-[#526074] border border-[#C7D0DB] px-2 py-1 rounded font-semibold hover:bg-[#E1E6EC] transition-colors cursor-pointer"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectLogin('officer@vetra.gov.in', 'Password@123')}
                    className="text-[10px] bg-[#1E5C97] text-white px-2.5 py-1 rounded font-semibold hover:bg-[#164877] transition-colors cursor-pointer shadow-sm"
                  >
                    Direct Login
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E1E6EC] text-[11px] font-mono text-[#526074] text-center">
            <p>Authorized personnel only · 256-bit Stateless JWT Security</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 text-center text-xs font-mono text-[#526074] border-t border-[#E1E6EC] bg-white">
        PASHU SATHI National Animal Disease Surveillance System · Smart India Hackathon 2026
      </footer>
    </div>
  );
};
