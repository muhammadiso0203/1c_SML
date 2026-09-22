import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  currentPeriod?: string;
  onPeriodChange?: (period: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPeriod = 'Август 2026',
  onPeriodChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const periods = [
    'Июнь 2026',
    'Июль 2026',
    'Август 2026',
    'Сентябрь 2026',
    'Октябрь 2026',
    'Ноябрь 2026',
    'Декабрь 2026',
  ];

  const handleSelect = (period: string) => {
    setSelectedPeriod(period);
    setIsOpen(false);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  return (
    <header className="w-full px-6 py-3.5 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] transition-colors">
      {/* Left side: Logo and Title */}
      <div className="flex items-center gap-6">
        <span className="text-2xl font-bold text-[#0f6cbd] dark:text-blue-400">
          SML
        </span>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-slate-100 tracking-tight">
          Производство — План / Факт
        </h1>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Светлая тема" : "Темная тема"}
          className="flex items-center justify-center w-9 h-9 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-600 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-gray-500 dark:text-slate-400" />
            <span>{selectedPeriod}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-20">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => handleSelect(period)}
                    className={`w-full text-left px-3.5 py-2 text-sm transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 ${
                      selectedPeriod === period
                        ? 'text-[#0f6cbd] dark:text-blue-400 font-semibold bg-blue-50/60 dark:bg-blue-950/40'
                        : 'text-gray-700 dark:text-slate-200'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
