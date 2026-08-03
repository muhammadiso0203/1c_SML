import React from 'react';
import { Factory, Truck, TrendingUp, Target } from 'lucide-react';

interface MetricItem {
  id: string;
  icon: React.ReactNode;
  labelLine1: string;
  labelLine2: string;
  value: string;
  unit: string;
  colorClass: {
    border: string;
    text: string;
    icon: string;
  };
}

export const MetricCards: React.FC = () => {
  const metrics: MetricItem[] = [
    {
      id: 'output-day',
      icon: <Factory className="w-8 h-8" />,
      labelLine1: 'ВЫПУСК',
      labelLine2: 'ЗА ДЕНЬ',
      value: '165,0',
      unit: 'т',
      colorClass: {
        border: 'border-emerald-600',
        text: 'text-emerald-600',
        icon: 'text-emerald-600'
      }
    },
    {
      id: 'shipment-day',
      icon: <Truck className="w-8 h-8" />,
      labelLine1: 'ОТГРУЗКА',
      labelLine2: 'ЗА ДЕНЬ',
      value: '247,4',
      unit: 'т',
      colorClass: {
        border: 'border-blue-600',
        text: 'text-blue-600',
        icon: 'text-blue-600'
      }
    },
    {
      id: 'output-july',
      icon: <TrendingUp className="w-8 h-8" />,
      labelLine1: 'ВЫПУСК',
      labelLine2: 'ЗА ИЮЛЬ',
      value: '4 910,9',
      unit: 'т',
      colorClass: {
        border: 'border-emerald-600',
        text: 'text-emerald-600',
        icon: 'text-emerald-600'
      }
    },
    {
      id: 'shipment-july',
      icon: <Truck className="w-8 h-8" />,
      labelLine1: 'ОТГРУЗКА',
      labelLine2: 'ЗА ИЮЛЬ',
      value: '4 705,4',
      unit: 'т',
      colorClass: {
        border: 'border-blue-600',
        text: 'text-blue-600',
        icon: 'text-blue-600'
      }
    },
    {
      id: 'plan-fulfillment',
      icon: <Target className="w-8 h-8" />,
      labelLine1: 'ВЫПОЛНЕНИЕ',
      labelLine2: 'ПЛАНА',
      value: '94,4',
      unit: '%',
      colorClass: {
        border: 'border-orange-400',
        text: 'text-orange-400',
        icon: 'text-orange-400'
      }
    }
  ];

  return (
    <div className="w-full py-6 ">
      <div className="grid grid-cols-5 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`flex flex-col justify-between p-4 rounded-xl border ${metric.colorClass.border}`}
          >
            {/* Top Row: Icon & Label */}
            <div className="flex items-center gap-4">
              <div className={`${metric.colorClass.icon} p-1 shrink-0`}>
                {metric.icon}
              </div>
              <div className="flex flex-col leading-tight">
                <span className={`text-[11px] font-extrabold tracking-wider ${metric.colorClass.text}`}>
                  {metric.labelLine1}
                </span>
                <span className={`text-[11px] font-extrabold tracking-wider ${metric.colorClass.text}`}>
                  {metric.labelLine2}
                </span>
              </div>
            </div>

            {/* Bottom Row: Large Value */}
            <div className="mt-4 text-center">
              <span className={`text-3xl md:text-4xl font-extrabold tracking-tight ${metric.colorClass.text}`}>
                {metric.value}
              </span>
              <span className={`text-sm md:text-base font-bold ml-1.5 align-baseline ${metric.colorClass.text}`}>
                {metric.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
