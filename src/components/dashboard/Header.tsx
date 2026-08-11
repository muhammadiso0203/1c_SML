import React from 'react';
import { CalendarPicker } from './CalendarPicker';
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Truck,
  UserCircle2,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  title = "МОНИТОР РУКОВОДИТЕЛЯ",
  subtitle,
  selectedDate: propSelectedDate,
  onChangeDate: propOnChangeDate
}) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { label: 'Главная', icon: LayoutDashboard },
    { label: 'Показатели', icon: BarChart3 },
    { label: 'Отгрузки', icon: Truck },
    { label: 'Запасы', icon: Boxes },
    { label: 'Настройки', icon: Settings }
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const username = localStorage.getItem("user") || "Admin";

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
    <>
      <header className="sticky top-0 z-50 w-full bg-[#0d1527]/95 text-white py-2 px-6 border-b border-slate-800/80 backdrop-blur-md shadow-md">
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-3 z-10 min-w-0 w-full">
          {/* Left Side: Menu */}
          <div className="flex items-center gap-2 w-full md:w-[22%] min-w-0 shrink-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="flex h-[clamp(2rem,2vw,2.25rem)] w-[clamp(2rem,2vw,2.25rem)] items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200 shadow-md transition-all hover:bg-slate-800/90 cursor-pointer shrink-0"
              aria-label="Open left panel"
            >
              <Menu className="h-[clamp(0.85rem,1vw,1rem)] w-[clamp(0.85rem,1vw,1rem)]" />
            </button>
          </div>

          {/* Center: Main Title & Subtitle */}
          <div className="flex-1 min-w-0 text-center flex flex-col items-center justify-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 min-w-0">
              <h1 className="text-[clamp(1.5rem,2vw,3rem)] font-bold tracking-[0.08em] uppercase text-white whitespace-nowrap leading-none">
                {title}
              </h1>
              {displaySubtitle && (
                <p className="text-[clamp(0.6rem,0.9vw,0.9rem)] font-medium tracking-[0.08em] text-blue-300 whitespace-nowrap leading-none">
                  {displaySubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Side: User and Metadata */}
          <div className="flex items-center justify-end gap-3 text-xs md:text-sm text-blue-100/90 w-full md:w-[22%] min-w-0 shrink-0 font-sans border-t border-slate-800 pt-3 sm:pt-0 sm:border-t-0 md:border-t-0">
            <div className="flex items-center gap-2 hover:text-white transition-colors duration-200 px-3 py-1">
              <CalendarPicker selectedDate={activeDate} onChange={handleDateChange} />
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-100 shadow-sm whitespace-nowrap">
              <UserCircle2 className="h-[clamp(0.85rem,1vw,1rem)] w-[clamp(0.85rem,1vw,1rem)] text-blue-300" />
              <span className="text-[clamp(0.6rem,0.8vw,0.72rem)] font-semibold tracking-wide uppercase">{username}</span>
            </div>
          </div>
        </div>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close left panel"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          />

          <aside className="absolute left-0 top-0 h-full w-[280px] transform transition-transform duration-300 ease-out bg-[#0f172a] border-r border-slate-700 shadow-2xl z-10">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-blue-300">Навигация</p>
                <h2 className="text-base font-semibold text-white">Меню</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900/80 p-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-600/20 px-3 py-2.5 text-sm font-semibold text-red-300 transition-all hover:bg-red-600/30 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Выход
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
