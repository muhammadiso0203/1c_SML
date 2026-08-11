import React from 'react';
import { Info } from 'lucide-react';

export const DashboardFooter: React.FC = () => {
  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-xl p-3 flex items-start gap-3 mt-6 shadow-md">
      <div className="mt-0.5 shrink-0 text-blue-400">
        <Info className="w-[clamp(0.9rem,1.2vw,1.25rem)] h-[clamp(0.9rem,1.2vw,1.25rem)]" />
      </div>
      <div className="flex flex-col text-[clamp(0.6rem,0.8vw,0.75rem)] leading-relaxed text-slate-300">
        <span className='text-blue-300'>
          <strong className="text-blue-400 font-black">Примечание:</strong>{' '}
          данные по состоянию на утро 31.07.2026 г.
        </span>
        <span className="font-bold text-blue-300">
          Отчёт сформирован автоматически на основании данных 1С.
        </span>
      </div>
    </div>
  );
};
