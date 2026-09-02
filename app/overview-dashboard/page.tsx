"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Eye, ArrowUpRight, ArrowDownRight, RefreshCw, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Reveal } from "@/components/Reveal";
import { staggerContainer, fadeInUp } from "@/lib/motion";
type REVENUE_CHART_DATA = any;
const REVENUE_CHART_DATA: any = [];
type USER_GROWTH_DATA = any;
const USER_GROWTH_DATA: any = [];
type TRAFFIC_SOURCES_DATA = any;
const TRAFFIC_SOURCES_DATA: any = [];
type REGIONAL_DATA = any;
const REGIONAL_DATA: any = [];
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type ActivityEvent = Database["public"]["Tables"]["activity_events"]["Row"];
type MetricRow = Database["public"]["Tables"]["metrics"]["Row"];

const ICON_MAP: Record<string, React.ReactNode> = {
  check: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  alert: <AlertCircle className="w-4 h-4 text-amber-400" />,
  info: <Info className="w-4 h-4 text-sky-400" />,
  bell: <Bell className="w-4 h-4 text-violet-400" />,
  user: <Users className="w-4 h-4 text-sky-400" />,
  activity: <Activity className="w-4 h-4 text-emerald-400" />,
};

function getIcon(icon: string | null) {
  if (!icon) return <Info className="w-4 h-4 text-sky-400" />;
  return ICON_MAP[icon] ?? <Info className="w-4 h-4 text-sky-400" />;
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

const FALLBACK_KPIS = [
  { label: "Total Revenue", value: "$284,390", trend: "up" as const, trendValue: "+12.4%", icon: "dollar", positive: true },
  { label: "Active Users", value: "148,620", trend: "up" as const, trendValue: "+8.7%", icon: "users", positive: true },
  { label: "Avg. Session", value: "4m 32s", trend: "down" as const, trendValue: "-2.1%", icon: "activity", positive: false },
  { label: "Page Views", value: "2.41M", trend: "up" as const, trendValue: "+19.3%", icon: "eye", positive: true },
];

const ICON_KPI: Record<string, React.ReactNode> = {
  dollar: <DollarSign className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  activity: <Activity className="w-5 h-5" />,
  eye: <Eye className="w-5 h-5" />,
};

const PERF_ROWS = [
  { metric: "Page Load Time", value: "1.24 s", status: "Good", delta: "-0.08s" },
  { metric: "API Response (p95)", value: "182 ms", status: "Good", delta: "-14ms" },
  { metric: "Error Rate", value: "0.42%", status: "Warning", delta: "+0.12%" },
  { metric: "Uptime (30d)", value: "99.97%", status: "Good", delta: "0.00%" },
  { metric: "Conversion Rate", value: "3.81%", status: "Good", delta: "+0.34%" },
];

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";
  if (status === "Good") return <span className={`${base} bg-emerald-500/15 text-emerald-400`}><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Good</span>;
  if (status === "Warning") return <span className={`${base} bg-amber-500/15 text-amber-400`}><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Warning</span>;
  return <span className={`${base} bg-red-500/15 text-red-400`}><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Critical</span>;
}

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: "rgba(15,23,42,0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#e2e8f0",
  fontSize: "13px",
};

