"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import OrderDetailDrawer from "./OrderDetailDrawer";

type OrderData = {
  id: string;
  user: { name: string | null; email: string } | null;
  status: any;
  totalAmount: number;
  printifyOrderId: string | null;
  shippingAddress: string | null;
  internalNotes: string | null;
  createdAt: Date;
  items: any[];
};

export default function OrderControlClient({ initialOrders }: { initialOrders: OrderData[] }) {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const filteredOrders = initialOrders.filter((o) => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.user?.email && o.user.email.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PAID': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'SHIPPED': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'CANCELLED': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'PROCESSING': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'PENDING': return 'text-neutral-300 border-neutral-500/30 bg-neutral-500/10';
      default: return 'text-neutral-400 border-white/20';
    }
  };

  return (
    <div className="space-y-12 font-sans text-neutral-900">
      {/* Header - Integrated */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 italic">Logistics Control</h2>
          <p className="text-sm text-neutral-500 font-medium">Monitor network order flow, status transitions and fulfillment.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
          Sync Protocol Active
        </div>
      </div>

      {/* Search Protocol */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search logistics for order ID or customer email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-neutral-200/60 rounded-3xl text-sm font-semibold px-14 py-5 text-neutral-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-sm"
        />
      </div>

      {/* Analytics Matrix */}
      <div className="bg-white border border-neutral-200/60 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Order Cipher</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Customer</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Ledger Date (UTC)</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Gross value</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Network status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-neutral-50/50 transition-colors cursor-pointer group"
                >
                  <td className="p-6">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                      #{order.id.split('-')[0]}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black uppercase text-neutral-900 italic tracking-tight">{order.user?.name || "UNIDENTIFIED"}</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">{order.user?.email || "NO EMAIL"}</p>
                  </td>
                  <td className="p-6 text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                    {new Date(order.createdAt).toISOString().split('T')[0]} <span className="text-neutral-200">/</span> {new Date(order.createdAt).toISOString().split('T')[1].substring(0, 5)}
                  </td>
                  <td className="p-6 text-sm font-black text-neutral-900 tracking-tight">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border font-black ${
                      order.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      order.status === 'PROCESSING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-600 bg-white/[0.01]">
                    NO NETWORK ACTIVITY DETECTED.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Drawer Shell */}
      <OrderDetailDrawer 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  );
}
