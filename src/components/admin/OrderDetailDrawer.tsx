"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCcw, Save, Loader2, Package, MapPin, Hash, Network, ExternalLink, Lock, CheckCircle2 } from "lucide-react";
import { fetchPrintifyTracking, updateOrderStatus, repairOrder, syncPrintifyOrder } from "@/app/actions/admin/orders";
import { OrderStatus } from "@prisma/client";

export default function OrderDetailDrawer({ order, onClose }: { order: any; onClose: () => void }) {
  const [status, setStatus] = useState<OrderStatus>("PENDING");
  const [notes, setNotes] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setNotes(order.internalNotes || "");
    }
  }, [order]);

  if (!order) return null;

  const handleSyncPrintify = async () => {
    setIsSyncing(true);
    try {
      const res = await syncPrintifyOrder(order.id);
      if (res.success) {
        setStatus("SHIPPED");
        alert("LOGISTICS DATA SYNCHRONIZED.");
      } else {
        alert(res.error || "LOGISTICS SYNC FAILED.");
      }
    } catch {
      alert("FAILED TO COMMUNICATE WITH FACTORY NETWORK.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRepair = async () => {
    if (!window.confirm("INITIATE ADMINISTRATIVE REPAIR? THIS WILL FORCE-FIX PENDING STATUS VIA STRIPE.")) return;
    
    setIsRepairing(true);
    try {
      const res = await repairOrder(order.id);
      if (res.success) {
        setStatus("PAID");
        alert("REPAIR SUCCESSFUL. ORDER RECONCILED.");
      } else {
        alert(res.error || "REPAIR PROTOCOL FAILED.");
      }
    } catch {
      alert("REPAIR ENCOUNTERED A NETWORK EXCEPTION.");
    } finally {
      setIsRepairing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOrderStatus(order.id, status, notes);
    } catch {
      alert("FAILED TO COMMIT CHANGES TO THE DATABASE.");
    } finally {
      setIsSaving(false);
      onClose(); // Auto-close drawer on successful commit
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex justify-end"
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-black border-l border-white/10 h-full overflow-y-auto font-mono flex flex-col"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur z-10">
            <div className="space-y-1">
              <h2 className="text-white text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Network size={14} className="text-neutral-500" />
                Network Intel
              </h2>
              <p className="text-[9px] text-neutral-500 tracking-[0.3em] uppercase">ID: {order.id}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 border border-white/10 hover:bg-white/10 transition-colors text-white"
            >
              <X size={14} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 flex-1 space-y-10">
            
            {/* ADMINISTRATIVE LOGISTICS HUB */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                <Network size={12} />
                Administrative Logistics Hub
              </h3>
              
              <div className="space-y-4">
                {/* REPAIR NODE (Visible for PENDING only) */}
                {status === "PENDING" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-4"
                  >
                    <div className="flex bg-indigo-500/20 p-2 rounded-lg items-center gap-2 w-fit">
                      <Lock size={12} className="text-indigo-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Security Recovery Active</span>
                    </div>
                    <p className="text-[9px] text-indigo-300 leading-relaxed uppercase tracking-widest font-bold">
                      Order is stuck in PENDING. Use the recovery protocol to verify payment via Stripe and trigger fulfillment.
                    </p>
                    <button
                      onClick={handleRepair}
                      disabled={isRepairing}
                      className="w-full py-3 bg-indigo-600 text-[10px] text-white font-black uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20"
                    >
                      {isRepairing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                      Force Administrative Repair
                    </button>
                  </motion.div>
                )}

                {/* TRACKING PROTOCOLS (Visible for PAID/SHIPPED/PROCESSING) */}
                {status !== "PENDING" && status !== "CANCELLED" && (
                  <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-widest text-neutral-500">Logistics Carrier</p>
                        <p className="text-xs text-white font-black uppercase tracking-widest">{order.carrier || "MANIFESTED"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-widest text-neutral-500">Tracking Number</p>
                        <p className="text-xs text-white font-black uppercase tracking-widest">{order.trackingNumber || "AWAITING..."}</p>
                      </div>
                    </div>

                    {order.trackingUrl && (
                      <a 
                        href={order.trackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Live Tracking Vector</span>
                        <ExternalLink size={14} className="text-neutral-500 group-hover:text-white transition-colors" />
                      </a>
                    )}

                    <button
                      onClick={handleSyncPrintify}
                      disabled={isSyncing}
                      className="w-full py-4 border border-white/20 text-[10px] text-white font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all flex items-center justify-center gap-3 rounded-xl"
                    >
                      {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                      Sync With Factory
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Destination Vector */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                <MapPin size={12} />
                Destination Vector
              </h3>
              <div className="flex items-start gap-4 p-5 bg-white/[0.02] border border-white/10 rounded-2xl">
                <p className="text-[10px] text-neutral-300 leading-relaxed tracking-wider uppercase font-bold">
                  {order.shippingAddress || "NO DESTINATION RECORDED. DIGITAL DELIVERY ONLY."}
                </p>
              </div>
            </div>

            {/* Cart Manifest */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/10 pb-2">Cart Manifest</h3>
              <div className="space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-start justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <Package size={12} className="text-neutral-600" />
                      <div>
                        <p className="text-[10px] text-white tracking-widest uppercase">{item.product.name}</p>
                        <p className="text-[8px] text-neutral-600 tracking-widest mt-1">QTY: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {order.items.length === 0 && (
                  <p className="text-[9px] text-neutral-600 tracking-widest uppercase py-4">Manifest Empty.</p>
                )}
              </div>
            </div>

            {/* Internal Authored Notes */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/10 pb-2">Internal Authored Intel</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="APPEND OPERATION NOTES HERE..."
                className="w-full h-32 bg-black border border-white/10 text-[10px] p-4 text-white focus:border-white transition-colors rounded-none placeholder:text-neutral-700 uppercase tracking-widest resize-none custom-scrollbar"
              />
            </div>
            
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-black sticky bottom-0 z-10">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Commit Configuration
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
