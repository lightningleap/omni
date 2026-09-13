"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  // The embedded flow returns `?payment_intent=…`; the hosted flow used
  // `?session_id=…`. Both are accepted so links from before the switch — and
  // any order still completing through a hosted session — still confirm.
  const paymentIntentId = searchParams.get("payment_intent");
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      if (!paymentIntentId && !sessionId) {
        setStatus("error");
        return;
      }

      try {
        const query = paymentIntentId
          ? `payment_intent=${encodeURIComponent(paymentIntentId)}`
          : `session_id=${encodeURIComponent(sessionId!)}`;
        const res = await fetch(`/api/checkout/verify?${query}`);
        const data = await res.json();

        if (data.success) {
          setOrderNumber(data.orderNumber);
          setStatus("success");
          
          // Trigger celebration. The canvas library paints on a <canvas>, so it
          // needs a resolved colour rather than a custom property — read the
          // active storefront's accent off the document instead of hard-coding
          // one, so Kids celebrates in its own mint and Adult in its green.
          const accent =
            getComputedStyle(document.documentElement)
              .getPropertyValue('--accent-600')
              .trim() || "#509176";

          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: [accent, "#10b981", "#000000"]
          });
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("VERIFICATION ERROR:", err);
        setStatus("error");
      }
    };

    verifySession();
  }, [sessionId, paymentIntentId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-modal p-12 text-center shadow-xl shadow-neutral-200/50">
        {status === "loading" ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="animate-spin text-accent-700" size={48} />
            <p className="type-label text-neutral-400">Verifying Payment...</p>
          </div>
        ) : status === "error" ? (
          <div className="space-y-8">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle className="text-rose-500" size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="type-h2 text-ink">Verification Failed</h1>
              <p className="type-body text-neutral-500">
                We couldn&apos;t verify your payment session. If you believe this is an error, please contact support.
              </p>
            </div>
            <Link href="/contact" className="type-button w-full inline-block bg-ink text-white py-4 rounded-2xl uppercase tracking-[0.18em] text-[11px] hover:bg-neutral-800 transition-all">
              Contact Support
            </Link>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
              <CheckCircle2 className="text-emerald-500" size={40} />
            </div>
            
            <h1 className="type-h2 mb-2 text-ink">Order Confirmed</h1>
            <p className="type-body mb-8 text-neutral-500">
              Your Unrwly drop is being prepared for production. 
            </p>

            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 mb-10 text-left">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200/50">
                <span className="type-caption text-neutral-400 uppercase tracking-[0.18em]">Order Ref</span>
                <span className="text-[11px] font-mono font-bold text-ink">{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="type-caption text-neutral-400 uppercase tracking-[0.18em]">Status</span>
                <span className="type-caption flex items-center gap-1 text-emerald-600 uppercase tracking-[0.18em]">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Verified
                </span>
              </div>
              <div className="space-y-1">
                <span className="type-caption text-neutral-400 uppercase tracking-[0.18em]">Session Tracer</span>
                <p className="text-[10px] font-mono text-neutral-400 break-all">{sessionId?.substring(0, 32)}...</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/account" className="w-full bg-ink text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all uppercase tracking-widest text-[11px]">
                <Package size={16} /> Track in Account
              </Link>
              <Link href="/collections" className="w-full bg-white text-neutral-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:text-ink transition-all uppercase tracking-widest text-[10px]">
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-neutral-300" size={32} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
