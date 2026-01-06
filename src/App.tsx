import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { isAdmin } from './services/userService';
import AuthForms from './components/Auth/AuthForms';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import TraderList from './components/TraderList';
import Footer from './components/Footer';
import TickerTape from './components/TickerTape';
import LiveActivityFeed from './components/LiveActivityFeed';
import InfoSection from './components/InfoSection';
import SuccessGallery from './components/SuccessGallery';
import SignupModal from './components/SignupModal';
import ReferralTerminal from './components/ReferralTerminal';
import MarketChart from './components/MarketChart';




// Admin & Auth Components - Lazy loaded for better performance

const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));

const WithdrawalManager = lazy(() => import('./components/User/WithdrawalManager'));
const Dashboard = lazy(() => import('./components/Dashboard'));
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Trader } from './types';

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Main Layout Component (Landing Page)
const MainLayout = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-pink-500/30 overflow-x-hidden bg-[#131722] relative">
      <TickerTape />
      <Navbar
        onJoinClick={() => setShowSignup(true)}
        onGalleryClick={() => setShowGallery(true)}
        user={userProfile}
        onLogout={() => { }} // Logout handled by AuthContext or Firebase directly usually
        onDashboardClick={() => navigate('/dashboard')}
        onHomeClick={() => navigate('/')}
        onSearch={() => { }}
        showSearch={true}
      />

      <LiveActivityFeed />

      <main className="flex-grow">
        <Hero
          hasDeposited={false} // Todo: get from user profile
          onJoinClick={() => setShowSignup(true)}
          onStartJourney={() => document.getElementById('traders')?.scrollIntoView()}
          externalShowMentorship={() => { }}
          onShareClick={() => {
            if (currentUser) {
              setShowReferral(true);
            } else {
              setShowSignup(true);
            }
          }}
        />

        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-10 mb-8 md:mb-12">
          <div className="w-full bg-[#1e222d] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden h-[450px] md:h-[600px] border-t-[#00b36b] border-t-2">
            <MarketChart />
          </div>
        </div>

        <div id="traders">
          <TraderList onCopyClick={(trader) => {
            if (currentUser) {
              navigate(`/dashboard?trader=${encodeURIComponent(trader.name)}`);
            } else {
              setShowSignup(true);
            }
          }} />
        </div>

        <Features />
      </main>

      <InfoSection />
      <Footer />

      {/* Modals */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={() => {
            setShowSignup(false);
            navigate('/dashboard');
          }}
        />
      )}
      {showGallery && <SuccessGallery onClose={() => setShowGallery(false)} />}
      {showReferral && currentUser && (
        <ReferralTerminal
          onClose={() => setShowReferral(false)}
        />
      )}
    </div>
  );
};

// Dashboard Layout Wrapper to provide Auth Context to Navbar
const DashboardLayout = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <Navbar
        onJoinClick={() => { }}
        onGalleryClick={() => { }}
        user={userProfile}
        onLogout={() => { }}
        onDashboardClick={() => navigate('/dashboard')}
        onHomeClick={() => navigate('/')}
        onSearch={() => { }}
        showSearch={true}
      />
      <Suspense fallback={
        <div className="min-h-screen bg-[#131722] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f01a64]"></div>
        </div>
      }>
        <Dashboard />
      </Suspense>
    </>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const handleSuccess = async (user) => {
    const admin = await isAdmin(user.uid);
    if (admin) {
      navigate('/secure-access-shyam');
    } else {
      navigate('/dashboard');
    }
  };
  return <AuthForms onSuccess={handleSuccess} />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<LoginPage />} />{/* Dashboard Route - Public Access */}
          <Route path="/dashboard" element={<DashboardLayout />} />

          {/* Protected Admin Routes - Hidden URL for security */}
          <Route path="/secure-access-shyam" element={
            <ProtectedRoute adminOnly={true}>
              <Suspense fallback={<div className="min-h-screen bg-[#131722] text-white flex items-center justify-center">Loading Admin...</div>}>
                <div className="min-h-screen bg-[#131722] pt-20">
                  <Navbar
                    onJoinClick={() => { }}
                    onGalleryClick={() => { }}
                    user={null}
                    onLogout={() => { }}
                    onDashboardClick={() => { }}
                    onHomeClick={() => { /* Already at root, no action */ }}
                    onSearch={() => { }}
                    showSearch={false}
                  />
                  <AdminDashboard />
                </div>
              </Suspense>
            </ProtectedRoute>
          } />


        </Routes>
      </Router>
    </AuthProvider >
  );
}

export default App;