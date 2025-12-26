import React, { useState, useEffect } from 'react';
import { getAllTraders, addTrader, updateTrader, deleteTrader, FirebaseTrader } from '../services/firebaseService';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../contexts/AuthContext';
import { Strategy } from '../types';

const AdminPanel: React.FC = () => {
    const { userProfile, isAdmin, loading: authLoading } = useAuth();

    // State
    const [activeTab, setActiveTab] = useState<'traders' | 'strategies'>('traders');
    const [traders, setTraders] = useState<FirebaseTrader[]>([]);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Initial Trader State
    const initialTraderState: Partial<FirebaseTrader> = {
        name: '', avatar: '', roi: 0, drawdown: 0, followers: 0, weeks: 0, strategy: '',
        type: 'Trader', experienceYears: 0, markets: [], riskScore: 5, winRate: 0,
        avgDuration: '', riskMethods: [], bio: '', category: 'crypto', copyTradeId: '', youtubeLink: '',
        totalProfit: 0 // New field
    };
    const [traderForm, setTraderForm] = useState(initialTraderState);

    // Initial Strategy State
    const initialStrategyState: Partial<Strategy> = {
        name: '', tag: '', hook: '', duration: '', durationMs: 60000,
        minRet: 0, maxRet: 0, risk: 'Secure', minInvest: 100, vip: false, isActive: true, order: 1
    };
    const [strategyForm, setStrategyForm] = useState(initialStrategyState);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin, activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'traders') {
                const data = await getAllTraders();
                setTraders(data);
            } else {
                const snapshot = await getDocs(collection(db, 'strategies'));
                const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Strategy)).sort((a, b) => a.order - b.order);
                setStrategies(data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (activeTab === 'traders') {
                if (editingId) {
                    await updateTrader(editingId, traderForm);
                    setSuccess('Trader updated!');
                } else {
                    await addTrader(traderForm as any);
                    setSuccess('Trader added!');
                }
            } else {
                if (editingId) {
                    await updateDoc(doc(db, 'strategies', editingId), strategyForm);
                    setSuccess('Strategy updated!');
                } else {
                    await addDoc(collection(db, 'strategies'), strategyForm);
                    setSuccess('Strategy added!');
                }
            }
            setShowForm(false);
            setEditingId(null);
            setTraderForm(initialTraderState);
            setStrategyForm(initialStrategyState);
            await loadData();
        } catch (err) {
            console.error(err);
            setError('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        setLoading(true);
        try {
            if (activeTab === 'traders') {
                await deleteTrader(id);
            } else {
                await deleteDoc(doc(db, 'strategies', id));
            }
            await loadData();
            setSuccess('Deleted successfully');
        } catch (err) {
            setError('Delete failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        if (activeTab === 'traders') {
            setTraderForm(item);
        } else {
            setStrategyForm(item);
        }
        setShowForm(true);
    };

    // --- RENDER HELPERS ---

    if (authLoading) return <div className="min-h-screen bg-[#131722] flex items-center justify-center text-white">Loading Security...</div>;

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#131722] flex items-center justify-center p-4">
                <div className="bg-[#1e222d] p-8 rounded-3xl border border-red-500/30 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400 text-sm">You do not have administrative privileges.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#131722] p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Command Center</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                            Welcome, <span className="text-[#f01a64]">{userProfile?.displayName}</span>
                        </p>
                    </div>
                    <div className="flex bg-[#1e222d] p-1 rounded-xl border border-white/5">
                        <button onClick={() => setActiveTab('traders')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'traders' ? 'bg-[#f01a64] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Traders</button>
                        <button onClick={() => setActiveTab('strategies')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'strategies' ? 'bg-[#f01a64] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Strategies</button>
                    </div>
                </div>

                {/* Status Messages */}
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-bold">{error}</div>}
                {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm font-bold">{success}</div>}

                {/* Main Content */}
                <div className="bg-[#1e222d] rounded-[2.5rem] border border-white/5 p-6 md:p-8 min-h-[500px]">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-white uppercase italic">
                            {activeTab === 'traders' ? 'Active Traders Database' : 'Profit Strategy Logic'}
                        </h2>
                        <button onClick={() => { setShowForm(true); setEditingId(null); setTraderForm(initialTraderState); setStrategyForm(initialStrategyState); }} className="bg-[#00b36b] hover:bg-green-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-green-500/20">
                            + Add New
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-500 font-mono animate-pulse">SYNCING DATABASE...</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {/* TRADERS LIST */}
                            {activeTab === 'traders' && traders.map(t => (
                                <div key={t.id} className="flex flex-col md:flex-row items-center gap-6 bg-[#131722] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <img src={t.avatar} className="w-12 h-12 rounded-xl object-cover" />
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-white font-bold">{t.name}</h3>
                                        <div className="flex gap-2 justify-center md:justify-start mt-1">
                                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 uppercase">{t.category}</span>
                                            <span className="text-[10px] bg-[#00b36b]/10 text-[#00b36b] px-2 py-0.5 rounded uppercase">ROI {t.roi}%</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(t)} className="px-4 py-2 bg-blue-600/10 text-blue-500 rounded-lg text-xs font-bold uppercase hover:bg-blue-600 hover:text-white transition">Edit</button>
                                        <button onClick={() => handleDelete(t.id)} className="px-4 py-2 bg-red-600/10 text-red-500 rounded-lg text-xs font-bold uppercase hover:bg-red-600 hover:text-white transition">Delete</button>
                                    </div>
                                </div>
                            ))}

                            {/* STRATEGIES LIST */}
                            {activeTab === 'strategies' && strategies.map(s => (
                                <div key={s.id} className="flex flex-col md:flex-row items-center gap-6 bg-[#131722] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="w-12 h-12 bg-[#f01a64]/10 rounded-xl flex items-center justify-center text-[#f01a64] font-black text-xl">
                                        {s.order}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-white font-bold">{s.name}</h3>
                                        <div className="flex gap-2 justify-center md:justify-start mt-1">
                                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 uppercase">{s.duration}</span>
                                            <span className="text-[10px] bg-[#00b36b]/10 text-[#00b36b] px-2 py-0.5 rounded uppercase">{s.minRet}-{s.maxRet}%</span>
                                            {s.vip && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase">VIP</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(s)} className="px-4 py-2 bg-blue-600/10 text-blue-500 rounded-lg text-xs font-bold uppercase hover:bg-blue-600 hover:text-white transition">Edit</button>
                                        <button onClick={() => handleDelete(s.id!)} className="px-4 py-2 bg-red-600/10 text-red-500 rounded-lg text-xs font-bold uppercase hover:bg-red-600 hover:text-white transition">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e222d] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-white uppercase mb-6">{editingId ? 'Edit Item' : 'Create New'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab === 'traders' ? (
                                // Trader Form Fields
                                // Trader Form Fields
                                <div className="space-y-6">
                                    {/* Identity Section */}
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-4 text-[#f01a64]">Identity & Visuals</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2 flex gap-4 items-center">
                                                {traderForm.avatar && <img src={traderForm.avatar} className="w-16 h-16 rounded-xl object-cover border-2 border-[#f01a64]" />}
                                                <input placeholder="Avatar Image URL" className="flex-1 bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={traderForm.avatar} onChange={e => setTraderForm({ ...traderForm, avatar: e.target.value })} required />
                                            </div>
                                            <input placeholder="Trader Name" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={traderForm.name} onChange={e => setTraderForm({ ...traderForm, name: e.target.value })} required />
                                            <input placeholder="Copy Trade ID (e.g. CT-8899-X)" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={traderForm.copyTradeId} onChange={e => setTraderForm({ ...traderForm, copyTradeId: e.target.value })} required />
                                        </div>
                                    </div>

                                    {/* Performance Section */}
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-4 text-[#00b36b]">Performance Stats</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Total Profit ($)</label>
                                                <input type="number" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white outline-none focus:border-[#00b36b]" value={traderForm.totalProfit || 0} onChange={e => setTraderForm({ ...traderForm, totalProfit: Number(e.target.value) })} />
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Win Rate (%)</label>
                                                <input type="number" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white outline-none focus:border-[#00b36b]" value={traderForm.winRate} onChange={e => setTraderForm({ ...traderForm, winRate: Number(e.target.value) })} required />
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">ROI (%)</label>
                                                <input type="number" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white outline-none focus:border-[#00b36b]" value={traderForm.roi} onChange={e => setTraderForm({ ...traderForm, roi: Number(e.target.value) })} required />
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Followers</label>
                                                <input type="number" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white outline-none focus:border-[#00b36b]" value={traderForm.followers} onChange={e => setTraderForm({ ...traderForm, followers: Number(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Section */}
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-4 text-blue-500">Profile Details</h3>
                                        <div className="space-y-4">
                                            <textarea placeholder="Trader Bio / Description" rows={3} className="w-full bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-blue-500" value={traderForm.bio} onChange={e => setTraderForm({ ...traderForm, bio: e.target.value })} required />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input placeholder="Strategy Name" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-blue-500" value={traderForm.strategy} onChange={e => setTraderForm({ ...traderForm, strategy: e.target.value })} required />
                                                <input placeholder="Category (crypto, forex, gold, binary)" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-blue-500" value={traderForm.category} onChange={e => setTraderForm({ ...traderForm, category: e.target.value as any })} required />
                                                <input placeholder="YouTube Link (Optional)" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-blue-500 md:col-span-2" value={traderForm.youtubeLink} onChange={e => setTraderForm({ ...traderForm, youtubeLink: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Strategy Form Fields
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input placeholder="Plan Name" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={strategyForm.name} onChange={e => setStrategyForm({ ...strategyForm, name: e.target.value })} required />
                                    <input type="number" placeholder="Order (1, 2, 3...)" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={strategyForm.order} onChange={e => setStrategyForm({ ...strategyForm, order: Number(e.target.value) })} required />
                                    <input placeholder="Duration Display (e.g. 5 Mins)" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={strategyForm.duration} onChange={e => setStrategyForm({ ...strategyForm, duration: e.target.value })} required />
                                    <input type="number" placeholder="Duration MS (e.g. 300000)" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={strategyForm.durationMs} onChange={e => setStrategyForm({ ...strategyForm, durationMs: Number(e.target.value) })} required />
                                    <input type="number" placeholder="Min ROI" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={strategyForm.minRet} onChange={e => setStrategyForm({ ...strategyForm, minRet: Number(e.target.value) })} required />
                                    <input type="number" placeholder="Max ROI" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={strategyForm.maxRet} onChange={e => setStrategyForm({ ...strategyForm, maxRet: Number(e.target.value) })} required />
                                    <input type="number" placeholder="Min Invest" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={strategyForm.minInvest} onChange={e => setStrategyForm({ ...strategyForm, minInvest: Number(e.target.value) })} required />
                                    <div className="flex items-center gap-2 text-white">
                                        <input type="checkbox" checked={strategyForm.vip} onChange={e => setStrategyForm({ ...strategyForm, vip: e.target.checked })} />
                                        <span>VIP Only?</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold uppercase hover:bg-white/10">Cancel</button>
                                <button type="submit" className="flex-[2] py-4 bg-[#f01a64] text-white rounded-xl font-bold uppercase shadow-xl hover:bg-pink-600">{loading ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
