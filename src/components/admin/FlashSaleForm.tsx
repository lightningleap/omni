"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMarketingSettings } from "@/app/actions/marketing";
import { Loader2, Zap, BellRing } from "lucide-react";
import {
  ADMIN_RULE,
  AdminButton,
  AdminField,
  AdminInput,
  AdminMono,
  AdminPanel,
  AdminSectionHeading,
} from "@/components/admin/ui/primitives";

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
    /* Two settings panels and a save bar. Everything here was set in a
       lowercase, tracking-tighter register that exists nowhere else in the
       studio — 24px lowercase panel headings, `text-[11px] font-bold
       tracking-tighter lowercase` field labels, 40px panel padding, 20px input
       padding, and a submit button at 10px uppercase on 0.4em tracking. It is
       the shared panel, field and button now. */
    <form onSubmit={handleSubmit} className="space-y-6 text-ink">
      {/* ── FLASH SALE ─────────────────────────────────────────────────── */}
      <AdminPanel padded className="space-y-5">
        <div className="flex items-center gap-2.5">
          <Zap aria-hidden className="text-brand-terracotta" size={16} />
          <AdminSectionHeading>Flash sale</AdminSectionHeading>
        </div>

        <div
          style={{ borderColor: ADMIN_RULE }}
          className="flex items-center justify-between gap-4 rounded-card border bg-[#FBFAF8] p-4"
        >
          <div>
            <p className="type-admin-body font-semibold text-ink">Enable flash sale</p>
            <p className="type-admin-meta text-neutral-500">
              Shows the vertical sale sticker on the storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            role="switch"
            aria-checked={active}
            aria-label="Enable flash sale"
            className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 focus-visible:ring-offset-1 ${
              active
                ? "border-brand-terracotta bg-brand-terracotta"
                : "border-neutral-300 bg-neutral-200"
            }`}
          >
            <span
              className={`absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
                active ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <AdminField label="Announcement message" htmlFor="flash-message">
            <AdminInput
              id="flash-message"
              type="text"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Summer vault unlocked"
            />
          </AdminField>

          <AdminField label="Ends at" htmlFor="flash-ends-at">
            <AdminInput
              id="flash-ends-at"
              type="datetime-local"
              required={active}
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </AdminField>
        </div>

        {/* The storefront preview. It keeps its own terracotta register, because
            it is a picture of the storefront sticker rather than a piece of
            admin chrome — but the label above it is the studio's. */}
        <div>
          <p className="type-admin-label mb-2 text-neutral-500">Storefront preview</p>
          <div
            style={{ borderColor: ADMIN_RULE }}
            className="flex justify-end rounded-card border bg-[#FBFAF8] p-6"
          >
            <div className="flex w-full max-w-xs flex-col gap-3 rounded-l-2xl border-b-2 border-l-2 border-t-2 border-brand-terracotta/25 bg-[#FFF5F2] p-5 text-left">
              <div className="flex items-center gap-2">
                <Zap aria-hidden size={13} className="fill-brand-terracotta/20 text-brand-terracotta" />
                <span className="type-admin-label text-brand-terracotta/60">Live sticker</span>
              </div>
              <p className="type-admin-section text-brand-terracotta">
                {message || "Your announcement message"}
              </p>
              <div className="flex items-center gap-3 border-t border-brand-terracotta/25 pt-3">
                <div className="flex items-baseline gap-1">
                  <AdminMono className="font-semibold text-brand-terracotta">00</AdminMono>
                  <span className="type-admin-meta text-brand-terracotta/60">d</span>
                </div>
                <div className="h-3 w-px bg-brand-terracotta/25" />
                <div className="flex items-baseline gap-1">
                  <AdminMono className="animate-pulse font-semibold text-brand-terracotta">00</AdminMono>
                  <span className="type-admin-meta text-brand-terracotta/60">s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminPanel>

      {/* ── WELCOME MODAL ──────────────────────────────────────────────── */}
      <AdminPanel padded className="space-y-5">
        <div className="flex items-center gap-2.5">
          <BellRing aria-hidden className="text-accent-700" size={16} />
          <AdminSectionHeading>Welcome modal</AdminSectionHeading>
        </div>

        <div
          style={{ borderColor: ADMIN_RULE }}
          className="flex items-center justify-between gap-4 rounded-card border bg-[#FBFAF8] p-4"
        >
          <div>
            <p className="type-admin-body font-semibold text-ink">Show the welcome modal</p>
            <p className="type-admin-meta text-neutral-500">
              The newsletter sign-up shown to first-time visitors.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWelcomeActive(!welcomeActive)}
            role="switch"
            aria-checked={welcomeActive}
            aria-label="Show the welcome modal"
            className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 focus-visible:ring-offset-1 ${
              welcomeActive
                ? "border-accent-800 bg-accent-800"
                : "border-neutral-300 bg-neutral-200"
            }`}
          >
            <span
              className={`absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
                welcomeActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <AdminField label="Main title" htmlFor="welcome-title">
            <AdminInput
              id="welcome-title"
              type="text"
              required
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
            />
          </AdminField>
          <AdminField label="Subtitle" htmlFor="welcome-subtitle">
            <AdminInput
              id="welcome-subtitle"
              type="text"
              required
              value={welcomeSubtitle}
              onChange={(e) => setWelcomeSubtitle(e.target.value)}
            />
          </AdminField>
          <AdminField
            label="Description"
            htmlFor="welcome-description"
            className="md:col-span-2"
          >
            <AdminInput
              id="welcome-description"
              type="text"
              required
              value={welcomeDescription}
              onChange={(e) => setWelcomeDescription(e.target.value)}
            />
          </AdminField>
        </div>
      </AdminPanel>

      <div className="flex items-center justify-end gap-4">
        {feedback && (
          <p
            className={`type-admin-body ${
              feedback.type === "success" ? "text-accent-800" : "text-brand-terracotta"
            }`}
            role="status"
          >
            {feedback.message}
          </p>
        )}
        <AdminButton type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 aria-hidden className="animate-spin" size={14} />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </AdminButton>
      </div>
    </form>
  );
}
