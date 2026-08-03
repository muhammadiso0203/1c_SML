import React from 'react';
import { Calendar, FileText } from 'lucide-react';

interface DashboardHeaderProps {
  reportCode?: string;
  title?: string;
  subtitle?: string;
  generationDate?: string;
  version?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = "PR-010. ДАШБОРД ДЛЯ РУКОВОДСТВА СМЛ",
  subtitle = "к утру 31.07.2026 г.",
  generationDate = "31.07.2026 08:00",
  version = "1.0"
}) => {
  return (
    <header className="relative w-full overflow-hidden bg-blue-950 text-white py-2 px-6 border-b border-blue-500/20 backdrop-blur-md">
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
          {subtitle && (
            <p className="text-xs md:text-sm mt-1 font-medium tracking-wide">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Side: Metadata (Date and Version) */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-end gap-3 text-xs md:text-sm text-blue-100/90 w-full md:w-1/4 font-sans border-t border-blue-800/40 pt-3 sm:pt-0 sm:border-t-0">
          
          {/* Generation Date */}
          <div className="flex items-center gap-2 hover:text-white transition-colors duration-200 px-3 py-1">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:gap-1.5 md:flex-col md:gap-0 leading-tight">
              <span className="text-[10px] md:text-[11px] text-blue-300/70 font-semibold tracking-wider uppercase">Дата формирования</span>
              <span className="font-mono font-medium">{generationDate}</span>
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
