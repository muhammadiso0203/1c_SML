import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  statusText?: string;
  lastUpdated?: string;
  adminName?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title = 'Финансовое состояние',
  subtitle = 'Дебиторская и кредиторская задолженность в динамике',
  statusText = 'Данные актуальны',
  adminName = 'Алишер Рахимов',
  lastUpdated = `на ${new Date().toLocaleDateString('ru-RU')} · ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
  onLogout,
}) => {
  return (
    <header className="w-full">
      {/* Main Title & Status Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Right Status Badge & Timestamp */}
        <div className="flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-2">
            {/* Admin Badge with Name */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#131d36] border border-slate-700/80 text-slate-200 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>{adminName}</span>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{statusText}</span>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Выйти из системы"
                className="h-7 px-2.5 inline-flex items-center gap-1 rounded-[5px] border border-slate-700 bg-[#131d36] hover:bg-red-950/60 hover:border-red-700 text-slate-300 hover:text-red-400 text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Выход</span>
              </button>
            )}
          </div>

          <span className="text-[11px] text-slate-400 mt-1">
            {lastUpdated}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
