"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Users, Zap, Heart, TrendingDown, TrendingUp, UserPlus, Server, AlertCircle, Clock, Download, SlidersHorizontal } from 'lucide-react';

// ─── Chart Data ───────────────────────────────────────────────────────────────

const USER_GROWTH_DATA = [
  { month: "Jan", users: 82000, newUsers: 4200 },
  { month: "Feb", users: 89000, newUsers: 5100 },
  { month: "Mar", users: 95000, newUsers: 6800 },
  { month: "Apr", users: 104000, newUsers: 7200 },
  { month: "May", users: 115000, newUsers: 8400 },
  { month: "Jun", users: 124592, newUsers: 9100 },
];

const TRAFFIC_SOURCES_DATA = [
  { name: "Direct", value: 35, color: "#0ea5e9" },
  { name: "Social", value: 28, color: "#2d3e9e" },
  { name: "Organic", value: 25, color: "#10b981" },
  { name: "Referral", value: 12, color: "#f59e0b" },
];

const REGIONAL_DATA = [
  { region: "North America", users: 52000, color: "#0ea5e9" },
  { region: "Europe", users: 38000, color: "#2d3e9e" },
  { region: "APAC", users: 24000, color: "#10b981" },
  { region: "LATAM", users: 10592, color: "#f59e0b" },
];

// ─── KPI Cards ────────────────────────────────────────────────────────────────

const KPI_CARDS = [
  {
    label: "Total Users",
    value: "124,592",
    trend: "+12.5%",
    trendLabel: "vs last month",
    positive: true,
    icon: Users,
    iconBg: "#e0f2fe",
    iconColor: "#0ea5e9",
  },
  {
    label: "Active Sessions",
    value: "8,234",
    trend: "+5.2%",
    trendLabel: "vs last month",
    positive: true,
    icon: Zap,
    iconBg: "#e0f2fe",
    iconColor: "#0ea5e9",
  },
  {
    label: "Retention Rate",
    value: "78.4%",
    trend: "+1.1%",
    trendLabel: "vs last month",
    positive: true,
    icon: Heart,
    iconBg: "#d1fae5",
    iconColor: "#10b981",
  },
  {
    label: "Churn Rate",
    value: "2.1%",
    trend: "-0.4%",
    trendLabel: "vs last month",
    positive: false,
    icon: TrendingDown,
    iconBg: "#fee2e2",
    iconColor: "#ef4444",
  },
];

// ─── Performance Table Data ───────────────────────────────────────────────────

const PERF_TABLE = [
  {
    id: "1",
    date: "Oct 24, 2023",
    metric: "New Signups",
    metricIcon: UserPlus,
    value: "1,204",
    status: "Optimal",
  },
  {
    id: "2",
    date: "Oct 23, 2023",
    metric: "Server Load",
    metricIcon: Server,
    value: "42%",
    status: "Optimal",
  },
  {
    id: "3",
    date: "Oct 22, 2023",
    metric: "Error Rate",
    metricIcon: AlertCircle,
    value: "1.5%",
    status: "Warning",
  },
  {
    id: "4",
    date: "Oct 21, 2023",
    metric: "Avg Session",
    metricIcon: Clock,
    value: "04:12",
    status: "Normal",
  },
  {
    id: "5",
    date: "Oct 20, 2023",
    metric: "New Signups",
    metricIcon: UserPlus,
    value: "987",
    status: "Optimal",
  },
  {
    id: "6",
    date: "Oct 19, 2023",
    metric: "Server Load",
    metricIcon: Server,
    value: "71%",
    status: "Warning",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Optimal: { bg: "#dcfce7", text: "#166534" },
    Warning: { bg: "#fef3c7", text: "#92400e" },
    Normal: { bg: "#f1f5f9", text: "#475569" },
  };
  const style = map[status] ?? map["Normal"];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}

