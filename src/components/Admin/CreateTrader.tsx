import React, { useState, useEffect, useCallback } from 'react';
import { addTrader, updateTrader, FirebaseTrader } from '../../services/firebaseService';
import { uploadImage } from '../../services/storageService';

interface CreateTraderProps {
    initialData?: FirebaseTrader | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const CreateTrader: React.FC<CreateTraderProps> = ({ initialData, onSuccess, onCancel }) => {
    // ----------------------------------------------------------------------
    // 1. Initial State
    // ----------------------------------------------------------------------
    const defaultState: Omit<FirebaseTrader, 'id' | 'createdAt' | 'updatedAt'> = {
        name: '',
        avatar: '',
        // Stats
        roi: 0,
        drawdown: 0,
        followers: 0,
        weeks: 0,
        totalProfit: 150000, // Default start
        winRate: 0,
        // Meta
        strategy: '',
        type: 'Trader',
        experienceYears: 0,
        markets: ['Crypto'],
        riskScore: 5,
        avgDuration: '1 Day',
        riskMethods: ['Stop Loss'],
        bio: '',
        category: 'crypto',
        copyTradeId: '',
        youtubeLink: '',
        rank: 'Silver',
        country: 'USA',
        verificationStatus: 'Platform Verified Trader',
        performanceBadge: 'Consistent Winner',
        specialization: 'Crypto',
        socials: { instagram: '', telegram: '', twitter: '', youtube: '' },
        usdtAddress: '',
        aum: '$0',
        isTrending: false
    };

    const [form, setForm] = useState(defaultState);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load initial data if editing
    useEffect(() => {
        if (initialData) {
            // Merge defaults to ensure no missing fields
            setForm({ ...defaultState, ...initialData });
        }
    }, [initialData]);

    // ----------------------------------------------------------------------
    // 2. Handlers
    // ----------------------------------------------------------------------

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size too large (max 5MB)');
            return;
        }

