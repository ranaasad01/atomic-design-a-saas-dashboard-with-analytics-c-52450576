# AGENTS.md

Project conventions for AI agents and humans editing this codebase.

## Original request
Design a SaaS dashboard with analytics charts

## Goal
Build a full Kinetic Enterprise / Analytix Pro SaaS analytics dashboard with dark-navy sidebar, KPI cards, Recharts charts, data tables, reports management, settings, and team management across 5 pages.

## Project type
dashboard

## Design system — match this exactly
- Color tokens: `--color-primary: #142175`, `--color-primary-container: #2e3a8c`, `--color-on-primary: #ffffff`, `--color-accent: #0ea5e9`, `--color-accent-hover: #0284c7`, `--color-background: #f7f9fb`, `--color-muted: #64748b`, `--background: #f7f9fb`, `--foreground: #191c1e`, `--card: #ffffff`, `--border: #e2e8f0`, `--muted-foreground: #64748b`
- Fonts: Inter

## Existing components — reuse these, don't create near-duplicates
- Footer (components/Footer.tsx)
- LanguageToggle (components/LanguageToggle.tsx)
- LocaleProvider (components/LocaleProvider.tsx)
- Navbar (components/Navbar.tsx)

## Existing i18n namespaces
Every translation key must be namespaced (`hero.title`, never a bare `title`) so two components never collide on the same catalog slot. Reuse one of these, or pick a new, distinct name:
`analytics`, `help`, `logout`, `nav`, `overview`, `reports`, `settings`, `team`, `topBar`

When editing or adding pages: preserve the design system above, reuse existing components and the shared nav data file, and keep the established structure and tone.
