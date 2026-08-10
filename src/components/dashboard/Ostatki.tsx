import React from 'react';
import { Settings, Boxes, Package, Cylinder } from 'lucide-react';
import { useOstatok } from '../../pages/service/useOstatok';
import { usePr010 } from '../../pages/service/usePr010';

interface OstatkiItem {
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

export const Ostatki: React.FC<{ date?: string }> = ({ date = "20260724" }) => {
  const { data: ostatokResponse, isLoading } = useOstatok(date);
  const { data: pr010Response, isLoading: isPr010Loading } = usePr010(date);

  const rawMaterialsSum = React.useMemo(() => {
    if (ostatokResponse?.success && ostatokResponse.data) {
      return ostatokResponse.data.reduce((sum, item) => sum + item.quantity, 0);
    }
    return 0; // fallback
  }, [ostatokResponse]);

  const finishedGoodsSum = React.useMemo(() => {
    if (pr010Response?.data) {
      return pr010Response.data.RESIDUAL_FINISHED_PRODUCT;
    }
    return 0; // fallback
  }, [pr010Response]);

  const rollsSum = React.useMemo(() => {
    if (pr010Response?.data && pr010Response.data.remainsrolls !== undefined) {
      return pr010Response.data.remainsrolls;
    }
    return 0; // fallback
  }, [pr010Response]);

  const equipmentUsageVal = React.useMemo(() => {
    if (pr010Response?.data) {
      return '66,3';
    }
    return '0';
  }, [pr010Response]);

  const formatVal = (val: number) => {
    return val.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const items: OstatkiItem[] = [
    {
      id: 'equipment-usage',
      icon: <Settings className="w-8 h-8" />,
      labelLine1: 'ИСПОЛЬЗОВАНИЕ',
      labelLine2: 'ОБОРУДОВАНИЯ',
      value: isPr010Loading ? '...' : equipmentUsageVal,
      unit: '%',
      colorClass: {
        border: 'border-violet-600',
        text: 'text-violet-600',
        icon: 'text-violet-600'
      }
    },
    {
      id: 'raw-materials',
      icon: <Boxes className="w-8 h-8" />,
      labelLine1: 'ОСТАТОК',
      labelLine2: 'СЫРЬЯ',
      value: isLoading ? '...' : formatVal(rawMaterialsSum),
      unit: 'т',
      colorClass: {
        border: 'border-amber-500',
        text: 'text-amber-500',
        icon: 'text-amber-500'
      }
    },
    {
      id: 'finished-goods',
      icon: <Package className="w-8 h-8" />,
      labelLine1: 'ОСТАТОК ГОТОВОЙ',
      labelLine2: 'ПРОДУКЦИИ',
      value: isPr010Loading ? '...' : formatVal(finishedGoodsSum),
      unit: 'т',
      colorClass: {
        border: 'border-emerald-600',
        text: 'text-emerald-600',
        icon: 'text-emerald-600'
      }
    },
    {
      id: 'rolls-stock',
      icon: <Cylinder className="w-8 h-8" />,
      labelLine1: 'ОСТАТОК',
      labelLine2: 'РУЛОНОВ',
      value: isPr010Loading ? '...' : formatVal(rollsSum),
      unit: 'т',
      colorClass: {
        border: 'border-blue-400',
        text: 'text-blue-400',
        icon: 'text-blue-400'
      }
    }
  ];

  return (
    <div className="w-full pb-6">
      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col justify-between p-4 rounded-xl border ${item.colorClass.border} bg-white`}
          >
            {/* Top Row: Icon & Label */}
            <div className="flex items-center gap-4">
              <div className={`${item.colorClass.icon} p-1 shrink-0`}>
                {item.icon}
              </div>
              <div className="flex flex-col leading-tight">
                <span className={`text-[11px] font-extrabold tracking-wider ${item.colorClass.text}`}>
                  {item.labelLine1}
                </span>
                <span className={`text-[11px] font-extrabold tracking-wider ${item.colorClass.text}`}>
                  {item.labelLine2}
                </span>
              </div>
            </div>

            {/* Bottom Row: Large Value */}
            <div className="mt-4 text-center">
              <span className={`text-3xl md:text-4xl font-extrabold tracking-tight ${item.colorClass.text}`}>
                {item.value}
              </span>
              <span className={`text-sm md:text-base font-bold ml-1.5 align-baseline ${item.colorClass.text}`}>
                {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
