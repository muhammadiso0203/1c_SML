import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { useOstatok } from '../../pages/dashboard/service/useOstatok';
import { usePr010 } from '../../pages/dashboard/service/usePr010';

interface TableRowData {
  name: string;
  chartName: string;
  value: number;
  valueStr: string;
  percent: string;
}



export const OstatkiDetailed: React.FC<{ date?: string }> = ({ date = "20260724" }) => {
  const { data: ostatokResponse, isLoading, error } = useOstatok(date);
  const { data: pr010Response, isLoading: isPr010Loading, error: pr010Error } = usePr010(date);

  const mapFinishedProduct = (producttype: string) => {
    const p = producttype.trim();
    if (p === "БОПП") return { name: "БОПП-плёнка", chartName: "БОПП-пл." };
    if (p === "Стрейч") return { name: "Стрейч-плёнка", chartName: "Стрейч-пл." };
    if (p === "Прошивные мешки") return { name: "Прошивные мешки", chartName: "Прошив. мешки" };
    if (p === "Коробчатые мешки") return { name: "Коробчатые мешки", chartName: "Короб. мешки" };
    if (p === "Выдувная плёнка") return { name: "Выдувная плёнка", chartName: "Выдув. плёнка" };
    return { name: p, chartName: p };
  };

  const apiFinishedGoods: TableRowData[] = React.useMemo(() => {
    if (!pr010Response?.data?.A7_2) {
      return [];
    }
    const total = pr010Response.data.RESIDUAL_FINISHED_PRODUCT || pr010Response.data.A7_2.reduce((sum, item) => sum + item.remains, 0);
    return pr010Response.data.A7_2.map((item) => {
      const { name, chartName } = mapFinishedProduct(item.producttype);
      const val = item.remains;
      const frac = item.fraction !== undefined ? item.fraction : (total > 0 ? (val / total) * 100 : 0);
      return {
        name,
        chartName,
        value: val,
        valueStr: val.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        percent: frac.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%',
      };
    }).sort((a, b) => b.value - a.value);
  }, [pr010Response]);

  const totalFinishedGoods = React.useMemo(() => {
    if (pr010Response?.data) {
      return pr010Response.data.RESIDUAL_FINISHED_PRODUCT;
    }
    return 0;
  }, [pr010Response]);

  const totalFinishedGoodsStr = totalFinishedGoods.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const displayFinishedGoods = apiFinishedGoods.length > 0 ? apiFinishedGoods : [];
  const displayTotalFinishedGoodsStr = apiFinishedGoods.length > 0 ? totalFinishedGoodsStr : '0,0';

  const mapRollsDivision = (division: string) => {
    const d = division.trim();
    if (d.includes("6 цех Промежуточный склад") || d.includes("6ц склад РПП")) {
      return { name: "6 цех склад РПП", chartName: "6ц склад РПП" };
    }
    if (d.includes("6 цех Ламинация") || d.includes("6ц Ламинация")) {
      return { name: "6 цех Ламинация рулоны", chartName: "6ц Ламинация" };
    }
    if (d.includes("3 цех Промежуточный склад") || d.includes("3ц склад РПП")) {
      return { name: "3 цех склад РПП", chartName: "3ц склад РПП" };
    }
    if (d.includes("8 цех промежуточный склад") || d.includes("8 цех Промежуточный склад") || d.includes("8ц склад РПП")) {
      return { name: "8 цех склад РПП", chartName: "8ц склад РПП" };
    }
    if (d.includes("2 цех Промежуточный склад") || d.includes("2ц склад РПП")) {
      return { name: "2 цех склад РПП", chartName: "2ц склад РПП" };
    }
    if (d.includes("7 цех Промежуточный склад") || d.includes("7ц склад РПП")) {
      return { name: "7 цех склад РПП", chartName: "7ц склад РПП" };
    }

    let chartName = d;
    if (d.startsWith("2 цех ")) chartName = d.replace("2 цех ", "2ц ");
    else if (d.startsWith("3 цех ")) chartName = d.replace("3 цех ", "3ц ");
    else if (d.startsWith("7 цех ")) chartName = d.replace("7 цех ", "7ц ");
    else if (d.startsWith("8 цех ")) chartName = d.replace("8 цех ", "8ц ");
    else if (d.startsWith("4 цех ")) chartName = d.replace("4 цех ", "4ц ");

    return { name: d, chartName };
  };

  const apiRollsData: TableRowData[] = React.useMemo(() => {
    if (!pr010Response?.data?.A7_3) {
      return [];
    }
    const total = pr010Response.data.remainsrolls || pr010Response.data.A7_3.reduce((sum, item) => sum + item.remains, 0);
    return pr010Response.data.A7_3.map((item) => {
      const { name, chartName } = mapRollsDivision(item.division);
      const val = item.remains;
      const frac = item.fraction !== undefined ? item.fraction : (total > 0 ? (val / total) * 100 : 0);
      return {
        name,
        chartName,
        value: val,
        valueStr: val.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        percent: frac.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%',
      };
    }).sort((a, b) => b.value - a.value);
  }, [pr010Response]);

  const totalRolls = React.useMemo(() => {
    if (pr010Response?.data && pr010Response.data.remainsrolls !== undefined) {
      return pr010Response.data.remainsrolls;
    }
    return 0;
  }, [pr010Response]);

  const totalRollsStr = totalRolls.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const displayRolls = apiRollsData.length > 0 ? apiRollsData : [];
  const displayTotalRollsStr = apiRollsData.length > 0 ? totalRollsStr : '0,0';

  const mapGruppaTMC = (gruppa: string) => {
    const g = gruppa.trim();
    if (g.startsWith("ПП")) return { name: "ПП (полипропилен)", chartName: "ПП" };
    if (g.startsWith("ПЭ")) return { name: "ПЭ (полиэтилен)", chartName: "ПЭ" };
    if (g.includes("Добавки") || g.includes("ДБ")) return { name: "Добавки", chartName: "Добавки" };
    if (g.includes("Регранулят")) return { name: "Регранулят", chartName: "Регранулят" };
    if (g.includes("Микрокальцит") || g.includes("МК")) return { name: "Микрокальцит", chartName: "Микрокальц." };
    if (g.includes("Красител") || g.includes("КР")) return { name: "Красители", chartName: "Красители" };
    if (g.includes("Растворитель") || g.includes("Краска")) return { name: "Растворитель, Краска", chartName: "Раств./Краска" };
    if (g.includes("Отходы")) return { name: "Отходы", chartName: "Отходы" };
    return { name: g, chartName: g };
  };

  const apiRawMaterials: TableRowData[] = React.useMemo(() => {
    if (!ostatokResponse?.success || !ostatokResponse.data) {
      return [];
    }

    const items = ostatokResponse.data.map((item) => {
      const { name, chartName } = mapGruppaTMC(item.GruppaTMC);
      return {
        name,
        chartName,
        value: item.quantity,
      };
    });

    const groupedMap = new Map<string, { name: string; chartName: string; value: number }>();
    items.forEach(item => {
      const existing = groupedMap.get(item.name);
      if (existing) {
        existing.value += item.value;
      } else {
        groupedMap.set(item.name, { ...item });
      }
    });

    const groupedList = Array.from(groupedMap.values());
    const total = groupedList.reduce((sum, item) => sum + item.value, 0);

    return groupedList.map(item => ({
      name: item.name,
      chartName: item.chartName,
      value: item.value,
      valueStr: item.value.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      percent: total > 0 ? ((item.value / total) * 100).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%' : '0%',
    })).sort((a, b) => b.value - a.value);
  }, [ostatokResponse]);

  const totalRawMaterials = React.useMemo(() => {
    return apiRawMaterials.reduce((sum, item) => sum + item.value, 0);
  }, [apiRawMaterials]);

  const totalRawMaterialsStr = totalRawMaterials.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const displayRawMaterials = apiRawMaterials.length > 0 ? apiRawMaterials : [];
  const displayTotalRawMaterialsStr = apiRawMaterials.length > 0 ? totalRawMaterialsStr : '0,0';

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
      {/* Header */}
      <div className="bg-[#1e293b] border-b border-slate-800 px-6 py-3.5 flex items-center justify-center">
        <h2 className="text-white text-sm font-extrabold uppercase tracking-wide text-center">
          7. ОСТАТКИ
        </h2>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-3 divide-x divide-slate-800">

        {/* Column 1: СЫРЬЕ */}
        <div className="flex flex-col justify-between pr-6 relative min-h-87.5">
          {error && (
            <div className="absolute inset-0 bg-[#111827]/90 flex flex-col items-center justify-center z-10 p-4 text-center">
              <span className="text-xs text-rose-400 font-bold">Ошибка загрузки</span>
              <span className="text-[10px] text-slate-400 mt-1">{error.message}</span>
            </div>
          )}
          <div className={`transition-all duration-300 ${isLoading ? 'opacity-60 animate-pulse' : ''}`}>
            <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-wide mb-3 flex items-center gap-2">
              7.1. ОСТАТОК СЫРЬЯ: <span className="underline">{displayTotalRawMaterialsStr} т</span>
              {isLoading && (
                <span className="inline-block w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0"></span>
              )}
            </h3>

            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="py-1.5 pr-2">Вид сырья</th>
                  <th className="py-1.5 px-2 text-right">Остаток, т</th>
                  <th className="py-1.5 pl-2 text-right">Доля</th>
                </tr>
              </thead>
              <tbody className="font-bold text-slate-300">
                {displayRawMaterials.map((row) => (
                  <tr key={row.name} className="border-b border-slate-800/60">
                    <td className="py-1 pr-2 text-slate-200">{row.name}</td>
                    <td className="py-1 px-2 text-right font-mono text-slate-200">{row.valueStr}</td>
                    <td className="py-1 pl-2 text-right font-mono text-slate-400">{row.percent}</td>
                  </tr>
                ))}
                <tr className="text-blue-400 font-extrabold text-[11px] bg-slate-800/40">
                  <td className="py-1.5 pr-2">ИТОГО</td>
                  <td className="py-1.5 px-2 text-right font-mono">{displayTotalRawMaterialsStr}</td>
                  <td className="py-1.5 pl-2 text-right font-mono">100,0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Chart at bottom */}
          <div className={`h-44 w-full mt-4 transition-all duration-300 ${isLoading ? 'opacity-60 animate-pulse' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayRawMaterials}
                layout="vertical"
                margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, (dataMax: number) => Math.ceil((dataMax || 3000) * 1.25 / 500) * 500]}
                  tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={true}
                />
                <YAxis
                  type="category"
                  dataKey="chartName"
                  tick={{ fill: '#cbd5e1', fontSize: 8, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={true}
                  width={70}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 2, 2, 0]} barSize={8}>
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(val: any) => typeof val === 'number' ? Math.round(val).toLocaleString('ru-RU') : val}
                    style={{ fill: '#f1f5f9', fontSize: 8, fontWeight: 'bold' }}
                    offset={5}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 2: ГОТОВАЯ ПРОДУКЦИЯ */}
        <div className="flex flex-col justify-between px-6 relative min-h-87.5">
          {pr010Error && (
            <div className="absolute inset-0 bg-[#111827]/90 flex flex-col items-center justify-center z-10 p-4 text-center">
              <span className="text-xs text-rose-400 font-bold">Ошибка загрузки</span>
              <span className="text-[10px] text-slate-400 mt-1">{pr010Error.message}</span>
            </div>
          )}
          <div className={`transition-all duration-300 flex flex-col justify-between h-full ${isPr010Loading ? 'opacity-60 animate-pulse' : ''}`}>
            <div>
              <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-wide mb-3 flex items-center gap-2">
                7.2. ОСТАТОК ГОТОВОЙ ПРОДУКЦИИ: <span className="underline">{displayTotalFinishedGoodsStr} т</span>
                {isPr010Loading && (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0"></span>
                )}
              </h3>

              <table className="w-full text-[10px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="py-1.5 pr-2">Вид продукции</th>
                    <th className="py-1.5 px-2 text-right">Остаток, т</th>
                    <th className="py-1.5 pl-2 text-right">Доля</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-slate-300">
                  {displayFinishedGoods.map((row) => (
                    <tr key={row.name} className="border-b border-slate-800/60">
                      <td className="py-1 pr-2 text-slate-200">{row.name}</td>
                      <td className="py-1 px-2 text-right font-mono text-slate-200">{row.valueStr}</td>
                      <td className="py-1 pl-2 text-right font-mono text-slate-400">{row.percent}</td>
                    </tr>
                  ))}
                  <tr className="text-blue-400 font-extrabold text-[11px] bg-slate-800/40">
                    <td className="py-1.5 pr-2">ИТОГО</td>
                    <td className="py-1.5 px-2 text-right font-mono">{displayTotalFinishedGoodsStr}</td>
                    <td className="py-1.5 pl-2 text-right font-mono">100,0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Chart at bottom */}
            <div className="h-44 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayFinishedGoods}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: -15, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, (dataMax: number) => Math.ceil((dataMax || 1500) * 1.2 / 500) * 500]}
                    tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={true}
                  />
                  <YAxis
                    type="category"
                    dataKey="chartName"
                    tick={{ fill: '#cbd5e1', fontSize: 8, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={true}
                    width={75}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 2, 2, 0]} barSize={8}>
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(val: any) => typeof val === 'number' ? Math.round(val).toLocaleString('ru-RU') : val}
                      style={{ fill: '#f1f5f9', fontSize: 8, fontWeight: 'bold' }}
                      offset={5}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Column 3: РУЛОНЫ */}
        <div className="flex flex-col justify-between pl-6 relative min-h-87.5">
          {pr010Error && (
            <div className="absolute inset-0 bg-[#111827]/90 flex flex-col items-center justify-center z-10 p-4 text-center">
              <span className="text-xs text-rose-400 font-bold">Ошибка загрузки</span>
              <span className="text-[10px] text-slate-400 mt-1">{pr010Error.message}</span>
            </div>
          )}
          <div className={`transition-all duration-300 flex flex-col justify-between h-full ${isPr010Loading ? 'opacity-60 animate-pulse' : ''}`}>
            <div>
              <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-wide mb-3 flex items-center gap-2">
                7.3. ОСТАТОК РУЛОНОВ: <span className="underline">{displayTotalRollsStr} т</span>
                {isPr010Loading && (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0"></span>
                )}
              </h3>

              <table className="w-full text-[10px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="py-1.5 pr-2">Цех / склад</th>
                    <th className="py-1.5 px-2 text-right">Остаток, т</th>
                    <th className="py-1.5 pl-2 text-right">Доля</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-slate-300">
                  {displayRolls.map((row) => (
                    <tr key={row.name} className="border-b border-slate-800/60">
                      <td className="py-1 pr-2 text-slate-200">{row.name}</td>
                      <td className="py-1 px-2 text-right font-mono text-slate-200">{row.valueStr}</td>
                      <td className="py-1 pl-2 text-right font-mono text-slate-400">{row.percent}</td>
                    </tr>
                  ))}
                  <tr className="text-blue-400 font-extrabold text-[11px] bg-slate-800/40">
                    <td className="py-1.5 pr-2">ИТОГО</td>
                    <td className="py-1.5 px-2 text-right font-mono">{displayTotalRollsStr}</td>
                    <td className="py-1.5 pl-2 text-right font-mono">100,0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Chart at bottom */}
            <div
              className="w-full mt-4 overflow-y-auto"
              style={{ height: displayRolls.length > 6 ? `${displayRolls.length * 22 + 40}px` : '176px', maxHeight: '300px' }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayRolls}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: -15, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, (dataMax: number) => Math.ceil((dataMax || 400) * 1.2 / 100) * 100]}
                    tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={true}
                  />
                  <YAxis
                    type="category"
                    dataKey="chartName"
                    tick={{ fill: '#cbd5e1', fontSize: 8, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={true}
                    width={75}
                  />
                  <Bar dataKey="value" fill="#a855f7" radius={[0, 2, 2, 0]} barSize={8}>
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(val: any) => typeof val === 'number' ? Math.round(val).toLocaleString('ru-RU') : val}
                      style={{ fill: '#f1f5f9', fontSize: 8, fontWeight: 'bold' }}
                      offset={5}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
