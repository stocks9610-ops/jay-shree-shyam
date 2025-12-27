
import React from 'react';

const Footer: React.FC = () => {
  const handleEmptyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("🔒 PLATFORM LOCK ACTIVE\n\nThis section is currently optimized for internal C-Level operations. Access is restricted to verified accounts with active deposits.");
  };

  return (
    <footer className="bg-[#131722] border-t border-[#2a2e39] py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* TOP STORY SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#f01a64] p-1.5 rounded-lg shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 3v11h7l-7 7V10H6l7-7z" />
                </svg>
              </div>
              <h4 className="text-white font-black text-2xl uppercase tracking-tighter">Global Vision</h4>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              We empower global investors to navigate complex markets with ease and total privacy. Designed for both beginners and professionals, our platform bridges the gap between sophisticated strategies and seamless execution.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Headquartered in <span className="text-white font-bold">Sevilles, South Africa</span>, our network spans over a decade of high-performance market history, offering unparalleled access to World Trade Platform tools. Securely.
            </p>
          </div>

          <div className="bg-[#1e222d] p-8 lg:p-12 rounded-[2rem] border border-[#2a2e39] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3v11h7l-7 7V10H6l7-7z" /></svg>
            </div>
            <h5 className="text-white font-black text-xl mb-6 uppercase tracking-tighter">Sophisticated Infrastructure</h5>
            <div className="space-y-6">
              <p className="text-gray-500 text-sm leading-relaxed">
                Our architecture is optimized for instant liquidity and rapid deployment of advanced features. Experience a world-class trading journey where every interaction is refined for clarity and impact.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#2a2e39]">
                <div>
                  <span className="text-white font-black text-2xl block">High Volume</span>
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Optimized Throughput</span>
                </div>
                <div>
                  <span className="text-white font-black text-2xl block">Secure Nodes</span>
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Distributed Privacy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20 text-sm">
          <div>
            <h5 className="text-gray-300 font-black mb-6 uppercase text-[10px] tracking-[0.2em]">Platform Core</h5>
            <ul className="space-y-3 text-gray-500 font-bold">
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Forex Masters</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Crypto Alphas</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Binary Strategy</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">World Trade Access</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-gray-300 font-black mb-6 uppercase text-[10px] tracking-[0.2em]">Liquidity</h5>
            <ul className="space-y-3 text-gray-500 font-bold">
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">USDT Gateway</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">TrustWallet Sync</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Instant Payout</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Rapid Deposit</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-gray-300 font-black mb-6 uppercase text-[10px] tracking-[0.2em]">Privacy Hub</h5>
            <ul className="space-y-3 text-gray-500 font-bold">
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Encryption Protocols</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Advanced Security</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Data Governance</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Full Anonymity</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-gray-300 font-black mb-6 uppercase text-[10px] tracking-[0.2em]">Standards</h5>
            <ul className="space-y-3 text-gray-500 font-bold">
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Performance History</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Live Visualization</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Expert Vetting</a></li>
              <li><a href="#" onClick={handleEmptyClick} className="hover:text-[#f01a64] transition-colors">Network Integrity</a></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-12 border-t border-[#2a2e39]">
          <div className="flex flex-col items-center gap-8">
            <div className="text-center max-w-4xl">
              <h6 className="text-white font-black uppercase text-sm mb-4 tracking-tight italic">Elegance in Execution. Power in Privacy.</h6>
              <p className="text-gray-500 text-xs leading-relaxed font-bold uppercase tracking-tight">
                Designed for professional results with zero friction. Optimized liquidity paths via USDT and TrustWallet ensure total asset control. Securely.
              </p>
            </div>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
              © 2025 COPYTRADE PLATFORM. POWERED BY ZULUTRADE TECHNOLOGY. SOUTH AFRICA NETWORK.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
