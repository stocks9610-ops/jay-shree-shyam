
import React, { useState } from 'react';

interface GalleryItem {
  id: number;
  url: string;
  category: 'payout' | 'setup' | 'community';
  title: string;
  description: string;
}

const GALLERY_DATA: GalleryItem[] = [
  { id: 1, category: 'payout', title: 'USDT Withdrawal Success', description: '$12,450 Profit extracted via professional market channel.', url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&h=1000&fit=crop' },
  { id: 2, category: 'setup', title: 'Professional Hub ZA', description: 'Institutional front-running hub in Sandton.', url: 'https://images.unsplash.com/photo-1611974717525-587441658ee0?w=800&h=800&fit=crop' },
  { id: 3, category: 'community', title: 'Dubai Member Meetup', description: 'Top 50 copy-traders gathering for global strategy.', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop' },
  { id: 4, category: 'payout', title: 'Exchange Verification', description: 'Account verified with $45k daily volume caps.', url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop' },
  { id: 5, category: 'setup', title: 'Mobile Market Access', description: 'Trading on the go with zero-latency synchronization.', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=1000&fit=crop' },
  { id: 6, category: 'payout', title: 'Profit Realization', description: 'Another $5,000 profit released to member wallet.', url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&h=800&fit=crop' },
  { id: 7, category: 'community', title: 'Success Milestones', description: 'Crossing the 50,000 active traders mark.', url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop' },
  { id: 8, category: 'setup', title: 'Home Office Freedom', description: 'Financial freedom looks like this. No boss, just automated profits.', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=800&fit=crop' }
];

interface SuccessGalleryProps {
  onClose: () => void;
}

const SuccessGallery: React.FC<SuccessGalleryProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<'all' | 'payout' | 'setup' | 'community'>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredItems = filter === 'all' 
    ? GALLERY_DATA 
    : GALLERY_DATA.filter(item => item.category === filter);

  return (
    <div className="fixed inset-0 z-[110] bg-[#131722]/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="p-6 md:p-10 flex items-center justify-between border-b border-white/5 bg-[#131722]/50 sticky top-0 z-20">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter italic">Elite Success Hall</h2>
          <p className="text-[10px] text-[#f01a64] font-black uppercase tracking-[0.3em] mt-2">Verified Proof of Professional Success</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-all p-3 hover:bg-white/5 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex justify-center gap-3 p-6 shrink-0">
        {['all', 'payout', 'setup', 'community'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border ${
              filter === cat 
              ? 'bg-[#f01a64] text-white border-[#f01a64] shadow-[0_0_15px_rgba(240,26,100,0.4)]' 
              : 'bg-white/5 text-gray-500 border-white/10 hover:border-[#f01a64]/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* MASONRY GRID */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 hover:border-[#f01a64] transition-all break-inside-avoid shadow-2xl"
            >
              <img src={item.url} alt={item.title} className="w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              
              {/* VERIFICATION BADGE */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#00b36b] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-lg z-10">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Profit
              </div>

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <h4 className="text-white font-black text-sm uppercase mb-1">{item.title}</h4>
                <p className="text-gray-400 text-[10px] font-medium leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full max-h-[85vh] flex flex-col md:flex-row bg-[#1e222d] rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10">
            <div className="flex-1 bg-black flex items-center justify-center">
              <img src={selectedImage.url} className="w-full h-full object-contain" />
            </div>
            <div className="w-full md:w-80 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-[#1e222d] to-[#131722]">
              <span className="text-[#f01a64] text-[9px] font-black uppercase tracking-[0.4em] mb-4">Verification Artifact #{selectedImage.id}749</span>
              <h3 className="text-white font-black text-2xl lg:text-3xl uppercase tracking-tighter mb-4 italic">{selectedImage.title}</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">{selectedImage.description}</p>
              
              <div className="space-y-4 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00b36b] rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Status: Payout Confirmed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Network: TRC-20 Exchange</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedImage(null)}
                className="mt-12 w-full py-4 bg-[#f01a64] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CAPTION */}
      <div className="p-6 text-center shrink-0 border-t border-white/5">
        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">
          All payouts verified by Professional Replication Protocol v5.0. Verified Success Hall.
        </p>
      </div>
    </div>
  );
};

export default SuccessGallery;
