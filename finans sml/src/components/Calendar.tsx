import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface CalendarProps {
  selectedDate?: string; // YYYY-MM-DD
  onSelect?: (date: string) => void;
  className?: string;
}

const MONTH_NAMES_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const YEARS = Array.from({ length: 15 }, (_, i) => 2020 + i);

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onSelect,
  className = '',
}) => {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date(2026, 7, 1);
  const isValidDate = !isNaN(initialDate.getTime());

  const [currentMonth, setCurrentMonth] = useState(
    isValidDate ? initialDate.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    isValidDate ? initialDate.getFullYear() : new Date().getFullYear()
  );

  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [selectedDate]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const handleDateClick = (day: number, monthOffset: number = 0) => {
    let targetYear = currentYear;
    let targetMonth = currentMonth + monthOffset;

    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted = `${targetYear}-${pad(targetMonth + 1)}-${pad(day)}`;

    if (onSelect) {
      onSelect(formatted);
    }
  };

  const isDateSelected = (day: number, month: number, year: number) => {
    if (!selectedDate) return false;
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return false;
    return (
      parseInt(parts[0], 10) === year &&
      parseInt(parts[1], 10) === month + 1 &&
      parseInt(parts[2], 10) === day
    );
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const calendarCells = [];

  // Previous month days
  for (let i = startingDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarCells.push(
      <button
        key={`prev-${day}`}
        type="button"
        onClick={() => handleDateClick(day, -1)}
        className="h-10 w-10 text-center text-xs font-normal text-slate-600 hover:bg-slate-800 hover:text-slate-400 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
      >
        {day}
      </button>
    );
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const selected = isDateSelected(day, currentMonth, currentYear);
    const today = isToday(day, currentMonth, currentYear);

    calendarCells.push(
      <button
        key={`curr-${day}`}
        type="button"
        onClick={() => handleDateClick(day, 0)}
        className={`h-10 w-10 text-center text-sm font-medium rounded-lg transition-all flex flex-col items-center justify-center relative cursor-pointer ${
          selected
            ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-950/50 hover:bg-teal-500 scale-105'
            : today
            ? 'bg-slate-800 text-teal-400 border border-teal-500/50 font-semibold hover:bg-slate-700'
            : 'text-slate-200 hover:bg-slate-800 hover:text-white active:scale-95'
        }`}
      >
        <span>{day}</span>
        {today && !selected && (
          <span className="w-1 h-1 bg-teal-400 rounded-full mt-0.5" />
        )}
      </button>
    );
  }

  // Next month days
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    calendarCells.push(
      <button
        key={`next-${day}`}
        type="button"
        onClick={() => handleDateClick(day, 1)}
        className="h-10 w-10 text-center text-xs font-normal text-slate-600 hover:bg-slate-800 hover:text-slate-400 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
      >
        {day}
      </button>
    );
  }

  const setPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (onSelect) onSelect(formatted);
  };

  return (
    <div className={`w-85 p-4 bg-[#131d36] text-slate-100 select-none ${className}`}>
      {/* Month & Year Navigation / Fast Jump Selectors */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5 relative">
          {/* Month Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMonthSelectOpen(!isMonthSelectOpen);
                setIsYearSelectOpen(false);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <span>{MONTH_NAMES_RU[currentMonth]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isMonthSelectOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMonthSelectOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1 w-44 bg-[#131d36] border border-slate-700 rounded-lg shadow-2xl p-1.5 grid grid-cols-2 gap-1 z-50 max-h-56 overflow-y-auto">
                  {MONTH_NAMES_RU.map((name, index) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setCurrentMonth(index);
                        setIsMonthSelectOpen(false);
                      }}
                      className={`px-2 py-1.5 text-xs text-left rounded font-medium transition-colors cursor-pointer ${
                        currentMonth === index
                          ? 'bg-teal-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Year Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsYearSelectOpen(!isYearSelectOpen);
                setIsMonthSelectOpen(false);
              }}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <span>{currentYear}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isYearSelectOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsYearSelectOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1 w-32 bg-[#131d36] border border-slate-700 rounded-lg shadow-2xl p-1.5 grid grid-cols-2 gap-1 z-50 max-h-56 overflow-y-auto">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setCurrentYear(y);
                        setIsYearSelectOpen(false);
                      }}
                      className={`px-2 py-1.5 text-xs text-center rounded font-medium transition-colors cursor-pointer ${
                        currentYear === y
                          ? 'bg-teal-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Prev / Next Month Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            title="Предыдущий месяц"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            title="Следующий месяц"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS_RU.map((day) => (
          <div
            key={day}
            className="h-8 w-10 text-center text-xs font-semibold text-slate-500 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells}
      </div>

      {/* Quick Action Presets Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPresetDate(0)}
            className="px-2.5 py-1 text-xs font-medium text-teal-400 bg-teal-950/60 hover:bg-teal-900/80 border border-teal-800/50 rounded-md transition-colors cursor-pointer"
          >
            Сегодня
          </button>
        </div>

        {selectedDate && (
          <span className="text-xs font-semibold text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
            {selectedDate}
          </span>
        )}
      </div>
    </div>
  );
};

export default Calendar;
