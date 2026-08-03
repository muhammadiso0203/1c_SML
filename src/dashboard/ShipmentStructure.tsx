import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ShipmentData {
  name: string;
  value: number;
  valueStr: string;
  percent: string;
  color: string;
}

export const ShipmentStructure: React.FC = () => {
  const data: ShipmentData[] = [
    { name: 'БОПП-плёнка', value: 1458.3, valueStr: '1 458,3', percent: '31,0%', color: '#0b3a82' },
    { name: 'Прошивные мешки', value: 1280.2, valueStr: '1 280,2', percent: '27,2%', color: '#388e3c' },
    { name: 'МКР', value: 696.8, valueStr: '696,8', percent: '14,8%', color: '#fbc02d' },
    { name: 'Коробчатые мешки', value: 487.6, valueStr: '487,6', percent: '10,4%', color: '#7b1fa2' },
    { name: 'Стрейч-плёнка', value: 486.4, valueStr: '486,4', percent: '10,3%', color: '#f57c00' },
    { name: 'Рукава', value: 115.5, valueStr: '115,5', percent: '2,5%', color: '#4fc3f7' },
    { name: 'Выдувная плёнка', value: 97.0, valueStr: '97,0', percent: '2,1%', color: '#90caf9' },
    { name: 'Регранулят', value: 65.6, valueStr: '65,6', percent: '1,4%', color: '#0288d1' },
    { name: 'Прочие (сумка, отходы нити)', value: 18.4, valueStr: '18,4', percent: '0,3%', color: '#b0bec5' },
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const percentVal = data[index].percent;
    const isSmall = parseFloat(percentVal.replace(',', '.')) < 5;
    
    const radius = isSmall 
      ? outerRadius + 14 
      : outerRadius * 0.6;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={isSmall ? '#1e293b' : '#ffffff'}
        textAnchor={isSmall ? (x > cx ? 'start' : 'end') : 'middle'}
        dominantBaseline="central"
        className="text-[10px] font-extrabold"
      >
        {percentVal}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full justify-between">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <h3 className="text-[#002f6c] text-sm font-extrabold uppercase tracking-wide text-center w-full">
          5. СТРУКТУРА ОТГРУЗКИ ЗА ИЮЛЬ <span className="text-black font-normal lowercase">(по весу, т)</span>
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col lg:flex-row gap-8 items-center justify-between">
        
        {/* Left Side: Pie Chart */}
        <div className="w-full lg:w-1/2 h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [`${value} т`, name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif' }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={90}
                labelLine={false}
                label={renderCustomizedLabel}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side: Detailed Table */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between text-xs font-bold text-slate-700">
          <div className="flex flex-col gap-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2 max-w-[65%]">
                  <div
                    className="w-3 h-3 rounded shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-[11px] font-bold text-slate-700">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="font-mono text-slate-800 font-bold text-[11px]">{item.valueStr} т</span>
                  <span className="font-mono text-slate-400 w-12 text-[11px]">{item.percent}</span>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-slate-100 my-3" />

          {/* TOTAL Row */}
          <div className="flex items-center justify-between text-xs font-extrabold text-[#002f6c] uppercase tracking-wide">
            <span>ИТОГО</span>
            <div className="flex items-center gap-4 text-right">
              <span className="font-mono font-black text-[#002f6c] text-xs">4 705,4 т</span>
              <span className="font-mono text-[#002f6c] w-12 text-xs">100,0%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
