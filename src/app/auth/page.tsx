"use client";

import React, { useState, useEffect } from 'react';
import { signInAction, signUpAction } from '@/app/auth/auth-actions';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, User, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useFormStatus } from 'react-dom';

/**
 * SubmitButton uses React 19's useFormStatus to track the pending state
 * of the parent <form>. This automatically resets when the server action
 * completes or redirects — no manual state management needed.
 */
function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-ink text-white font-semibold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 active:scale-[0.98] uppercase tracking-widest text-[11px] disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" /> Handshaking...
        </>
      ) : (
        <>
          {isLogin ? 'Access Dashboard' : 'Initialize Identity'} <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const searchParams = useSearchParams();

  // These come from the URL redirected by the Server Action
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center p-6 pt-20 md:pt-28 font-sans selection:bg-accent-100">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full"
      >
        {/* Branding */}
        <motion.div variants={itemVariants} className="text-center mb-10 space-y-2">
          <h1 className="type-h2 text-ink">Unrwly</h1>
          <p className="type-label text-neutral-400">
            {isLogin ? 'Command Center Access' : 'Identity Initialization'}
          </p>
        </motion.div>

        {/* The Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-neutral-200 rounded-modal p-10 md:p-12 shadow-2xl shadow-neutral-200/50"
        >
          {message && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="type-caption mb-8 flex items-center justify-center gap-2 border border-accent-200 bg-accent-50 p-4 text-center text-accent-700 uppercase tracking-[0.18em]"
            >
              <AlertCircle size={14} /> {message}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="type-caption mb-8 border border-rose-100 bg-rose-50 p-4 text-center text-rose-500 uppercase tracking-[0.18em]"
            >
              {error}
            </motion.div>
          )}

          {/* Form uses formAction on the button for server action binding */}
          <form action={isLogin ? signInAction : signUpAction} className="space-y-8">
            <div className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 ml-1">Full Identity Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-accent-700 transition-colors" size={18} />
                    <input
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      required={!isLogin}
                      className="w-full bg-white border border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-ink focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-700 transition-all placeholder:text-neutral-300"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 ml-1">Email Identity</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-accent-700 transition-colors" size={18} />
                  <input
                    name="email"
                    type="email"
                    placeholder="name@unrwly.com"
                    required
                    className="w-full bg-white border border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-ink focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-700 transition-all placeholder:text-neutral-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 ml-1">Security Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-accent-700 transition-colors" size={18} />
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-ink focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-700 transition-all placeholder:text-neutral-300"
                  />
                </div>
              </div>
            </div>

            <SubmitButton isLogin={isLogin} />
          </form>

          <div className="mt-10 pt-8 border-t border-neutral-100 flex flex-col items-center gap-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-ink transition-colors"
            >
              {isLogin ? "Need a new identity? Initialize" : "Already verified? Access Center"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center">
        <Loader2 className="animate-spin text-neutral-300" size={32} />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
