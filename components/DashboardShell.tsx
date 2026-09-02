"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, HelpCircle, LayoutGrid } from 'lucide-react';
import Navbar from "@/components/Navbar";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function DashboardShell({
  children,
  title,
  subtitle,
  actions,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar */}
      <Navbar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 ml-[260px] min-h-screen bg-[#f7f9fb]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#e2e8f0] px-6 py-3 flex items-center justify-between">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search anything\u2026"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-[#f7f9fb] w-64 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] pl-9 text-[#191c1e] placeholder:text-[#64748b]"
              aria-label="Search anything"
            />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/help-center"
              aria-label="Open Help Center"
              className="p-2 rounded-lg hover:bg-[#f7f9fb] text-[#64748b] hover:text-[#191c1e] transition-colors"
            >
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </Link>

            <button
              aria-label="View notifications"
              className="p-2 rounded-lg hover:bg-[#f7f9fb] text-[#64748b] hover:text-[#191c1e] transition-colors relative"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {/* Notification dot */}
              <span
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-white"
                aria-hidden="true"
              />
            </button>

            <button
              aria-label="Switch workspace"
              className="p-2 rounded-lg hover:bg-[#f7f9fb] text-[#64748b] hover:text-[#191c1e] transition-colors"
            >
              <LayoutGrid className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-[#e2e8f0] mx-2" aria-hidden="true" />

            {/* User avatar */}
            <button
              aria-label="Marcus Webb, Admin"
              className="flex items-center justify-center h-9 w-9 rounded-full bg-[#0ea5e9] text-white text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9] focus-visible:ring-offset-2"
            >
              MW
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Page header */}
            {(title || actions) && (
              <div className="flex justify-between items-start mb-6">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-[#64748b] mt-0.5">{subtitle}</p>
                  )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
