import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#131722] flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && userProfile?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-[#131722] flex items-center justify-center p-4">
                <div className="bg-[#1e222d] p-8 rounded-3xl border border-[#2a2e39] max-w-md text-center">
                    <h2 className="text-2xl font-black text-white mb-4">Access Denied</h2>
                    <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-[#f01a64] hover:bg-[#d01555] text-white rounded-xl font-bold"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
