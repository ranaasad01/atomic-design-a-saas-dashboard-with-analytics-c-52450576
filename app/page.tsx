"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUp, ArrowDown, Activity, Users, Star, TrendingUp, BarChart2, Shield, Zap, Globe, CheckCircle, Clock, FileText, Bell } from 'lucide-react';
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
} from "recharts";
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/motion";
import { APP_NAME, APP_TAGLINE, KpiCard } from "@/lib/data";
type REVENUE_CHART_DATA = any;
const REVENUE_CHART_DATA: any = [];
type TRAFFIC_SOURCES_DATA = any;
const TRAFFIC_SOURCES_DATA: any = [];
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type ActivityEvent = Database["public"]["Tables"]["activity_events"]["Row"];

const KPI_CARDS: KpiCard[] = [
  {
    label: "Total Revenue",
    value: "$284,390",
    trend: "up",
    trendValue: "+12.4%",
    trendLabel: "vs last month",
    positive: true,
  },
  {
    label: "Active Users",
    value: "148,642",
    trend: "up",
    trendValue: "+8.1%",
    trendLabel: "vs last month",
    positive: true,
  },
  {
    label: "Avg. Session",
    value: "4m 32s",
    trend: "down",
    trendValue: "-2.3%",
    trendLabel: "vs last month",
    positive: false,
  },
  {
    label: "Churn Rate",
    value: "2.8%",
    trend: "down",
    trendValue: "-0.4%",
    trendLabel: "vs last month",
    positive: true,
  },
];

const FEATURES = [
  {
    icon: BarChart2,
    title: "Real-Time Analytics",
    description:
      "Monitor every metric as it happens. Live dashboards update instantly so your team always has the freshest picture of performance.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 Type II certified with row-level security, SSO, and audit logs. Your data stays yours, always.",
  },
  {
    icon: Zap,
    title: "Instant Insights",
    description:
      "AI-powered anomaly detection surfaces the signals that matter before they become problems.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description:
      "Track users across 190+ countries with regional breakdowns, timezone-aware reporting, and localized data residency.",
  },
  {
    icon: FileText,
    title: "Automated Reports",
    description:
      "Schedule PDF and CSV exports on any cadence. Share with stakeholders without lifting a finger.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Role-based access, shared dashboards, and comment threads keep every team member aligned.",
  },
];

const TESTIMONIALS = [
  {
    id: "t1",
    name: "Sarah Chen",
    role: "VP of Growth, Meridian SaaS",
    quote:
      "Analytix Pro cut our reporting time by 70%. We went from weekly spreadsheets to live dashboards our whole company trusts.",
    rating: 5,
    initials: "SC",
    color: "#0ea5e9",
  },
  {
    id: "t2",
    name: "Rafael Moreno",
    role: "CTO, Stackline Commerce",
    quote:
      "The anomaly detection alone has saved us from three major incidents this quarter. It pays for itself every month.",
    rating: 5,
    initials: "RM",
    color: "#2d3e9e",
  },
  {
    id: "t3",
    name: "Amara Osei",
    role: "Head of Data, Luminary Health",
    quote:
      "Finally an analytics platform that respects enterprise security requirements without sacrificing usability.",
    rating: 5,
    initials: "AO",
    color: "#10b981",
  },
];

