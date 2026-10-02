import React, { useEffect } from 'react';

const REDUCED_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DURATION_MS = REDUCED_MOTION ? 1200 : 4200;

const styles = `
@keyframes ps-logo-in {
  0%   { opacity: 0; transform: scale(0.82); filter: blur(10px); }
  60%  { opacity: 1; filter: blur(0); }
  100% { opacity: 1; transform: scale(1.04); filter: blur(0); }
}
@keyframes ps-rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ps-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes ps-out { to { opacity: 0; } }
.ps-splash { animation: ps-out 500ms ease-in ${DURATION_MS - 500}ms forwards; }
.ps-logo   { animation: ps-logo-in 3200ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ps-rise-1 { animation: ps-rise 900ms ease-out 1100ms both; }
.ps-rise-2 { animation: ps-rise 900ms ease-out 1500ms both; }
.ps-bar    { animation: ps-bar ${DURATION_MS - 500}ms linear both; transform-origin: left; }
@media (prefers-reduced-motion: reduce) {
  .ps-splash, .ps-logo, .ps-rise-1, .ps-rise-2, .ps-bar { animation: none; }
}
`;

/** Slow-motion welcome shown once per browser tab before the Command Center loads. */
export const WelcomeSplash: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  useEffect(() => {
    const timer = window.setTimeout(onDone, DURATION_MS);
    window.addEventListener('keydown', onDone);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onDone);
    };
  }, [onDone]);

  return (
    <div
      className="ps-splash fixed inset-0 bg-white flex flex-col items-center justify-center px-4 select-none cursor-pointer"
      onClick={onDone}
      role="status"
      aria-label="Welcome to Pashu Sathi"
    >
      <style>{styles}</style>
      <img
        src="/pashu-sathi-logo.png"
        alt="PASHU SATHI"
        className="ps-logo w-52 h-52 sm:w-64 sm:h-64 object-contain"
      />
      <p className="ps-rise-1 mt-2 text-[11px] font-mono uppercase tracking-[0.3em] text-[#526074]">
        Welcome to the
      </p>
      <h1 className="ps-rise-1 mt-1 text-xl sm:text-2xl font-bold text-[#101826] tracking-tight text-center">
        Government Command Centre
      </h1>
      <p className="ps-rise-2 mt-1.5 text-xs font-mono text-[#526074] text-center">
        National Animal Disease Surveillance · DAHD
      </p>
      <div className="absolute bottom-0 inset-x-0 h-1 bg-[#E1E6EC]">
        <div className="ps-bar h-full bg-[#1E5C97]" />
      </div>
    </div>
  );
};
