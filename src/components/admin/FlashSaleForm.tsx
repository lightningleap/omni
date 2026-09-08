"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMarketingSettings } from "@/app/actions/marketing";
import { Loader2, Zap, BellRing } from "lucide-react";

interface FlashSaleFormProps {
  initialData: {
    flashSaleActive: boolean;
    flashSaleEndsAt: Date | null;
    flashSaleMessage: string;
    welcomeActive: boolean;
    welcomeTitle: string;
    welcomeSubtitle: string;
    welcomeDescription: string;
  } | null;
}

export default function FlashSaleForm({ initialData }: FlashSaleFormProps) {
  // Flash Sale States
  const [active, setActive] = useState(initialData?.flashSaleActive || false);
  const [message, setMessage] = useState(initialData?.flashSaleMessage || "LIMITED DROP ENDING SOON");
  
  // Welcome Protocol States
  const [welcomeActive, setWelcomeActive] = useState(initialData?.welcomeActive ?? true);
  const [welcomeTitle, setWelcomeTitle] = useState(initialData?.welcomeTitle || "10%");
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(initialData?.welcomeSubtitle || "OFF YOUR FIRST ORDER");
  const [welcomeDescription, setWelcomeDescription] = useState(initialData?.welcomeDescription || "JOIN THE CLUB FOR EXCLUSIVE ACCESS.");

  // Format dates for html input type="datetime-local" (YYYY-MM-DDThh:mm)
  const formatForInput = (date: Date | null) => {
    if (!date) return "";
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [endsAt, setEndsAt] = useState(formatForInput(initialData?.flashSaleEndsAt || null));
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const endsAtDate = endsAt ? new Date(endsAt) : new Date();
      await updateMarketingSettings({
        flashSaleActive: active,
        flashSaleMessage: message,
        flashSaleEndsAt: endsAtDate,
        welcomeActive,
        welcomeTitle,
        welcomeSubtitle,
        welcomeDescription,
      });

      setFeedback({ message: "Marketing Protocol synchronized successfully.", type: "success" });
      router.refresh(); 
    } catch (error) {
      setFeedback({ message: "Sync failed. Please check the engine state.", type: "error" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 text-ink">
      
      {/* SECTION 1: FLASH SALE */}
      <div className="space-y-8 bg-white p-10 rounded-panel border border-[#EFEDE8]">
        <div className="flex items-center gap-4 mb-2">
          <Zap className="text-brand-terracotta" size={24} />
          <h2 className="text-2xl font-sans font-semibold tracking-tighter lowercase text-ink">Flash Sale Protocol</h2>
        </div>

        <div className="flex items-center justify-between border border-[#EFEDE8] p-8 bg-[#FBFAF8] rounded-panel">
          <div className="space-y-1">
            <label className="text-sm font-sans font-bold tracking-tighter lowercase text-ink">
              Enable Flash Sale
            </label>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
              Activates the vertical "Creative Sticker" on storefront
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 border ${
              active ? "bg-brand-terracotta border-brand-terracotta" : "bg-neutral-200 border-neutral-300"
            }`}
          >
            <span
              className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform duration-300 ${
                active ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[11px] font-sans font-bold tracking-tighter lowercase text-neutral-500 block ml-2">
              Announcement Message
            </label>
            <input
              type="text"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#FBFAF8] border border-[#EFEDE8] text-sm font-medium px-6 py-5 text-ink focus:outline-none focus:ring-4 focus:ring-[#D97757]/5 focus:border-brand-terracotta focus:bg-white transition-all rounded-panel"
              placeholder="e.g. SUMMER VAULT UNLOCKED"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-sans font-bold tracking-tighter lowercase text-neutral-500 block ml-2">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              required={active}
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full bg-[#FBFAF8] border border-[#EFEDE8] text-sm font-medium px-6 py-5 text-ink focus:outline-none focus:ring-4 focus:ring-[#D97757]/5 focus:border-brand-terracotta focus:bg-white transition-all rounded-panel"
            />
          </div>
        </div>

        <div className="bg-[#FBFAF8] border border-[#EFEDE8] rounded-panel p-10 flex justify-end">
          <div className="bg-[#FFF5F2] w-full max-w-xs p-6 rounded-l-2xl border-l-2 border-t-2 border-b-2 border-brand-terracotta/25 flex flex-col gap-3 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-brand-terracotta fill-brand-terracotta/20" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-terracotta/60">Studio Preview</span>
              </div>
              <h2 className="text-xl font-sans font-semibold tracking-tighter text-brand-terracotta lowercase leading-[1.1]">
                {message || "creative protocol message"}
              </h2>
            </div>

            <div className="flex items-center gap-3 border-t border-brand-terracotta/25 pt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-mono font-bold text-brand-terracotta">00</span>
                <span className="text-[9px] font-sans text-brand-terracotta/60">d</span>
              </div>
              <div className="w-px h-3 bg-brand-terracotta/25" />
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-mono font-bold text-brand-terracotta animate-pulse">00</span>
                <span className="text-[9px] font-sans text-brand-terracotta/60">s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WELCOME PROTOCOL */}
      <div className="space-y-8 bg-white p-10 rounded-panel border border-[#EFEDE8]">
        <div className="flex items-center gap-4 mb-2">
          <BellRing className="text-accent-700" size={24} />
          <h2 className="text-2xl font-sans font-semibold tracking-tighter lowercase text-ink">Welcome Protocol (Newsletter)</h2>
        </div>

        <div className="flex items-center justify-between border border-[#EFEDE8] p-8 bg-[#FBFAF8] rounded-panel">
          <div className="space-y-1">
            <label className="text-sm font-sans font-bold tracking-tighter lowercase text-ink">
              Active Status
            </label>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
              Toggle visibility of the "Peach & Indigo" welcome modal
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWelcomeActive(!welcomeActive)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 border ${
              welcomeActive ? "bg-accent-800 border-accent-800" : "bg-neutral-200 border-neutral-300"
            }`}
          >
            <span
              className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform duration-300 ${
                welcomeActive ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[11px] font-sans font-bold tracking-tighter lowercase text-neutral-500 block ml-2">Main Title</label>
            <input
              type="text"
              required
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              className="w-full bg-[#FBFAF8] border border-[#EFEDE8] text-sm font-medium px-6 py-5 text-ink focus:outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-800 focus:bg-white transition-all rounded-panel"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-sans font-bold tracking-tighter lowercase text-neutral-500 block ml-2">Subtitle</label>
            <input
              type="text"
              required
              value={welcomeSubtitle}
              onChange={(e) => setWelcomeSubtitle(e.target.value)}
              className="w-full bg-[#FBFAF8] border border-[#EFEDE8] text-sm font-medium px-6 py-5 text-ink focus:outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-800 focus:bg-white transition-all rounded-panel"
            />
          </div>
          <div className="space-y-3 md:col-span-2">
            <label className="text-[11px] font-sans font-bold tracking-tighter lowercase text-neutral-500 block ml-2">Description</label>
            <input
              type="text"
              required
              value={welcomeDescription}
              onChange={(e) => setWelcomeDescription(e.target.value)}
              className="w-full bg-[#FBFAF8] border border-[#EFEDE8] text-sm font-medium px-6 py-5 text-ink focus:outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-800 focus:bg-white transition-all rounded-panel"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 sticky bottom-10 px-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-ink text-white hover:bg-black rounded-full flex items-center justify-center gap-3 py-6 text-[10px] font-semibold uppercase tracking-[0.4em] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Synchronizing Creative Engine...
            </>
          ) : (
            "Save Creative Protocol"
          )}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-6 text-[10px] font-semibold tracking-widest uppercase border text-center rounded-panel animate-in fade-in slide-in-from-bottom-4 ${
            feedback.type === 'success'
              ? 'bg-accent-50 text-accent-800 border-accent-200 '
              : 'bg-[#FBF3F0] text-brand-terracotta border-[#E7D3CB] '
          }`}
        >
          {feedback.message}
        </div>
      )}
    </form>
  );
}
