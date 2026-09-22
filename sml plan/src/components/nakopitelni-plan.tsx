import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface ChartItem {
  day: string;
  plan: number;
  planUntilToday: number | null;
  fact: number | null;
  forecast: number | null;
  deficit: [number, number] | null;
}

const data: ChartItem[] = [
  { day: '01', plan: 160, planUntilToday: 160, fact: 120, forecast: 120, deficit: [120, 160] },
  { day: '02', plan: 320, planUntilToday: 320, fact: 240, forecast: 240, deficit: [240, 320] },
  { day: '03', plan: 480, planUntilToday: 480, fact: 370, forecast: 370, deficit: [370, 480] },
  { day: '04', plan: 640, planUntilToday: 640, fact: 500, forecast: 500, deficit: [500, 640] },
  { day: '05', plan: 800, planUntilToday: 800, fact: 620, forecast: 620, deficit: [620, 800] },
  { day: '06', plan: 960, planUntilToday: 960, fact: 740, forecast: 740, deficit: [740, 960] },
  { day: '07', plan: 1120, planUntilToday: 1120, fact: 870, forecast: 870, deficit: [870, 1120] },
  { day: '08', plan: 1280, planUntilToday: 1280, fact: 1000, forecast: 1000, deficit: [1000, 1280] },
  { day: '09', plan: 1440, planUntilToday: 1440, fact: 1120, forecast: 1120, deficit: [1120, 1440] },
  { day: '10', plan: 1600, planUntilToday: 1600, fact: 1240, forecast: 1240, deficit: [1240, 1600] },
  { day: '11', plan: 1760, planUntilToday: 1760, fact: 1370, forecast: 1370, deficit: [1370, 1760] },
  { day: '12', plan: 1920, planUntilToday: 1920, fact: 1500, forecast: 1500, deficit: [1500, 1920] },
  { day: '13', plan: 2080, planUntilToday: 2080, fact: 1620, forecast: 1620, deficit: [1620, 2080] },
  { day: '14', plan: 2240, planUntilToday: 2240, fact: 1740, forecast: 1740, deficit: [1740, 2240] },
  { day: '15', plan: 2400, planUntilToday: 2400, fact: 1870, forecast: 1870, deficit: [1870, 2400] },
  { day: '16', plan: 2560, planUntilToday: 2560, fact: 2000, forecast: 2000, deficit: [2000, 2560] },
  { day: '17', plan: 2720, planUntilToday: 2720, fact: 2120, forecast: 2120, deficit: [2120, 2720] },
  { day: '18', plan: 2880, planUntilToday: 2880, fact: 2240, forecast: 2240, deficit: [2240, 2880] },
  { day: '19', plan: 3040, planUntilToday: 3040, fact: 2360, forecast: 2360, deficit: [2360, 3040] },
  { day: '20', plan: 3350, planUntilToday: 3350, fact: 2500, forecast: 2500, deficit: [2500, 3350] },
  { day: '21', plan: 3510, planUntilToday: null, fact: null, forecast: 2710, deficit: null },
  { day: '22', plan: 3670, planUntilToday: null, fact: null, forecast: 2920, deficit: null },
  { day: '23', plan: 3830, planUntilToday: null, fact: null, forecast: 3130, deficit: null },
  { day: '24', plan: 3990, planUntilToday: null, fact: null, forecast: 3340, deficit: null },
  { day: '25', plan: 4150, planUntilToday: null, fact: null, forecast: 3550, deficit: null },
  { day: '26', plan: 4310, planUntilToday: null, fact: null, forecast: 3760, deficit: null },
  { day: '27', plan: 4470, planUntilToday: null, fact: null, forecast: 3970, deficit: null },
  { day: '28', plan: 4630, planUntilToday: null, fact: null, forecast: 4180, deficit: null },
  { day: '29', plan: 4790, planUntilToday: null, fact: null, forecast: 4390, deficit: null },
  { day: '30', plan: 4920, planUntilToday: null, fact: null, forecast: 4600, deficit: null },
  { day: '31', plan: 5050, planUntilToday: null, fact: null, forecast: 4800, deficit: null },
];

