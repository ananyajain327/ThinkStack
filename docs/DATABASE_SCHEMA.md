# ThinkStack Database Schema

## Database Overview

ThinkStack uses PostgreSQL as its primary relational database.

The database is designed to support:

- User authentication
- User preferences
- Decision sessions
- ThinkStack Wizard
- Products and categories
- Product specifications
- Comparisons
- Recommendations
- Reviews
- Price comparison
- Decision Journal
- Decision DNA
- Notifications
- Bookmarks

---

# 1. users

## Purpose

The `users` table stores account and authentication information for every ThinkStack user.

## Columns

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier for the user |
| name | VARCHAR(100) | NOT NULL | User's name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's login email |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| role | VARCHAR(30) | NOT NULL | User role |
| is_active | BOOLEAN | NOT NULL | Whether the account is active |
| created_at | TIMESTAMP | NOT NULL | Account creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

## Roles

The `role` column can contain:

- USER
- ADMIN
- SUPER_ADMIN

## Relationships

A user can have:

- Multiple decisions
- Multiple preferences
- Multiple bookmarks
- Multiple notifications
- Multiple journal entries
- One Decision DNA profile

## Security

Passwords must never be stored as plain text.

ThinkStack will store passwords using BCrypt hashing.

---
# 2. user_preferences

## Purpose

The `user_preferences` table stores the user's general preferences that can be reused across ThinkStack decisions.

These preferences help ThinkStack personalize the user experience and improve future recommendations.

## Columns

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier for the preference record |
| user_id | BIGINT | NOT NULL, UNIQUE, FOREIGN KEY | The user who owns these preferences |
| experience_level | VARCHAR(30) | NOT NULL | User's general knowledge level |
| preferred_currency | VARCHAR(10) | NOT NULL | Currency used for budgets and prices |
| preferred_language | VARCHAR(10) | NOT NULL | User's preferred application language |
| created_at | TIMESTAMP | NOT NULL | Preference creation time |
| updated_at | TIMESTAMP | NOT NULL | Last preference update time |

## Experience Levels

The `experience_level` column can contain:

- BEGINNER
- INTERMEDIATE
- EXPERT

## Relationships

Each user can have one general preference profile.

Relationship:

users (1) -------- (1) user_preferences

The `user_id` column references:

users.id

## Design Notes

User-specific decision requirements such as budget, purpose, product category, and decision priorities should NOT be permanently stored in this table.

Those values belong to individual decision sessions because they can change from one decision to another.

Example:

A user may have:

- ₹60,000 budget for a laptop
- ₹30,000 budget for a phone
- ₹15 lakh budget for a car

Therefore, decision-specific information will be stored separately in the decision module.

# 3. categories

## Purpose

The `categories` table stores the different decision and product categories supported by ThinkStack.

The category system is designed to make ThinkStack extensible so that new categories can be added without changing the core database architecture.

## Columns

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier for the category |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Name of the category |
| slug | VARCHAR(120) | NOT NULL, UNIQUE | URL-friendly identifier for the category |
| description | TEXT | NULL | Description of the category |
| parent_id | BIGINT | NULL, FOREIGN KEY | Parent category for hierarchical categories |
| icon | VARCHAR(100) | NULL | Icon identifier used by the frontend |
| is_active | BOOLEAN | NOT NULL | Whether the category is currently available |
| created_at | TIMESTAMP | NOT NULL | Category creation time |
| updated_at | TIMESTAMP | NOT NULL | Last category update time |

## Example Categories

### Electronics

- Laptop
- Smartphone
- Tablet
- Camera
- Headphones
- Smartwatch
- Monitor
- TV
- Printer
- Gaming Console

### Automotive

- Car
- Bike

### Education

- College
- Course

### Career

- Job Offer

### Other

- Custom Decision

## Hierarchical Structure

Categories can have parent-child relationships.

Example:

Electronics
- Laptop
- Smartphone
- Tablet
- Camera

Automotive
- Car
- Bike

The `parent_id` column references `categories.id`.

A NULL `parent_id` means the category is a top-level category.

## Relationships

One category can contain multiple products.

One category can have multiple wizard questions.

One category can have multiple subcategories.

Relationships:

categories (1) -------- (many) products

categories (1) -------- (many) wizard_questions

categories (1) -------- (many) categories

## Design Notes

The category structure is intentionally hierarchical.

This allows ThinkStack to support new decision domains in the future without redesigning the database.

Examples of future categories include:

- Travel
- Insurance
- Credit Cards
- Real Estate
- Investments
- Courses
- Services

# 4. products

## Purpose

The `products` table stores the core information about products and decision alternatives available on ThinkStack.

Products are linked to categories so that the same product architecture can support different decision domains in the future.

## Columns

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier for the product |
| category_id | BIGINT | NOT NULL, FOREIGN KEY | Category to which the product belongs |
| brand | VARCHAR(100) | NOT NULL | Product brand |
| name | VARCHAR(255) | NOT NULL | Product name |
| model_number | VARCHAR(150) | NULL | Product model or variant identifier |
| slug | VARCHAR(300) | NOT NULL, UNIQUE | URL-friendly product identifier |
| description | TEXT | NULL | Detailed product description |
| short_description | VARCHAR(500) | NULL | Short product summary |
| product_type | VARCHAR(100) | NULL | Type or sub-type of the product |
| release_date | DATE | NULL | Product release date |
| is_active | BOOLEAN | NOT NULL | Whether the product is currently available |
| created_at | TIMESTAMP | NOT NULL | Product creation time |
| updated_at | TIMESTAMP | NOT NULL | Last product update time |

## Relationships

Each product belongs to one category.

One category can contain multiple products.

Relationship:

categories (1) -------- (many) products

The `category_id` column references:

categories.id

## Product Identity

The combination of brand, name, and model number helps identify a specific product or variant.

The `slug` provides a unique URL-friendly identifier.

Example:

```text
brand:
Apple

name:
MacBook Air M4

model_number:
MW123HN/A

slug:
apple-macbook-air-m4

# Future Tables

The following tables will be designed next:

1. product_specifications
2. wizard_questions
3. wizard_answers
4. decision_sessions
5. decision_alternatives
6. recommendations
7. product_prices
8. product_reviews
9. product_media
10. price_history
11. bookmarks
12. decision_journal
13. decision_dna
14. notifications

