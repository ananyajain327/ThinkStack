# ThinkStack — Development Tracker

> Status legend: `[x] done` · `[~] in progress` · `[ ] not started`

Also see [ROADMAP](ROADMAP.md), [CHANGELOG](CHANGELOG.md), [FEATURE_BACKLOG](FEATURE_BACKLOG.md), [API_SPEC](API_SPEC.md), [DATABASE_SCHEMA](DATABASE_SCHEMA.md).

## Phase 1 — Backend (complete)
- [x] **Repository consolidation** (backend at repo root, `.gitignore` fixed)
- [x] **Maven + build** — backend compiles (`mvn compile` green)
- [x] **Database schema** — Flyway V1–V7 (users/prefs, catalog, wizard+decisions, commerce, user data, seed, price alerts)
- [x] **Seed data** — categories (6), spec defs (24), products (10), product specs (120), prices (20), price history (32), reviews (22), wizards (2), wizard questions (21)
- [x] **Auth (P0–P1)** — register, login, JWT (access + refresh), roles, user/current-profile
- [x] **API baseline — catalog** — products, categories, specs, prices, reviews, price history, wizard
- [x] **Decision engine** — sessions, adaptive answers, ranked recommendations + explainability, alternatives shortlist
- [x] **Comparison endpoints** — side-by-side specs/prices for recommendations or shortlist
- [x] **Explainability payloads** — per-dimension `score`/`importance`/`detail`/`verdict` notes
- [x] **Price alerts + notifications** — price-alert CRUD/`check` (price-drop detection), notification list/read/read-all/delete
- [x] **Bookmarks, journal, decision DNA** — bookmark products/sessions, journal CRUD, DNA refresh + persist
- [x] **User preferences endpoint** — `GET/PUT /api/v1/me/preferences`
- [x] **Dashboard feed** — `GET /api/v1/feed` (sessions + price alerts + notifications, newest-first)

## Phase 2 — Frontend (complete)
- [x] Vite + React + TypeScript + Tailwind v4 scaffold
- [x] Typed axios API client with JWT refresh interceptor (`src/api/client.ts`, `src/api/types.ts`)
- [x] Auth context + screens (login / register) with correct DTO shapes
- [x] Landing page
- [x] Dashboard (new-decision flow, categories, personalized feed)
- [x] Wizard UI (dynamic, adaptive)
- [x] Results + explainability UI (recommendations, per-dimension reasoning)
- [x] Side-by-side comparison page
- [x] Decision detail page
- [x] Product catalog browse + detail (specs / prices / price-history chart / reviews)
- [x] Notifications center (filter, mark read/all, delete)
- [x] Profile (preferences + Decision DNA), Bookmarks, Decision Journal

## Phase 3 — Polish & Ops
- [x] Price charts (Recharts) on product detail
- [x] Containerized backend (Dockerfile) + frontend (Dockerfile + nginx) + `docker-compose.yml`
- [x] Decision-engine unit tests (`RecommendationEngineTest`, 12 decision-validity tests, DB-free)
- [~] CI lint workflow — `.github/workflows/ci.yml` authored locally (frontend `tsc`/`oxlint`/build, backend `mvn compile` + engine unit tests); **not yet pushed** because the current GitHub token lacks `workflow` scope
- [x] AI summarization — provider-agnostic `AiService`; optional OpenAI-backed (`ai.enabled=true` + `AI_API_KEY`) with fabrication-safe prompt, deterministic local fallback summariser; `GET /decisions/{id}/summary` + frontend "Summarize" card
- [x] End-to-end smoke test — `scripts/smoke-test.sh` (brings up docker-compose, runs register→login→session→answers→recommendations→summary→price-history); needs Docker to execute

## Done (Phase 0 & foundation)
- [x] DB schema + seed baseline (Flyway V1–V7), entities, repositories
- [x] Docs baseline (README, ROADMAP, TODO tracker, schema doc, API spec)
