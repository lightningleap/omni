"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, ChevronDown, User, ArrowRight, ShieldCheck, X } from 'lucide-react';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import { signOutAction } from '@/app/auth/auth-actions';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

const NavbarClient = ({ adultCollections = [], kidsCollections = [], user }: { adultCollections?: any[], kidsCollections?: any[], user?: any }) => {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems.length;

  // States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Which top section dropdown is open: 'adult' | 'kids' | null
  const [openMenu, setOpenMenu] = useState<null | 'adult' | 'kids'>(null);

  const isAdmin = user?.role === 'ADMIN';
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stripe Success Detector
  useEffect(() => {
    if (searchParams.get('success')) {
      clearCart();
      router.replace('/', { scroll: false });
    }
  }, [searchParams, clearCart, router]);

  // Smart Hide States
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Smart Hide Logic
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Hiding on scroll down
      } else {
        setIsVisible(true); // Showing on scroll up
      }

      // Border Logic: appear after scrolling past initial hero area
      if (currentScrollY > 100) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const sections: { key: 'adult' | 'kids'; label: string; items: any[] }[] = [
    { key: 'adult', label: 'Adult', items: adultCollections },
    { key: 'kids', label: 'Kids', items: kidsCollections },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-500 bg-white border-b border-slate-100
          ${hasScrolled ? 'shadow-sm shadow-slate-200/50' : ''}
        `}
      >
        <div className="px-4 md:px-8 h-20 flex items-center gap-2 md:gap-6">
          {/* LOGO */}
          <Link href="/" className="text-xl font-black tracking-tighter uppercase italic font-display shrink-0 text-[#1A1A1A]">
            Unrwly
          </Link>

          {/* ADULT / KIDS SECTIONS */}
          <div className="hidden lg:flex items-center gap-8 shrink-0">
            {sections.map((section) => (
              section.items.length > 0 && (
                <div
                  key={section.key}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(section.key)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    onClick={() => setOpenMenu(openMenu === section.key ? null : section.key)}
                    className={`text-sm font-bold uppercase tracking-wide flex items-center gap-1 pb-1 transition-colors ${openMenu === section.key ? 'text-[#4F46E5]' : 'text-[#334155]'}`}
                  >
                    {section.label} <ChevronDown size={14} className={`transition-transform duration-200 ${openMenu === section.key ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {openMenu === section.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-[30px] left-0 w-56 bg-white border border-[#eaeaec] shadow-2xl p-5 grid grid-cols-1 gap-3 z-50 text-left"
                      >
                        {section.items.map((col) => (
                          <Link
                            key={col.id}
                            href={`/collections/${col.handle}?audience=${section.key}`}
                            onClick={() => setOpenMenu(null)}
                            className="block text-xs font-bold text-[#282C3F] hover:text-[#ff3f6c] transition-colors uppercase tracking-wide"
                          >
                            {col.title || col.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            ))}
          </div>

          {/* INLINE SEARCH BAR */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
              if (input.trim()) router.push(`/collections?q=${encodeURIComponent(input.trim())}`);
            }}
            className="hidden md:flex flex-1 max-w-[300px] ml-12 items-center h-10 rounded-sm overflow-hidden bg-[#f5f5f6] border border-transparent focus-within:bg-white focus-within:border-[#eaeaec] transition-all"
          >
            <div className="pl-3 text-[#94969f]">
              <Search size={16} />
            </div>
            <input
              name="q"
              type="text"
              placeholder="Search for products..."
              className="flex-1 h-full px-3 text-xs bg-transparent focus:outline-none text-[#282C3F] placeholder:text-[#94969f]"
            />
          </form>

          {/* ICONS ROW */}
          <div className="flex items-center gap-2 md:gap-10 ml-auto shrink-0">
            {/* Profile */}
            <button
              onClick={() => user ? router.push(isAdmin ? '/admin/products' : '/account') : router.push('/auth')}
              className="hidden sm:flex flex-col items-center gap-1 group"
            >
              <User size={20} className="text-[#334155] group-hover:text-[#4F46E5] transition-colors" />
              <span className="text-[11px] font-bold text-[#334155] uppercase tracking-wide">Profile</span>
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden sm:flex flex-col items-center gap-1 group relative">
              <div className="relative">
                <svg 
                  className={`w-5 h-5 transition-colors ${wishlistCount > 0 ? 'text-[#4F46E5] fill-[#4F46E5]' : 'text-[#334155] group-hover:text-[#4F46E5]'}`}
                  viewBox="0 0 24 24" 
                  fill={wishlistCount > 0 ? "currentColor" : "none"}
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#4F46E5] text-white rounded-full flex items-center justify-center text-[8px] font-black w-4 h-4">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#334155] uppercase tracking-wide">Wishlist</span>
            </Link>

            {/* Bag */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex flex-col items-center gap-1 group relative"
            >
              <div className="relative">
                <ShoppingBag size={20} className="text-[#334155] group-hover:text-[#4F46E5] transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#4F46E5] text-white rounded-full flex items-center justify-center text-[8px] font-black w-4 h-4">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#334155] uppercase tracking-wide">Bag</span>
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#334155]"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE OVERLAY MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-[#FFF5F2] flex flex-col p-6 lg:hidden"
          >
            <div className="flex justify-between items-center h-20 mb-12">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black tracking-tighter uppercase italic font-display text-[#1A1A1A]">
                Unrwly
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-[#1A1A1A]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-8 overflow-y-auto pb-12">
              {sections.map((section) => (
                section.items.length > 0 && (
                  <div key={section.key} className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">{section.label}</span>
                    {section.items.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.handle}?audience=${section.key}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-3xl font-black tracking-tighter text-[#1A1A1A] hover:text-[#4F46E5] transition-all uppercase italic"
                      >
                        {col.title || col.name}
                      </Link>
                    ))}
                  </div>
                )
              ))}
              <Link
                href="/collections/all"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-3xl font-black tracking-tighter text-[#1A1A1A] hover:text-[#4F46E5] transition-all uppercase italic"
              >
                New Drops
              </Link>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
              <Link 
                href={user ? (isAdmin ? '/admin/products' : '/account') : '/auth'} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center h-14 bg-white border border-slate-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-[#1A1A1A]"
              >
                {user ? 'Profile' : 'Login'}
              </Link>
              <Link 
                href="/wishlist" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center h-14 bg-white border border-slate-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-[#1A1A1A]"
              >
                Wishlist ({wishlistCount})
              </Link>
              {user && (
                <button 
                  onClick={async () => {
                    await signOutAction();
                    setIsMobileMenuOpen(false);
                  }}
                  className="col-span-2 h-12 text-[10px] font-bold text-rose-500 uppercase tracking-widest"
                >
                  Terminate Session
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default NavbarClient;
