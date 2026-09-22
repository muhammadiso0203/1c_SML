import React from 'react';
import { Users, Store, Landmark, Wallet } from 'lucide-react';

export interface DebtStructureRow {
  id: string;
  name: string;
  debit: string;
  credit: string;
  change: string;
  changeType: 'positive' | 'negative';
  iconType: 'users' | 'suppliers' | 'taxes' | 'salary';
  iconBg: string;
  iconColor: string;
}

interface DebtStructureProps {
  date?: string;
  unit?: string;
  rows?: DebtStructureRow[];
}

const DEFAULT_ROWS: DebtStructureRow[] = [
  {
    id: 'customers',
    name: 'Покупатели',
    debit: '21,20',
    credit: '0,60',
    change: '+3,8%',
    changeType: 'positive',
    iconType: 'users',
    iconBg: 'bg-teal-950/60 border border-teal-800/50',
    iconColor: 'text-[#00d2d2]',
  },
  {
    id: 'suppliers',
    name: 'Поставщики',
    debit: '1,10',
    credit: '8,40',
    change: '-2,1%',
    changeType: 'negative',
    iconType: 'suppliers',
    iconBg: 'bg-red-950/60 border border-red-800/50',
    iconColor: 'text-[#ff7a63]',
  },
  {
    id: 'taxes',
    name: 'Налоги и отчисления',
    debit: '0,10',
    credit: '2,60',
    change: '+5,4%',
    changeType: 'positive',
    iconType: 'taxes',
    iconBg: 'bg-amber-950/60 border border-amber-800/50',
    iconColor: 'text-[#fbbf24]',
  },
  {
    id: 'salary',
    name: 'Заработная плата',
    debit: '—',
    credit: '1,70',
    change: '-0,8%',
    changeType: 'negative',
    iconType: 'salary',
    iconBg: 'bg-purple-950/60 border border-purple-800/50',
    iconColor: 'text-[#c084fc]',
  },
];

export const DebtStructure: React.FC<DebtStructureProps> = ({
  date = '14.08.2026',
  unit = 'млрд сум',
  rows = DEFAULT_ROWS,
}) => {
  const renderIcon = (type: DebtStructureRow['iconType'], colorClass: string) => {
    switch (type) {
      case 'users':
        return <Users className={`w-4 h-4 ${colorClass}`} />;
      case 'suppliers':
        return <Store className={`w-4 h-4 ${colorClass}`} />;
      case 'taxes':
        return <Landmark className={`w-4 h-4 ${colorClass}`} />;
      case 'salary':
        return <Wallet className={`w-4 h-4 ${colorClass}`} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-[#131d36] rounded-[5px] border border-slate-800/90 p-5 md:p-6 shadow-sm transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            СОСТОЯНИЕ НА {date}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Структура задолженности
          </h2>
        </div>

        {/* Unit Badge */}
        <span className="px-2.5 py-1 rounded-[5px] bg-slate-900/70 text-slate-400 text-xs font-medium border border-slate-700/80">
          {unit}
        </span>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-2.5 pl-1 font-semibold">ГРУППА</th>
              <th className="pb-2.5 px-4 text-center font-semibold">ДЕБЕТ</th>
              <th className="pb-2.5 px-4 text-center font-semibold">КРЕДИТ</th>
              <th className="pb-2.5 pr-1 text-right font-semibold">ИЗМ. ЗА ПЕРИОД</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Group Column with Icon */}
                <td className="py-2.5 pl-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${row.iconBg}`}
                    >
                      {renderIcon(row.iconType, row.iconColor)}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {row.name}
                    </span>
                  </div>
                </td>

                {/* Debit Value */}
                <td className="py-2 px-4 text-center">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      row.debit === '—'
                        ? 'text-[#00d2d2] font-normal text-base'
                        : 'text-[#00d2d2]'
                    }`}
                  >
                    {row.debit}
                  </span>
                </td>

                {/* Credit Value */}
                <td className="py-2 px-4 text-center">
                  <span className="text-xs sm:text-sm font-bold text-[#ff7a63]">
                    {row.credit}
                  </span>
                </td>

                {/* Change in Period */}
                <td className="py-2 pr-1 text-right">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      row.changeType === 'positive'
                        ? 'text-[#00d2d2]'
                        : 'text-[#ff7a63]'
                    }`}
                  >
                    {row.change}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DebtStructure;
