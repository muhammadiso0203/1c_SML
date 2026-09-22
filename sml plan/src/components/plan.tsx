import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';

export interface DayData {
  day: string;
  dayNumber: number;
  dateStr: string;
  plan: number;
  fact?: number | null;
  status?: 'normal' | 'success' | 'warning' | 'danger';
}

const DEFAULT_CHART_DATA: DayData[] = [
  { day: '01', dayNumber: 1, dateStr: '1 августа', plan: 165, fact: 160, status: 'normal' },
  { day: '02', dayNumber: 2, dateStr: '2 августа', plan: 160, fact: 150, status: 'normal' },
  { day: '03', dayNumber: 3, dateStr: '3 августа', plan: 180, fact: 212, status: 'success' },
  { day: '04', dayNumber: 4, dateStr: '4 августа', plan: 172, fact: 172, status: 'normal' },
  { day: '05', dayNumber: 5, dateStr: '5 августа', plan: 158, fact: 146, status: 'normal' },
  { day: '06', dayNumber: 6, dateStr: '6 августа', plan: 156, fact: 148, status: 'normal' },
  { day: '07', dayNumber: 7, dateStr: '7 августа', plan: 178, fact: 201, status: 'success' },
  { day: '08', dayNumber: 8, dateStr: '8 августа', plan: 162, fact: 166, status: 'normal' },
  { day: '09', dayNumber: 9, dateStr: '9 августа', plan: 162, fact: 146, status: 'normal' },
  { day: '10', dayNumber: 10, dateStr: '10 августа', plan: 160, fact: 148, status: 'normal' },
  { day: '11', dayNumber: 11, dateStr: '11 августа', plan: 172, fact: 188, status: 'success' },
  { day: '12', dayNumber: 12, dateStr: '12 августа', plan: 168, fact: 156, status: 'normal' },
  { day: '13', dayNumber: 13, dateStr: '13 августа', plan: 158, fact: 146, status: 'normal' },
  { day: '14', dayNumber: 14, dateStr: '14 августа', plan: 150, fact: 136, status: 'warning' },
  { day: '15', dayNumber: 15, dateStr: '15 августа', plan: 156, fact: 144, status: 'normal' },
  { day: '16', dayNumber: 16, dateStr: '16 августа', plan: 156, fact: 145, status: 'danger' },
  { day: '17', dayNumber: 17, dateStr: '17 августа', plan: 156, fact: 144, status: 'normal' },
  { day: '18', dayNumber: 18, dateStr: '18 августа', plan: 158, fact: 145, status: 'warning' },
  { day: '19', dayNumber: 19, dateStr: '19 августа', plan: 154, fact: 140, status: 'normal' },
  { day: '20', dayNumber: 20, dateStr: '20 августа', plan: 165, fact: 153, status: 'warning' },
  { day: '21', dayNumber: 21, dateStr: '21 августа', plan: 135, fact: null },
  { day: '22', dayNumber: 22, dateStr: '22 августа', plan: 120, fact: null },
  { day: '23', dayNumber: 23, dateStr: '23 августа', plan: 118, fact: null },
  { day: '24', dayNumber: 24, dateStr: '24 августа', plan: 122, fact: null },
  { day: '25', dayNumber: 25, dateStr: '25 августа', plan: 116, fact: null },
  { day: '27', dayNumber: 27, dateStr: '27 августа', plan: 116, fact: null },
  { day: '28', dayNumber: 28, dateStr: '28 августа', plan: 120, fact: null },
  { day: '29', dayNumber: 29, dateStr: '29 августа', plan: 112, fact: null },
  { day: '30', dayNumber: 30, dateStr: '30 августа', plan: 110, fact: null },
  { day: '31', dayNumber: 31, dateStr: '31 августа', plan: 115, fact: null },
];

const COLORS = {
  plan: '#cbd5e1', // Light slate / gray-blue
  factNormal: '#0f6cbd', // Corporate deep blue
  factSuccess: '#22c55e', // Green
  factWarning: '#eab308', // Amber / Orange
  factDanger: '#ef4444', // Red
};

const getFactColor = (item: DayData) => {
  if (item.status === 'success') return COLORS.factSuccess;
  if (item.status === 'warning') return COLORS.factWarning;
  if (item.status === 'danger') return COLORS.factDanger;
  return COLORS.factNormal;
};

