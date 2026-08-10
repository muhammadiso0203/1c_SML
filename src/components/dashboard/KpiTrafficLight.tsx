import React from 'react';

interface KpiIndicator {
  name: string;
  status: 'green' | 'yellow' | 'orange' | 'red';
}

const indicators: KpiIndicator[] = [
  { name: 'Выполнение плана', status: 'yellow' },
  { name: 'Производство', status: 'green' },
  { name: 'Отгрузка', status: 'green' },
  { name: 'Использование оборудования', status: 'yellow' },
  { name: 'БОПП', status: 'green' },
  { name: 'Стрейч', status: 'red' },
  { name: 'Выдувная плёнка', status: 'red' },
  { name: 'Ламинация', status: 'orange' },
  { name: 'Экструдер', status: 'yellow' },
  { name: 'Круглоткацкий', status: 'yellow' },
  { name: 'Резка и швейка', status: 'yellow' },
];

const statusColors: Record<string, string> = {
  green: 'bg-emerald-600',
  yellow: 'bg-amber-400',
  orange: 'bg-orange-500',
  red: 'bg-red-600',
};

export const KpiTrafficLight: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#f0f4f9] border-b border-slate-100 px-6 py-3.5 flex items-center justify-center">
        <h2 className="text-[#002f6c] text-sm font-extrabold uppercase tracking-wide text-center">
          8. СВЕТОФОР KPI
        </h2>
      </div>

      {/* Main Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        
        {/* Table */}
        <table className="w-full text-xs font-bold text-slate-700 border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-left font-bold text-[11px]">
              <th className="py-1 pr-4">Показатель</th>
              <th className="py-1 text-center w-16 border-l border-slate-200">Статус</th>
            </tr>
          </thead>
          <tbody>
            {indicators.map((item) => (
              <tr key={item.name} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-1 pr-4 text-slate-800 font-bold">{item.name}</td>
                <td className="py-1 text-center border-l border-slate-100">
                  <div className={`w-3.5 h-3.5 rounded-full mx-auto ${statusColors[item.status]}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend Footer */}
        <div className="mt-6 pt-4 border-t border-slate-150">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-slate-600 font-bold justify-items-center">
            <div className="flex items-center gap-1.5 w-full justify-start pl-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0" />
              <span>Хорошо</span>
            </div>
            <div className="flex items-center gap-1.5 w-full justify-start pl-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0" />
              <span>Удовл.</span>
            </div>
            <div className="flex items-center gap-1.5 w-full justify-start pl-2">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shrink-0" />
              <span>Требует внимания</span>
            </div>
            <div className="flex items-center gap-1.5 w-full justify-start pl-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0" />
              <span>Плохо</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
