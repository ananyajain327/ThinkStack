# ThinkStack Database Schema

## 1. Database Overview

ThinkStack uses PostgreSQL as its primary relational database.

The database is designed to support the complete ThinkStack decision-making lifecycle:

* User authentication
* User preferences
* Product and decision categories
* Products and alternatives
* Dynamic ThinkStack Wizard
* User answers
* Decision sessions
* Product comparisons
* Personalized recommendations
* Transparent recommendation scoring
* Product prices and price history
* Product reviews
* Product media
* Bookmarks
* Decision Journal
* Decision DNA
* Notifications

The schema is designed to be extensible so that ThinkStack can initially support products such as laptops and smartphones while eventually supporting cars, bikes, colleges, courses, jobs, travel, insurance, real estate and other decision domains.

---

# 2. Design Principles

## 2.1 Normalization

Data should be separated into logically independent tables to reduce duplication and maintain consistency.

## 2.2 Extensibility

The database should support new categories and product types without requiring major schema changes.

## 2.3 Personalization

User-specific information should be stored separately from general product information.

## 2.4 Explainability

Recommendation-related data must support transparent scoring and explanations.

## 2.5 Security

Passwords must never be stored in plain text.

## 2.6 Auditability

Important records should contain creation and update timestamps.

---

# 3. Entity Relationship Overview

```text
users
 │
 ├── user_preferences
 │
 ├── decision_sessions
 │      │
 │      ├── wizard_answers
 │      │
 │      ├── decision_alternatives
 │      │        │
 │      │        └── products
 │      │
 │      └── recommendations
 │
 ├── bookmarks
 │
 ├── decision_journal
 │
 ├── decision_dna
 │
 └── notifications


categories
 │
 ├── categories (parent-child)
 │
 ├── products
 │      │
 │      ├── product_specifications
 │      ├── product_prices
 │      ├── product_reviews
 │      ├── product_media
 │      └── price_history
 │
 └── wizard_questions
          │
          └── wizard_answers
```

---

# 4. users

## Purpose

Stores account and authentication information for ThinkStack users.

## Columns

| Column        | Data Type    | Constraints      | Description            |
| ------------- | ------------ | ---------------- | ---------------------- |
| id            | BIGSERIAL    | PRIMARY KEY      | Unique user identifier |
| name          | VARCHAR(100) | NOT NULL         | User's name            |
| email         | VARCHAR(255) | NOT NULL, UNIQUE | Login email            |
| password_hash | VARCHAR(255) | NOT NULL         | BCrypt hashed password |
| role          | VARCHAR(30)  | NOT NULL         | User role              |
| is_active     | BOOLEAN      | NOT NULL         | Account status         |
| created_at    | TIMESTAMP    | NOT NULL         | Account creation time  |
| updated_at    | TIMESTAMP    | NOT NULL         | Last update time       |

## Roles

* USER
* ADMIN
* SUPER_ADMIN

## Relationships

* One user → one user_preferences record
* One user → many decision_sessions
* One user → many bookmarks
* One user → many decision_journal records
* One user → one decision_dna record
* One user → many notifications

## Security

Passwords must be hashed using BCrypt before storage.

---

# 5. user_preferences

## Purpose

Stores general preferences that can improve the user's overall ThinkStack experience.

Decision-specific information such as a laptop budget should NOT be stored here because it can change for every decision.

## Columns

| Column             | Data Type   | Constraints                   | Description             |
| ------------------ | ----------- | ----------------------------- | ----------------------- |
| id                 | BIGSERIAL   | PRIMARY KEY                   | Preference identifier   |
| user_id            | BIGINT      | NOT NULL, UNIQUE, FOREIGN KEY | Owner user              |
| experience_level   | VARCHAR(30) | NOT NULL                      | General knowledge level |
| preferred_currency | VARCHAR(10) | NOT NULL                      | Preferred currency      |
| preferred_language | VARCHAR(10) | NOT NULL                      | Application language    |
| created_at         | TIMESTAMP   | NOT NULL                      | Creation time           |
| updated_at         | TIMESTAMP   | NOT NULL                      | Last update time        |

## Experience Levels

* BEGINNER
* INTERMEDIATE
* EXPERT

## Relationship

