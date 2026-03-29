import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, Loader2, Mail, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  onLogin: (user: any) => void;
}

// Local Auth Simulation (No Firebase Auth required)
const STORAGE_KEY = 'abe_bypass_local_users';

export default function Auth({ onLogin }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        if (isSignUp) {
          // Check if user already exists
          if (storedUsers.find((u: any) => u.email === email)) {
            setError("User already exists with this email.");
            setLoading(false);
            return;
          }

          const newUser = {
            uid: `local_${Math.random().toString(36).substring(7)}`,
            email,
            password, // In a real app, this would be hashed
            displayName,
            createdAt: Date.now()
          };

          storedUsers.push(newUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storedUsers));
          onLogin(newUser);
        } else {
          // Sign In
          const user = storedUsers.find((u: any) => u.email === email && u.password === password);
          if (user) {
            onLogin(user);
          } else {
            setError("Invalid email or password.");
          }
        }
      } catch (err) {
        console.error("Local Auth Error:", err);
        setError("An error occurred during authentication.");
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#F27D26] rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-[0_0_30px_rgba(242,125,38,0.2)]">
            <Shield className="text-black w-6 h-6 md:w-8 md:h-8" />
          </div>
          
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase italic mb-2">
              ABE <span className="text-[#F27D26]">Bypass</span>
            </h1>
            <p className="text-white/40 text-[10px] md:text-sm uppercase tracking-[0.2em] font-bold">
              {isSignUp ? 'Create Local Account' : 'Terminal Access'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] p-3 rounded-xl mb-6 text-center uppercase font-bold tracking-widest"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#F27D26] transition-colors text-white placeholder:text-white/20"
                  placeholder="Full Name"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#F27D26] transition-colors text-white placeholder:text-white/20"
                placeholder="Email Address"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#F27D26] transition-colors text-white placeholder:text-white/20"
                placeholder="Password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F27D26] text-black font-black py-4 rounded-xl hover:bg-[#ff8c38] transition-all flex items-center justify-center gap-2 uppercase italic tracking-widest disabled:opacity-50 shadow-[0_0_20px_rgba(242,125,38,0.2)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Initialize Account' : 'Authenticate'}
                  {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-white/40 hover:text-white text-xs transition-colors uppercase tracking-widest font-bold"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
