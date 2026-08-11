import React from 'react';

interface EquipmentRow {
  name: string;
  status: 'green' | 'yellow' | 'orange' | 'red';
  dayValue: string;
  julyValue: string;
}

export const EquipmentUsage: React.FC = () => {
  const rows: EquipmentRow[] = [
    { name: 'Экструдер', status: 'green', dayValue: '50 %', julyValue: '54 %' },
    { name: 'Круглоткацкий', status: 'yellow', dayValue: '67 %', julyValue: '57 %' },
    { name: 'Конвертекс', status: 'yellow', dayValue: '63 %', julyValue: '61 %' },
    { name: 'Ламинация', status: 'red', dayValue: '50 %', julyValue: '46 %' },
    { name: 'Выдувной', status: 'green', dayValue: '75 %', julyValue: '73 %' },
    { name: 'БОПП', status: 'green', dayValue: '100 %', julyValue: '100 %' },
    { name: 'Стрейч', status: 'red', dayValue: '0 %', julyValue: '53 %' },
    { name: 'Резка и швейка', status: 'yellow', dayValue: '66 %', julyValue: '60 %' }
  ];

  const statusColors: Record<string, string> = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-400 ',
    orange: 'bg-orange-500 ',
    red: 'bg-rose-500 '
  };

  return (
    <div className="w-full bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full justify-between shadow-xl text-slate-200">
      <div>
        {/* Title Header */}
        <div className="bg-[#1e293b] px-6 py-3 border-b border-slate-800">
          <h2 className="text-white text-sm font-extrabold uppercase tracking-wide">
            2. ИСПОЛЬЗОВАНИЕ ОБОРУДОВАНИЯ
          </h2>
        </div>

        {/* Table Content */}
        <div className="p-4 overflow-x-auto">
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              {/* Header Row 1 */}
              <tr className="border-b border-slate-800">
                <th className="py-2.5 px-3 font-bold text-slate-200 w-1/2" rowSpan={2}>
                  Вид оборудования
                </th>
                <th className="py-1 px-3 font-bold text-slate-200 text-center border-l border-slate-800" colSpan={2}>
                  Использование, %
                </th>
              </tr>
              {/* Header Row 2 */}
              <tr className="border-b border-slate-800 bg-[#172033]">
                <th className="py-1.5 px-3 font-bold text-slate-300 text-center border-l border-slate-800">
                  За день<br />
                  <span className="text-[10px] text-slate-400 font-normal">30.07.2026</span>
                </th>
                <th className="py-1.5 px-3 font-bold text-slate-300 text-center border-l border-slate-800">
                  За июль
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.name}
                  className={`border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors duration-150 ${
                    index % 2 === 1 ? 'bg-slate-800/20' : ''
                  }`}
                >
                  {/* Equipment Name & Status Dot */}
                  <td className="py-2 px-3 font-medium text-slate-200 flex items-center justify-between">
                    <span>{row.name}</span>
                    <span className={`w-3.5 h-3.5 rounded-full mr-2 shrink-0 ${statusColors[row.status]}`} />
                  </td>
                  {/* Day Value */}
                  <td className="py-2 px-3 text-center font-semibold text-slate-200 border-l border-slate-800 font-mono">
                    {row.dayValue}
                  </td>
                  {/* July Value */}
                  <td className="py-2 px-3 text-center font-semibold text-slate-200 border-l border-slate-800 font-mono">
                    {row.julyValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="border-t border-slate-800 bg-[#172033] px-6 py-3 mt-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-bold text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
            <span>&ge; 70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0" />
            <span>40 &ndash; 69%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shrink-0" />
            <span>20 &ndash; 39%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0" />
            <span>&lt; 20%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
