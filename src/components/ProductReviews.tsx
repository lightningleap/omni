"use client";

import { useState } from "react";
import { Star, CheckCircle2, X, RotateCcw, Truck, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_REVIEWS = [
  { id: 1, user: "MARCUS K.", date: "MAR 12, 2026", rating: 5, title: "ELITE QUALITY", body: "The weight of the fabric is incredible. Definitely lives up to the tech-wear hype. Would recommend sizing up for that oversized aesthetic.", verified: true },
  { id: 2, user: "SARAH P.", date: "FEB 28, 2026", rating: 4, title: "STUNNING DESIGN", body: "The silhouette is unique. Got so many compliments already. Only minor gripe is the sleeve length, but nothing major.", verified: true },
  { id: 3, user: "DAVID L.", date: "JAN 15, 2026", rating: 5, title: "PERFECT FIT", body: "Finally a brand that understands modern proportions. The materials feel premium and the VTO was surprisingly accurate.", verified: true },
];

const ProductReviews = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <section id="reviews" className="bg-white py-16" style={{ borderTop: '1px solid var(--color-hairline)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-24">
          
          {/* Left Column: Summary */}
          <div className="lg:w-1/3 space-y-12">
            <div>
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight">
                Customer Reviews
              </h2>
            </div>

            <div className="space-y-10">
              <div className="flex items-end gap-5">
                <span className="text-8xl font-black text-black leading-none tracking-tighter">4.8</span>
                <div className="pb-3 text-amber-500">
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={20} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Based on 124 global entries</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                {[
                  { star: 5, percent: 85 },
                  { star: 4, percent: 10 },
                  { star: 3, percent: 3 },
                  { star: 2, percent: 1 },
                  { star: 1, percent: 1 },
                ].map((item) => (
                  <div key={item.star} className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-black w-2">{item.star}</span>
                    <div className="flex-grow h-1 bg-neutral-100 relative overflow-hidden rounded-full">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percent}%` }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 bg-black" 
                      />
                    </div>
                    <span className="text-[10px] font-black text-neutral-500 w-8 text-right">{item.percent}%</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setIsFormOpen(true)}
                className="w-full py-4 text-white text-[12px] font-bold uppercase tracking-widest transition-all rounded-sm"
                style={{ backgroundColor: '#ff3f6c' }}
              >
                Draft a Review
              </button>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:w-2/3 space-y-16">
            <div className="divide-y" style={{ borderColor: 'var(--color-hairline)' }}>
              {MOCK_REVIEWS.map((review) => (
                <div key={review.id} className="py-14 first:pt-0 group">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                    <div className="space-y-2">
                      <div className="flex text-amber-500 gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < review.rating ? "currentColor" : "none"} 
                            className={i < review.rating ? "text-amber-500" : "text-neutral-200"} 
                          />
                        ))}
                      </div>
                      <h3 className="text-base font-black text-black uppercase tracking-widest leading-none">{review.title}</h3>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="flex items-center md:justify-end gap-3 text-[10px] font-black text-black uppercase tracking-widest mb-2">
                        {review.user}
                        {review.verified && (
                          <span className="flex items-center gap-1.5 text-[8px] text-emerald-600 font-black border border-emerald-100 px-2.5 py-1 rounded-full bg-emerald-50">
                            <CheckCircle2 size={8} /> VERIFIED
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-neutral-500 font-medium italic text-base leading-relaxed max-w-2xl font-inter">
                    "{review.body}"
                  </p>
                </div>
              ))}
            </div>
            
            <button className="text-[10px] font-black text-black uppercase tracking-[0.5em] hover:text-neutral-400 transition-colors border-b-2 border-black pb-1 italic">
              View All Global Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-white/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white border border-neutral-100 shadow-2xl p-10 md:p-16 rounded-sm"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-10 right-10 text-neutral-300 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>

              {isSubmitted ? (
                <div className="text-center py-16 space-y-8">
                  <div className="bg-neutral-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-black text-black uppercase tracking-tighter italic font-display">Review Received</h3>
                  <p className="text-sm text-neutral-500 font-medium italic uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                    Your contribution to the archive is being processed.
                  </p>
                  <button 
                    onClick={() => setIsFormOpen(false)}
                    className="px-12 py-4 bg-black text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="space-y-6">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-black block">Manifesto</span>
                    <h2 className="text-4xl font-black text-black italic tracking-tighter uppercase leading-none font-display">
                      Write a Review
                    </h2>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsSubmitted(true);
                    }} 
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] block">Rating</label>
                      <div className="flex gap-3 text-amber-500">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button 
                            key={num} 
                            type="button"
                            onClick={() => setUserRating(num)}
                            className="hover:scale-125 transition-transform"
                          >
                            <Star size={32} fill={num <= userRating ? "currentColor" : "none"} className={num <= userRating ? "text-amber-500" : "text-neutral-100"} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3 border-b border-neutral-100 pb-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] block">Identifier</label>
                        <input className="w-full bg-transparent p-0 text-xs text-black focus:outline-none transition-colors uppercase tracking-[0.2em] font-black italic" placeholder="YOUR NAME" required />
                      </div>
                      <div className="space-y-3 border-b border-neutral-100 pb-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] block">Headline</label>
                        <input className="w-full bg-transparent p-0 text-xs text-black focus:outline-none transition-colors uppercase tracking-[0.2em] font-black italic" placeholder="SUMMARY" required />
                      </div>
                    </div>

                    <div className="space-y-3 border-b border-neutral-100 pb-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] block">Narration</label>
                      <textarea rows={4} className="w-full bg-transparent p-0 text-xs text-black focus:outline-none transition-colors uppercase tracking-[0.2em] font-medium italic resize-none" placeholder="YOUR THOUGHTS..." required />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-6 bg-black text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all duration-500 mt-6 shadow-2xl"
                    >
                      Publish to Archive
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductReviews;