```text
users (1) -------- (1) user_preferences
```

---

# 6. categories

## Purpose

Stores categories and subcategories supported by ThinkStack.

## Columns

| Column      | Data Type    | Constraints       | Description              |
| ----------- | ------------ | ----------------- | ------------------------ |
| id          | BIGSERIAL    | PRIMARY KEY       | Category identifier      |
| name        | VARCHAR(100) | NOT NULL, UNIQUE  | Category name            |
| slug        | VARCHAR(120) | NOT NULL, UNIQUE  | URL-friendly name        |
| description | TEXT         | NULL              | Category description     |
| parent_id   | BIGINT       | NULL, FOREIGN KEY | Parent category          |
| icon        | VARCHAR(100) | NULL              | Frontend icon identifier |
| is_active   | BOOLEAN      | NOT NULL          | Category availability    |
| created_at  | TIMESTAMP    | NOT NULL          | Creation time            |
| updated_at  | TIMESTAMP    | NOT NULL          | Last update time         |

## Example Hierarchy

```text
Electronics
├── Laptop
├── Smartphone
├── Tablet
├── Camera
└── Headphones

Automotive
├── Car
└── Bike

Education
├── College
└── Course

Career
└── Job Offer
```

## Relationships

```text
categories (1) -------- (many) categories
categories (1) -------- (many) products
categories (1) -------- (many) wizard_questions
```

---

# 7. products

## Purpose

Stores the core identity and general information of products or decision alternatives.

## Columns

| Column            | Data Type    | Constraints           | Description             |
| ----------------- | ------------ | --------------------- | ----------------------- |
| id                | BIGSERIAL    | PRIMARY KEY           | Product identifier      |
| category_id       | BIGINT       | NOT NULL, FOREIGN KEY | Product category        |
| brand             | VARCHAR(100) | NOT NULL              | Product brand           |
| name              | VARCHAR(255) | NOT NULL              | Product name            |
| model_number      | VARCHAR(150) | NULL                  | Model or variant        |
| slug              | VARCHAR(300) | NOT NULL, UNIQUE      | URL-friendly identifier |
| description       | TEXT         | NULL                  | Detailed description    |
| short_description | VARCHAR(500) | NULL                  | Short summary           |
| product_type      | VARCHAR(100) | NULL                  | Product type            |
| release_date      | DATE         | NULL                  | Release date            |
| is_active         | BOOLEAN      | NOT NULL              | Availability status     |
| created_at        | TIMESTAMP    | NOT NULL              | Creation time           |
| updated_at        | TIMESTAMP    | NOT NULL              | Last update time        |

## Relationships

```text
categories (1) -------- (many) products
```

Each product belongs to one category.

Detailed specifications, prices, reviews and media are stored separately.

---

# 8. product_specifications

## Purpose

Stores detailed specifications separately from the core product record.

This allows different categories to have different specifications.

For example:

Laptop:

* RAM
* Processor
* Storage
* Battery
* Weight

Phone:

* Camera
* Battery
* Display
* Charging
* Processor

## Columns

| Column              | Data Type    | Constraints           | Description                          |
| ------------------- | ------------ | --------------------- | ------------------------------------ |
| id                  | BIGSERIAL    | PRIMARY KEY           | Specification identifier             |
| product_id          | BIGINT       | NOT NULL, FOREIGN KEY | Product                              |
| specification_name  | VARCHAR(150) | NOT NULL              | Name of specification                |
| specification_value | VARCHAR(500) | NOT NULL              | Specification value                  |
| specification_unit  | VARCHAR(50)  | NULL                  | Unit such as GB, kg, hours           |
| specification_group | VARCHAR(100) | NULL                  | Group such as Performance or Display |
| is_comparable       | BOOLEAN      | NOT NULL              | Whether used in comparison           |
| created_at          | TIMESTAMP    | NOT NULL              | Creation time                        |
| updated_at          | TIMESTAMP    | NOT NULL              | Last update time                     |

## Example

```text
product: MacBook Air M4

RAM        → 16 GB
Storage    → 512 GB
Processor  → Apple M4
Weight     → 1.24 kg
Battery    → 18 hours
```

## Relationship

```text
products (1) -------- (many) product_specifications
```

---

