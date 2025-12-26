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
    const [uploading, setUploading] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Initial Trader State
    const initialTraderState: Partial<FirebaseTrader> = {
        name: '', avatar: '', roi: 0, drawdown: 0, followers: 0, weeks: 0, strategy: '',
        type: 'Trader', experienceYears: 0, markets: [], riskScore: 5, winRate: 0,
        avgDuration: '', riskMethods: [], bio: '', category: 'crypto', copyTradeId: '', youtubeLink: '',
        totalProfit: 0, // New field,
        rank: 'Silver',
        country: 'USA',
        verificationStatus: 'Platform Verified Trader',
        performanceBadge: 'Consistent Winner',
        specialization: 'Crypto',
        socials: { instagram: '', telegram: '', twitter: '', youtube: '' }
    };
    const [traderForm, setTraderForm] = useState(initialTraderState);

    // Initial Strategy State
    const initialStrategyState: Partial<Strategy> = {
        name: '', tag: '', hook: '', duration: '', durationMs: 60000,
        minRet: 0, maxRet: 0, risk: 'Secure', minInvest: 100, vip: false, isActive: true, order: 1
    };
    const [strategyForm, setStrategyForm] = useState(initialStrategyState);

    useEffect(() => {
        // if (isAdmin) { // TEMPORARILY DISABLED
        loadData();
        // }
    }, [/* isAdmin, */ activeTab]);

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
            // Merge existing item with initial state to ensure all fields exist (especially new ones like socials)
            setTraderForm({
                ...initialTraderState,
                ...item,
                socials: {
                    ...initialTraderState.socials,
                    ...(item.socials || {})
                }
            });
        } else {
            setStrategyForm(item);
        }
        setShowForm(true);
    };

    // --- RENDER HELPERS ---

    if (authLoading) return <div className="min-h-screen bg-[#131722] flex items-center justify-center text-white">Loading Security...</div>;

    /* TEMPORARILY DISABLED
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
    */

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
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-1 items-center">
                                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 uppercase">{t.category}</span>
                                            <span className="text-[10px] bg-[#00b36b]/10 text-[#00b36b] px-2 py-0.5 rounded uppercase">ROI {t.roi}%</span>

                                            {/* Social Indicators */}
                                            <div className="flex gap-1 ml-2 border-l border-white/10 pl-2">
                                                {t.socials?.youtube && (
                                                    <a href={t.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-[#ff0000] hover:scale-110 transition-transform" title="YouTube Active">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                                    </a>
                                                )}
                                                {t.socials?.telegram && (
                                                    <span className="text-[#0088cc]" title="Telegram Active">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12.268 12.268 0 0 0-.62 0zM18.9 7.02l-2.086 10a1.8 1.8 0 0 1-1.385 1.258 2.052 2.052 0 0 1-1.632-.5l-4-3.056-1.916 1.916a.91.91 0 0 1-.225.13l.668-3.927 7.056-6.6a.555.555 0 0 0-.776-.78l-8.8 5.672-3.8-1.228A2.21 2.21 0 0 1 2.924 7.5a2.583 2.583 0 0 1 1.284-1.12l14.162-5.46a2.035 2.035 0 0 1 1.07.24 1.54 1.54 0 0 1 .53.86z" /></svg>
                                                    </span>
                                                )}
                                                {t.socials?.instagram && (
                                                    <span className="text-[#d62976]" title="Instagram Active">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.229-.149-4.771-1.664-4.919-4.919-.059-1.265-.069-1.644-.069-4.849 0-3.204.013-3.583.069-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                                    </span>
                                                )}
                                                {t.socials?.twitter && (
                                                    <span className="text-white" title="Twitter Active">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                                    </span>
                                                )}
                                            </div>
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
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Trader Avatar</label>
                                                <div className="bg-[#131722] p-4 rounded-xl border border-white/5 flex items-center gap-4">
                                                    {traderForm.avatar ? (
                                                        <>
                                                            <div className="relative group">
                                                                <img src={traderForm.avatar} className="w-16 h-16 rounded-xl object-cover border-2 border-[#f01a64]" />
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl cursor-pointer" onClick={() => window.open(traderForm.avatar, '_blank')}>
                                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-white text-sm font-bold mb-1">Image Uploaded</p>
                                                                <p className="text-gray-500 text-xs truncate max-w-[200px]">{traderForm.avatar}</p>
                                                            </div>
                                                            <button type="button" onClick={() => setTraderForm({ ...traderForm, avatar: '' })} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-500 transition">
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex-1 flex flex-col gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <label className={`flex-1 cursor-pointer bg-[#2a2e39] border border-dashed border-gray-600 hover:border-[#f01a64] hover:bg-[#323846] text-gray-400 hover:text-white px-4 py-8 rounded-xl font-bold transition flex flex-col items-center gap-2 text-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                                    {uploading ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#f01a64] border-t-transparent"></div>
                                                                            <span className="text-xs uppercase tracking-widest mt-2">Uploading Image...</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                            <span className="text-xs uppercase tracking-widest">Click to Upload Avatar</span>
                                                                            <span className="text-[9px] text-gray-600">Supports JPG, PNG, GIF (Max 5MB)</span>
                                                                        </>
                                                                    )}
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (!file) return;

                                                                            try {
                                                                                setUploading(true);
                                                                                setError('');
                                                                                const { uploadImage } = await import('../services/storageService');
                                                                                // Compress or resize logic could go here in future
                                                                                const url = await uploadImage(file, `traders/${Date.now()}_${file.name}`);
                                                                                setTraderForm(prev => ({ ...prev, avatar: url }));
                                                                                setSuccess('Image uploaded successfully!');
                                                                            } catch (err: any) {
                                                                                console.error(err);
                                                                                setError('Upload failed: ' + (err.code || err.message));
                                                                            } finally {
                                                                                setUploading(false);
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>
                                                            <div className="text-center">
                                                                <span className="text-[10px] text-gray-600 uppercase font-bold">- OR -</span>
                                                            </div>
                                                            <input
                                                                placeholder="Paste Image URL manually"
                                                                className="w-full bg-[#1e222d] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64] text-xs"
                                                                value={traderForm.avatar}
                                                                onChange={e => setTraderForm({ ...traderForm, avatar: e.target.value })}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
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
                                                <div className="flex flex-col">
                                                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Category</label>
                                                    <select
                                                        className="w-full bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-blue-500"
                                                        value={traderForm.category}
                                                        onChange={e => setTraderForm({ ...traderForm, category: e.target.value as any })}
                                                        required
                                                    >
                                                        <option value="crypto">Crypto</option>
                                                        <option value="forex">Forex</option>
                                                        <option value="gold">Gold</option>
                                                        <option value="binary">Binary</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* EXTENDED ATTRIBUTES */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Rank</label>
                                                    <select className="w-full bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={traderForm.rank} onChange={e => setTraderForm({ ...traderForm, rank: e.target.value })}>
                                                        <option value="🥇 Top 1 Trader">Top 1</option>
                                                        <option value="🥈 Top 3 Trader">Top 3</option>
                                                        <option value="Top 10 Trader">Top 10</option>
                                                        <option value="Elite Ranked Trader">Elite</option>
                                                        <option value="Silver">Silver</option>
                                                        <option value="Gold">Gold</option>
                                                        <option value="Platinum">Platinum</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Country</label>
                                                    <select className="w-full bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-[#f01a64]" value={traderForm.country} onChange={e => setTraderForm({ ...traderForm, country: e.target.value })}>
                                                        <option value="USA">USA</option>
                                                        <option value="UAE">UAE</option>
                                                        <option value="UK">UK</option>
                                                        <option value="India">India</option>
                                                        <option value="Pakistan">Pakistan</option>
                                                        <option value="Nigeria">Nigeria</option>
                                                        <option value="Australia">Australia</option>
                                                        <option value="Austria">Austria</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input placeholder="Verification Status" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-blue-500" value={traderForm.verificationStatus} onChange={e => setTraderForm({ ...traderForm, verificationStatus: e.target.value })} />
                                                <input placeholder="Performance Badge" className="bg-[#131722] border border-white/5 p-3 rounded-xl text-white outline-none focus:border-blue-500" value={traderForm.performanceBadge} onChange={e => setTraderForm({ ...traderForm, performanceBadge: e.target.value })} />
                                            </div>

                                            {/* SOCIALS WITH ICONS */}
                                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 mt-4">
                                                <label className="text-[10px] text-gray-500 uppercase font-black block mb-3">Social Media Links</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {/* Instagram */}
                                                    <div className="flex items-center bg-[#131722] border border-white/5 rounded-lg overflow-hidden focus-within:border-[#f01a64] transition">
                                                        <div className="bg-white/5 p-2 text-[#d62976]">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.229-.149-4.771-1.664-4.919-4.919-.059-1.265-.069-1.644-.069-4.849 0-3.204.013-3.583.069-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                                        </div>
                                                        <input placeholder="Instagram Profile URL" className="flex-1 bg-transparent p-2 text-white text-xs outline-none" value={traderForm.socials?.instagram || ''} onChange={e => setTraderForm({ ...traderForm, socials: { ...traderForm.socials, instagram: e.target.value } })} />
                                                    </div>

                                                    {/* Telegram */}
                                                    <div className="flex items-center bg-[#131722] border border-white/5 rounded-lg overflow-hidden focus-within:border-[#f01a64] transition">
                                                        <div className="bg-white/5 p-2 text-[#0088cc]">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12.268 12.268 0 0 0-.62 0zM18.9 7.02l-2.086 10a1.8 1.8 0 0 1-1.385 1.258 2.052 2.052 0 0 1-1.632-.5l-4-3.056-1.916 1.916a.91.91 0 0 1-.225.13l.668-3.927 7.056-6.6a.555.555 0 0 0-.776-.78l-8.8 5.672-3.8-1.228A2.21 2.21 0 0 1 2.924 7.5a2.583 2.583 0 0 1 1.284-1.12l14.162-5.46a2.035 2.035 0 0 1 1.07.24 1.54 1.54 0 0 1 .53.86z" /></svg>
                                                        </div>
                                                        <input placeholder="Telegram Channel/User URL" className="flex-1 bg-transparent p-2 text-white text-xs outline-none" value={traderForm.socials?.telegram || ''} onChange={e => setTraderForm({ ...traderForm, socials: { ...traderForm.socials, telegram: e.target.value } })} />
                                                    </div>

                                                    {/* Twitter */}
                                                    <div className="flex items-center bg-[#131722] border border-white/5 rounded-lg overflow-hidden focus-within:border-[#f01a64] transition">
                                                        <div className="bg-white/5 p-2 text-white">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                                        </div>
                                                        <input placeholder="X (Twitter) URL" className="flex-1 bg-transparent p-2 text-white text-xs outline-none" value={traderForm.socials?.twitter || ''} onChange={e => setTraderForm({ ...traderForm, socials: { ...traderForm.socials, twitter: e.target.value } })} />
                                                    </div>

                                                    {/* YouTube */}
                                                    <div className="flex items-center bg-[#131722] border border-white/5 rounded-lg overflow-hidden focus-within:border-[#f01a64] transition">
                                                        <div className="bg-white/5 p-2 text-[#ff0000]">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                                        </div>
                                                        <input placeholder="YouTube Channel URL" className="flex-1 bg-transparent p-2 text-white text-xs outline-none" value={traderForm.socials?.youtube || ''} onChange={e => setTraderForm({ ...traderForm, socials: { ...traderForm.socials, youtube: e.target.value } })} />
                                                    </div>
                                                </div>
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
