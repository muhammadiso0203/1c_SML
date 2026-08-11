import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePr010 } from '../../pages/dashboard/service/usePr010';

interface ShipmentData {
  name: string;
  value: number;
  valueStr: string;
  percent: string;
  color: string;
}

const colorMap: Record<string, string> = {
  'БОПП': '#0b3a82',
  'Прошивные мешки': '#388e3c',
  'МКР': '#fbc02d',
  'Коробчатые мешки': '#7b1fa2',
  'Стрейч': '#f57c00',
  'Рукава': '#4fc3f7',
  'Выдувная плёнка': '#90caf9',
  'Регранулят': '#0288d1',
  'Отход': '#b0bec5',
  'Мультифламентная нить': '#80deea',
  'Прочие (сумка, отходы нити)': '#b0bec5',
};

const nameMap: Record<string, string> = {
  'БОПП': 'БОПП-плёнка',
  'Стрейч': 'Стрейч-плёнка',
  'Прочие (сумка, отходы нити)': 'Прочие (сумка, отходы нити)',
};

const getProductDetails = (producttype: string, index: number) => {
  const p = producttype.trim();
  const name = nameMap[p] || p;

  const defaultColors = [
    '#0b3a82', '#388e3c', '#fbc02d', '#7b1fa2', '#f57c00',
    '#4fc3f7', '#90caf9', '#0288d1', '#b0bec5', '#80deea',
    '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#009688'
  ];

  const color = colorMap[p] || defaultColors[index % defaultColors.length];
  return { name, color };
};

export const ShipmentStructure: React.FC<{ date?: string }> = ({ date = "20260724" }) => {
  const { data: pr010Response, isLoading: isPr010Loading } = usePr010(date);

  const monthName = React.useMemo(() => {
    if (date.length === 8) {
      const m = parseInt(date.substring(4, 6), 10) - 1;
      const months = [
        "ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ", "МАЙ", "ИЮНЬ",
        "ИЮЛЬ", "АВГУСТ", "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"
      ];
      return months[m] || "ИЮЛЬ";
    }
    return "ИЮЛЬ";
  }, [date]);

  const apiData: ShipmentData[] = React.useMemo(() => {
    if (!pr010Response?.data?.A5) {
      return [];
    }
    return pr010Response.data.A5.map((item, index) => {
      const { name, color } = getProductDetails(item.producttype, index);
      const val = item.remains;
      const frac = item.fraction;
      return {
        name,
        value: val,
        valueStr: val.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        percent: frac.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%',
        color
      };
    });
  }, [pr010Response]);

  const totalValue = React.useMemo(() => {
    if (pr010Response?.data) {
      if (pr010Response.data.shipment_PER_month !== undefined) {
        return pr010Response.data.shipment_PER_month;
      }
      if (pr010Response.data.A5) {
        return pr010Response.data.A5.reduce((sum, item) => sum + item.remains, 0);
      }
    }
    return 0;
  }, [pr010Response]);

  const totalValueStr = React.useMemo(() => {
    if (isPr010Loading) return '...';
    return totalValue.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }, [totalValue, isPr010Loading]);

  const data = apiData;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    if (!data[index]) return null;
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
        fill={isSmall ? '#94a3b8' : '#ffffff'}
        textAnchor={isSmall ? (x > cx ? 'start' : 'end') : 'middle'}
        dominantBaseline="central"
        className="text-[10px] font-extrabold"
      >
        {percentVal}
      </text>
    );
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full justify-between shadow-xl">
      {/* Header */}
      <div className="bg-[#111827] border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h3 className="text-white text-[clamp(0.7rem,1vw,0.9rem)] font-extrabold uppercase tracking-wide text-center w-full">
          5. СТРУКТУРА ОТГРУЗКИ ЗА {monthName} <span className="text-slate-400 font-normal lowercase">(по весу, т)</span>
        </h3>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6 flex-1 flex flex-col xl:flex-row gap-4 sm:gap-8 items-center justify-between relative min-h-75">
        {isPr010Loading && (
          <div className="absolute inset-0 bg-[#111827]/80 flex items-center justify-center z-10">
            <div className="inline-block w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className={`flex-1 flex flex-col xl:flex-row gap-4 sm:gap-8 items-center justify-between w-full transition-all duration-300 ${isPr010Loading ? 'opacity-40' : ''}`}>
          {/* Left Side: Pie Chart */}
          <div className="w-full xl:w-1/2 h-52 sm:h-64 flex items-center justify-center">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} т`, name]}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontFamily: 'sans-serif' }}
                    itemStyle={{ color: '#f8fafc' }}
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
            ) : (
              <span className="text-slate-400 text-xs font-bold">Данные отсутствуют</span>
            )}
          </div>

          {/* Right Side: Detailed Table */}
          <div className="w-full xl:w-1/2 flex flex-col justify-between text-xs font-bold text-slate-300 h-full">
            <div className="flex flex-col gap-2 overflow-y-auto max-h-55 pr-1">
              {data.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2 max-w-[65%]">
                    <div
                      className="w-3 h-3 rounded shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-[clamp(0.6rem,0.8vw,0.7rem)] font-bold text-slate-200">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="font-mono text-slate-100 font-bold text-[clamp(0.6rem,0.8vw,0.7rem)]">{item.valueStr} т</span>
                    <span className="font-mono text-slate-400 w-12 text-[clamp(0.6rem,0.8vw,0.7rem)]">{item.percent}</span>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-slate-800 my-3" />

            {/* TOTAL Row */}
            <div className="flex items-center justify-between text-[clamp(0.6rem,0.8vw,0.75rem)] font-extrabold text-blue-400 uppercase tracking-wide mt-auto">
              <span>ИТОГО</span>
              <div className="flex items-center gap-4 text-right">
                <span className="font-mono font-black text-blue-400 text-[clamp(0.6rem,0.8vw,0.75rem)]">{totalValueStr} т</span>
                <span className="font-mono text-blue-400 w-12 text-[clamp(0.6rem,0.8vw,0.75rem)]">100,0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
