-- ============================================================
-- V7: Price alerts (user-subscribed price-drop targets)
-- ============================================================

CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    target_price DECIMAL(12, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_price_alerts_user_product UNIQUE (user_id, product_id),
    CONSTRAINT chk_price_alert_target CHECK (target_price > 0)
);

CREATE INDEX idx_price_alerts_user ON price_alerts(user_id, is_active);
CREATE INDEX idx_price_alerts_product ON price_alerts(product_id);