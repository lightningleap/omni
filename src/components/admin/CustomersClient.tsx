"use client";

import React, { useState } from "react";
import { DollarSign, Users, Star } from "lucide-react";
import CustomerProfileDrawer from "./CustomerProfileDrawer";
import CustomerCard from "@/components/admin/cards/CustomerCard";
import { CustomerRoleControl } from "@/components/admin/CustomerRoleControl";
import { AdminCardGrid, AdminViewToggle, useAdminView } from "@/components/admin/ui/views";
import { AdminCheckbox } from "@/components/admin/ui/checkbox";
import {
  ADMIN_RULE,
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminStat,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminTr,
} from "@/components/admin/ui/primitives";
import { setUserRole } from "@/app/actions/admin/customers";
import { Role } from "@prisma/client";

type CustomerData = {
  id: string;
  name: string | null;
  email: string;
  totalSpent: number;
  ordersCount: number;
  role: Role;
  /** Pinned as an admin by ADMIN_EMAILS — cannot be changed from here. */
  pinned: boolean;
  /** The signed-in admin's own row — cannot demote themselves. */
  isSelf: boolean;
};

export default function CustomersClient({ initialCustomers }: { initialCustomers: CustomerData[] }) {
  const [search, setSearch] = useState("");
  // Presentation only. Search, selection, the drawer and the role handler
  // below are declared once and read by whichever tree renders, so switching
  // view cannot reset any of them — there is nothing per-view to reset.
  const [view, setView] = useAdminView("customers");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const changeRole = async (userId: string, role: Role) => {
    setSavingId(userId);
    setRoleError(null);
    try {
      const result = await setUserRole(userId, role);
      // The server refuses changes that would lock the store out of its own
      // panel; show why rather than failing silently.
      if (!result.success) setRoleError(result.message ?? "Could not change that role.");
    } catch {
      setRoleError("Could not change that role.");
    } finally {
      setSavingId(null);
    }
  };
  
  // Calculations for Stat Cards
  const totalCustomers = initialCustomers.length;
  const totalOrders = initialCustomers.reduce((acc, c) => acc + c.ordersCount, 0);
  const totalRevenue = initialCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const activeVips = initialCustomers.filter(c => c.role === "VIP").length;

  const filteredCustomers = initialCustomers.filter((c) =>
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.name && c.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Named once rather than re-deriving `selectedIds.size === filtered.length &&
  // filtered.length > 0` inline in both the header cell's class and its content.
  const allSelected = filteredCustomers.length > 0 && selectedIds.size === filteredCustomers.length;
  /* Some but not all — the header box shows a dash rather than claiming the
     whole page is selected. `toggleAll` already selects all from this state,
     so this is presentation only. */
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Customers" />

      {/* Three tiles that were three copies of the same hand-built card, on a
          `text-xs font-bold uppercase tracking-wider` label the studio uses
          nowhere else. AdminStat, like Finance and Analytics. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <AdminStat
          label={
            <>
              <Users aria-hidden size={13} className="mr-1.5 inline align-[-2px]" />
              Total customers
            </>
          }
          value={totalCustomers.toLocaleString()}
        />
        <AdminStat
          label={
            <>
              <DollarSign aria-hidden size={13} className="mr-1.5 inline align-[-2px]" />
              Average order value
            </>
          }
          value={`$${aov.toFixed(2)}`}
        />
        <AdminStat
          label={
            <>
              <Star aria-hidden size={13} className="mr-1.5 inline align-[-2px] text-amber-500" />
              Active VIPs
            </>
          }
          value={activeVips}
        />
      </div>

      <AdminPanel>
        <div style={{ borderColor: ADMIN_RULE }} className="flex items-center gap-3 border-b p-4">
          <div className="min-w-0 flex-1">
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search customers…"
              label="Search customers by name or email"
            />
          </div>
          <AdminViewToggle view={view} onChange={setView} />
        </div>

        {filteredCustomers.length === 0 ? (
          <AdminEmpty
            title="No customers match that search"
            message="Clear the search to see every account."
          />
        ) : view === "list" ? (
          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <AdminTh className="w-12 text-center">
                    <AdminCheckbox
                      className="mx-auto"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      label={allSelected ? "Clear selection" : "Select all customers"}
                    />
                  </AdminTh>
                  <AdminTh>Customer</AdminTh>
                  <AdminTh>Role</AdminTh>
                  <AdminTh>Orders</AdminTh>
                  <AdminTh className="text-right">Lifetime value</AdminTh>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const isSelected = selectedIds.has(customer.id);

                  return (
                    <AdminTr
                      key={customer.id}
                      interactive
                      onClick={() => setSelectedUserId(customer.id)}
                      className={isSelected ? "bg-accent-50/30" : ""}
                    >
                      {/* The cell keeps its own click-to-toggle so the whole
                          column stays a hit area. The checkbox stops the click
                          before it reaches here, so the two never double-fire. */}
                      <AdminTd
                        className="text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOne(customer.id);
                        }}
                      >
                        <AdminCheckbox
                          checked={isSelected}
                          onChange={() => toggleOne(customer.id)}
                          label={`Select ${customer.name || customer.email}`}
                        />
                      </AdminTd>
                      <AdminTd>
                        <div className="flex flex-col">
                          <span className="font-semibold text-ink">
                            {customer.name || "Guest customer"}
                          </span>
                          <span className="type-admin-meta text-neutral-500">{customer.email}</span>
                        </div>
                      </AdminTd>
                      <AdminTd>
                        <CustomerRoleControl
                          customer={customer}
                          saving={savingId === customer.id}
                          onChange={(role) => changeRole(customer.id, role)}
                        />
                      </AdminTd>
                      <AdminTd className="tabular-nums">{customer.ordersCount}</AdminTd>
                      <AdminTd className="text-right font-semibold tabular-nums text-ink">
                        $
                        {customer.totalSpent.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </AdminTd>
                    </AdminTr>
                  );
                })}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        ) : (
          /* Wider minimum than the catalogue's tiles: a customer card carries
             an email, which is the longest unbreakable string in the studio,
             plus a role select and a two-up figure block. */
          <AdminCardGrid min={280} className="p-3 md:p-4">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                isSelected={selectedIds.has(customer.id)}
                onToggleSelect={() => toggleOne(customer.id)}
                onOpen={() => setSelectedUserId(customer.id)}
                saving={savingId === customer.id}
                onChangeRole={(role) => changeRole(customer.id, role)}
              />
            ))}
          </AdminCardGrid>
        )}

        <div
          style={{ borderColor: ADMIN_RULE }}
          className="type-admin-meta flex items-center justify-between border-t bg-[#FBFAF8] px-4 py-3 text-neutral-500"
        >
          <span>Showing {filteredCustomers.length} customers</span>
          {roleError && <span className="font-semibold text-brand-terracotta">{roleError}</span>}
        </div>
      </AdminPanel>

      {/* PROFILE DRAWER */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setSelectedUserId(null)}
          />
          <div
            style={{ borderColor: ADMIN_RULE }}
            className="animate-in slide-in-from-right relative w-full max-w-4xl overflow-y-auto border-l bg-surface duration-300"
          >
            <CustomerProfileDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
