import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';

interface TableRowData {
  name: string;
  chartName: string;
  value: number;
  valueStr: string;
  percent: string;
}

const rawMaterials: TableRowData[] = [
  { name: 'ПП (полипропилен)', chartName: 'ПП', value: 2664.3, valueStr: '2 664,3', percent: '43,6%' },
  { name: 'ПЭ (полиэтилен)', chartName: 'ПЭ', value: 2559.3, valueStr: '2 559,3', percent: '41,9%' },
  { name: 'Добавки', chartName: 'Добавки', value: 375.2, valueStr: '375,2', percent: '6,1%' },
  { name: 'Регранулят', chartName: 'Регранулят', value: 328.5, valueStr: '328,5', percent: '5,4%' },
  { name: 'Микрокальцит', chartName: 'Микрокальц.', value: 87.5, valueStr: '87,5', percent: '1,4%' },
  { name: 'Красители', chartName: 'Красители', value: 94.7, valueStr: '94,7', percent: '1,6%' },
];

const finishedGoods: TableRowData[] = [
  { name: 'Прошивные мешки', chartName: 'Прошив. мешки', value: 1297.6, valueStr: '1 297,6', percent: '47,1%' },
  { name: 'Стрейч-плёнка', chartName: 'Стрейч-пл.', value: 486.4, valueStr: '486,4', percent: '17,6%' },
  { name: 'МКР', chartName: 'МКР', value: 451.3, valueStr: '451,3', percent: '16,4%' },
  { name: 'БОПП-плёнка', chartName: 'БОПП-пл.', value: 412.3, valueStr: '412,3', percent: '15,0%' },
  { name: 'Коробчатые мешки', chartName: 'Короб. мешки', value: 109.7, valueStr: '109,7', percent: '4,0%' },
];

const rollsData: TableRowData[] = [
  { name: '6 цех склад РПП', chartName: '6ц склад РПП', value: 338.1, valueStr: '338,1', percent: '25,1%' },
  { name: '6 цех Ламинация рулоны', chartName: '6ц Ламинация', value: 331.8, valueStr: '331,8', percent: '24,6%' },
  { name: '3 цех склад РПП', chartName: '3ц склад РПП', value: 270.5, valueStr: '270,5', percent: '20,1%' },
  { name: '8 цех склад РПП', chartName: '8ц склад РПП', value: 266.4, valueStr: '266,4', percent: '19,8%' },
  { name: '2 цех склад РПП', chartName: '2ц склад РПП', value: 125.2, valueStr: '125,2', percent: '9,3%' },
  { name: '7 цех склад РПП', chartName: '7ц склад РПП', value: 16.4, valueStr: '16,4', percent: '1,2%' },
];

