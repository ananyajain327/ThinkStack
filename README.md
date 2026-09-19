# ThinkStack

> **Think Better. Choose Smarter.**

ThinkStack is a modern AI-assisted **Decision Intelligence and Product Comparison** platform. It doesn't just find what's best — it finds what's best *for you*, and explains **why**.

ThinkStack guides a user from confusion to confidence: it understands their needs through a dynamic wizard, respects their budget, compares products, and produces **transparent, explainable recommendations**.

## Why ThinkStack?

First-time buyers usually don't know:

- what specifications matter
- which products to compare
- what fits their budget
- which features are actually important
- whether a product is worth its price
- what other users experienced
- where the product is available

ThinkStack solves all of this in one place — no juggling multiple comparison websites.

## Core Modules

| Module | What it does |
| --- | --- |
| **ThinkStack Wizard** | Dynamic, adaptive questions. Never shows every question to every user — questions adapt to category, budget, and previous answers. |
| **Decision Engine** | Produces personalized, ranked recommendations for each decision session. |
| **Explainability** | Every recommendation explains *why it was chosen* and *why alternatives scored lower*. |
| **Budget Guard** | Budget is mandatory. Products are categorized as within budget, slightly above, premium alternative, exceptional value, poor value, or not suitable. |
| **Comparison** | Side-by-side comparison with meaningful differences highlighted. |
| **Price & Sellers** | Multi-seller price comparison, price history charts, price-drop detection (data layer isolated so real providers can be plugged in later). |
| **Reviews** | User, expert and editorial reviews with source transparency. |
| **Dashboard** | Recent decisions, bookmarks, price alerts, insights. |
| **Decision Journal** | Post-purchase reflection that feeds personalization. |
| **Decision DNA** | Product-decision preference profile. Never infers sensitive attributes. |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js · React · TypeScript · Tailwind CSS |
| Backend | Java · Spring Boot · Spring Web · Spring Data JPA · Hibernate |
| Security | Spring Security · JWT · BCrypt |
| Database | PostgreSQL · Flyway migrations |
| Tooling | Maven · Git & GitHub · IntelliJ IDEA / VS Code |

## Repository Layout

```
├── backend/                  # Spring Boot REST API
│   └── src/main/java/com/thinkstack/
│       ├── config/           # Security, CORS configuration
│       ├── controller/       # REST controllers
│       ├── dto/              # Request/response DTOs
│       ├── entity/           # JPA entities
│       ├── exception/        # Global exception handling
│       ├── repository/       # Spring Data repositories
│       └── service/          # Business logic
│   └── src/main/resources/
│       ├── db/migration/     # Flyway SQL migrations + seed data
│       └── application.yml   # Environment-driven configuration
├── docs/                     # Product & engineering documentation
├── frontend/                 # Next.js application (in progress)
├── .env.example              # Environment variable template
└── docker-compose.yml        # Local PostgreSQL
```

## Getting Started

### Prerequisites

- JDK 21+ (tested with Temurin 25)
- Maven 3.9+ (or use `mvnw.cmd`)
- Node.js 20+ and npm (for the frontend)
- PostgreSQL 16+ (Docker `docker-compose up -d` or a local install)

### 1. Database

```bash
docker-compose up -d            # Postgres via Docker
# or use your local PostgreSQL and create:
#   role: thinkstack  password: (see .env.example)
#   databases: thinkstack, thinkstack_test
cp .env.example .env            # then edit values to match your machine
```

### 2. Backend

```bash
cd backend
mvn spring-boot:run              # or: mvnw.cmd spring-boot:run
```

Flyway creates the schema and loads realistic mock seed data automatically.
Health check: `http://localhost:8080/api/v1/health`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                     # http://localhost:3000
```

## Configuration

Secrets are never hardcoded. The backend reads **environment variables** with dev-friendly fallbacks:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `localhost` / `5432` / `thinkstack` | PostgreSQL connection |
| `DB_USERNAME` / `DB_PASSWORD` | `thinkstack` / dev default | Database credentials |
| `JWT_SECRET` | dev placeholder | JWT signing secret |
| `JWT_EXPIRATION_MS` | `86400000` | Token lifetime |
| `SERVER_PORT` | `8080` | API port |

> **Never commit a real `.env` file or real secrets.**

## Development Status

See [docs/TODO.md](docs/TODO.md) and [docs/ROADMAP.md](docs/ROADMAP.md) for progress.
See [docs/CHANGELOG.md](docs/CHANGELOG.md) for the change history.

## Documentation

- [Project Scope](docs/PROJECT_SCOPE.md)
- [Product Vision](docs/PRODUCT_VISION.md)
- [Product Principles](docs/PRODUCT_PRINCIPLES.md)
- [User Flow](docs/USER_FLOW.md)
- [User Stories](docs/USER_STORIES.md)
- [Feature Backlog](docs/FEATURE_BACKLOG.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Specification](docs/API_SPEC.md)
- [Roadmap](docs/ROADMAP.md)

---

*ThinkStack never recommends a product without explaining WHY.*