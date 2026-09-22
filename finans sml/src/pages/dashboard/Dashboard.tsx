import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Stats from '../../components/Select';
import StatsCards from '../../components/StatsCards';
import FinanceChart from '../../components/FinanceChart';
import FinancialSignals from '../../components/FinancialSignals';
import DebtStructure from '../../components/DebtStructure';
import ShareDistribution from '../../components/ShareDistribution';

interface DashboardProps {
    onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('sml_auth');
        if (onLogout) {
            onLogout();
        }
        navigate('/login');
    };

    return (
        <div className="min-h-screen w-full bg-[#0b1329] text-slate-100 px-4 py-4 md:px-6">
            <div className="w-full space-y-6">
                <Header onLogout={handleLogout} />
                <Stats />
                <StatsCards />
                {/* Top Row: Finance Chart (Wider) & Financial Signals (Right Side) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-8 xl:col-span-9 flex">
                        <FinanceChart />
                    </div>
                    <div className="lg:col-span-4 xl:col-span-3 flex">
                        <FinancialSignals />
                    </div>
                </div>

                {/* Bottom Row: Debt Structure & Share Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <DebtStructure />
                    </div>
                    <div className="lg:col-span-1">
                        <ShareDistribution />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
