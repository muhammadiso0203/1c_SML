import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

export interface StatCardData {
  id: string;
  title: string;
  value: string;
  trendText: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'warning';
  accentColor: string; // Border accent color e.g. '#008080'
  badgeBgColor: string; // Soft corner circle background
  dotColor: string; // Corner dot color
  iconType?: 'up' | 'down' | 'clock';
}

interface StatsCardsProps {
  cards?: StatCardData[];
}

const DEFAULT_CARDS: StatCardData[] = [
  {
    id: 'debit',
    title: 'Дебиторская задолженность',
    value: '22,0 млрд сум',
    trendText: '+8,4% за выбранный период',
    trendType: 'positive',
    accentColor: '#008080',
    badgeBgColor: 'rgba(0, 128, 128, 0.2)',
    dotColor: '#00d2d2',
    iconType: 'up',
  },
  {
    id: 'credit',
    title: 'Кредиторская задолженность',
    value: '13,2 млрд сум',
    trendText: '-2,1% за выбранный период',
    trendType: 'negative',
    accentColor: '#e0634c',
    badgeBgColor: 'rgba(224, 99, 76, 0.2)',
    dotColor: '#ff7a63',
    iconType: 'down',
  },
  {
    id: 'net_position',
    title: 'Чистая позиция',
    value: '+8,9 млрд сум',
    trendText: '+7,1% к началу периода',
    trendType: 'positive',
    accentColor: '#38bdf8',
    badgeBgColor: 'rgba(56, 189, 248, 0.2)',
    dotColor: '#38bdf8',
    iconType: 'up',
  },
  {
    id: 'overdue',
    title: 'Просроченная дебиторка',
    value: '3,6 млрд сум',
    trendText: '17,0% от всей дебиторки',
    trendType: 'warning',
    accentColor: '#fbbf24',
    badgeBgColor: 'rgba(251, 191, 36, 0.2)',
    dotColor: '#fbbf24',
    iconType: 'clock',
  },
];

export const StatsCards: React.FC<StatsCardsProps> = ({
  cards = DEFAULT_CARDS,
}) => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        return (
          <div
            key={card.id}
            className="relative bg-[#131d36] rounded-[5px] border border-slate-800/90 p-4 sm:p-5 flex flex-col justify-between overflow-hidden hover:border-slate-700 hover:shadow-lg transition-all"
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: card.accentColor,
            }}
          >
            {/* Top-Right Decorative Quarter Circle with Dot */}
            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
              <div
                className="absolute -top-7 -right-7 w-16 h-16 rounded-full flex items-center justify-center transition-transform"
                style={{ backgroundColor: card.badgeBgColor }}
              >
                <span
                  className="w-2 h-2 rounded-full -translate-x-1.5 translate-y-1.5"
                  style={{ backgroundColor: card.dotColor }}
                />
              </div>
            </div>

            {/* Card Content */}
            <div className="pr-6">
              {/* Title */}
              <span className="text-[12px] font-medium text-slate-400 block leading-tight">
                {card.title}
              </span>

              {/* Main Value */}
              <div className="text-2xl sm:text-[26px] font-bold text-white tracking-tight mt-3 mb-3">
                {card.value}
              </div>
            </div>

            {/* Bottom Trend / Subtext */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              {card.iconType === 'up' && (
                <ArrowUpRight
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: card.accentColor }}
                />
              )}
              {card.iconType === 'down' && (
                <ArrowDownRight
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: card.accentColor }}
                />
              )}
              {card.iconType === 'clock' && (
                <Clock
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: card.accentColor }}
                />
              )}
              <span className="truncate">{card.trendText}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
