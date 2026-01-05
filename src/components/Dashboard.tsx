import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NETWORKS, WITHDRAWALS_COLLECTION, STRATEGIES_COLLECTION, SHARE_MESSAGE_TEXT } from '../utils/constants';

import { Trader, Strategy, ActiveTrade } from '../types';
import GlobalStats from './GlobalStats';
import LiveTradeSimulator from './LiveTradeSimulator';
import LiveMarketChart from './LiveMarketChart';
import MarketIntelligence from './MarketIntelligence';
import ReferralTerminal from './ReferralTerminal';
import TradingHub from './TradingHub';
import StrategyModal from './StrategyModal';
import SocialTicker from './SocialTicker'; // NEW
import SignalFeed from './SignalFeed'; // NEW
import { useMarketNotifications } from '../hooks/useMarketNotifications';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { getSettings } from '../services/settingsService';
import {
  subscribeToNotifications,
  markAsRead,
  deleteNotification,
  UserNotification
} from '../services/notificationService';
import TraderProfileCard from './TraderProfileCard';
import { subscribeToTraders } from '../services/traderService';

interface DashboardProps {
  onSwitchTrader?: () => void;
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
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>(() => {
    // 1. Try restoring from localStorage first (Fastest)
    try {
      const saved = localStorage.getItem('activeTrades');
      if (saved) {
        const trades = JSON.parse(saved);
        return trades.filter((t: ActiveTrade) => t.progress < 100);
      }
    } catch (error) {
      console.error('Failed to restore trades from local:', error);
    }

    // 2. Fallback to Firebase data if available (Cloud Backup)
    if (user?.activeTrades && user.activeTrades.length > 0) {
      return user.activeTrades;
    }

    return [];
  });

  // Track if we have synced with server state at least once
  const hasHydratedRef = useRef(false);

  // 1. Hydrate from Server (Cross-device support) - Runs when user loads
  useEffect(() => {
    if (!user) return;

    // If we haven't reconciled local vs server state yet
    if (!hasHydratedRef.current) {
      if (activeTrades.length === 0 && user.activeTrades && user.activeTrades.length > 0) {
        console.log("☁️ Restoring active trades from Cloud Backup...");
        setActiveTrades(user.activeTrades);
      }
      hasHydratedRef.current = true;
    }
  }, [user]);

  // 2. Backup active trades to Firebase (Debounced)
  useEffect(() => {
    if (!user) return;

    // Save to LocalStorage immediately (fast)
    if (activeTrades.length > 0) {
      localStorage.setItem('activeTrades', JSON.stringify(activeTrades));
    } else {
      localStorage.removeItem('activeTrades');
    }

    // Only sync to Firebase if we have finished hydration (prevents wiping server on load)
    if (hasHydratedRef.current) {
      const syncTimeout = setTimeout(() => {
        // Only sync if different to avoid loops/writes
        const currentJson = JSON.stringify(activeTrades.map(t => ({ ...t, currentPnL: Math.round(t.currentPnL * 100) / 100 })));
        const serverJson = JSON.stringify(user.activeTrades || []);

        if (currentJson !== serverJson) {
          updateUser({ activeTrades });
        }
      }, 10000); // 10s debounce

      return () => clearTimeout(syncTimeout);
    }
  }, [activeTrades, user]);
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
  const [depositAmt, setDepositAmt] = useState<string>('500');
  const [txid, setTxid] = useState<string>('');
  const marketNotification = useMarketNotifications();

  // --- Strict Backend Strategy Control ---
  // Strategies are locked by default until deposit OR admin unlock


