import React, { useState } from 'react';
import {
  Activity,
  Clock,
  Gauge,
  TrendingDown,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export interface ResidualHistoryPoint {
  iteration: number;
  continuity: number;
  momentum: number;
  energy: number;
}

export interface SimulationRunnerHudProps {
  iteration: number;
  maxIterations: number;
  continuityResidual: number;
  momentumResidual: number;
  energyResidual: number;
  wallClockSeconds: number;
  cflNumber: number;
  inletVelocity: number;
  inletAngle: number;
  isRunning: boolean;
  isConverged: boolean;
  isFailed?: boolean;
  residualHistory?: ResidualHistoryPoint[];
}

function formatWallClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return `${mm}:${ss}.${tenths}`;
}

export const SimulationRunnerHud: React.FC<SimulationRunnerHudProps> = ({
  iteration,
  maxIterations,
  continuityResidual,
  momentumResidual,
  energyResidual,
  wallClockSeconds,
  cflNumber,
  inletVelocity,
  inletAngle,
  isRunning,
  isConverged,
  isFailed = false,
  residualHistory = [],
}) => {
  const [compact, setCompact] = useState(false);

  const progressPct = Math.min(100, Math.max(0, Math.round((iteration / Math.max(1, maxIterations)) * 100)));
  const iterRate = wallClockSeconds > 0.1 ? (iteration / wallClockSeconds).toFixed(1) : '0.0';

  const statusLabel = isFailed
    ? 'FAILED'
    : isConverged
    ? 'CONVERGED'
    : isRunning
    ? 'SOLVING'
    : iteration > 0
    ? 'PAUSED'
    : 'STANDBY';

  // Normalize log10 residual (-6 to 0) to percentage (0% to 100%) for HUD micro-bars
  const residualToBarWidth = (val: number) => {
    const clamped = Math.max(1e-6, Math.min(1, val));
    const logVal = Math.log10(clamped); // -6 .. 0
    return Math.round(((logVal + 6) / 6) * 100);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-2.5 sm:p-3.5 select-none">
      {/* Top Row: Iteration Counter & Wall-Clock Telemetry */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        {/* Top-Left HUD: Iteration Count & Convergence Progress */}
        <div className="pointer-events-auto glass-surface rounded-xl px-3 py-2 shadow-lg backdrop-blur-xl border border-white/60 dark:border-slate-700/70 min-w-[195px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  isFailed
                    ? 'bg-rose-500'
                    : isConverged
                    ? 'bg-emerald-500'
                    : isRunning
                    ? 'bg-sky-500 animate-ping'
                    : 'bg-slate-400'
                }`}
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {statusLabel}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {iterRate} it/s
            </span>
          </div>

          <div className="mt-1 flex items-baseline justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Iteration
              </span>
              <div className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                {iteration.toLocaleString()}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  {' '}
                  / {maxIterations.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Progress
              </span>
              <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                {progressPct}%
              </span>
            </div>
          </div>

          {/* Micro Progress Track */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/90">
            <div
              className={`h-full transition-all duration-200 ${
                isFailed
                  ? 'bg-rose-500'
                  : isConverged
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-sky-500 to-cyan-400'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Top-Right HUD: Wall-Clock Time & Flow Conditions */}
        <div className="pointer-events-auto flex items-start gap-1.5">
          <div className="glass-surface rounded-xl px-3 py-2 shadow-lg backdrop-blur-xl border border-white/60 dark:border-slate-700/70">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Clock className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                  <span>Wall-Clock</span>
                </div>
                <div className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {formatWallClock(wallClockSeconds)}
                  <span className="ml-1 text-[11px] font-normal text-slate-500 dark:text-slate-400">
                    ({wallClockSeconds.toFixed(1)}s)
                  </span>
                </div>
              </div>

              <div className="h-7 w-px bg-slate-300/60 dark:bg-slate-700/70" />

              <div>
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Gauge className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                  <span>Courant</span>
                </div>
                <div className="font-mono text-sm font-bold text-teal-700 dark:text-teal-300 tabular-nums mt-0.5">
                  CFL {cflNumber.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Expand / Collapse HUD Toggle */}
          <button
            onClick={() => setCompact((prev) => !prev)}
            title={compact ? 'Expand Real-Time Residuals HUD' : 'Compact HUD View'}
            aria-label={compact ? 'Expand Real-Time Residuals HUD' : 'Compact HUD View'}
            className="glass-item p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white shadow-md cursor-pointer"
          >
            {compact ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Row: Flow Vector Badge & Live L2 Residuals Glassmorphic HUD */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        {/* Bottom-Left: Freestream Vector Telemetry */}
        <div className="pointer-events-auto glass-item rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm">
          <Zap className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="tabular-nums">U∞ = {inletVelocity.toFixed(1)} m/s</span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className="tabular-nums">α = {inletAngle.toFixed(1)}°</span>
          <span aria-hidden="true" className="text-slate-400 hidden sm:inline">·</span>
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400">60 FPS Field</span>
        </div>

        {/* Bottom-Right: Live Residuals Readout HUD */}
        {!compact && (
          <div className="pointer-events-auto glass-surface rounded-xl px-3.5 py-2.5 shadow-lg backdrop-blur-xl border border-white/60 dark:border-slate-700/70 w-full sm:w-auto sm:min-w-[290px]">
            <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  Live L2 Residuals
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
                Tol: 1.0e-4
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {/* Continuity (p) */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Continuity (p)</span>
                  <span className="font-bold text-sky-700 dark:text-sky-300 tabular-nums">
                    {continuityResidual.toExponential(2)}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                  <div
                    className="h-full bg-sky-500 transition-all duration-200"
                    style={{ width: `${residualToBarWidth(continuityResidual)}%` }}
                  />
                </div>
              </div>

              {/* Momentum (Ux) */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Momentum (Ux)</span>
                  <span className="font-bold text-cyan-700 dark:text-cyan-300 tabular-nums">
                    {momentumResidual.toExponential(2)}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-200"
                    style={{ width: `${residualToBarWidth(momentumResidual)}%` }}
                  />
                </div>
              </div>

              {/* Turbulence / Energy (k-omega) */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Turbulence (k-ω)</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                    {energyResidual.toExponential(2)}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${residualToBarWidth(energyResidual)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mini SVG Residual Sparkline if history points exist */}
            {residualHistory.length > 1 && (
              <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                <svg className="h-7 w-full overflow-visible" viewBox="0 0 120 24" preserveAspectRatio="none">
                  {(['continuity', 'momentum', 'energy'] as const).map((key, idx) => {
                    const strokeColors = ['#0284c7', '#06b6d4', '#10b981'];
                    const pts = residualHistory
                      .slice(-20)
                      .map((pt, i, arr) => {
                        const x = (i / Math.max(1, arr.length - 1)) * 120;
                        const val = Math.max(1e-6, Math.min(1, pt[key]));
                        const normY = 1 - (Math.log10(val) + 6) / 6;
                        const y = Math.max(2, Math.min(22, normY * 22));
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ');
                    return (
                      <polyline
                        key={key}
                        fill="none"
                        stroke={strokeColors[idx]}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={pts}
                      />
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationRunnerHud;
