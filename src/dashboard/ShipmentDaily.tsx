import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';

interface DailyData {
  name: string;
  value: number;
  valueStr: string;
}

const data: DailyData[] = [
  { name: 'Прошивные мешки', value: 101.7, valueStr: '101,7' },
  { name: 'БОПП-плёнка', value: 87.3, valueStr: '87,3' },
  { name: 'МКР', value: 32.2, valueStr: '32,2' },
  { name: 'Выдувная плёнка', value: 12.1, valueStr: '12,1' },
  { name: 'Стрейч-плёнка', value: 8.2, valueStr: '8,2' },
  { name: 'Коробчатые мешки', value: 5.7, valueStr: '5,7' },
  { name: 'Сумка', value: 0.1, valueStr: '0,1' },
];

export const ShipmentDaily: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full justify-between">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <h3 className="text-[#002f6c] text-sm font-extrabold uppercase tracking-wide text-center w-full">
          6. ОТГРУЗКА ЗА ДЕНЬ (30.07.2026), т
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between relative min-h-75">
        {/* Chart Container */}
        <div className="w-full h-64 pr-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, 120]}
                ticks={[0, 20, 40, 60, 80, 100, 120]}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={true}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#334155', fontSize: 10, fontWeight: 'bold' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={true}
                width={120}
              />
              <Bar dataKey="value" fill="#0b3a82" radius={[0, 4, 4, 0]} barSize={12}>
                <LabelList
                  dataKey="valueStr"
                  position="right"
                  style={{ fill: '#334155', fontSize: 10, fontWeight: 'extrabold' }}
                  offset={8}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Floating TOTAL Box */}
        <div className="absolute bottom-25 right-6 bg-blue-50 border border-blue-100 rounded-lg px-5 py-3 flex flex-col items-center">
          <span className="text-[#002f6c] text-[10px] font-black uppercase tracking-wider mb-0.5">
            ИТОГО
          </span>
          <span className="text-xl md:text-2xl font-black text-[#002f6c] tracking-tight">
            247,4 <span className="text-sm font-bold ml-0.5">т</span>
          </span>
        </div>
      </div>
    </div>
  );
};
