import React from 'react';
import Layout from './Layout';
import OverviewCard from './OverviewCard';
import { useAuth } from '../../contexts/AuthContext';
// import ActiveTradesList from './ActiveTradesList'; // Coming next
// import SignalFeed from '../SignalFeed'; // Reuse existing component

const ModernDashboard: React.FC = () => {
    const { userProfile, loading } = useAuth();

    // While loading initially, we show a sleek skeleton or just return null (Layout handles skeleton state if needed, but here simple is good)
    // Actually, AuthContext handles global loading often, but having local handling is safer.

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#f01a64] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#f01a64] font-black uppercase text-xs tracking-widest animate-pulse">Initializing Interface...</p>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Greeting Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f01a64] to-purple-600">{userProfile?.displayName ? userProfile.displayName.split(' ')[0] : 'Trader'}</span>
                    </h1>
                    <p className="text-gray-400 font-medium">Market volatility is <span className="text-[#00b36b] font-bold">Low</span>. Good conditions for copy-trading.</p>
                </div>

                {/* Stats Overview */}
                <OverviewCard user={userProfile} />

                {/* Content Area Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* We will add ActiveTradesList here */}
                        <div className="bg-[#1e222d] rounded-3xl p-8 border border-white/5 min-h-[300px] flex items-center justify-center border-dashed border-gray-700">
                            <div className="text-center">
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Active Trades Module</p>
                                <p className="text-gray-600 text-xs">Loading data grid...</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* We will reuse SignalFeed here later */}
                        <div className="bg-[#1e222d] rounded-3xl p-8 border border-white/5 min-h-[300px] flex items-center justify-center border-dashed border-gray-700">
                            <div className="text-center">
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Market Signals</p>
                                <p className="text-gray-600 text-xs">Connecting to master nodes...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ModernDashboard;