function TrendBadge({ trend, positive }: { trend: string; positive: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: positive ? "#dcfce7" : "#fee2e2",
        color: positive ? "#166534" : "#991b1b",
      }}
    >
      {positive ? (
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden="true" />
      )}
      {trend}
    </span>
  );
}

function CustomAreaTooltip({
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
          {p.name === "users" ? "Total Users" : "New Users"}:{" "}
          {p.value.toLocaleString("en-US")}
        </p>
      ))}
    </div>
  );
}

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 shadow-md text-xs">
      <p className="mb-1 font-semibold text-[#191c1e]">{label}</p>
      <p className="text-[#0ea5e9]">
        Users: {payload[0]?.value?.toLocaleString("en-US")}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeFilter, setActiveFilter] = useState("6M");

  const filterOptions = ["1M", "3M", "6M", "1Y"];

  return (
    <DashboardShell
      title="Analytics"
      subtitle="Deep-dive into user behavior, traffic sources, and growth trends"
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-white p-1">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  activeFilter === opt
                    ? "bg-[#0ea5e9] text-white shadow-sm"
                    : "text-[#64748b] hover:text-[#191c1e]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-medium text-[#191c1e] shadow-sm transition-all duration-200 hover:bg-[#f7f9fb] hover:shadow-md">
            <SlidersHorizontal className="h-4 w-4 text-[#64748b]" aria-hidden="true" />
            Filters
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#0ea5e9] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#0284c7] hover:shadow-md">
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Report
          </button>
        </div>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold text-[#191c1e] mt-1 mb-2">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-2">
                    <TrendBadge trend={card.trend} positive={card.positive} />
                    <span className="text-xs text-[#64748b]">{card.trendLabel}</span>
                  </div>
                </div>
                <div
                  className="rounded-lg p-2 flex-shrink-0"
                  style={{ backgroundColor: card.iconBg }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: card.iconColor }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row: User Growth + Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* User Growth — col-span-2 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#191c1e]">User Growth</h3>
            <p className="text-xs text-[#64748b] mt-0.5">6-month trend</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={USER_GROWTH_DATA}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                tickFormatter={(v: number) => (v / 1000).toFixed(0) + "k"}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomAreaTooltip />} />
              <Legend
                formatter={(value: string) =>
                  value === "users" ? "Total Users" : "New Users"
                }
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#colorUsers)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="newUsers"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorNewUsers)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources — col-span-1 */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#191c1e]">Traffic Sources</h3>
            <p className="text-xs text-[#64748b] mt-0.5">Current period breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={TRAFFIC_SOURCES_DATA}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                strokeWidth={0}
              >
                {TRAFFIC_SOURCES_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, ""]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom Legend */}
          <div className="mt-3 space-y-2">
            {TRAFFIC_SOURCES_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-[#64748b]">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-[#191c1e]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm mb-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#191c1e]">Regional Distribution</h3>
          <p className="text-xs text-[#64748b] mt-0.5">Users by geographic region</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={REGIONAL_DATA}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="region"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => (v / 1000).toFixed(0) + "k"}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="users" radius={[4, 4, 0, 0]}>
              {REGIONAL_DATA.map((entry) => (
                <Cell key={entry.region} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
          <div>
            <h3 className="text-base font-semibold text-[#191c1e]">Performance Log</h3>
            <p className="text-xs text-[#64748b] mt-0.5">Recent metric snapshots</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs font-medium text-[#64748b] hover:bg-[#f7f9fb] transition-colors">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f7f9fb] border-b border-[#e2e8f0]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Value
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {PERF_TABLE.map((row) => {
                const MetricIcon = row.metricIcon;
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#f7f9fb] transition-colors duration-150"
                  >
                    <td className="px-5 py-3.5 text-xs text-[#64748b] whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <MetricIcon
                          className="h-4 w-4 text-[#64748b] flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-[#191c1e]">
                          {row.metric}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#191c1e]">
                      {row.value}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
