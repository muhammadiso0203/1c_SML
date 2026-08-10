import React from 'react';
import { Info } from 'lucide-react';

export const DashboardFooter: React.FC = () => {
  return (
    <div className="w-full bg-[#f0f4f9]/80 border border-slate-200 rounded-xl p-2 flex items-start gap-3 mt-6">
      <Info className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
      <div className="flex flex-col text-[11px] leading-relaxed text-slate-600">
        <span className='text-blue-700'>
          <strong className="text-blue-800 font-black">Примечание:</strong>{' '}
          данные по состоянию на утро 31.07.2026 г.
        </span>
        <span className="font-bold text-blue-700">
          Отчёт сформирован автоматически на основании данных 1С.
        </span>
      </div>
    </div>
  );
};
