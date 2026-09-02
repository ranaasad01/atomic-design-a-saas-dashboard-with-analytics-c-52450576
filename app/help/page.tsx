"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronRight, Mail, MessageCircle, FileText, BookOpen, Sparkles, Clock, CheckCircle, AlertCircle, ArrowRight, Phone } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type FaqItem = Database["public"]["Tables"]["faq_items"]["Row"];

const HELP_CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "getting-started", label: "Getting Started" },
  { id: "analytics", label: "Analytics" },
  { id: "reports", label: "Reports" },
  { id: "billing", label: "Billing" },
  { id: "integrations", label: "Integrations" },
  { id: "account", label: "Account" },
];

const SUPPORT_CHANNELS = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Talk to our support team in real time. Average response under 2 minutes during business hours.",
    cta: "Start Chat",
    badge: "Fastest",
    badgeColor: "bg-emerald-500/10 text-emerald-400",
    available: true,
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us a detailed message and we will get back to you within one business day.",
    cta: "Send Email",
    badge: "24h SLA",
    badgeColor: "bg-sky-500/10 text-sky-400",
    available: true,
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Available for Enterprise plan customers. Schedule a call with a dedicated account manager.",
    cta: "Schedule Call",
    badge: "Enterprise",
    badgeColor: "bg-violet-500/10 text-violet-400",
    available: false,
  },
];

const QUICK_LINKS = [
  { icon: BookOpen, title: "Getting Started Guide", description: "Set up your workspace in under 10 minutes.", href: "#" },
  { icon: FileText, title: "API Documentation", description: "Full reference for the Analytix Pro REST API.", href: "#" },
  { icon: Sparkles, title: "What's New", description: "See the latest features and product updates.", href: "#" },
  { icon: CheckCircle, title: "System Status", description: "Real-time uptime and incident history.", href: "#" },
];

const STATUS_ITEMS = [
  { label: "API Gateway", status: "operational" },
  { label: "Dashboard", status: "operational" },
  { label: "Data Ingestion", status: "operational" },
  { label: "Report Generation", status: "degraded" },
  { label: "Webhooks", status: "operational" },
];

export default function HelpPage() {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFaq() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data) {
        setFaqItems(data);
      }
      setLoading(false);
    }
    loadFaq();
  }, []);

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.topic?.toLowerCase() === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const topics = ["all", ...Array.from(new Set(faqItems.map((f) => f.topic?.toLowerCase()).filter(Boolean)))];
  const displayCategories = HELP_CATEGORIES.filter(
    (c) => c.id === "all" || topics.includes(c.id)
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero */}
      <Reveal>
        <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-[var(--brand-dark)] via-[var(--brand-mid)] to-[var(--background)] px-6 py-20 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(45,62,158,0.35),transparent)]" />
          <div className="relative mx-auto max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-sky-400">
              <Sparkles size={12} /> Help Center
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              How can we help you?
            </h1>
            <p className="mb-8 text-base leading-relaxed text-white/60">
              Search our knowledge base, browse FAQs, or reach out to our support team directly.
            </p>
            <div className="relative mx-auto max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="text"
                placeholder="Search articles, guides, and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-sky-500/50 focus:bg-white/8 focus:ring-1 focus:ring-sky-500/30"
              />
            </div>
          </div>
        </section>
      </Reveal>

      <div className="mx-auto max-w-6xl px-6 py-16 space-y-20">

        {/* Quick Links */}
        <Reveal>
          <section>
            <h2 className="mb-6 text-lg font-semibold text-white/80">Popular Resources</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_LINKS.map((link, i) => (
                <motion.a
                  key={link.title}
                  href={link.href}
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="group flex flex-col gap-3 rounded-xl border border-white/8 bg-white/3 p-5 transition-all duration-200 hover:border-sky-500/30 hover:bg-white/6"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 transition-colors group-hover:bg-sky-500/20">
                    <link.icon size={18} />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-white">
                      {link.title}
                      <ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-60" />
                    </div>
                    <p className="text-xs leading-relaxed text-white/50">{link.description}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </section>
        </Reveal>

        {/* FAQ Section */}
        <Reveal>
          <section>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
                <p className="mt-1 text-sm text-white/50">Browse answers to the most common questions.</p>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
              {displayCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                    activeCategory === cat.id
                      ? "bg-sky-500 text-white shadow-[0_0_12px_rgba(14,165,233,0.35)]"
                      : "border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-14 animate-pulse rounded-xl border border-white/5 bg-white/3" />
                ))}
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="rounded-xl border border-white/8 bg-white/3 py-16 text-center">
                <AlertCircle className="mx-auto mb-3 text-white/20" size={32} />
                <p className="text-sm text-white/40">
                  {searchQuery ? `No results for "${searchQuery}"` : "No FAQs in this category yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFaqs.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-white/8 bg-white/3 transition-colors duration-200 hover:border-white/12"
                  >
                    <button
                      onClick={() => setOpenFaqId(openFaqId === item.id ? null : item.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-medium text-white/90">{item.question}</span>
                      <motion.div
                        animate={{ rotate: openFaqId === item.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0 text-white/40"
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaqId === item.id && (
                        <motion.div
                          key="answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/5 px-5 py-4 text-sm leading-relaxed text-white/55">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </section>
        </Reveal>

        {/* Support Channels */}
        <Reveal>
          <section>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Contact Support</h2>
            <p className="mb-8 text-sm text-white/50">Choose the channel that works best for you.</p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {SUPPORT_CHANNELS.map((channel) => (
                <motion.div
                  key={channel.title}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className={`relative flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 ${
                    channel.available
                      ? "border-white/10 bg-white/4 hover:border-sky-500/25 hover:bg-white/6"
                      : "border-white/5 bg-white/2 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                      <channel.icon size={20} />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${channel.badgeColor}`}>
                      {channel.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-semibold text-white">{channel.title}</h3>
                    <p className="text-xs leading-relaxed text-white/50">{channel.description}</p>
                  </div>
                  <button
                    disabled={!channel.available}
                    className={`mt-auto flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      channel.available
                        ? "bg-sky-500/15 text-sky-400 hover:bg-sky-500/25"
                        : "cursor-not-allowed bg-white/5 text-white/30"
                    }`}
                  >
                    {channel.cta}
                    {channel.available && <ArrowRight size={14} />}
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* System Status */}
        <Reveal>
          <section className="rounded-2xl border border-white/8 bg-white/3 p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">System Status</h2>
                <p className="mt-0.5 text-xs text-white/40">Current operational status of all services.</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Mostly Operational
              </span>
            </div>
            <div className="space-y-3">
              {STATUS_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.status === "operational" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <span className="text-sm text-white/80">{item.label}</span>
                  </div>
                  <span
                    className={`text-xs font-medium capitalize ${
                      item.status === "operational" ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-white/30">
              <Clock size={12} />
              Last checked just now. Full history at status.analytixpro.com
            </div>
          </section>
        </Reveal>

        {/* CTA Banner */}
        <Reveal>
          <section className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-violet-500/10 px-8 py-12 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(14,165,233,0.08),transparent)]" />
            <div className="relative">
              <h2 className="mb-3 text-2xl font-bold tracking-tight text-white">Still need help?</h2>
              <p className="mb-6 text-sm text-white/55">
                Our team is available Monday through Friday, 9 AM to 6 PM EST. We typically respond within one business day.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-200 hover:bg-sky-400"
                >
                  Open a Support Ticket
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 transition-all duration-200 hover:bg-white/10"
                >
                  Browse Documentation
                </motion.button>
              </div>
            </div>
          </section>
        </Reveal>

      </div>
    </main>
  );
}