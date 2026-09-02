"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Bell, Users, Save, Upload, X, Check, ChevronDown, Mail, Shield, MoreVertical, UserPlus, AlertCircle } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import DashboardShell from '@/components/DashboardShell';

type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"];
type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

const SUB_NAV = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Lock },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "team", label: "Team", icon: Users },
];

const NOTIFICATION_SETTINGS = [
  { key: "email_reports", label: "Email Reports", description: "Receive weekly and monthly report summaries via email", enabled: true },
  { key: "alert_thresholds", label: "Threshold Alerts", description: "Get notified when a metric crosses a defined threshold", enabled: true },
  { key: "team_activity", label: "Team Activity", description: "Notifications when team members make changes", enabled: false },
  { key: "product_updates", label: "Product Updates", description: "News about new features and platform improvements", enabled: false },
  { key: "security_alerts", label: "Security Alerts", description: "Immediate alerts for suspicious login attempts", enabled: true },
];

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    Admin: "bg-[var(--accent)]/10 text-[var(--accent)]",
    Editor: "bg-emerald-500/10 text-emerald-600",
    Viewer: "bg-slate-200 text-slate-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role] ?? "bg-slate-100 text-slate-600"}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-400/10 text-amber-600"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-emerald-500" : "bg-amber-400"}`} />
      {status}
    </span>
  );
}