// Custom Tooltip component matching the screenshot exactly
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: DayData;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const plan = data.plan;
  const fact = data.fact;

  const hasFact = fact !== null && fact !== undefined;
  const completionRate = hasFact && plan > 0 ? ((fact / plan) * 100).toFixed(1).replace('.', ',') : null;
  const deviation = hasFact ? fact - plan : null;

  return (
    <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl p-3 text-xs min-w-44 z-50 transition-colors">
      {/* Left indicator triangle */}
      <div className="absolute -left-1.5 top-4 w-3 h-3 bg-white dark:bg-slate-800 border-l border-b border-gray-200 dark:border-slate-700 rotate-45" />

      <div className="font-bold text-gray-900 dark:text-slate-100 mb-2 relative z-10">{data.dateStr}</div>
      <div className="flex flex-col gap-1 text-gray-600 dark:text-slate-300 relative z-10">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-slate-400">План:</span>
          <span className="font-semibold text-gray-800 dark:text-slate-200">{plan} т</span>
        </div>
        {hasFact ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-slate-400">Факт:</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{fact} т</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-slate-400">Выполнение:</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{completionRate}%</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-slate-700">
              <span className="text-gray-500 dark:text-slate-400">Отклонение:</span>
              <span
                className={`font-semibold ${
                  (deviation ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-500 dark:text-rose-400'
                }`}
              >
                {(deviation ?? 0) > 0 ? `+${deviation}` : deviation} т
              </span>
            </div>
          </>
        ) : (
          <div className="text-gray-400 dark:text-slate-500 italic pt-1 border-t border-gray-100 dark:border-slate-700">
            Факт не внесен
          </div>
        )}
      </div>
    </div>
  );
};

export interface BarChartProps {
  data?: DayData[];
  currentDay?: number;
  monthName?: string;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data = DEFAULT_CHART_DATA,
  currentDay = 20,
  monthName = 'Август',
  className = '',
}) => {
  const [hoveredDay, setHoveredDay] = React.useState<string | null>(null);

  const isToday = hoveredDay ? Number(hoveredDay) === currentDay : false;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs transition-colors ${className}`}>
      {/* Header with Title and Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight">
          План / Факт по дням
        </h2>

        {/* Legend */}
        <div className="flex items-center mr-150 gap-10 text-xs text-gray-600 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#cbd5e1] dark:bg-slate-600 inline-block" />
            <span>План</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#0f6cbd] dark:bg-blue-500 inline-block" />
            <span>Факт</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-80 relative">
        {/* Label 'Т' for Y Axis */}
        <div className="absolute left-6 -top-1 text-xs font-medium text-gray-400 dark:text-slate-500 select-none">
          т
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 28, right: 15, left: -20, bottom: 20 }}
            barGap={2}
            barCategoryGap="18%"
            onMouseMove={(state) => {
              if (state?.activeLabel) {
                setHoveredDay(String(state.activeLabel));
              }
            }}
            onMouseLeave={() => {
              setHoveredDay(null);
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#94a3b8"
              strokeOpacity={0.15}
            />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.2 }}
              tick={({ x, y, payload }) => {
                const isHovered = hoveredDay === payload.value;
                const isCurrent = Number(payload.value) === currentDay;
                return (
                  <text
                    x={Number(x)}
                    y={Number(y) + 12}
                    textAnchor="middle"
                    className={`text-[11px] transition-colors ${
                      isHovered || isCurrent
                        ? 'fill-[#0f6cbd] dark:fill-blue-400 font-bold'
                        : 'fill-gray-500 dark:fill-slate-400 font-normal'
                    }`}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />

            <YAxis
              domain={[0, 250]}
              ticks={[0, 50, 100, 150, 200, 250]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
            />

            {/* Reference Line and Label ONLY shown when hovered */}
            {hoveredDay && (
              <ReferenceLine
                x={hoveredDay}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: isToday
                    ? `Сегодня, ${Number(hoveredDay)} ${monthName.toLowerCase()}а`
                    : `${Number(hoveredDay)} ${monthName.toLowerCase()}а`,
                  position: 'top',
                  fill: '#3b82f6',
                  fontSize: 11,
                  fontWeight: 600,
                  offset: 8,
                }}
              />
            )}

            {/* Plan Bars */}
            <Bar
              dataKey="plan"
              name="План"
              fill={COLORS.plan}
              radius={[2, 2, 0, 0]}
              maxBarSize={14}
            />

            {/* Fact Bars */}
            <Bar
              dataKey="fact"
              name="Факт"
              radius={[2, 2, 0, 0]}
              maxBarSize={14}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`fact-cell-${index}`}
                  fill={getFactColor(entry)}
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>

        {/* Sub-label for Month */}
        <div className="text-center -mt-3 text-xs text-gray-500 dark:text-slate-400 font-medium select-none">
          {monthName}
        </div>
      </div>
    </div>
  );
};

export default BarChart;

