"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, Mail, FileText, Settings, Activity, Star, AlertCircle, CheckCircle, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import DashboardShell from '@/components/DashboardShell';

type FaqItem = Database["public"]["Tables"]["faq_items"]["Row"];

const TOPICS = [
  { key: "all", label: "All Topics", icon: BookOpen },
  { key: "Getting Started", label: "Getting Started", icon: Star },
  { key: "Analytics", label: "Analytics", icon: Activity },
  { key: "Reports", label: "Reports", icon: FileText },
  { key: "Account", label: "Account & Billing", icon: Settings },
  { key: "Troubleshooting", label: "Troubleshooting", icon: AlertCircle },
];

const QUICK_LINKS = [
  {
    title: "Getting Started Guide",
    description: "Set up your workspace and connect your first data source in minutes.",
    icon: Star,
    color: "#0ea5e9",
  },
  {
    title: "Analytics Deep Dive",
    description: "Understand every chart, metric, and dimension available in your dashboard.",
    icon: Activity,
    color: "#2d3e9e",
  },
  {
    title: "Report Builder",
    description: "Create, schedule, and share custom reports with your team.",
    icon: FileText,
    color: "#10b981",
  },
  {
    title: "Account Settings",
    description: "Manage billing, team members, permissions, and security preferences.",
    icon: Settings,
    color: "#f59e0b",
  },
];

const STATUS_ITEMS = [
  { label: "API", status: "Operational", ok: true },
  { label: "Dashboard", status: "Operational", ok: true },
  { label: "Data Ingestion", status: "Operational", ok: true },
  { label: "Report Exports", status: "Degraded", ok: false },
];

export default function HelpCenterPage() {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function loadFaqs() {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data) {
        setFaqItems(data);
      }
      setLoading(false);
    }
    loadFaqs();
  }, []);

  const filteredFaqs = faqItems.filter((item) => {
    const matchesTopic = activeTopic === "all" || item.topic === activeTopic;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q);
    return matchesTopic && matchesSearch;
  });

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <DashboardShell title="Help Center" subtitle="Find answers, guides, and support resources">
      {/* Hero */}
      <Reveal>
        <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white px-6 py-16 text-center mb-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-30 rounded-2xl"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(14,165,233,0.18) 0%, transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--color-background)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Support Center
            </span>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-[var(--foreground)]">
              How can we help you?
            </h1>
            <p className="mb-8 text-[var(--color-muted)] leading-relaxed">
              Search our knowledge base, browse guides, or reach out to our support team.
            </p>
            {/* Search */}
            <div className="relative mx-auto max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
              <input
                type="text"
                placeholder="Search articles, guides, FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--color-muted)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Topic Filters */}
      <Reveal delay={0.05}>
        <div className="mb-8 flex flex-wrap gap-2">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            const active = activeTopic === topic.key;
            return (
              <button
                key={topic.key}
                onClick={() => setActiveTopic(topic.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-sm"
                    : "border-[var(--border)] bg-white text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {topic.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* FAQ Accordion — takes 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <Reveal>
            <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="border-b border-[var(--border)] px-6 py-4">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  {loading
                    ? "Loading..."
                    : filteredFaqs.length === 0
                    ? "No results found. Try a different search or topic."
                    : `${filteredFaqs.length} article${filteredFaqs.length !== 1 ? "s" : ""} found`}
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
                </div>
              ) : filteredFaqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <AlertCircle className="h-10 w-10 text-[var(--color-muted)] mb-3" />
                  <p className="text-sm font-medium text-[var(--foreground)]">No articles found</p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Try adjusting your search or selecting a different topic.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {filteredFaqs.map((item) => {
                    const isOpen = openFaq === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : item.id)}
                          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]"
                          aria-expanded={isOpen}
                        >
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            {item.question}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 flex-shrink-0 text-[var(--color-muted)] transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <p className="px-6 pb-5 text-sm leading-relaxed text-[var(--color-muted)]">
                              {item.answer}
                            </p>
                          </motion.div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Reveal>

          {/* Quick Links */}
          <Reveal delay={0.08}>
            <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="border-b border-[var(--border)] px-6 py-4">
                <h2 className="text-base font-semibold text-[var(--foreground)]">Popular Guides</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.title}
                      className="flex items-start gap-4 p-5 text-left hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${link.color}18` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: link.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--color-accent)] transition-colors">
                          {link.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--color-muted)] leading-relaxed">
                          {link.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-[var(--color-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Status */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="border-b border-[var(--border)] px-5 py-4">
                <h2 className="text-base font-semibold text-[var(--foreground)]">System Status</h2>
              </div>
              <ul className="divide-y divide-[var(--border)]">
                {STATUS_ITEMS.map((item) => (
                  <li key={item.label} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-[var(--foreground)]">{item.label}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.ok
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.ok ? "bg-emerald-500" : "bg-amber-400"
                        }`}
                      />
                      {item.status}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[var(--border)] px-5 py-3">
                <p className="text-xs text-[var(--color-muted)]">
                  Last checked: just now
                </p>
              </div>
            </div>
          </Reveal>

          {/* Contact Form */}
          <Reveal delay={0.12}>
            <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="border-b border-[var(--border)] px-5 py-4">
                <h2 className="text-base font-semibold text-[var(--foreground)]">Contact Support</h2>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  Typical response time: under 2 hours
                </p>
              </div>
              <div className="p-5">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">Message sent!</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      Our team will get back to you shortly.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setContactForm({ subject: "", message: "" });
                      }}
                      className="mt-4 text-xs font-medium text-[var(--color-accent)] hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--foreground)]">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Briefly describe your issue"
                        value={contactForm.subject}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, subject: e.target.value }))
                        }
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--foreground)]">
                        Message
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Describe your issue in detail..."
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, message: e.target.value }))
                        }
                        className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-accent-hover)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      <Mail className="h-4 w-4" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>

          {/* Response time info */}
          <Reveal delay={0.14}>
            <div className="rounded-2xl border border-[var(--border)] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                  <Clock className="h-4 w-4 text-[var(--color-accent)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Support Hours</p>
                  <p className="text-xs text-[var(--color-muted)]">Mon to Fri, 9am to 6pm UTC</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </DashboardShell>
  );
}