export const OstatkiDetailed: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col ">
      {/* Header */}
      <div className="bg-[#f0f4f9] border-b border-slate-100 px-6 py-3.5 flex items-center justify-center">
        <h2 className="text-[#002f6c] text-sm font-extrabold uppercase tracking-wide text-center">
          7. ОСТАТКИ
        </h2>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-3 divide-x divide-slate-200">
        
        {/* Column 1: СЫРЬЕ */}
        <div className="flex flex-col justify-between pr-6">
          <div>
            <h3 className="text-emerald-700 text-[10px] font-black uppercase tracking-wide mb-3">
              7.1. ОСТАТОК СЫРЬЯ: <span className="underline">6 109,6 т</span>
            </h3>
            
            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-1.5 pr-2">Вид сырья</th>
                  <th className="py-1.5 px-2 text-right">Остаток, т</th>
                  <th className="py-1.5 pl-2 text-right">Доля</th>
                </tr>
              </thead>
              <tbody className="font-bold text-slate-700">
                {rawMaterials.map((row) => (
                  <tr key={row.name} className="border-b border-slate-150">
                    <td className="py-1 pr-2 text-slate-800">{row.name}</td>
                    <td className="py-1 px-2 text-right font-mono text-slate-800">{row.valueStr}</td>
                    <td className="py-1 pl-2 text-right font-mono text-slate-400">{row.percent}</td>
                  </tr>
                ))}
                <tr className="text-blue-900 font-extrabold text-[11px] bg-slate-50/50">
                  <td className="py-1.5 pr-2">ИТОГО</td>
                  <td className="py-1.5 px-2 text-right font-mono">6 109,6</td>
                  <td className="py-1.5 pl-2 text-right font-mono">100,0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Chart at bottom */}
          <div className="h-44 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rawMaterials}
                layout="vertical"
                margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 3000]}
                  ticks={[0, 1000, 2000, 3000]}
                  tick={{ fill: '#64748b', fontSize: 8, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={true}
                />
                <YAxis
                  type="category"
                  dataKey="chartName"
                  tick={{ fill: '#334155', fontSize: 8, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={true}
                  width={70}
                />
                <Bar dataKey="value" fill="#2e7d32" radius={[0, 2, 2, 0]} barSize={8}>
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(val: any) => typeof val === 'number' ? Math.round(val).toLocaleString('ru-RU') : val}
                    style={{ fill: '#334155', fontSize: 8, fontWeight: 'bold' }}
                    offset={5}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 2: ГОТОВАЯ ПРОДУКЦИЯ */}
        <div className="flex flex-col justify-between px-6">
          <div>
            <h3 className="text-emerald-700 text-[10px] font-black uppercase tracking-wide mb-3">
              7.2. ОСТАТОК ГОТОВОЙ ПРОДУКЦИИ: <span className="underline">2 757,3 т</span>
            </h3>
            
            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-1.5 pr-2">Вид продукции</th>
                  <th className="py-1.5 px-2 text-right">Остаток, т</th>
                  <th className="py-1.5 pl-2 text-right">Доля</th>
                </tr>
              </thead>
              <tbody className="font-bold text-slate-700">
                {finishedGoods.map((row) => (
                  <tr key={row.name} className="border-b border-slate-150">
                    <td className="py-1 pr-2 text-slate-800">{row.name}</td>
                    <td className="py-1 px-2 text-right font-mono text-slate-800">{row.valueStr}</td>
                    <td className="py-1 pl-2 text-right font-mono text-slate-400">{row.percent}</td>
                  </tr>
                ))}
                <tr className="text-blue-900 font-extrabold text-[11px] bg-slate-50/50">
                  <td className="py-1.5 pr-2">ИТОГО</td>
                  <td className="py-1.5 px-2 text-right font-mono">2 757,3</td>
                  <td className="py-1.5 pl-2 text-right font-mono">100,0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Chart at bottom */}
          <div className="h-44 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={finishedGoods}
                layout="vertical"
                margin={{ top: 5, right: 30, left: -15, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 1500]}
                  ticks={[0, 500, 1000, 1500]}
                  tick={{ fill: '#64748b', fontSize: 8, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={true}
                />
                <YAxis
                  type="category"
                  dataKey="chartName"
                  tick={{ fill: '#334155', fontSize: 8, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={true}
                  width={75}
                />
                <Bar dataKey="value" fill="#2e7d32" radius={[0, 2, 2, 0]} barSize={8}>
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(val: any) => typeof val === 'number' ? Math.round(val).toLocaleString('ru-RU') : val}
                    style={{ fill: '#334155', fontSize: 8, fontWeight: 'bold' }}
                    offset={5}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 3: РУЛОНЫ */}
        <div className="flex flex-col justify-between pl-6">
          <div>
            <h3 className="text-blue-900 text-[10px] font-black uppercase tracking-wide mb-3">
              7.3. ОСТАТОК РУЛОНОВ: <span className="underline">1 348,4 т</span>
            </h3>
            
            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-1.5 pr-2">Цех / склад</th>
                  <th className="py-1.5 px-2 text-right">Остаток, т</th>
                  <th className="py-1.5 pl-2 text-right">Доля</th>
                </tr>
              </thead>
              <tbody className="font-bold text-slate-700">
                {rollsData.map((row) => (
                  <tr key={row.name} className="border-b border-slate-150">
                    <td className="py-1 pr-2 text-slate-800">{row.name}</td>
                    <td className="py-1 px-2 text-right font-mono text-slate-800">{row.valueStr}</td>
                    <td className="py-1 pl-2 text-right font-mono text-slate-400">{row.percent}</td>
                  </tr>
                ))}
                <tr className="text-blue-900 font-extrabold text-[11px] bg-slate-50/50">
                  <td className="py-1.5 pr-2">ИТОГО</td>
                  <td className="py-1.5 px-2 text-right font-mono">1 348,4</td>
                  <td className="py-1.5 pl-2 text-right font-mono">100,0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Chart at bottom */}
          <div className="h-44 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rollsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: -15, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 400]}
                  ticks={[0, 100, 200, 300, 400]}
                  tick={{ fill: '#64748b', fontSize: 8, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={true}
                />
                <YAxis
                  type="category"
                  dataKey="chartName"
                  tick={{ fill: '#334155', fontSize: 8, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={true}
                  width={75}
                />
                <Bar dataKey="value" fill="#7b1fa2" radius={[0, 2, 2, 0]} barSize={8}>
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(val: any) => typeof val === 'number' ? Math.round(val).toLocaleString('ru-RU') : val}
                    style={{ fill: '#334155', fontSize: 8, fontWeight: 'bold' }}
                    offset={5}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
