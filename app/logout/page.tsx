"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, AlertTriangle, CheckCircle, ArrowLeft, Shield, Clock } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export default function LogoutPage() {
  const t = useTranslations();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (status === "success") {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, router]);

  const handleLogout = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
      } else {
        setStatus("success");
        setCountdown(5);
      }
    } catch {
      setStatus("error");
      setErrorMsg(t("logout.errorGeneric"));
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center justify-center px-4 py-16">
      <Reveal className="w-full max-w-md">
        {status === "success" ? (
          <div className="bg-white rounded-lg border border-[var(--color-outline-variant)] shadow-[0_2px_8px_rgba(46,58,140,0.06)] p-10 text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-[#10b981]/10 mx-auto mb-6"
            >
              <CheckCircle className="w-8 h-8 text-[#10b981]" />
            </motion.div>
            <h1 className="text-2xl font-semibold text-[var(--color-on-surface)] tracking-tight mb-2">
              {t("logout.successTitle")}
            </h1>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-6 leading-relaxed">
              {t("logout.successDesc")}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-on-surface-variant)] mb-8">
              <Clock className="w-4 h-4" />
              <span>
                {t("logout.redirecting")} <span className="font-semibold text-[var(--color-primary)]">{countdown}s</span>
              </span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-container)] transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("logout.goHome")}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[var(--color-outline-variant)] shadow-[0_2px_8px_rgba(46,58,140,0.06)] overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-10 pb-6 text-center border-b border-[var(--color-outline-variant)]">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 mx-auto mb-5"
              >
                <LogOut className="w-7 h-7 text-[var(--color-primary)]" />
              </motion.div>
              <h1 className="text-2xl font-semibold text-[var(--color-on-surface)] tracking-tight mb-1">
                {t("logout.title")}
              </h1>
              <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                {t("logout.subtitle")}
              </p>
            </div>

            {/* Security notice */}
            <div className="px-8 py-5 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)]">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[var(--color-on-surface)] uppercase tracking-wider mb-1">
                    {t("logout.securityNote")}
                  </p>
                  <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                    {t("logout.securityDesc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Session info */}
            <div className="px-8 py-5 border-b border-[var(--color-outline-variant)]">
              <p className="text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-3">
                {t("logout.currentSession")}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-on-surface-variant)]">{t("logout.sessionPlatform")}</span>
                  <span className="font-medium text-[var(--color-on-surface)]">Analytix Pro</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-on-surface-variant)]">{t("logout.sessionPlan")}</span>
                  <span className="font-medium text-[var(--color-on-surface)]">Enterprise</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-on-surface-variant)]">{t("logout.sessionStatus")}</span>
                  <span className="inline-flex items-center gap-1.5 text-[#10b981] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block" />
                    {t("logout.sessionActive")}
                  </span>
                </div>
              </div>
            </div>

            {/* Error state */}
            {status === "error" && (
              <div className="mx-8 mt-5 flex items-start gap-3 rounded bg-[var(--color-error-container)] border border-[var(--color-error)]/20 px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-[var(--color-error)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--color-on-error-container)]">
                  {errorMsg || t("logout.errorGeneric")}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="px-8 py-6 flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-container)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              >
                {status === "loading" ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {t("logout.signingOut")}
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    {t("logout.confirmButton")}
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-sm font-medium hover:bg-[var(--color-surface-container-low)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("logout.cancelButton")}
              </motion.button>
            </div>

            {/* Footer note */}
            <div className="px-8 pb-6 text-center">
              <p className="text-xs text-[var(--color-on-surface-variant)]">
                {t("logout.footerNote")}{" "}
                <Link href="/settings" className="text-[var(--color-primary)] hover:underline font-medium">
                  {t("logout.footerLink")}
                </Link>
              </p>
            </div>
          </div>
        )}
      </Reveal>
    </div>
  );
}