-- ============================================================================
-- ThinkStack Relational Database Schema
-- Target: PostgreSQL 14+
-- Based on: docs/DATABASE_SCHEMA.md
-- ============================================================================

-- Ensure UUID/JSON extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- 2. USER PREFERENCES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    experience_level VARCHAR(30) NOT NULL DEFAULT 'BEGINNER',
    preferred_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_preferences_exp CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'EXPERT'))
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- ----------------------------------------------------------------------------
-- 3. CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    icon VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- ----------------------------------------------------------------------------
-- 4. PRODUCTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    model_number VARCHAR(150),
    slug VARCHAR(300) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    product_type VARCHAR(100),
    release_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ----------------------------------------------------------------------------
-- 5. PRODUCT SPECIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_specifications (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    specification_name VARCHAR(150) NOT NULL,
    specification_value VARCHAR(500) NOT NULL,
    specification_unit VARCHAR(50),
    specification_group VARCHAR(100),
    is_comparable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_specs_product ON product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_group ON product_specifications(specification_group);

-- ----------------------------------------------------------------------------
-- 6. WIZARD QUESTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wizard_questions (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    question_text VARCHAR(500) NOT NULL,
    description TEXT,
    input_type VARCHAR(50) NOT NULL,
    options JSONB,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_wizard_questions_input CHECK (input_type IN (
        'TEXT', 'NUMBER', 'RANGE', 'SINGLE_SELECT', 'MULTI_SELECT', 'BOOLEAN', 'SLIDER'
    ))
);

CREATE INDEX IF NOT EXISTS idx_wizard_questions_category ON wizard_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_wizard_questions_order ON wizard_questions(category_id, display_order);

-- ----------------------------------------------------------------------------
-- 7. DECISION SESSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS decision_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    budget_min NUMERIC(12,2),
    budget_max NUMERIC(12,2),
    knowledge_level VARCHAR(30) DEFAULT 'BEGINNER',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_decision_sessions_status CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'PURCHASED', 'ARCHIVED'))
);

CREATE INDEX IF NOT EXISTS idx_decision_sessions_user ON decision_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_sessions_category ON decision_sessions(category_id);
CREATE INDEX IF NOT EXISTS idx_decision_sessions_status ON decision_sessions(status);

-- ----------------------------------------------------------------------------
-- 8. WIZARD ANSWERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wizard_answers (
    id BIGSERIAL PRIMARY KEY,
    decision_session_id BIGINT NOT NULL REFERENCES decision_sessions(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES wizard_questions(id) ON DELETE RESTRICT,
    answer_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_question UNIQUE (decision_session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_wizard_answers_session ON wizard_answers(decision_session_id);

-- ----------------------------------------------------------------------------
-- 9. DECISION ALTERNATIVES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS decision_alternatives (
    id BIGSERIAL PRIMARY KEY,
    decision_session_id BIGINT NOT NULL REFERENCES decision_sessions(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    is_user_selected BOOLEAN NOT NULL DEFAULT FALSE,
    is_system_selected BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_product UNIQUE (decision_session_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_decision_alts_session ON decision_alternatives(decision_session_id);
CREATE INDEX IF NOT EXISTS idx_decision_alts_product ON decision_alternatives(product_id);

-- ----------------------------------------------------------------------------
-- 10. RECOMMENDATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendations (
    id BIGSERIAL PRIMARY KEY,
    decision_session_id BIGINT NOT NULL REFERENCES decision_sessions(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2) NOT NULL,
    confidence_score NUMERIC(5,2) NOT NULL,
    rank_position INTEGER NOT NULL,
    explanation TEXT,
    why_recommended JSONB,
    why_not_others JSONB,
    trade_offs JSONB,
    score_breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rec_scores CHECK (overall_score >= 0 AND overall_score <= 100 AND confidence_score >= 0 AND confidence_score <= 100)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_session ON recommendations(decision_session_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_product ON recommendations(product_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_rank ON recommendations(decision_session_id, rank_position);

-- ----------------------------------------------------------------------------
-- 11. PRODUCT PRICES (CURRENT MULTI-SELLER OFFERS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_prices (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_name VARCHAR(150) NOT NULL,
    seller_url TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    original_price NUMERIC(12,2),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    discount_percentage NUMERIC(5,2),
    availability VARCHAR(50) DEFAULT 'IN_STOCK',
    delivery_information VARCHAR(255),
    warranty_information VARCHAR(500),
    seller_rating NUMERIC(3,2),
    last_checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_seller ON product_prices(seller_name);

-- ----------------------------------------------------------------------------
-- 12. PRODUCT REVIEWS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    source_name VARCHAR(150),
    source_url TEXT,
    rating NUMERIC(3,2),
    title VARCHAR(255),
    review_text TEXT,
    review_type VARCHAR(50) DEFAULT 'EDITORIAL',
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reviews_type CHECK (review_type IN ('EXPERT', 'USER', 'THINKSTACK', 'EDITORIAL'))
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);

-- ----------------------------------------------------------------------------
-- 13. PRODUCT MEDIA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_media (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    media_type VARCHAR(30) NOT NULL DEFAULT 'IMAGE',
    media_url TEXT NOT NULL,
    title VARCHAR(255),
    alt_text VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 1,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_media_type CHECK (media_type IN ('IMAGE', 'VIDEO', 'DOCUMENT'))
);

CREATE INDEX IF NOT EXISTS idx_product_media_product ON product_media(product_id);

-- ----------------------------------------------------------------------------
-- 14. PRICE HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_history (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_name VARCHAR(150) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_product_date ON price_history(product_id, recorded_at);

-- ----------------------------------------------------------------------------
-- 15. BOOKMARKS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    decision_session_id BIGINT REFERENCES decision_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_bookmark_target CHECK (product_id IS NOT NULL OR decision_session_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);

-- ----------------------------------------------------------------------------
-- 16. DECISION JOURNAL
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS decision_journal (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision_session_id BIGINT NOT NULL UNIQUE REFERENCES decision_sessions(id) ON DELETE CASCADE,
    purchased_product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    was_good_decision BOOLEAN,
    would_buy_again BOOLEAN,
    notes TEXT,
    lessons_learned TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decision_journal_user ON decision_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_journal_decision ON decision_journal(decision_session_id);

-- ----------------------------------------------------------------------------
-- 17. DECISION DNA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS decision_dna (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preference_profile JSONB NOT NULL,
    confidence_score NUMERIC(5,2),
    decisions_analyzed INTEGER NOT NULL DEFAULT 0,
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decision_dna_user ON decision_dna(user_id);

-- ----------------------------------------------------------------------------
-- 18. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notification_type CHECK (type IN (
        'PRICE_DROP', 'PRICE_ALERT', 'DECISION_REMINDER', 'RECOMMENDATION', 'SYSTEM', 'PRODUCT_UPDATE'
    ))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
