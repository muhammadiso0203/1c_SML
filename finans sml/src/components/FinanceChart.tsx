import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export interface ChartDataPoint {
  date: string;
  debit: number;
  credit: number;
  net: number;
}

const DEFAULT_CHART_DATA: ChartDataPoint[] = [
  { date: '01.08', debit: 20.8, credit: 12.6, net: 8.2 },
  { date: '02.08', debit: 21.6, credit: 12.6, net: 9.0 },
  { date: '03.08', debit: 20.2, credit: 12.5, net: 7.7 },
  { date: '04.08', debit: 19.8, credit: 12.5, net: 7.3 },
  { date: '05.08', debit: 19.6, credit: 12.4, net: 7.2 },
  { date: '06.08', debit: 19.5, credit: 12.4, net: 7.1 },
  { date: '07.08', debit: 19.5, credit: 12.4, net: 7.1 },
  { date: '08.08', debit: 19.6, credit: 12.4, net: 7.2 },
  { date: '09.08', debit: 19.8, credit: 12.5, net: 7.3 },
  { date: '10.08', debit: 21.2, credit: 12.6, net: 8.6 },
  { date: '11.08', debit: 20.5, credit: 12.7, net: 7.8 },
  { date: '12.08', debit: 21.0, credit: 12.8, net: 8.2 },
  { date: '13.08', debit: 21.5, credit: 12.9, net: 8.6 },
  { date: '14.08', debit: 21.8, credit: 13.1, net: 8.7 },
];

interface FinanceChartProps {
  data?: ChartDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-2xl text-xs space-y-2 min-w-48 z-50">
        <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
          <span>Дата:</span>
          <span className="text-white">{label}.2026</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry) => {
            const isDebit = entry.dataKey === 'debit';
            const isCredit = entry.dataKey === 'credit';
            const isNet = entry.dataKey === 'net';

            let dotColor = '#38bdf8';
            let labelName = 'Чистая позиция';

            if (isDebit) {
              dotColor = '#00d2d2';
              labelName = 'Дебиторская';
            } else if (isCredit) {
              dotColor = '#ff7a63';
              labelName = 'Кредиторская';
            }

            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${isNet ? 'border border-cyan-400 bg-transparent' : ''}`}
                    style={{ backgroundColor: isNet ? undefined : dotColor }}
                  />
                  <span className="text-slate-400">{labelName}:</span>
                </div>
                <span className="font-bold text-white">
                  {entry.value?.toFixed(1).replace('.', ',')} млрд сум
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const FinanceChart: React.FC<FinanceChartProps> = ({
  data = DEFAULT_CHART_DATA,
}) => {
  const [viewMode, setViewMode] = useState<'balance' | 'groups'>('balance');

  return (
    <div className="w-full bg-[#131d36] rounded-[5px] border border-slate-800/90 p-5 md:p-6 shadow-sm transition-all">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            ДИНАМИКА ПО ДНЯМ
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Задолженность и чистая позиция
          </h2>
        </div>

        {/* Action Toggle & Unit Badge */}
        <div className="flex items-center gap-3">
          {/* Segmented Switcher */}
          <div className="bg-slate-900/70 p-1 rounded-[5px] flex items-center border border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('balance')}
              className={`px-3 py-1.5 rounded-[5px] font-medium transition-all cursor-pointer ${
                viewMode === 'balance'
                  ? 'bg-slate-800 text-teal-400 font-semibold border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Общий баланс
            </button>
            <button
              type="button"
              onClick={() => setViewMode('groups')}
              className={`px-3 py-1.5 rounded-[5px] font-medium transition-all cursor-pointer ${
                viewMode === 'groups'
                  ? 'bg-slate-800 text-teal-400 font-semibold border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              По группам
            </button>
          </div>

          {/* Unit Badge */}
          <span className="px-2.5 py-1 rounded-[5px] bg-slate-900/70 text-slate-400 text-xs font-medium border border-slate-700/80">
            млрд сум
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-64 sm:h-68">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="debitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d2d2" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00d2d2" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff7a63" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#ff7a63" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#1e293b"
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />

            <YAxis
              domain={[0, 24]}
              ticks={[0, 6, 12, 18, 24]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Debit Area & Line */}
            <Area
              type="monotone"
              dataKey="debit"
              name="Дебиторская задолженность"
              stroke="#00d2d2"
              strokeWidth={2.5}
              fill="url(#debitGradient)"
              activeDot={{ r: 5, fill: '#00d2d2', stroke: '#131d36', strokeWidth: 2 }}
            />

            {/* Credit Area & Line */}
            <Area
              type="monotone"
              dataKey="credit"
              name="Кредиторская задолженность"
              stroke="#ff7a63"
              strokeWidth={2.5}
              fill="url(#creditGradient)"
              activeDot={{ r: 5, fill: '#ff7a63', stroke: '#131d36', strokeWidth: 2 }}
            />

            {/* Net Position Line */}
            <Line
              type="monotone"
              dataKey="net"
              name="Чистая позиция"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#131d36', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Below the Chart */}
      <div className="flex flex-wrap items-center gap-6 mt-5 pt-3 border-t border-slate-800 text-xs font-medium text-slate-300">
        {/* Debit Legend */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-0.75 bg-[#00d2d2] rounded-full inline-block" />
          <span>Дебиторская задолженность</span>
        </div>

        {/* Credit Legend */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-0.75 bg-[#ff7a63] rounded-full inline-block" />
          <span>Кредиторская задолженность</span>
        </div>

        {/* Net Position Legend */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-0 border-t-2 border-dashed border-[#38bdf8] inline-block" />
          <span>Чистая позиция</span>
        </div>
      </div>
    </div>
  );
};

export default FinanceChart;
