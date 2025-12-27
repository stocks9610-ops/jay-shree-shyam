
import React, { useState } from 'react';
import { addTrader, FirebaseTrader } from '../../services/firebaseService';

const CreateTrader: React.FC = () => {
    // ----------------------------------------------------------------------
    // 1. Initial State
    // ----------------------------------------------------------------------
    const initialTraderState: Omit<FirebaseTrader, 'id' | 'createdAt' | 'updatedAt'> = {
        name: '',
        avatar: '', // Manual URL input
        // Stats
        roi: 0,
        drawdown: 0,
        followers: 0,
        weeks: 0,
        totalProfit: 0,
        winRate: 0,
        // Meta
        strategy: '',
        type: 'Trader', // Default
        experienceYears: 0,
        markets: ['Crypto', 'Forex'], // Default
        riskScore: 5,
        avgDuration: '1 Day',
        riskMethods: ['Stop Loss', 'Take Profit'],
        bio: '',
        category: 'crypto', // Default
        copyTradeId: '',
        youtubeLink: '',
        rank: 'Silver',
        country: 'USA',
        verificationStatus: 'Platform Verified Trader',
        performanceBadge: 'Consistent Winner',
        specialization: 'Crypto',
        socials: {
            instagram: '',
            telegram: '',
            twitter: '',
            youtube: ''
        },
        usdtAddress: ''
    };

    const [form, setForm] = useState(initialTraderState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // ----------------------------------------------------------------------
    // 2. Handlers
    // ----------------------------------------------------------------------

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Basic Validation
        if (!form.name || !form.avatar || !form.copyTradeId) {
            setError('Please fill in Name, Avatar URL, and Copy Trade ID.');
            setLoading(false);
            return;
        }

        try {
            await addTrader(form);
            setSuccess(`Trader "${form.name}" created successfully!`);
            setForm(initialTraderState); // Reset form
        } catch (err: any) {
            console.error('Error creating trader:', err);
            setError('Failed to create trader. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialChange = (key: keyof typeof form.socials, value: string) => {
        setForm(prev => ({
            ...prev,
            socials: {
                ...prev.socials,
                [key]: value
            }
        }));
    };

    // ----------------------------------------------------------------------
    // 3. Render
    // ----------------------------------------------------------------------
    return (
        <div className="bg-[#1e222d] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#f01a64]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Trader Factory</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Assemble New Trading Logic</p>
                </div>
                <div className="w-10 h-10 bg-[#f01a64]/10 rounded-xl flex items-center justify-center text-[#f01a64]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-6 bg-[#00b36b]/10 border border-[#00b36b]/30 text-[#00b36b] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

                {/* --- Section 1: Identity & Visuals --- */}
                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-6">
                    <h3 className="text-[#f01a64] text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="w-6 h-[2px] bg-[#f01a64]"></span> Identity Matrix
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name & ID */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Trader Name</label>
                                <input
                                    className="w-full bg-[#131722] border border-white/5 p-4 rounded-xl text-white font-bold outline-none focus:border-[#f01a64] transition text-sm"
                                    placeholder="e.g. Alex Morgan"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Copy Trade ID</label>
                                <div className="flex items-center bg-[#131722] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#f01a64] transition">
                                    <span className="bg-white/5 p-4 text-gray-500 font-mono text-xs border-r border-white/5">ID-</span>
                                    <input
                                        className="flex-1 bg-transparent p-4 text-white font-mono text-sm outline-none"
                                        placeholder="88X-99"
                                        value={form.copyTradeId}
                                        onChange={e => setForm({ ...form, copyTradeId: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visual Avatar (Manual URL) */}
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Avatar Source URL</label>
                            <div className="bg-[#131722] p-4 rounded-xl border border-white/5 flex gap-4 items-start">
                                <div className="flex-1 space-y-2">
                                    <input
                                        className="w-full bg-[#1e222d] border border-white/5 p-3 rounded-lg text-xs text-gray-300 outline-none focus:border-[#f01a64] font-mono"
                                        placeholder="https://..."
                                        value={form.avatar}
                                        onChange={e => setForm({ ...form, avatar: e.target.value })}
                                    />
                                    <p className="text-[9px] text-gray-600 leading-relaxed">
                                        Paste a direct link to a square image (JPG/PNG).
                                        <br />Recommended: 400x400px.
                                    </p>
                                </div>
                                <div className="w-20 h-20 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                    {form.avatar ? (
                                        <img src={form.avatar} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    ) : (
                                        <span className="text-[8px] text-gray-600 uppercase text-center">No Preview</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Strategic Biography</label>
                        <textarea
                            rows={3}
                            className="w-full bg-[#131722] border border-white/5 p-4 rounded-xl text-gray-300 text-sm outline-none focus:border-[#f01a64] transition resize-none"
                            placeholder="Describe the trading style..."
                            value={form.bio}
                            onChange={e => setForm({ ...form, bio: e.target.value })}
                        />
                    </div>
                </div>

                {/* --- Section 2: Performance Metrics --- */}
                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-6">
                    <h3 className="text-[#00b36b] text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="w-6 h-[2px] bg-[#00b36b]"></span> Performance Core
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#131722] p-4 rounded-xl border border-white/5 hover:border-[#00b36b]/30 transition group">
                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1 group-focus-within:text-[#00b36b]">Win Rate %</label>
                            <input
                                type="number"
                                className="w-full bg-transparent text-xl font-black text-white outline-none"
                                value={form.winRate}
                                onChange={e => setForm({ ...form, winRate: Number(e.target.value) })}
                            />
                        </div>
                        <div className="bg-[#131722] p-4 rounded-xl border border-white/5 hover:border-[#00b36b]/30 transition group">
                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1 group-focus-within:text-[#00b36b]">Total ROI %</label>
                            <input
                                type="number"
                                className="w-full bg-transparent text-xl font-black text-white outline-none"
                                value={form.roi}
                                onChange={e => setForm({ ...form, roi: Number(e.target.value) })}
                            />
                        </div>
                        <div className="bg-[#131722] p-4 rounded-xl border border-white/5 hover:border-[#00b36b]/30 transition group">
                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1 group-focus-within:text-[#00b36b]">Profit ($)</label>
                            <input
                                type="number"
                                className="w-full bg-transparent text-xl font-black text-white outline-none"
                                value={form.totalProfit}
                                onChange={e => setForm({ ...form, totalProfit: Number(e.target.value) })}
                            />
                        </div>
                        <div className="bg-[#131722] p-4 rounded-xl border border-white/5 hover:border-[#00b36b]/30 transition group">
                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1 group-focus-within:text-[#00b36b]">Followers</label>
                            <input
                                type="number"
                                className="w-full bg-transparent text-xl font-black text-white outline-none"
                                value={form.followers}
                                onChange={e => setForm({ ...form, followers: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                {/* --- Section 3: Configuration & Socials --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Classification */}
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-blue-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                            <span className="w-6 h-[2px] bg-blue-500"></span> Classification
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Category</label>
                                <select
                                    className="w-full bg-[#131722] border border-white/5 p-3 rounded-lg text-white text-xs outline-none focus:border-blue-500"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value as any })}
                                >
                                    <option value="crypto">Crypto</option>
                                    <option value="forex">Forex</option>
                                    <option value="gold">Gold (Comm)</option>
                                    <option value="binary">Binary</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Country</label>
                                <select
                                    className="w-full bg-[#131722] border border-white/5 p-3 rounded-lg text-white text-xs outline-none focus:border-blue-500"
                                    value={form.country}
                                    onChange={e => setForm({ ...form, country: e.target.value })}
                                >
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                    <option value="UAE">UAE</option>
                                    <option value="India">India</option>
                                    <option value="Germany">Germany</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Rank Badge</label>
                                <input className="w-full bg-[#131722] border border-white/5 p-3 rounded-lg text-white text-xs outline-none" value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Strategy Name</label>
                                <input className="w-full bg-[#131722] border border-white/5 p-3 rounded-lg text-white text-xs outline-none" value={form.strategy} onChange={e => setForm({ ...form, strategy: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Social Uplink */}
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-purple-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                            <span className="w-6 h-[2px] bg-purple-500"></span> Social Uplink
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12.268 12.268 0 0 0-.62 0zM18.9 7.02l-2.086 10a1.8 1.8 0 0 1-1.385 1.258 2.052 2.052 0 0 1-1.632-.5l-4-3.056-1.916 1.916a.91.91 0 0 1-.225.13l.668-3.927 7.056-6.6a.555.555 0 0 0-.776-.78l-8.8 5.672-3.8-1.228A2.21 2.21 0 0 1 2.924 7.5a2.583 2.583 0 0 1 1.284-1.12l14.162-5.46a2.035 2.035 0 0 1 1.07.24 1.54 1.54 0 0 1 .53.86z" /></svg>
                                </div>
                                <input
                                    className="flex-1 bg-[#131722] border border-white/5 p-3 rounded-lg text-white text-xs outline-none focus:border-[#0088cc]"
                                    placeholder="Telegram Link"
                                    value={form.socials?.telegram || ''}
                                    onChange={e => handleSocialChange('telegram', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#d62976]/10 text-[#d62976] flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.229-.149-4.771-1.664-4.919-4.919-.059-1.265-.069-1.644-.069-4.849 0-3.204.013-3.583.069-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </div>
                                <input
                                    className="flex-1 bg-[#131722] border border-white/5 p-3 rounded-lg text-white text-xs outline-none focus:border-[#d62976]"
                                    placeholder="Instagram Link"
                                    value={form.socials?.instagram || ''}
                                    onChange={e => handleSocialChange('instagram', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex items-center justify-end gap-6">
                    <button
                        type="button"
                        onClick={() => setForm(initialTraderState)}
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase text-xs tracking-widest transition"
                    >
                        Reset Factory
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 bg-[#f01a64] hover:bg-[#d01555] text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(240,26,100,0.4)] hover:shadow-[0_0_30px_rgba(240,26,100,0.6)] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Compiling Logic...' : 'Initialize Trader'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CreateTrader;

