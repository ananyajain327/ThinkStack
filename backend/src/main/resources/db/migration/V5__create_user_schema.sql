-- ============================================================
-- V5: User-focused schema (bookmarks, journal, DNA, notifications)
-- ============================================================

CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bookmark_type VARCHAR(20) NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    session_id UUID REFERENCES decision_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_bookmarks_target CHECK (
        (bookmark_type = 'PRODUCT'  AND product_id IS NOT NULL AND session_id IS NULL) OR
        (bookmark_type = 'SESSION'  AND session_id IS NOT NULL AND product_id IS NULL)
    )
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_user_type ON bookmarks(user_id, bookmark_type);

CREATE TABLE decision_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES decision_sessions(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    notes TEXT,
    outcome VARCHAR(20),
    outcome_notes TEXT,
    satisfaction_rating INT,
    would_buy_again BOOLEAN,
    tags JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_journal_rating CHECK (satisfaction_rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_journal_user ON decision_journal(user_id);

CREATE TABLE decision_dna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    factor VARCHAR(50) NOT NULL,
    score DECIMAL(5, 2) NOT NULL DEFAULT 0,
    sample_size INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_decision_dna_user_factor UNIQUE (user_id, factor)
);

CREATE INDEX idx_dna_user ON decision_dna(user_id);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(300) NOT NULL,
    body TEXT,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);