export default function OverviewDashboardPage() {
  const [kpis, setKpis] = useState(FALLBACK_KPIS);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLastRefreshed(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
  }, []);

  const fetchActivities = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("activity_events")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(8);
    if (!error && data && data.length > 0) {
      setActivities(data);
    }
    setActivityLoading(false);
  }, []);

  const fetchMetrics = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("metrics")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(50);
    if (data && data.length > 0) {
      const byType: Record<string, MetricRow[]> = {};
      for (const row of data) {
        if (!byType[row.metric_type]) byType[row.metric_type] = [];
        byType[row.metric_type].push(row);
      }
      const latest = (type: string) => byType[type]?.[0]?.value ?? null;
      const revenueVal = latest("revenue");
      const usersVal = latest("active_users");
      const sessionVal = latest("avg_session_seconds");
      const pageviewsVal = latest("page_views");
      if (revenueVal !== null || usersVal !== null) {
        setKpis([
          {
            label: "Total Revenue",
            value: revenueVal !== null ? `$${(revenueVal / 1000).toFixed(1)}K` : "$284,390",
            trend: "up",
            trendValue: "+12.4%",
            icon: "dollar",
            positive: true,
          },
          {
            label: "Active Users",
            value: usersVal !== null ? usersVal.toLocaleString("en-US") : "148,620",
            trend: "up",
            trendValue: "+8.7%",
            icon: "users",
            positive: true,
          },
          {
            label: "Avg. Session",
            value: sessionVal !== null ? `${Math.floor(sessionVal / 60)}m ${Math.round(sessionVal % 60)}s` : "4m 32s",
            trend: "down",
            trendValue: "-2.1%",
            icon: "activity",
            positive: false,
          },
          {
            label: "Page Views",
            value: pageviewsVal !== null ? `${(pageviewsVal / 1000000).toFixed(2)}M` : "2.41M",
            trend: "up",
            trendValue: "+19.3%",
            icon: "eye",
            positive: true,
          },
        ]);
      }
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchMetrics();
  }, [fetchActivities, fetchMetrics]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("activity_events_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_events" },
        () => {
          fetchActivities();
          if (mounted) {
            setLastRefreshed(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities, mounted]);

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Overview
            </h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Your business at a glance. All metrics are live.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                Updated {lastRefreshed}
              </span>
            )}
            <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              <Activity className="w-4 h-4" />
              Live Mode
            </button>
          </div>
        </div>
      </Reveal>

      {/* KPI Cards */}
      <Reveal>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              variants={fadeInUp}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-5 shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_-8px_rgba(0,0,0,0.3)] flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  {kpi.label}
                </span>
                <span className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                  {ICON_KPI[kpi.icon]}
                </span>
              </div>
              <div className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                {kpi.value}
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${kpi.positive ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.trend === "up"
                  ? <ArrowUpRight className="w-3.5 h-3.5" />
                  : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpi.trendValue}
                <span className="text-[hsl(var(--muted-foreground))] font-normal ml-1">vs last month</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Reveal>

      {/* Revenue + Traffic Sources */}
      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Area Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-5 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Revenue vs Expenses</h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Last 6 months</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block" />Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />Expenses</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={REVENUE_CHART_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString("en-US")}`, ""]} />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="expenses" stroke="#64748b" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources Pie */}
          <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-5 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.25)]">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Traffic Sources</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Current period</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={TRAFFIC_SOURCES_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {TRAFFIC_SOURCES_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              {TRAFFIC_SOURCES_DATA.map((src) => (
                <div key={src.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: src.color }} />
                    {src.name}
                  </span>
                  <span className="font-semibold text-[hsl(var(--foreground))]">{src.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* User Growth + Regional */}
      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* User Growth Bar Chart */}
          <div className="lg:col-span-3 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-5 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">User Growth</h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">New vs returning users</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block" />New</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-700 inline-block" />Returning</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={USER_GROWTH_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString("en-US"), ""]} />
                <Bar dataKey="newUsers" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returningUsers" fill="#1e40af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Breakdown */}
          <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-5 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.25)]">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Regional Breakdown</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Users by region</p>
            </div>
            <div className="space-y-4">
              {REGIONAL_DATA.map((r) => {
                const total = REGIONAL_DATA.reduce((s, x) => s + x.users, 0);
                const pct = Math.round((r.users / total) * 100);
                return (
                  <div key={r.region}>
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span className="font-medium text-[hsl(var(--foreground))]">{r.region}</span>
                      <span className="text-[hsl(var(--muted-foreground))] text-xs">{r.users.toLocaleString("en-US")} users</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: r.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      />
                    </div>
                    <div className="text-right text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Performance Table + Activity Feed */}
      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Performance Table */}
          <div className="lg:col-span-3 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.25)] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8">
              <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Performance Metrics</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">System health indicators</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-5 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Metric</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Value</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {PERF_ROWS.map((row) => (
                    <tr key={row.metric} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-[hsl(var(--foreground))]">{row.metric}</td>
                      <td className="px-5 py-3.5 font-mono text-[hsl(var(--foreground))]">{row.value}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={row.status} /></td>
                      <td className={`px-5 py-3.5 text-xs font-medium ${row.delta.startsWith("+") && row.metric !== "Conversion Rate" ? "text-amber-400" : "text-emerald-400"}`}>
                        {row.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-5 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Recent Activity</h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Live feed</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live
              </span>
            </div>

            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-white/8 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5 pt-1">
                      <div className="h-3 bg-white/8 rounded w-3/4" />
                      <div className="h-2.5 bg-white/5 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Activity className="w-8 h-8 text-[hsl(var(--muted-foreground))] mb-2 opacity-40" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {activities.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getIcon(event.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[hsl(var(--foreground))] leading-snug">{event.description}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{timeAgo(event.occurred_at)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Quick Stats Row */}
      <Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Reports Generated", value: "1,284", icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-400" },
            { label: "Team Members", value: "24", icon: <Users className="w-4 h-4" />, color: "text-sky-400" },
            { label: "Alerts Triggered", value: "7", icon: <Bell className="w-4 h-4" />, color: "text-amber-400" },
            { label: "Integrations Active", value: "12", icon: <Activity className="w-4 h-4" />, color: "text-violet-400" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.07}>
              <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-4 flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.15),0_4px_12px_-4px_rgba(0,0,0,0.2)]">
                <div className={`w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-xl font-bold text-[hsl(var(--foreground))]">{stat.value}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </main>
  );
}