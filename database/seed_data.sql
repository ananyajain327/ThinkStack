-- ============================================================================
-- ThinkStack Seed Data
-- ============================================================================

-- 1. USERS & USER PREFERENCES
-- Password is 'Password123!' hashed with BCrypt ($2a$10$e8wF5q8QZlWwX...)
INSERT INTO users (id, name, email, password_hash, role, is_active, created_at, updated_at) VALUES
(1, 'Admin User', 'admin@thinkstack.ai', '$2a$10$7Z1pXfB8jYtD10K6eL.R6uYV3cQq5yWvP7Q5U9Z1M4xW0X2Y3Z5a2', 'ADMIN', TRUE, NOW(), NOW()),
(2, 'Alex Rivera', 'alex@example.com', '$2a$10$7Z1pXfB8jYtD10K6eL.R6uYV3cQq5yWvP7Q5U9Z1M4xW0X2Y3Z5a2', 'USER', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_preferences (id, user_id, experience_level, preferred_currency, preferred_language, created_at, updated_at) VALUES
(1, 1, 'EXPERT', 'INR', 'en', NOW(), NOW()),
(2, 2, 'BEGINNER', 'INR', 'en', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (id, name, slug, description, parent_id, icon, is_active) VALUES
(1, 'Electronics', 'electronics', 'Consumer tech and smart devices', NULL, 'Laptop', TRUE),
(2, 'Laptops', 'laptops', 'Notebooks, ultrabooks, and gaming rigs', 1, 'Laptop', TRUE),
(3, 'Smartphones', 'smartphones', 'Flagship and mid-range mobile devices', 1, 'Smartphone', TRUE),
(4, 'Tablets', 'tablets', 'Productivity and creative tablets', 1, 'Tablet', TRUE),
(5, 'Headphones', 'headphones', 'Noise cancelling and audiophile audio', 1, 'Headphones', TRUE),
(6, 'Automotive', 'automotive', 'Vehicles and personal transport', NULL, 'Car', TRUE),
(7, 'Cars', 'cars', 'Electric, hybrid, and combustion cars', 6, 'Car', TRUE),
(8, 'Bikes', 'bikes', 'Motorcycles and scooters', 6, 'Bike', TRUE),
(9, 'Education', 'education', 'Colleges, degrees, and certified courses', NULL, 'GraduationCap', TRUE),
(10, 'Colleges', 'colleges', 'Undergraduate and postgraduate institutions', 9, 'GraduationCap', TRUE),
(11, 'Courses', 'courses', 'Professional tech and business bootcamps', 9, 'BookOpen', TRUE),
(12, 'Career', 'career', 'Job offers and career paths', NULL, 'Briefcase', TRUE),
(13, 'Job Offers', 'job-offers', 'Compare compensation, culture, and growth', 12, 'Briefcase', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. PRODUCTS (Laptops)
INSERT INTO products (id, category_id, brand, name, model_number, slug, short_description, description, product_type, release_date, is_active) VALUES
(1, 2, 'Apple', 'MacBook Air M3 (16GB, 512GB)', 'MC7X4HN/A', 'macbook-air-m3-16gb-512gb',
 'Unmatched battery life, silent fanless thermals, and outstanding build quality for productivity.',
 'Apple MacBook Air featuring the M3 chip with an 8-core CPU, 10-core GPU, 16GB unified memory, and 512GB SSD. Delivers up to 18 hours of real-world battery life in an impossibly thin aluminum enclosure.',
 'Ultrabook', '2024-03-08', TRUE),

(2, 2, 'Dell', 'XPS 15 9530 (Core i7, RTX 4050)', 'XPS9530-7389', 'dell-xps-15-9530-i7-rtx4050',
 'Stunning 3.5K OLED touchscreen display paired with high-performance creator hardware.',
 'Dell XPS 15 9530 combines Intel Core i7-13700H with NVIDIA GeForce RTX 4050, 16GB DDR5, and a 1TB PCIe NVMe SSD. Features a class-leading InfinityEdge 3.5K OLED touch display with 100% DCI-P3 color gamut.',
 'Creator Laptop', '2023-05-15', TRUE),

(3, 2, 'Lenovo', 'Legion Pro 5 Gen 8 (Ryzen 7, RTX 4070)', '16ARX8', 'lenovo-legion-pro-5-ryzen7-rtx4070',
 'High-framerate 16-inch gaming monster with exceptional cooling and mechanical keyboard.',
 'Lenovo Legion Pro 5 Gen 8 powered by AMD Ryzen 7 7745HX, NVIDIA GeForce RTX 4070 (140W TGP), 32GB DDR5 RAM, and 1TB SSD. Features a 16:10 WQXGA 240Hz display with Legion ColdFront 5.0 thermal technology.',
 'Gaming Laptop', '2023-08-20', TRUE),

(4, 2, 'ASUS', 'ROG Zephyrus G14 (2024 OLED, RTX 4060)', 'GA403UV', 'asus-rog-zephyrus-g14-2024-oled',
 'Ultraportable gaming and creator laptop with jaw-dropping 3K 120Hz ROG Nebula OLED display.',
 'ASUS ROG Zephyrus G14 2024 model featuring AMD Ryzen 9 8945HS with Ryzen AI, NVIDIA GeForce RTX 4060, 16GB LPDDR5X, 1TB NVMe Gen4 SSD, and CNC all-aluminum chassis weighing just 1.5kg.',
 'Compact Gaming/Creator', '2024-02-15', TRUE),

(5, 2, 'Lenovo', 'ThinkPad X1 Carbon Gen 12 (Core Ultra 7)', '21KC000XUS', 'lenovo-thinkpad-x1-carbon-gen-12',
 'The gold standard business laptop with legendary keyboard, military-grade durability, and AI NPU.',
 'Lenovo ThinkPad X1 Carbon Gen 12 features Intel Core Ultra 7 155H with integrated Intel Arc Graphics and AI Boost NPU, 16GB LPDDR5X, 512GB OPAL SSD, and lightweight carbon fiber weave body.',
 'Business Ultrabook', '2024-01-25', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUCT SPECIFICATIONS
INSERT INTO product_specifications (product_id, specification_name, specification_value, specification_unit, specification_group, is_comparable) VALUES
-- MacBook Air M3
(1, 'Processor', 'Apple M3 (8-core CPU, 10-core GPU)', '', 'Performance', TRUE),
(1, 'RAM', '16', 'GB', 'Memory', TRUE),
(1, 'Storage', '512', 'GB', 'Storage', TRUE),
(1, 'Display', '13.6-inch Liquid Retina (2560x1664, 500 nits)', 'inches', 'Display', TRUE),
(1, 'Battery Life', '18', 'hours', 'Battery', TRUE),
(1, 'Weight', '1.24', 'kg', 'Portability', TRUE),
(1, 'Operating System', 'macOS Sonoma', '', 'Platform', TRUE),
(1, 'Fan / Thermals', 'Fanless (100% Silent)', '', 'Thermals', TRUE),

-- Dell XPS 15
(2, 'Processor', 'Intel Core i7-13700H (14-core, up to 5.0 GHz)', '', 'Performance', TRUE),
(2, 'RAM', '16', 'GB', 'Memory', TRUE),
(2, 'Storage', '1024', 'GB', 'Storage', TRUE),
(2, 'Graphics', 'NVIDIA GeForce RTX 4050 6GB GDDR6', '', 'Graphics', TRUE),
(2, 'Display', '15.6-inch 3.5K OLED Touch (3456x2160)', 'inches', 'Display', TRUE),
(2, 'Battery Life', '8', 'hours', 'Battery', TRUE),
(2, 'Weight', '1.92', 'kg', 'Portability', TRUE),
(2, 'Operating System', 'Windows 11 Home', '', 'Platform', TRUE),

-- Lenovo Legion Pro 5
(3, 'Processor', 'AMD Ryzen 7 7745HX (8-core, 16-thread)', '', 'Performance', TRUE),
(3, 'RAM', '32', 'GB', 'Memory', TRUE),
(3, 'Storage', '1024', 'GB', 'Storage', TRUE),
(3, 'Graphics', 'NVIDIA GeForce RTX 4070 8GB GDDR6 (140W)', '', 'Graphics', TRUE),
(3, 'Display', '16.0-inch WQXGA 240Hz IPS 500 nits', 'inches', 'Display', TRUE),
(3, 'Battery Life', '4.5', 'hours', 'Battery', TRUE),
(3, 'Weight', '2.55', 'kg', 'Portability', TRUE),
(3, 'Operating System', 'Windows 11 Home', '', 'Platform', TRUE),

-- ASUS ROG Zephyrus G14
(4, 'Processor', 'AMD Ryzen 9 8945HS (8-core, 16-thread AI Boost)', '', 'Performance', TRUE),
(4, 'RAM', '16', 'GB', 'Memory', TRUE),
(4, 'Storage', '1024', 'GB', 'Storage', TRUE),
(4, 'Graphics', 'NVIDIA GeForce RTX 4060 8GB GDDR6', '', 'Graphics', TRUE),
(4, 'Display', '14.0-inch 3K 120Hz ROG Nebula OLED', 'inches', 'Display', TRUE),
(4, 'Battery Life', '9', 'hours', 'Battery', TRUE),
(4, 'Weight', '1.50', 'kg', 'Portability', TRUE),
(4, 'Operating System', 'Windows 11 Home', '', 'Platform', TRUE),

-- Lenovo ThinkPad X1 Carbon
(5, 'Processor', 'Intel Core Ultra 7 155H (16-core, Intel AI NPU)', '', 'Performance', TRUE),
(5, 'RAM', '16', 'GB', 'Memory', TRUE),
(5, 'Storage', '512', 'GB', 'Storage', TRUE),
(5, 'Graphics', 'Intel Arc Graphics', '', 'Graphics', TRUE),
(5, 'Display', '14.0-inch 2.8K OLED 120Hz Anti-Glare', 'inches', 'Display', TRUE),
(5, 'Battery Life', '13', 'hours', 'Battery', TRUE),
(5, 'Weight', '1.09', 'kg', 'Portability', TRUE),
(5, 'Operating System', 'Windows 11 Pro', '', 'Platform', TRUE);

-- 5. WIZARD QUESTIONS FOR LAPTOPS (category_id = 2)
INSERT INTO wizard_questions (id, category_id, question_text, description, input_type, options, is_required, display_order, is_active) VALUES
(1, 2, 'What is your primary planned usage for this laptop?',
 'Your intended workflow determines the minimum processing power, memory, and graphics needed.',
 'SINGLE_SELECT',
 '[
   {"id": "study", "label": "College / Study & General Web", "icon": "BookOpen", "helper": "Notes, web research, PDF reading, streaming"},
   {"id": "coding", "label": "Software Development & Coding", "icon": "Code", "helper": "IDEs, Docker containers, compiling, multitasking"},
   {"id": "gaming", "label": "Gaming & Esports", "icon": "Gamepad2", "helper": "High framerate AAA titles, low latency, discrete GPU"},
   {"id": "creator", "label": "Video Editing & 3D Design", "icon": "Film", "helper": "Premiere, DaVinci, Blender, color-accurate screen"},
   {"id": "business", "label": "Business & Heavy Travel", "icon": "Briefcase", "helper": "Maximum battery, rugged build, light carry weight"}
 ]',
 TRUE, 1, TRUE),

(2, 2, 'What is your maximum target budget?',
 'We evaluate options strictly against this ceiling, highlighting sweet-spot value choices.',
 'RANGE',
 '{"min": 30000, "max": 250000, "step": 5000, "default": 115000, "currency": "INR"}',
 TRUE, 2, TRUE),

(3, 2, 'How important is battery life and portability to you?',
 'High-power gaming chips drain batteries quickly; ultrabooks prioritize all-day unplugged life.',
 'SINGLE_SELECT',
 '[
   {"id": "critical", "label": "Crucial: Must last 10+ hours unplugged", "weight": 1.0},
   {"id": "moderate", "label": "Balanced: 6-8 hours for casual cafe sessions", "weight": 0.6},
   {"id": "plugged", "label": "Mostly plugged in: Desktop replacement performance", "weight": 0.2}
 ]',
 TRUE, 3, TRUE),

(4, 2, 'Do you require dedicated graphics (GPU)?',
 'Dedicated graphics are required for serious 3D gaming and CAD, but increase heat, noise, and weight.',
 'SINGLE_SELECT',
 '[
   {"id": "not_needed", "label": "Integrated is fine (silent, cool, battery efficient)"},
   {"id": "entry_gpu", "label": "Light / Casual Gaming (e.g. RTX 3050 / 4050)"},
   {"id": "high_gpu", "label": "High-End Gaming & 3D Rendering (RTX 4070+)"}
 ]',
 TRUE, 4, TRUE),

(5, 2, 'Do you have an Operating System preference?',
 'Choose macOS if you prefer Apple ecosystem cohesion, or Windows/Linux for broad software compatibility.',
 'SINGLE_SELECT',
 '[
   {"id": "no_pref", "label": "No Preference / Open to either"},
   {"id": "macos", "label": "Prefer Apple macOS"},
   {"id": "windows", "label": "Prefer Microsoft Windows"}
 ]',
 FALSE, 5, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. MULTI-SELLER PRODUCT PRICES
INSERT INTO product_prices (product_id, seller_name, seller_url, price, original_price, currency, discount_percentage, availability, delivery_information, warranty_information, seller_rating, last_checked_at) VALUES
-- MacBook Air M3
(1, 'Amazon India', 'https://amazon.in/dp/example-macbook-m3', 114900, 134900, 'INR', 14.8, 'IN_STOCK', 'Free One-Day Delivery by Prime', '1 Year Apple Official Warranty', 4.8, NOW()),
(1, 'Flipkart', 'https://flipkart.com/example-macbook-m3', 113990, 134900, 'INR', 15.5, 'IN_STOCK', 'Delivery in 2 business days', '1 Year Brand Warranty', 4.6, NOW()),
(1, 'Croma', 'https://croma.com/example-macbook-m3', 114900, 134900, 'INR', 14.8, 'IN_STOCK', 'Store pickup available today', '1 Year Official Warranty + Croma Support', 4.7, NOW()),
(1, 'Reliance Digital', 'https://reliancedigital.in/example-macbook-m3', 115900, 134900, 'INR', 14.0, 'IN_STOCK', 'Express 4-hour home delivery in select cities', '1 Year Official Warranty', 4.5, NOW()),

-- Dell XPS 15
(2, 'Dell India Store', 'https://dell.com/en-in/shop/xps15', 189990, 209990, 'INR', 9.5, 'IN_STOCK', 'Ships direct in 3-5 days', '1 Year Premium Support Plus with Onsite Service', 4.7, NOW()),
(2, 'Amazon India', 'https://amazon.in/dp/example-dell-xps15', 184990, 209990, 'INR', 11.9, 'IN_STOCK', 'Two-day delivery', '1 Year Onsite Hardware Warranty', 4.5, NOW()),
(2, 'Croma', 'https://croma.com/example-dell-xps15', 187900, 209990, 'INR', 10.5, 'FEW_LEFT', 'Delivery in 3 days', '1 Year Manufacturer Warranty', 4.6, NOW()),

-- Lenovo Legion Pro 5
(3, 'Lenovo Official', 'https://lenovo.com/in/legion-pro-5', 152990, 179990, 'INR', 15.0, 'IN_STOCK', 'Ships next business day', '2 Years Legion Ultimate Support Onsite', 4.9, NOW()),
(3, 'Amazon India', 'https://amazon.in/dp/example-legion-pro-5', 149990, 179990, 'INR', 16.7, 'IN_STOCK', 'Next day Prime delivery', '1 Year Onsite + 1 Year ADP Warranty', 4.7, NOW()),
(3, 'Flipkart', 'https://flipkart.com/example-legion-pro-5', 148990, 179990, 'INR', 17.2, 'IN_STOCK', 'Delivery in 2 days', '1 Year Manufacturer Warranty', 4.5, NOW()),

-- ASUS ROG Zephyrus G14
(4, 'Amazon India', 'https://amazon.in/dp/example-zephyrus-g14', 169990, 194990, 'INR', 12.8, 'IN_STOCK', 'Free One-Day Delivery', '1 Year International Warranty', 4.7, NOW()),
(4, 'Flipkart', 'https://flipkart.com/example-zephyrus-g14', 168500, 194990, 'INR', 13.5, 'FEW_LEFT', 'Delivery in 3 days', '1 Year Manufacturer Warranty', 4.4, NOW()),

-- Lenovo ThinkPad X1 Carbon
(5, 'Lenovo Official', 'https://lenovo.com/in/thinkpad-x1-carbon', 198990, 229990, 'INR', 13.5, 'IN_STOCK', 'Built to order in 5-7 days', '3 Years Premier Support Onsite', 4.9, NOW()),
(5, 'Amazon India', 'https://amazon.in/dp/example-thinkpad-x1', 194990, 229990, 'INR', 15.2, 'IN_STOCK', 'Prime Two-Day Delivery', '3 Years Brand Warranty', 4.8, NOW());

-- 7. PRICE HISTORY (Trend snapshots over the last 90 days)
INSERT INTO price_history (product_id, seller_name, price, currency, recorded_at) VALUES
-- MacBook Air M3 price tracking
(1, 'Amazon India', 124900, 'INR', NOW() - INTERVAL '90 days'),
(1, 'Amazon India', 122900, 'INR', NOW() - INTERVAL '60 days'),
(1, 'Amazon India', 119900, 'INR', NOW() - INTERVAL '30 days'),
(1, 'Amazon India', 114900, 'INR', NOW() - INTERVAL '5 days'),
(1, 'Flipkart', 123990, 'INR', NOW() - INTERVAL '90 days'),
(1, 'Flipkart', 118990, 'INR', NOW() - INTERVAL '45 days'),
(1, 'Flipkart', 113990, 'INR', NOW() - INTERVAL '2 days'),

-- Legion Pro 5 price tracking
(3, 'Amazon India', 164990, 'INR', NOW() - INTERVAL '90 days'),
(3, 'Amazon India', 158990, 'INR', NOW() - INTERVAL '60 days'),
(3, 'Amazon India', 154990, 'INR', NOW() - INTERVAL '30 days'),
(3, 'Amazon India', 149990, 'INR', NOW() - INTERVAL '3 days');

-- 8. PRODUCT REVIEWS & TRANSPARENT SUMMARIES
INSERT INTO product_reviews (product_id, source_name, source_url, rating, title, review_text, review_type, is_verified) VALUES
(1, 'The Verge', 'https://theverge.com/reviews/macbook-air-m3', 4.5,
 'The default laptop for almost everyone',
 'PROS: Unmatched 18-hour real world battery life, completely silent operation with no moving fan parts, crisp 13.6-inch Retina display, and MagSafe 3 charging. CONS: Dual external monitor support only works when the lid is closed; 8GB base memory models are obsolete (buy 16GB). VERDICT: Unbeatable for students, developers, and writers.',
 'EXPERT', TRUE),

(1, 'Verified Buyer Review', 'https://amazon.in/reviews/macbook-m3-sample', 5.0,
 'Flawless for full-stack software development',
 'Upgraded from an older Intel laptop. IntelliJ IDEA, Docker, multiple VS Code windows, and 20 Chrome tabs run with zero thermal throttling or fan noise. Battery lasts through a whole 10-hour workday without plugging in once.',
 'USER', TRUE),

(2, 'NotebookCheck', 'https://notebookcheck.net/dell-xps-15-review', 4.3,
 'Stunning OLED creator flagship with dated thermals under heavy loads',
 'PROS: Jaw-dropping 3.5K OLED touch panel with perfect black levels and 100% DCI-P3 coverage, premium aluminum and carbon fiber deck, spacious trackpad. CONS: RTX 4050 GPU is power-limited to 50W; runs hot and noisy when rendering 4K video.',
 'EXPERT', TRUE),

(3, 'Jarrod''s Tech', 'https://jarrodstech.com/legion-pro-5-review', 4.7,
 'King of mid-range gaming laptops in 2024',
 'PROS: Full 140W TGP RTX 4070 delivers desktop-level 1440p gaming; class-leading cooling keeps CPU under 82C; top-tier keyboard. CONS: Massive power brick weighs 1kg; battery drains in under 4 hours on casual browsing.',
 'EXPERT', TRUE);

-- 9. PRODUCT MEDIA
INSERT INTO product_media (product_id, media_type, media_url, title, alt_text, display_order, is_primary) VALUES
(1, 'IMAGE', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80', 'MacBook Air M3 Silver', 'Apple MacBook Air M3 Aluminum design', 1, TRUE),
(2, 'IMAGE', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80', 'Dell XPS 15 Front Angle', 'Dell XPS 15 with InfinityEdge Display', 1, TRUE),
(3, 'IMAGE', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80', 'Lenovo Legion Pro 5 RGB', 'Lenovo Legion Gaming Laptop Chassis', 1, TRUE),
(4, 'IMAGE', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80', 'ASUS Zephyrus G14 Slim', 'ASUS ROG Zephyrus G14 compact laptop', 1, TRUE),
(5, 'IMAGE', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80', 'ThinkPad X1 Carbon Minimalist', 'ThinkPad X1 Carbon matte black finish', 1, TRUE);
