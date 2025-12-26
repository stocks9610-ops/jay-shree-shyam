
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.config';
import { createUserProfile, UserData } from '../services/userService';

interface SignupModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          alert("Please enter email and password to login.");
          setIsSubmitting(false);
          return;
        }
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(userCredential.user);
      } else {
        const timestamp = Date.now().toString().slice(-6);
        const finalEmail = email.trim() || `trader_${timestamp}@copytrade.com`;
        const finalPassword = password.trim() || 'secure_access';
        const finalName = username.trim() || `Trader ${timestamp}`;

        const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, finalPassword);

        // Create user profile in Firestore
        await createUserProfile(userCredential.user.uid, finalEmail, finalName);

        onSuccess(userCredential.user);
      }
    } catch (error: any) {
      console.error("Auth Error", error);
      let msg = "Authentication failed.";
      if (error.code === 'auth/email-already-in-use') msg = "Email already in use.";
      if (error.code === 'auth/wrong-password') msg = "Invalid password.";
      if (error.code === 'auth/user-not-found') msg = "User not found.";
      alert(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#1e222d] w-full h-full sm:h-auto sm:max-w-md sm:rounded-[2.5rem] flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="p-8 md:p-10 overflow-y-auto no-scrollbar flex-1 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
              {isLogin ? 'Member Access' : 'Create Account'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-500 active:text-white transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Username</label>
                <input
                  type="text"
                  placeholder="e.g. CryptoKing"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-5 py-4 text-white focus:border-[#f01a64] font-bold text-sm outline-none placeholder:text-gray-600 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">
                Email {isLogin ? '' : '(Optional)'}
              </label>
              <input
                type="email"
                placeholder={isLogin ? "Registered email" : "Auto-generated if empty"}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-5 py-4 text-white focus:border-[#f01a64] font-bold text-sm outline-none placeholder:text-gray-600 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">
                Password {isLogin ? '' : '(Optional)'}
              </label>
              <input
                type="password"
                placeholder={isLogin ? "Secure password" : "Auto-generated if empty"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl px-5 py-4 text-white focus:border-[#f01a64] font-bold text-sm outline-none placeholder:text-gray-600 transition-colors"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-[#f01a64] py-5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 hover:bg-pink-600 transition-all border border-white/10"
              >
                {isSubmitting ? 'Verifying Protocol...' : isLogin ? 'JOIN' : 'Start Journey'}
              </button>
            </div>

            <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-[10px] text-gray-500 font-black uppercase tracking-widest text-center py-4 hover:text-white transition-colors active:scale-95">
              {isLogin ? "New here? Create Profile" : "Existing Member? Login"}
            </button>
          </form>

          {!isLogin && (
            <div className="mt-6 p-4 bg-black/20 rounded-2xl border border-white/5">
              <p className="text-[9px] text-gray-500 text-center leading-relaxed px-2 font-medium uppercase tracking-tight">
                Live Trading Account generated for your ID. Connected to Global Liquidity Pools. <span className="text-[#00b36b] font-black">Status: Active.</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
