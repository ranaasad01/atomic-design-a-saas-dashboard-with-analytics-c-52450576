"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, Share2, Search, ChevronDown, Eye, Download, Edit, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, Loader, Filter } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type Report = Database["public"]["Tables"]["reports"]["Row"];
type ScheduledReport = Database["public"]["Tables"]["scheduled_reports"]["Row"];

const KPI_CARDS = [
  {
    label: "Total Reports",
    value: "142",
    sub: "+12 this month",
    positive: true,
    icon: FileText,
    color: "var(--accent)",
  },
  {
    label: "Scheduled",
    value: "24",
    sub: "Next run in 2 hrs",
    positive: true,
    icon: Calendar,
    color: "#10b981",
  },
  {
    label: "Shared Reports",
    value: "89",
    sub: "Across 5 teams",
    positive: true,
    icon: Share2,
    color: "#f59e0b",
  },
];

const REPORT_TYPES = ["All Types", "Revenue", "User Growth", "Traffic", "Performance", "Retention"];
const REPORT_STATUSES = ["All Statuses", "Completed", "Pending", "Failed"];
const PAGE_SIZE = 5;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; cls: string }> = {
    completed: {
      icon: <CheckCircle size={12} />,
      cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    pending: {
      icon: <Loader size={12} className="animate-spin" />,
      cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    failed: {
      icon: <AlertCircle size={12} />,
      cls: "bg-red-500/10 text-red-400 border-red-500/20",
    },
  };
  const key = status.toLowerCase();
  const cfg = map[key] ?? map["pending"];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}
    >
      {cfg.icon}
      {status}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatScheduleLabel(label: string | null, nextRun: string | null) {
  const l = label ?? "Custom";
  const n = nextRun
    ? new Date(nextRun).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";
  return { label: l, next: n };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingScheduled, setLoadingScheduled] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [page, setPage] = useState(1);

  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function fetchReports() {
      setLoadingReports(true);
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setReports(data);
      setLoadingReports(false);
    }

    async function fetchScheduled() {
      setLoadingScheduled(true);
      const { data, error } = await supabase
        .from("scheduled_reports")
        .select("*")
        .order("next_run_at", { ascending: true })
        .limit(3);
      if (!error && data) setScheduled(data);
      setLoadingScheduled(false);
    }

    fetchReports();
    fetchScheduled();
  }, []);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All Types" || r.type === typeFilter;
      const matchStatus =
        statusFilter === "All Statuses" ||
        r.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchType && matchStatus;
    });
  }, [reports, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalEntries = filtered.length;
  const startEntry = totalEntries === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(page * PAGE_SIZE, totalEntries);

  function handlePageChange(p: number) {
    if (p >= 1 && p <= totalPages) setPage(p);
  }

  const pageNumbers = Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10 md:px-8 lg:px-12">
      {/* Page Header */}
      <Reveal>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Reports
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage, schedule, and share your analytics reports across teams.
          </p>
        </div>
      </Reveal>

      {/* KPI Cards */}
      <Reveal>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                variants={scaleIn}
                className="relative overflow-hidden rounded-2xl border border-white/5 bg-[hsl(var(--card))] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.24)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                      {card.label}
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                      {card.value}
                    </p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{card.sub}</p>
                  </div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${card.color}22` }}
                  >
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-10 blur-2xl"
                  style={{ background: card.color }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </Reveal>

      {/* Filter Bar */}
      <Reveal>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
            />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-white/8 bg-[hsl(var(--card))] py-2.5 pl-9 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all"
            />
          </div>

          {/* Type Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setTypeOpen((o) => !o); setStatusOpen(false); }}
              className="flex items-center gap-2 rounded-xl border border-white/8 bg-[hsl(var(--card))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] hover:border-[var(--accent)]/40 transition-all"
            >
              <Filter size={14} className="text-[hsl(var(--muted-foreground))]" />
              {typeFilter}
              <ChevronDown size={14} className="text-[hsl(var(--muted-foreground))]" />
            </button>
            {typeOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-white/8 bg-[hsl(var(--card))] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.32)]">
                {REPORT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTypeFilter(t); setTypeOpen(false); setPage(1); }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/5 ${typeFilter === t ? "text-[var(--accent)]" : "text-[hsl(var(--foreground))]"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setStatusOpen((o) => !o); setTypeOpen(false); }}
              className="flex items-center gap-2 rounded-xl border border-white/8 bg-[hsl(var(--card))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] hover:border-[var(--accent)]/40 transition-all"
            >
              {statusFilter}
              <ChevronDown size={14} className="text-[hsl(var(--muted-foreground))]" />
            </button>
            {statusOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-xl border border-white/8 bg-[hsl(var(--card))] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.32)]">
                {REPORT_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setStatusOpen(false); setPage(1); }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/5 ${statusFilter === s ? "text-[var(--accent)]" : "text-[hsl(var(--foreground))]"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Button */}
          <button className="flex items-center gap-2 rounded-xl border border-white/8 bg-[hsl(var(--card))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] hover:border-[var(--accent)]/40 transition-all">
            <Calendar size={14} className="text-[hsl(var(--muted-foreground))]" />
            Date Range
          </button>
        </div>
      </Reveal>

      {/* Main Content: Table + Sidebar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Recent Reports Table */}
        <Reveal className="flex-1 min-w-0">
          <div className="rounded-2xl border border-white/5 bg-[hsl(var(--card))] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.24)] overflow-hidden">
            <div className="border-b border-white/5 px-6 py-4">
              <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
                Recent Reports
              </h2>
            </div>

            {loadingReports ? (
              <div className="flex items-center justify-center py-16">
                <Loader size={24} className="animate-spin text-[var(--accent)]" />
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
                <FileText size={36} className="mb-3 opacity-30" />
                <p className="text-sm">No reports match your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                      <th className="px-6 py-3 text-left font-medium">Report Name</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Last Run</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((report, i) => (
                      <motion.tr
                        key={report.id}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                              <FileText size={14} className="text-[var(--accent)]" />
                            </div>
                            <span className="font-medium text-[hsl(var(--foreground))] truncate max-w-[180px]">
                              {report.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[hsl(var(--muted-foreground))]">
                          {report.type}
                        </td>
                        <td className="px-4 py-4 text-[hsl(var(--muted-foreground))]">
                          {formatDate(report.last_run_at)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={report.status} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-white/8 hover:text-[hsl(var(--foreground))] transition-colors">
                              <Eye size={15} />
                            </button>
                            <button className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-white/8 hover:text-[hsl(var(--foreground))] transition-colors">
                              <Download size={15} />
                            </button>
                            <button className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-white/8 hover:text-[hsl(var(--foreground))] transition-colors">
                              <Edit size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loadingReports && totalEntries > 0 && (
              <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {startEntry} to {endEntry} of {totalEntries} entries
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 text-[hsl(var(--muted-foreground))] hover:bg-white/5 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                        page === p
                          ? "bg-[var(--accent)] text-black"
                          : "border border-white/8 text-[hsl(var(--muted-foreground))] hover:bg-white/5"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {totalPages > 3 && (
                    <span className="px-1 text-xs text-[hsl(var(--muted-foreground))]">…</span>
                  )}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 text-[hsl(var(--muted-foreground))] hover:bg-white/5 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Scheduled Reports Sidebar */}
        <Reveal className="w-full lg:w-80 flex-shrink-0">
          <div className="rounded-2xl border border-white/5 bg-[hsl(var(--card))] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
                Scheduled Reports
              </h2>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors">
                <Plus size={14} />
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {loadingScheduled ? (
                <div className="flex items-center justify-center py-10">
                  <Loader size={20} className="animate-spin text-[var(--accent)]" />
                </div>
              ) : scheduled.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[hsl(var(--muted-foreground))]">
                  <Calendar size={28} className="mb-2 opacity-30" />
                  <p className="text-xs">No scheduled reports.</p>
                </div>
              ) : (
                scheduled.map((job) => {
                  const { label, next } = formatScheduleLabel(job.schedule_label, job.next_run_at);
                  return (
                    <div key={job.id} className="flex items-start gap-3 px-5 py-4 hover:bg-white/3 transition-colors">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#10b981]/10">
                        <Clock size={14} className="text-[#10b981]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                          {label}
                        </p>
                        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                          {job.schedule_cron}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${job.is_active ? "bg-emerald-400" : "bg-slate-500"}`}
                          />
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            {job.is_active ? "Active" : "Paused"} · Next: {next}
                          </span>
                        </div>
                      </div>
                      <button className="mt-1 flex-shrink-0 rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-white/8 hover:text-[hsl(var(--foreground))] transition-colors">
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/5 px-5 py-4">
              <button className="w-full rounded-xl border border-white/8 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-white/5 hover:border-[var(--accent)]/30 transition-all">
                View All Schedules
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <Reveal delay={0.1}>
            <div className="mt-4 rounded-2xl border border-white/5 bg-[hsl(var(--card))] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.24)]">
              <h3 className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">
                Report Health
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Completed", count: 118, pct: 83, color: "#10b981" },
                  { label: "Pending", count: 16, pct: 11, color: "#f59e0b" },
                  { label: "Failed", count: 8, pct: 6, color: "#ef4444" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-[hsl(var(--muted-foreground))]">{item.label}</span>
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Reveal>
      </div>
    </main>
  );
}