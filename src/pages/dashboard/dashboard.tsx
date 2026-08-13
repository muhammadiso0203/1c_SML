import React from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardHeader } from '../../components/dashboard/Header';
import { ProductionCard } from '../../components/dashboard/ProductionCard';
import { ShipmentCard } from '../../components/dashboard/ShipmentCard';
import { ProductionProgram } from '../../components/dashboard/ProductionProgram';
import { EquipmentUsage } from '../../components/dashboard/EquipmentUsage';
import { MetricCards } from '../../components/dashboard/Statistika';
import { ShipmentStructure } from '../../components/dashboard/ShipmentStructure';
import { ShipmentDaily } from '../../components/dashboard/ShipmentDaily';
import { OstatkiDetailed } from '../../components/dashboard/OstatkiDetailed';
import { KpiTrafficLight } from '../../components/dashboard/KpiTrafficLight';
import { DashboardFooter } from '../../components/dashboard/Footer';

const Dashboard = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialDateParam = urlParams.get('date');

    const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
        // 1. Try date from URL parameter
        if (initialDateParam && initialDateParam.length === 8) {
            const y = parseInt(initialDateParam.substring(0, 4), 10);
            const m = parseInt(initialDateParam.substring(4, 6), 10) - 1;
            const d = parseInt(initialDateParam.substring(6, 8), 10);
            const parsed = new Date(y, m, d);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        // 2. Try date from localStorage (localState)
        const storedDate = localStorage.getItem('dashboard_selected_date');
        if (storedDate && storedDate.length === 8) {
            const y = parseInt(storedDate.substring(0, 4), 10);
            const m = parseInt(storedDate.substring(4, 6), 10) - 1;
            const d = parseInt(storedDate.substring(6, 8), 10);
            const parsed = new Date(y, m, d);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        return new Date(2026, 6, 24); // Default to July 24, 2026 (20260724)
    });

    // Sync URL on initial mount if URL param is missing but we loaded from localStorage or default
    React.useEffect(() => {
        const url = new URL(window.location.href);
        if (!url.searchParams.has('date')) {
            const y = selectedDate.getFullYear();
            const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const d = String(selectedDate.getDate()).padStart(2, '0');
            const formatted = `${y}${m}${d}`;
            url.searchParams.set('date', formatted);
            window.history.replaceState({}, '', url.toString());
        }
    }, [selectedDate]);

    const handleDateChange = (newDate: Date) => {
        setSelectedDate(newDate);

        const y = newDate.getFullYear();
        const m = String(newDate.getMonth() + 1).padStart(2, '0');
        const d = String(newDate.getDate()).padStart(2, '0');
        const formatted = `${y}${m}${d}`;

        // Save to localStorage (localState)
        localStorage.setItem('dashboard_selected_date', formatted);

        // Sync URL with pushState for history back/forward support
        const url = new URL(window.location.href);
        if (url.searchParams.get('date') !== formatted) {
            url.searchParams.set('date', formatted);
            window.history.pushState({}, '', url.toString());
        }
    };

    const dateParam = React.useMemo(() => {
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        return `${y}${m}${d}`;
    }, [selectedDate]);

    const formattedDate = React.useMemo(() => {
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        return `${d}.${m}.${y}`;
    }, [selectedDate]);

    const rawDashboardBase = import.meta.env.VITE_DASHBOARD_PATH || '/dashboard';
    const location = useLocation();
    const pathname = location.pathname;

    // Normalize dashboard base: ensure leading slash, remove trailing slash
    const dashboardBase = (() => {
        let b = String(rawDashboardBase || '/dashboard');
        if (!b.startsWith('/')) b = '/' + b;
        b = b.replace(/\/+$|\/+$/g, '');
        if (b === '') b = '/';
        return b;
    })();

    const isMainDashboard = (() => {
        // If pathname exactly equals base or base + '/', treat as main
        if (pathname === dashboardBase || pathname === `${dashboardBase}/`) return true;
        return false;
    })();

    // Always render header (панель одинакова для всех страниц)
    return (
        <div className="min-h-screen font-sans bg-[#090d16] text-slate-100">
            <DashboardHeader
                generationDate={`${formattedDate} 08:00`}
                selectedDate={selectedDate}
                onChangeDate={handleDateChange}
            />

            {/* Main content: show data only on exact dashboard base path, otherwise show placeholder */}
            <main className="mx-auto px-6 py-6">
                {isMainDashboard ? (
                    <>
                        <MetricCards date={dateParam} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-2 items-stretch">
                            <ProductionProgram date={dateParam} />
                            <EquipmentUsage />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-4 md:mt-6">
                            <ProductionCard date={dateParam} />
                            <ShipmentCard date={dateParam} />
                        </div>
                        <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                            <ShipmentStructure date={dateParam} />
                            <ShipmentDaily date={dateParam} />
                        </div>
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-9">
                                <OstatkiDetailed date={dateParam} />
                            </div>
                            <div className="lg:col-span-3">
                                <KpiTrafficLight />
                            </div>
                        </div>
                        <div className="pb-8">
                            <DashboardFooter />
                        </div>
                    </>
                ) : (
                    <div className="min-h-[60vh] flex items-center justify-center px-4">
                        <div className="max-w-xl rounded-3xl border border-slate-700 bg-slate-900/90 p-10 text-center shadow-2xl">
                            <h1 className="text-3xl font-bold text-white">В разработке</h1>
                            <p className="mt-4 text-slate-300">
                                Этот раздел пока не доступен. Вернитесь на Главную для просмотра данных.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;

