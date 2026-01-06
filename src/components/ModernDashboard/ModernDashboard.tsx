import React, { useState } from 'react';
import Layout from './Layout';
import OverviewCard from './OverviewCard';
import ActiveTradesList from './ActiveTradesList';
import { useAuth } from '../../contexts/AuthContext';
import { useStrategies } from '../../hooks/useStrategies';
import SignalFeed from '../SignalFeed';
import StrategyModal from '../StrategyModal';
import { Strategy } from '../../types';

const ModernDashboard: React.FC = () => {
    const { userProfile, loading: authLoading } = useAuth();
    const { strategies, loading: stratLoading } = useStrategies();
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);

    const handleCopyStrategy = (strategy: Strategy) => {
        setSelectedStrategy(strategy);
        setIsStrategyModalOpen(true);
    };

    if (authLoading) {
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
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f01a64] to-purple-600">{userProfile?.displayName ? userProfile.displayName.split(' ')[0] : 'Trader'}</span>
                        </h1>
                        <p className="text-gray-400 font-medium">Market volatility is <span className="text-[#00b36b] font-bold">Low</span>. Good conditions for copy-trading.</p>
                    </div>
                    {/* Compact Mobile Stats or Actions could go here */}
                </div>

                {/* Stats Overview */}
                <OverviewCard user={userProfile} />

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Active Trades Module */}
                        <ActiveTradesList trades={userProfile?.activeTrades} />
                    </div>

                    <div className="space-y-8">
                        {/* Market Signals (Copy Trading) */}
                        <div className="bg-[#1e222d] rounded-3xl p-6 border border-white/5">
                            {stratLoading ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin w-8 h-8 border-2 border-[#f01a64] border-t-transparent rounded-full mx-auto mb-2"></div>
                                    <p className="text-xs text-gray-500">Loading Signals...</p>
                                </div>
                            ) : (
                                <SignalFeed
                                    plans={strategies}
                                    onCopy={handleCopyStrategy}
                                    userDeposited={userProfile?.hasDeposited || false}
                                    isDemo={false} // Future: Add demo toggle
                                    demoCount={0}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategy Modal (Reused) */}
            {isStrategyModalOpen && selectedStrategy && (
                <StrategyModal
                    isOpen={isStrategyModalOpen}
                    onClose={() => setIsStrategyModalOpen(false)}
                    strategy={selectedStrategy}
                    userBalance={userProfile?.balance || 0}
                    userDeposited={userProfile?.hasDeposited || false}
                />
            )}
        </Layout>
    );
};

export default ModernDashboard;
