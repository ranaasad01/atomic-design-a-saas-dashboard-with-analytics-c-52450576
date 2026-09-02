"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, MoreHorizontal, Search, Shield, Eye, Edit2, Trash2, Mail, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"];

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  Admin: {
    label: "Admin",
    icon: <Shield className="w-3 h-3" />,
    color: "text-[var(--brand-indigo)]",
    bg: "bg-[var(--brand-indigo)]/10",
  },
  Editor: {
    label: "Editor",
    icon: <Edit2 className="w-3 h-3" />,
    color: "text-[var(--brand-teal)]",
    bg: "bg-[var(--brand-teal)]/10",
  },
  Viewer: {
    label: "Guest Viewer",
    icon: <Eye className="w-3 h-3" />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  Member: {
    label: "Member",
    icon: <Users className="w-3 h-3" />,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
};

const AVATAR_COLORS = [
  "#0ea5e9", "#2d3e9e", "#1a2b6d", "#10b981",
  "#f59e0b", "#7c3aed", "#64748b", "#06b6d4",
];

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getRoleConfig(role: string) {
  return ROLE_CONFIG[role] ?? {
    label: role,
    icon: <Users className="w-3 h-3" />,
    color: "text-slate-600",
    bg: "bg-slate-100",
  };
}

function AvatarCircle({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      {isActive ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      {status}
    </span>
  );
}

function ActionMenu({
  memberId,
  open,
  onToggle,
  onClose,
}: {
  memberId: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-indigo)]"
        aria-label="Member actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-slate-200 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Send invite
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              Edit role
            </button>
            <div className="border-t border-slate-100" />
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Remove member
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.2)] p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Invite Team Member</h2>
            <p className="text-sm text-slate-500 mt-0.5">Send an invitation to join your workspace.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
          >
            ✕
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-slate-700">Invitation sent successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)] focus:border-transparent transition-all bg-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Guest Viewer</option>
                  <option value="Member">Member</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--brand-indigo)] text-white text-sm font-medium hover:bg-[var(--brand-indigo-dark)] transition-colors disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) {
        setMembers(data);
      }
      setLoading(false);
    }
    fetchMembers();
  }, []);

  const roles = ["All", ...Array.from(new Set(members.map((m) => m.role)))];

  const filtered = members.filter((m) => {
    const matchSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const activeCount = members.filter((m) => m.status === "Active").length;
  const pendingCount = members.filter((m) => m.status === "Pending").length;
  const adminCount = members.filter((m) => m.role === "Admin").length;

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Page Header */}
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Management</h1>
                <p className="text-slate-500 mt-1 text-sm">
                  Manage workspace members, roles, and access permissions.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInvite(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-indigo)] text-white text-sm font-medium shadow-[0_2px_8px_rgba(45,62,158,0.25)] hover:bg-[var(--brand-indigo-dark)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-indigo)] focus-visible:ring-offset-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite User
              </motion.button>
            </div>
          </Reveal>

          {/* Stat Cards */}
          <Reveal>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[
                { label: "Total Members", value: members.length, icon: <Users className="w-5 h-5" />, color: "text-[var(--brand-indigo)]", bg: "bg-[var(--brand-indigo)]/10" },
                { label: "Active", value: activeCount, icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Pending", value: pendingCount, icon: <Clock className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Admins", value: adminCount, icon: <Shield className="w-5 h-5" />, color: "text-[var(--brand-teal)]", bg: "bg-[var(--brand-teal)]/10" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.08)]"
                >
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{loading ? "—" : stat.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>

          {/* Table Section */}
          <Reveal>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)] overflow-hidden">

              {/* Table Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-slate-100">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)] focus:border-transparent transition-all bg-slate-50"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        roleFilter === r
                          ? "bg-[var(--brand-indigo)] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {r === "Viewer" ? "Guest Viewer" : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/60">
                    <tr>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Member</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                      <th className="px-5 py-3.5 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                              <div className="space-y-1.5">
                                <div className="h-3.5 w-28 bg-slate-200 rounded animate-pulse" />
                                <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" /></td>
                          <td className="px-5 py-4"><div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" /></td>
                          <td className="px-5 py-4 hidden md:table-cell"><div className="h-3.5 w-24 bg-slate-100 rounded animate-pulse" /></td>
                          <td className="px-5 py-4" />
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                              <Users className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">No members found</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {search ? "Try adjusting your search or filters." : "Invite your first team member to get started."}
                              </p>
                            </div>
                            {!search && (
                              <button
                                onClick={() => setShowInvite(true)}
                                className="mt-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--brand-indigo)] text-white text-xs font-medium hover:bg-[var(--brand-indigo-dark)] transition-colors"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                Invite User
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((member, idx) => {
                        const roleConf = getRoleConfig(member.role);
                        const initials = member.avatar_initials ?? member.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                        const avatarColor = getAvatarColor(idx);
                        const joinedDate = new Date(member.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                        return (
                          <motion.tr
                            key={member.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.04 }}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <AvatarCircle initials={initials} color={avatarColor} />
                                <div>
                                  <div className="font-medium text-slate-900 text-sm">{member.full_name}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleConf.bg} ${roleConf.color}`}>
                                {roleConf.icon}
                                {roleConf.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <StatusBadge status={member.status} />
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell text-xs text-slate-400">
                              {joinedDate}
                            </td>
                            <td className="px-5 py-4">
                              <ActionMenu
                                memberId={member.id}
                                open={openMenuId === member.id}
                                onToggle={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                                onClose={() => setOpenMenuId(null)}
                              />
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              {!loading && filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Showing <span className="font-medium text-slate-600">{filtered.length}</span> of{" "}
                    <span className="font-medium text-slate-600">{members.length}</span> members
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-400">{activeCount} active now</span>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* Role Legend */}
          <Reveal>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Role Permissions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    role: "Admin",
                    desc: "Full workspace access. Can manage members, billing, and all settings.",
                    icon: <Shield className="w-4 h-4" />,
                    color: "text-[var(--brand-indigo)]",
                    bg: "bg-[var(--brand-indigo)]/8",
                    border: "border-[var(--brand-indigo)]/20",
                  },
                  {
                    role: "Editor",
                    desc: "Can create and edit reports, dashboards, and data sources.",
                    icon: <Edit2 className="w-4 h-4" />,
                    color: "text-[var(--brand-teal)]",
                    bg: "bg-[var(--brand-teal)]/8",
                    border: "border-[var(--brand-teal)]/20",
                  },
                  {
                    role: "Member",
                    desc: "Can view and comment on shared reports and dashboards.",
                    icon: <Users className="w-4 h-4" />,
                    color: "text-slate-600",
                    bg: "bg-slate-50",
                    border: "border-slate-200",
                  },
                  {
                    role: "Guest Viewer",
                    desc: "Read-only access to explicitly shared content. No editing rights.",
                    icon: <Eye className="w-4 h-4" />,
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                    border: "border-amber-200",
                  },
                ].map((item) => (
                  <div
                    key={item.role}
                    className={`rounded-xl border ${item.border} ${item.bg} p-4`}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${item.color} font-semibold text-sm`}>
                      {item.icon}
                      {item.role}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </>
  );
}