"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { navLinks, APP_NAME, APP_TAGLINE } from "@/lib/data";
import { LayoutDashboard, BarChart2, FileText, Users, Settings, HelpCircle, LogOut, TrendingUp, Zap } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  overview: <LayoutDashboard className="h-5 w-5" aria-hidden="true" />,
  analytics: <BarChart2 className="h-5 w-5" aria-hidden="true" />,
  reports: <FileText className="h-5 w-5" aria-hidden="true" />,
  team: <Users className="h-5 w-5" aria-hidden="true" />,
  settings: <Settings className="h-5 w-5" aria-hidden="true" />,
  help: <HelpCircle className="h-5 w-5" aria-hidden="true" />,
  logout: <LogOut className="h-5 w-5" aria-hidden="true" />,
};

const mainNavKeys = ["overview", "analytics", "reports", "team", "settings"];
const bottomNavKeys = ["help", "logout"];

export default function Navbar() {
  const pathname = usePathname();
  const t = useTranslations();
  const navT = t.raw("nav") as Record<string, string>;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed left-0 top-0 h-full w-[260px] bg-[var(--color-sidebar)] flex flex-col z-40 shadow-[4px_0_24px_rgba(20,33,117,0.15)]"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
          <Zap className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <div className="text-white font-semibold text-[15px] leading-tight tracking-tight">
            {APP_NAME}
          </div>
          <div className="text-white/50 text-[11px] leading-tight">{APP_TAGLINE}</div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {mainNavKeys.map((key) => {
            const link = navLinks.find((l) => l.key === key);
            if (!link) return null;
            const active = isActive(link.href);
            return (
              <li key={key}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 group ${
                    active
                      ? "bg-[var(--color-sidebar-active)] text-white shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={`transition-colors duration-200 ${
                      active ? "text-[var(--color-accent)]" : "text-white/40 group-hover:text-white/70"
                    }`}
                  >
                    {iconMap[key]}
                  </span>
                  <span>{navT[key] ?? link.label}</span>
                  {active && (
                    <span className="ml-auto w-1 h-4 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Upgrade CTA */}
      <div className="px-3 pb-3">
        <div className="rounded-xl bg-gradient-to-br from-[var(--color-primary-container)] to-[var(--color-sidebar-active)] p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
            <span className="text-white text-[12px] font-semibold uppercase tracking-wider">
              {navT["upgrade"] ?? "Upgrade Plan"}
            </span>
          </div>
          <p className="text-white/50 text-[11px] leading-relaxed mb-3">
            Unlock advanced analytics and unlimited reports.
          </p>
          <button className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[12px] font-semibold py-2 rounded-lg transition-colors duration-200">
            {navT["upgrade"] ?? "Upgrade Plan"}
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        <ul className="space-y-0.5">
          {bottomNavKeys.map((key) => {
            const link = navLinks.find((l) => l.key === key);
            if (!link) return null;
            const active = isActive(link.href);
            return (
              <li key={key}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 group ${
                    active
                      ? "bg-[var(--color-sidebar-active)] text-white"
                      : "text-white/50 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <span className="text-white/40 group-hover:text-white/70 transition-colors duration-200">
                    {iconMap[key]}
                  </span>
                  <span>{navT[key] ?? link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.aside>
  );
}