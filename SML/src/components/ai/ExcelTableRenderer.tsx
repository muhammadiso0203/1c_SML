import React, { useRef, useState } from 'react';
import { Download, Copy, Check, FileSpreadsheet } from 'lucide-react';
import { exportHtmlTableToExcel } from '@/lib/excelHelper';

interface ExcelTableRendererProps {
  children?: React.ReactNode;
}

export const ExcelTableRenderer: React.FC<ExcelTableRendererProps> = ({ children }) => {
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleDownloadExcel = () => {
    if (tableRef.current) {
      exportHtmlTableToExcel(tableRef.current, `SML_1C_Report_${Date.now()}.xlsx`);
    }
  };

  const handleCopyCsv = () => {
    if (!tableRef.current) return;
    const rows = Array.from(tableRef.current.querySelectorAll('tr'));
    const csvContent = rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map((cell) => `"${(cell.textContent || '').trim().replace(/"/g, '""')}"`).join(',');
      })
      .join('\n');

    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-slate-700/80 bg-[#0c1220] overflow-hidden shadow-lg">
      {/* Excel Table Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e293b] border-b border-slate-700/80 text-xs">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wide text-[11px]">
            Таблица данных 1С / Excel
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyCsv}
            title="Скопировать как CSV"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] font-medium"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            title="Скачать таблицу в формате Excel (.xlsx)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/30 transition-colors cursor-pointer text-[11px] font-semibold"
          >
            <Download className="h-3 w-3 text-emerald-400" />
            <span>Скачать .xlsx</span>
          </button>
        </div>
      </div>

      {/* Overflow Table Container */}
      <div className="overflow-x-auto custom-scrollbar max-h-[460px]">
        <table
          ref={tableRef}
          className="w-full text-left text-xs border-collapse table-auto"
        >
          {children}
        </table>
      </div>
    </div>
  );
};

export default ExcelTableRenderer;

