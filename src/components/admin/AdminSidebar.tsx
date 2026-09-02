"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  Tags,
  Users,
  Megaphone,
  BarChart,
  DollarSign,
  LogOut,
  TrendingUp,
  Image as ImageIcon,
  FolderTree
} from 'lucide-react';
import { signOutAction } from '@/app/auth/auth-actions';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: Home, label: 'Home', href: '/admin' },
  { icon: Package, label: 'Orders', href: '/admin/orders' },
  { icon: Tags, label: 'Products', href: '/admin/products' },
  { icon: FolderTree, label: 'Collections', href: '/admin/products/collections' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: ImageIcon, label: 'Content', href: '/admin/content' },
  { icon: DollarSign, label: 'Finance', href: '/admin/finance' },
  { icon: BarChart, label: 'Analytics', href: '/admin/analytics' },
  { icon: Megaphone, label: 'Marketing', href: '/admin/marketing' },
];

export default function AdminSidebar({ user }: { user?: any }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-[#FAF9F6] flex flex-col h-screen fixed left-0 top-0 z-[60]">
      {/* Brand Header */}
      <div className="p-8 pb-6">
        <div className="mb-0">
          <h1 className="text-2xl font-serif italic font-bold tracking-tighter text-[#4f46e5]">Unrwly</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Management Studio</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight px-4 mb-6 font-sans">Management</div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isActuallyActive = item.href === '/admin' ? pathname === '/admin' : isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 relative ${
                isActuallyActive 
                  ? 'text-[#4f46e5] bg-[#FFF5F2]' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              {isActuallyActive && (
                <motion.div
                  layoutId="activePill"
                  className="absolute left-0 w-1 h-5 bg-[#4f46e5] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={16} className={`${isActuallyActive ? 'text-[#4f46e5]' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-slate-200">
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-slate-500 hover:text-[#4f46e5] hover:bg-[#FFF5F2] rounded-lg transition-all"
          >
            <TrendingUp size={14} /> View Store
          </Link>
          <button
            onClick={() => signOutAction()}
            className="flex items-center gap-2 w-full px-4 py-2 text-[11px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>
    </aside>
  );
}
