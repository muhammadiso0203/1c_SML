import React, { useState } from 'react';
import {
  ChevronDown,
  Calendar as CalendarIcon,
  RotateCw,
  Download,
  Building2,
  Coins,
} from 'lucide-react';
import Calendar from './Calendar';

export interface StatsFilterState {
  organization: string;
  startDate: string;
  endDate: string;
  currency: string;
  periodDays: number;
}

interface StatsProps {
  onFilterChange?: (filters: StatsFilterState) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  organizations?: string[];
  currencies?: string[];
  initialValues?: Partial<StatsFilterState>;
}

const Stats: React.FC<StatsProps> = ({
  onFilterChange,
  onRefresh,
  onExport,
  organizations = [
    'Группа SML + Invest Aziy',
    'ООО "SML Invest"',
    'СП "Invest Aziy"',
    'Все филиалы',
  ],
  currencies = ['UZS', 'USD', 'EUR', 'RUB'],
  initialValues,
}) => {
  const [selectedOrg, setSelectedOrg] = useState(
    initialValues?.organization || organizations[0]
  );
  const [startDate, setStartDate] = useState(
    initialValues?.startDate || '2026-08-01'
  );
  const [endDate, setEndDate] = useState(
    initialValues?.endDate || '2026-08-14'
  );
  const [currency, setCurrency] = useState(
    initialValues?.currency || currencies[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState<number>(
    initialValues?.periodDays || 14
  );

  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePeriodClick = (days: number) => {
    setSelectedPeriod(days);
    const end = new Date('2026-08-14');
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));

    const format = (d: Date) => d.toISOString().split('T')[0];
    const newStart = format(start);
    const newEnd = format(end);

    setStartDate(newStart);
    setEndDate(newEnd);

    if (onFilterChange) {
      onFilterChange({
        organization: selectedOrg,
        startDate: newStart,
        endDate: newEnd,
        currency,
        periodDays: days,
      });
    }
  };

  const handleStartDateSelect = (date: string) => {
    setStartDate(date);
    setIsStartDateOpen(false);
    if (onFilterChange) {
      onFilterChange({
        organization: selectedOrg,
        startDate: date,
        endDate,
        currency,
        periodDays: selectedPeriod,
      });
    }
  };

  const handleEndDateSelect = (date: string) => {
    setEndDate(date);
    setIsEndDateOpen(false);
    if (onFilterChange) {
      onFilterChange({
        organization: selectedOrg,
        startDate,
        endDate: date,
        currency,
        periodDays: selectedPeriod,
      });
    }
  };

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleExportClick = () => {
    if (onExport) {
      onExport();
    } else {
      console.log('Экспорт данных...');
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="w-full bg-[#131d36] rounded-[5px] border border-slate-800/80 p-2 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        {/* Left Section: Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          {/* Organization Select */}
          <div className="relative flex flex-col">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              ОРГАНИЗАЦИЯ
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsOrgOpen(!isOrgOpen);
                  setIsCurrencyOpen(false);
                  setIsStartDateOpen(false);
                  setIsEndDateOpen(false);
                }}
                className="h-10 inline-flex items-center justify-between gap-2.5 px-3.5 py-2 text-xs md:text-sm font-medium text-slate-200 bg-slate-900/70 border border-slate-700/80 rounded-[5px] hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors cursor-pointer min-w-50"
              >
                <span className="truncate">{selectedOrg}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOrgOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOrgOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsOrgOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 w-full min-w-55 bg-[#131d36] border border-slate-700 rounded-[5px] py-1 shadow-2xl z-20">
                    {organizations.map((org) => (
                      <button
                        key={org}
                        type="button"
                        onClick={() => {
                          setSelectedOrg(org);
                          setIsOrgOpen(false);
                          onFilterChange?.({
                            organization: org,
                            startDate,
                            endDate,
                            currency,
                            periodDays: selectedPeriod,
                          });
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs md:text-sm hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer ${
                          selectedOrg === org
                            ? 'text-teal-400 font-semibold bg-slate-800/80'
                            : 'text-slate-300 font-normal'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{org}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Period Date Range Picker with 2 Shadcn Calendars */}
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              ПЕРИОД
            </label>
            <div className="h-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm text-slate-200 bg-slate-900/70 border border-slate-700/80 rounded-[5px] hover:border-slate-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-colors">
              {/* Start Date Button / Calendar Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStartDateOpen(!isStartDateOpen);
                    setIsEndDateOpen(false);
                    setIsOrgOpen(false);
                    setIsCurrencyOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer text-slate-200 hover:text-white"
                  title="Выбрать начальную дату"
                >
                  <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs md:text-sm font-medium tracking-wide">
                    {formatDateDisplay(startDate) || 'MM/DD/YYYY'}
                  </span>
                </button>

                {isStartDateOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsStartDateOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 z-40 bg-[#131d36] border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
                      <div className="px-4 py-2.5 border-b border-slate-800 text-xs font-semibold text-slate-300 bg-slate-900/60 flex items-center justify-between">
                        <span>Начальная дата</span>
                        <span className="text-[11px] font-normal text-slate-400">Выберите дату</span>
                      </div>
                      <Calendar
                        selectedDate={startDate}
                        onSelect={handleStartDateSelect}
                      />
                    </div>
                  </>
                )}
              </div>

              <span className="text-slate-500 font-light px-0.5">—</span>

              {/* End Date Button / Calendar Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsEndDateOpen(!isEndDateOpen);
                    setIsStartDateOpen(false);
                    setIsOrgOpen(false);
                    setIsCurrencyOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer text-slate-200 hover:text-white"
                  title="Выбрать конечную дату"
                >
                  <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs md:text-sm font-medium tracking-wide">
                    {formatDateDisplay(endDate) || 'MM/DD/YYYY'}
                  </span>
                </button>

                {isEndDateOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsEndDateOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-40 bg-[#131d36] border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
                      <div className="px-4 py-2.5 border-b border-slate-800 text-xs font-semibold text-slate-300 bg-slate-900/60 flex items-center justify-between">
                        <span>Конечная дата</span>
                        <span className="text-[11px] font-normal text-slate-400">Выберите дату</span>
                      </div>
                      <Calendar
                        selectedDate={endDate}
                        onSelect={handleEndDateSelect}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Currency Select */}
          <div className="relative flex flex-col">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              ВАЛЮТА
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCurrencyOpen(!isCurrencyOpen);
                  setIsOrgOpen(false);
                }}
                className="h-10 inline-flex items-center justify-between gap-2 px-3.5 py-2 text-xs md:text-sm font-medium text-slate-200 bg-slate-900/70 border border-slate-700/80 rounded-[5px] hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors cursor-pointer min-w-20"
              >
                <span>{currency}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isCurrencyOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isCurrencyOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsCurrencyOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 w-full min-w-27.5 bg-[#131d36] border border-slate-700 rounded-[5px] py-1 shadow-2xl z-20">
                    {currencies.map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => {
                          setCurrency(curr);
                          setIsCurrencyOpen(false);
                          onFilterChange?.({
                            organization: selectedOrg,
                            startDate,
                            endDate,
                            currency: curr,
                            periodDays: selectedPeriod,
                          });
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs md:text-sm hover:bg-slate-800 transition-colors flex items-center justify-between ${
                          currency === curr
                            ? 'text-teal-400 font-semibold bg-slate-800/80'
                            : 'text-slate-300 font-normal'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-slate-400" />
                          {curr}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Period Toggle, Refresh & Export Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 self-start lg:self-end">
          {/* Quick Period Segmented Filter with Smooth Sliding Animation */}
          <div className="relative bg-slate-900/80 p-1 rounded-[6px] flex items-center border border-slate-700/80 shadow-inner select-none">
            {/* Animated Sliding Pill */}
            <div
              className="absolute top-1 bottom-1 rounded-[5px] bg-slate-800 border border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.18)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none"
              style={{
                width: 'calc((100% - 8px) / 3)',
                left: '4px',
                transform: `translateX(calc(${Math.max(0, [7, 14, 30].indexOf(selectedPeriod))} * 100%))`,
              }}
            />

            {[7, 14, 30].map((days) => {
              const isActive = selectedPeriod === days;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => handlePeriodClick(days)}
                  className={`relative z-10 px-3.5 py-1.5 text-xs font-medium rounded-[5px] transition-all duration-200 cursor-pointer active:scale-95 text-center ${
                    isActive
                      ? 'text-teal-400 font-semibold drop-shadow-[0_0_8px_rgba(45,212,191,0.3)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {days} дней
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            title="Обновить данные"
            className="h-10 w-10 flex items-center justify-center rounded-[5px] border border-slate-700/80 bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-500 transition-colors cursor-pointer"
          >
            <RotateCw
              className={`w-4 h-4 transition-transform duration-500 ${
                isRefreshing ? 'rotate-180 text-teal-400 animate-spin' : ''
              }`}
            />
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportClick}
            className="h-10 inline-flex items-center gap-2 px-4 py-2 rounded-[5px] bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white text-xs md:text-sm font-medium shadow-md shadow-teal-950/40 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Экспорт</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stats;
