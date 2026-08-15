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

# Future Tables

The following tables will be designed next:

1. user_preferences
2. categories
3. products
4. product_specifications
5. wizard_questions
6. wizard_answers
7. decision_sessions
8. decision_alternatives
9. recommendations
10. product_prices
11. product_reviews
12. product_media
13. price_history
14. bookmarks
15. decision_journal
16. decision_dna
17. notifications
18. Bookmarks

