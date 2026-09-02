"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, Share2, Search, ChevronDown, Eye, Download, Edit, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, Loader, Filter } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import DashboardShell from "@/components/DashboardShell";

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
      cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    pending: {
      icon: <Loader size={12} className="animate-spin" />,
      cls: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    failed: {
      icon: <AlertCircle size={12} />,
      cls: "bg-red-500/10 text-red-600 border-red-500/20",
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
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getScheduledName(s: ScheduledReport): string {
  return FALLBACK_SCHEDULED_NAMES[s.id] ?? "Scheduled Report";
}

function formatScheduleLabel(label: string | null, nextRun: string | null) {
  const l = label ?? "Custom";
  const n = nextRun
    ? new Date(nextRun).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "\u2014";
  return { label: l, next: n };
}

// Fallback data when Supabase returns nothing
const FALLBACK_REPORTS: Report[] = [
  { id: "r1", name: "Q3 Revenue Summary", type: "Revenue", status: "Completed", created_at: "2024-10-24T10:00:00Z", last_run_at: "2024-10-24T10:00:00Z", user_id: null } as unknown as Report,
  { id: "r2", name: "User Growth October", type: "User Growth", status: "Completed", created_at: "2024-10-23T09:00:00Z", last_run_at: "2024-10-23T09:00:00Z", user_id: null } as unknown as Report,
  { id: "r3", name: "Traffic Sources Weekly", type: "Traffic", status: "Pending", created_at: "2024-10-22T08:00:00Z", last_run_at: null, user_id: null } as unknown as Report,
  { id: "r4", name: "Performance Benchmark", type: "Performance", status: "Completed", created_at: "2024-10-21T07:00:00Z", last_run_at: "2024-10-21T07:00:00Z", user_id: null } as unknown as Report,
  { id: "r5", name: "Retention Analysis", type: "Retention", status: "Failed", created_at: "2024-10-20T06:00:00Z", last_run_at: "2024-10-20T06:00:00Z", user_id: null } as unknown as Report,
  { id: "r6", name: "Monthly Revenue Report", type: "Revenue", status: "Completed", created_at: "2024-10-19T05:00:00Z", last_run_at: "2024-10-19T05:00:00Z", user_id: null } as unknown as Report,
  { id: "r7", name: "Social Traffic Breakdown", type: "Traffic", status: "Completed", created_at: "2024-10-18T04:00:00Z", last_run_at: "2024-10-18T04:00:00Z", user_id: null } as unknown as Report,
];

const FALLBACK_SCHEDULED: ScheduledReport[] = [
  { id: "s1", schedule_label: "Weekly", next_run_at: "2024-10-28T08:00:00Z", is_active: true, report_id: null, owner_id: "", schedule_cron: "", created_at: new Date().toISOString() } as unknown as ScheduledReport,
  { id: "s2", schedule_label: "Monthly", next_run_at: "2024-11-01T08:00:00Z", is_active: true, report_id: null, owner_id: "", schedule_cron: "", created_at: new Date().toISOString() } as unknown as ScheduledReport,
  { id: "s3", schedule_label: "Daily", next_run_at: "2024-10-25T08:00:00Z", is_active: false, report_id: null, owner_id: "", schedule_cron: "", created_at: new Date().toISOString() } as unknown as ScheduledReport,
];

const FALLBACK_SCHEDULED_NAMES: Record<string, string> = {
  s1: "Weekly Traffic Digest",
  s2: "Monthly Revenue Summary",
  s3: "Daily Active Users",
};

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
      if (!error && data && data.length > 0) {
        setReports(data);
      } else {
        setReports(FALLBACK_REPORTS);
      }
      setLoadingReports(false);
    }

    async function fetchScheduled() {
      setLoadingScheduled(true);
      const { data, error } = await supabase
        .from("scheduled_reports")
        .select("*")
        .order("next_run_at", { ascending: true })
        .limit(3);
      if (!error && data && data.length > 0) {
        setScheduled(data as unknown as ScheduledReport[]);
      } else {
        setScheduled(FALLBACK_SCHEDULED);
      }
      setLoadingScheduled(false);
    }

    fetchReports();
    fetchScheduled();
  }, []);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        !search ||
        (r.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.type ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesType =
        typeFilter === "All Types" || r.type === typeFilter;
      const matchesStatus =
        statusFilter === "All Statuses" ||
        (r.status ?? "").toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  const headerActions = (
    <button className="inline-flex items-center gap-2 rounded-lg bg-[#0ea5e9] px-4 py-2 text-sm font-medium text-white hover:bg-[#0284c7] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]">
      <Plus className="h-4 w-4" aria-hidden="true" />
      New Report
    </button>
  );

  return (
    <DashboardShell
      title="Reports"
      subtitle="Manage, schedule, and share your analytics reports"
      actions={headerActions}
    >
      {/* KPI Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      >
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={fadeInUp}
              className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)] flex items-center gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${card.color}18` }}
              >
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-0.5">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-[#191c1e] leading-none">
                  {card.value}
                </p>
                <p className="text-xs text-[#64748b] mt-1">{card.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Reports Table */}
      <Reveal>
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)] mb-6">
          {/* Table Header / Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-[#e2e8f0]">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[#191c1e]">All Reports</h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                {filtered.length} report{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748b]" />
                <input
                  type="text"
                  placeholder="Search reports…"
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-8 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f7f9fb] text-[#191c1e] placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent w-44"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <button
                  onClick={() => { setTypeOpen((o) => !o); setStatusOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#454651] hover:bg-[#f7f9fb] transition-colors"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {typeFilter}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {typeOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setTypeOpen(false)} />
                    <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-[#e2e8f0] bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] overflow-hidden">
                      {REPORT_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTypeFilter(t); setTypeOpen(false); setPage(1); }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            typeFilter === t
                              ? "bg-[#0ea5e9]/10 text-[#0ea5e9] font-medium"
                              : "text-[#454651] hover:bg-[#f7f9fb]"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => { setStatusOpen((o) => !o); setTypeOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#454651] hover:bg-[#f7f9fb] transition-colors"
                >
                  {statusFilter}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {statusOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                    <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-[#e2e8f0] bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] overflow-hidden">
                      {REPORT_STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setStatusFilter(s); setStatusOpen(false); setPage(1); }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            statusFilter === s
                              ? "bg-[#0ea5e9]/10 text-[#0ea5e9] font-medium"
                              : "text-[#454651] hover:bg-[#f7f9fb]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f7f9fb]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Report Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Last Run</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {loadingReports ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-[#e2e8f0] rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-[#64748b]">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No reports match your filters.</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((report) => (
                    <tr key={report.id} className="hover:bg-[#f7f9fb] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-[#0ea5e9]" />
                          </div>
                          <span className="font-medium text-[#191c1e]">{report.name ?? "Untitled"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-medium text-[#454651]">
                          {report.type ?? "General"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#64748b]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate((report as Record<string, unknown>)["last_run_at"] as string | null ?? report.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={report.status ?? "Pending"} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors text-[#64748b] hover:text-[#191c1e]"
                            aria-label="View report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors text-[#64748b] hover:text-[#191c1e]"
                            aria-label="Download report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors text-[#64748b] hover:text-[#191c1e]"
                            aria-label="Edit report"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors text-[#64748b] hover:text-[#191c1e]"
                            aria-label="More options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loadingReports && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
              <p className="text-xs text-[#64748b]">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f7f9fb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      page === i + 1
                        ? "bg-[#0ea5e9] text-white"
                        : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f7f9fb]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f7f9fb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {/* Scheduled Reports */}
      <Reveal>
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
            <div>
              <h2 className="text-base font-semibold text-[#191c1e]">Scheduled Reports</h2>
              <p className="text-xs text-[#64748b] mt-0.5">Automated reports running on a recurring schedule</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0ea5e9] border border-[#0ea5e9]/30 rounded-lg hover:bg-[#0ea5e9]/5 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Schedule
            </button>
          </div>

          <div className="divide-y divide-[#e2e8f0]">
            {loadingScheduled ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#e2e8f0]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#e2e8f0] rounded w-1/3" />
                    <div className="h-3 bg-[#e2e8f0] rounded w-1/4" />
                  </div>
                  <div className="h-5 w-16 bg-[#e2e8f0] rounded-full" />
                </div>
              ))
            ) : scheduled.length === 0 ? (
              <div className="px-5 py-10 text-center text-[#64748b]">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No scheduled reports yet.</p>
              </div>
            ) : (
              scheduled.map((sr) => {
                const { label, next } = formatScheduleLabel(
                  (sr as Record<string, unknown>)["schedule_label"] as string | null,
                  (sr as Record<string, unknown>)["next_run_at"] as string | null
                );
                const isActive = (sr as Record<string, unknown>)["is_active"] as boolean;
                return (
                  <div key={sr.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#f7f9fb] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-[#10b981]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#191c1e] truncate">{sr.name ?? "Unnamed Schedule"}</p>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {label} &middot; Next run: {next}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-[#e2e8f0] text-[#64748b]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-[#64748b]"
                          }`}
                        />
                        {isActive ? "Active" : "Paused"}
                      </span>
                      <button
                        className="p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors text-[#64748b] hover:text-[#191c1e]"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Reveal>
    </DashboardShell>
  );
}