# 9. wizard_questions

## Purpose

Stores questions used by the ThinkStack Wizard.

Questions can be category-specific.

## Columns

| Column        | Data Type    | Constraints           | Description                         |
| ------------- | ------------ | --------------------- | ----------------------------------- |
| id            | BIGSERIAL    | PRIMARY KEY           | Question identifier                 |
| category_id   | BIGINT       | NOT NULL, FOREIGN KEY | Category for which question is used |
| question_text | VARCHAR(500) | NOT NULL              | Question shown to user              |
| description   | TEXT         | NULL                  | Additional explanation              |
| input_type    | VARCHAR(50)  | NOT NULL              | Input control type                  |
| options       | JSONB        | NULL                  | Available options                   |
| is_required   | BOOLEAN      | NOT NULL              | Whether answer is mandatory         |
| display_order | INTEGER      | NOT NULL              | Question order                      |
| is_active     | BOOLEAN      | NOT NULL              | Whether question is active          |
| created_at    | TIMESTAMP    | NOT NULL              | Creation time                       |
| updated_at    | TIMESTAMP    | NOT NULL              | Last update time                    |

## Input Types

Examples:

* TEXT
* NUMBER
* RANGE
* SINGLE_SELECT
* MULTI_SELECT
* BOOLEAN
* SLIDER

## Example

```text
Category: Laptop

Question:
What is your budget?

Input:
RANGE
```

## Relationship

```text
categories (1) -------- (many) wizard_questions
```

---

# 10. wizard_answers

## Purpose

Stores answers submitted by users during a decision session.

## Columns

| Column              | Data Type | Constraints           | Description          |
| ------------------- | --------- | --------------------- | -------------------- |
| id                  | BIGSERIAL | PRIMARY KEY           | Answer identifier    |
| decision_session_id | BIGINT    | NOT NULL, FOREIGN KEY | Related decision     |
| question_id         | BIGINT    | NOT NULL, FOREIGN KEY | Related question     |
| answer_value        | JSONB     | NOT NULL              | User's answer        |
| created_at          | TIMESTAMP | NOT NULL              | Answer creation time |
| updated_at          | TIMESTAMP | NOT NULL              | Last update time     |

## Why JSONB?

Different questions can have different answer types.

Examples:

```text
Budget:
80000

Purpose:
["PROGRAMMING", "COLLEGE"]

Battery Priority:
9
```

JSONB allows this flexibility without creating separate columns for every possible answer.

## Relationships

```text
decision_sessions (1) -------- (many) wizard_answers

wizard_questions (1) -------- (many) wizard_answers
```

---

# 11. decision_sessions

## Purpose

Represents one decision-making journey by a user.

Examples:

* Choosing a laptop
* Choosing a phone
* Choosing a car
* Comparing job offers

## Columns

| Column          | Data Type     | Constraints           | Description                              |
| --------------- | ------------- | --------------------- | ---------------------------------------- |
| id              | BIGSERIAL     | PRIMARY KEY           | Decision identifier                      |
| user_id         | BIGINT        | NOT NULL, FOREIGN KEY | User making decision                     |
| category_id     | BIGINT        | NOT NULL, FOREIGN KEY | Decision category                        |
| title           | VARCHAR(255)  | NOT NULL              | Decision title                           |
| status          | VARCHAR(30)   | NOT NULL              | Current decision status                  |
| budget_min      | NUMERIC(12,2) | NULL                  | Minimum budget                           |
| budget_max      | NUMERIC(12,2) | NULL                  | Maximum budget                           |
| knowledge_level | VARCHAR(30)   | NULL                  | User's knowledge level for this decision |
| created_at      | TIMESTAMP     | NOT NULL              | Decision creation time                   |
| updated_at      | TIMESTAMP     | NOT NULL              | Last update time                         |

## Status

* DRAFT
* IN_PROGRESS
* COMPLETED
* PURCHASED
* ARCHIVED

## Relationships

```text
users (1) -------- (many) decision_sessions

categories (1) -------- (many) decision_sessions

decision_sessions (1) -------- (many) wizard_answers

decision_sessions (1) -------- (many) decision_alternatives

decision_sessions (1) -------- (many) recommendations
```

---

# 12. decision_alternatives

