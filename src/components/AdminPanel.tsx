import React, { useState, useEffect } from 'react';
import { getAllTraders, deleteTrader, FirebaseTrader } from '../services/traderService';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../contexts/AuthContext';
import { Strategy } from '../types';
import CreateTrader from './Admin/CreateTrader';

const AdminPanel: React.FC = () => {
    const { isAdmin, loading: authLoading } = useAuth();

    // State
    const [activeTab, setActiveTab] = useState<'traders' | 'strategies'>('traders');
    const [traders, setTraders] = useState<FirebaseTrader[]>([]);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal State
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

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

    const handleStrategySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingItem && editingItem.id) {
                await updateDoc(doc(db, 'strategies', editingItem.id), strategyForm);
                setSuccess('Strategy updated!');
            } else {
                await addDoc(collection(db, 'strategies'), strategyForm);
                setSuccess('Strategy added!');
            }
            setShowForm(false);
            setEditingItem(null);
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
        setEditingItem(item);
        if (activeTab === 'strategies') {
            setStrategyForm(item);
        }
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        if (activeTab === 'strategies') {
            setStrategyForm(initialStrategyState);
        }
        setShowForm(true);
    };

    return (
        <div className="space-y-8">

            {/* Internal Tabs */}
            <div className="flex bg-[#1e222d] p-1 rounded-xl border border-white/5 w-fit">
                <button onClick={() => setActiveTab('traders')} className={`px-4 md:px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'traders' ? 'bg-[#f01a64] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Traders</button>
                <button onClick={() => setActiveTab('strategies')} className={`px-4 md:px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'strategies' ? 'bg-[#f01a64] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Strategies</button>
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
                    <button onClick={handleAddNew} className="bg-[#00b36b] hover:bg-green-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-green-500/20">
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
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-1 items-center">
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

            {showForm && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e222d] w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-3xl border border-white/10 p-1 shadow-2xl">
                        {activeTab === 'traders' ? (
                            <CreateTrader
                                initialData={editingItem}
                                onSuccess={() => { setShowForm(false); loadData(); }}
                                onCancel={() => setShowForm(false)}
                            />
                        ) : (
                            <div className="p-8">
                                <h2 className="text-2xl font-black text-white uppercase mb-6">{editingItem ? 'Edit Strategy' : 'New Strategy'}</h2>
                                <form onSubmit={handleStrategySubmit} className="space-y-4">
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
                                    <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold uppercase hover:bg-white/10">Cancel</button>
                                        <button type="submit" className="flex-[2] py-4 bg-[#f01a64] text-white rounded-xl font-bold uppercase shadow-xl hover:bg-pink-600">{loading ? 'Saving...' : 'Save Changes'}</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
