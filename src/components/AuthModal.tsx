"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { login, register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let result;
    if (mode === 'login') {
      result = await login(email, password);
    } else {
      result = await register(firstName, lastName, email, password);
    }

    if (result.success) {
      onClose();
    } else {
      setError(result.errors?.[0]?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="type-h3">
                  {mode === 'login' ? 'Welcome Back' : 'Join The Unrwly'}
                </h2>
                <p className="text-neutral-500 text-xs tracking-widest uppercase">
                  {mode === 'login' ? 'SIGN IN TO YOUR ARCHIVE' : 'CREATE YOUR CUSTOMER PROFILE'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" size={14} />
                        <input
                          required
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 py-3 pl-10 pr-4 text-sm focus:border-white transition-colors outline-none"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" size={14} />
                        <input
                          required
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 py-3 pl-10 pr-4 text-sm focus:border-white transition-colors outline-none"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" size={14} />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 py-3 pl-10 pr-4 text-sm focus:border-white transition-colors outline-none"
                      placeholder="YOU@EXAMPLE.COM"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" size={14} />
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 py-3 pl-10 pr-4 text-sm focus:border-white transition-colors outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-red-500 text-[10px] uppercase tracking-widest bg-red-500/10 p-3 border border-red-500/20"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-white text-black py-4 font-bold uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      {mode === 'login' ? 'Secure Login' : 'Create Profile'}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-neutral-900 text-center">
                <button 
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-neutral-500 hover:text-white text-[10px] uppercase tracking-widest transition-colors"
                >
                  {mode === 'login' ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
