
import React, { useState, useCallback } from 'react';
import { db } from '../../firebase.config';
import { collection, addDoc } from 'firebase/firestore';

const CreateTrader: React.FC = () => {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [winRate, setWinRate] = useState(95);
    const [profitShare, setProfitShare] = useState(20);
    const [specialization, setSpecialization] = useState('Crypto');
    const [rank, setRank] = useState('Silver');
    const [country, setCountry] = useState('USA');
    const [verificationStatus, setVerificationStatus] = useState('Platform Verified Trader');
    const [performanceBadge, setPerformanceBadge] = useState('Consistent Winner');
    const [socials, setSocials] = useState({ instagram: '', telegram: '', twitter: '', youtube: '' });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>(''); // For now, we store Base64 or URL
    const [isDragging, setIsDragging] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        // Convert to Base64 for simplicity in this demo (Ideal: Upload to Storage)
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setImagePreview(base64String);
            setImageUrl(base64String);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!name || !imageUrl) return;
        setIsSaving(true);
        setSaveStatus('idle');

        try {
            await addDoc(collection(db, 'traders'), {
                name,
                bio: bio || `Expert trader specializing in high-frequency algorithmic scalping. Consistent ${winRate}% win rate.`,
                imageUrl,
                winRate,
                profitShare,
                pnl: Math.floor(Math.random() * 5000) + 2000, // Random starting PnL
                followers: Math.floor(Math.random() * 1000) + 100, // Random start
                rank,
                country,
                verificationStatus,
                performanceBadge,
                socials,
                minCapital: 100,
                totalCopied: Math.floor(Math.random() * 500000) + 50000
            });

            setSaveStatus('success');
            // Reset form
            setName('');
            setBio('');
            setImagePreview(null);
            setImageUrl('');
        } catch (err) {
            console.error(err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white uppercase italic">Trader Factory</h2>
                <p className="text-gray-400 text-sm">Drag & Drop to recruit a new expert.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Side */}
                <div className="space-y-6">
                    <div
                        className={`border-4 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-[#f01a64] bg-[#f01a64]/10' : 'border-white/10 hover:border-white/20'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('trader-image-input')?.click()}
                    >
                        <input
                            type="file"
                            id="trader-image-input"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-xl" />
                        ) : (
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <p className="text-gray-400 font-bold uppercase text-xs">Drop Profile Pic Here</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Trader Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-[#1e222d] border border-white/5 p-4 rounded-xl text-white font-bold outline-none focus:border-[#f01a64]"
                                placeholder="e.g. Alex Quant"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Win Rate (%)</label>
                                <input
                                    type="range"
                                    min="50"
                                    max="100"
                                    value={winRate}
                                    onChange={e => setWinRate(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#f01a64]"
                                />
                                <div className="text-right text-[#00b36b] font-black">{winRate}%</div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Profit Share (%)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={profitShare}
                                    onChange={e => setProfitShare(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#f01a64]"
                                />
                                <div className="text-right text-white font-black">{profitShare}%</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Specialization</label>
                            <select
                                value={specialization}
                                onChange={e => setSpecialization(e.target.value)}
                                className="w-full bg-[#1e222d] border border-white/5 p-4 rounded-xl text-white font-bold outline-none focus:border-[#f01a64] appearance-none"
                            >
                                <option value="Crypto">Crypto</option>
                                <option value="Forex">Forex</option>
                                <option value="Gold">Gold</option>
                                <option value="Binary">Binary</option>
                                <option value="Commodity">Commodity</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Rank / Badge</label>
                            <select
                                value={rank}
                                onChange={e => setRank(e.target.value)}
                                className="w-full bg-[#1e222d] border border-white/5 p-4 rounded-xl text-white font-bold outline-none focus:border-[#f01a64] appearance-none"
                            >
                                <option value="🥇 Top 1 Trader">🥇 Top 1 Trader</option>
                                <option value="🥈 Top 3 Trader">🥈 Top 3 Trader</option>
                                <option value="Top 5 Trader">Top 5 Trader</option>
                                <option value="Top 10 Trader">Top 10 Trader</option>
                                <option value="Elite Ranked Trader">Elite Ranked Trader</option>
                                <option value="Silver">Silver</option>
                                <option value="Gold">Gold</option>
                                <option value="Platinum">Platinum</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Country</label>
                            <select
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                className="w-full bg-[#1e222d] border border-white/5 p-4 rounded-xl text-white font-bold outline-none focus:border-[#f01a64] appearance-none"
                            >
                                <option value="USA">🇺🇸 USA</option>
                                <option value="Pakistan">🇵🇰 Pakistan</option>
                                <option value="UAE">🇦🇪 UAE</option>
                                <option value="Nigeria">🇳🇬 Nigeria</option>
                                <option value="UK">🇬🇧 UK</option>
                                <option value="Austria">🇦🇹 Austria</option>
                                <option value="Australia">🇦🇺 Australia</option>
                                <option value="India">🇮🇳 India</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Verification Badge</label>
                            <select
                                value={verificationStatus}
                                onChange={e => setVerificationStatus(e.target.value)}
                                className="w-full bg-[#1e222d] border border-white/5 p-4 rounded-xl text-white font-bold outline-none focus:border-[#f01a64] appearance-none"
                            >
                                <option value="Platform Verified Trader">🛡️ Platform Verified Trader</option>
                                <option value="KYC Verified Trader">🛡️ KYC Verified Trader</option>
                                <option value="Identity Verified Trader">🛡️ Identity Verified Trader</option>
                                <option value="Admin Approved Trader">🛡️ Admin Approved Trader</option>
                                <option value="Trade History Verified">🛡️ Trade History Verified</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Performance Badge</label>
                            <select
                                value={performanceBadge}
                                onChange={e => setPerformanceBadge(e.target.value)}
                                className="w-full bg-[#1e222d] border border-white/5 p-4 rounded-xl text-white font-bold outline-none focus:border-[#f01a64] appearance-none"
                            >
                                <option value="100% Win Rate (Short-Term)">📈 100% Win Rate</option>
                                <option value="95%+ Win Rate">📈 95%+ Win Rate</option>
                                <option value="Consistent Winner">📈 Consistent Winner</option>
                                <option value="Risk Control Master">📈 Risk Control Master</option>
                                <option value="Low Drawdown Trader">📈 Low Drawdown Trader</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Bio (Optional)</label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="w-full bg-[#1e222d] border border-white/5 p-4 rounded-xl text-white outline-none focus:border-[#f01a64] h-24 text-sm"
                                placeholder="Leave empty for auto-generated AI bio..."
                            ></textarea>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!name || !imageUrl || isSaving}
                        className="w-full py-4 bg-[#f01a64] hover:bg-[#d61556] disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                    >
                        {isSaving ? 'Deploying to Network...' : 'Create Trader Profile'}
                    </button>
                    {saveStatus === 'success' && <p className="text-[#00b36b] text-center font-black uppercase text-xs">Trader successfully added!</p>}
                </div>

                {/* Live Preview Side */}
                <div className="bg-[#131722] p-8 rounded-[3rem] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(240,26,100,0.1),transparent)] pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-white font-black uppercase text-lg">Live Preview</h3>
                        <span className="bg-[#00b36b]/20 text-[#00b36b] px-3 py-1 rounded-full text-[10px] font-black uppercase">Active</span>
                    </div>

                    {/* The Card */}
                    <div className="bg-[#1e222d] rounded-3xl p-6 border border-white/5 shadow-2xl relative group">
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black border border-white/10 uppercase">
                            {rank}
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full border-2 border-[#f01a64] p-1 relative">
                                <img
                                    src={imagePreview || 'https://via.placeholder.com/150'}
                                    alt="Trader"
                                    className="w-full h-full rounded-full object-cover bg-gray-800"
                                />
                                <div className="absolute -bottom-1 -right-1 flex gap-1">
                                    {socials.instagram && (
                                        <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-[#f01a64] rounded-full flex items-center justify-center border-2 border-[#1e222d]">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.4z" /></svg>
                                        </a>
                                    )}
                                    {socials.telegram && (
                                        <a href={socials.telegram} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-[#f01a64] rounded-full flex items-center justify-center border-2 border-[#1e222d]">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.4z" /></svg>
                                        </a>
                                    )}
                                    {socials.twitter && (
                                        <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-[#f01a64] rounded-full flex items-center justify-center border-2 border-[#1e222d]">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.4z" /></svg>
                                        </a>
                                    )}
                                    {socials.youtube && (
                                        <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-[#f01a64] rounded-full flex items-center justify-center border-2 border-[#1e222d]">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-white font-black text-lg">{name || 'Trader Name'}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#00b36b] rounded-full animate-pulse"></span>
                                    <span className="text-gray-400 text-xs font-bold uppercase">Online Now</span>
                                    <span className="text-xs ml-2">{country === 'USA' ? '🇺🇸' : country === 'Pakistan' ? '🇵🇰' : country === 'UAE' ? '🇦🇪' : country === 'Nigeria' ? '🇳🇬' : country === 'UK' ? '🇬🇧' : country === 'Austria' ? '🇦🇹' : country === 'Australia' ? '🇦🇺' : country === 'India' ? '🇮🇳' : ''}</span>
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    <span className="text-[8px] bg-[#00b36b]/10 text-[#00b36b] px-1 rounded border border-[#00b36b]/20 flex items-center gap-1">
                                        {verificationStatus}
                                    </span>
                                    <span className="text-[8px] bg-blue-500/10 text-blue-500 px-1 rounded border border-blue-500/20 flex items-center gap-1">
                                        {performanceBadge}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <div className="bg-black/20 rounded-xl p-3 text-center">
                                <div className="text-[9px] text-gray-500 uppercase font-black">Win Rate</div>
                                <div className="text-[#00b36b] font-black">{winRate}%</div>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 text-center">
                                <div className="text-[9px] text-gray-500 uppercase font-black">Profit Share</div>
                                <div className="text-white font-black">{profitShare}%</div>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 text-center">
                                <div className="text-[9px] text-gray-500 uppercase font-black">Copiers</div>
                                <div className="text-white font-black">2.5k</div>
                            </div>
                        </div>

                        <p className="text-gray-400 text-xs leading-relaxed mb-6">
                            {bio || `Expert ${specialization} trader specializing in high-frequency algorithmic scalping. Matches your investment style automatically.`}
                        </p>

                        <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black uppercase text-[10px] group-hover:bg-[#f01a64] group-hover:border-[#f01a64] transition-all">
                            Copy Strategy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTrader;
