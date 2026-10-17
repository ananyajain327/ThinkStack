
# 📋 ThinkStack Feature Backlog & Epics

## Epic 1: Decision Intelligence & Explainable AI Engine
- **TS-EPIC-1.1: Multi-Attribute Utility Theory (MAUT) Scoring Engine**
  - Implement mathematical weight matrix based on user priorities.
  - Normalize specifications across varying scales (GHz, GB, Wh, Nits).
  - Categorize matches into *Within Budget*, *Best Value*, *Slight Stretch*, *Not Recommended*.
- **TS-EPIC-1.2: Explainability Generation**
  - Synthesize plain-language justifications (*"Why this product?"*).
  - Explicit differential reasons against competitor alternatives (*"Why Product B ranked lower"*).
  - Transparent trade-off alerts (e.g. Battery vs Performance).
- **TS-EPIC-1.3: Scoring Transparency Audit**
  - Expose interactive formula breakdowns with sub-scores: Budget, Performance, Battery, Portability, Value, Sentiment.

## Epic 2: Adaptive ThinkStack Wizard
- **TS-EPIC-2.1: Category-Adaptive Question Flow**
  - Dynamically load tailored questions (Laptops, Phones, Cars, Colleges).
  - Support multi-step navigation with backward/forward state persistence.
- **TS-EPIC-2.2: Beginner-Friendly Technical Translation**
  - Contextual helper cards and tooltips translating technical specs into real-world utility.
- **TS-EPIC-2.3: Decision Session State Machine**
  - State transitions: `DRAFT` → `IN_PROGRESS` → `COMPLETED` → `PURCHASED` → `ARCHIVED`.

## Epic 3: Direct Product Comparison
- **TS-EPIC-3.1: Side-by-Side Comparison Matrix**
  - Compare up to 4 items simultaneously with frozen header and spec categories.
  - Automatic spec diff highlighting (winner tag on RAM, Battery, Display, Weight).
- **TS-EPIC-3.2: Plain-English Spec Difference Translator**
  - E.g. *"16GB vs 8GB: allows running Docker, compiling code, and multitasking smoothly without lag."*

## Epic 4: Price Intelligence & Multi-Seller Tracking
- **TS-EPIC-4.1: Multi-Seller Live Offer Aggregation**
  - Compare Amazon, Flipkart, Croma, Reliance Digital with seller rating and stock status.
- **TS-EPIC-4.2: Historical Price Trends**
  - 90-day price tracking chart with highest, lowest, and average benchmarks.
- **TS-EPIC-4.3: Price Drop Detection & Alerts**
  - Trigger in-app notifications when price drops below user-specified threshold.

## Epic 5: Review Intelligence & Source Credibility
- **TS-EPIC-5.1: Multi-Source Review Synthesizer**
  - Aggregate Expert (The Verge, NotebookCheck, Jarrod's Tech) and Verified User reviews.
  - Extract consensus pros, consensus cons, and long-term durability caveats.
- **TS-EPIC-5.2: Verification Badges & Freshness Timestamps**
  - Display verified source links and last-checked freshness badges.

## Epic 6: User Personalization, Decision Journal & Decision DNA
- **TS-EPIC-6.1: Unified User Dashboard**
  - Command center tracking active decisions, bookmarks, price alerts, and history.
- **TS-EPIC-6.2: Post-Purchase Decision Journal**
  - Reflect on purchase satisfaction, recommendation accuracy, and lessons learned.
- **TS-EPIC-6.3: Long-term Decision DNA**
  - Model user product preferences over time (Value-seeker, Battery-first, Power-user) without inferring private attributes.

## Epic 7: Security & Enterprise Quality
- **TS-EPIC-7.1: JWT Security & Role-Based Authorization**
  - BCrypt password hashing, stateless JWT filter, protected routes.
- **TS-EPIC-7.2: Database Integrity & PostgreSQL Schema**
  - Full relational normalization, foreign keys, indexes, and transactional boundaries.