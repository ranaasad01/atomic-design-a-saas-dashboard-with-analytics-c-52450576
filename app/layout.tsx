import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LocaleProvider from "@/components/LocaleProvider";
import LanguageToggle from "@/components/LanguageToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  formatDetection: { telephone: false, date: false, email: false, address: false },
  title: "Analytix Pro — Kinetic Enterprise Dashboard",
  description: "A powerful SaaS analytics dashboard for data-driven teams. Monitor KPIs, manage reports, and collaborate with your team.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Analytix Pro — Kinetic Enterprise Dashboard",
    description: "Monitor KPIs, manage reports, and collaborate with your team.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[var(--color-background)] text-[var(--color-on-surface)] antialiased">
        <LocaleProvider>
          <LanguageToggle />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}