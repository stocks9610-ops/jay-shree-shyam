import React, { useState, useEffect } from 'react';
import { getAllUsers, UserData, updateUserProfile } from '../../services/userService';
import {
    getAllWithdrawals,
    getPendingWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    Withdrawal,
    getWithdrawalStats
} from '../../services/withdrawalService';
import { getSettings, updateSettings, PlatformSettings } from '../../services/settingsService';
import { getPendingDeposits, approveDeposit, rejectDeposit, Deposit } from '../../services/depositService';
import { auth, db } from '../../firebase.config';
import { USERS_COLLECTION, WITHDRAWALS_COLLECTION, DEPOSITS_COLLECTION } from '../../utils/constants';

import AdminPanel from '../AdminPanel';


const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'deposits' | 'withdrawals' | 'settings' | 'content'>('content');
    const [users, setUsers] = useState<UserData[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
    const [pendingDeposits, setPendingDeposits] = useState<Deposit[]>([]);
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        totalAmount: 0
    });
    const [adminProfile, setAdminProfile] = useState<UserData | null>(null);


    const currentUser = auth.currentUser;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, withdrawalsData, pendingData, settingsData, withdrawalStats, depositStats] = await Promise.all([
                getAllUsers(),
                getAllWithdrawals(),
                getPendingWithdrawals(),
                getSettings(),
                getWithdrawalStats(),
                getPendingDeposits()
            ]);

            setUsers(usersData);
            setWithdrawals(withdrawalsData);
            setPendingWithdrawals(pendingData);
            setSettings(settingsData);
            setPendingDeposits(depositStats as unknown as Deposit[]); // depositStats is actually the array from getPendingDeposits
            setStats({
                totalUsers: usersData.length,
                totalWithdrawals: withdrawalStats.total,
                pendingWithdrawals: withdrawalStats.pending,
                totalAmount: withdrawalStats.totalAmount
            });

            if (currentUser) {
                const admin = usersData.find(u => u.uid === currentUser.uid);
                if (admin) setAdminProfile(admin);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };



    const handleApproveWithdrawal = async (withdrawalId: string) => {
        if (!currentUser) return;

        try {
            setLoading(true);
            await approveWithdrawal(withdrawalId, currentUser.uid);
            setSuccess('Withdrawal approved successfully!');
            await loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to approve withdrawal');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectWithdrawal = async (withdrawalId: string, userId: string, amount: number, reason: string) => {
        if (!currentUser) return;

        try {
            setLoading(true);
            // 1. Mark as rejected
            await rejectWithdrawal(withdrawalId, currentUser.uid, reason);

            // 2. Refund balance to user
            const user = users.find(u => u.uid === userId);
            if (user) {
                await updateUserProfile(userId, {
                    balance: (user.balance || 0) + amount
                });
            }

            setSuccess('Withdrawal rejected and funds refunded to user balance');
            await loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to reject withdrawal');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (updates: Partial<PlatformSettings>) => {
        if (!currentUser) return;

        try {
            setLoading(true);
            await updateSettings(updates, currentUser.uid);
            setSuccess('Settings updated successfully!');
            await loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveDeposit = async (deposit: Deposit) => {
        if (!currentUser) return;
        try {
            setLoading(true);
            await approveDeposit(deposit.id!, deposit.userId, deposit.amount, currentUser.uid);
            setSuccess(`Deposit of $${deposit.amount} approved!`);
            await loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to approve deposit');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectDeposit = async (depositId: string) => {
        if (!currentUser) return;
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        try {
            setLoading(true);
            await rejectDeposit(depositId, currentUser.uid, reason);
            setSuccess('Deposit rejected.');
            await loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to reject deposit');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-[#131722] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                {/* Header with Admin Profile */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6 bg-[#1e222d]/50 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="relative group cursor-pointer">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#f01a64] shadow-[0_0_20px_rgba(240,26,100,0.3)]">
                                <img
                                    src={adminProfile?.photoURL || "https://ui-avatars.com/api/?name=Admin&background=random"}
                                    alt="Admin"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                                Command Center
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 bg-[#00b36b] rounded-full animate-pulse shadow-[0_0_8px_#00b36b]"></span>
                                <p className="text-[#00b36b] text-xs font-bold uppercase tracking-widest">System Online</p>
                            </div>
                            <p className="text-gray-500 text-[10px] uppercase font-bold mt-1">
                                Welcome back, {adminProfile?.displayName || 'Admin'}
                            </p>
                        </div>
                    </div>


                </div>

                {/* Notifications */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl mb-4">
                        {error}
                        <button onClick={() => setError('')} className="float-right font-bold">×</button>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-xl mb-4">
                        {success}
                        <button onClick={() => setSuccess('')} className="float-right font-bold">×</button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto">
                    {(['dashboard', 'users', 'deposits', 'withdrawals', 'settings', 'content'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition whitespace-nowrap ${activeTab === tab
                                ? 'bg-[#f01a64] text-white shadow-lg'
                                : 'bg-[#1e222d] text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab === 'content' ? 'Traders' : tab}
                        </button>
                    ))}
                </div>

                {/* Content Management Tab */}
                {activeTab === 'content' && <AdminPanel />}

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                            <div className="text-gray-400 text-sm font-bold mb-2">Total Users</div>
                            <div className="text-4xl font-black text-white">{stats.totalUsers}</div>
                        </div>

                        <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                            <div className="text-gray-400 text-sm font-bold mb-2">Pending Withdrawals</div>
                            <div className="text-4xl font-black text-[#f01a64]">{stats.pendingWithdrawals}</div>
                        </div>

                        <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                            <div className="text-gray-400 text-sm font-bold mb-2">Total Withdrawals</div>
                            <div className="text-4xl font-black text-white">{stats.totalWithdrawals}</div>
                        </div>

                        <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                            <div className="text-gray-400 text-sm font-bold mb-2">Total Amount</div>
                            <div className="text-4xl font-black text-[#00b36b]">${stats.totalAmount.toFixed(2)}</div>
                        </div>

                        {/* Recent Pending Withdrawals */}
                        <div className="md:col-span-2 lg:col-span-4 bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                            <h3 className="text-xl font-black text-white mb-4">Pending Withdrawals</h3>
                            {pendingWithdrawals.length === 0 ? (
                                <p className="text-gray-500 text-center italic py-8">No pending withdrawals in queue</p>
                            ) : (
                                <div className="space-y-4">
                                    {pendingWithdrawals.slice(0, 5).map((withdrawal) => {
                                        // Find user context for Smart Card
                                        const userContext = users.find(u => u.uid === withdrawal.userId);
                                        const totalDeposited = (userContext?.balance || 0) + (userContext?.totalInvested || 0);
                                        const isHighRisk = withdrawal.amount > totalDeposited * 1.5;

                                        return (
                                            <div key={withdrawal.id} className={`bg-[#131722] p-6 rounded-2xl border ${isHighRisk ? 'border-red-500/30' : 'border-[#2a2e39]'} flex flex-col md:flex-row justify-between items-center gap-4 hover:border-[#f01a64]/30 transition-colors group`}>
                                                <div className="flex-1 w-full">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="text-white font-black uppercase text-sm tracking-wide flex items-center gap-2">
                                                                {withdrawal.userName}
                                                                {isHighRisk && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black">RISK</span>}
                                                            </div>
                                                            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{withdrawal.userEmail}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[#00b36b] font-black text-2xl">${withdrawal.amount}</div>
                                                            <div className="text-gray-600 text-[9px] uppercase font-bold">Requested Amount</div>
                                                        </div>
                                                    </div>

                                                    {/* Smart Context Stats */}
                                                    <div className="flex gap-4 mb-4 py-2 px-3 bg-black/20 rounded-lg border border-white/5">
                                                        <div>
                                                            <span className="text-[8px] text-gray-500 uppercase font-black block">Current Bal</span>
                                                            <span className="text-white text-xs font-bold">${userContext?.balance || 0}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[8px] text-gray-500 uppercase font-black block">Total Profit</span>
                                                            <span className="text-[#00b36b] text-xs font-bold">${userContext?.totalProfit || 0}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[8px] text-gray-500 uppercase font-black block">Network</span>
                                                            <span className="text-[#f01a64] text-xs font-bold uppercase">{withdrawal.network || 'TRC20'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-400 font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 truncate max-w-[200px] select-all">
                                                            {withdrawal.walletAddress}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(withdrawal.walletAddress);
                                                            }}
                                                            className="text-[10px] bg-[#f01a64]/10 text-[#f01a64] px-3 py-1.5 rounded-lg border border-[#f01a64]/20 hover:bg-[#f01a64] hover:text-white transition uppercase font-black"
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 w-full md:w-auto">
                                                    <button
                                                        onClick={() => handleApproveWithdrawal(withdrawal.id!)}
                                                        className="flex-1 md:flex-none px-6 py-3 bg-[#00b36b] hover:bg-[#009e5f] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('Rejection reason:');
                                                            if (reason) handleRejectWithdrawal(withdrawal.id!, withdrawal.userId, withdrawal.amount, reason);
                                                        }}
                                                        className="flex-1 md:flex-none px-6 py-3 bg-red-600/10 border border-red-600/30 hover:bg-red-600 text-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                        <h3 className="text-2xl font-black text-white mb-6">All Users</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#2a2e39]">
                                        <th className="text-left text-gray-400 font-bold py-3 px-4">Name</th>
                                        <th className="text-left text-gray-400 font-bold py-3 px-4">Email</th>
                                        <th className="text-left text-gray-400 font-bold py-3 px-4">Wallet</th>
                                        <th className="text-left text-gray-400 font-bold py-3 px-4">Balance</th>
                                        <th className="text-left text-gray-400 font-bold py-3 px-4">Withdrawals</th>
                                        <th className="text-left text-gray-400 font-bold py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.uid} className="border-b border-[#2a2e39]/50">
                                            <td className="py-3 px-4 text-white">{user.displayName}</td>
                                            <td className="py-3 px-4 text-gray-400">{user.email}</td>
                                            <td className="py-3 px-4 text-gray-400 text-xs">{user.walletAddress || 'Not set'}</td>
                                            <td className="py-3 px-4 text-[#00b36b] font-bold">${user.balance}</td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            setLoading(true);
                                                            await updateUserProfile(user.uid, { hasDeposited: !user.hasDeposited });
                                                            setSuccess(`Withdrawals ${!user.hasDeposited ? 'unlocked' : 'locked'} for ${user.displayName}`);
                                                            await loadData();
                                                        } catch (err: any) {
                                                            setError(err.message || 'Failed to update lock status');
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${user.hasDeposited
                                                        ? 'bg-[#00b36b]/10 text-[#00b36b] border border-[#00b36b]/20 hover:bg-[#00b36b] hover:text-white'
                                                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white'
                                                        }`}
                                                >
                                                    {user.hasDeposited ? 'Unlocked' : 'Locked'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Deposits Tab (New) */}
                {activeTab === 'deposits' && (
                    <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                        <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                            Pending Deposits
                            <span className="bg-[#f01a64] text-white text-xs px-2 py-1 rounded-lg">{pendingDeposits.length}</span>
                        </h3>

                        {pendingDeposits.length === 0 ? (
                            <p className="text-gray-500 text-center italic py-12">No pending deposits found.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {pendingDeposits.map((deposit) => (
                                    <div key={deposit.id} className="bg-[#131722] p-6 rounded-2xl border border-[#2a2e39] flex flex-col md:flex-row gap-6 hover:border-white/10 transition">
                                        {/* Proof Image */}
                                        <div className="w-full md:w-48 h-48 bg-black/40 rounded-xl overflow-hidden border border-white/5 relative group">
                                            <img
                                                src={deposit.proofUrl}
                                                alt="Proof"
                                                className="w-full h-full object-cover"
                                                onClick={() => window.open(deposit.proofUrl, '_blank')}
                                            />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer" onClick={() => window.open(deposit.proofUrl, '_blank')}>
                                                <span className="text-xs text-white uppercase font-bold">View Full</span>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-white font-black text-lg">{deposit.userName}</h4>
                                                    <p className="text-gray-500 text-xs font-bold uppercase">{deposit.userEmail}</p>
                                                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase border border-blue-500/20">
                                                        {deposit.network}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[#00b36b] font-black text-3xl">
                                                        ${deposit.amount > 0 ? deposit.amount : <span className="text-yellow-500 text-xl">Review</span>}
                                                    </div>
                                                    <p className="text-gray-600 text-[9px] uppercase font-bold">Declared Amount</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => {
                                                        const amount = prompt("Confirm Amount to Credit ($):", deposit.amount.toString());
                                                        if (amount) {
                                                            handleApproveDeposit({ ...deposit, amount: parseFloat(amount) });
                                                        }
                                                    }}
                                                    className="flex-1 px-6 py-3 bg-[#00b36b] hover:bg-[#009e5f] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition"
                                                >
                                                    Verify & Credit
                                                </button>
                                                <button
                                                    onClick={() => handleRejectDeposit(deposit.id!)}
                                                    className="px-6 py-3 bg-red-600/10 border border-red-600/30 hover:bg-red-600 text-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Withdrawals Tab */}
                {activeTab === 'withdrawals' && (
                    <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                        <h3 className="text-2xl font-black text-white mb-6">Withdrawal History</h3>
                        <div className="space-y-4">
                            {withdrawals.length === 0 ? (
                                <p className="text-gray-500 text-center italic py-12">No withdrawal history found.</p>
                            ) : (
                                withdrawals.map((withdrawal) => {
                                    const userContext = users.find(u => u.uid === withdrawal.userId);
                                    let displayDate = 'Unknown Date';
                                    try {
                                        if (withdrawal.requestedAt) {
                                            displayDate = withdrawal.requestedAt.toDate().toLocaleString();
                                        }
                                    } catch (e) {
                                        console.warn("Invalid timestamp for withdrawal:", withdrawal.id);
                                    }

                                    return (
                                        <div key={withdrawal.id} className="bg-[#131722] p-6 rounded-2xl border border-[#2a2e39] hover:border-white/10 transition-colors">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <div className="text-white font-black uppercase text-sm">{withdrawal.userName}</div>
                                                            <div className="text-gray-500 text-[10px] font-bold uppercase">{withdrawal.userEmail}</div>
                                                        </div>
                                                        <div className="text-right md:hidden">
                                                            <div className="text-[#00b36b] font-black text-xl">${withdrawal.amount}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 mt-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                                        <div>
                                                            <span className="text-[9px] text-gray-500 font-black uppercase block mb-1">Target Address ({withdrawal.network || 'TRC20'})</span>
                                                            <div className="flex items-center gap-2">
                                                                <code className="text-[10px] text-gray-300 bg-black/50 px-2 py-1 rounded border border-white/5 select-all">{withdrawal.walletAddress}</code>
                                                                <button
                                                                    onClick={() => navigator.clipboard.writeText(withdrawal.walletAddress)}
                                                                    className="text-gray-500 hover:text-white"
                                                                    title="Copy Address"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="w-px bg-white/10 self-stretch hidden sm:block"></div>
                                                        <div>
                                                            <span className="text-[9px] text-gray-500 font-black uppercase block mb-1">Time</span>
                                                            <span className="text-[10px] text-white font-medium">{displayDate}</span>
                                                        </div>
                                                        <div className="w-px bg-white/10 self-stretch hidden sm:block"></div>
                                                        <div>
                                                            <span className="text-[9px] text-gray-500 font-black uppercase block mb-1">Status</span>
                                                            <span className="text-[10px] text-white font-medium uppercase">{withdrawal.status}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="hidden md:block text-[#00b36b] font-black text-3xl">${withdrawal.amount}</div>
                                                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${withdrawal.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                        withdrawal.status === 'approved' ? 'bg-[#00b36b]/10 text-[#00b36b] border border-[#00b36b]/20' :
                                                            'bg-red-500/10 text-red-500 border border-red-500/20'
                                                        }`}>
                                                        {withdrawal.status}
                                                    </span>
                                                </div>
                                            </div>
                                            {withdrawal.notes && (
                                                <div className="mt-4 pt-3 border-t border-white/5 text-xs text-gray-400 italic">
                                                    <span className="text-red-500 font-bold not-italic mr-2">ADMIN NOTE:</span>
                                                    {withdrawal.notes}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && settings && (
                    <div className="bg-[#1e222d] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="bg-gradient-to-r from-[#1e222d] to-[#131722] p-8 border-b border-white/5">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Global Control Settings</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Manage Deposit Routes & Platform Fees</p>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Deposit Links Section */}
                            <section>
                                <h4 className="text-[#f01a64] text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="w-8 h-[2px] bg-[#f01a64]"></span> Deposit Gateway Routes
                                </h4>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group relative">
                                            <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">USDT TRC20 (Primary)</label>
                                            <input
                                                type="text"
                                                value={settings.trc20Address || ''}
                                                onChange={(e) => setSettings({ ...settings, trc20Address: e.target.value })}
                                                className="w-full px-6 py-4 bg-black/40 border border-[#2a2e39] rounded-2xl text-white font-mono text-sm focus:border-[#f01a64] transition outline-none group-focus-within:border-[#f01a64]"
                                                placeholder="T..."
                                            />
                                        </div>
                                        <div className="hidden lg:block absolute right-16 top-32 w-32 p-3 bg-white rounded-xl shadow-lg transform -rotate-2 border-4 border-white pointer-events-none">
                                            <div className="bg-black w-full h-24 mb-2 rounded-lg flex items-center justify-center text-[8px] text-white/50 overflow-hidden">
                                                [QR Code]
                                            </div>
                                            <div className="h-1.5 w-16 bg-gray-200 rounded-full mb-1"></div>
                                            <div className="h-1.5 w-10 bg-gray-200 rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">USDT ERC20 (Standard)</label>
                                            <input
                                                type="text"
                                                value={settings.erc20Address || ''}
                                                onChange={(e) => setSettings({ ...settings, erc20Address: e.target.value })}
                                                className="w-full px-6 py-4 bg-black/40 border border-[#2a2e39] rounded-2xl text-white font-mono text-sm focus:border-[#00b36b] transition outline-none"
                                                placeholder="0x..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">USDT BEP20 (Low Gas)</label>
                                            <input
                                                type="text"
                                                value={settings.bep20Address || ''}
                                                onChange={(e) => setSettings({ ...settings, bep20Address: e.target.value })}
                                                className="w-full px-6 py-4 bg-black/40 border border-[#2a2e39] rounded-2xl text-white font-mono text-sm focus:border-amber-500 transition outline-none"
                                                placeholder="0x..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                            {/* Financial Paramters */}
                            <section>
                                <h4 className="text-[#00b36b] text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="w-8 h-[2px] bg-[#00b36b]"></span> Financial Parameters
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Min Withdrawal ($)</label>
                                        <input
                                            type="number"
                                            value={settings.minWithdrawal}
                                            onChange={(e) => setSettings({ ...settings, minWithdrawal: parseFloat(e.target.value) })}
                                            className="w-full px-6 py-4 bg-black/40 border border-[#2a2e39] rounded-2xl text-white font-black text-lg focus:border-white/20 transition outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Max Withdrawal ($)</label>
                                        <input
                                            type="number"
                                            value={settings.maxWithdrawal}
                                            onChange={(e) => setSettings({ ...settings, maxWithdrawal: parseFloat(e.target.value) })}
                                            className="w-full px-6 py-4 bg-black/40 border border-[#2a2e39] rounded-2xl text-white font-black text-lg focus:border-white/20 transition outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Platform Fee (%)</label>
                                        <input
                                            type="number"
                                            value={settings.platformFee}
                                            onChange={(e) => setSettings({ ...settings, platformFee: parseFloat(e.target.value) })}
                                            className="w-full px-6 py-4 bg-black/40 border border-[#2a2e39] rounded-2xl text-white font-black text-lg focus:border-white/20 transition outline-none"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <button
                            onClick={() => handleUpdateSettings(settings)}
                            disabled={loading}
                            className="w-full py-4 bg-[#f01a64] hover:bg-[#d01555] text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>


                    </div>

                )}
            </div>
        </div >
    );
};

export default AdminDashboard;
