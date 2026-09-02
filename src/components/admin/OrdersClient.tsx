"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, CheckSquare, Square, CreditCard, Package, Truck, Zap, Loader2, X } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
// Fixed imports to match the server actions
import { forcePushToPrintify, fetchPrintifyTracking, setupLogisticsWebhook } from "@/app/actions/admin/orders";

type OrderData = {
  id: string;
  createdAt: Date;
  user: { name: string | null; email: string } | null;
  status: string;
  totalAmount: number;
  totalPaid?: number | null;
  printifyOrderId: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingUrl?: string | null;
  shippingAddress?: string | null;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    variantId?: string | null;
  }[];
};

export default function OrdersClient({ initialOrders }: { initialOrders: OrderData[] }) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Background Sync Logic
  useEffect(() => {
    const syncOrders = async () => {
      setIsSyncing(true);
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const newData = await response.json();
          setOrders(newData);
          setLastSyncTime(new Date());
        }
      } catch (error) {
        console.error("Sync failed");
      } finally {
        setIsSyncing(false);
      }
    };

    const interval = setInterval(syncOrders, 30000); // Sync every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.user?.email && o.user.email.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleAll = () => {
    if (selectedIds.size === filteredOrders.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredOrders.map(o => o.id)));
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
           <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full">
              <span className="relative flex h-2 w-2">
                {isSyncing && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSyncing ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {isSyncing ? 'Syncing...' : `Updated ${lastSyncTime.toLocaleTimeString()}`}
              </span>
           </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (confirm("Establish permanent Logistics Bridge?")) {
                const res = await setupLogisticsWebhook();
                alert((res as any).success ? "Success" : (res as any).error);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-semibold hover:bg-slate-50 shadow-sm"
          >
            <Zap size={14} className="text-amber-500" /> Logistics Setup
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search orders"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                <th className="px-6 py-4 w-12">
                   <div
                    className={`w-4 h-4 border rounded cursor-pointer ${selectedIds.size === filteredOrders.length ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}
                    onClick={toggleAll}
                  />
                </th>
                <th className="px-4 py-4">Order</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="group hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-6 py-4" onClick={(e) => toggleOne(order.id, e)}>
                     <div className={`w-4 h-4 border rounded ${selectedIds.has(order.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`} />
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-900">#{order.id.substring(0, 5)}</td>
                  <td className="px-4 py-4 text-sm">{order.user?.email || "Guest"}</td>
                  <td className="px-4 py-4 text-sm font-semibold">${(order.totalPaid || order.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
           <div className="relative w-full max-w-3xl bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <button onClick={() => setSelectedOrder(null)}><X /></button>
                </div>
                {/* Simplified manifest for clarity */}
                <div className="space-y-4">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between p-4 bg-slate-50 rounded-lg">
                      <span>{item.name} (x{item.quantity})</span>
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={async () => {
                    const res = await forcePushToPrintify(selectedOrder.id);
                    alert((res as any).success ? "Order Pushed" : (res as any).error);
                  }}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-lg"
                >
                  Force Push to Printify
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
