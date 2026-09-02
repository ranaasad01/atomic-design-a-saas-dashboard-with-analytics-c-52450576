"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, MoreHorizontal, Search, Shield, Eye, Edit2, Trash2, Mail, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import DashboardShell from "@/components/DashboardShell";

type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"];

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  Admin: {
    label: "Admin",
    icon: <Shield className="w-3 h-3" />,
    color: "text-[#142175]",
    bg: "bg-[#142175]/10",
  },
  Editor: {
    label: "Editor",
    icon: <Edit2 className="w-3 h-3" />,
    color: "text-[#0ea5e9]",
    bg: "bg-[#0ea5e9]/10",
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
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]"
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
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}

const FALLBACK_MEMBERS: (TeamMemberRow & { name: string })[] = [
  { id: "1", full_name: "Marcus Webb", name: "Marcus Webb", email: "marcus.webb@company.com", role: "Admin", status: "Active", avatar_initials: "MW", invited_by: "", user_id: null, created_at: new Date().toISOString() },
  { id: "2", full_name: "Priya Nair", name: "Priya Nair", email: "priya.nair@company.com", role: "Editor", status: "Active", avatar_initials: "PN", invited_by: "", user_id: null, created_at: new Date().toISOString() },
  { id: "3", full_name: "Jordan Kim", name: "Jordan Kim", email: "jordan.kim@company.com", role: "Admin", status: "Active", avatar_initials: "JK", invited_by: "", user_id: null, created_at: new Date().toISOString() },
  { id: "4", full_name: "Amara Osei", name: "Amara Osei", email: "amara.osei@company.com", role: "Viewer", status: "Active", avatar_initials: "AO", invited_by: "", user_id: null, created_at: new Date().toISOString() },
  { id: "5", full_name: "Rafael Moreno", name: "Rafael Moreno", email: "rafael.moreno@company.com", role: "Editor", status: "Pending", avatar_initials: "RM", invited_by: "", user_id: null, created_at: new Date().toISOString() },
  { id: "6", full_name: "Sarah Chen", name: "Sarah Chen", email: "sarah.chen@company.com", role: "Member", status: "Active", avatar_initials: "SC", invited_by: "", user_id: null, created_at: new Date().toISOString() },
];

const ROLE_FILTERS = ["All Roles", "Admin", "Editor", "Viewer", "Member"];

export default function TeamPage() {
  const [members, setMembers] = useState<(TeamMemberRow & { name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [roleDropOpen, setRoleDropOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function loadMembers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data && data.length > 0) {
        setMembers(data.map((m) => ({ ...m, name: m.full_name ?? "" })));
      } else {
        setMembers(FALLBACK_MEMBERS);
      }
      setLoading(false);
    }
    loadMembers();
  }, []);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q);
    const matchesRole =
      roleFilter === "All Roles" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "Active").length,
    pending: members.filter((m) => m.status === "Pending").length,
    admins: members.filter((m) => m.role === "Admin").length,
  };

  const headerActions = (
    <button className="inline-flex items-center gap-2 bg-[#0ea5e9] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0284c7] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9] focus-visible:ring-offset-2">
      <UserPlus className="w-4 h-4" />
      Invite Member
    </button>
  );

  return (
    <DashboardShell
      title="Team Management"
      subtitle="Manage team members, roles, and permissions"
      actions={headerActions}
    >
      {/* Stats Row */}
      <Reveal>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Total Members", value: stats.total, icon: Users, color: "#142175" },
            { label: "Active", value: stats.active, icon: CheckCircle, color: "#10b981" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "#f59e0b" },
            { label: "Admins", value: stats.admins, icon: Shield, color: "#0ea5e9" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide">{stat.label}</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#191c1e]">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </Reveal>

      {/* Search + Filter */}
      <Reveal delay={0.05}>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#191c1e] placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setRoleDropOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#191c1e] hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] min-w-[140px] justify-between"
            >
              <span>{roleFilter}</span>
              <ChevronDown className="w-4 h-4 text-[#64748b]" />
            </button>
            {roleDropOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRoleDropOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-[#e2e8f0] bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] overflow-hidden">
                  {ROLE_FILTERS.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRoleFilter(r); setRoleDropOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                        roleFilter === r
                          ? "bg-[#0ea5e9]/10 text-[#0ea5e9] font-medium"
                          : "text-[#191c1e] hover:bg-slate-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Reveal>

      {/* Table */}
      <Reveal delay={0.1}>
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#64748b]">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No members found</p>
              <p className="text-xs mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f7f9fb]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Member</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide hidden sm:table-cell">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide hidden md:table-cell">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide hidden lg:table-cell">Joined</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filtered.map((member, idx) => {
                    const roleConf = getRoleConfig(member.role ?? "Member");
                    const initials = member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    const avatarColor = getAvatarColor(idx);
                    const joinedDate = member.created_at
                      ? new Date(member.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <motion.tr
                        key={member.id}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="hover:bg-[#f7f9fb] transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <AvatarCircle initials={initials} color={avatarColor} />
                            <div>
                              <div className="text-sm font-semibold text-[#191c1e]">{member.name}</div>
                              <div className="text-xs text-[#64748b]">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleConf.bg} ${roleConf.color}`}
                          >
                            {roleConf.icon}
                            {roleConf.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <StatusBadge status={member.status ?? "Pending"} />
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="text-sm text-[#64748b]">{joinedDate}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <ActionMenu
                            memberId={member.id}
                            open={openMenu === member.id}
                            onToggle={() =>
                              setOpenMenu((prev) =>
                                prev === member.id ? null : member.id
                              )
                            }
                            onClose={() => setOpenMenu(null)}
                          />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Reveal>

      {/* Member Cards (mobile-friendly summary) */}
      <Reveal delay={0.15}>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 6).map((member, idx) => {
            const roleConf = getRoleConfig(member.role ?? "Member");
            const initials = member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const avatarColor = getAvatarColor(idx);

            return (
              <motion.div
                key={member.id}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)] flex items-center gap-3 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.12)] transition-shadow duration-200"
              >
                <AvatarCircle initials={initials} color={avatarColor} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#191c1e] truncate">{member.name}</div>
                  <div className="text-xs text-[#64748b] truncate">{member.email}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleConf.bg} ${roleConf.color}`}
                    >
                      {roleConf.icon}
                      {roleConf.label}
                    </span>
                    <StatusBadge status={member.status ?? "Pending"} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Reveal>
    </DashboardShell>
  );
}
