"use client"

import React, { useState } from "react"
import { DollarSign, TrendingUp, CreditCard, Percent, BarChart3 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Image from "next/image"
import FinanceUnitCard, { formatUSD } from "@/components/admin/cards/FinanceUnitCard"
import { MarginBadge } from "@/components/admin/MarginBadge"
import { AdminCardGrid, AdminViewToggle, useAdminView } from "@/components/admin/ui/views"
import {
  ADMIN_ACCENT,
  ADMIN_RULE,
  AdminButton,
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
} from "@/components/admin/ui/primitives"

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
  // Presentation only: the search string above is the single source of what
  // either view shows, so switching cannot change the result set.
  const [view, setView] = useAdminView("finance")

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
  
  // Derived Stats
  const totalOrders = summary.graphData.reduce((acc, curr) => acc + curr.orders, 0)
  const aov = totalOrders > 0 ? summary.grossRevenue / totalOrders : 0
  const avgMargin = items.length > 0 
    ? items.reduce((acc, curr) => acc + curr.marginPercent, 0) / items.length 
    : 0

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
    <div className="space-y-6">
      <AdminPageHeader
        title="Finance"
        meta="Unit economics and revenue, last 30 days."
        action={<AdminButton onClick={downloadReport}>Download report</AdminButton>}
      />

      {/* Four KPI tiles. They were four hand-built cards — `text-xs font-bold
          uppercase tracking-wider` labels over 24px figures over 10px hints —
          duplicated four times with the values retyped in each. AdminStat is
          that card, and it is the same one the Customers page uses. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AdminStat
          label={
            <>
              <DollarSign aria-hidden size={13} className="mr-1.5 inline align-[-2px]" />
              Total revenue
            </>
          }
          value={formatUSD(summary.grossRevenue)}
          hint="Last 30 days aggregate"
        />
        <AdminStat
          label={
            <>
              <CreditCard aria-hidden size={13} className="mr-1.5 inline align-[-2px]" />
              Net profit
            </>
          }
          value={formatUSD(summary.netProfit)}
          hint="After COGS and Stripe fees"
          tone="accent"
        />
        <AdminStat
          label={
            <>
              <BarChart3 aria-hidden size={13} className="mr-1.5 inline align-[-2px]" />
              Avg. order value
            </>
          }
          value={formatUSD(aov)}
          hint={`Based on ${totalOrders} orders`}
        />
        <AdminStat
          label={
            <>
              <Percent aria-hidden size={13} className="mr-1.5 inline align-[-2px]" />
              Avg. margin
            </>
          }
          value={`${avgMargin.toFixed(1)}%`}
          hint="Portfolio-wide average"
        />
      </div>

      {/* Revenue velocity. The heading was the studio's last uppercase-italic
          holdout — `text-sm font-bold uppercase tracking-widest italic`. */}
      <AdminPanel padded>
        <h2 className="type-admin-section mb-5 flex items-center gap-2 text-ink">
          Revenue velocity
          <TrendingUp aria-hidden size={14} className="text-accent-600" />
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={summary.graphData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ADMIN_ACCENT} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={ADMIN_ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                /* Same tooltip chrome as the Analytics chart, so the two read
                   as one system: the panel rule, the panel radius, no shadow. */
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${ADMIN_RULE}`,
                  borderRadius: "8px",
                  boxShadow: "none",
                  padding: "10px 12px",
                }}
                itemStyle={{ color: "#1A1A1A", fontSize: "13px", fontWeight: 600 }}
                labelStyle={{ color: "#737373", fontSize: "12px", marginBottom: "6px", fontWeight: 500 }}
                formatter={(value) => [formatUSD(Number(value)), "Gross revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={ADMIN_ACCENT}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </AdminPanel>

      {/* Unit economics. This table hand-rolled its own head, rows and cells at
          a different size and weight from the Orders, Products and Customers
          tables; it is the shared table now. */}
      <AdminPanel>
        <div
          style={{ borderColor: ADMIN_RULE }}
          className="flex items-center justify-between gap-3 border-b p-4"
        >
          <div className="w-full min-w-0 max-w-md">
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search products…"
              label="Search unit economics by product name"
            />
          </div>
          <AdminViewToggle view={view} onChange={setView} />
        </div>

        {filtered.length === 0 ? (
          <AdminEmpty
            title="No products match that search"
            message="Clear the search to see every product's unit economics."
          />
        ) : view === "list" ? (
          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <AdminTh>Product</AdminTh>
                  <AdminTh>Retail</AdminTh>
                  <AdminTh>Base cost</AdminTh>
                  <AdminTh>Profit / unit</AdminTh>
                  <AdminTh>Margin</AdminTh>
                  <AdminTh className="text-center">Units sold</AdminTh>
                  <AdminTh className="text-right">Yield</AdminTh>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const profitPerUnit = item.price - item.cost

                  return (
                    <AdminTr key={item.id}>
                      <AdminTd>
                        <div className="flex items-center gap-3">
                          <div
                            style={{ borderColor: ADMIN_RULE }}
                            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-card border bg-[#FBFAF8]"
                          >
                            {item.imageUrl && (
                              <Image src={item.imageUrl} alt="" fill className="object-cover" />
                            )}
                          </div>
                          <span className="font-semibold text-ink">{item.name}</span>
                        </div>
                      </AdminTd>
                      <AdminTd className="tabular-nums">{formatUSD(item.price)}</AdminTd>
                      <AdminTd className="tabular-nums text-neutral-400">{formatUSD(item.cost)}</AdminTd>
                      <AdminTd className="font-semibold tabular-nums text-ink">
                        {formatUSD(profitPerUnit)}
                      </AdminTd>
                      <AdminTd>
                        <MarginBadge marginPercent={item.marginPercent} />
                      </AdminTd>
                      <AdminTd className="text-center tabular-nums">{item.unitsSold}</AdminTd>
                      <AdminTd className="text-right font-semibold tabular-nums text-ink">
                        {formatUSD(item.totalProfitGenerated)}
                      </AdminTd>
                    </AdminTr>
                  )
                })}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        ) : (
          /* Narrower minimum than the Orders grid: a unit card's longest line
             is a label and a formatted figure, not an email address. */
          <AdminCardGrid min={256} className="p-3 md:p-4">
            {filtered.map((item) => (
              <FinanceUnitCard key={item.id} item={item} />
            ))}
          </AdminCardGrid>
        )}
      </AdminPanel>
    </div>
  )
}
