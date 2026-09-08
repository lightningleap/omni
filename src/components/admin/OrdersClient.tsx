"use client";

import React, { useState, useEffect } from "react";
import { Zap, X, Check, Inbox } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  ADMIN_SHELL,
  AdminButton,
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminTr,
} from "@/components/admin/ui/primitives";
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
  const [syncError, setSyncError] = useState<string | null>(null);
  /**
   * Null until the client has actually synced.
   *
   * This used to be `useState<Date>(new Date())`, which runs on the SERVER
   * too. The server stamped one second and the browser stamped another, and
   * the two formatted differently besides — Node rendered "3:36:03 pm"
   * against the browser's "3:36:04 PM". React reported a hydration mismatch
   * on every single load of this page and threw the tree away to re-render it.
   *
   * A "when did THIS browser last sync" clock is client state by definition,
   * so there is nothing for the server to render. It stays null through SSR
   * and the first paint; the effect below stamps it.
   */
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Background Sync Logic
  useEffect(() => {
    const syncOrders = async () => {
      setIsSyncing(true);
      try {
        const response = await fetch("/api/orders");
        // A non-2xx used to fall through silently, so an expired admin session
        // looked identical to a working sync that simply had no new orders.
        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Session expired — sign in again to keep orders live."
              : `Order sync failed (${response.status}).`
          );
        }
        setOrders(await response.json());
        setLastSyncTime(new Date());
        setSyncError(null);
      } catch (error) {
        // The original logged the bare string "Sync failed" and dropped the
        // cause, which made this impossible to diagnose from the console.
        console.error("[orders] sync failed:", error);
        setSyncError(error instanceof Error ? error.message : "Order sync failed.");
      } finally {
        setIsSyncing(false);
      }
    };

    // Stamp the first sync time on the client. Deliberately in an effect: it
    // is browser-only state that cannot exist during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastSyncTime(new Date());

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

  const toggleOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const allSelected = filteredOrders.length > 0 && selectedIds.size === filteredOrders.length;

  return (
    <div className={ADMIN_SHELL}>
      <AdminPageHeader
        title="Orders"
        meta={
          <>
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              {isSyncing && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-600 opacity-75 motion-reduce:animate-none" />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  syncError ? 'bg-brand-terracotta' : isSyncing ? 'bg-accent-700' : 'bg-accent-600'
                }`}
              />
            </span>
            {/* Live region: the clock updates on a 30s timer with no user
                action, so a screen reader is told politely rather than never. */}
            <span aria-live="polite" className={syncError ? 'text-brand-terracotta' : undefined}>
              {syncError
                ? syncError
                : isSyncing
                  ? 'Syncing…'
                  : lastSyncTime
                    ? `Updated ${lastSyncTime.toLocaleTimeString()}`
                    : null}
            </span>
          </>
        }
        action={
          <AdminButton
            onClick={async () => {
              if (confirm("Establish permanent Logistics Bridge?")) {
                const res = await setupLogisticsWebhook();
                alert((res as { success?: boolean; error?: string }).success ? "Success" : (res as { error?: string }).error);
              }
            }}
          >
            <Zap aria-hidden size={14} strokeWidth={1.75} className="text-accent-700" /> Logistics Setup
          </AdminButton>
        }
      />

      <AdminPanel>
        <div style={{ borderColor: '#E8E6E1' }} className="border-b p-3 md:p-4">
          <AdminSearch
            value={search}
            onChange={setSearch}
            placeholder="Search orders"
            label="Search orders by id or customer email"
          />
        </div>

        {filteredOrders.length === 0 ? (
          <AdminEmpty
            icon={<Inbox aria-hidden size={28} strokeWidth={1.5} />}
            title={search ? 'No matching orders' : 'No orders yet'}
            message={
              search
                ? 'No order id or customer email matches that search.'
                : 'Orders placed in the storefront appear here.'
            }
          />
        ) : (
          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <AdminTh className="w-10">
                    {/* A real checkbox, not a styled div. The originals were
                        <div>s with click handlers: unreachable by keyboard and
                        silent to a screen reader, on the control that drives
                        bulk selection. */}
                    <label className="flex items-center">
                      <span className="sr-only">Select all orders</span>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="h-3.5 w-3.5 cursor-pointer accent-[#2F5646]"
                      />
                    </label>
                  </AdminTh>
                  <AdminTh>Order</AdminTh>
                  <AdminTh>Customer</AdminTh>
                  <AdminTh className="text-right">Total</AdminTh>
                  <AdminTh>Status</AdminTh>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <AdminTr
                    key={order.id}
                    interactive
                    onClick={() => setSelectedOrder(order)}
                  >
                    <AdminTd onClick={(e) => e.stopPropagation()}>
                      <label className="flex items-center">
                        <span className="sr-only">Select order {order.id.substring(0, 5)}</span>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order.id)}
                          onChange={() => toggleOne(order.id)}
                          className="h-3.5 w-3.5 cursor-pointer accent-[#2F5646]"
                        />
                      </label>
                    </AdminTd>
                    <AdminTd className="font-semibold text-ink">#{order.id.substring(0, 5)}</AdminTd>
                    <AdminTd className="max-w-[280px] truncate">{order.user?.email || "Guest"}</AdminTd>
                    <AdminTd className="text-right font-semibold tabular-nums text-ink">
                      ${(order.totalPaid || order.totalAmount).toFixed(2)}
                    </AdminTd>
                    <AdminTd><StatusBadge status={order.status} /></AdminTd>
                  </AdminTr>
                ))}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        )}
      </AdminPanel>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-ink/40" onClick={() => setSelectedOrder(null)} aria-hidden />
           <div className="relative w-full max-w-xl overflow-y-auto bg-white">
              <div className="space-y-5 p-5 md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-[16px] font-semibold text-ink">Order Details</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    aria-label="Close order details"
                    className="flex h-8 w-8 items-center justify-center rounded-card text-neutral-500 transition-colors hover:bg-[#F4F2ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30"
                  >
                    <X aria-hidden size={16} strokeWidth={2} />
                  </button>
                </div>
                {/* Simplified manifest for clarity */}
                <ul style={{ borderColor: '#E8E6E1' }} className="divide-y border-y" >
                  {selectedOrder.items.map(item => (
                    <li key={item.id} className="flex justify-between gap-4 py-3 text-[13px]">
                      <span className="min-w-0 text-neutral-600">{item.name} (x{item.quantity})</span>
                      <span className="shrink-0 font-semibold tabular-nums text-ink">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <AdminButton
                  variant="primary"
                  className="w-full"
                  onClick={async () => {
                    const res = await forcePushToPrintify(selectedOrder.id);
                    alert((res as { success?: boolean; error?: string }).success ? "Order Pushed" : (res as { error?: string }).error);
                  }}
                >
                  <Check aria-hidden size={14} strokeWidth={2} />
                  Force Push to Printify
                </AdminButton>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
