import React, { useState, useEffect } from 'react';
import { getFriendlyErrorMessage } from '../../utils/errorMapping';
import { Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { getUserProfile, UserData } from '../../services/userService';
import { createWithdrawal } from '../../services/withdrawalService';
import { getUserWithdrawals, Withdrawal } from '../../services/withdrawalService';
import { getSettings, PlatformSettings } from '../../services/settingsService';

import { useAuth } from '../../contexts/AuthContext';

const WithdrawalManager: React.FC = () => {
    const { currentUser } = useAuth();
    const user = currentUser!;
    const [userProfile, setUserProfile] = useState<UserData | null>(null);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [profile, userWithdrawals, platformSettings] = await Promise.all([
                getUserProfile(user.uid),
                getUserWithdrawals(user.uid),
                getSettings()
            ]);

            setUserProfile(profile);
            setWithdrawals(userWithdrawals);
            setSettings(platformSettings);
        } catch (err: any) {
            setError('Failed to load data');
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userProfile || !settings) return;

        const withdrawAmount = parseFloat(amount);

        // Validation
        if (withdrawAmount < settings.minWithdrawal) {
            setError(`Minimum withdrawal is $${settings.minWithdrawal}`);
            return;
        }

        if (withdrawAmount > settings.maxWithdrawal) {
            setError(`Maximum withdrawal is $${settings.maxWithdrawal}`);
            return;
        }

        if (withdrawAmount > userProfile.balance) {
            setError('Insufficient balance');
            return;
        }

        if (!userProfile.walletAddress) {
            setError('Please set your wallet address in profile first');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await createWithdrawal(
                user.uid,
                userProfile.email,
                userProfile.displayName,
                withdrawAmount,
                userProfile.walletAddress,
                'TRC20' // Default network
            );

            setSuccess('Withdrawal request submitted! Waiting for admin approval.');
            setAmount('');
            await loadData();
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39] mb-6">
                <h2 className="text-2xl font-black text-white mb-4">Your Balance</h2>
                <div className="text-5xl font-black text-[#00b36b]">
                    ${userProfile?.balance.toFixed(2) || '0.00'}
                </div>
                <div className="text-gray-400 mt-2">
                    Wallet: {userProfile?.walletAddress || 'Not set'}
                </div>
            </div>

            {/* Withdrawal Form */}
            <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39] mb-6">
                <h3 className="text-xl font-black text-white mb-4">Request Withdrawal</h3>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-xl mb-4 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Amount (USD)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white focus:border-[#f01a64] outline-none"
                            placeholder="Enter amount"
                            step="0.01"
                            min={settings?.minWithdrawal || 0}
                            max={settings?.maxWithdrawal || 10000}
                            required
                        />
                        {settings && (
                            <div className="text-gray-500 text-xs mt-1">
                                Min: ${settings.minWithdrawal} | Max: ${settings.maxWithdrawal}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !userProfile?.walletAddress}
                        className="w-full py-4 bg-[#f01a64] hover:bg-[#d01555] text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Request Withdrawal'}
                    </button>
                </form>
            </div>

            {/* Withdrawal History */}
            <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                <h3 className="text-xl font-black text-white mb-4">Withdrawal History</h3>

                {withdrawals.length === 0 ? (
                    <p className="text-gray-400">No withdrawal requests yet</p>
                ) : (
                    <div className="space-y-3">
                        {withdrawals.map((withdrawal) => (
                            <div key={withdrawal.id} className="bg-[#131722] p-4 rounded-xl border border-[#2a2e39]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-[#00b36b] font-bold text-lg">${withdrawal.amount}</div>
                                        <div className="text-gray-500 text-xs">
                                            {withdrawal.requestedAt instanceof Timestamp ? withdrawal.requestedAt.toDate().toLocaleString() : 'Just now'}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                        withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                            'bg-red-500/20 text-red-500'
                                        }`}>
                                        {withdrawal.status}
                                    </span>
                                </div>
                                {withdrawal.notes && (
                                    <div className="mt-2 text-gray-400 text-sm">
                                        Note: {withdrawal.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WithdrawalManager;