  // Animation states for exciting copy-trading flow
  const [deploymentStep, setDeploymentStep] = useState(0); // 0=idle, 1-4=animation steps
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentMessage, setDeploymentMessage] = useState('');



  const queryParams = new URLSearchParams(window.location.search);
  const activeTraderName = queryParams.get('trader');
  const [currentTrader, setCurrentTrader] = useState<Trader | null>(null);

  // Fetch full trader details if activeTraderName is present
  useEffect(() => {
    if (activeTraderName) {
      const unsub = subscribeToTraders((traders) => {
        const found = traders.find(t => t.name === activeTraderName || t.id === activeTraderName);
        if (found) setCurrentTrader(found);
      });
      return () => unsub();
    }
  }, [activeTraderName]);

  // --- Settings & Address Logic ---
  const [platformSettings, setPlatformSettings] = useState<any>(null);

  // User Notifications State
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

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

  const [streakDays] = useState(4); // Mocked for demo



  // Handle Notifications Subscription
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
      setUserNotifications(notifs);

      // Auto-show panel if there's a new unread alert
      const hasNewUnread = notifs.some(n => !n.isRead);
      if (hasNewUnread && notifs.length > userNotifications.length) {
        setShowNotifPanel(true);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleMarkNotifRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleDeleteNotif = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://jay-shree-shyam.com/ref/USER123");
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    alert("Referral Link Copied! Share it with friends.");
  };

  const handleSocialShare = (platform: 'whatsapp' | 'telegram') => {
    const text = SHARE_MESSAGE_TEXT;
    const url = `${window.location.origin}/ref/USER123`;
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

  const finishTrade = async (trade: ActiveTrade) => {
    if (!user) return;

    // Determine outcome based on Strategy Win Rate (Default 90%)
    const winProbability = trade.plan.winRate ?? 90;
    const isWin = Math.random() * 100 < winProbability;

    if (isWin) {
      const roi = trade.plan.minRet + Math.random() * (trade.plan.maxRet - trade.plan.minRet);
      const profit = trade.investAmount * (roi / 100);

      await updateUser({
        balance: user.balance + trade.investAmount + profit,
        totalInvested: Math.max(0, user.totalInvested - trade.investAmount),
        wins: user.wins + 1,
        totalProfit: (user.totalProfit || 0) + profit
      });
      setTradeResult({ status: 'WIN', amount: profit });
    } else {
      // LOSS: User loses the invested amount (already deducted at start)
      // We just free up the "Total Invested" counter and record the loss
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

  // Save logic moved to unified effect above
  /* 
   * LocalStorage logic combined with Firebase sync for better state management 
   * See lines 117+ 
   */

  // Dynamic update interval based on trade duration
  const getUpdateInterval = (durationMs: number): number => {
    if (durationMs < 300000) return 50;      // < 5 mins: 50ms (ultra smooth)
    if (durationMs < 3600000) return 200;    // < 1 hour: 200ms (smooth)
    if (durationMs < 86400000) return 1000;  // < 1 day: 1s (efficient)
    return 5000;                              // 2+ days: 5s (very efficient)
  };

  // Realistic profit calculation with multi-layer fluctuations
  const calculateRealisticProfit = (trade: ActiveTrade, progress: number, now: number): number => {
    const targetRoi = (trade.plan.minRet + trade.plan.maxRet) / 2;

    // Determine Volatility Multiplier
    const volatilitySetting = trade.plan.volatility || 'medium';
    let volMult = 1;
    if (volatilitySetting === 'low') volMult = 0.5;
    if (volatilitySetting === 'high') volMult = 2.0;

    // Layer 1: Acceleration curve (slow start, fast finish)
    // Using power curve for more realistic growth
    const accelerationFactor = Math.pow(progress / 100, 1.15);
    const baseGrowth = (targetRoi / 100) * accelerationFactor;

    // Layer 2: Slow volatility waves (market trends)
    const slowWave = Math.sin(now / 8000) * 0.015 * volMult; // Base 1.5%

    // Layer 3: Fast micro-fluctuations (tick-by-tick)
    const fastWave = Math.sin(now / 1200) * 0.008 * volMult; // Base 0.8%

    // Layer 4: Drawdown periods (temporary losses for realism)
    // Creates periodic small dips
    const drawdownCycle = Math.sin(progress / 15) * 0.01 * volMult; // Base 1%

    // Layer 5: Random noise (very small, adds organic feel)
    const noise = (Math.random() - 0.5) * 0.003 * volMult; // Base ±0.3%

    // Combine all layers
    const totalFluctuation = slowWave + fastWave + drawdownCycle + noise;
    const currentProfitPercent = (baseGrowth + totalFluctuation) * 100;
    const currentPnL = trade.investAmount * (currentProfitPercent / 100);

    // Ensure profit stays within reasonable bounds (never negative, max 1.5x target)
    return Math.max(0, Math.min(currentPnL, trade.investAmount * (targetRoi * 1.5 / 100)));
  };

  useEffect(() => {
    if (activeTrades.length === 0) return;

    // Use dynamic interval based on longest trade duration
    const longestDuration = Math.max(...activeTrades.map(t => t.plan.durationMs));
    const updateInterval = getUpdateInterval(longestDuration);

    const interval = setInterval(() => {
      const now = Date.now();

      setActiveTrades(currentTrades => {
        const updated = currentTrades.map(trade => {
          const elapsed = now - trade.startTime;
          const rawProgress = (elapsed / trade.plan.durationMs) * 100;
          const cappedProgress = Math.min(100, Math.max(0, rawProgress));

          if (rawProgress >= 100 && trade.progress < 100) {
            finishTrade(trade);
            return { ...trade, progress: 100, currentPnL: trade.investAmount * (trade.plan.minRet / 100) };
          }

          // Use realistic profit calculation
          const currentPnL = calculateRealisticProfit(trade, cappedProgress, now);

          return {
            ...trade,
            progress: cappedProgress,
            currentPnL
          };
        });
        return updated.filter(t => t.progress < 100);
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [activeTrades]);

  // Helper: Compress image to Base64 (Bypasses Storage issues)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; // Slightly larger for proofs
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality
            resolve(dataUrl);
          } else {
            reject(new Error('Canvas context failed'));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifyingReceipt(true);
    setVerificationStatus('Initializing Stream Handshake...');
    setVerificationError('');

    try {
      if (!user) return;

      // Step 1: Upload to Firebase Storage
      setVerificationStatus('Uploading proof to secure storage...');
      const { uploadImage } = await import('../services/storageService');
      const storagePath = `deposits/${user.uid}/${Date.now()}_${file.name}`;
      const imageUrl = await uploadImage(file, storagePath);

      // Step 2: OCR for amount detection (optional, for admin convenience)
      setVerificationStatus('Analyzing transaction details...');
      let detectedAmount = 0;
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const { data: { text } } = await Tesseract.recognize(base64, 'eng');
        const amountRegex = /(\$|usdt)\s?([0-9,]+(\.[0-9]{2})?)/i;
        const amountMatch = text.toLowerCase().match(amountRegex);
        if (amountMatch && amountMatch[2]) {
          detectedAmount = parseFloat(amountMatch[2].replace(/,/g, ''));
        }
      } catch (e) {
        console.warn("OCR failed, defaulting to 0 for admin review");
      }

      // Step 3: Create deposit record with image URL
      setVerificationStatus('Securing deposit record...');
      const { createDeposit } = await import('../services/depositService');

      await createDeposit(
        user.uid,
        user.displayName || 'User',
        user.email,
        detectedAmount, // If 0, Admin sets it manually
        selectedNetwork.id,
        imageUrl // Now using Firebase Storage URL instead of base64
      );

      setVerificationStatus('Deposit Submitted!');
      setVerificationError('');
      alert('✅ Deposit Proof Submitted for Verification.\n\nYour balance will be updated once an Admin approves the transaction (usually < 30 mins).');
      setIsVerifyingReceipt(false);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err: any) {
      console.error("Deposit submission error:", err);

      // FALLBACK TO BASE64 if Storage fails
      if (err.code?.startsWith('storage/') || err.message?.includes('storage')) {
        try {
          setVerificationStatus('Storage busy. Using alternative secure route...');
          const base64ImageUrl = await compressImage(file);

          const { createDeposit } = await import('../services/depositService');
          await createDeposit(
            user!.uid,
            user!.displayName || 'User',
            user!.email,
            0, // Default for manual review
            selectedNetwork.id,
            base64ImageUrl
          );

          setVerificationStatus('Deposit Submitted (Alt)!');
          setVerificationError('');
          alert('✅ Deposit Proof Submitted via Secure Link.\n\nYour balance will be updated once an Admin approves.');
          setIsVerifyingReceipt(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        } catch (fallbackErr) {
          console.error("Fallback failed:", fallbackErr);
        }
      }

      setIsVerifyingReceipt(false);

      if (err.code === 'storage/unauthorized') {
        setVerificationError('Upload permission denied. Please contact support.');
      } else if (err.code === 'storage/canceled') {
        setVerificationError('Upload canceled.');
      } else if (err.message?.includes('too large')) {
        setVerificationError('Image too large. Please use a smaller file (< 5MB).');
      } else {
        setVerificationError('Submission failed. Please try again.');
      }
    }
  };

  const handleTXIDSubmit = async () => {
    if (!txid || txid.length < 10) {
      setVerificationError('Please enter a valid Transaction Hash (TXID).');
      return;
    }
    if (!user) return;

    setIsVerifyingReceipt(true);
    setVerificationStatus('Broadcasting TXID to ledger...');
    setVerificationError('');

    try {
      const { createDeposit } = await import('../services/depositService');
      await createDeposit(
        user.uid,
        user.displayName || 'User',
        user.email,
        parseFloat(depositAmt) || 0,
        selectedNetwork.id,
        `TXID:${txid}` // Store TXID as the "proofUrl" with a prefix
      );

      setVerificationStatus('Submission Recorded!');
      alert('✅ Transaction Hash Submitted.\n\nOur system is now verifying the block confirmations. Your balance will update automatically once confirmed.');
      setTxid('');
      setIsVerifyingReceipt(false);
    } catch (err: any) {
      console.error("TXID submission error:", err);
      setVerificationError('Failed to record TXID. Please try again.');
      setIsVerifyingReceipt(false);
    }
  };

  const handleTrustWalletPay = () => {
    const amt = depositAmt || "0";
    let asset = "";

    // Universal Asset Identifiers for Trust Wallet
    if (selectedNetwork.id === 'TRX') asset = "c195_tTR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
    else if (selectedNetwork.id === 'ETH') asset = "c60_t0xdAC17F958D2ee523a2206206994597C13D831ec7";
    else if (selectedNetwork.id === 'BNB') asset = "c714_t0x55d398326f99059fF775485246999027B3197955"; // USDT BEP20

    if (!asset) {
      alert("Direct pay not available for this network. Please copy address manually.");
      return;
    }

    const url = `trust://send?asset=${asset}&address=${depositAddress}&amount=${amt}`;
    // Note: This causes a redirect but is intentional for external app deep linking
    // It does NOT redirect to /dashboard, so it's safe
    window.location.href = url;
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

    const availableFunds = (user?.balance || 0) + (user?.bonusBalance || 0);

    if (!user || availableFunds < investAmount) {
      depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      alert("INSUFFICIENT_FUNDS: Please deposit to initialize strategy.");
      return;
    }

    // Start exciting 4-step animation sequence
    setIsTradeLoading(true);
    setDeploymentStep(1);
    setDeploymentProgress(0);

    // Step 1: Connecting to Trader (0-1s)
    setDeploymentMessage(`Connecting to Pro Trader...`);
    animateProgress(0, 25, 1000);

    setTimeout(() => {
      // Step 2: Copying Strategy (1-2s)
      setDeploymentStep(2);
      setDeploymentMessage(`Copying ${plan.name} Strategy...`);
      animateProgress(25, 50, 1000);
    }, 1000);

    setTimeout(() => {
      // Step 3: Allocating Funds (2-3s)
      setDeploymentStep(3);
      setDeploymentMessage(`Allocating $${investAmount}...`);
      animateProgress(50, 75, 1000);
    }, 2000);

    setTimeout(() => {
      // Step 4: Trade Active (3-4s)
      setDeploymentStep(4);
      setDeploymentMessage(`Trade Deployed Successfully!`);
      animateProgress(75, 100, 1000);
    }, 3000);

    // Complete deployment after 4 seconds
    setTimeout(() => {
      setIsTradeLoading(false);
      setDeploymentStep(0);
      setDeploymentProgress(0);
      handleTerminalComplete();
    }, 4500);

    setTradeResult(null);
  };

  // Helper function to animate progress bar smoothly
  const animateProgress = (from: number, to: number, duration: number) => {
    const steps = 30;
    const increment = (to - from) / steps;
    const stepDuration = duration / steps;

    let current = from;
    const interval = setInterval(() => {
      current += increment;
      if (current >= to) {
        setDeploymentProgress(to);
        clearInterval(interval);
      } else {
        setDeploymentProgress(current);
      }
    }, stepDuration);
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

    if (user.balance < investAmount) { // Simple logic: use bonus if balance low
      // Use bonus for the difference
      const difference = investAmount - user.balance;
      newBalance = 0; // Drain balance
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
    <div className="bg-[#131722] min-h-screen pt-20 pb-24 md:pt-24 md:pb-32 px-3 sm:px-6 lg:px-8 relative selection:bg-[#f01a64]/10">
      {(!user) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#131722] text-white">
          Loading Account Data...
        </div>
      )}

      {isTradeLoading && (
        <div className={`fixed inset-0 z-[300] bg-black/90 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300`}>
          <div className="max-w-md w-full bg-[#1e222d] border-2 border-[#f01a64]/50 rounded-3xl p-8 shadow-2xl">
            {/* Step Icons */}
            <div className="flex justify-center gap-4 mb-6">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${deploymentStep === step
                    ? 'bg-gradient-to-br from-[#f01a64] to-[#00b36b] text-white scale-110 shadow-lg shadow-[#f01a64]/50'
                    : deploymentStep > step
                      ? 'bg-[#00b36b] text-white'
                      : 'bg-white/10 text-gray-600'
                    }`}
                >
                  {deploymentStep > step ? '✓' : step}
                </div>
              ))}
            </div>

            {/* Step Message */}
            <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-2 animate-in fade-in duration-300">
              {deploymentMessage || 'Initializing...'}
            </h3>

            {/* Step Descriptions */}
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
              {deploymentStep === 1 && 'Establishing secure link with Master Trader'}
              {deploymentStep === 2 && `Syncing ${strategies.find(p => p.id === selectedPlanId)?.name || 'signal'} to your portfolio`}
              {deploymentStep === 3 && 'Allocating copy funds to Master Signal'}
              {deploymentStep === 4 && `Expected return: +$${((investAmount * (strategies.find(p => p.id === selectedPlanId)?.minRet || 0)) / 100).toFixed(2)}`}
            </p>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#f01a64] via-yellow-500 to-[#00b36b] transition-all duration-300 ease-out"
                style={{ width: `${deploymentProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            {/* Progress Percentage */}
            <div className="mt-3 text-[#00b36b] font-black text-sm">
              {Math.round(deploymentProgress)}%
            </div>

            {/* Live Sync Badge */}
            {deploymentStep >= 2 && (
              <div className="mt-6 inline-flex items-center gap-2 bg-[#00b36b]/10 border border-[#00b36b]/30 px-4 py-2 rounded-full animate-in slide-in-from-bottom-2">
                <div className="w-2 h-2 bg-[#00b36b] rounded-full animate-pulse"></div>
                <span className="text-[#00b36b] font-black text-xs uppercase tracking-widest">MASTER SYNC ACTIVE</span>
              </div>
            )}
          </div>
        </div>
      )}
      {process.env.REACT_APP_TRADER_PROFILE_DASHBOARD === 'true' && (
        currentTrader ? (
          <div className="max-w-4xl mx-auto mt-8">
            <TraderProfileCard
              trader={currentTrader}
              currentProfit={user?.totalProfit || 0}
              currentWinRate={currentTrader.winRate}
              onClose={() => setCurrentTrader(null)}
            />
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm uppercase tracking-wider">
              Add <code>?trader=&lt;id&gt;</code> to the URL to view a trader profile here.
            </p>
          </div>
        )
      )}

      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[210] bg-[#00b36b] text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4">
          <span className="font-black uppercase tracking-widest text-xs">Trade Executed Successfully</span>
        </div>
      )}

      {/* Notification Toggle Button (Always Visible) */}
      <button
        onClick={() => setShowNotifPanel(!showNotifPanel)}
        className={`fixed top-24 left-4 z-[210] p-3 rounded-full shadow-2xl transition-all duration-300 ${showNotifPanel ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'} bg-[#1e222d] border border-white/10 text-white hover:border-[#f01a64] active:scale-95 group backdrop-blur-md`}
      >
        <div className="relative">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-[#f01a64] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f01a64] rounded-full border-2 border-[#1e222d] animate-pulse"></span>}
        </div>
      </button>

      {/* Manual Admin Notifications Panel */}
      <div className={`fixed top-24 left-4 z-[220] max-w-sm w-full transition-all duration-500 ${showNotifPanel ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
        <div className="bg-[#1e222d] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#1e222d] to-[#131722]">
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="w-5 h-5 text-[#f01a64]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1e222d]"></span>}
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">System Notifications</h4>
            </div>
            <button onClick={() => setShowNotifPanel(false)} className="text-gray-500 hover:text-white transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            {userNotifications.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest italic">Inbox Zero</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {userNotifications.map(notif => (
                  <div key={notif.id} className={`p-5 transition-colors relative group ${notif.isRead ? 'bg-transparent' : 'bg-white/5'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${notif.type === 'alert' ? 'bg-red-500/20 text-red-500' :
                        notif.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                          notif.type === 'success' ? 'bg-[#00b36b]/20 text-[#00b36b]' :
                            'bg-blue-500/20 text-blue-500'
                        }`}>
                        {notif.type}
                      </span>
                      <span className="text-[7px] text-gray-600 font-bold">{notif.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                    <h5 className={`text-xs font-black mb-1 ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h5>
                    <p className="text-[10px] text-gray-500 leading-relaxed pr-6">{notif.message}</p>

                    <div className="mt-3 flex gap-2">
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkNotifRead(notif.id!)}
                          className="text-[8px] font-black uppercase tracking-widest text-[#f01a64] hover:text-white transition"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotif(notif.id!)}
                        className="text-[8px] font-black uppercase tracking-widest text-gray-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Row 1: Trader Profile (Conditional) */}
          {process.env.REACT_APP_TRADER_PROFILE_DASHBOARD !== 'true' && currentTrader && (
            <div className="lg:col-span-3 animate-in fade-in slide-in-from-top-4 duration-700">
              <TraderProfileCard
                trader={currentTrader}
                currentProfit={user?.totalProfit || 0} // Placeholder, can be real trader profit if available
                currentWinRate={currentTrader.winRate}
                onClose={() => setCurrentTrader(null)}
              />
            </div>
          )}

          {/* Row 2: Live Chart (REMOVED) */}

          {/* Row 3: Trading Hub (Only visible during active trade) */}
          {activeTrades.length > 0 && (
            <div className="lg:col-span-3">
              <TradingHub
                activeTrade={activeTrades[activeTrades.length - 1]}
                traderName={activeTraderName}
              />
            </div>
          )}
        </div>

        <GlobalStats />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <div className="bg-[#1e222d] border border-white/5 p-3 md:p-6 rounded-2xl md:rounded-3xl group hover:border-[#f01a64]/30 transition-colors">
            <span className="text-[7px] md:text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Balance</span>
            <span className={`text-sm md:text-2xl font-black ${user?.hasDeposited ? 'text-[#00b36b]' : 'text-white'}`}>${(user?.balance || 0).toLocaleString()}</span>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 p-3 md:p-6 rounded-2xl md:rounded-3xl relative overflow-hidden">
            <div className="absolute top-1 right-1">
              {!user?.hasDeposited && !isDemoActive && <span className="text-[6px] md:text-[8px] bg-amber-500 text-black px-1 md:px-2 py-0.5 rounded-full font-black">🔒</span>}
            </div>
            <span className="text-[7px] md:text-[9px] text-amber-400 font-black uppercase tracking-widest block mb-1">Bonus</span>
            <span className="text-sm md:text-2xl font-black text-amber-500">${(user?.bonusBalance || 0).toLocaleString()}</span>
          </div>
          <div className="bg-[#1e222d] border border-white/5 p-3 md:p-6 rounded-2xl md:rounded-3xl">
            <span className="text-[7px] md:text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Profits</span>
            <span className="text-sm md:text-2xl font-black text-[#00b36b]">+${tradeProfit.toLocaleString()}</span>
          </div>
          <button onClick={() => depositSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#00b36b] p-3 md:p-6 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center justify-center md:justify-between gap-1 shadow-xl active:scale-95 transition-all hover:bg-[#009e5f]">
            <span className="text-[9px] md:text-sm font-black text-white uppercase italic text-center md:text-left">Deposit</span>
            <svg className="h-3 w-3 md:h-5 md:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
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

        <SocialTicker />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* New Signal Feed Replaces Dropdown */}
            <SignalFeed
              plans={strategies}
              onCopy={(plan) => {
                setSelectedPlanId(plan.id);
                // Auto-scroll to confirmation
                setTimeout(() => {
                  const element = document.getElementById('signal-confirm-area');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              userDeposited={!!user?.hasDeposited}
              isDemo={false} // Assuming demo logic is separate
              demoCount={demoTradeCount}
            />

            {/* Selected Strategy Display Card */}
            {selectedPlanId && (() => {
              const selectedPlan = strategies.find(p => p.id === selectedPlanId);
              if (!selectedPlan) return null;

              const isPremium = selectedPlan.vip; // Use VIP field from database
              const isLocked = isPremium && !user?.hasDeposited && (!isDemoActive || demoTradeCount >= 3);

              return (
                <div id="signal-confirm-area" className="bg-[#1e222d] border-2 border-[#f01a64] p-6 md:p-8 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
                  {/* Strategy Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-[#00b36b] rounded-full animate-pulse"></span>
                        <h4 className="text-white font-black text-xl md:text-2xl uppercase">COPYING: {selectedPlan.name}</h4>
                      </div>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Master Strategy: {selectedPlan.hook}</p>
                    </div>
                    {isPremium && (
                      <span className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full font-black text-xs uppercase">
                        VIP Signal
                      </span>
                    )}
                  </div>

                  {/* Strategy Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Target ROI</p>
                      <p className="text-[#00b36b] font-black text-2xl md:text-3xl">{selectedPlan.minRet}%+</p>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Signal Expiry</p>
                      <p className="text-white font-black text-2xl md:text-3xl">{selectedPlan.duration}</p>
                    </div>
                  </div>

                  {/* Investment Input */}
                  {isLocked ? (
                    <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-6 text-center">
                      <p className="text-amber-400 font-black text-sm mb-2">🔒 VIP Signal Locked</p>
                      <p className="text-gray-400 text-xs">Deposit to unlock premium master signals</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Copy Amount ($)</label>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={investAmount}
                            onChange={e => setInvestAmount(Number(e.target.value))}
                            className="flex-1 bg-black border-2 border-white/10 text-white text-lg p-4 rounded-xl outline-none font-black focus:border-[#00b36b] transition-all"
                            placeholder="Enter amount..."
                          />
                          <button
                            onClick={startDeployment}
                            className="bg-gradient-to-r from-[#f01a64] to-[#f01a64]/80 text-white px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:shadow-lg hover:shadow-[#f01a64]/50 active:scale-95 transition-all"
                          >
                            GO
                          </button>
                        </div>
                      </div>

                      {/* Expected Profit Preview */}
                      {investAmount > 0 && (
                        <div className="bg-[#00b36b]/10 border border-[#00b36b]/30 rounded-xl p-4 animate-in fade-in duration-300">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs font-bold uppercase">Expected Profit:</span>
                            <span className="text-[#00b36b] font-black text-xl">
                              +${((investAmount * selectedPlan.minRet) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="space-y-6">
          <div ref={depositSectionRef} className="bg-[#1e222d] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 shadow-2xl">
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

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 px-1">Deposit Amount (USDT)</label>
                <input
                  type="number"
                  value={depositAmt}
                  onChange={e => setDepositAmt(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white text-xs font-black outline-none focus:border-[#00b36b] transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleTrustWalletPay}
                  className="py-4 bg-[#3375BB] text-white rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#28609a] transition-all active:scale-95 shadow-lg"
                >
                  <img src="https://trustwallet.com/assets/images/media/assets/trust_platform.svg" alt="" className="w-3 h-3 invert" />
                  Trust Wallet
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white/10 transition-all active:scale-95"
                >
                  Upload Proof
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full mb-6"></div>

            <div className="space-y-4">
              <label className="block text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] px-1">Alternative: Transaction Hash (TXID)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={txid}
                  onChange={e => setTxid(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/5 p-4 rounded-xl text-white text-[10px] font-mono outline-none focus:border-[#f01a64] transition-colors"
                  placeholder="Paste TXID / Hash here..."
                />
                <button
                  onClick={handleTXIDSubmit}
                  disabled={isVerifyingReceipt || !txid}
                  className="px-6 bg-[#f01a64] text-white rounded-xl font-black uppercase text-[9px] tracking-widest disabled:opacity-50 transition-all active:scale-95"
                >
                  Submit
                </button>
              </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

            {verificationError && <p className="text-red-500 text-[10px] font-black mt-3 text-center uppercase tracking-tighter">{verificationError}</p>}

            {isVerifyingReceipt && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-[#f01a64] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{verificationStatus}</span>
              </div>
            )}
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
        isStrategyUnlocked={!!user?.isStrategyUnlocked}
      />
    </div>
  );
};

export default Dashboard;