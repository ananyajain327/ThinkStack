
# 📡 ThinkStack REST API Specification

## 1. Overview
The ThinkStack REST API provides services for decision intelligence, product comparison, dynamic wizard question flows, explainable recommendations, multi-seller price comparisons, and personalized user profiles.

- **Base URL**: `http://localhost:8080/api`
- **Protocol**: HTTP/1.1 or HTTP/2, JSON format (`application/json;charset=UTF-8`)
- **Authentication**: JWT Bearer Token in `Authorization: Bearer <token>` header

---

## 2. Standard Response Envelope
All API endpoints return a unified response envelope:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-10-04T15:30:00Z"
}
```

Error response envelope:
```json
{
  "success": false,
  "message": "Validation failed / Resource not found",
  "errors": [
    {
      "field": "email",
      "message": "Must be a well-formed email address"
    }
  ],
  "timestamp": "2026-10-04T15:30:00Z"
}
```

---

## 3. Endpoints

### 🔐 3.1 Authentication (`/api/auth`)

#### `POST /api/auth/register`
Register a new user account.
- **Request Body**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: `201 Created` with JWT token and user profile summary.

#### `POST /api/auth/login`
Authenticate existing user and issue JWT.
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": 1,
        "name": "Alex Rivera",
        "email": "alex@example.com",
        "role": "USER"
      }
    }
  }
  ```

#### `GET /api/auth/me`
Retrieve authenticated user profile and preference settings.
- **Security**: Bearer Token required.
- **Response**: `200 OK`

---

### 🏷️ 3.2 Categories (`/api/categories`)

#### `GET /api/categories`
Retrieve full hierarchical categories tree (Electronics, Automotive, Education, Career, etc.).
- **Query Params**: `activeOnly=true` (default: true)
- **Response**: `200 OK` with parent categories and nested subcategories.

#### `GET /api/categories/{slug}`
Retrieve single category details by slug.
- **Path Param**: `slug` (e.g. `laptops`, `smartphones`)
- **Response**: `200 OK`

---

### 📦 3.3 Products Catalog (`/api/products`)

#### `GET /api/products`
Search and filter products catalog.
- **Query Params**:
  - `category`: Category slug (e.g. `laptops`)
  - `brand`: Brand name
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `search`: Keyword search
  - `page`: Page index (default: 0)
  - `size`: Page size (default: 10)
- **Response**: `200 OK` with paginated product items and price overview.

#### `GET /api/products/{slug}`
Retrieve comprehensive product details: specifications, seller prices, ratings summary, media images.
- **Path Param**: `slug` (e.g. `macbook-air-m3-16gb-512gb`)
- **Response**: `200 OK`

#### `GET /api/products/compare`
Side-by-side comparison of 2 to 4 products.
- **Query Params**: `ids=1,2,3`
- **Response**: `200 OK` with specification differences matrix, highlighted pros/cons, and winner per category.

---

### 🧙‍♂️ 3.4 ThinkStack Wizard (`/api/wizard`)

#### `GET /api/wizard/questions`
Retrieve adaptive questions for a chosen category.
- **Query Params**: `category=laptops`
- **Response**: `200 OK` with dynamic question list, input types (`RANGE`, `SINGLE_SELECT`), options, and beginner guidance helper text.

---

### 🧠 3.5 Decision Sessions & Engine (`/api/decisions`)

#### `POST /api/decisions`
Initialize a new decision session.
- **Request Body**:
  ```json
  {
    "categoryId": 2,
    "title": "College & Coding Laptop 2026",
    "budgetMin": 50000,
    "budgetMax": 120000,
    "knowledgeLevel": "BEGINNER"
  }
  ```
- **Response**: `201 Created` with initialized `decision_session` object.

#### `POST /api/decisions/{id}/answers`
Submit or update wizard answers for a decision session.
- **Request Body**:
  ```json
  {
    "answers": [
      { "questionId": 1, "answerValue": "coding" },
      { "questionId": 2, "answerValue": 115000 },
      { "questionId": 3, "answerValue": "critical" }
    ]
  }
  ```
- **Response**: `200 OK`

#### `POST /api/decisions/{id}/evaluate`
Run the ThinkStack Decision Engine to calculate multi-attribute scores, generate ranked recommendations, and produce transparent explanations.
- **Response**: `200 OK`

#### `GET /api/decisions/{id}/recommendations`
Retrieve explainable recommendation cards for a decision session.
- **Response**: `200 OK` with overall scores, score breakdown (budget, performance, battery, portability, value), "why recommended", "why alternatives scored lower", and trade-offs.

#### `GET /api/decisions/{id}`
Retrieve full decision details, answers, selected alternatives, and recommendations.

#### `PATCH /api/decisions/{id}/status`
Advance or reopen a decision session's lifecycle state.
- **Request Body**:
  ```json
  { "status": "PURCHASED" }
  ```
  Allowed values: `IN_PROGRESS`, `COMPLETED`, `PURCHASED`, `ARCHIVED`.
- **Response**: `200 OK` with the updated `decision_session` object. Ownership is enforced;
  invalid statuses return `400`.

---

### 💰 3.6 Pricing & History (`/api/prices`)

#### `GET /api/products/{id}/prices`
Retrieve current multi-seller prices (Amazon, Flipkart, Croma, Reliance Digital) with stock availability and purchase links.

#### `GET /api/products/{id}/price-history`
Retrieve historical price points, 30/60/90-day trends, lowest recorded price, and average price.

---

### 🌟 3.7 Reviews & Transparency (`/api/reviews`)

#### `GET /api/products/{id}/reviews`
Retrieve verified expert, editorial, and user reviews with summarized pros, cons, and durability ratings.

#### `GET /api/decisions/{id}/transparency`
Retrieve the exact mathematical scoring weights, criteria importance, and transparent decision audit trail.

---

### 📌 3.8 Bookmarks & User Dashboard (`/api/dashboard`, `/api/bookmarks`)

#### `GET /api/dashboard`
Retrieve user overview: active decision sessions, saved bookmarks, price alerts, and Decision DNA summary.

#### `POST /api/bookmarks`
Bookmark a product or a decision session.
- **Request Body**: `{ "productId": 1 }` or `{ "decisionSessionId": 3 }`

#### `DELETE /api/bookmarks/{id}`
Remove a bookmark.

---

### 📖 3.9 Decision Journal (`/api/journal`)

#### `POST /api/journal`
Record real-world post-purchase reflection.
- **Request Body**:
  ```json
  {
    "decisionSessionId": 1,
    "purchasedProductId": 1,
    "satisfactionRating": 5,
    "wasGoodDecision": true,
    "wouldBuyAgain": true,
    "notes": "Battery life exceeded expectations. Great recommendation!",
    "lessonsLearned": "Always get 16GB RAM for long-term development."
  }
  ```

#### `GET /api/journal`
Retrieve user's decision reflections.

---

### 🧬 3.10 Decision DNA (`/api/dna`)

#### `GET /api/dna`
Retrieve learned preference profile (value-for-money bias, battery weight, brand sensitivity, decisions analyzed).

---

### 🔔 3.11 Notifications (`/api/notifications`)

#### `GET /api/notifications`
Retrieve in-app notifications (price drops, recommendation reminders).
- **Query Params**: `unreadOnly=true`

#### `PATCH /api/notifications/{id}/read`
Mark notification as read.