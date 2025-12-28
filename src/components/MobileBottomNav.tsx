import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MobileBottomNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const navItems = [
        {
            id: 'market',
            label: 'Marketplace',
            path: '/',
            icon: (isActive: boolean) => (
                <svg className={`w-6 h-6 ${isActive ? 'text-[#f01a64]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            id: 'dashboard',
            label: 'Dashboard',
            path: '/dashboard',
            icon: (isActive: boolean) => (
                <svg className={`w-6 h-6 ${isActive ? 'text-[#f01a64]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#1e222d] border-t border-white/5 pb-safe block md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center justify-center w-full h-full active:scale-95 transition-all"
                        >
                            <div className={`mb-1 transition-transform ${isActive ? '-translate-y-1' : ''}`}>
                                {item.icon(isActive)}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-0 w-12 h-0.5 bg-[#f01a64] rounded-full shadow-[0_0_10px_#f01a64]"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileBottomNav;