export const NakopitelniPlan: React.FC = () => {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
      {/* Sarlavha va Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight">
          Накопительный план / факт
        </h2>

        <div className="flex items-center mr-80 gap-20 text-xs text-gray-600 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-5 border-t-2 border-dashed border-slate-400 dark:border-slate-500 inline-block" />
            <span>План накопительно</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 border-t-2 border-solid border-[#0f6cbd] dark:border-blue-400 inline-block" />
            <span>Факт накопительно</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 border-t-2 border-dotted border-[#0f6cbd] dark:border-blue-400 inline-block" />
            <span>Прогноз</span>
          </div>
        </div>
      </div>

      {/* Recharts Grafik */}
      <div className="w-full h-80 relative">
        {/* Y o'qi birligi */}
        <span className="absolute left-6 -top-1 text-xs font-medium text-gray-400 dark:text-slate-500 select-none">
          т
        </span>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 28, right: 35, left: -10, bottom: 20 }}
            onMouseMove={(e) => {
              if (e?.activeLabel) setHoveredDay(String(e.activeLabel));
            }}
            onMouseLeave={() => setHoveredDay(null)}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.15} />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.2 }}
              tick={({ x, y, payload }) => {
                const isHovered = hoveredDay === payload.value;
                const is20 = payload.value === '20';
                return (
                  <text
                    x={Number(x)}
                    y={Number(y) + 12}
                    textAnchor="middle"
                    className={`text-[11px] ${
                      isHovered || is20
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
              domain={[0, 6000]}
              ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => (val === 0 ? '0' : `${val / 1000} 000`)}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as ChartItem;
                const dev = d.fact !== null ? d.fact - d.plan : null;

                return (
                  <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl p-3 text-xs min-w-44 z-50 transition-colors">
                    <div className="font-bold text-gray-900 dark:text-slate-100 mb-2">{d.day} августа</div>
                    <div className="flex flex-col gap-1 text-gray-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">План нак.:</span>
                        <span className="font-semibold text-gray-800 dark:text-slate-200">{d.plan.toLocaleString('ru-RU')} т</span>
                      </div>
                      {d.fact !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-slate-400">Факт нак.:</span>
                          <span className="font-semibold text-gray-800 dark:text-slate-200">{d.fact.toLocaleString('ru-RU')} т</span>
                        </div>
                      )}
                      {d.forecast !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-slate-400">Прогноз:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{d.forecast.toLocaleString('ru-RU')} т</span>
                        </div>
                      )}
                      {dev !== null && (
                        <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-slate-700">
                          <span className="text-gray-500 dark:text-slate-400">Отклонение:</span>
                          <span className={`font-semibold ${dev >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-500 dark:text-rose-400'}`}>
                            {dev > 0 ? `+${dev.toLocaleString('ru-RU')}` : dev.toLocaleString('ru-RU')} т
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            {/* Hover bo'lganda chiqadigan vertikal chiziq */}
            {hoveredDay && (
              <ReferenceLine
                x={hoveredDay}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                strokeWidth={1.5}
              />
            )}

            {/* Reja va Fakt orasidagi qizil orqada qolish sohasi (faqat ikkisi oralig'i) */}
            <Area
              type="monotone"
              dataKey="deficit"
              fill="#f43f5e"
              stroke="none"
              fillOpacity={0.18}
              isAnimationActive={false}
            />

            {/* 1. План накопительно */}
            <Line
              type="monotone"
              dataKey="plan"
              stroke="#94a3b8"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />

            {/* 2. Прогноз */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#0f6cbd"
              strokeDasharray="2 2"
              strokeWidth={2}
              dot={false}
            />

            {/* 3. Факт накопительно */}
            <Line
              type="monotone"
              dataKey="fact"
              stroke="#0f6cbd"
              strokeWidth={2.8}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* X o'qi ostidagi oy nomi */}
        <div className="text-center -mt-3 text-xs text-gray-500 dark:text-slate-400 font-medium select-none">
          Август
        </div>
      </div>
    </div>
  );
};

export default NakopitelniPlan;
