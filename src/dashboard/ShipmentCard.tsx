import React from 'react';
import { Truck } from 'lucide-react';

export const ShipmentCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full justify-between">
      {/* Header */}
      <div className="bg-blue-200 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
        <Truck className="w-5 h-5 text-blue-900" />
        <h3 className="text-blue-900 text-xs md:text-sm font-extrabold uppercase tracking-wider text-center flex-1 pr-5">
          4. ОТГРУЗКА
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between py-2">
          {/* Day Metric */}
          <div className="flex-1 text-center">
            <span className="text-[10px] md:text-xs font-bold text-blue-900 block mb-1">
              За день (30.07.2026)
            </span>
            <span className="text-2xl md:text-3xl font-black text-blue-900 tracking-tight">
              247,4 <span className="text-sm font-bold ml-0.5">т</span>
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-12 bg-slate-200 shrink-0" />

          {/* Month Metric */}
          <div className="flex-1 text-center">
            <span className="text-[10px] md:text-xs font-bold text-blue-900 block mb-1">
              За июль
            </span>
            <span className="text-2xl md:text-3xl font-black text-blue-900 tracking-tight">
              4 705,4 <span className="text-sm font-bold ml-0.5">т</span>
            </span>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-100 my-2" />

        {/* Bottom text */}
        <div className="text-center py-1">
          <span className="text-xs font-bold text-slate-600">
            Среднесуточная отгрузка за июль:{' '}
            <span className="text-blue-900 font-extrabold">156,8 т</span>
          </span>
        </div>
      </div>
    </div>
  );
};
