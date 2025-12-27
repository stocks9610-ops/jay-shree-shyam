
import React, { useState } from 'react';
import { db } from '../../firebase.config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useImageUpload } from '../../hooks/useImageUpload';
import ImageUploadZone from '../shared/ImageUploadZone';

const CreateTrader: React.FC = () => {
    // Form state
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [winRate, setWinRate] = useState(95);
    const [profitShare, setProfitShare] = useState(20);
    const [specialization, setSpecialization] = useState('Crypto');
    const [rank, setRank] = useState('Silver');
    const [country, setCountry] = useState('USA');
    const [verificationStatus, setVerificationStatus] = useState('Platform Verified Trader');
    const [performanceBadge, setPerformanceBadge] = useState('Consistent Winner');
    const [usdtAddress, setUsdtAddress] = useState('');
    const [socials, setSocials] = useState({ instagram: '', telegram: '', twitter: '', youtube: '' });

    // Save state
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveError, setSaveError] = useState<string>('');

    // Image upload using shared hook
    const imageUpload = useImageUpload({ uploadPath: 'traders' });

    // Validate USDT TRC20 address
    const validateTRC20 = (address: string): boolean => {
        if (!address) return true; // Optional field
        return /^T[a-zA-Z0-9]{33}$/.test(address);
    };

    const handleSave = async () => {
        // Validate required fields
        if (!name.trim()) {
            setSaveError('Please enter trader name');
            setSaveStatus('error');
            return;
        }

        if (!imageUpload.imageUrl) {
            setSaveError('Please upload a profile image');
            setSaveStatus('error');
            return;
        }

        // Validate USDT address if provided
        if (usdtAddress && !validateTRC20(usdtAddress)) {
            setSaveError('Invalid TRC20 address. Must start with "T" and be 34 characters.');
            setSaveStatus('error');
            return;
        }

        setIsSaving(true);
        setSaveStatus('idle');
        setSaveError('');

        try {
            await addDoc(collection(db, 'traders'), {
                name: name.trim(),
                bio: bio.trim() || `Expert trader specializing in high-frequency algorithmic scalping. Consistent ${winRate}% win rate.`,
                avatar: imageUpload.imageUrl,
                winRate,
                profitShare,
                pnl: 0,
                followers: 0,
                rank,
                country,
                verificationStatus,
                performanceBadge,
                socials,
                minCapital: 100,
                totalCopied: 0,
                category: specialization.toLowerCase(),
                roi: 0,
                drawdown: 0,
                weeks: 0,
                strategy: `${specialization} Algorithmic Trading`,
                type: 'Trader',
                experienceYears: 5,
                markets: [specialization],
                riskScore: 5,
                avgDuration: '1-3 days',
                riskMethods: ['Risk Management', 'Position Sizing'],
                copyTradeId: `CT-${Date.now().toString().slice(-4)}-${name.substring(0, 3).toUpperCase()}`,
                totalProfit: 0,
                isTrending: false,
                usdtAddress: usdtAddress.trim(),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            setSaveStatus('success');

            // Reset form after successful save
            setName('');
            setBio('');
            setUsdtAddress('');
            setWinRate(95);
            setProfitShare(20);
            setRank('Silver');
            setSocials({ instagram: '', telegram: '', twitter: '', youtube: '' });
            imageUpload.clearImage();

        } catch (err: any) {
            console.error('Save failed:', err);
            setSaveStatus('error');
            setSaveError(err.message || 'Failed to save trader. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Determine if save button should be disabled
    const isSaveDisabled = !name.trim() || !imageUpload.imageUrl || isSaving || imageUpload.isUploading;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Side */}
                <div className="space-y-6">
                    {/* Image Upload Zone */}
                    <ImageUploadZone
                        imagePreview={imageUpload.imagePreview}
                        isUploading={imageUpload.isUploading}
                        isDragging={imageUpload.isDragging}
                        error={imageUpload.error}
                        onDragOver={imageUpload.handleDragOver}
                        onDragLeave={imageUpload.handleDragLeave}
                        onDrop={imageUpload.handleDrop}
                        onFileSelect={imageUpload.handleFileSelect}
                        onClear={imageUpload.clearImage}
                        inputId="trader-image-input"
                    />

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Trader Name *</label>
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

                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">USDT Wallet Address (TRC20)</label>
                            <input
                                type="text"
                                value={usdtAddress}
                                onChange={e => setUsdtAddress(e.target.value)}
                                className="w-full bg-[#1e222d] border border-white/5 p-4 rounded-xl text-white font-bold outline-none focus:border-[#f01a64]"
                                placeholder="T..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Bio (Optional)</label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="w-full bg-[#1e222d] border border-white/5 p-4 rounded-xl text-white outline-none focus:border-[#f01a64] h-24 text-sm"
                                placeholder="Leave empty for auto-generated bio..."
                            ></textarea>
                        </div>
                    </div>

                    {/* Error Message */}
                    {saveError && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-bold">
                            {saveError}
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        className="w-full py-4 bg-[#f01a64] hover:bg-[#d61556] disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                    >
                        {isSaving ? 'Deploying to Network...' : imageUpload.isUploading ? 'Uploading Image...' : 'Create Trader Profile'}
                    </button>

                    {/* Success Message */}
                    {saveStatus === 'success' && (
                        <p className="text-[#00b36b] text-center font-black uppercase text-xs">
                            ✓ Trader successfully added!
                        </p>
                    )}
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
                                    src={imageUpload.imagePreview || 'https://via.placeholder.com/150?text=?'}
                                    alt="Trader"
                                    className="w-full h-full rounded-full object-cover bg-gray-800"
                                />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-lg">{name || 'Trader Name'}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#00b36b] rounded-full animate-pulse"></span>
                                    <span className="text-gray-400 text-xs font-bold uppercase">Online Now</span>
                                    <span className="text-xs ml-2">
                                        {country === 'USA' ? '🇺🇸' : country === 'Pakistan' ? '🇵🇰' : country === 'UAE' ? '🇦🇪' : country === 'Nigeria' ? '🇳🇬' : country === 'UK' ? '🇬🇧' : country === 'Austria' ? '🇦🇹' : country === 'Australia' ? '🇦🇺' : country === 'India' ? '🇮🇳' : ''}
                                    </span>
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    <span className="text-[8px] bg-[#00b36b]/10 text-[#00b36b] px-1 rounded border border-[#00b36b]/20">
                                        {verificationStatus}
                                    </span>
                                    <span className="text-[8px] bg-blue-500/10 text-blue-500 px-1 rounded border border-blue-500/20">
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
                                <div className="text-white font-black">0</div>
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
