
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SHARE_MESSAGE_TEXT } from '../utils/constants';

interface ReferralTerminalProps {
  onClose: () => void;
}

const ReferralTerminal: React.FC<ReferralTerminalProps> = ({ onClose }) => {
  const { userProfile: user, updateUser } = useAuth();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'success'>('idle');

  // Use a cleaner default if user node ID is missing
  const referralId = user?.nodeId || 'USER-INVITE';
  const referralLink = `https://zulutradeofficial.pages.dev/?ref=${referralId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDispatch = (platform: 'telegram' | 'whatsapp') => {
    setIsDispatching(true);
    const text = SHARE_MESSAGE_TEXT;

    if (platform === 'telegram') {
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
      window.open(telegramUrl, '_blank');
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + referralLink)}`;
      window.open(whatsappUrl, '_blank');
    }

    // Simulate basic tracking
    setTimeout(async () => {
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
      const reward = 200;
      await updateUser({
        bonusBalance: (user?.bonusBalance || 0) + reward,
        referralEarnings: (user?.referralEarnings || 0) + reward,
        pendingClaims: (user?.pendingClaims || 0) - 1,
        referralCount: (user?.referralCount || 0) + 1
      });

      setClaimStatus('success');
      setTimeout(() => setClaimStatus('idle'), 3000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      {!user ? (
        <div className="text-white">Loading...</div>
      ) : (
        <div className="bg-[#1e222d] w-full max-w-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col relative">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full z-10"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Simple Header */}
          <div className="p-8 pb-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Invite & Earn</h2>
            <p className="text-gray-400 text-sm">
              Get <span className="text-[#00b36b] font-bold">$200</span> for every friend who joins.
            </p>
          </div>

          <div className="px-6 pb-8 space-y-6">

            {/* Referral Stats (Simplified) */}
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total Earned</span>
                <span className="text-lg font-bold text-[#00b36b]">${(user.referralEarnings || 0).toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Ref ID</span>
                <span className="text-sm font-bold text-white">{referralId}</span>
              </div>
            </div>

            {/* Link Copy Section */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">Your Link</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-xs text-gray-300 font-mono truncate">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopy}
                  className={`px-4 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${copySuccess
                      ? 'bg-[#00b36b] text-white'
                      : 'bg-[#f01a64] text-white hover:bg-[#d61355]'
                    }`}
                >
                  {copySuccess ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDispatch('telegram')}
                  disabled={isDispatching}
                  className="bg-[#0088cc] hover:bg-[#0077b5] text-white py-3 rounded-xl font-bold text-xs uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isDispatching ? '...' : 'Telegram'}
                </button>
                <button
                  onClick={() => handleDispatch('whatsapp')}
                  disabled={isDispatching}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold text-xs uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isDispatching ? '...' : 'WhatsApp'}
                </button>
              </div>

              <button
                onClick={handleClaim}
                disabled={claimStatus !== 'idle' || (user.pendingClaims || 0) <= 0}
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all ${(user.pendingClaims || 0) > 0
                    ? 'bg-[#00b36b] text-white animate-pulse'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {claimStatus === 'claiming' ? 'Verifying...' : claimStatus === 'success' ? 'Added to Balance!' : `Claim Reward ($${(user.pendingClaims || 0) * 200})`}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralTerminal;
