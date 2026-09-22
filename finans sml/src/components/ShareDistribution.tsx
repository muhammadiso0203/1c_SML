import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export interface DistributionItem {
  id: string;
  name: string;
  value: number;
  formattedValue: string;
  percentage: number;
  color: string;
}

const DEFAULT_DISTRIBUTION: DistributionItem[] = [
  {
    id: 'customers',
    name: 'Покупатели',
    value: 21.2,
    formattedValue: '21,2',
    percentage: 62,
    color: '#00d2d2',
  },
  {
    id: 'suppliers',
    name: 'Поставщики',
    value: 8.4,
    formattedValue: '8,4',
    percentage: 25,
    color: '#ff7a63',
  },
  {
    id: 'taxes',
    name: 'Налоги и отчисления',
    value: 2.6,
    formattedValue: '2,6',
    percentage: 8,
    color: '#fbbf24',
  },
  {
    id: 'salary',
    name: 'Заработная плата',
    value: 1.7,
    formattedValue: '1,7',
    percentage: 5,
    color: '#c084fc',
  },
];

interface ShareDistributionProps {
  items?: DistributionItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: DistributionItem;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0f172a]/95 backdrop-blur-sm border border-slate-700 rounded-lg p-2.5 shadow-2xl text-xs z-50">
        <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span>{data.name}</span>
        </div>
        <div className="text-slate-400">
          Объем:{' '}
          <span className="font-bold text-white">
            {data.formattedValue} млрд сум ({data.percentage}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const ShareDistribution: React.FC<ShareDistributionProps> = ({
  items = DEFAULT_DISTRIBUTION,
}) => {
  const totalValue = items.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full h-full bg-[#131d36] rounded-[5px] border border-slate-800/90 p-5 md:p-6 shadow-sm flex flex-col justify-between transition-all">
      {/* Top Header */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          РАСПРЕДЕЛЕНИЕ
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-4">
          Доля в общем объёме
        </h2>
      </div>

      {/* Main Content Area: Legend List & Donut Chart */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
        {/* Left Side: Legend with Values & Percentages */}
        <div className="w-full sm:w-1/2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs sm:text-sm group"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-200 font-medium truncate max-w-36">
                  {item.name}
                </span>
              </div>
              <div className="text-right whitespace-nowrap pl-2">
                <span className="font-bold text-white">
                  {item.formattedValue}
                </span>
                <span className="text-slate-400 text-xs ml-1.5 font-normal">
                  · {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Recharts Donut Chart */}
        <div className="w-full sm:w-1/2 h-44 sm:h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={items}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={75}
                paddingAngle={3}
                stroke="#131d36"
                strokeWidth={2}
              >
                {items.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Всего
            </span>
            <span className="text-sm font-bold text-white">
              {totalValue.toFixed(1).replace('.', ',')}
            </span>
            <span className="text-[9px] text-slate-400">млрд</span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Info */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Основные доли: Покупатели и Поставщики</span>
        <span className="font-semibold text-slate-200">87%</span>
      </div>
    </div>
  );
};

export default ShareDistribution;
