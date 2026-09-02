"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {items.map((faq, index) => (
        <div 
          key={index}
          className="border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <button
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-8 text-left hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-6">
              {faq.icon && <span className="text-accent-700">{faq.icon}</span>}
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-slate-900">{faq.question}</span>
            </div>
            <motion.div
              animate={{ rotate: activeIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-slate-400"
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <AnimatePresence>
            {activeIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="px-8 pb-8 pt-0 text-[10px] text-slate-600 leading-relaxed uppercase tracking-[0.2em] max-w-2xl">
                  {faq.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
