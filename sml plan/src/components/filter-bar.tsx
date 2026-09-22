import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterBarProps {
  workshops?: FilterOption[];
  products?: FilterOption[];
  selectedOrganization?: string;
  selectedWorkshop?: string;
  selectedProduct?: string;
  onOrganizationChange?: (value: string) => void;
  onWorkshopChange?: (value: string) => void;
  onProductChange?: (value: string) => void;
  className?: string;
}

const DEFAULT_WORKSHOPS: FilterOption[] = [
  { value: 'all', label: 'Все цеха' },
  { value: 'workshop-1', label: 'Цех №1 (Литейный)' },
  { value: 'workshop-2', label: 'Цех №2 (Сборочный)' },
  { value: 'workshop-3', label: 'Цех №3 (Механический)' },
];

const DEFAULT_PRODUCTS: FilterOption[] = [
  { value: 'all', label: 'Вся продукция' },
  { value: 'prod-1', label: 'Арматура 12мм А500С' },
  { value: 'prod-2', label: 'Труба профильная 40х40' },
  { value: 'prod-3', label: 'Лист стальной 4мм' },
  { value: 'prod-4', label: 'Балка двутавровая 20Б1' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  workshops = DEFAULT_WORKSHOPS,
  products = DEFAULT_PRODUCTS,
  selectedWorkshop,
  selectedProduct,
  onWorkshopChange,
  onProductChange,
  className,
}) => {
  const [internalWorkshop, setInternalWorkshop] = useState('all');
  const [internalProduct, setInternalProduct] = useState('all');

  const currentWorkshop = selectedWorkshop !== undefined ? selectedWorkshop : internalWorkshop;
  const currentProduct = selectedProduct !== undefined ? selectedProduct : internalProduct;

  const handleWorkshopChange = (val: string) => {
    setInternalWorkshop(val);
    onWorkshopChange?.(val);
  };

  const handleProductChange = (val: string) => {
    setInternalProduct(val);
    onProductChange?.(val);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-4 py-3", className)}>

      {/* 2. Цех */}
      <div className="flex flex-col gap-1.5 min-w-50 flex-1">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Цех
        </label>
        <Select value={currentWorkshop} onValueChange={handleWorkshopChange}>
          <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 h-9 rounded-md hover:border-slate-300 dark:hover:border-slate-600 focus:ring-1 focus:ring-blue-500 shadow-xs">
            <SelectValue placeholder="Все цеха" />
          </SelectTrigger>
          <SelectContent>
            {workshops.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. Продукция */}
      <div className="flex flex-col gap-1.5 min-w-50 flex-1">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Продукция
        </label>
        <Select value={currentProduct} onValueChange={handleProductChange}>
          <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 h-9 rounded-md hover:border-slate-300 dark:hover:border-slate-600 focus:ring-1 focus:ring-blue-500 shadow-xs">
            <SelectValue placeholder="Вся продукция" />
          </SelectTrigger>
          <SelectContent>
            {products.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterBar;
