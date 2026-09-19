-- ============================================================
-- V2: Catalog schema (categories, specifications, products, media)
-- ============================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE TABLE specification_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    data_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    unit VARCHAR(30),
    explanation TEXT,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    is_filterable BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_spec_definitions_category_key UNIQUE (category_id, key_name)
);

CREATE INDEX idx_spec_definitions_category ON specification_definitions(category_id);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    brand VARCHAR(100),
    model VARCHAR(200),
    description TEXT,
    image_url VARCHAR(512),
    base_price DECIMAL(12, 2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    avg_rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
    review_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_slug ON products(slug);

CREATE TABLE product_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    spec_def_id UUID NOT NULL REFERENCES specification_definitions(id) ON DELETE CASCADE,
    text_value TEXT,
    numeric_value DECIMAL(15, 4),
    boolean_value BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_specifications_product_spec UNIQUE (product_id, spec_def_id)
);

CREATE INDEX idx_product_specifications_product ON product_specifications(product_id);

CREATE TABLE product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL DEFAULT 'IMAGE',
    url VARCHAR(512) NOT NULL,
    alt_text VARCHAR(300),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_media_product ON product_media(product_id);