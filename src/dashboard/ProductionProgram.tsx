import React from 'react';
import { Calendar, TrendingUp, Hourglass, CheckCircle2, AlertCircle, Globe, Factory } from 'lucide-react';

export const ProductionProgram: React.FC = () => {
  // Circular progress math
  const percentage = 94.4;
  const radius = 70;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full justify-between">
      
      {/* Title Header */}
      <div className="bg-[#002f6c] px-6 py-3 flex items-center justify-between">
        <h2 className="text-white text-sm font-extrabold uppercase tracking-wide">
          1. ВЫПОЛНЕНИЕ ПРОИЗВОДСТВЕННОЙ ПРОГРАММЫ (ИЮЛЬ)
        </h2>
      </div>

      {/* Main Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        
        {/* Upper Grid: Chart & Main Metrics */}
        <div className="grid grid-cols-12  gap-6 items-center">
          
          {/* Left Column: Gauge Chart (5 cols) */}
          <div className="col-span-5 flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-44 h-44 transform -rotate-90">
                {/* Track Circle */}
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="stroke-emerald-600 transition-all duration-500 ease-out"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Inner Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-emerald-600 tracking-tight flex items-baseline">
                  {percentage}
                  <span className="text-lg font-bold ml-1">%</span>
                </span>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider leading-tight mt-1">
                  выполнение<br />плана
                </span>
              </div>
            </div>
          </div>

          {/* Vertical Divider (Hidden on small screens) */}
          <div className="block w-px h-40 bg-slate-200 self-center" />

          {/* Right Column: Key Metric Rows (6 cols) */}
          <div className="col-span-6  flex flex-col justify-between h-full gap-3">
            
            {/* Row 1: Plan */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Factory className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold text-slate-600">План на месяц</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-blue-900">5 200</span>
                <span className="text-xs font-bold text-blue-900 ml-1">т</span>
              </div>
            </div>

            {/* Row 2: Fact */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-600">Факт на 31.07.2026</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-600">4 910,9</span>
                <span className="text-xs font-bold text-emerald-600 ml-1">т</span>
              </div>
            </div>

            {/* Row 3: Remaining */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 " />
                <span className="text-xs font-bold text-slate-600">Осталось выполнить</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-orange-500">289,1</span>
                <span className="text-xs font-bold text-orange-500 ml-1">т</span>
              </div>
            </div>

            {/* Row 4: Forecast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-sky-600" />
                <span className="text-xs font-bold text-slate-600">Прогноз на конец месяца</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <div>
                  <span className="text-sm font-extrabold text-sky-700">5 074,6</span>
                  <span className="text-xs font-bold text-sky-700 ml-1">т</span>
                </div>
                <span className="text-[10px] font-bold text-sky-600 mt-0.5">(97,6 %)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Lower Grid: Detailed Sub-Metrics (Bordered Box) */}
        <div className="mt-6 border border-slate-200 rounded-xl bg-slate-50/50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* Box 1: Required output */}
            <div className="flex items-center gap-3 pb-3 md:pb-0 md:pr-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-[10px] leading-tight font-extrabold text-slate-500 uppercase tracking-wider block">
                  Требуемый выпуск в день
                </span>
                <span className="text-[9px] lowercase font-normal text-slate-400 block mt-0.5">
                  (для выполнения плана)
                </span>
                <span className="text-base font-extrabold text-blue-900 mt-1">
                  9,6 <span className="text-xs font-bold text-blue-700 ml-0.5">т/день</span>
                </span>
              </div>
            </div>

            {/* Box 2: Average output */}
            <div className="flex items-center gap-3 py-3 md:py-0 md:px-4">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              <div className="flex flex-col">
                <span className="text-[10px] leading-tight font-extrabold text-slate-500 uppercase tracking-wider block">
                  Среднесуточный выпуск
                </span>
                <span className="text-[9px] lowercase font-normal text-slate-400 block mt-0.5">
                  (факт)
                </span>
                <span className="text-base font-extrabold text-emerald-700 mt-1">
                  158,4 <span className="text-xs font-bold text-emerald-600 ml-0.5">т/день</span>
                </span>
              </div>
            </div>

            {/* Box 3: Remaining days */}
            <div className="flex items-center gap-3 pt-3 md:pt-0 md:pl-4">
                <Hourglass className="w-6 h-6 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-[10px] leading-tight font-extrabold text-slate-500 uppercase tracking-wider block">
                  Осталось дней в месяце
                </span>
                <span className="text-base font-extrabold text-amber-700 mt-1">
                  0 <span className="text-xs font-bold text-amber-600 ml-0.5">дней</span>
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
