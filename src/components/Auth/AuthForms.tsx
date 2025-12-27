import React, { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    User
} from 'firebase/auth';
import { auth } from '../../firebase.config';
import { createUserProfile } from '../../services/userService';

interface AuthFormsProps {
    onSuccess: (user: User) => void;
}

const AuthForms: React.FC<AuthFormsProps> = ({ onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        walletAddress: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                // Login
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                );
                onSuccess(userCredential.user);
            } else {
                // Signup
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                );

                // Create user profile in Firestore
                await createUserProfile(
                    userCredential.user.uid,
                    formData.email,
                    formData.displayName,
                    formData.walletAddress
                );

                onSuccess(userCredential.user);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#131722] flex items-center justify-center p-4">
            <div className="bg-[#1e222d] p-8 rounded-3xl border border-[#2a2e39] max-w-md w-full">
                <h2 className="text-3xl font-black text-white mb-6 text-center">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white focus:border-[#f01a64] outline-none"
                                placeholder="John Doe"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white focus:border-[#f01a64] outline-none"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white focus:border-[#f01a64] outline-none"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">
                                USDT TRC-20 Wallet Address (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.walletAddress}
                                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                                className="w-full px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-xl text-white focus:border-[#f01a64] outline-none"
                                placeholder="TXyz123..."
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#f01a64] hover:bg-[#d01555] text-white rounded-xl font-black uppercase tracking-wider transition disabled:opacity-50"
                    >
                        {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-gray-400 hover:text-white transition"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthForms;
