import React from 'react';

export interface KpiItem {
  id: string;
  title: string;
  value: string;
  unit?: string;
  isNegative?: boolean;
}

export interface KpiCardsProps {
  items?: KpiItem[];
  className?: string;
}

const DEFAULT_KPIS: KpiItem[] = [
  {
    id: 'month-plan',
    title: 'План месяца',
    value: '5 050 т',
    isNegative: false,
  },
  {
    id: 'date-plan',
    title: 'План на дату',
    value: '3 300 т',
    isNegative: false,
  },
  {
    id: 'date-fact',
    title: 'Факт на дату',
    value: '3 228 т',
    isNegative: false,
  },
  {
    id: 'completion',
    title: 'Выполнение',
    value: '97,8%',
    isNegative: false,
  },
  {
    id: 'deviation',
    title: 'Отклонение',
    value: '−72 т',
    isNegative: true,
  },
];

export const KpiCards: React.FC<KpiCardsProps> = ({
  items = DEFAULT_KPIS,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 ${className}`}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-sm transition-all duration-200"
        >
          <span className="text-xs sm:text-[13px] font-semibold text-gray-800 dark:text-slate-300 mb-1.5 tracking-tight">
            {item.title}
          </span>
          <span
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              item.isNegative
                ? 'text-[#ef4444] dark:text-red-400'
                : 'text-[#0f6cbd] dark:text-blue-400'
            }`}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
