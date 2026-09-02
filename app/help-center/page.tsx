"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, Mail, FileText, Settings, Activity, Star, AlertCircle, CheckCircle, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

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
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Hero */}
      <Reveal>
        <section className="relative overflow-hidden border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-20 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(14,165,233,0.18) 0%, transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              All systems operational
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] md:text-5xl">
              How can we help you?
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
              Search our knowledge base or browse topics below. Our team is also
              available for direct support.
            </p>
            <div className="relative mt-8">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Search articles, guides, and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-3.5 pl-11 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all duration-200"
              />
            </div>
          </div>
        </section>
      </Reveal>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Quick Links */}
        <Reveal>
          <div className="mb-14">
            <h2 className="mb-6 text-lg font-semibold text-[hsl(var(--foreground))]">
              Popular Resources
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_LINKS.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="group cursor-pointer rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-[hsl(var(--border))]/80 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_12px_32px_-8px_rgba(0,0,0,0.14)]"
                  >
                    <div
                      className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: `${link.color}18` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: link.color }} />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-[hsl(var(--foreground))]">
                      {link.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {link.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[var(--accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Read more <ArrowRight className="h-3 w-3" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <Reveal delay={0.05}>
            <aside className="space-y-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                Browse by Topic
              </p>
              {TOPICS.map((topic) => {
                const Icon = topic.icon;
                const active = activeTopic === topic.key;
                return (
                  <button
                    key={topic.key}
                    onClick={() => setActiveTopic(topic.key)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]/40 hover:text-[hsl(var(--foreground))]"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {topic.label}
                  </button>
                );
              })}

              {/* System Status */}
              <div className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                  System Status
                </p>
                <div className="space-y-2">
                  {STATUS_ITEMS.map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-xs text-[hsl(var(--foreground))]">{s.label}</span>
                      <span
                        className={`flex items-center gap-1 text-xs font-medium ${
                          s.ok ? "text-emerald-500" : "text-amber-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            s.ok ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
                <a
                  href="#"
                  className="mt-3 block text-xs text-[var(--accent)] hover:underline"
                >
                  View full status page
                </a>
              </div>
            </aside>
          </Reveal>

          {/* FAQ Main */}
          <div className="space-y-10">
            <Reveal>
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                    {activeTopic === "all"
                      ? "Frequently Asked Questions"
                      : TOPICS.find((t) => t.key === activeTopic)?.label}
                  </h2>
                  {!loading && (
                    <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      {filteredFaqs.length} article{filteredFaqs.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="h-14 animate-pulse rounded-xl bg-[hsl(var(--border))]/40"
                      />
                    ))}
                  </div>
                ) : filteredFaqs.length === 0 ? (
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-8 py-14 text-center">
                    <Search className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                      No results found
                    </p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      Try a different search term or browse all topics.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setActiveTopic("all");
                      }}
                      className="mt-4 rounded-lg bg-[var(--accent)]/10 px-4 py-2 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors duration-200"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[hsl(var(--border))] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
                    {filteredFaqs.map((item) => {
                      const isOpen = openFaq === item.id;
                      return (
                        <div key={item.id}>
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : item.id)}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-[hsl(var(--border))]/20"
                          >
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 flex-shrink-0 rounded-md bg-[var(--accent)]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                                {item.topic}
                              </span>
                              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                                {item.question}
                              </span>
                            </div>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex-shrink-0"
                            >
                              <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            </motion.div>
                          </button>
                          <motion.div
                            initial={false}
                            animate={
                              isOpen
                                ? { height: "auto", opacity: 1 }
                                : { height: 0, opacity: 0 }
                            }
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[hsl(var(--border))]/60 bg-[hsl(var(--background))]/50 px-5 py-4">
                              <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                                {item.answer}
                              </p>
                              <div className="mt-4 flex items-center gap-4">
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                  Was this helpful?
                                </span>
                                <button className="rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]/30 transition-colors duration-150">
                                  Yes
                                </button>
                                <button className="rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]/30 transition-colors duration-150">
                                  No
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Reveal>

            {/* Contact Support */}
            <Reveal delay={0.08}>
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.10)]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]/10">
                    <Mail className="h-4.5 w-4.5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      Contact Support
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Average response time: under 4 hours
                    </p>
                  </div>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-8 text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      Message sent successfully
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Our support team will get back to you within 4 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setContactForm({ subject: "", message: "" });
                      }}
                      className="mt-2 text-xs text-[var(--accent)] hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--foreground))]">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Briefly describe your issue..."
                        value={contactForm.subject}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, subject: e.target.value }))
                        }
                        className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--foreground))]">
                        Message
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Provide as much detail as possible..."
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm((prev) => ({ ...prev, message: e.target.value }))
                        }
                        className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all duration-200"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                        <Clock className="h-3.5 w-3.5" />
                        Mon to Fri, 9am to 6pm UTC
                      </div>
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-200 hover:opacity-90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60"
                      >
                        Send Message
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}