"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Users, Zap, Heart, TrendingDown, TrendingUp, MoreVertical, SlidersHorizontal, UserPlus, Server, AlertCircle, Clock, Eye } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
type USER_GROWTH_DATA = any;
const USER_GROWTH_DATA: any = [];
type TRAFFIC_SOURCES_DATA = any;
const TRAFFIC_SOURCES_DATA: any = [];
type REGIONAL_DATA = any;
const REGIONAL_DATA: any = [];
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

// ─── Inline mock data ────────────────────────────────────────────────────────

const KPI_CARDS = [
  {
    label: "TOTAL USERS",
    value: "124,592",
    trend: "+12.5%",
    trendLabel: "vs last month",
    positive: true,
    icon: Users,
    iconBg: "#e8eaf6",
    iconColor: "#3949ab",
  },
  {
    label: "ACTIVE SESSIONS",
    value: "8,234",
    trend: "+5.2%",
    trendLabel: "vs last month",
    positive: true,
    icon: Zap,
    iconBg: "#e8eaf6",
    iconColor: "#3949ab",
  },
  {
    label: "RETENTION RATE",
    value: "78.4%",
    trend: "+1.1%",
    trendLabel: "vs last month",
    positive: true,
    icon: Heart,
    iconBg: "#e8eaf6",
    iconColor: "#3949ab",
  },
  {
    label: "CHURN RATE",
    value: "2.1%",
    trend: "-0.4%",
    trendLabel: "vs last month",
    positive: false,
    icon: TrendingDown,
    iconBg: "#fce8e8",
    iconColor: "#c62828",
  },
];

