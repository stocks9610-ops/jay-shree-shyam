import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, authService } from '../services/authService';

interface NavbarProps {
  onJoinClick: () => void;
  onGalleryClick: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onDashboardClick: () => void;
  onHomeClick: () => void;
  onSearch: (query: string) => void;
  showSearch?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onJoinClick, onGalleryClick, user, onLogout, onDashboardClick, onHomeClick, onSearch, showSearch }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      onDashboardClick();
    } else {
      onHomeClick();
    }
  };

  const handleLinkClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    action();
  };

  const handleSecureLogout = async () => {
    setIsTerminating(true);
    // Simulated security wipe sequence
    await new Promise(r => setTimeout(r, 1800));
    onLogout();
    setIsTerminating(false);
    setShowTerminateConfirm(false);
  };

  // --- MATH LOGIC ---
  const invested = user ? (user.totalInvested || 0) : 0;
  const wallet = user ? user.balance : 0;
  const globalBalance = wallet + invested;
  const netProfit = Math.max(0, globalBalance - 1000);

  const gasFee = netProfit > 0 ? netProfit * 0.02 : 0.00;

  return (
    <>
      <nav className="bg-[#1e222d] border-b border-[#2a2e39] py-3 md:py-4 px-4 md:px-10 flex items-center justify-between sticky top-0 z-[60] backdrop-blur-md bg-opacity-95 gap-4">
        <div
          className="flex items-center gap-2 md:gap-3 cursor-pointer shrink-0 group"
          onClick={handleLogoClick}
          title="Return Home"
        >
          <div className="bg-[#f01a64] p-1 md:p-1.5 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-[#f01a64]/20">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 3v11h7l-7 7V10H6l7-7z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-black text-[#f01a64] tracking-tighter uppercase leading-none">
              CopyTrade
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase whitespace-nowrap tracking-widest">Powered by Zulu Trade</span>
              {/* SIMULATION INDICATOR */}
              <span className="hidden md:block text-[8px] bg-[#f01a64] text-white px-1 rounded font-black uppercase">Version V7.2</span>
            </div>
          </div>
        </div>

        {showSearch && (
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full text-gray-400 focus-within:text-[#f01a64]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full bg-[#131722] border border-[#2a2e39] rounded-xl py-2 pl-10 pr-3 text-xs font-bold text-white placeholder-gray-600 focus:outline-none focus:border-[#f01a64] focus:ring-1 focus:ring-[#f01a64] transition-all"
                placeholder="Search Traders & Strategies..."
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="hidden md:flex gap-10 text-[10px] font-black text-gray-500 uppercase tracking-widest items-center">
          <button onClick={(e) => handleLinkClick(e, onHomeClick)} className="hover:text-white transition-colors relative group">
            Marketplace
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f01a64] group-hover:w-full transition-all duration-300"></span>
          </button>
          <button onClick={(e) => handleLinkClick(e, onGalleryClick)} className="hover:text-[#f01a64] transition-colors relative group">
            Success Hall
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f01a64] group-hover:w-full transition-all duration-300"></span>
          </button>
          {user && (
            <button onClick={(e) => handleLinkClick(e, onDashboardClick)} className="text-[#f01a64] hover:text-white transition-colors relative group">
              My Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 md:gap-3 p-1.5 pr-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 bg-black/20"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[10px] md:text-xs text-white font-black uppercase tracking-tighter truncate max-w-[80px] md:max-w-none">
                    {user.username.split(' ')[0]}
                  </span>
                  <span className={`text-[7px] md:text-[9px] font-black tracking-widest uppercase ${user.hasDeposited ? 'text-[#00b36b]' : 'text-amber-500'}`}>
                    {user.hasDeposited ? 'VERIFIED' : 'UNVERIFIED'}
                  </span>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-xl flex items-center justify-center border border-[#2a2e39] shadow-2xl">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-[#1e222d] border border-[#2a2e39] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[70] animate-in slide-in-from-top-2 fade-in">
                  <div className="p-4 border-b border-[#2a2e39] bg-[#131722]">
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] block">Command Center Hub</span>
                  </div>
                  <div className="p-2 space-y-1">
                    <button onClick={() => { setShowStatus(true); setShowMenu(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-[#2a2e39] rounded-2xl group transition-all">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase tracking-wider group-hover:text-[#f01a64] transition-colors">Account Status</span>
                        <span className="text-[8px] text-gray-500 uppercase tracking-tight">Live Balance Overview</span>
                      </div>
                    </button>
                    <div className="h-px bg-[#2a2e39] my-1 mx-3"></div>
                    <button onClick={() => { setShowTerminateConfirm(true); setShowMenu(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-2xl group transition-all text-red-500">
                      <span className="text-[11px] font-black uppercase tracking-wider">Disconnect Terminal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={(e) => handleLinkClick(e, onJoinClick)}
              className="bg-[#f01a64] text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black text-[10px] md:text-[11px] hover:bg-pink-700 transition-all shadow-[0_10px_25px_rgba(240,26,100,0.3)] uppercase tracking-widest active:scale-95 border border-white/10"
            >
              JOIN
            </button>
          )}
        </div>
      </nav>

      {showStatus && user && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowStatus(false)}
        >
          <div
            className="bg-[#1e222d] w-full max-w-[320px] rounded-2xl border border-[#2a2e39] shadow-2xl p-6 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowStatus(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-1">Account Status</h3>
              <div className="w-8 h-0.5 bg-[#f01a64]"></div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Net Profit</span>
                <span className="text-[#00b36b] font-mono font-bold text-sm tracking-tight">
                  +${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Active Capital</span>
                <span className="text-white font-mono font-bold text-sm tracking-tight">
                  ${wallet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Platform Gas Fee</span>
                <span className="text-amber-500 font-mono font-bold text-sm tracking-tight">
                  -${gasFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="h-px bg-white/5 my-2"></div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-wide">Global Balance</span>
                <span className="text-white font-black font-mono text-lg tracking-tight">
                  ${globalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTerminateConfirm && (
        <div className="fixed inset-0 z-[110] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#1e222d] border border-red-500/20 w-full max-md rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(255,62,62,0.15)] animate-in zoom-in-95">
            <div className="p-10 text-center space-y-8">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                <div className="relative w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-2xl">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-black uppercase text-xl tracking-tighter italic">Sever Uplink Protocol?</h3>
                <p className="text-gray-400 text-xs font-medium leading-relaxed px-6">
                  Disconnecting will sever the live feed to the aggregation pool. PnL tracking will pause until you re-authenticate.
                </p>
              </div>

              {isTerminating ? (
                <div className="space-y-4">
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 animate-[progress_1.8s_ease-in-out_forwards] w-full"></div>
                  </div>
                  <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em] animate-pulse">Purging Session Keys...</span>
                </div>
              ) : (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowTerminateConfirm(false)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleSecureLogout}
                    className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all border border-white/10"
                  >
                    Sever Connection
                  </button>
                </div>
              )}
              <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] italic">Security Protocol: AES-256</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;