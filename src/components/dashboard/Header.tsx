import React from 'react';
import { FileText } from 'lucide-react';
import { CalendarPicker } from './CalendarPicker';

interface DashboardHeaderProps {
  reportCode?: string;
  title?: string;
  subtitle?: string;
  generationDate?: string;
  version?: string;
  selectedDate?: Date;
  onChangeDate?: (date: Date) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = "PR-010. ДАШБОРД ДЛЯ РУКОВОДСТВА СМЛ",
  subtitle,
  version = "1.0",
  selectedDate: propSelectedDate,
  onChangeDate: propOnChangeDate
}) => {
  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = urlParams.get('date') || '20260724';

  const [localDate, setLocalDate] = React.useState<Date>(() => {
    if (dateParam.length === 8) {
      const y = parseInt(dateParam.substring(0, 4), 10);
      const m = parseInt(dateParam.substring(4, 6), 10) - 1;
      const d = parseInt(dateParam.substring(6, 8), 10);
      const parsed = new Date(y, m, d);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date(2026, 6, 24);
  });

  const activeDate = propSelectedDate || localDate;

  const handleDateChange = (newDate: Date) => {
    if (propOnChangeDate) {
      propOnChangeDate(newDate);
    } else {
      setLocalDate(newDate);
      const y = newDate.getFullYear();
      const m = String(newDate.getMonth() + 1).padStart(2, '0');
      const d = String(newDate.getDate()).padStart(2, '0');
      const formatted = `${y}${m}${d}`;
      const url = new URL(window.location.href);
      url.searchParams.set('date', formatted);
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const formattedDateStr = React.useMemo(() => {
    const y = activeDate.getFullYear();
    const m = String(activeDate.getMonth() + 1).padStart(2, '0');
    const d = String(activeDate.getDate()).padStart(2, '0');
    return `${d}.${m}.${y}`;
  }, [activeDate]);

  const displaySubtitle = subtitle || `к утру ${formattedDateStr} г.`;

  return (
    <header className="relative w-full bg-blue-950 text-white py-2 px-6 border-b border-blue-500/20 backdrop-blur-md">
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        
        {/* Left Side spacer to center the title */}
        <div className="hidden md:block w-1/4" />
        
        {/* Center: Main Title & Subtitle */}
        <div className="flex-1 text-center flex flex-col items-center justify-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <h1 className="text-[30px] font-bold tracking-wide uppercase">
              {title}
            </h1>
          </div>
          {displaySubtitle && (
            <p className="text-xs md:text-sm mt-1 font-medium tracking-wide">
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* Right Side: Metadata (Date and Version) */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-end gap-3 text-xs md:text-sm text-blue-100/90 w-full md:w-1/4 font-sans border-t border-blue-800/40 pt-3 sm:pt-0 sm:border-t-0">
          
          {/* Generation Date */}
          <div className="flex items-center gap-2 hover:text-white transition-colors duration-200 px-3 py-1">
            <div className="flex flex-col sm:flex-row sm:gap-1.5 md:flex-col md:gap-0 leading-tight items-start md:items-end">
              <span className="text-[10px] md:text-[11px] text-blue-300/70 font-semibold tracking-wider uppercase mb-1">Дата формирования</span>
              <CalendarPicker selectedDate={activeDate} onChange={handleDateChange} />
            </div>
          </div>

          {/* Version */}
          <div className="flex items-center gap-2 hover:text-white transition-colors duration-200 px-3 py-1">
            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:gap-1.5 md:flex-col md:gap-0 leading-tight">
              <span className="text-[10px] md:text-[11px] text-blue-300/70 font-semibold tracking-wider uppercase">Версия</span>
              <span className="font-mono font-medium">{version}</span>
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
};
