import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const containerRef = useRef<HTMLDivElement>(null);



  // Sync currentMonth when selectedDate changes from outside
  useEffect(() => {
    setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  // Convert Sunday index from 0 to 6 (so Monday is 0, Sunday is 6)
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = [];
  // Fill empty spaces for previous month's trailing days
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  // Fill current month's days
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Shadcn-like Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg text-white text-xs md:text-sm font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 select-none cursor-pointer"
      >
        <CalendarIcon className="w-4 h-4 text-blue-300 shrink-0" />
        <span className="font-mono font-medium">{formatDateLabel(selectedDate)}</span>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute right-0 mt-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 text-slate-800 w-70">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map((d) => (
              <span key={d} className="text-[10px] font-semibold text-slate-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} />;
              }

              const selected = isSelected(date);
              const today = isToday(date);

              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  onClick={() => {
                    onChange(date);
                    setIsOpen(false);
                  }}
                  className={`
                    w-8 h-8 text-[11px] font-semibold rounded-md transition-all duration-150 flex items-center justify-center cursor-pointer
                    ${selected 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : today
                        ? 'bg-slate-100 text-blue-600 border border-blue-200' 
                        : 'hover:bg-slate-100 text-slate-700'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