## Purpose

Stores products being considered in a particular decision.

This creates the many-to-many relationship between decisions and products.

## Columns

| Column              | Data Type | Constraints           | Description                       |
| ------------------- | --------- | --------------------- | --------------------------------- |
| id                  | BIGSERIAL | PRIMARY KEY           | Alternative identifier            |
| decision_session_id | BIGINT    | NOT NULL, FOREIGN KEY | Decision                          |
| product_id          | BIGINT    | NOT NULL, FOREIGN KEY | Product                           |
| is_user_selected    | BOOLEAN   | NOT NULL              | Whether user manually selected it |
| is_system_selected  | BOOLEAN   | NOT NULL              | Whether ThinkStack selected it    |
| created_at          | TIMESTAMP | NOT NULL              | Creation time                     |

## Relationship

```text
decision_sessions (1) -------- (many) decision_alternatives

products (1) -------- (many) decision_alternatives
```

This allows:

```text
Decision
├── MacBook
├── Dell
├── Lenovo
└── HP
```

---

# 13. recommendations

## Purpose

Stores ThinkStack's personalized recommendation results.

## Columns

| Column              | Data Type    | Constraints           | Description                       |
| ------------------- | ------------ | --------------------- | --------------------------------- |
| id                  | BIGSERIAL    | PRIMARY KEY           | Recommendation identifier         |
| decision_session_id | BIGINT       | NOT NULL, FOREIGN KEY | Related decision                  |
| product_id          | BIGINT       | NOT NULL, FOREIGN KEY | Recommended product               |
| overall_score       | NUMERIC(5,2) | NOT NULL              | Overall compatibility score       |
| confidence_score    | NUMERIC(5,2) | NOT NULL              | Confidence in recommendation      |
| rank_position       | INTEGER      | NOT NULL              | Product ranking                   |
| explanation         | TEXT         | NULL                  | Human-readable explanation        |
| why_recommended     | JSONB        | NULL                  | Reasons supporting recommendation |
| why_not_others      | JSONB        | NULL                  | Reasons alternatives scored lower |
| trade_offs          | JSONB        | NULL                  | Recommendation trade-offs         |
| score_breakdown     | JSONB        | NULL                  | Transparent score calculation     |
| created_at          | TIMESTAMP    | NOT NULL              | Recommendation creation time      |

## Example Score Breakdown

```json
{
  "budget": 92,
  "battery": 98,
  "performance": 95,
  "portability": 96,
  "gaming": 70
}
```

## Relationships

```text
decision_sessions (1) -------- (many) recommendations

products (1) -------- (many) recommendations
```

---

# 14. product_prices

## Purpose

Stores current product offers from different sellers or shopping platforms.

## Columns

| Column               | Data Type     | Constraints           | Description                  |
| -------------------- | ------------- | --------------------- | ---------------------------- |
| id                   | BIGSERIAL     | PRIMARY KEY           | Price record identifier      |
| product_id           | BIGINT        | NOT NULL, FOREIGN KEY | Product                      |
| seller_name          | VARCHAR(150)  | NOT NULL              | Seller or shopping platform  |
| seller_url           | TEXT          | NOT NULL              | Purchase URL                 |
| price                | NUMERIC(12,2) | NOT NULL              | Current selling price        |
| original_price       | NUMERIC(12,2) | NULL                  | Original/list price          |
| currency             | VARCHAR(10)   | NOT NULL              | Currency                     |
| discount_percentage  | NUMERIC(5,2)  | NULL                  | Discount                     |
| availability         | VARCHAR(50)   | NULL                  | Stock status                 |
| delivery_information | VARCHAR(255)  | NULL                  | Delivery estimate            |
| warranty_information | VARCHAR(500)  | NULL                  | Warranty information         |
| seller_rating        | NUMERIC(3,2)  | NULL                  | Seller rating                |
| last_checked_at      | TIMESTAMP     | NOT NULL              | Last price verification time |
| created_at           | TIMESTAMP     | NOT NULL              | Record creation time         |
| updated_at           | TIMESTAMP     | NOT NULL              | Record update time           |

## Example

```text
Amazon          ₹89,999
Flipkart        ₹88,499
Croma           ₹90,000
Reliance Digital ₹89,490
```

