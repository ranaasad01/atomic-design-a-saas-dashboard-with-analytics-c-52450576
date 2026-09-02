"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, DollarSign, Users, Activity, Eye, RefreshCw, Download, BarChart2, FileText, Settings, HelpCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import DashboardShell from "@/components/DashboardShell";

// ─── Chart Data ───────────────────────────────────────────────────────────────

const REVENUE_DATA = [
  { month: "Jan", revenue: 38200, expenses: 24100 },
  { month: "Feb", revenue: 41500, expenses: 25800 },
  { month: "Mar", revenue: 39800, expenses: 23400 },
  { month: "Apr", revenue: 46300, expenses: 27600 },
  { month: "May", revenue: 52100, expenses: 29900 },
  { month: "Jun", revenue: 66490, expenses: 31200 },
];

const ACQUISITION_DATA = [
  { source: "Organic Search", users: 6390, color: "#10b981" },
  { source: "Direct", users: 5840, color: "#0ea5e9" },
  { source: "Social Media", users: 4210, color: "#2d3e9e" },
  { source: "Referral", users: 2202, color: "#f59e0b" },
];

const ACTIVITY_FEED = [
  {
    id: "a1",
    icon: "📊",
    description: "New report generated — 'Q2 Revenue Summary' exported as PDF",
    time: "2 minutes ago",
  },
  {
    id: "a2",
    icon: "👤",
    description: "New user registered — priya.nair@acmecorp.com joined via referral link",
    time: "11 minutes ago",
  },
  {
    id: "a3",
    icon: "⚠️",
    description: "Conversion rate alert — dropped below 3.5% threshold on mobile segment",
    time: "34 minutes ago",
  },
  {
    id: "a4",
    icon: "🔒",
    description: "Security event — Two-factor authentication enabled by Marcus Webb",
    time: "1 hour ago",
  },
  {
    id: "a5",
    icon: "📈",
    description: "Milestone reached — Active users surpassed 148,000 for the first time",
    time: "2 hours ago",
  },
];

// ─── KPI Cards ────────────────────────────────────────────────────────────────

const KPI_CARDS = [
  {
    label: "Total Revenue",
    value: "$284,390",
    trend: "up" as const,
    trendValue: "+12.4%",
    trendLabel: "vs last month",
    positive: true,
    icon: DollarSign,
  },
  {
    label: "Active Users",
    value: "148,642",
    trend: "up" as const,
    trendValue: "+8.1%",
    trendLabel: "vs last month",
    positive: true,
    icon: Users,
  },
  {
    label: "Avg. Session",
    value: "4m 32s",
    trend: "down" as const,
    trendValue: "-2.3%",
    trendLabel: "vs last month",
    positive: false,
    icon: Activity,
  },
  {
    label: "Conversion Rate",
    value: "3.68%",
    trend: "up" as const,
    trendValue: "+0.5pp",
    trendLabel: "vs last month",
    positive: true,
    icon: Eye,
  },
];

// ─── Quick Nav ────────────────────────────────────────────────────────────────

const QUICK_NAV = [
  { label: "Analytics", href: "/analytics", icon: BarChart2, desc: "Charts & metrics" },
  { label: "Reports", href: "/reports", icon: FileText, desc: "Manage reports" },
  { label: "Team", href: "/team", icon: Users, desc: "Team members" },
  { label: "Settings", href: "/settings", icon: Settings, desc: "Preferences" },
  { label: "Help Center", href: "/help-center", icon: HelpCircle, desc: "Support & FAQs" },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 shadow-md text-xs">
      <p className="mb-1 font-semibold text-[#191c1e]">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name.charAt(0).toUpperCase() + p.name.slice(1)}:{" "}
          {"$" + p.value.toLocaleString("en-US")}
        </p>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const actions = (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-2 border border-[#e2e8f0] bg-white px-4 py-2 rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#f7f9fb] transition-colors">
        <Download className="h-4 w-4" />
        Export
      </button>
      <button className="flex items-center gap-2 bg-[#0ea5e9] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0284c7] transition-colors">
        <RefreshCw className="h-4 w-4" />
        Refresh
      </button>
    </div>
  );

  return (
    <DashboardShell
      title="Dashboard Overview"
      subtitle="Monitor your key metrics and performance indicators"
      actions={actions}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#64748b] tracking-wider uppercase">
                  {card.label}
                </p>
                <div className="w-8 h-8 rounded-lg bg-[#f0f9ff] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#0ea5e9]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#191c1e] mt-1 mb-3">{card.value}</p>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    card.positive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {card.trend === "up" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {card.trendValue}
                </span>
                <span className="text-xs text-[#64748b]">{card.trendLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue vs Expenses */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#191c1e]">Revenue vs. Expenses</h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Six-month trend comparing gross revenue against operating expenses
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={REVENUE_DATA}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => "$" + v / 1000 + "k"}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                formatter={(value: string) =>
                  value.charAt(0).toUpperCase() + value.slice(1)
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#0ea5e9" }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#expensesGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#ef4444" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Acquisition */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#191c1e]">User Acquisition</h2>
            <p className="text-xs text-[#64748b] mt-0.5">New users by channel this period</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              layout="vertical"
              data={ACQUISITION_DATA}
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="source"
                width={100}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString("en-US"), "Users"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="users" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11, fill: "#64748b" }}>
                {ACQUISITION_DATA.map((entry) => (
                  <Cell key={entry.source} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#191c1e]">Recent Activity</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <ul className="space-y-3">
            {ACTIVITY_FEED.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5 flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#191c1e] leading-snug">{item.description}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
            <Link
              href="/analytics"
              className="text-sm font-medium text-[#0ea5e9] hover:text-[#0284c7] transition-colors"
            >
              View All Activity →
            </Link>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#191c1e]">Quick Navigation</h2>
            <p className="text-xs text-[#64748b] mt-0.5">Jump to any section of the dashboard</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 border border-[#e2e8f0] rounded-lg p-4 hover:border-[#0ea5e9] hover:bg-[#f0f9ff] transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#f0f9ff] group-hover:bg-[#e0f2fe] flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="h-4 w-4 text-[#0ea5e9]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#191c1e]">{item.label}</p>
                    <p className="text-xs text-[#64748b]">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
