# Feature Todo List

This document tracks planned features and improvements for TCG Master Guide.

## High Priority

## Medium Priority

- [ ] **Internationalization (i18n)** - Multi-language support using `next-intl`. See [architecture doc](docs/architecture/internationalization.md) for full design. Phases: 1) Install & configure next-intl + routing, 2) Extract ~300 hardcoded strings, 3) Restructure routes to `[locale]`, 4) Add Japanese translations, 5) Translate content

## Low Priority / Nice to Have

- [ ] **Card Database Integration** - Link card names to images/details from Pokemon TCG API
- [ ] **Preview environment** - easy testing

## Technical Improvements

- [ ] **Performance Monitoring** - Add more detailed Application Insights tracking
- [ ] **E2E Tests** - Add Playwright or Cypress tests
- [ ] **Unit Tests** - Add unit tests
- [ ] **Accessibility Audit** - Ensure WCAG 2.1 AA compliance
- [ ] **SEO Improvements** - Add structured data (JSON-LD) for deck guides
- [ ] **Database connection pooling** - Pool database connections