const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "Perfect for small teams getting started with analytics.",
    features: [
      "Up to 5 team members",
      "10 dashboards",
      "30-day data retention",
      "Email reports",
      "Standard support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$149",
    period: "/mo",
    description: "For scaling teams that need deeper insights and automation.",
    features: [
      "Up to 25 team members",
      "Unlimited dashboards",
      "1-year data retention",
      "Scheduled reports",
      "AI anomaly detection",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored for large organizations with advanced requirements.",
    features: [
      "Unlimited team members",
      "Custom data retention",
      "SSO & SAML",
      "Dedicated CSM",
      "SLA guarantee",
      "On-premise option",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

function ActivityIconMap({ icon }: { icon: string | null }) {
  const map: Record<string, React.ReactNode> = {
    bell: <Bell className="w-4 h-4" />,
    activity: <Activity className="w-4 h-4" />,
    users: <Users className="w-4 h-4" />,
    "file-text": <FileText className="w-4 h-4" />,
    "trending-up": <TrendingUp className="w-4 h-4" />,
    clock: <Clock className="w-4 h-4" />,
  };
  return <>{map[icon ?? ""] ?? <Activity className="w-4 h-4" />}</>;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HomePage() {
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function loadActivity() {
      const { data, error } = await supabase
        .from("activity_events")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(6);
      if (!error && data) setActivityEvents(data);
      setActivityLoading(false);
    }

    loadActivity();

    const channel = supabase
      .channel("activity_events_home")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_events" },
        () => {
          loadActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* ── HERO ── */}
      <Reveal>
        <section
          id="hero"
          className="relative overflow-hidden px-6 pt-20 pb-24 md:pt-28 md:pb-32"
        >
          {/* Background glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--accent)]/8 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left copy */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-6"
              >
                <motion.div variants={fadeInUp}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                    <Zap className="h-3.5 w-3.5" />
                    {APP_TAGLINE}
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl font-extrabold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl"
                >
                  Analytics that{" "}
                  <span className="text-[var(--accent)]">drive decisions</span>,
                  not just reports.
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="max-w-lg text-lg leading-relaxed text-[hsl(var(--muted-foreground))]"
                >
                  {APP_NAME} unifies your product, revenue, and user data into
                  one live command center. Stop guessing. Start growing.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-wrap gap-3"
                >
                  <Link
                    href="/analytics"
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_6px_28px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    Explore Analytics
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/reports"
                    className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-3 text-sm font-semibold transition-all duration-300 hover:bg-[hsl(var(--muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    View Reports
                  </Link>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="flex items-center gap-6 pt-2"
                >
                  {[
                    { label: "Uptime SLA", value: "99.9%" },
                    { label: "Data points/day", value: "2.4B+" },
                    { label: "Enterprise clients", value: "1,200+" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col">
                      <span className="text-xl font-bold text-[var(--accent)]">
                        {stat.value}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right: mini dashboard preview */}
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className="relative"
              >
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_16px_48px_-12px_rgba(0,0,0,0.14)]">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Revenue Overview
                    </span>
                    <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                      Live
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart
                      data={REVENUE_CHART_DATA}
                      margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="heroRevGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--accent)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--accent)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "10px",
                          fontSize: "12px",
                        }}
                        formatter={(v: number) => [
                          `$${v.toLocaleString("en-US")}`,
                          "Revenue",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--accent)"
                        strokeWidth={2.5}
                        fill="url(#heroRevGrad)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Mini KPI row */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "MRR", value: "$66.5k", up: true },
                      { label: "Users", value: "148.6k", up: true },
                      { label: "Churn", value: "2.8%", up: false },
                    ].map((k) => (
                      <div
                        key={k.label}
                        className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3"
                      >
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {k.label}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1">
                          <span className="text-sm font-bold">{k.value}</span>
                          {k.up ? (
                            <ArrowUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-rose-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── KPI CARDS ── */}
      <Reveal>
        <section id="kpis" className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {KPI_CARDS.map((card, i) => (
                <motion.div
                  key={card.label}
                  variants={fadeInUp}
                  custom={i}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.1)]"
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    {card.label}
                  </div>
                  <div className="mt-2 text-3xl font-extrabold tracking-tight">
                    {card.value}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    {card.trend === "up" ? (
                      <ArrowUp
                        className={`h-3.5 w-3.5 ${card.positive ? "text-emerald-500" : "text-rose-500"}`}
                      />
                    ) : (
                      <ArrowDown
                        className={`h-3.5 w-3.5 ${card.positive ? "text-emerald-500" : "text-rose-500"}`}
                      />
                    )}
                    <span
                      className={`text-xs font-semibold ${card.positive ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {card.trendValue}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {card.trendLabel}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </Reveal>

      {/* ── CHARTS + ACTIVITY ── */}
      <Reveal>
        <section
          id="overview"
          className="bg-[hsl(var(--muted))]/40 px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Platform at a glance
              </h2>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                Live data from your connected workspace, updated in real time.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Revenue area chart — spans 2 cols */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.1)] lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Revenue vs Expenses</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Jan – Jun 2025
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={REVENUE_CHART_DATA}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="revGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--accent)"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--accent)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="expGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                      formatter={(v: number, name: string) => [
                        `$${v.toLocaleString("en-US")}`,
                        name === "revenue" ? "Revenue" : "Expenses",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      fill="url(#revGrad)"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#expGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Traffic sources pie */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.1)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Traffic Sources</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Share by channel
                    </p>
                  </div>
                  <Globe className="h-5 w-5 text-[var(--accent)]" />
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
                      {TRAFFIC_SOURCES_DATA.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                      formatter={(v: number) => [`${v}%`, "Share"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-3 space-y-2">
                  {TRAFFIC_SOURCES_DATA.map((s) => (
                    <li key={s.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="flex-1 text-[hsl(var(--muted-foreground))]">
                        {s.name}
                      </span>
                      <span className="font-semibold">{s.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Activity feed */}
            <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.1)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Recent Activity</h3>
                <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>

              {activityLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-10 animate-pulse rounded-xl bg-[hsl(var(--muted))]"
                    />
                  ))}
                </div>
              ) : activityEvents.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  No recent activity yet.
                </p>
              ) : (
                <ul className="divide-y divide-[hsl(var(--border))]">
                  {activityEvents.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                        <ActivityIconMap icon={ev.icon} />
                      </span>
                      <span className="flex-1 text-sm leading-snug">
                        {ev.description}
                      </span>
                      <span className="flex-shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                        {mounted ? formatRelativeTime(ev.occurred_at) : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── FEATURES ── */}
      <Reveal>
        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                Platform capabilities
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Everything your team needs to move faster.
              </h2>
              <p className="mt-4 text-[hsl(var(--muted-foreground))] leading-relaxed">
                From raw event ingestion to boardroom-ready reports, {APP_NAME}{" "}
                covers the full analytics lifecycle without the complexity.
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    variants={fadeInUp}
                    custom={i}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.16)]"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] transition-colors duration-300 group-hover:bg-[var(--accent)] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 font-semibold">{feat.title}</h3>
                    <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {feat.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </Reveal>

      {/* ── SOCIAL PROOF ── */}
      <Reveal>
        <section
          id="testimonials"
          className="bg-[hsl(var(--muted))]/40 px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                Customer stories
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Trusted by data-driven teams.
              </h2>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-6 md:grid-cols-3"
            >
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.id}
                  variants={scaleIn}
                  custom={i}
                  className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.1)]"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star
                        key={si}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: t.color }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </Reveal>

      {/* ── PRICING ── */}
      <Reveal>
        <section id="pricing" className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                Pricing
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Simple, transparent pricing.
              </h2>
              <p className="mt-4 text-[hsl(var(--muted-foreground))]">
                Start free for 14 days. No credit card required.
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-6 md:grid-cols-3"
            >
              {PRICING_PLANS.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  variants={fadeInUp}
                  custom={i}
                  className={`relative flex flex-col rounded-2xl border p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.1)] ${
                    plan.highlighted
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white">
                        Most popular
                      </span>
                    </div>
                  )}
                  <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    {plan.name}
                  </div>
                  <div className="mb-1 flex items-end gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="mb-1 text-sm text-[hsl(var(--muted-foreground))]">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
                    {plan.description}
                  </p>
                  <ul className="mb-8 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.id === "enterprise" ? "/help" : "/analytics"}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                      plan.highlighted
                        ? "bg-[var(--accent)] text-white hover:brightness-110"
                        : "border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))]"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </Reveal>

      {/* ── CTA BANNER ── */}
      <Reveal>
        <section id="cta" className="px-6 pb-24 pt-4">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-3xl bg-[var(--accent)] px-8 py-14 text-center shadow-[0_8px_48px_-12px_rgba(0,0,0,0.25)]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0"
              >
                <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  Ready to see your data clearly?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
                  Join 1,200+ enterprise teams using {APP_NAME} to make faster,
                  smarter decisions every day.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/analytics"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-[var(--accent)] shadow-md transition-all duration-300 hover:shadow-lg hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Start free trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/help"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Talk to sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}