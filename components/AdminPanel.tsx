import React, { useState, useEffect } from 'react';
import { getAllTraders, addTrader, updateTrader, deleteTrader, FirebaseTrader } from '../services/firebaseService';

const AdminPanel: React.FC = () => {
    const [traders, setTraders] = useState<FirebaseTrader[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingTrader, setEditingTrader] = useState<FirebaseTrader | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Simple password protection (replace with proper auth in production)
    const ADMIN_PASSWORD = 'admin123'; // Change this!

    const [formData, setFormData] = useState<Partial<FirebaseTrader>>({
        name: '',
        avatar: '',
        roi: 0,
        drawdown: 0,
        followers: 0,
        weeks: 0,
        strategy: '',
        type: 'Trader',
        experienceYears: 0,
        markets: [],
        riskScore: 5,
        winRate: 0,
        avgDuration: '',
        riskMethods: [],
        bio: '',
        category: 'crypto',
        copyTradeId: '',
        youtubeLink: ''
    });

    useEffect(() => {
        if (isAuthenticated) {
            loadTraders();
        }
    }, [isAuthenticated]);

    const loadTraders = async () => {
        try {
            setLoading(true);
            const data = await getAllTraders();
            setTraders(data);
        } catch (err) {
            setError('Failed to load traders');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid password');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (editingTrader) {
                await updateTrader(editingTrader.id, formData);
                setSuccess('Trader updated successfully!');
            } else {
                await addTrader(formData as Omit<FirebaseTrader, 'id' | 'createdAt' | 'updatedAt'>);
                setSuccess('Trader added successfully!');
            }
            resetForm();
            await loadTraders();
        } catch (err) {
            setError('Failed to save trader');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (traderId: string) => {
        if (!confirm('Are you sure you want to delete this trader?')) return;

        try {
            setLoading(true);
            await deleteTrader(traderId);
            setSuccess('Trader deleted successfully!');
            await loadTraders();
        } catch (err) {
            setError('Failed to delete trader');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (trader: FirebaseTrader) => {
        setEditingTrader(trader);
        setFormData(trader);
        setShowAddForm(true);
    };

    const resetForm = () => {
        setEditingTrader(null);
        setShowAddForm(false);
        setFormData({
            name: '',
            avatar: '',
            roi: 0,
            drawdown: 0,
            followers: 0,
            weeks: 0,
            strategy: '',
            type: 'Trader',
            experienceYears: 0,
            markets: [],
            riskScore: 5,
            winRate: 0,
            avgDuration: '',
            riskMethods: [],
            bio: '',
            category: 'crypto',
            copyTradeId: '',
            youtubeLink: ''
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#131722] flex items-center justify-center p-4">
                <div className="bg-[#1e222d] p-8 rounded-3xl border border-[#2a2e39] max-w-md w-full">
                    <h1 className="text-3xl font-black text-white mb-6 text-center">Admin Panel</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white focus:border-[#f01a64] outline-none"
                                placeholder="Enter admin password"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 bg-[#f01a64] hover:bg-[#d01555] text-white rounded-xl font-black uppercase tracking-wider transition"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#131722] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-black text-white">Trader Management</h1>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-6 py-3 bg-[#00b36b] hover:bg-green-600 text-white rounded-xl font-black uppercase tracking-wider transition"
                    >
                        {showAddForm ? 'Cancel' : 'Add Trader'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-xl mb-4">
                        {success}
                    </div>
                )}

                {showAddForm && (
                    <div className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39] mb-8">
                        <h2 className="text-2xl font-black text-white mb-6">
                            {editingTrader ? 'Edit Trader' : 'Add New Trader'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Avatar URL</label>
                                <input
                                    type="url"
                                    value={formData.avatar}
                                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                >
                                    <option value="crypto">Crypto</option>
                                    <option value="binary">Binary</option>
                                    <option value="gold">Gold</option>
                                    <option value="forex">Forex</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                >
                                    <option value="Trader">Trader</option>
                                    <option value="Analyst">Analyst</option>
                                    <option value="Educator">Educator</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">ROI (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.roi}
                                    onChange={(e) => setFormData({ ...formData, roi: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Win Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.winRate}
                                    onChange={(e) => setFormData({ ...formData, winRate: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Copy Trade ID</label>
                                <input
                                    type="text"
                                    value={formData.copyTradeId}
                                    onChange={(e) => setFormData({ ...formData, copyTradeId: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">YouTube Link (Optional)</label>
                                <input
                                    type="url"
                                    value={formData.youtubeLink}
                                    onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm font-bold mb-2">Strategy</label>
                                <input
                                    type="text"
                                    value={formData.strategy}
                                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-xl text-white"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm font-bold mb-2">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-xl text-white h-24"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-[#f01a64] hover:bg-[#d01555] text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingTrader ? 'Update Trader' : 'Add Trader'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {traders.map((trader) => (
                        <div key={trader.id} className="bg-[#1e222d] p-6 rounded-3xl border border-[#2a2e39]">
                            <div className="flex items-start gap-4 mb-4">
                                <img src={trader.avatar} alt={trader.name} className="w-16 h-16 rounded-2xl object-cover" />
                                <div className="flex-1">
                                    <h3 className="text-white font-black text-lg">{trader.name}</h3>
                                    <p className="text-gray-400 text-sm">{trader.copyTradeId}</p>
                                    <span className="inline-block mt-1 text-xs bg-[#f01a64]/10 text-[#f01a64] px-2 py-1 rounded">
                                        {trader.category}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                                <div>
                                    <span className="text-gray-500">ROI:</span>
                                    <span className="text-green-500 font-bold ml-1">+{trader.roi}%</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Win Rate:</span>
                                    <span className="text-green-500 font-bold ml-1">{trader.winRate}%</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(trader)}
                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(trader.id)}
                                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {traders.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No traders found. Add your first trader!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
