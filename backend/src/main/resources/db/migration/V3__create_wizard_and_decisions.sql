-- ============================================================
-- V3: Wizard and decision schema (wizards, questions, sessions,
--      answers, alternatives, recommendations)
-- ============================================================

CREATE TABLE decision_wizards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wizards_category ON decision_wizards(category_id);

CREATE TABLE wizard_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wizard_id UUID NOT NULL REFERENCES decision_wizards(id) ON DELETE CASCADE,
    question_key VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL DEFAULT 'SINGLE_CHOICE',
    options JSONB,
    help_text TEXT,
    visible_if JSONB,
    weight DECIMAL(3, 2) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_wizard_questions_wizard_key UNIQUE (wizard_id, question_key)
);

CREATE INDEX idx_wizard_questions_wizard ON wizard_questions(wizard_id);

CREATE TABLE decision_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    wizard_id UUID REFERENCES decision_wizards(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES categories(id),
    title VARCHAR(300),
    budget_min DECIMAL(12, 2),
    budget_max DECIMAL(12, 2),
    priority_weights JSONB,
    requirement_profile JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON decision_sessions(user_id);
CREATE INDEX idx_sessions_category ON decision_sessions(category_id);

CREATE TABLE wizard_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES decision_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES wizard_questions(id) ON DELETE CASCADE,
    answer_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_wizard_answers_session_question UNIQUE (session_id, question_id)
);

CREATE INDEX idx_wizard_answers_session ON wizard_answers(session_id);

CREATE TABLE decision_alternatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES decision_sessions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_decision_alternatives_session_product UNIQUE (session_id, product_id)
);

CREATE INDEX idx_alternatives_session ON decision_alternatives(session_id);

CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES decision_sessions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rank_position INT NOT NULL,
    overall_score DECIMAL(5, 2) NOT NULL,
    confidence_rating DECIMAL(5, 2) NOT NULL,
    budget_category VARCHAR(30),
    value_score DECIMAL(5, 2),
    feature_match DECIMAL(5, 2),
    performance_match DECIMAL(5, 2),
    review_sentiment DECIMAL(5, 2),
    score_breakdown JSONB,
    explainability JSONB,
    advantages JSONB,
    disadvantages JSONB,
    deal_breakers JSONB,
    trade_offs JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_recommendations_session_product UNIQUE (session_id, product_id)
);

CREATE INDEX idx_recommendations_session ON recommendations(session_id);
CREATE INDEX idx_recommendations_product ON recommendations(product_id);