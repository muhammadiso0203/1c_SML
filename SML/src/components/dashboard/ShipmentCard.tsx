import React from 'react';
import { Truck } from 'lucide-react';
import { usePr010 } from '../../pages/dashboard/service/usePr010';

const getRussianMonthName = (monthIndex: number) => {
  const months = [
    "январь", "февраль", "март", "апрель", "май", "июнь",
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
  ];
  return months[monthIndex] || "июль";
};

export const ShipmentCard: React.FC<{ date?: string }> = ({ date = "20260724" }) => {
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

  const dailyShipment = React.useMemo(() => {
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

  const monthlyShipment = React.useMemo(() => {
    if (pr010Response?.data && pr010Response.data.shipment_PER_month !== undefined) {
      return pr010Response.data.shipment_PER_month;
    }
    return 0; // fallback
  }, [pr010Response]);

  const avgShipment = React.useMemo(() => {
    if (pr010Response?.data) {
      const monthTotal = pr010Response.data.shipment_PER_month || 0;
      if (date.length === 8) {
        const day = parseInt(date.substring(6, 8), 10);
        if (day > 0) {
          return monthTotal / day;
        }
      }
      return monthTotal / 30;
    }
    return 0; // fallback
  }, [pr010Response, date]);

  const formatVal = (val: number) => {
    return val.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full justify-between shadow-xl">
      {/* Header */}
      <div className="bg-[#1e293b] border-b border-slate-800 px-4 py-2.5 flex items-center gap-2">
        <Truck className="w-[clamp(0.9rem,1.2vw,1.25rem)] h-[clamp(0.9rem,1.2vw,1.25rem)] text-blue-400" />
        <h3 className="text-white text-[clamp(0.65rem,0.85vw,0.85rem)] font-extrabold uppercase tracking-wider text-center flex-1 pr-5">
          4. ОТГРУЗКА
        </h3>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div className={`flex flex-col gap-3 py-2 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between ${isLoading ? 'opacity-60 animate-pulse' : ''}`}>
          {/* Day Metric */}
          <div className="flex-1 text-center">
            <span className="text-[clamp(0.55rem,0.8vw,0.7rem)] font-bold text-slate-300 block mb-1">
              За день ({formattedDate})
            </span>
            <span className="text-[clamp(1rem,1.8vw,2.2rem)] font-black text-blue-400 tracking-tight">
              {isLoading ? '...' : formatVal(dailyShipment)} <span className="text-[clamp(0.7rem,0.9vw,0.9rem)] font-bold ml-0.5">т</span>
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-px h-12 bg-slate-800 shrink-0" />

          {/* Month Metric */}
          <div className="flex-1 text-center">
            <span className="text-[clamp(0.55rem,0.8vw,0.7rem)] font-bold text-slate-300 block mb-1">
              За {monthName}
            </span>
            <span className="text-[clamp(1rem,1.8vw,2.2rem)] font-black text-blue-400 tracking-tight">
              {isLoading ? '...' : formatVal(monthlyShipment)} <span className="text-[clamp(0.7rem,0.9vw,0.9rem)] font-bold ml-0.5">т</span>
            </span>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-800 my-2" />

        {/* Bottom text */}
        <div className={`text-center py-1 transition-all duration-300 ${isLoading ? 'opacity-60 animate-pulse' : ''}`}>
          <span className="text-[clamp(0.6rem,0.8vw,0.75rem)] font-bold text-slate-400">
            Среднесуточная отгрузка за {monthName}:{' '}
            <span className="text-blue-400 font-extrabold">{isLoading ? '...' : `${formatVal(avgShipment)} т`}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
