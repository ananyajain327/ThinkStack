# ThinkStack Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/). Types used: Added / Changed / Fixed / Removed / Security.

## [Unreleased]

### Added
- **Bookmarks, journal + decision DNA (Phase 3d)**:
  - Bookmark products or decision sessions (dedupe + ownership enforced)
  - Post-purchase journal: create/list/update/delete with outcome + satisfaction
  - Decision DNA: persisted per-user factors derived from completed sessions'
    priority weights (relative 0-100) and journal satisfaction ratings;
    recomputed on journal writes and via `POST /dna/refresh`
  - Fixed `decision_journal.updated_at` NOT NULL violation by adding `@UpdateTimestamp`
- **Price alerts + notifications (Phase 3c)**:
  - `price_alerts` table (V7), entity + repository
  - CRUD + toggle for user price alerts; `status` reflects trigger vs current best price
  - `POST /price-alerts/check` evaluates active alerts against the cheapest live seller
    price and emits `PRICE_ALERT` notifications (idempotent per alert)
  - Notification endpoints: list (all/unread), unread-count, mark-read, read-all, delete
- **Comparison endpoints (Phase 3b)**:
  - Side-by-side comparison of a session's ranked recommendations (`/compare`)
    or shortlist (`/compare/alternatives`)
  - Union of category spec rows (ordered by display order) with rendered
    `displayValue` per product column; sellers included per column
  - Falls back to the shortlist when no recommendations have been generated yet
- **Decision Engine (Phase 3)**:
  - Authenticated decision sessions: start (by wizard or category), list, get
  - Adaptive wizard answers: per-question upsert, requirement profile + priority weights persisted
  - Ranked recommendations with explainability: `overallScore`, `confidenceRating`,
    `budgetCategory`, `valueScore`, `featureMatch`, `performanceMatch`, `reviewSentiment`,
    score breakdown, advantages/disadvantages/dealBreakers/tradeOffs
  - Scoring engine: weighted (feature/value/sentiment/performance) from wizard question
    weights shifted by user importance answers; dimension scores computed from live specs
  - Shortlist endpoints: add/remove decision alternatives
  - Ownership enforcement: sessions are private to the authenticated user (cross-user → FORBIDDEN)
- **Catalog + Wizard APIs (Phase 2)**:
  - Read endpoints: categories (with spec definitions + product counts),
    products (list with category/price filtering + sorting, detail by slug),
    specifications (values merged with definitions, rendered `displayValue`),
    prices by seller, price history, reviews
  - Wizard endpoints: all wizards with ordered questions, wizard by category slug
  - Response DTOs as Java records; `bestPrice` from cheapest in-stock seller
  - Public accessibility for catalog endpoints in the security chain
- **Authentication (Phase 2 milestone)**:
  - JWT access + refresh tokens (jjwt 0.12.6, HS256, secret/expiry from env)
  - BCrypt password hashing, `AuthService` + `AuthController`
  - Register (duplicate email/username → 400), login by email or username,
    token refresh, `/auth/me`
  - JWT filter + stateless security chain (401 for protected endpoints without a valid token)
  - `ThinkStackUserDetails` principal + `SecurityUtils` current-user helpers
  - Auth 401 mapping for bad credentials in GlobalExceptionHandler (was 500)
- Repo+tooling baseline: root README, root+backend `.gitignore`, `.env.example`,
  `docker-compose.yml`, Maven wrapper (mvn 3.9.16), docs skeleton (schema, API spec placeholder, roadmap, feature backlog, TODO tracker, changelog).
- Backend infrastructure: Spring Boot 3.3.5 app, `application.yml` + dev/prod profiles,
  health/readiness controller, global exception handling, `ApiResponse` envelope, CORS config,
  security config skeleton (JWT planned), Flyway migrations V1–V6.
- Full schema (20 tables) + realistic seed data.
- JPA entity + repository layers for all schema objects (UUID primary keys).

### Security
- Configuration made env-driven; no credentials committed.
- Modeled `notifications`, `bookmarks`, `price_alerts`, `user_preferences` with user ownership (to be enforced via API-level auth in the frontend/backend controllers).

### Removed / corrected
- Removed obsolete entities/repositories that did not match migrations
  (`Decision`, `Review`, `ProductComparison`, `ComparisonItem`, and their repos).

## [0.1.0] - 2026-09
- Initial repo baseline and foundation (see Added above).
