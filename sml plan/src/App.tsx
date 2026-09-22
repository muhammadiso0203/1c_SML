
import Header from './components/header'
import FilterBar from './components/filter-bar'
import KpiCards from './components/kpi-cards'
import BarChart from './components/plan'
import NakopitelniPlan from './components/nakopitelni-plan'

function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header />
      <main className="px-6 py-4 flex flex-col gap-4">
        <FilterBar />
        <KpiCards />
        <BarChart />
        <NakopitelniPlan />
      </main>
    </div>
  )
}

export default App




