
import React from 'react';

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-[#1e222d] border-t border-[#2a2e39]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Why People Love Us</h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-bold uppercase text-xs tracking-widest leading-relaxed">
            Everything you need to build a second income stream and take control of your financial future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="w-16 h-16 bg-[#f01a64]/10 text-[#f01a64] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(240,26,100,0.1)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Your Security First</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              We keep your assets safe and your data private. You can trade with peace of mind knowing you're in good hands.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-[#00b36b]/10 text-[#00b36b] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,179,107,0.1)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Quick & Easy Access</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Deposit and withdraw your profits in minutes using USDT. No complicated paperwork, just fast results.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.903a2 2 0 01-3.566 0l-.727-2.903a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 11-2.828-2.828l2.387-2.387a2 2 0 00.547-1.022l.477-2.387a2 2 0 00-1.414-1.96L4.19 8.614a2 2 0 010-3.566l2.903-.727a2 2 0 001.414-1.96L8.984 0a2 2 0 112.828 2.828L9.425 5.215a2 2 0 00-.547 1.022l-.477 2.387a2 2 0 001.414 1.96l2.903.727a2 2 0 010 3.566l-2.903.727a2 2 0 00-1.414 1.96l-.477 2.387a2 2 0 01-2.828 0l-2.387-2.387z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Tools for Success</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Everything is set up for you. Follow expert strategies automatically and enjoy your path to wealth.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