const PERF_TABLE = [
  {
    id: "1",
    date: "Oct 24, 2023",
    metric: "New Signups",
    metricIcon: UserPlus,
    value: "1,204",
    status: "Optimal",
    valueColor: "",
  },
  {
    id: "2",
    date: "Oct 23, 2023",
    metric: "Server Load",
    metricIcon: Server,
    value: "42%",
    status: "Optimal",
    valueColor: "",
  },
  {
    id: "3",
    date: "Oct 22, 2023",
    metric: "Error Rate",
    metricIcon: AlertCircle,
    value: "1.5%",
    status: "Warning",
    valueColor: "#c62828",
  },
  {
    id: "4",
    date: "Oct 21, 2023",
    metric: "Avg Session",
    metricIcon: Clock,
    value: "04:12",
    status: "Normal",
    valueColor: "",
  },
  {
    id: "5",
    date: "Oct 20, 2023",
    metric: "New Signups",
    metricIcon: UserPlus,
    value: "987",
    status: "Optimal",
    valueColor: "",
  },
  {
    id: "6",
    date: "Oct 19, 2023",
    metric: "Server Load",
    metricIcon: Server,
    value: "71%",
    status: "Warning",
    valueColor: "#c62828",
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Optimal: { bg: "#e6f4ea", text: "#1b5e20" },
    Warning: { bg: "#fff3e0", text: "#e65100" },
    Normal: { bg: "#f1f3f4", text: "#455a64" },
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

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomAreaTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-[#e0e3e5] bg-white px-3 py-2 shadow-md text-xs">
      <p className="mb-1 font-semibold text-[#191c1e]">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString("en-US")}
        </p>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9fb] p-6">
      {/* Page header */}
      <Reveal>
        <div className="mb-6">
          <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.02em] text-[#191c1e]">
            {t("analytics.heading")}
          </h1>
          <p className="mt-1 text-sm text-[#454651]">
            {t("analytics.subheading")}
          </p>
        </div>
      </Reveal>

      {/* KPI Cards */}
      <Reveal>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-lg border border-[#e0e3e5] bg-white p-5 shadow-[0_1px_2px_rgba(74,87,170,0.04),0_4px_16px_-4px_rgba(74,87,170,0.08)]"
              >
                <div className="mb-3 flex items-start justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#454651]">
                    {card.label}
                  </p>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md"
                    style={{ backgroundColor: card.iconBg }}
                  >
                    <Icon size={16} style={{ color: card.iconColor }} />
                  </span>
                </div>
                <p className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[#191c1e]">
                  {card.value}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  {card.positive ? (
                    <TrendingUp size={13} className="text-[#10b981]" />
                  ) : (
                    <TrendingDown size={13} className="text-[#ef4444]" />
                  )}
                  <span
                    className="text-xs font-medium"
                    style={{ color: card.positive ? "#10b981" : "#ef4444" }}
                  >
                    {card.trend}
                  </span>
                  <span className="text-xs text-[#767682]">{card.trendLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Charts row */}
      <Reveal>
        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* User Growth AreaChart — spans 2 cols */}
          <div className="xl:col-span-2 rounded-lg border border-[#e0e3e5] bg-white p-5 shadow-[0_1px_2px_rgba(74,87,170,0.04),0_4px_16px_-4px_rgba(74,87,170,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#191c1e]">
                {t("analytics.userGrowthTitle")}
              </h2>
              <button className="rounded p-1 text-[#767682] hover:bg-[#f2f4f6] transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>
            {mounted ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={USER_GROWTH_DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2e3a8c" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2e3a8c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradReturn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e5" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#767682" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#767682" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    name="New Users"
                    stroke="#2e3a8c"
                    strokeWidth={2}
                    fill="url(#gradNew)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="returningUsers"
                    name="Returning"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#gradReturn)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] animate-pulse rounded bg-[#f2f4f6]" />
            )}
          </div>

          {/* Right column: Traffic Sources + Regional Distribution */}
          <div className="flex flex-col gap-4">
            {/* Traffic Sources PieChart */}
            <div className="rounded-lg border border-[#e0e3e5] bg-white p-5 shadow-[0_1px_2px_rgba(74,87,170,0.04),0_4px_16px_-4px_rgba(74,87,170,0.08)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#454651]">
                {t("analytics.trafficSourcesTitle")}
              </p>
              {mounted ? (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={TRAFFIC_SOURCES_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {TRAFFIC_SOURCES_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span style={{ fontSize: 11, color: "#454651" }}>{value}</span>
                      )}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, ""]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 6,
                        border: "1px solid #e0e3e5",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[160px] animate-pulse rounded bg-[#f2f4f6]" />
              )}
            </div>

            {/* Regional Distribution BarChart */}
            <div className="rounded-lg border border-[#e0e3e5] bg-white p-5 shadow-[0_1px_2px_rgba(74,87,170,0.04),0_4px_16px_-4px_rgba(74,87,170,0.08)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#454651]">
                {t("analytics.regionalTitle")}
              </p>
              {mounted ? (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={REGIONAL_DATA} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e5" vertical={false} />
                    <XAxis
                      dataKey="region"
                      tick={{ fontSize: 11, fill: "#767682" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#767682" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => [value.toLocaleString("en-US"), "Users"]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 6,
                        border: "1px solid #e0e3e5",
                      }}
                    />
                    <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                      {REGIONAL_DATA.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[140px] animate-pulse rounded bg-[#f2f4f6]" />
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Recent Performance Data table */}
      <Reveal>
        <div className="rounded-lg border border-[#e0e3e5] bg-white shadow-[0_1px_2px_rgba(74,87,170,0.04),0_4px_16px_-4px_rgba(74,87,170,0.08)]">
          <div className="flex items-center justify-between border-b border-[#e0e3e5] px-5 py-4">
            <h2 className="text-base font-semibold text-[#191c1e]">
              {t("analytics.perfTableTitle")}
            </h2>
            <button className="rounded p-1 text-[#767682] hover:bg-[#f2f4f6] transition-colors">
              <SlidersHorizontal size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e0e3e5]">
                  {["DATE", "METRIC TYPE", "VALUE", "STATUS", "ACTION"].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#454651]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e3e5]">
                {PERF_TABLE.map((row) => {
                  const MetricIcon = row.metricIcon;
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-[#f7f9fb] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[13px] text-[#454651]">
                        {row.date}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 text-[13px] text-[#191c1e]">
                          <MetricIcon size={14} className="text-[#767682]" />
                          {row.metric}
                        </div>
                      </td>
                      <td
                        className="px-5 py-3.5 text-[13px] font-medium"
                        style={{ color: row.valueColor || "#191c1e" }}
                      >
                        {row.value}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="flex items-center gap-1 text-[13px] font-medium text-[#2e3a8c] hover:text-[#142175] transition-colors">
                          <Eye size={13} />
                          {t("analytics.viewAction")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}