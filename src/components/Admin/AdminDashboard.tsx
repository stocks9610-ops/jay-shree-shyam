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
import { auth } from '../../firebase.config';

import AdminPanel from '../AdminPanel';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'withdrawals' | 'settings' | 'content'>('content');
    const [users, setUsers] = useState<UserData[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
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

    const currentUser = auth.currentUser;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, withdrawalsData, pendingData, settingsData, withdrawalStats] = await Promise.all([
                getAllUsers(),
                getAllWithdrawals(),
                getPendingWithdrawals(),
                getSettings(),
                getWithdrawalStats()
            ]);

            setUsers(usersData);
            setWithdrawals(withdrawalsData);
            setPendingWithdrawals(pendingData);
            setSettings(settingsData);
            setStats({
                totalUsers: usersData.length,
                totalWithdrawals: withdrawalStats.total,
                pendingWithdrawals: withdrawalStats.pending,
                totalAmount: withdrawalStats.totalAmount
            });
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

    const handleRejectWithdrawal = async (withdrawalId: string, reason: string) => {
        if (!currentUser) return;

        try {
            setLoading(true);
            await rejectWithdrawal(withdrawalId, currentUser.uid, reason);
            setSuccess('Withdrawal rejected');
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

    const handleSeedData = async () => {
        if (!confirm('This will upload initial trader data to Firebase. Continue?')) return;
        try {
            setLoading(true);
            const { migrateTraders } = await import('../../../scripts/migrateToFirebase');
            await migrateTraders();
            setSuccess('Data migrated successfully! Check Firestore.');
        } catch (err: any) {
            setError('Migration failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#131722] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Admin Dashboard</h1>
                        <p className="text-gray-400">Manage users, withdrawals, and platform settings</p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/create-trader'}
                        className="bg-[#f01a64] hover:bg-[#d01555] text-white px-6 py-3 rounded-xl font-black uppercase tracking-wider transition shadow-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add New Trader
                    </button>
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
                    {(['dashboard', 'users', 'withdrawals', 'settings', 'content'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition whitespace-nowrap ${activeTab === tab
                                ? 'bg-[#f01a64] text-white shadow-lg'
                                : 'bg-[#1e222d] text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab === 'content' ? 'Traders & Strategies' : tab}
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
                                <p className="text-gray-400">No pending withdrawals</p>
                            ) : (
                                <div className="space-y-4">
                                    {pendingWithdrawals.slice(0, 5).map((withdrawal) => (
                                        <div key={withdrawal.id} className="bg-[#131722] p-4 rounded-xl border border-[#2a2e39] flex justify-between items-center">
                                            <div>
                                                <div className="text-white font-bold">{withdrawal.userName}</div>
                                                <div className="text-gray-400 text-sm">{withdrawal.userEmail}</div>
                                                <div className="text-[#00b36b] font-bold mt-1">${withdrawal.amount}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] text-gray-500 font-mono bg-black/30 px-2 py-1 rounded truncate max-w-[150px]">
                                                        {withdrawal.walletAddress}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(withdrawal.walletAddress);
                                                            alert('Address copied!');
                                                        }}
                                                        className="text-[10px] text-[#f01a64] hover:text-white transition-colors uppercase font-black"
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveWithdrawal(withdrawal.id!)}
                                                    className="px-4 py-2 bg-[#00b36b] hover:bg-green-600 text-white rounded-xl font-bold text-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt('Rejection reason:');
                                                        if (reason) handleRejectWithdrawal(withdrawal.id!, reason);
                                                    }}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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

                {/* Withdrawals Tab */}
                {activeTab === 'withdrawals' && (
                    <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                        <h3 className="text-2xl font-black text-white mb-6">All Withdrawals</h3>
                        <div className="space-y-4">
                            {withdrawals.map((withdrawal) => (
                                <div key={withdrawal.id} className="bg-[#131722] p-4 rounded-xl border border-[#2a2e39]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-white font-bold">{withdrawal.userName}</div>
                                            <div className="text-gray-400 text-sm">{withdrawal.userEmail}</div>
                                            <div className="text-[#00b36b] font-bold mt-1">${withdrawal.amount}</div>
                                            <div className="text-gray-500 text-xs mt-1">
                                                {withdrawal.requestedAt.toDate().toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-2 mt-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                                <div className="flex-1">
                                                    <div className="text-[10px] text-gray-500 uppercase font-black mb-1">TRC20 Address</div>
                                                    <div className="text-xs text-white font-mono break-all">{withdrawal.walletAddress}</div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(withdrawal.walletAddress);
                                                        alert('Address copied!');
                                                    }}
                                                    className="bg-[#1e222d] hover:bg-[#2a2e39] text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-colors"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                                    'bg-red-500/20 text-red-500'
                                                }`}>
                                                {withdrawal.status}
                                            </span>
                                        </div>
                                    </div>
                                    {withdrawal.notes && (
                                        <div className="mt-2 text-gray-400 text-sm">Note: {withdrawal.notes}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && settings && (
                    <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                        <h3 className="text-2xl font-black text-white mb-6">Platform Settings</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-400 font-bold mb-2">USDT TRC20 Wallet Address</label>
                                <input
                                    type="text"
                                    value={settings.trc20Address || settings.adminWalletAddress || ''}
                                    onChange={(e) => setSettings({ ...settings, trc20Address: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white mb-4"
                                    placeholder="Enter TRC20 Address (Starts with T)"
                                />

                                <label className="block text-gray-400 font-bold mb-2">USDT ERC20 Wallet Address</label>
                                <input
                                    type="text"
                                    value={settings.erc20Address || ''}
                                    onChange={(e) => setSettings({ ...settings, erc20Address: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white mb-4"
                                    placeholder="Enter ERC20 Address (Starts with 0x)"
                                />

                                <label className="block text-gray-400 font-bold mb-2">USDT BEP20 Wallet Address</label>
                                <input
                                    type="text"
                                    value={settings.bep20Address || ''}
                                    onChange={(e) => setSettings({ ...settings, bep20Address: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                    placeholder="Enter BEP20 Address (Starts with 0x)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 font-bold mb-2">Min Withdrawal</label>
                                    <input
                                        type="number"
                                        value={settings.minWithdrawal}
                                        onChange={(e) => setSettings({ ...settings, minWithdrawal: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 font-bold mb-2">Max Withdrawal</label>
                                    <input
                                        type="number"
                                        value={settings.maxWithdrawal}
                                        onChange={(e) => setSettings({ ...settings, maxWithdrawal: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 font-bold mb-2">Platform Fee (%)</label>
                                <input
                                    type="number"
                                    value={settings.platformFee}
                                    onChange={(e) => setSettings({ ...settings, platformFee: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                />
                            </div>

                            <button
                                onClick={() => handleUpdateSettings(settings)}
                                disabled={loading}
                                className="w-full py-4 bg-[#f01a64] hover:bg-[#d01555] text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Settings'}
                            </button>

                            <div className="pt-8 border-t border-[#2a2e39] mt-8">
                                <h4 className="text-white font-bold mb-4">Database Tools</h4>
                                <button
                                    onClick={handleSeedData}
                                    disabled={loading}
                                    className="w-full py-3 bg-[#2a2e39] hover:bg-[#363c4e] text-gray-300 rounded-xl font-bold transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                    </svg>
                                    Seed/Reset Initial Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
