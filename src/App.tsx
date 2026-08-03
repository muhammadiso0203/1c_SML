import { DashboardHeader } from './dashboard/Header';
import { ProductionCard } from './dashboard/ProductionCard';
import { ShipmentCard } from './dashboard/ShipmentCard';
import { Ostatki } from './dashboard/Ostatki';
import { ProductionProgram } from './dashboard/ProductionProgram';
import { EquipmentUsage } from './dashboard/EquipmentUsage';
import { MetricCards } from './dashboard/Statistika';
import { ShipmentStructure } from './dashboard/ShipmentStructure';
import { ShipmentDaily } from './dashboard/ShipmentDaily';
import { OstatkiDetailed } from './dashboard/OstatkiDetailed';
import { KpiTrafficLight } from './dashboard/KpiTrafficLight';
import { DashboardFooter } from './dashboard/Footer';

const App = () => {
  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-6">
        <MetricCards/>
        <Ostatki />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2 items-stretch">
          <ProductionProgram />
          <EquipmentUsage />
        </div>
        <div className="grid grid-cols-2 gap-6 mt-6 ">
          <ProductionCard />
          <ShipmentCard />
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShipmentStructure />
          <ShipmentDaily />
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <OstatkiDetailed />
          </div>
          <div className="lg:col-span-3">
            <KpiTrafficLight />
          </div>
        </div>
        <div className="pb-8">
          <DashboardFooter />
        </div>
      </main>
    </div>
  );
};

export default App;

