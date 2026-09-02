"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Bell, Users, Save, Upload, X, Check, ChevronDown, Mail, Shield, MoreVertical, UserPlus, AlertCircle } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer } from "@/lib/motion";
type MOCK_TEAM_MEMBERS = any;
const MOCK_TEAM_MEMBERS: any = [];
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

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
      const { data } = await supabase.from("user_profiles").select("*").limit(1).maybeSingle();
      if (data) {
        setProfile(data);
        setFullName(data.full_name ?? "");
        setEmail(data.email ?? "");
        setJobTitle(data.job_title ?? "");
        setTwoFaEnabled(data.two_fa_enabled ?? false);
      }
      setProfileLoading(false);
    }

    async function loadTeam() {
      setTeamLoading(true);
      const { data } = await supabase.from("team_members").select("*").order("created_at", { ascending: true });
      if (data && data.length > 0) {
        setTeamMembers(data);
      } else {
        // Fallback to mock data if table is empty
        setTeamMembers(
          MOCK_TEAM_MEMBERS.map((m) => ({
            id: m.id,
            invited_by: "",
            user_id: null,
            full_name: m.name,
            email: m.email,
            role: m.role,
            status: m.status,
            avatar_initials: m.initials,
            created_at: new Date().toISOString(),
          }))
        );
      }
      setTeamLoading(false);
    }

    loadProfile();
    loadTeam();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSaveProfile() {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  function toggleNotification(key: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n))
    );
  }

  const displayMembers = teamMembers.length > 0 ? teamMembers : MOCK_TEAM_MEMBERS.map((m) => ({
    id: m.id,
    invited_by: "",
    user_id: null,
    full_name: m.name,
    email: m.email,
    role: m.role,
    status: m.status,
    avatar_initials: m.initials,
    created_at: new Date().toISOString(),
  }));

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Header */}
        <Reveal>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Settings
            </h1>
            <p className="mt-1 text-[hsl(var(--muted-foreground))]">
              Manage your account preferences, security, and team configuration.
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Sub-Nav */}
          <Reveal className="lg:w-56 shrink-0">
            <nav className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)]">
              {SUB_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/50 hover:text-[hsl(var(--foreground))]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </Reveal>

          {/* Right Content */}
          <div className="flex-1 space-y-6">
            <AnimatePresence mode="wait">
              {/* ── PROFILE ── */}
              {activeSection === "profile" && (
                <motion.div
                  key="profile"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)]">
                    <h2 className="mb-1 text-lg font-semibold text-[hsl(var(--foreground))]">Profile Settings</h2>
                    <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">Update your personal information and public profile.</p>

                    {profileLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-10 animate-pulse rounded-xl bg-[hsl(var(--muted))]/40" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2">
                        {/* Avatar */}
                        <div className="sm:col-span-2 flex items-center gap-5">
                          <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/20 text-2xl font-bold text-[var(--accent)]">
                              {fullName ? fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "AP"}
                            </div>
                            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[hsl(var(--card))] bg-[var(--accent)] text-white shadow-sm transition-transform hover:scale-110">
                              <Upload className="h-3 w-3" />
                            </button>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Profile Photo</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">JPG, PNG or GIF. Max 2MB.</p>
                            <button className="mt-1 text-xs text-red-500 hover:text-red-600 transition-colors">Remove Photo</button>
                          </div>
                        </div>

                        {/* Full Name */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-[hsl(var(--foreground))]">Full Name</label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your full name"
                            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3.5 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none ring-0 transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                          />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-[hsl(var(--foreground))]">Email Address</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3.5 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none ring-0 transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                          />
                        </div>

                        {/* Job Title */}
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <label className="text-sm font-medium text-[hsl(var(--foreground))]">Job Title</label>
                          <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Head of Growth"
                            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3.5 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none ring-0 transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                          />
                        </div>

                        {/* Save */}
                        <div className="sm:col-span-2 flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveProfile}
                            className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
                          >
                            <Save className="h-4 w-4" />
                            Save Changes
                          </motion.button>
                          <AnimatePresence>
                            {saveSuccess && (
                              <motion.span
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-1.5 text-sm text-emerald-600"
                              >
                                <Check className="h-4 w-4" />
                                Saved successfully
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── SECURITY ── */}
              {activeSection === "security" && (
                <motion.div
                  key="security"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)]">
                    <h2 className="mb-1 text-lg font-semibold text-[hsl(var(--foreground))]">Security</h2>
                    <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">Manage your password and authentication settings.</p>

                    <div className="divide-y divide-[hsl(var(--border))]">
                      {/* Password row */}
                      <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))]/50">
                            <Lock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Password</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {profile?.password_last_changed_at
                                ? `Last changed ${new Date(profile.password_last_changed_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                                : "Last changed 3 months ago"}
                            </p>
                          </div>
                        </div>
                        <button className="self-start rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition-all hover:bg-[hsl(var(--muted))]/50 sm:self-auto">
                          Update Password
                        </button>
                      </div>

                      {/* 2FA row */}
                      <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))]/50">
                            <Shield className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Two-Factor Authentication</p>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${twoFaEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                                {twoFaEnabled ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              Add an extra layer of security to your account with an authenticator app.
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setTwoFaEnabled((v) => !v)}
                          className={`self-start rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:self-auto ${
                            twoFaEnabled
                              ? "border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/50"
                              : "bg-[var(--accent)] text-white shadow-sm hover:opacity-90"
                          }`}
                        >
                          {twoFaEnabled ? "Disable 2FA" : "Enable 2FA"}
                        </motion.button>
                      </div>

                      {/* Active sessions */}
                      <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))]/50">
                            <AlertCircle className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Active Sessions</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              You are signed in on 2 devices. Last active: Chrome on macOS, 2 hours ago.
                            </p>
                          </div>
                        </div>
                        <button className="self-start rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-50 sm:self-auto">
                          Sign Out All
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeSection === "notifications" && (
                <motion.div
                  key="notifications"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                >
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)]">
                    <h2 className="mb-1 text-lg font-semibold text-[hsl(var(--foreground))]">Notification Preferences</h2>
                    <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">Choose which updates and alerts you want to receive.</p>

                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="divide-y divide-[hsl(var(--border))]"
                    >
                      {notifications.map((n) => (
                        <motion.div
                          key={n.key}
                          variants={fadeInUp}
                          className="flex items-center justify-between py-4"
                        >
                          <div className="pr-4">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">{n.label}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{n.description}</p>
                          </div>
                          <button
                            onClick={() => toggleNotification(n.key)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                              n.enabled ? "bg-[var(--accent)]" : "bg-[hsl(var(--muted))]"
                            }`}
                            role="switch"
                            aria-checked={n.enabled}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                                n.enabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>

                    <div className="mt-6 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                      >
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── TEAM ── */}
              {activeSection === "team" && (
                <motion.div
                  key="team"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)]">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Team Management</h2>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          Manage roles and access for your workspace members.
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setInviteOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                      >
                        <UserPlus className="h-4 w-4" />
                        Invite User
                      </motion.button>
                    </div>

                    {/* Invite modal */}
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
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl"
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">Invite Team Member</h3>
                              <button
                                onClick={() => setInviteOpen(false)}
                                className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/50 hover:text-[hsl(var(--foreground))]"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-[hsl(var(--foreground))]">Email Address</label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                                  <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2.5 pl-9 pr-3.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-[hsl(var(--foreground))]">Role</label>
                                <div className="relative">
                                  <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3.5 py-2.5 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                                  >
                                    <option value="Admin">Admin</option>
                                    <option value="Editor">Editor</option>
                                    <option value="Viewer">Viewer</option>
                                  </select>
                                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                                </div>
                              </div>
                              <div className="flex gap-3 pt-1">
                                <button
                                  onClick={() => setInviteOpen(false)}
                                  className="flex-1 rounded-xl border border-[hsl(var(--border))] py-2.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => setInviteOpen(false)}
                                  className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-white hover:opacity-90"
                                >
                                  Send Invite
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>

                    {/* Team table */}
                    {teamLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-[hsl(var(--muted))]/40" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3.5 w-40 animate-pulse rounded bg-[hsl(var(--muted))]/40" />
                              <div className="h-3 w-28 animate-pulse rounded bg-[hsl(var(--muted))]/30" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]" ref={menuRef}>
                        <table className="w-full text-sm">
                          <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Member</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Role</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Status</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[hsl(var(--border))]">
                            {displayMembers.map((member) => {
                              const initials = member.avatar_initials ?? member.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                              const memberColor = MOCK_TEAM_MEMBERS.find((m) => m.email === member.email)?.color ?? "#0ea5e9";
                              return (
                                <tr key={member.id} className="group transition-colors hover:bg-[hsl(var(--muted))]/20">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <AvatarInitials initials={initials} color={memberColor} />
                                      <div>
                                        <p className="font-medium text-[hsl(var(--foreground))]">{member.full_name}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{member.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <RoleBadge role={member.role} />
                                  </td>
                                  <td className="px-4 py-3">
                                    <StatusBadge status={member.status} />
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="relative inline-block">
                                      <button
                                        onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                                        className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] opacity-0 transition-all group-hover:opacity-100 hover:bg-[hsl(var(--muted))]/50 hover:text-[hsl(var(--foreground))]"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </button>
                                      <AnimatePresence>
                                        {openMenu === member.id && (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1 shadow-lg"
                                          >
                                            {["Change Role", "Resend Invite", "Remove Member"].map((action) => (
                                              <button
                                                key={action}
                                                onClick={() => setOpenMenu(null)}
                                                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[hsl(var(--muted))]/50 ${
                                                  action === "Remove Member" ? "text-red-500" : "text-[hsl(var(--foreground))]"
                                                }`}
                                              >
                                                {action}
                                              </button>
                                            ))}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                      <span>{displayMembers.length} members total</span>
                      <span>{displayMembers.filter((m) => m.status === "Active").length} active</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}