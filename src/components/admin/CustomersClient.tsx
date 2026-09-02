"use client";

import React, { useState } from "react";
import { Search, DollarSign, Users, Star, Lock } from "lucide-react";
import CustomerProfileDrawer from "./CustomerProfileDrawer";
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

  const toggleAll = () => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <div className="space-y-8 font-sans max-w-[1400px] mx-auto">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <div className="flex gap-3">
        </div>
      </div>

      {/* LTV DASHBOARD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
           <div className="flex items-center gap-2 text-slate-500">
              <Users size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Total Customers</span>
           </div>
           <p className="text-3xl font-bold text-slate-900">{totalCustomers.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
           <div className="flex items-center gap-2 text-slate-500">
              <DollarSign size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Average Order Value (AOV)</span>
           </div>
           <p className="text-3xl font-bold text-slate-900">${aov.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
           <div className="flex items-center gap-2 text-slate-500">
              <Star size={16} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Active VIPs</span>
           </div>
           <p className="text-3xl font-bold text-slate-900">{activeVips}</p>
        </div>
      </div>

      {/* RESOURCE LIST CARD */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent-700 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search customers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-700 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 w-12 text-center">
                   <div 
                    className={`w-4 h-4 border rounded cursor-pointer mx-auto flex items-center justify-center transition-all ${selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0 ? 'bg-accent-800 border-accent-800' : 'bg-white border-slate-300'}`}
                    onClick={toggleAll}
                  >
                    {selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0 && <div className="w-1.5 h-px bg-white rotate-45" />}
                  </div>
                </th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4">Orders</th>
                <th className="px-4 py-4 text-right">LTV (Spent)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => {
                const isSelected = selectedIds.has(customer.id);
                
                return (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedUserId(customer.id)}
                    className={`group hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-accent-50/30' : ''}`}
                  >
                    <td className="px-6 py-4" onClick={(e) => toggleOne(customer.id, e)}>
                       <div className={`w-4 h-4 border rounded transition-all mx-auto flex items-center justify-center ${isSelected ? 'bg-accent-800 border-accent-800' : 'bg-white border-slate-300'}`}>
                          {isSelected && <div className="w-1.5 h-px bg-white rotate-45" />}
                       </div>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{customer.name || "Guest Customer"}</span>
                          <span className="text-xs text-slate-500 font-medium">{customer.email}</span>
                       </div>
                    </td>
                    <td className="px-4 py-4">
                       {customer.pinned || customer.isSelf ? (
                          <span
                            title={customer.pinned
                              ? "Pinned as an admin in ADMIN_EMAILS — change it there"
                              : "You cannot change your own role"}
                            className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100 uppercase tracking-wider inline-flex items-center gap-1"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            {customer.role}
                          </span>
                       ) : (
                          <select
                            value={customer.role}
                            disabled={savingId === customer.id}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => changeRole(customer.id, e.target.value as Role)}
                            className={`text-[11px] font-bold rounded-full border px-2 py-1 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-500 ${
                              customer.role === "ADMIN"
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : customer.role === "VIP"
                                ? "bg-[#FFF5D1] text-[#4F4700] border-[#FBE9B3]"
                                : "bg-white text-slate-600 border-slate-200"
                            }`}
                          >
                            <option value="CUSTOMER">Customer</option>
                            <option value="VIP">VIP</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                       )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                      {customer.ordersCount} orders
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900 text-right">
                      ${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500 font-medium">
           <span>Showing {filteredCustomers.length} customers</span>
           {roleError && <span className="text-rose-600 font-semibold">{roleError}</span>}
        </div>
      </div>

      {/* PROFILE DRAWER */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedUserId(null)} />
           <div className="relative w-full max-w-4xl bg-[#F6F6F7] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-200">
              <CustomerProfileDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
           </div>
        </div>
      )}
    </div>
  );
}
