import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Heart, Zap, Globe } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-ink text-white pt-12 pb-24 overflow-hidden selection:bg-white selection:text-ink">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-32">
        <AnimatedSection className="max-w-4xl" direction="up">
          <div className="flex items-center gap-4 mb-6">
            <span className="type-label text-neutral-500">The Manifesto</span>
            <div className="h-[1px] w-12 bg-neutral-800" />
          </div>
          <h1 className="type-h2 mb-12">
            Existence is <br />
            <span className="text-neutral-500">Unrwly.</span>
          </h1>
          <p className="type-body max-w-2xl text-neutral-400">
            Founded on the pillars of self-love, bold artistic rebellion, and a fierce feminist aesthetic. We don&apos;t just create apparel; we curate armor for the unapologetic.
          </p>
        </AnimatedSection>
      </section>

      {/* Narrative Section - 2 Columns */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-48">
        <AnimatedSection className="space-y-12" direction="left">
          <div>
            <h2 className="type-label mb-8 text-neutral-500">The Story</h2>
            <p className="type-body text-neutral-300">
              Unrwly emerged from the shadows of conformity. We saw a world that demanded silence and we chose to scream in aesthetics. Our journey began with a single vision: to merge high-fashion silhouettes with the raw, unfiltered energy of street art.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="space-y-4">
              <Heart size={20} className="text-neutral-500" />
              <h3 className="type-label">Self-Love</h3>
              <p className="type-caption text-neutral-600 uppercase tracking-[0.18em]">Everything starts from within. We design to empower the soul.</p>
            </div>
            <div className="space-y-4">
              <Zap size={20} className="text-neutral-500" />
              <h3 className="type-label">Bold Art</h3>
              <p className="type-caption text-neutral-600 uppercase tracking-[0.18em]">No boundaries. Every piece is a canvas for the unrwly mind.</p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection direction="scale" className="relative aspect-[4/5] bg-neutral-900 overflow-hidden border border-neutral-800 text-center">
          <Image 
            src="/omnidrop_lifestyle_1.png" 
            alt="Unrwly Lifestyle" 
            fill 
            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
            <p className="type-label text-white/50">Berlin, Studio No. 04</p>
          </div>
        </AnimatedSection>
      </section>

      {/* Values Section */}
      <section className="bg-neutral-950/50 py-32 border-y border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-24">
          <div className="text-center space-y-6">
            <Sparkles size={32} className="mx-auto text-neutral-500" />
            <h4 className="type-label">Premium Craft</h4>
            <p className="type-caption text-neutral-600 uppercase tracking-[0.18em]">Hand-crafted textures and elite materials only.</p>
          </div>
          <div className="text-center space-y-6">
            <Globe size={32} className="mx-auto text-neutral-500" />
            <h4 className="type-label">Global Impact</h4>
            <p className="type-caption text-neutral-600 uppercase tracking-[0.18em]">Sustainable practices for a chaotic world.</p>
          </div>
          <div className="text-center space-y-6">
            <div className="type-h3 mx-auto text-neutral-500">03.</div>
            <h4 className="type-label">Radical Inclusion</h4>
            <p className="type-caption text-neutral-600 uppercase tracking-[0.18em]">A safe haven for every silhouette.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-48 text-center">
        <AnimatedSection direction="fade" viewport>
          <div className="space-y-12">
            <h2 className="type-h2">Join the Archive.</h2>
            <div className="flex justify-center">
              <Link 
                href="/collections"
                className="type-button bg-white px-12 py-6 text-[11px] uppercase tracking-[0.28em] text-ink transition-all hover:bg-neutral-200"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </main>
  );
}
