
import React, { useState } from 'react';

interface ReceiptData {
  id: number;
  amount: number;
  network: string;
  date: string;
  status: 'COMPLETED' | 'PROCESSING';
  txId: string;
}

const PAYOUT_DATA: ReceiptData[] = [
  { id: 1, amount: 12450.00, network: 'TRC20', date: '2 mins ago', status: 'COMPLETED', txId: 'T9x...j82' },
  { id: 2, amount: 8320.50, network: 'ERC20', date: '5 mins ago', status: 'COMPLETED', txId: '0x4...9a1' },
  { id: 3, amount: 4500.00, network: 'TRC20', date: '12 mins ago', status: 'COMPLETED', txId: 'T2k...p99' },
  { id: 4, amount: 25000.00, network: 'BEP20', date: '18 mins ago', status: 'COMPLETED', txId: '0x1...k22' },
  { id: 5, amount: 1560.00, network: 'TRC20', date: '25 mins ago', status: 'COMPLETED', txId: 'T8m...L12' },
  { id: 6, amount: 9800.75, network: 'TRC20', date: '32 mins ago', status: 'COMPLETED', txId: 'T4v...n33' },
  { id: 7, amount: 3200.00, network: 'ERC20', date: '40 mins ago', status: 'COMPLETED', txId: '0x9...m44' },
  { id: 8, amount: 50000.00, network: 'TRC20', date: '1 hour ago', status: 'COMPLETED', txId: 'T1z...q55' },
];

interface SuccessGalleryProps {
  onClose: () => void;
}

const SuccessGallery: React.FC<SuccessGalleryProps> = ({ onClose }) => {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  return (
    <div className="fixed inset-0 z-[110] bg-[#131722]/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="p-6 md:p-10 flex items-center justify-between border-b border-white/5 bg-[#131722]/50 sticky top-0 z-20">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter italic">Verified Payouts</h2>
          <p className="text-[10px] text-[#f01a64] font-black uppercase tracking-[0.3em] mt-2">Live Blockchain Transaction Feed</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-all p-3 hover:bg-white/5 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* GRID */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PAYOUT_DATA.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedReceipt(item)}
              className="bg-[#1e222d] border border-white/5 rounded-[2rem] p-6 cursor-pointer group hover:border-[#00b36b]/30 hover:bg-[#1e222d]/80 transition-all shadow-xl flex flex-col justify-between h-48 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00b36b]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#00b36b]/10 rounded-full flex items-center justify-center text-[#00b36b]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block">Sent To Wallet</span>
                    <span className="text-[10px] text-white font-mono">{item.txId}</span>
                  </div>
                </div>
                <div className="bg-[#00b36b]/10 text-[#00b36b] px-2 py-1 rounded-lg text-[8px] font-black uppercase">
                  {item.status}
                </div>
              </div>

              <div>
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Amount</span>
                <div className="text-3xl font-black text-white tracking-tight">
                  ${item.amount.toLocaleString()}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px]">
                <span className="text-gray-500 font-bold uppercase">{item.network}</span>
                <span className="text-gray-600 font-mono">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-6 text-center shrink-0 border-t border-white/5">
        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">
          Transactions verified by Global Node Network.
        </p>
      </div>
    </div>
  );
};

export default SuccessGallery;
