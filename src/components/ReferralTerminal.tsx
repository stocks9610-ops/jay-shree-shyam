
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ReferralTerminalProps {
  onClose: () => void;
}

const ReferralTerminal: React.FC<ReferralTerminalProps> = ({ onClose }) => {
  const { userProfile: user, updateUser } = useAuth();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'success'>('idle');

  const referralLink = `${window.location.origin}/?ref=${user?.nodeId || 'LOADING'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDispatch = (platform: 'telegram' | 'whatsapp') => {
    setIsDispatching(true);
    const text = `🚀 I'm earning passive USDT with CopyTrade! \n\nUse my Institutional Access Node to get a $1,000 Signup Bonus instantly. \n\nLink: ${referralLink}`;

    if (platform === 'telegram') {
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
      window.open(telegramUrl, '_blank');
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + referralLink)}`;
      window.open(whatsappUrl, '_blank');
    }

    // Simulate network detection
    setTimeout(async () => {
      // Use fresh user state from context (updateUser merges updates)
      await updateUser({
        pendingClaims: (user?.pendingClaims || 0) + 1
      });
      setIsDispatching(false);
    }, 1500);
  };

  const handleClaim = () => {
    if ((user?.pendingClaims || 0) <= 0) return;

    setClaimStatus('claiming');

    setTimeout(async () => {
      // Use user state from closure (or could fetch fresh if critical)
      if (user) {
        if ((user.pendingClaims || 0) <= 0) {
          setClaimStatus('idle');
          return;
        }
      }

      const reward = 200;
      await updateUser({
        bonusBalance: (user?.bonusBalance || 0) + reward, // Add to Welcome Bonus
        referralEarnings: (user?.referralEarnings || 0) + reward,
        pendingClaims: (user?.pendingClaims || 0) - 1,
        referralCount: (user?.referralCount || 0) + 1
      });

      if (user) {
        setClaimStatus('success');
        setTimeout(() => setClaimStatus('idle'), 3000);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in">
      {!user ? (
        <div className="text-white">Loading Node Data...</div>
      ) : (
        <div className="bg-[#1e222d] w-[95%] max-w-lg h-auto max-h-[90vh] rounded-[2rem] sm:rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col">

          {/* Header */}
          <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
            <div>
              <span className="text-[8px] md:text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] block mb-1">Affiliate Protocol v1.0</span>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic">Referral Terminal</h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 no-scrollbar pb-[calc(2rem+env(safe-area-inset-bottom))]">

            {/* Node Status HUD */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 border border-white/5 p-5 rounded-3xl">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-1">Total Earned</span>
                <span className="text-xl font-black text-[#00b36b] font-mono">${(user.referralEarnings || 0).toLocaleString()}</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-5 rounded-3xl">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-1">Alpha Node ID</span>
                <span className="text-xl font-black text-white font-mono">{user.nodeId}</span>
              </div>
            </div>

            {/* Unique Link Box */}
            <div className="space-y-3">
              <label className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] ml-1">Your Institutional Link</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-black border border-white/10 rounded-2xl p-4 md:p-5 text-[10px] md:text-xs text-gray-400 font-mono break-all leading-tight shadow-inner">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopy}
                  className={`px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 ${copySuccess ? 'bg-[#00b36b] text-white' : 'bg-white/5 text-white border border-white/10'}`}
                >
                  {copySuccess ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Reward HUD */}
            <div className="bg-[#131722] border border-[#00b36b]/30 p-8 rounded-[2.5rem] relative overflow-hidden text-center group">
              <div className="absolute inset-0 bg-[radial-gradient(#00b36b_1px,transparent_1px)] [background-size:20px_20px] opacity-5"></div>

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#00b36b]/10 px-4 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 bg-[#00b36b] rounded-full animate-pulse"></div>
                  <span className="text-[9px] text-[#00b36b] font-black uppercase tracking-widest">Rewards Settlement Ready</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                  Earn $200.00 <br /> Per Referral
                </h3>

                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tight max-w-[280px] mx-auto leading-relaxed italic">
                  "No caps on earnings. Payouts are settled instantly into your Welcome Bonus balance."
                </p>

                <div className="pt-6 grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDispatch('telegram')}
                      disabled={isDispatching}
                      className="bg-[#0088cc] hover:bg-[#0077b5] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isDispatching ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : 'Telegram'}
                    </button>
                    <button
                      onClick={() => handleDispatch('whatsapp')}
                      disabled={isDispatching}
                      className="bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isDispatching ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : 'WhatsApp'}
                    </button>
                  </div>

                  <button
                    onClick={handleClaim}
                    disabled={claimStatus !== 'idle' || (user.pendingClaims || 0) <= 0}
                    className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 relative overflow-hidden ${(user.pendingClaims || 0) > 0
                      ? 'bg-[#00b36b] text-white animate-pulse'
                      : 'bg-white/5 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {claimStatus === 'claiming' ? 'Verifying...' : claimStatus === 'success' ? 'Settled!' : `Claim $${(user.pendingClaims || 0) * 200}`}
                  </button>
                </div>
              </div>
            </div>

            {/* Social Proof Footer */}
            <div className="text-center pt-4">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] leading-relaxed">
                Verified Affiliate Protocol v7.0 <br />
                <span className="text-gray-700">Encrypted Referral Dispatch via Node {user.nodeId}</span>
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralTerminal;