## Relationships

```text
products (1) -------- (many) product_prices
```

---

# 15. product_reviews

## Purpose

Stores review information and review summaries associated with products.

ThinkStack should focus on transparent review insights rather than blindly displaying a single rating.

## Columns

| Column      | Data Type    | Constraints           | Description                        |
| ----------- | ------------ | --------------------- | ---------------------------------- |
| id          | BIGSERIAL    | PRIMARY KEY           | Review identifier                  |
| product_id  | BIGINT       | NOT NULL, FOREIGN KEY | Product                            |
| source_name | VARCHAR(150) | NULL                  | Review source                      |
| source_url  | TEXT         | NULL                  | Source URL                         |
| rating      | NUMERIC(3,2) | NULL                  | Rating                             |
| title       | VARCHAR(255) | NULL                  | Review title                       |
| review_text | TEXT         | NULL                  | Review content or approved summary |
| review_type | VARCHAR(50)  | NULL                  | Type of review                     |
| is_verified | BOOLEAN      | NOT NULL              | Whether source/review is verified  |
| created_at  | TIMESTAMP    | NOT NULL              | Creation time                      |
| updated_at  | TIMESTAMP    | NOT NULL              | Last update time                   |

## Review Types

* EXPERT
* USER
* THINKSTACK
* EDITORIAL

## Transparency

ThinkStack should clearly identify the source of review information.

## Relationships

```text
products (1) -------- (many) product_reviews
```

---

# 16. product_media

## Purpose

Stores images, videos and other media associated with products.

## Columns

| Column        | Data Type    | Constraints           | Description            |
| ------------- | ------------ | --------------------- | ---------------------- |
| id            | BIGSERIAL    | PRIMARY KEY           | Media identifier       |
| product_id    | BIGINT       | NOT NULL, FOREIGN KEY | Product                |
| media_type    | VARCHAR(30)  | NOT NULL              | IMAGE, VIDEO, DOCUMENT |
| media_url     | TEXT         | NOT NULL              | Media location         |
| title         | VARCHAR(255) | NULL                  | Media title            |
| alt_text      | VARCHAR(500) | NULL                  | Accessibility text     |
| display_order | INTEGER      | NOT NULL              | Display order          |
| is_primary    | BOOLEAN      | NOT NULL              | Primary media          |
| created_at    | TIMESTAMP    | NOT NULL              | Creation time          |

## Relationships

```text
products (1) -------- (many) product_media
```

---

# 17. price_history

## Purpose

Stores historical price snapshots for products.

This supports:

* Price history charts
* Lowest price detection
* Price trend analysis
* Best time to buy
* Price alerts

## Columns

| Column      | Data Type     | Constraints           | Description             |
| ----------- | ------------- | --------------------- | ----------------------- |
| id          | BIGSERIAL     | PRIMARY KEY           | History identifier      |
| product_id  | BIGINT        | NOT NULL, FOREIGN KEY | Product                 |
| seller_name | VARCHAR(150)  | NOT NULL              | Seller                  |
| price       | NUMERIC(12,2) | NOT NULL              | Price at recorded time  |
| currency    | VARCHAR(10)   | NOT NULL              | Currency                |
| recorded_at | TIMESTAMP     | NOT NULL              | Time price was recorded |

## Relationships

```text
products (1) -------- (many) price_history
```

---

# 18. bookmarks

## Purpose

Stores products or decisions saved by users.

## Columns

| Column              | Data Type | Constraints           | Description            |
| ------------------- | --------- | --------------------- | ---------------------- |
| id                  | BIGSERIAL | PRIMARY KEY           | Bookmark identifier    |
| user_id             | BIGINT    | NOT NULL, FOREIGN KEY | User                   |
| product_id          | BIGINT    | NULL, FOREIGN KEY     | Saved product          |
| decision_session_id | BIGINT    | NULL, FOREIGN KEY     | Saved decision         |
| created_at          | TIMESTAMP | NOT NULL              | Bookmark creation time |

## Design Rule

At least one of `product_id` or `decision_session_id` must be present.

## Relationships

```text
users (1) -------- (many) bookmarks

products (1) -------- (many) bookmarks

decision_sessions (1) -------- (many) bookmarks
```

