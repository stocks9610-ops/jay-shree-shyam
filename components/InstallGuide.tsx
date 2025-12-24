
import React from 'react';

interface InstallGuideProps {
  onClose: () => void;
}

const InstallGuide: React.FC<InstallGuideProps> = ({ onClose }) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#1e222d] border border-[#2a2e39] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Download as App</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-[#131722] p-5 rounded-2xl border border-[#2a2e39]">
              <p className="text-gray-300 text-sm font-bold mb-4">
                {isIOS 
                  ? "To install on your iPhone:" 
                  : "To install on your Android phone:"}
              </p>
              
              <div className="space-y-4">
                {isIOS ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-black">1</div>
                      <p className="text-xs text-gray-400">Tap the <span className="text-white font-bold">Share</span> icon (box with arrow) at the bottom.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-black">2</div>
                      <p className="text-xs text-gray-400">Scroll down and tap <span className="text-white font-bold">"Add to Home Screen"</span>.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-[#f01a64] rounded-full flex items-center justify-center text-white font-black">1</div>
                      <p className="text-xs text-gray-400">Tap the <span className="text-white font-bold">Menu (3 dots ⋮)</span> in the top right of Chrome.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-[#f01a64] rounded-full flex items-center justify-center text-white font-black">2</div>
                      <p className="text-xs text-gray-400">Tap <span className="text-white font-bold">"Install App"</span> or <span className="text-white font-bold">"Add to Home Screen"</span>.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                The app will appear on your phone's home screen just like a regular app!
              </p>
            </div>

            <button 
              onClick={onClose}
              className="w-full bg-[#f01a64] hover:bg-pink-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs"
            >
              GOT IT!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;