function AvatarInitials({ initials, color }: { initials: string; color?: string }) {
  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ backgroundColor: color ?? "#0ea5e9" }}
    >
      {initials}
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(NOTIFICATION_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");

  // Supabase state
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      setProfileLoading(true);
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .limit(1)
        .single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name ?? "");
        setEmail(data.email ?? "");
        setJobTitle(data.job_title ?? "");
      }
      setProfileLoading(false);
    }

    async function loadTeam() {
      setTeamLoading(true);
      const { data } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setTeamMembers(data);
      setTeamLoading(false);
    }

    loadProfile();
    loadTeam();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  function toggleNotification(key: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n))
    );
  }

  const FALLBACK_TEAM: TeamMemberRow[] = [
    { id: "1", full_name: "Marcus Webb", email: "marcus@company.com", role: "Admin", status: "Active", avatar_initials: "MW", invited_by: "", user_id: null, created_at: new Date().toISOString() },
    { id: "2", full_name: "Priya Nair", email: "priya@company.com", role: "Editor", status: "Active", avatar_initials: "PN", invited_by: "", user_id: null, created_at: new Date().toISOString() },
    { id: "3", full_name: "Jordan Kim", email: "jordan@company.com", role: "Viewer", status: "Pending", avatar_initials: "JK", invited_by: "", user_id: null, created_at: new Date().toISOString() },
  ];

  const displayTeam = teamMembers.length > 0 ? teamMembers : FALLBACK_TEAM;

  function getInitials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  }

  const AVATAR_COLORS = ["#0ea5e9", "#2d3e9e", "#10b981", "#f59e0b", "#7c3aed"];

  return (
    <DashboardShell
      title="Settings"
      subtitle="Manage your account, security, notifications, and team preferences"
    >
      {/* Sub-nav tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[var(--border)] bg-white p-1 w-fit shadow-sm">
        {SUB_NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeSection === key
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--color-muted)] hover:text-[var(--color-on-surface)] hover:bg-slate-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Section */}
      <AnimatePresence mode="wait">
        {activeSection === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Reveal>
              <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
                <div className="border-b border-[var(--border)] px-6 py-4">
                  <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Profile Information</h2>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5">Update your personal details and public profile.</p>
                </div>
                <form onSubmit={handleSaveProfile} className="px-6 py-6 space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                        style={{ backgroundColor: "#0ea5e9" }}
                      >
                        {getInitials(fullName || "Marcus Webb")}
                      </div>
                      <button
                        type="button"
                        className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center border-2 border-white hover:bg-[var(--color-sidebar-active)] transition-colors"
                        aria-label="Upload avatar"
                      >
                        <Upload className="h-3 w-3 text-white" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-on-surface)]">{fullName || "Marcus Webb"}</p>
                      <p className="text-xs text-[var(--color-muted)]">{email || "marcus@company.com"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-on-surface)] mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Marcus Webb"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-on-surface)] mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="marcus@company.com"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-on-surface)] mb-1.5">Job Title</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Head of Analytics"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-on-surface)] mb-1.5">Department</label>
                      <input
                        type="text"
                        defaultValue="Growth & Analytics"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-shadow"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <AnimatePresence>
                      {saveSuccess && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"
                        >
                          <Check className="h-4 w-4" />
                          Changes saved
                        </motion.span>
                      )}
                      {!saveSuccess && <span />}
                    </AnimatePresence>
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-sidebar-active)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </Reveal>
          </motion.div>
        )}

        {/* Security Section */}
        {activeSection === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Reveal>
              <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
                <div className="border-b border-[var(--border)] px-6 py-4">
                  <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Change Password</h2>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5">Use a strong, unique password for your account.</p>
                </div>
                <div className="px-6 py-6 space-y-4">
                  {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-[var(--color-on-surface)] mb-1.5">{label}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-shadow"
                      />
                    </div>
                  ))}
                  <button className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-sidebar-active)] transition-colors">
                    <Lock className="h-4 w-4" />
                    Update Password
                  </button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
                <div className="border-b border-[var(--border)] px-6 py-4">
                  <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Two-Factor Authentication</h2>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5">Add an extra layer of security to your account.</p>
                </div>
                <div className="px-6 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-on-surface)]">Authenticator App</p>
                      <p className="text-xs text-[var(--color-muted)]">{twoFaEnabled ? "Enabled — your account is protected" : "Not enabled — recommended for all accounts"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFaEnabled((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                      twoFaEnabled ? "bg-[var(--color-accent)]" : "bg-slate-200"
                    }`}
                    role="switch"
                    aria-checked={twoFaEnabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        twoFaEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
                <div className="border-b border-[var(--border)] px-6 py-4">
                  <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Active Sessions</h2>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5">Devices currently signed in to your account.</p>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {[
                    { device: "MacBook Pro — Chrome 118", location: "San Francisco, CA", time: "Active now", current: true },
                    { device: "iPhone 15 — Safari", location: "San Francisco, CA", time: "2 hours ago", current: false },
                    { device: "Windows PC — Edge 119", location: "New York, NY", time: "Yesterday", current: false },
                  ].map((session) => (
                    <div key={session.device} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-on-surface)]">{session.device}</p>
                        <p className="text-xs text-[var(--color-muted)]">{session.location} · {session.time}</p>
                      </div>
                      {session.current ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Current
                        </span>
                      ) : (
                        <button className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </motion.div>
        )}

        {/* Notifications Section */}
        {activeSection === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Reveal>
              <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
                <div className="border-b border-[var(--border)] px-6 py-4">
                  <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Notification Preferences</h2>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5">Choose what you want to be notified about.</p>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {notifications.map((notif) => (
                    <div key={notif.key} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-on-surface)]">{notif.label}</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{notif.description}</p>
                      </div>
                      <button
                        onClick={() => toggleNotification(notif.key)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                          notif.enabled ? "bg-[var(--color-accent)]" : "bg-slate-200"
                        }`}
                        role="switch"
                        aria-checked={notif.enabled}
                        aria-label={notif.label}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            notif.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border)] px-6 py-4 flex justify-end">
                  <button className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-sidebar-active)] transition-colors">
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </Reveal>
          </motion.div>
        )}

        {/* Team Section */}
        {activeSection === "team" && (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Reveal>
              <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Team Members</h2>
                    <p className="text-sm text-[var(--color-muted)] mt-0.5">Manage access and roles for your workspace.</p>
                  </div>
                  <button
                    onClick={() => setInviteOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-sidebar-active)] transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                  </button>
                </div>

                {teamLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)]" ref={menuRef}>
                    {displayTeam.map((member, idx) => (
                      <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                        <AvatarInitials
                          initials={getInitials(member.full_name)}
                          color={AVATAR_COLORS[idx % AVATAR_COLORS.length]}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">{member.full_name ?? "Unknown"}</p>
                          <p className="text-xs text-[var(--color-muted)] truncate">{member.email ?? ""}</p>
                        </div>
                        <RoleBadge role={member.role ?? "Viewer"} />
                        <StatusBadge status={member.status ?? "Active"} />
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                            aria-label="Member actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === member.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-[var(--border)] bg-white shadow-lg overflow-hidden"
                              >
                                <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-on-surface)] hover:bg-slate-50 transition-colors">
                                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                                  Send invite
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                  <X className="h-3.5 w-3.5" />
                                  Remove
                                </button>
                              </motion.div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>

            {/* Invite Modal */}
            <AnimatePresence>
              {inviteOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    onClick={() => setInviteOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2 }}
                    className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-semibold text-[var(--color-on-surface)]">Invite Team Member</h3>
                      <button
                        onClick={() => setInviteOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[var(--color-on-surface)] mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@company.com"
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--color-on-surface)] mb-1.5">Role</label>
                        <div className="relative">
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] pr-8"
                          >
                            <option>Admin</option>
                            <option>Editor</option>
                            <option>Viewer</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => setInviteOpen(false)}
                          className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setInviteOpen(false);
                            setInviteEmail("");
                          }}
                          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-sidebar-active)] transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          Send Invite
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
