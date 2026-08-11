import React from 'react';
import { Info } from 'lucide-react';

export const DashboardFooter: React.FC = () => {
  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-xl p-3 flex items-start gap-3 mt-6 shadow-md">
      <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
      <div className="flex flex-col text-[11px] leading-relaxed text-slate-300">
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
