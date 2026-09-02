"use client"

import React, { useState } from "react"
import { Search, ChevronDown, DollarSign, TrendingUp, CreditCard, Percent, ArrowUpRight, BarChart3 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Image from "next/image"

type UnitData = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  cost: number;
  marginPercent: number;
  unitsSold: number;
  totalProfitGenerated: number;
  status: string;
  isAssigned: boolean;
}

type FinancialSummary = {
  grossRevenue: number;
  productionCost: number;
  stripeFeeEstimate: number;
  netProfit: number;
  graphData: { date: string; revenue: number; orders: number }[];
  liveTickerTotal: number;
}

export default function FinanceClient({ 
  items, 
  summary 
}: { 
  items: UnitData[]; 
  summary: FinancialSummary 
}) {
  const [search, setSearch] = useState("")

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
  
  // Derived Stats
  const totalOrders = summary.graphData.reduce((acc, curr) => acc + curr.orders, 0)
  const aov = totalOrders > 0 ? summary.grossRevenue / totalOrders : 0
  const avgMargin = items.length > 0 
    ? items.reduce((acc, curr) => acc + curr.marginPercent, 0) / items.length 
    : 0

  const formatUSD = (val: number) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const downloadReport = () => {
    const headers = ["Product Name", "Retail Price", "Base Cost", "Profit/Unit", "Margin %", "Units Sold", "Yield"];
    const rows = filtered.map(i => [
      i.name,
      i.price.toFixed(2),
      i.cost.toFixed(2),
      (i.price - i.cost).toFixed(2),
      i.marginPercent.toFixed(1) + "%",
      i.unitsSold,
      i.totalProfitGenerated.toFixed(2)
    ]);

    const summaryContent = [
      ["FINANCIAL REPORT - UNRWLY STUDIO"],
      [`Generated: ${new Date().toLocaleString()}`],
      [""],
      ["KPI SUMMARY"],
      ["Gross Revenue", formatUSD(summary.grossRevenue)],
      ["Net Profit", formatUSD(summary.netProfit)],
      ["Gross COGS", formatUSD(summary.productionCost)],
      ["Stripe Fees (Est)", formatUSD(summary.stripeFeeEstimate)],
      [""],
      ["UNIT ECONOMICS"],
      headers,
      ...rows
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([summaryContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `UNRWLY_Finance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-sans max-w-[1400px] mx-auto">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Finance & Analytics</h1>
        <div className="flex gap-3">
          <button 
            onClick={downloadReport}
            className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Download Report
          </button>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
           <div className="flex items-center justify-between text-slate-500">
              <div className="flex items-center gap-2">
                 <DollarSign size={16} />
                 <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
              </div>
              <TrendingUp size={14} className="text-emerald-500" />
           </div>
           <p className="text-2xl font-bold text-slate-900">{formatUSD(summary.grossRevenue)}</p>
           <p className="text-[10px] text-slate-400 font-medium tracking-wide">Last 30 days aggregate</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
           <div className="flex items-center justify-between text-slate-500">
              <div className="flex items-center gap-2">
                 <CreditCard size={16} />
                 <span className="text-xs font-bold uppercase tracking-wider">Net Profit</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">AUDITED</span>
           </div>
           <p className="text-2xl font-bold text-slate-900">{formatUSD(summary.netProfit)}</p>
           <p className="text-[10px] text-slate-400 font-medium tracking-wide">After COGS & Stripe Fees</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
           <div className="flex items-center justify-between text-slate-500">
              <div className="flex items-center gap-2">
                 <BarChart3 size={16} />
                 <span className="text-xs font-bold uppercase tracking-wider">Avg Order Value</span>
              </div>
           </div>
           <p className="text-2xl font-bold text-slate-900">{formatUSD(aov)}</p>
           <p className="text-[10px] text-slate-400 font-medium tracking-wide">Based on {totalOrders} orders</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
           <div className="flex items-center justify-between text-slate-500">
              <div className="flex items-center gap-2">
                 <Percent size={16} />
                 <span className="text-xs font-bold uppercase tracking-wider">Avg Margin</span>
              </div>
           </div>
           <p className="text-2xl font-bold text-slate-900">{avgMargin.toFixed(1)}%</p>
           <p className="text-[10px] text-slate-400 font-medium tracking-wide">Portfolio-wide average</p>
        </div>
      </div>

      {/* REVENUE VELOCITY CHART */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest italic mb-6">Revenue Velocity (Last 30 Days)</h3>
        <div className="h-[300px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.graphData}>
                 <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                 </defs>
                 <XAxis 
                    dataKey="date" 
                    hide 
                 />
                 <YAxis 
                    hide 
                 />
                 <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                 />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* UNIT ECONOMICS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
           <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Product SKU search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Product</th>
                <th className="px-4 py-4">Retail</th>
                <th className="px-4 py-4">Base Cost</th>
                <th className="px-4 py-4">Profit/Unit</th>
                <th className="px-4 py-4">Margin %</th>
                <th className="px-4 py-4 text-center">Velocity</th>
                <th className="px-6 py-4 text-right">Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const profitPerUnit = item.price - item.cost
                const isLowMargin = item.marginPercent < 40
                const isHighMargin = item.marginPercent > 60

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                             {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{item.name}</span>
                       </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-600">
                       {formatUSD(item.price)}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-400">
                       {formatUSD(item.cost)}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">
                       {formatUSD(profitPerUnit)}
                    </td>
                    <td className="px-4 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isHighMargin ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          isLowMargin ? "bg-rose-50 text-rose-700 border border-rose-100" :
                          "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}>
                          {item.marginPercent.toFixed(1)}%
                       </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 font-medium text-center">
                       {item.unitsSold}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                       {formatUSD(item.totalProfitGenerated)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
