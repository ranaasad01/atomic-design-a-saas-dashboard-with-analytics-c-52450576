export interface NavLink {
  label: string;
  href: string;
  key: string;
  icon?: string;
}

export const APP_NAME = "Analytix Pro";
export const APP_TAGLINE = "Kinetic Enterprise";
export const APP_PLAN = "Enterprise Plan";

export const navLinks: NavLink[] = [
  { label: "Overview", href: "/", key: "overview" },
  { label: "Analytics", href: "/analytics", key: "analytics" },
  { label: "Reports", href: "/reports", key: "reports" },
  { label: "Team", href: "/team", key: "team" },
  { label: "Settings", href: "/settings", key: "settings" },
  { label: "Help", href: "/help", key: "help" },
];

export const sidebarBottomLinks: NavLink[] = [
  { label: "Help", href: "/help", key: "help" },
  { label: "Logout", href: "/logout", key: "logout" },
];

export interface KpiCard {
  label: string;
  value: string;
  trend: "up" | "down";
  trendValue: string;
  trendLabel: string;
  icon: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Pending";
  initials: string;
  color: string;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  lastRun: string;
  status: "Completed" | "Pending" | "Failed";
}

export interface ScheduledReport {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  isActive: boolean;
}

export interface ActivityEvent {
  id: string;
  icon: string;
  description: string;
  time: string;
}

export const BRAND_COLORS = {
  primary: "#142175",
  primaryContainer: "#2e3a8c",
  accent: "#0ea5e9",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  surface: "#ffffff",
  background: "#f7f9fb",
  sidebar: "#1a2b6d",
  sidebarActive: "#2d3e9e",
} as const;