import React from 'react';
import { Calendar, TrendingUp, Hourglass, CheckCircle2, AlertCircle, Globe, Factory } from 'lucide-react';

import { usePr010 } from '../../pages/dashboard/service/usePr010';

const getRussianMonthNameUpper = (monthIndex: number) => {
  const months = [
    "ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ", "МАЙ", "ИЮНЬ",
    "ИЮЛЬ", "АВГУСТ", "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"
  ];
  return months[monthIndex] || "ИЮЛЬ";
};

export const ProductionProgram: React.FC<{ date?: string }> = ({ date = "20260724" }) => {
  const { data, isLoading } = usePr010(date);

  const monthNameUpper = React.useMemo(() => {
    if (date.length === 8) {
      const m = parseInt(date.substring(4, 6), 10) - 1;
      return getRussianMonthNameUpper(m);
    }
    return "ИЮЛЬ";
  }, [date]);

  const formattedDate = React.useMemo(() => {
    if (date.length === 8) {
      const y = date.substring(0, 4);
      const m = date.substring(4, 6);
      const d = date.substring(6, 8);
      return `${d}.${m}.${y}`;
    }
    return date;
  }, [date]);

  // Extract A1 & A3 API data
  const percentage = data?.data?.A1?.Implementation_of_the_Plan ?? 0;
  const generalPlan = data?.data?.A1?.General_Plan ?? 0;
  const factOutput = data?.data?.A3?.Monthly_issue ?? 0;
  const itRemainsToBeDone = data?.data?.A1?.It_remains_to_be_done ?? 0;
  const forecastEndMonth = data?.data?.A1?.Forecast_for_the_End_of_the_Month ?? 0;

  const forecastPercentage = React.useMemo(() => {
    if (generalPlan > 0) {
      return (forecastEndMonth / generalPlan) * 100;
    }
    return 0;
  }, [forecastEndMonth, generalPlan]);

  const requiredReleaseOnDay = data?.data?.A1?.Required_Release_On_The_Day ?? 0;
  const averageDailyOutput = data?.data?.A1?.Average_Daily_Output ?? 0;
  const daysLeftInMonth = data?.data?.A1?.Days_left_in_the_month ?? 0;

  // Circular progress math
  const radius = 70;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const visualPercentage = Math.min(percentage, 100);
  const strokeDashoffset = circumference - (visualPercentage / 100) * circumference;

  const formatVal = (val: number, fractionDigits = 1) => {
    return val.toLocaleString('ru-RU', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    });
  };

  const formatInt = (val: number) => {
    return val.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
  };

  return (
    <div className="w-full bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full justify-between shadow-xl">

      {/* Title Header */}
      <div className="bg-[#1e293b] px-6 py-3 flex items-center justify-between border-b border-slate-800">
        <h2 className="text-white text-sm font-extrabold uppercase tracking-wide">
          1. ВЫПОЛНЕНИЕ ПРОИЗВОДСТВЕННОЙ ПРОГРАММЫ ({monthNameUpper})
        </h2>
      </div>

      {/* Main Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">

        {/* Upper Grid: Chart & Main Metrics */}
        <div className={`grid grid-cols-12 gap-6 items-center transition-all duration-300 ${isLoading ? 'opacity-60 animate-pulse' : ''}`}>

          {/* Left Column: Gauge Chart (5 cols) */}
          <div className="col-span-5 flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-44 h-44 transform -rotate-90">
                {/* Track Circle */}
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="stroke-emerald-500 transition-all duration-500 ease-out"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Inner Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-emerald-400 tracking-tight flex items-baseline">
                  {isLoading ? '...' : formatVal(percentage, 1)}
                  <span className="text-lg font-bold ml-1">%</span>
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight mt-1">
                  выполнение<br />плана
                </span>
              </div>
            </div>
          </div>

          {/* Vertical Divider (Hidden on small screens) */}
          <div className="block w-px h-40 bg-slate-800 self-center" />

          {/* Right Column: Key Metric Rows (6 cols) */}
          <div className="col-span-6 flex flex-col justify-between h-full gap-3">

            {/* Row 1: Plan */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Factory className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold text-slate-300">План на месяц</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-blue-400">{isLoading ? '...' : formatInt(generalPlan)}</span>
                <span className="text-xs font-bold text-blue-400 ml-1">т</span>
              </div>
            </div>

            {/* Row 2: Fact */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">Факт на {formattedDate}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-400">{isLoading ? '...' : formatVal(factOutput)}</span>
                <span className="text-xs font-bold text-emerald-400 ml-1">т</span>
              </div>
            </div>

            {/* Row 3: Remaining */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 " />
                <span className="text-xs font-bold text-slate-300">Осталось выполнить</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-orange-400">{isLoading ? '...' : formatVal(itRemainsToBeDone)}</span>
                <span className="text-xs font-bold text-orange-400 ml-1">т</span>
              </div>
            </div>

            {/* Row 4: Forecast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-sky-400" />
                <span className="text-xs font-bold text-slate-300">Прогноз на конец месяца</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <div>
                  <span className="text-sm font-extrabold text-sky-400">{isLoading ? '...' : formatVal(forecastEndMonth)}</span>
                  <span className="text-xs font-bold text-sky-400 ml-1">т</span>
                </div>
                <span className="text-[10px] font-bold text-sky-400 mt-0.5">
                  ({isLoading ? '...' : `${formatVal(forecastPercentage, 1)} %`})
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Lower Grid: Detailed Sub-Metrics (Bordered Box) */}
        <div className={`mt-6 border border-slate-800 rounded-xl bg-[#172033] p-4 transition-all duration-300 ${isLoading ? 'opacity-60 animate-pulse' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">

            {/* Box 1: Required output */}
            <div className="flex items-center gap-3 pb-3 md:pb-0 md:pr-4">
              <Calendar className="w-6 h-6 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[10px] leading-tight font-extrabold text-slate-400 uppercase tracking-wider block">
                  Требуемый выпуск в день
                </span>
                <span className="text-[9px] lowercase font-normal text-slate-400 block mt-0.5">
                  (для выполнения плана)
                </span>
                <span className="text-base font-extrabold text-blue-400 mt-1">
                  {isLoading ? '...' : formatVal(requiredReleaseOnDay)} <span className="text-xs font-bold text-blue-300 ml-0.5">т/день</span>
                </span>
              </div>
            </div>

            {/* Box 2: Average output */}
            <div className="flex items-center gap-3 py-3 md:py-0 md:px-4">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] leading-tight font-extrabold text-slate-400 uppercase tracking-wider block">
                  Среднесуточный выпуск
                </span>
                <span className="text-[9px] lowercase font-normal text-slate-400 block mt-0.5">
                  (факт)
                </span>
                <span className="text-base font-extrabold text-emerald-400 mt-1">
                  {isLoading ? '...' : formatVal(averageDailyOutput)} <span className="text-xs font-bold text-emerald-300 ml-0.5">т/день</span>
                </span>
              </div>
            </div>

            {/* Box 3: Remaining days */}
            <div className="flex items-center gap-3 pt-3 md:pt-0 md:pl-4">
              <Hourglass className="w-6 h-6 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[10px] leading-tight font-extrabold text-slate-400 uppercase tracking-wider block">
                  Осталось дней в месяце
                </span>
                <span className="text-base font-extrabold text-amber-400 mt-1">
                  {isLoading ? '...' : daysLeftInMonth} <span className="text-xs font-bold text-amber-300 ml-0.5">дней</span>
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