---

# 19. decision_journal

## Purpose

Stores post-decision feedback and user reflections.

This allows ThinkStack to understand whether a recommendation was actually useful after the purchase.

## Columns

| Column               | Data Type | Constraints                   | Description                                |
| -------------------- | --------- | ----------------------------- | ------------------------------------------ |
| id                   | BIGSERIAL | PRIMARY KEY                   | Journal identifier                         |
| user_id              | BIGINT    | NOT NULL, FOREIGN KEY         | User                                       |
| decision_session_id  | BIGINT    | NOT NULL, UNIQUE, FOREIGN KEY | Related decision                           |
| purchased_product_id | BIGINT    | NULL, FOREIGN KEY             | Product actually purchased                 |
| satisfaction_rating  | INTEGER   | NULL                          | User satisfaction from 1 to 5              |
| was_good_decision    | BOOLEAN   | NULL                          | Whether user considers decision successful |
| would_buy_again      | BOOLEAN   | NULL                          | Whether user would repeat decision         |
| notes                | TEXT      | NULL                          | User notes                                 |
| lessons_learned      | TEXT      | NULL                          | Lessons from decision                      |
| created_at           | TIMESTAMP | NOT NULL                      | Journal creation time                      |
| updated_at           | TIMESTAMP | NOT NULL                      | Last update                                |

## Relationships

```text
users (1) -------- (many) decision_journal

decision_sessions (1) -------- (1) decision_journal

products (1) -------- (many) decision_journal
```

---

# 20. decision_dna

## Purpose

Stores long-term patterns learned from a user's decisions.

Decision DNA helps ThinkStack personalize future recommendations.

## Columns

| Column             | Data Type    | Constraints                   | Description                    |
| ------------------ | ------------ | ----------------------------- | ------------------------------ |
| id                 | BIGSERIAL    | PRIMARY KEY                   | DNA identifier                 |
| user_id            | BIGINT       | NOT NULL, UNIQUE, FOREIGN KEY | User                           |
| preference_profile | JSONB        | NOT NULL                      | Learned preference information |
| confidence_score   | NUMERIC(5,2) | NULL                          | Confidence in learned profile  |
| decisions_analyzed | INTEGER      | NOT NULL                      | Number of decisions analyzed   |
| last_analyzed_at   | TIMESTAMP    | NULL                          | Last analysis time             |
| created_at         | TIMESTAMP    | NOT NULL                      | Creation time                  |
| updated_at         | TIMESTAMP    | NOT NULL                      | Last update                    |

## Example

```json
{
  "value_for_money": 0.91,
  "reliability": 0.88,
  "battery_priority": 0.94,
  "brand_loyalty": 0.42,
  "portability": 0.86
}
```

## Relationships

```text
users (1) -------- (1) decision_dna
```

---

# 21. notifications

## Purpose

Stores notifications generated for users.

Examples:

* Price drop
* Decision reminder
* New recommendation
* Wishlist update
* Product availability

## Columns

| Column         | Data Type    | Constraints           | Description                |
| -------------- | ------------ | --------------------- | -------------------------- |
| id             | BIGSERIAL    | PRIMARY KEY           | Notification identifier    |
| user_id        | BIGINT       | NOT NULL, FOREIGN KEY | Recipient                  |
| type           | VARCHAR(50)  | NOT NULL              | Notification type          |
| title          | VARCHAR(255) | NOT NULL              | Notification title         |
| message        | TEXT         | NOT NULL              | Notification content       |
| reference_type | VARCHAR(50)  | NULL                  | Related entity type        |
| reference_id   | BIGINT       | NULL                  | Related entity identifier  |
| is_read        | BOOLEAN      | NOT NULL              | Read status                |
| created_at     | TIMESTAMP    | NOT NULL              | Notification creation time |

## Notification Types

* PRICE_DROP
* PRICE_ALERT
* DECISION_REMINDER
* RECOMMENDATION
* SYSTEM
* PRODUCT_UPDATE

## Relationships

```text
users (1) -------- (many) notifications
```

---

# 22. Important Constraints

The following constraints should be implemented in the actual PostgreSQL database.

## Users

* Email must be unique.
* Email cannot be NULL.
* Password hash cannot be NULL.

