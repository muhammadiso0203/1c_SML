import React from 'react';
import { Factory, Truck, TrendingUp, Target, Settings, Boxes, Package, Cylinder } from 'lucide-react';
import { usePr010 } from '../../pages/dashboard/service/usePr010';
import { useOstatok } from '../../pages/dashboard/service/useOstatok';

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
    bg: string;
  };
}

export const MetricCards: React.FC<{ date?: string }> = ({ date = "20260724" }) => {
  const { data: pr010Response, isLoading: isPr010Loading } = usePr010(date);
  const { data: ostatokResponse, isLoading: isOstatokLoading } = useOstatok(date);

  const monthName = React.useMemo(() => {
    if (date.length === 8) {
      const m = parseInt(date.substring(4, 6), 10) - 1;
      const months = [
        "ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ", "МАЙ", "ИЮНЬ",
        "ИЮЛЬ", "АВГУСТ", "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"
      ];
      return months[m] || "ИЮЛЬ";
    }
    return "ИЮЛЬ";
  }, [date]);

  const dailyOutputStr = React.useMemo(() => {
    if (isPr010Loading) return '...';
    if (pr010Response?.data?.A3?.Daily_output !== undefined) {
      return pr010Response.data.A3.Daily_output.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return '165,0';
  }, [pr010Response, isPr010Loading]);

  const monthlyOutputStr = React.useMemo(() => {
    if (isPr010Loading) return '...';
    if (pr010Response?.data?.A3?.Monthly_issue !== undefined) {
      return pr010Response.data.A3.Monthly_issue.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return '4 910,9';
  }, [pr010Response, isPr010Loading]);

  const planFulfillmentStr = React.useMemo(() => {
    if (isPr010Loading) return '...';
    if (pr010Response?.data?.A1) {
      const generalPlan = pr010Response.data.A1.General_Plan ?? 0;
      const forecastEndMonth = pr010Response.data.A1.Forecast_for_the_End_of_the_Month ?? 0;
      if (generalPlan > 0) {
        const forecastPercentage = (forecastEndMonth / generalPlan) * 100;
        return forecastPercentage.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      }
      if (pr010Response.data.A1.Implementation_of_the_Plan !== undefined) {
        return pr010Response.data.A1.Implementation_of_the_Plan.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      }
    }
    return '51,5';
  }, [pr010Response, isPr010Loading]);

  const dailyShipmentStr = React.useMemo(() => {
    if (isPr010Loading) return '...';
    if (pr010Response?.data) {
      let val = 0;
      if (pr010Response.data.shipment_PER_DAY !== undefined) {
        val = pr010Response.data.shipment_PER_DAY;
      } else if (pr010Response.data.A6) {
        val = pr010Response.data.A6.reduce((sum, item) => sum + item.remains, 0);
      }
      return val.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return '0,0';
  }, [pr010Response, isPr010Loading]);

  const monthlyShipmentStr = React.useMemo(() => {
    if (isPr010Loading) return '...';
    if (pr010Response?.data && pr010Response.data.shipment_PER_month !== undefined) {
      return pr010Response.data.shipment_PER_month.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return '4 705,4';
  }, [pr010Response, isPr010Loading]);

  const rawMaterialsSum = React.useMemo(() => {
    if (ostatokResponse?.success && ostatokResponse.data) {
      return ostatokResponse.data.reduce((sum, item) => sum + item.quantity, 0);
    }
    return 0;
  }, [ostatokResponse]);

  const finishedGoodsSum = React.useMemo(() => {
    if (pr010Response?.data) {
      return pr010Response.data.RESIDUAL_FINISHED_PRODUCT;
    }
    return 0;
  }, [pr010Response]);

  const rollsSum = React.useMemo(() => {
    if (pr010Response?.data && pr010Response.data.remainsrolls !== undefined) {
      return pr010Response.data.remainsrolls;
    }
    return 0;
  }, [pr010Response]);

  const equipmentUsageVal = React.useMemo(() => {
    if (pr010Response?.data?.EquipmentAvailability !== undefined) {
      return pr010Response.data.EquipmentAvailability.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    if (pr010Response?.data?.A2 && pr010Response.data.A2.length > 0) {
      const sum = pr010Response.data.A2.reduce((acc, item) => acc + (item.PercentageDay ?? 0), 0);
      const avg = sum / pr010Response.data.A2.length;
      return avg.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return '66,3';
  }, [pr010Response]);

  const formatVal = (val: number) => {
    return val.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const metrics: MetricItem[] = [
    {
      id: 'output-day',
      icon: <Factory className="w-6 h-6" />,
      labelLine1: 'ВЫПУСК',
      labelLine2: 'ЗА ДЕНЬ',
      value: dailyOutputStr,
      unit: 'т',
      colorClass: {
        border: 'border-emerald-500/40 hover:border-emerald-400',
        text: 'text-emerald-400',
        icon: 'text-emerald-400',
        bg: 'bg-[#111827]/90'
      }
    },
    {
      id: 'shipment-day',
      icon: <Truck className="w-6 h-6" />,
      labelLine1: 'ОТГРУЗКА',
      labelLine2: 'ЗА ДЕНЬ',
      value: dailyShipmentStr,
      unit: 'т',
      colorClass: {
        border: 'border-blue-500/40 hover:border-blue-400',
        text: 'text-blue-400',
        icon: 'text-blue-400',
        bg: 'bg-[#111827]/90'
      }
    },
    {
      id: 'output-month',
      icon: <TrendingUp className="w-6 h-6" />,
      labelLine1: 'ВЫПУСК',
      labelLine2: `ЗА ${monthName}`,
      value: monthlyOutputStr,
      unit: 'т',
      colorClass: {
        border: 'border-emerald-500/40 hover:border-emerald-400',
        text: 'text-emerald-400',
        icon: 'text-emerald-400',
        bg: 'bg-[#111827]/90'
      }
    },
    {
      id: 'shipment-month',
      icon: <Truck className="w-6 h-6" />,
      labelLine1: 'ОТГРУЗКА',
      labelLine2: `ЗА ${monthName}`,
      value: monthlyShipmentStr,
      unit: 'т',
      colorClass: {
        border: 'border-blue-500/40 hover:border-blue-400',
        text: 'text-blue-400',
        icon: 'text-blue-400',
        bg: 'bg-[#111827]/90'
      }
    },
    {
      id: 'plan-fulfillment',
      icon: <Target className="w-6 h-6" />,
      labelLine1: 'ВЫПОЛНЕНИЕ',
      labelLine2: 'ПЛАНА',
      value: planFulfillmentStr,
      unit: '%',
      colorClass: {
        border: 'border-amber-500/40 hover:border-amber-400',
        text: 'text-amber-400',
        icon: 'text-amber-400',
        bg: 'bg-[#111827]/90'
      }
    },
    {
      id: 'equipment-usage',
      icon: <Settings className="w-6 h-6" />,
      labelLine1: 'ИСПОЛЬЗОВАНИЕ',
      labelLine2: 'ОБОРУДОВАНИЯ',
      value: isPr010Loading ? '...' : equipmentUsageVal,
      unit: '%',
      colorClass: {
        border: 'border-purple-500/40 hover:border-purple-400',
        text: 'text-purple-400',
        icon: 'text-purple-400',
        bg: 'bg-[#111827]/90'
      }
    },
    {
      id: 'raw-materials',
      icon: <Boxes className="w-6 h-6" />,
      labelLine1: 'ОСТАТОК',
      labelLine2: 'СЫРЬЯ',
      value: isOstatokLoading ? '...' : formatVal(rawMaterialsSum),
      unit: 'т',
      colorClass: {
        border: 'border-yellow-500/40 hover:border-yellow-400',
        text: 'text-yellow-400',
        icon: 'text-yellow-400',
        bg: 'bg-[#111827]/90'
      }
    },
    {
      id: 'finished-goods',
      icon: <Package className="w-6 h-6" />,
      labelLine1: 'ОСТАТОК ГОТОВОЙ',
      labelLine2: 'ПРОДУКЦИИ',
      value: isPr010Loading ? '...' : formatVal(finishedGoodsSum),
      unit: 'т',
      colorClass: {
        border: 'border-emerald-500/40 hover:border-emerald-400',
        text: 'text-emerald-400',
        icon: 'text-emerald-400',
        bg: 'bg-[#111827]/90'
      }
    },
    {
      id: 'rolls-stock',
      icon: <Cylinder className="w-6 h-6" />,
      labelLine1: 'ОСТАТОК',
      labelLine2: 'РУЛОНОВ',
      value: isPr010Loading ? '...' : formatVal(rollsSum),
      unit: 'т',
      colorClass: {
        border: 'border-sky-500/40 hover:border-sky-400',
        text: 'text-sky-400',
        icon: 'text-sky-400',
        bg: 'bg-[#111827]/90'
      }
    }
  ];

  return (
    <div className="w-full py-4">
      <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-9">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`flex min-w-0 h-full flex-col justify-between rounded-xl border p-2.5 sm:p-3 ${metric.colorClass.border} ${metric.colorClass.bg} backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-[1.01]`}
          >
            {/* Top Row: Icon & Label */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className={`${metric.colorClass.icon} shrink-0`}>
                <div className="w-[clamp(1rem,1.5vw,1.75rem)] h-[clamp(1rem,1.5vw,1.75rem)] [&_svg]:w-full [&_svg]:h-full">
                  {metric.icon}
                </div>
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className={`truncate text-[clamp(0.58rem,0.8vw,0.9rem)] font-extrabold tracking-wider ${metric.colorClass.text}`}>
                  {metric.labelLine1}
                </span>
                <span className={`truncate text-[clamp(0.58rem,0.8vw,0.9rem)] font-extrabold tracking-wider ${metric.colorClass.text}`}>
                  {metric.labelLine2}
                </span>
              </div>
            </div>

            {/* Bottom Row: Large Value */}
            <div className="mt-3 text-center">
              <span className={`text-[clamp(1.05rem,1.9vw,2.2rem)] font-extrabold tracking-tight ${metric.colorClass.text}`}>
                {metric.value}
              </span>
              <span className={`ml-1 align-baseline text-[clamp(0.7rem,0.9vw,1rem)] font-bold ${metric.colorClass.text}`}>
                {metric.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

