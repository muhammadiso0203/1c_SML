import React from 'react';
import { usePr010 } from '../../pages/dashboard/service/usePr010';

interface EquipmentRow {
  name: string;
  status: 'green' | 'yellow' | 'orange' | 'red';
  dayValue: string;
  monthValue: string;
}

const getRussianMonthName = (monthIndex: number) => {
  const months = [
    "январь", "февраль", "март", "апрель", "май", "июнь",
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
  ];
  return months[monthIndex] || "июль";
};

const getStatus = (val: number): 'green' | 'yellow' | 'orange' | 'red' => {
  if (val >= 70) return 'green';
  if (val >= 40) return 'yellow';
  if (val >= 20) return 'orange';
  return 'red';
};

export const EquipmentUsage: React.FC<{ date?: string }> = ({ date = "20260724" }) => {
  const { data: pr010Response, isLoading } = usePr010(date);

  const formattedDate = React.useMemo(() => {
    if (date.length === 8) {
      const y = date.substring(0, 4);
      const m = date.substring(4, 6);
      const d = date.substring(6, 8);
      return `${d}.${m}.${y}`;
    }
    return date;
  }, [date]);

  const monthName = React.useMemo(() => {
    if (date.length === 8) {
      const m = parseInt(date.substring(4, 6), 10) - 1;
      return getRussianMonthName(m);
    }
    return "июль";
  }, [date]);

  const rows: EquipmentRow[] = React.useMemo(() => {
    const a2Data = pr010Response?.data?.A2;
    if (a2Data && Array.isArray(a2Data) && a2Data.length > 0) {
      return a2Data.map((item) => {
        const dayVal = item.PercentageDay ?? 0;
        const monthVal = item.PercentageMonth ?? 0;
        return {
          name: item.Equipment,
          status: getStatus(dayVal),
          dayValue: `${dayVal.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} %`,
          monthValue: `${monthVal.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} %`
        };
      });
    }

    // Fallback rows if backend hasn't returned A2 data
    return [
      { name: 'Экструдер', status: 'green', dayValue: '50 %', monthValue: '54 %' },
      { name: 'Круглоткацкий', status: 'yellow', dayValue: '67 %', monthValue: '57 %' },
      { name: 'Конвертекс', status: 'yellow', dayValue: '63 %', monthValue: '61 %' },
      { name: 'Ламинация', status: 'red', dayValue: '50 %', monthValue: '46 %' },
      { name: 'Выдувной', status: 'green', dayValue: '75 %', monthValue: '73 %' },
      { name: 'БОПП', status: 'green', dayValue: '100 %', monthValue: '100 %' },
      { name: 'Стрейч', status: 'red', dayValue: '0 %', monthValue: '53 %' },
      { name: 'Резка и швейка', status: 'yellow', dayValue: '66 %', monthValue: '60 %' }
    ];
  }, [pr010Response]);

  const statusColors: Record<string, string> = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-400',
    orange: 'bg-orange-500',
    red: 'bg-rose-500'
  };

  return (
    <div className="w-full bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full justify-between shadow-xl text-slate-200">
      <div>
        {/* Title Header */}
        <div className="bg-[#1e293b] px-6 py-3 border-b border-slate-800">
          <h2 className="text-white text-[clamp(0.7rem,1vw,0.9rem)] font-extrabold uppercase tracking-wide">
            2. ИСПОЛЬЗОВАНИЕ ОБОРУДОВАНИЯ
          </h2>
        </div>

        {/* Table Content */}
        <div className={`p-2 sm:p-4 overflow-hidden transition-all duration-300 ${isLoading ? 'opacity-60 animate-pulse' : ''}`}>
          <table className="w-full border-collapse text-left font-sans text-[clamp(0.55rem,0.75vw,0.8rem)] table-fixed">
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
                  <span className="text-[10px] text-slate-400 font-normal">{formattedDate}</span>
                </th>
                <th className="py-1.5 px-3 font-bold text-slate-300 text-center border-l border-slate-800">
                  За {monthName}
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
                    <span className={`w-[clamp(0.8rem,1vw,1rem)] h-[clamp(0.8rem,1vw,1rem)] rounded-full mr-2 shrink-0 ${statusColors[row.status]}`} />
                  </td>
                  {/* Day Value */}
                  <td className="py-2 px-3 text-center font-semibold text-slate-200 border-l border-slate-800 font-mono">
                    {isLoading && !pr010Response ? '...' : row.dayValue}
                  </td>
                  {/* Month Value */}
                  <td className="py-2 px-3 text-center font-semibold text-slate-200 border-l border-slate-800 font-mono">
                    {isLoading && !pr010Response ? '...' : row.monthValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="border-t border-slate-800 bg-[#172033] px-3 py-3 sm:px-6 mt-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[clamp(0.55rem,0.8vw,0.7rem)] font-bold text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-[clamp(0.8rem,1vw,1rem)] h-[clamp(0.8rem,1vw,1rem)] rounded-full bg-emerald-500 shrink-0" />
            <span>&ge; 70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-[clamp(0.8rem,1vw,1rem)] h-[clamp(0.8rem,1vw,1rem)] rounded-full bg-amber-400 shrink-0" />
            <span>40 &ndash; 69%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-[clamp(0.8rem,1vw,1rem)] h-[clamp(0.8rem,1vw,1rem)] rounded-full bg-orange-500 shrink-0" />
            <span>20 &ndash; 39%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-[clamp(0.8rem,1vw,1rem)] h-[clamp(0.8rem,1vw,1rem)] rounded-full bg-rose-500 shrink-0" />
            <span>&lt; 20%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

