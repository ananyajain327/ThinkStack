# ThinkStack Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/). Types used: Added / Changed / Fixed / Removed / Security.

## [Unreleased]

### Added
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
