"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Loader2, Save } from "lucide-react";
import { getCustomerProfile, saveInternalNotes } from "@/app/actions/admin/customers";
import { StatusBadge } from "./StatusBadge";
import {
  ADMIN_RULE,
  AdminEmpty,
  AdminMono,
  AdminPanel,
  AdminSectionHeading,
  AdminTextarea,
} from "@/components/admin/ui/primitives";

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
    <div className="flex min-h-full flex-col bg-surface">
      {/* HEADER */}
      <div
        style={{ borderColor: ADMIN_RULE }}
        className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5"
      >
        <div className="flex items-center gap-4">
          <div className="type-admin-section flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-800 text-white">
            {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="type-admin-section text-ink">{profile.name || "Guest customer"}</h2>
            <p className="type-admin-meta truncate text-neutral-500">{profile.email}</p>
          </div>
          {profile.role === "VIP" && (
            <span className="type-admin-label rounded-card border border-[#FBE9B3] bg-[#FFF5D1] px-2 py-1 text-[#4F4700]">
              VIP
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close customer profile"
          className="rounded-card p-2 text-neutral-400 transition-colors hover:bg-[#FBFAF8] hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30"
        >
          <X aria-hidden size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {/* LEFT COLUMN: ORDER HISTORY */}
        <div className="lg:col-span-2 space-y-6">
          <AdminPanel>
            <div
              style={{ borderColor: ADMIN_RULE }}
              className="flex items-center justify-between border-b px-4 py-3"
            >
              <AdminSectionHeading as="h3">Order history</AdminSectionHeading>
              <span className="type-admin-meta text-neutral-500">
                {profile.orders.length} {profile.orders.length === 1 ? "order" : "orders"}
              </span>
            </div>
            <div className="max-h-[600px] divide-y divide-[#EFEDE8] overflow-y-auto">
              {profile.orders.map((order) => (
                <div key={order.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="type-admin-body font-semibold text-ink">
                        Order <AdminMono>#{order.id.substring(0, 5)}</AdminMono>
                      </p>
                      <p className="type-admin-meta text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <p className="type-admin-body font-semibold tabular-nums text-ink">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{ borderColor: ADMIN_RULE }}
                        className="type-admin-meta rounded-card border bg-[#FBFAF8] px-2 py-0.5 text-neutral-500"
                      >
                        {item.name} (×{item.quantity})
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {profile.orders.length === 0 && (
                <AdminEmpty
                  title="No orders yet"
                  message="This account has not placed an order."
                />
              )}
            </div>
          </AdminPanel>
        </div>

        {/* RIGHT COLUMN: PROFILE INTEL */}
        <div className="space-y-6">
          <AdminPanel padded className="space-y-5">
            <AdminSectionHeading as="h3">Profile</AdminSectionHeading>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar aria-hidden size={15} className="shrink-0 text-neutral-400" />
                <div>
                  <p className="type-admin-label text-neutral-400">Member since</p>
                  <p className="type-admin-body font-medium text-ink">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-[#EFEDE8] pt-4">
                <DollarSign aria-hidden size={15} className="shrink-0 text-neutral-400" />
                <div>
                  <p className="type-admin-label text-neutral-400">Total spent</p>
                  <p className="type-admin-stat text-ink">${profile.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel padded className="space-y-3">
            <div className="flex items-center justify-between">
              <AdminSectionHeading as="h3">
                <label htmlFor="customer-notes">Internal notes</label>
              </AdminSectionHeading>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                aria-label="Save internal notes"
                className="rounded-card p-1.5 text-accent-700 transition-colors hover:bg-accent-50 hover:text-accent-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 disabled:opacity-50"
              >
                {savingNotes ? (
                  <Loader2 aria-hidden size={15} className="animate-spin" />
                ) : (
                  <Save aria-hidden size={15} />
                )}
              </button>
            </div>
            <AdminTextarea
              id="customer-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-40 bg-[#FBFAF8]"
              placeholder="Notes about this customer, visible only to admins."
            />
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
