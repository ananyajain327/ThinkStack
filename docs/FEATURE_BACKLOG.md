# ThinkStack Feature Backlog

Status: `done` · `in progress` · `todo` · `deferred`

> Ranking scale used across the backlog: **P0** = must-have for MVP, **P1** = core value, **P2** = high value, **P9** = future / stretch.

## Foundation (P0) — `done`
| Feature | Status | Notes |
| --- | --- | --- |
| Project skeleton (Spring Boot API) | done | Boots, `/api/v1/health` returns 200 |
| PostgreSQL schema via Flyway V1–V6 | done | 20 tables, seeded, validated on boot |
| JPA entity layer (UUID PKs) | done | 20 entities, `gen_random_uuid()` |
| Repository layer | done | UUID-based, all entities |
| Seed data | done | 6 categories, 24 spec defs, 10 products, 120 product-specs, 20 prices, 32 price-history, 22 reviews, 2 wizards, 21 questions |
| Backend compile + boot + test | done | `mvn test` green |

## Authentication (P0) — `done`
| Feature | Status | Notes |
| --- | --- | --- |
| JWT auth (register/login/refresh) | done | Access+refresh tokens, HS256, env-driven secret/expiry |
| User roles (USER/PREMIUM/ADMIN) + BCrypt | done | Roles stored on user; ADMIN-gated routes scaffolded |
| JWT filter + SecurityConfig wiring | done | Stateless chain, 401 entry point |
| `/api/v1/auth/*` endpoints | done | register, login, refresh, me |

## Catalog & Pricing (P1) — `todo`
- Product browse/filter/sort endpoints
- Specification value endpoints (dynamic)
- Price endpoint (current + by-seller) + price-history endpoint
- Reviews CRUD with transparency fields

## Decision Engine (P1) — `todo`
- Wizard: GET questions, POST answers → recommendation input
- Recommendation engine + explainability (why-this / why-not)
- Budget Guard + category logic + comparison endpoints
- Decision session + DNA + journal persistence

## Personalization (P2) — `todo`
- Dashboard feed, bookmarks, notifications/price-alerts
- User preferences + decision DNA endpoints
- Bookmars/journal/dna read+write endpoints

## Frontend (P2) — `todo`
- Next.js shell, landing, auth screens
- Wizard UI, results/explainability UI, product detail, comparison
