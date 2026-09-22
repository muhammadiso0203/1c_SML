import React from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2 } from 'lucide-react';

export interface SignalItem {
  id: string;
  type: 'danger' | 'warning' | 'success';
  title: string;
  description: string;
}

interface FinancialSignalsProps {
  signals?: SignalItem[];
  coverageRatio?: string;
  targetRatio?: string;
  coveragePercent?: number;
}

const DEFAULT_SIGNALS: SignalItem[] = [
  {
    id: 'overdue_growth',
    type: 'danger',
    title: 'Просрочка растёт',
    description: '+0,4 млрд сум за 14 дней',
  },
  {
    id: 'upcoming_payments',
    type: 'warning',
    title: 'Платежи в ближайшие 7 дней',
    description: '3,1 млрд сум',
  },
  {
    id: 'positive_position',
    type: 'success',
    title: 'Позиция положительная',
    description: 'Дебиторка выше кредиторки на 8,9 млрд сум',
  },
];

export const FinancialSignals: React.FC<FinancialSignalsProps> = ({
  signals = DEFAULT_SIGNALS,
  coverageRatio = '1,66×',
  targetRatio = '≥ 1,20×',
  coveragePercent = 75,
}) => {
  return (
    <div className="w-full h-full bg-[#131d36] rounded-[5px] border border-slate-800/90 p-5 md:p-6 shadow-sm flex flex-col justify-between transition-all">
      {/* Top Header */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          ФИНАНСОВЫЕ СИГНАЛЫ
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-4">
          На что обратить внимание
        </h2>

        {/* Signals List */}
        <div className="space-y-3">
          {signals.map((signal) => {
            if (signal.type === 'danger') {
              return (
                <div
                  key={signal.id}
                  className="p-3 sm:p-3.5 rounded-lg border border-red-900/40 bg-red-950/20 flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-md bg-red-900/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-[#ff7a63]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {signal.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      {signal.description}
                    </p>
                  </div>
                </div>
              );
            }

            if (signal.type === 'warning') {
              return (
                <div
                  key={signal.id}
                  className="p-3 sm:p-3.5 rounded-lg border border-amber-900/40 bg-amber-950/20 flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-md bg-amber-900/30 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-[#fbbf24]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {signal.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      {signal.description}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={signal.id}
                className="p-3 sm:p-3.5 rounded-lg border border-teal-900/40 bg-teal-950/20 flex items-center gap-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-md bg-teal-900/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#00d2d2]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {signal.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    {signal.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Coverage Metric */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">
            Покрытие кредиторки
          </span>
          <span className="text-base sm:text-lg font-bold text-white">
            {coverageRatio}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-teal-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-teal-500/50"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>

        {/* Target Info */}
        <div className="text-[11px] text-slate-400 mt-1.5">
          Целевое значение {targetRatio}
        </div>
      </div>
    </div>
  );
};

export default FinancialSignals;