        setUploading(true);
        setError('');
        try {
            const url = await uploadImage(file, `traders/${Date.now()}_${file.name}`);
            setForm(prev => ({ ...prev, avatar: url }));
        } catch (err) {
            console.error(err);
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>, field: 'markets' | 'riskMethods') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val && !form[field]?.includes(val)) {
                setForm(prev => ({
                    ...prev,
                    [field]: [...(prev[field] || []), val]
                }));
                e.currentTarget.value = '';
            }
        }
    };

    const removeTag = (field: 'markets' | 'riskMethods', tagToRemove: string) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field]?.filter(t => t !== tagToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!form.name || !form.copyTradeId) {
            setError('Name and Copy Trade ID are required.');
            setLoading(false);
            return;
        }

        try {
            if (initialData && initialData.id) {
                await updateTrader(initialData.id, form);
                setSuccess('Trader updated successfully!');
            } else {
                await addTrader(form);
                setSuccess('Trader created successfully!');
            }

            setTimeout(() => {
                onSuccess();
            }, 1000);
        } catch (err: any) {
            console.error('Error saving trader:', err);
            setError('Failed to save trader.');
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------------------------
    // 3. Render
    // ----------------------------------------------------------------------
    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full max-h-[85vh]">

            {/* LEFT: Live Preview (Sticky) */}
            <div className="hidden lg:block w-1/3 min-w-[320px] sticky top-0 h-full overflow-y-auto pr-2">
                <div className="bg-[#1e222d] rounded-[2.5rem] p-6 border border-[#2a2e39] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>

                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-5 relative z-10">
                        <div className="relative mb-4">
                            {form.avatar ? (
                                <img src={form.avatar} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white/5 shadow-2xl" />
                            ) : (
                                <div className="w-24 h-24 rounded-3xl bg-black/20 flex items-center justify-center text-gray-600 font-bold uppercase text-[10px]">No Avatar</div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00b36b] border-4 border-[#1e222d] rounded-full"></div>
                        </div>
                        <h3 className="text-white font-black text-xl mb-1">{form.name || 'Trader Name'}</h3>
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] block mb-2">{form.copyTradeId || 'ID-XXX'}</span>
                        <div className="flex gap-2 justify-center">
                            <span className="text-[9px] bg-[#f01a64]/10 text-[#f01a64] px-2 py-0.5 rounded font-black uppercase tracking-widest">{form.type}</span>
                            {form.isTrending && <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-black uppercase tracking-widest">Trending</span>}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-[#131722] p-5 rounded-3xl mb-5 border border-[#2a2e39] relative z-10">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Total Profits</span>
                            <span className="text-[9px] text-[#00b36b] font-black uppercase tracking-widest animate-pulse">Live</span>
                        </div>
                        <div className="text-3xl font-black text-white tracking-tighter">
                            ${(form.totalProfit || 0).toLocaleString()}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-6 relative z-10">
                        <div className="bg-[#131722] p-3 rounded-2xl border border-[#2a2e39] text-center">
                            <span className="text-[8px] text-gray-500 uppercase font-black block mb-1">ROI</span>
                            <span className="text-[#00b36b] font-black text-sm">+{form.roi}%</span>
                        </div>
                        <div className="bg-[#131722] p-3 rounded-2xl border border-[#2a2e39] text-center">
                            <span className="text-[8px] text-gray-500 uppercase font-black block mb-1">Win Rate</span>
                            <span className="text-[#00b36b] font-black text-sm">{form.winRate}%</span>
                        </div>
                        <div className="bg-[#131722] p-3 rounded-2xl border border-[#2a2e39] text-center">
                            <span className="text-[8px] text-gray-500 uppercase font-black block mb-1">AUM</span>
                            <span className="text-blue-500 font-black text-sm">{form.aum || '$0'}</span>
                        </div>
                    </div>
                </div>
                <p className="text-center text-gray-500 text-[10px] uppercase font-bold mt-4 animate-pulse">Live Preview</p>
            </div>

            {/* RIGHT: Studio Form (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic">Trader Studio</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Design & Configure</p>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase text-xs transition">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={loading || uploading} className="px-6 py-2 bg-[#f01a64] hover:bg-[#d01555] text-white rounded-xl font-bold uppercase text-xs shadow-lg transition disabled:opacity-50">
                            {loading ? 'Saving...' : initialData ? 'Update Profile' : 'Publish Trader'}
                        </button>
                    </div>
                </div>

                {error && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-bold">{error}</div>}

                <form className="space-y-6">
                    {/* SECTION 1: IDENTITY */}
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-[#f01a64] text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            I. Identity Matrix
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 flex gap-4">
                                {/* Image Upload */}
                                <div className="shrink-0 bg-[#131722] w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative hover:border-[#f01a64] transition cursor-pointer overflow-hidden group">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    {uploading ? (
                                        <div className="animate-spin w-6 h-6 border-2 border-[#f01a64] border-t-transparent rounded-full"></div>
                                    ) : form.avatar ? (
                                        <img src={form.avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 text-gray-600 mb-1 group-hover:text-[#f01a64]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            <span className="text-[8px] text-gray-500 font-bold uppercase">Upload</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <input className="w-full bg-[#131722] border border-white/5 p-3 rounded-xl text-white font-bold text-sm outline-none focus:border-[#f01a64]" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                    <div className="flex gap-4">
                                        <input className="flex-1 bg-[#131722] border border-white/5 p-3 rounded-xl text-white font-mono text-xs outline-none focus:border-[#f01a64]" placeholder="Copy Trade ID (CT-XXX)" value={form.copyTradeId} onChange={e => setForm({ ...form, copyTradeId: e.target.value })} />
                                        <div className="flex items-center gap-2 px-4 bg-[#131722] rounded-xl border border-white/5">
                                            <label className="text-[10px] text-gray-500 uppercase font-bold whitespace-nowrap">Trending?</label>
                                            <input type="checkbox" checked={form.isTrending || false} onChange={e => setForm({ ...form, isTrending: e.target.checked })} className="accent-[#f01a64]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <textarea rows={3} className="md:col-span-2 bg-[#131722] border border-white/5 p-3 rounded-xl text-gray-300 text-xs outline-none focus:border-[#f01a64] resize-none" placeholder="Strategic Bio / Description" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                        </div>
                    </div>

                    {/* SECTION 2: METRICS */}
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-[#00b36b] text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            II. Performance Core
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Total Profit ($)</label>
                                <input type="number" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white font-mono text-sm outline-none focus:border-[#00b36b]" value={form.totalProfit} onChange={e => setForm({ ...form, totalProfit: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Win Rate (%)</label>
                                <input type="number" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white font-mono text-sm outline-none focus:border-[#00b36b]" value={form.winRate} onChange={e => setForm({ ...form, winRate: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">ROI (%)</label>
                                <input type="number" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white font-mono text-sm outline-none focus:border-[#00b36b]" value={form.roi} onChange={e => setForm({ ...form, roi: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Drawdown (%)</label>
                                <input type="number" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white font-mono text-sm outline-none focus:border-[#00b36b]" value={form.drawdown} onChange={e => setForm({ ...form, drawdown: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">AUM (Display)</label>
                                <input className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white font-mono text-sm outline-none focus:border-[#00b36b]" placeholder="$12.5M" value={form.aum} onChange={e => setForm({ ...form, aum: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Followers</label>
                                <input type="number" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white font-mono text-sm outline-none focus:border-[#00b36b]" value={form.followers} onChange={e => setForm({ ...form, followers: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Weeks Active</label>
                                <input type="number" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white font-mono text-sm outline-none focus:border-[#00b36b]" value={form.weeks} onChange={e => setForm({ ...form, weeks: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Risk Score (1-10)</label>
                                <input type="number" max="10" className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white font-mono text-sm outline-none focus:border-[#00b36b]" value={form.riskScore} onChange={e => setForm({ ...form, riskScore: Number(e.target.value) })} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: STRATEGY & TAGS */}
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-blue-500 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            III. Strategic Configuration
                        </h3>
                        <div className="space-y-4">
                            <input className="w-full bg-[#131722] border border-white/5 p-3 rounded-xl text-white text-xs outline-none focus:border-blue-500" placeholder="Strategy Name (e.g. High-Freq Scalp)" value={form.strategy} onChange={e => setForm({ ...form, strategy: e.target.value })} />

                            {/* Markets Tags */}
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Active Markets (Type and hit Enter)</label>
                                <div className="flex flex-wrap gap-2 bg-[#131722] border border-white/5 p-2 rounded-xl focus-within:border-blue-500 transition">
                                    {form.markets?.map(tag => (
                                        <span key={tag} className="bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                            {tag}
                                            <button type="button" onClick={() => removeTag('markets', tag)} className="hover:text-white">×</button>
                                        </span>
                                    ))}
                                    <input onKeyDown={(e) => handleTagInput(e, 'markets')} className="bg-transparent outline-none text-white text-xs min-w-[100px] flex-1" placeholder="Add market..." />
                                </div>
                            </div>

                            {/* Risk Methods Tags */}
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Risk Methods (Type and hit Enter)</label>
                                <div className="flex flex-wrap gap-2 bg-[#131722] border border-white/5 p-2 rounded-xl focus-within:border-blue-500 transition">
                                    {form.riskMethods?.map(tag => (
                                        <span key={tag} className="bg-purple-500/10 text-purple-400 text-[10px] uppercase font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                            {tag}
                                            <button type="button" onClick={() => removeTag('riskMethods', tag)} className="hover:text-white">×</button>
                                        </span>
                                    ))}
                                    <input onKeyDown={(e) => handleTagInput(e, 'riskMethods')} className="bg-transparent outline-none text-white text-xs min-w-[100px] flex-1" placeholder="Add method..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Type</label>
                                    <select className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white text-xs outline-none focus:border-blue-500" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}>
                                        <option value="Trader">Trader</option>
                                        <option value="Educator">Educator</option>
                                        <option value="Analyst">Analyst</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Avg Duration</label>
                                    <input className="w-full bg-[#131722] border border-white/5 p-2 rounded-lg text-white text-xs outline-none focus:border-blue-500" value={form.avgDuration} onChange={e => setForm({ ...form, avgDuration: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: NETWORK & SOCIALS */}
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-purple-500 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            IV. Connectivity
                        </h3>
                        <div className="space-y-4">
                            <input className="w-full bg-[#131722] border border-white/5 p-3 rounded-xl text-white text-xs outline-none focus:border-purple-500 font-mono" placeholder="USDT TRC20 Address" value={form.usdtAddress} onChange={e => setForm({ ...form, usdtAddress: e.target.value })} />
                            <input className="w-full bg-[#131722] border border-white/5 p-3 rounded-xl text-white text-xs outline-none focus:border-purple-500" placeholder="YouTube Link" value={form.socials?.youtube} onChange={e => setForm({ ...form, socials: { ...form.socials, youtube: e.target.value } })} />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTrader;
