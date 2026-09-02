"use client";

import React, { useState, useEffect } from "react";
import { X, Package, Clock, Mail, Calendar, DollarSign, CreditCard, Loader2, Save } from "lucide-react";
import { getCustomerProfile, saveInternalNotes } from "@/app/actions/admin/customers";
import { StatusBadge } from "./StatusBadge";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  createdAt: Date;
  status: string;
  totalAmount: number;
  totalPaid: number | null;
  items: OrderItem[];
}

interface CustomerProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  totalSpent: number;
  internalNotes: string | null;
  orders: Order[];
}

export default function CustomerProfileDrawer({ 
  userId, 
  onClose 
}: { 
  userId: string; 
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const data = await getCustomerProfile(userId);
        if (data) {
          // Normalize data types for decimals if needed
          const normalized = {
            ...data,
            orders: data.orders.map(o => ({
              ...o,
              totalAmount: Number(o.totalAmount),
              totalPaid: o.totalPaid ? Number(o.totalPaid) : 0,
              items: o.items.map(i => ({
                id: i.id,
                name: i.product.name,
                price: Number(i.price),
                quantity: i.quantity
              }))
            }))
          };
          setProfile(normalized as any);
          setNotes(data.internalNotes || "");
        }
      } catch (err) {
        console.error("Failed to load customer profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await saveInternalNotes(userId, notes);
    setSavingNotes(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-accent-700 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-full flex flex-col font-sans bg-[#F6F6F7]">
      {/* HEADER */}
      <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-accent-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {profile.name?.[0] || profile.email[0].toUpperCase()}
           </div>
           <div>
              <h2 className="text-xl font-bold text-slate-900">{profile.name || "Guest Customer"}</h2>
              <p className="text-sm text-slate-500 font-medium">{profile.email}</p>
           </div>
           {profile.role === "VIP" && (
              <span className="bg-[#FFF5D1] text-[#4F4700] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FBE9B3] uppercase tracking-wider">
                VIP
              </span>
           )}
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ORDER HISTORY */}
        <div className="lg:col-span-2 space-y-6">
           <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Order history</h3>
                 <span className="text-xs text-slate-500 font-medium">{profile.orders.length} orders total</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                 {profile.orders.map((order) => (
                    <div key={order.id} className="p-6 space-y-4">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-slate-900">Order #{order.id.substring(0, 5)}</p>
                             <p className="text-xs text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                             <StatusBadge status={order.status} />
                             <p className="text-sm font-bold text-slate-900">${order.totalAmount.toFixed(2)}</p>
                          </div>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {order.items.map((item) => (
                             <div key={item.id} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-600 font-medium">
                                {item.name} (x{item.quantity})
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
                 {profile.orders.length === 0 && (
                    <div className="p-12 text-center text-slate-400 italic">
                       No orders logged for this account.
                    </div>
                 )}
              </div>
           </section>
        </div>

        {/* RIGHT COLUMN: PROFILE INTEL */}
        <div className="space-y-6">
           <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Profile Intel</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-600">
                    <Calendar size={16} className="text-slate-400" />
                    <div className="text-sm">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member since</p>
                       <p className="font-medium text-slate-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600 pt-2 border-t border-slate-50">
                    <DollarSign size={16} className="text-slate-400" />
                    <div className="text-sm">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total spent</p>
                       <p className="font-bold text-slate-900 text-lg">${profile.totalSpent.toFixed(2)}</p>
                    </div>
                 </div>
              </div>
           </section>

           <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Internal Notes</h3>
                 <button 
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="text-accent-700 hover:text-accent-800 p-1 transition-colors"
                 >
                    {savingNotes ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                 </button>
              </div>
              <textarea 
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 className="w-full h-40 p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/10 focus:border-accent-700 transition-all leading-relaxed"
                 placeholder="Jot down internal intelligence..."
              />
           </section>
        </div>
      </div>
    </div>
  );
}
