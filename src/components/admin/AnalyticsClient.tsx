"use client"

import React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Activity, DollarSign } from "lucide-react"
import { ADMIN_ACCENT, ADMIN_RULE, AdminPageHeader, AdminPanel } from "@/components/admin/ui/primitives"

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
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        meta="Real-time financial performance and growth metrics."
        action={
          <div className="type-admin-label flex items-center gap-2 rounded-card border border-accent-200 bg-accent-50 px-4 py-2 text-accent-700">
            <Activity size={12} className="animate-pulse" /> Live
          </div>
        }
      />

      {/* The three tiles were 10px labels at 0.2em over 24px figures inside 32px
          of padding — a different label step, a different padding and a
          different radius from the metric tiles on Finance and Customers, which
          are the same kind of thing. They are AdminPanel now, on the studio's
          label and stat steps. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <AdminPanel padded className="group relative">
          <div className="pointer-events-none absolute -right-6 -top-6 text-accent-700 opacity-[0.03] transition-opacity group-hover:opacity-[0.05]">
            <DollarSign size={120} />
          </div>
          <h2 className="type-admin-label text-neutral-400">Gross processing volume</h2>
          <p className="type-admin-stat mt-2 text-ink">{formatUSD(data.grossRevenue)}</p>
        </AdminPanel>

        <AdminPanel padded className="group relative">
          <h2 className="type-admin-label text-neutral-400">Baseline costs</h2>
          <p className="type-admin-stat mt-2 text-brand-terracotta">
            -{formatUSD(data.productionCost + data.stripeFeeEstimate)}
          </p>
          <div className="type-admin-meta mt-3 flex gap-3 text-neutral-400">
            <span>Production {formatUSD(data.productionCost)}</span>
            <span aria-hidden className="opacity-30">·</span>
            <span>Gateway {formatUSD(data.stripeFeeEstimate)}</span>
          </div>
        </AdminPanel>

        {/* The one tile that stays dark — it is the page's headline figure.
            Its heading is white and only renders white now that the global
            heading colour is layered; unlayered, it took #0F172A on an
            accent-800 ground and was effectively invisible. */}
        <div className="group relative overflow-hidden rounded-panel bg-accent-800 p-5 md:p-6">
          <div className="pointer-events-none absolute -right-6 -top-6 text-white opacity-10 transition-opacity group-hover:opacity-20">
            <TrendingUp size={120} />
          </div>
          <h2 className="type-admin-label text-white/70">Net profit realized</h2>
          <p className="type-admin-stat mt-2 text-white">{formatUSD(data.netProfit)}</p>
          <div className="type-admin-meta mt-3 inline-flex items-center gap-2 rounded-card bg-white/10 px-3 py-1 font-semibold text-white/80">
            Profit margin {((data.netProfit / data.grossRevenue) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <AdminPanel padded>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="type-admin-section text-ink">30-day revenue vs. order volume</h2>
          <div className="flex gap-5">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-accent-800" />
              <span className="type-admin-meta text-neutral-600">Gross revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
              <span className="type-admin-meta text-neutral-600">Order count</span>
            </div>
          </div>
        </div>
        <div className="h-[420px] w-full">
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
              />
              <YAxis 
                yAxisId="left"
                stroke="#64748b" 
                fontSize={10}
                tickFormatter={(value) => `$${value}`}
                tickLine={false}
                axisLine={false}
                dx={-15}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={15}
              />
              <Tooltip 
                /* Recharts renders the tooltip outside React's class tree, so
                   these are inline styles rather than type classes — but the
                   values are the studio's: the panel rule and radius, 13px body
                   for the figure, 12px meta for the label. It was a 16px-radius
                   glass card with black-weight 0.2em caps. */
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${ADMIN_RULE}`,
                  borderRadius: "8px",
                  boxShadow: "none",
                  padding: "10px 12px",
                }}
                itemStyle={{ color: "#1A1A1A", fontSize: "13px", fontWeight: 600 }}
                labelStyle={{ color: "#737373", fontSize: "12px", marginBottom: "6px", fontWeight: 500 }}
                formatter={(value: any, name: any) => {
                  if (name === "revenue") return [formatUSD(value), "Gross revenue"]
                  return [value, "Orders"]
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke={ADMIN_ACCENT}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: ADMIN_ACCENT, stroke: "#fff", strokeWidth: 2 }}
              />
              <Line 
                yAxisId="right"
                type="stepAfter" 
                dataKey="orders" 
                stroke="#e2e8f0"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </AdminPanel>
    </div>
  )
}
