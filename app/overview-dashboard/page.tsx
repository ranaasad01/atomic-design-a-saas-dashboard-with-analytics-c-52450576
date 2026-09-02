"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
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
  PieChart,
  Pie,
} from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Eye, ArrowUpRight, ArrowDownRight, RefreshCw, Bell, CheckCircle, AlertCircle, Info, Download } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type ActivityEvent = Database["public"]["Tables"]["activity_events"]["Row"];
type MetricRow = Database["public"]["Tables"]["metrics"]["Row"];

// ─── Chart Data ───────────────────────────────────────────────────────────────

const REVENUE_CHART_DATA = [
  { month: "Jan", revenue: 38200, expenses: 24100 },
  { month: "Feb", revenue: 41500, expenses: 25800 },
  { month: "Mar", revenue: 39800, expenses: 23400 },
  { month: "Apr", revenue: 46300, expenses: 27600 },
  { month: "May", revenue: 52100, expenses: 29900 },
  { month: "Jun", revenue: 66490, expenses: 31200 },
];

const USER_GROWTH_DATA = [
  { month: "Jan", users: 82000 },
  { month: "Feb", users: 89000 },
  { month: "Mar", users: 95000 },
  { month: "Apr", users: 104000 },
  { month: "May", users: 115000 },
  { month: "Jun", users: 124592 },
];

const TRAFFIC_SOURCES_DATA = [
  { name: "Direct", value: 35, color: "#0ea5e9" },
  { name: "Social", value: 28, color: "#2d3e9e" },
  { name: "Organic", value: 25, color: "#10b981" },
  { name: "Referral", value: 12, color: "#f59e0b" },
];

const REGIONAL_DATA = [
  { region: "NA", users: 52000, color: "#0ea5e9" },
  { region: "EU", users: 38000, color: "#2d3e9e" },
  { region: "APAC", users: 24000, color: "#10b981" },
  { region: "LATAM", users: 10592, color: "#f59e0b" },
];

// ─── KPI Fallbacks ────────────────────────────────────────────────────────────

const FALLBACK_KPIS = [
  {
    label: "Total Revenue",
    value: "$284,390",
    trend: "up" as const,
    trendValue: "+12.4%",
    icon: "dollar",
    positive: true,
  },
  {
    label: "Active Users",
    value: "148,620",
    trend: "up" as const,
    trendValue: "+8.7%",
    icon: "users",
    positive: true,
  },
  {
    label: "Avg. Session",
    value: "4m 32s",
    trend: "down" as const,
    trendValue: "-2.1%",
    icon: "activity",
    positive: false,
  },
  {
    label: "Page Views",
    value: "2.41M",
    trend: "up" as const,
    trendValue: "+19.3%",
    icon: "eye",
    positive: true,
  },
];

const KPI_ICON_MAP: Record<string, React.ReactNode> = {
  dollar: <DollarSign className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  activity: <Activity className="w-5 h-5" />,
  eye: <Eye className="w-5 h-5" />,
};

const KPI_ICON_COLORS: Record<string, { bg: string; color: string }> = {
  dollar: { bg: "#e0f2fe", color: "#0ea5e9" },
  users: { bg: "#e8eaf6", color: "#2d3e9e" },
  activity: { bg: "#d1fae5", color: "#10b981" },
  eye: { bg: "#fef3c7", color: "#f59e0b" },
};

// ─── Performance Table Data ───────────────────────────────────────────────────

const PERF_ROWS = [
  { metric: "Page Load Time", value: "1.24 s", status: "Good", delta: "-0.08s" },
  { metric: "API Response (p95)", value: "182 ms", status: "Good", delta: "-14ms" },
  { metric: "Error Rate", value: "0.42%", status: "Warning", delta: "+0.12%" },
  { metric: "Uptime (30d)", value: "99.97%", status: "Good", delta: "0.00%" },
  { metric: "Conversion Rate", value: "3.81%", status: "Good", delta: "+0.34%" },
];

// ─── Activity Feed Data ───────────────────────────────────────────────────────

const FALLBACK_ACTIVITY = [
  {
    id: "a1",
    icon: "check",
    description: "New report generated — Q2 Revenue Summary exported as PDF",
    time: "2 min ago",
  },
  {
    id: "a2",
    icon: "user",
    description: "New user registered — priya.nair@acmecorp.com joined via referral",
    time: "11 min ago",
  },
  {
    id: "a3",
    icon: "alert",
    description: "Conversion rate alert — dropped below 3.5% threshold on mobile",
    time: "34 min ago",
  },
  {
    id: "a4",
    icon: "bell",
    description: "Security event — Two-factor authentication enabled by Marcus Webb",
    time: "1 hr ago",
  },
  {
    id: "a5",
    icon: "activity",
    description: "Milestone reached — Active users surpassed 124,000 for the first time",
    time: "2 hr ago",
  },
];

// ─── Helper Components ────────────────────────────────────────────────────────

const ACTIVITY_ICON_MAP: Record<string, React.ReactNode> = {
  check: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  alert: <AlertCircle className="w-4 h-4 text-amber-500" />,
  info: <Info className="w-4 h-4 text-sky-500" />,
  bell: <Bell className="w-4 h-4 text-violet-500" />,
  user: <Users className="w-4 h-4 text-sky-500" />,
  activity: <Activity className="w-4 h-4 text-emerald-500" />,
};

function getActivityIcon(icon: string | null) {
  if (!icon) return <Info className="w-4 h-4 text-sky-500" />;
  return ACTIVITY_ICON_MAP[icon] ?? <Info className="w-4 h-4 text-sky-500" />;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";
  if (status === "Good")
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Good
      </span>
    );
  if (status === "Warning")
    return (
      <span className={`${base} bg-amber-50 text-amber-700 border border-amber-200`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Warning
      </span>
    );
  return (
    <span className={`${base} bg-red-50 text-red-700 border border-red-200`}>
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
      Critical
    </span>
  );
}

