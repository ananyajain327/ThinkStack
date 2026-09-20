# ThinkStack — Development Tracker

> Status legend: `[x] done` · `[~] in progress` · `[ ] not started`

Also see [ROADMAP](ROADMAP.md), [CHANGELOG](CHANGELOG.md), [FEATURE_BACKLOG](FEATURE_BACKLOG.md), [API_SPEC](API_SPEC.md), [DATABASE_SCHEMA](DATABASE_SCHEMA.md).

## Current Milestone — Phase 1 Backend (in progress)
- [x] **Repository consolidation** (backend removed from home, moved to repo root, `.gitignore` fixed)
- [x] **Maven + build** — backend compiles, `mvn test` green
- [x] **Database schema** — Flyway V1–V6 applied to Postgres, JPA validates, app boots
- [x] **Seed data** — categories (6), spec defs (24), products (10), product specs (120), prices (20), price history (32), reviews (22), wizards (2), wizard questions (21), all verified in DB
- [x] **Auth (P0–P1)** — register, login, JWT, roles, user/current-profile
- [x] **API baseline — catalog** — products, categories, specs, prices, reviews, wizard
- [x] **Decision engine** — sessions, adaptive answers, ranked recommendations + explainability, alternatives shortlist
- [ ] Comparison endpoints (side-by-side in a session)
- [ ] Explainability payloads iteration (per-dimension notes per product)
- [ ] Price history + price alerts + notifications
- [ ] Bookmarks, journal, decision DNA
- [ ] Backend service/controller layer completeness

## Phase 2 Frontend  (`[ ]` not started)
- [ ] Next.js scaffold (App Router, TypeScript, Tailwind)
- [ ] Landing + pricing page
- [ ] Auth screens (login/signup)
- [ ] Wizard UI (dynamic, adaptive)
- [ ] Results + explainability UI
- [ ] Product detail / comparison / prices / reviews
- [ ] Dashboard, journal, bookmarks, preferences

## Phase 3 Polish
- [ ] PrismDD tests (decision validity), linting on CI
- [ ] Price charts (Recharts)
- [ ] Notifications (price-drop)
- [ ] AI summarization (only where it adds trust, never fabricates)
- [ ] Deployment prep (containerized backend, Nginx/Next SSG, env secrets)

## Done (Phase 0 & foundation)
- [x] DB schema + seed baseline (Flyway V1–V6), entities, repositories
- [x] Docs baseline (README, ROADMAP, TODO tracker, schema doc, API stub)