## User Preferences

* One preference profile per user.

## Categories

* Category name must be unique.
* Category slug must be unique.
* Parent category must reference an existing category.

## Products

* Every product must belong to a category.
* Product slug must be unique.

## Product Specifications

* Every specification must belong to a valid product.

## Wizard

* Every question must belong to a valid category.
* Every answer must belong to a valid decision session and question.

## Decisions

* Every decision belongs to a valid user and category.

## Recommendations

* Scores should remain between 0 and 100.

## Reviews

* Ratings should remain within the supported rating range.

## Journal

* Satisfaction rating should remain between 1 and 5.

---

# 23. Important Indexes

Indexes should be added to frequently searched columns.

Recommended indexes:

```text
users.email

categories.slug

categories.parent_id

products.category_id

products.brand

products.slug

product_specifications.product_id

wizard_questions.category_id

wizard_answers.decision_session_id

decision_sessions.user_id

decision_sessions.category_id

decision_alternatives.decision_session_id

decision_alternatives.product_id

recommendations.decision_session_id

recommendations.product_id

product_prices.product_id

product_reviews.product_id

price_history.product_id

bookmarks.user_id

decision_journal.user_id

notifications.user_id
```

---

# 24. Data Flow

The major ThinkStack data flow is:

```text
User
 ↓
Authentication
 ↓
Dashboard
 ↓
Create Decision
 ↓
Select Category
 ↓
ThinkStack Wizard
 ↓
Wizard Questions
 ↓
User Answers
 ↓
Decision Session
 ↓
Candidate Products
 ↓
Product Specifications
 ↓
Decision Engine
 ↓
Recommendation
 ↓
Transparent Score Breakdown
 ↓
Comparison
 ↓
Price Comparison
 ↓
Purchase
 ↓
Decision Journal
 ↓
Decision DNA
```

---

# 25. Recommendation Data Flow

```text
User Requirements
        ↓
Budget Filter
        ↓
Requirement Filter
        ↓
Product Specifications
        ↓
Weighted Scoring
        ↓
Candidate Ranking
        ↓
Recommendation
        ↓
Why This?
        ↓
Why Not Others?
        ↓
Trade-offs
        ↓
Confidence Score
```

---

# 26. Transparency Requirements

Every recommendation must be explainable.

ThinkStack should be able to show:

* Why the product was recommended
* Which user priorities it matched
* Which criteria increased the score
* Which criteria reduced the score
* Why other alternatives scored lower
* What trade-offs exist
* Which data sources were used

The recommendation system must not behave as an unexplained black box.

---

# 27. Beginner Experience

ThinkStack should support users who have zero prior knowledge.

The database therefore supports:

* Category-specific questions
* Question descriptions
* Flexible answer types
* Product specifications
* Review summaries
* Explanations
* Knowledge content integration in future versions

The goal is to allow a first-time buyer to understand the decision without leaving ThinkStack.

---

# 28. Future Database Extensions

The current schema is designed to allow future modules such as:

* AI conversations
* Knowledge articles
* Product comparison templates
* Price alerts
* Affiliate tracking
* Coupons
* Seller management
* Product ownership records
* Product maintenance records
* Cost-of-ownership calculations
* User feedback analytics
* AI-generated explanations
* Decision collaboration
* Travel and service decisions
* Job offer comparisons
* College comparisons
* Insurance comparisons

These should be added only when their corresponding features are implemented.

---

# 29. Database Architecture Summary

ThinkStack's database follows a modular relational architecture:

```text
AUTHENTICATION
    users
       │
       └── user_preferences


CATALOG
    categories
       │
       └── products
             ├── product_specifications
             ├── product_prices
             ├── product_reviews
             ├── product_media
             └── price_history


DECISION SYSTEM
    decision_sessions
       ├── wizard_answers
       ├── decision_alternatives
       └── recommendations


PERSONALIZATION
    decision_dna
       ├── user preferences
       └── historical decision patterns


POST-DECISION
    decision_journal


USER ENGAGEMENT
    bookmarks
    notifications
```

---

# 30. Golden Rule

> ThinkStack does not simply tell users what is better.

> ThinkStack determines what is better **for them**, explains why, shows the trade-offs, and helps them make a confident decision.