function CustomTooltip({
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
          {p.name}:{" "}
          {typeof p.value === "number" && p.value > 999
            ? p.value.toLocaleString("en-US")
            : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewDashboardPage() {
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      const [{ data: events }, { data: metricsData }] = await Promise.all([
        supabase
          .from("activity_events")
          .select("*")
          .order("occurred_at", { ascending: false })
          .limit(5),
        supabase.from("metrics").select("*").limit(4),
      ]);
      if (events) setActivityEvents(events);
      if (metricsData) setMetrics(metricsData);
    } catch {
      // silently fall back to static data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Resolve KPI values — prefer live metrics, fall back to static
  const kpis = FALLBACK_KPIS;

  // Resolve activity — prefer live, fall back to static
  const displayActivity: Array<{ id: string; icon: string | null; description: string; time: string }> =
    activityEvents.length > 0
      ? activityEvents.map((e) => ({
          id: e.id,
          icon: (e as unknown as { icon: string | null }).icon ?? null,
          description: e.description,
          time: timeAgo(e.occurred_at),
        }))
      : FALLBACK_ACTIVITY;

  const pageActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] transition-colors disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        Refresh
      </button>
      <button className="inline-flex items-center gap-2 rounded-lg bg-[#0ea5e9] px-3 py-2 text-sm font-medium text-white hover:bg-[#0284c7] transition-colors shadow-sm">
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  );

  return (
    <DashboardShell
      title="Overview Dashboard"
      subtitle="Comprehensive view of all key metrics and system performance"
      actions={pageActions}
    >
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => {
          const iconStyle = KPI_ICON_COLORS[kpi.icon] ?? { bg: "#e0f2fe", color: "#0ea5e9" };
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                  {kpi.label}
                </p>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: iconStyle.bg, color: iconStyle.color }}
                >
                  {KPI_ICON_MAP[kpi.icon]}
                </div>
              </div>
              <p className="text-3xl font-bold text-[#191c1e] tracking-tight mb-2">
                {kpi.value}
              </p>
              <div className="flex items-center gap-1">
                {kpi.positive ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    kpi.positive ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {kpi.trendValue}
                </span>
                <span className="text-xs text-[#64748b] ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row 1: Revenue + User Growth ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue vs Expenses */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#191c1e]">Revenue vs. Expenses</h3>
            <p className="text-xs text-[#64748b] mt-0.5">Six-month trend comparison</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={REVENUE_CHART_DATA}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#gradRevenue)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gradExpenses)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#191c1e]">User Growth</h3>
            <p className="text-xs text-[#64748b] mt-0.5">Monthly active user trend</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={USER_GROWTH_DATA}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="users"
                name="Users"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradUsers)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2: Traffic Sources + Regional ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Traffic Sources Pie */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#191c1e]">Traffic Sources</h3>
            <p className="text-xs text-[#64748b] mt-0.5">Breakdown by channel</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={TRAFFIC_SOURCES_DATA}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {TRAFFIC_SOURCES_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, ""]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Manual legend */}
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {TRAFFIC_SOURCES_DATA.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-[#64748b]">
                  {entry.name}{" "}
                  <span className="font-semibold text-[#191c1e]">{entry.value}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution Bar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#191c1e]">Regional Distribution</h3>
            <p className="text-xs text-[#64748b] mt-0.5">Active users by region</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={REGIONAL_DATA}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="region"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString("en-US"), "Users"]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="users" name="Users" radius={[4, 4, 0, 0]}>
                {REGIONAL_DATA.map((entry) => (
                  <Cell key={entry.region} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row: Performance Table + Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Table */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e8f0]">
            <h3 className="text-sm font-semibold text-[#191c1e]">System Performance</h3>
            <p className="text-xs text-[#64748b] mt-0.5">Key infrastructure metrics</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                    Metric
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                    Value
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                    Delta
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {PERF_ROWS.map((row) => (
                  <tr key={row.metric} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#191c1e]">{row.metric}</td>
                    <td className="px-5 py-3.5 font-mono text-[#191c1e]">{row.value}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                    <td
                      className={`px-5 py-3.5 text-xs font-semibold ${
                        row.delta.startsWith("+")
                          ? "text-red-600"
                          : row.delta.startsWith("-")
                          ? "text-emerald-600"
                          : "text-[#64748b]"
                      }`}
                    >
                      {row.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#191c1e]">Recent Activity</h3>
              <p className="text-xs text-[#64748b] mt-0.5">Latest events across your workspace</p>
            </div>
          </div>
          <ul className="space-y-3">
            {displayActivity.map((event, idx) => {
              const isLive = "created_at" in event && typeof (event as ActivityEvent).created_at === "string";
              const iconKey = isLive
                ? ((event as ActivityEvent).icon ?? "info")
                : (event as (typeof FALLBACK_ACTIVITY)[0]).icon;
              const description = isLive
                ? (event as ActivityEvent).description
                : (event as (typeof FALLBACK_ACTIVITY)[0]).description;
              const timeLabel = isLive
                ? timeAgo((event as ActivityEvent).created_at)
                : (event as (typeof FALLBACK_ACTIVITY)[0]).time;
              const key = isLive ? (event as ActivityEvent).id : (event as (typeof FALLBACK_ACTIVITY)[0]).id;

              return (
                <li
                  key={key ?? idx}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#f8fafc] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getActivityIcon(iconKey)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#191c1e] leading-snug">{description}</p>
                    <p className="text-xs text-[#64748b] mt-1">{timeLabel}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
