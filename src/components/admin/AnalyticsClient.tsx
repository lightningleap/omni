"use client"

import React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Activity, DollarSign } from "lucide-react"

type AnalyticsData = {
  grossRevenue: number;
  productionCost: number;
  stripeFeeEstimate: number;
  netProfit: number;
  graphData: { date: string; revenue: number; orders: number }[];
  liveTickerTotal: number;
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  // Formatters
  const formatUSD = (val: number) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-12 font-sans text-neutral-900 max-w-[1400px] mx-auto">
      {/* Header - Integrated */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 italic">Profit Engine</h2>
          <p className="text-sm text-neutral-500 font-medium">Real-time financial performance and growth metrics.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          <Activity size={12} className="animate-pulse" /> Live Uplink
        </div>
      </div>

      {/* High-Impact Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white border border-neutral-200/60 rounded-3xl group hover:shadow-xl hover:shadow-accent-500/5 transition-all relative overflow-hidden shadow-sm">
          <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-accent-700">
            <DollarSign size={120} />
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-4">Gross processing volume</h3>
          <p className="text-3xl font-black tracking-tight text-neutral-900">{formatUSD(data.grossRevenue)}</p>
        </div>

        <div className="p-8 bg-white border border-neutral-200/60 rounded-3xl group hover:shadow-xl hover:shadow-rose-500/5 transition-all relative overflow-hidden shadow-sm">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-4">Unrwly baseline costs</h3>
          <p className="text-3xl font-black tracking-tight text-rose-500">-{formatUSD(data.productionCost + data.stripeFeeEstimate)}</p>
          <div className="mt-4 flex gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            <span>PROD: {formatUSD(data.productionCost)}</span>
            <span className="opacity-20">|</span>
            <span>GATE: {formatUSD(data.stripeFeeEstimate)}</span>
          </div>
        </div>

        <div className="p-8 bg-accent-800 rounded-3xl group hover:shadow-2xl hover:shadow-accent-800/20 transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity text-white">
            <TrendingUp size={120} />
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-black mb-4">Net profit realized</h3>
          <p className="text-3xl font-black tracking-tight text-white">{formatUSD(data.netProfit)}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white/80 uppercase tracking-widest">
            PROFIT MARGIN: {((data.netProfit / data.grossRevenue) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="p-10 bg-white border border-neutral-200/60 rounded-[40px] shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-black">30-day revenue vs volume matrix</h3>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-800" />
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Gross Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Order Count</span>
            </div>
          </div>
        </div>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.graphData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#cbd5e1" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                dy={15}
                className="font-bold uppercase tracking-widest"
              />
              <YAxis 
                yAxisId="left"
                stroke="#64748b" 
                fontSize={10}
                tickFormatter={(value) => `$${value}`}
                tickLine={false}
                axisLine={false}
                dx={-15}
                className="font-bold"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={15}
                className="font-bold"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.9)", 
                  backdropFilter: "blur(10px)",
                  border: "1px solid #e2e8f0", 
                  borderRadius: "16px", 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  padding: "16px"
                }}
                itemStyle={{ color: "#1e293b", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}
                labelStyle={{ color: "#64748b", fontSize: "10px", marginBottom: "8px", textTransform: "uppercase", fontWeight: "black", letterSpacing: "0.2em" }}
                formatter={(value: any, name: any) => {
                  if (name === "revenue") return [formatUSD(value), "GROSS REVENUE"]
                  return [value, "ORDERS"]
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#4f46e5" 
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 8, fill: "#4f46e5", stroke: "#fff", strokeWidth: 3 }}
              />
              <Line 
                yAxisId="right"
                type="stepAfter" 
                dataKey="orders" 
                stroke="#e2e8f0" 
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
