import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { usePr010 } from '../../pages/service/usePr010';





const mapShipmentProduct = (producttype: string) => {
  const p = producttype.trim();
  if (p === "БОПП") return "БОПП-плёнка";
  if (p === "Стрейч") return "Стрейч-плёнка";
  if (p === "Прошивные мешки") return "Прошивные мешки";
  if (p === "Коробчатые мешки") return "Коробчатые мешки";
  if (p === "Выдувная плёнка") return "Выдувная плёнка";
  return p;
};

export const ShipmentDaily: React.FC<{ date?: string }> = ({ date = "20260724" }) => {
  const { data: pr010Response, isLoading, error } = usePr010(date);

  const formattedTitleDate = React.useMemo(() => {
    if (date.length === 8) {
      const y = date.substring(0, 4);
      const m = date.substring(4, 6);
      const d = date.substring(6, 8);
      return `${d}.${m}.${y}`;
    }
    return date;
  }, [date]);

  const apiData = React.useMemo(() => {
    if (!pr010Response?.data?.A6) {
      return [];
    }
    return pr010Response.data.A6.map((item) => {
      const name = mapShipmentProduct(item.producttype);
      const val = item.remains;
      return {
        name,
        value: val,
        valueStr: val.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      };
    }).sort((a, b) => b.value - a.value);
  }, [pr010Response]);

  const totalShipment = React.useMemo(() => {
    if (pr010Response?.data) {
      if (pr010Response.data.shipment_PER_DAY !== undefined) {
        return pr010Response.data.shipment_PER_DAY;
      }
      if (pr010Response.data.A6) {
        return pr010Response.data.A6.reduce((sum, item) => sum + item.remains, 0);
      }
    }
    return 0; // fallback
  }, [pr010Response]);

  const totalShipmentStr = totalShipment.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const displayData = apiData.length > 0 ? apiData : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full justify-between">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <h3 className="text-[#002f6c] text-sm font-extrabold uppercase tracking-wide text-center w-full">
          6. ОТГРУЗКА ЗА ДЕНЬ ({formattedTitleDate}), т
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between relative min-h-75">
        {error && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10 p-4 text-center">
            <span className="text-xs text-red-500 font-bold">Ошибка загрузки</span>
            <span className="text-[10px] text-slate-400 mt-1">{error.message}</span>
          </div>
        )}
        <div className={`transition-all duration-300 flex-1 flex flex-col justify-between h-full ${isLoading ? 'opacity-60 animate-pulse' : ''}`}>
          {/* Chart Container */}
          <div className="w-full h-64 pr-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, (dataMax: number) => Math.ceil((dataMax || 120) * 1.2 / 20) * 20]}
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
              {totalShipmentStr} <span className="text-sm font-bold ml-0.5">т</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
