-- ============================================================
-- V4: Commerce and transparency (prices, price history, reviews)
-- ============================================================

CREATE TABLE product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_name VARCHAR(200) NOT NULL,
    seller_url VARCHAR(512),
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    availability VARCHAR(50),
    seller_rating DECIMAL(3, 2),
    delivery_info VARCHAR(200),
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prices_product ON product_prices(product_id);
CREATE INDEX idx_prices_product_seller ON product_prices(product_id, seller_name);

CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_name VARCHAR(200),
    price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON price_history(product_id, recorded_at);

CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    review_type VARCHAR(20) NOT NULL DEFAULT 'USER',
    source VARCHAR(100),
    source_url VARCHAR(512),
    author_name VARCHAR(200),
    rating DECIMAL(3, 2),
    title VARCHAR(300),
    content TEXT,
    sentiment VARCHAR(20),
    sentiment_score DECIMAL(5, 4),
    verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    helpful_count INT NOT NULL DEFAULT 0,
    review_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_product_sentiment ON product_reviews(product_id, sentiment);