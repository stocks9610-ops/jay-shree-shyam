import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', active: true },
        { label: 'Copy Traders', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', active: false },
        { label: 'My Portfolio', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', active: false },
        { label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', active: false },
    ];

    return (
        <div className="min-h-screen bg-[#0f111a] text-white font-sans selection:bg-[#f01a64]/30">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between p-4 bg-[#1e222d]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#f01a64] to-[#c01048] rounded-lg flex items-center justify-center font-black text-white text-sm">Z</div>
                    <span className="font-black text-lg tracking-tight">ZULUTRADE</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gray-400 hover:text-white transition"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-[#1e222d]/95 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="p-6 md:p-8">
                        <div className="hidden lg:flex items-center gap-2 mb-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#f01a64] to-[#c01048] rounded-xl flex items-center justify-center font-black text-white text-xl shadow-[0_0_20px_rgba(240,26,100,0.3)]">Z</div>
                            <span className="font-black text-xl tracking-tight">ZULUTRADE</span>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.label}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${item.active
                                            ? 'bg-[#f01a64] text-white shadow-[0_10px_20px_rgba(240,26,100,0.2)]'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* Live Status */}
                        <div className="mt-8 p-4 bg-gradient-to-br from-[#131722] to-black rounded-2xl border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b36b] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00b36b]"></span>
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">System Status</p>
                            <p className="text-white text-xs font-bold flex items-center gap-2">
                                <span className="text-[#00b36b]">●</span> OPERATIONAL
                            </p>
                        </div>
                    </div>

                    {/* User Profile Footer */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-[#131722]/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-[#131722] overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=${userProfile?.displayName || 'User'}&background=random`} alt="User" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{userProfile?.displayName || 'Guest User'}</p>
                                <p className="text-[10px] text-gray-500 truncate">Live Account</p>
                            </div>
                            <button onClick={logout} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-[#0f111a] min-h-screen">
                    <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 mb-20 md:mb-0">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Layout;
