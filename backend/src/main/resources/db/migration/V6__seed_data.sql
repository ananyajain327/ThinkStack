-- ============================================================
-- V6: Seed data (categories, specs, products, prices, history,
--      reviews, wizards). All product data is realistic MOCK data
--      for development; prices/reviews are NOT live and should be
--      replaced by external provider integrations in production.
-- ============================================================

-- ---------- Categories ----------
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
('Laptops',    'laptops',    'Notebooks, ultrabooks and gaming laptops',               'laptop',     1),
('Smartphones', 'smartphones', 'Mobile phones and phablets',                            'smartphone', 2),
('Headphones', 'headphones', 'Over-ear, on-ear and in-ear headphones',                 'headphones', 3),
('Monitors',   'monitors',   'Desktop and portable displays',                          'monitor',    4),
('Keyboards',  'keyboards',  'Mechanical, membrane and ergonomic keyboards',           'keyboard',   5),
('Cameras',    'cameras',    'DSLR, mirrorless and action cameras',                    'camera',     6)
ON CONFLICT (slug) DO NOTHING;

-- ---------- Laptop specification definitions ----------
INSERT INTO specification_definitions (category_id, name, key_name, data_type, unit, explanation, is_required, is_filterable, display_order)
SELECT c.id, sd.name, sd.key_name, sd.data_type, sd.unit, sd.explanation, sd.is_required, sd.is_filterable, sd.display_order
FROM categories c
CROSS JOIN (VALUES
    ('Processor', 'processor', 'TEXT', NULL,
     'The brain of the laptop. A newer/faster processor makes the laptop feel quicker at everyday and demanding tasks.', true, true, 1),
    ('RAM', 'ram', 'NUMERIC', 'GB',
     'How much memory is available for running programs at once. 8GB is fine for basics; 16GB is better for programming and multitasking.', true, true, 2),
    ('Storage', 'storage', 'NUMERIC', 'GB',
     'Space for files, apps and the operating system. 512GB is comfortable for most users; 1TB suits heavy media or games.', true, true, 3),
    ('Storage Type', 'storage_type', 'TEXT', NULL,
     'SSD loads everything much faster than old HDD drives. Look for SSD (NVMe) for the best responsiveness.', false, true, 4),
    ('Display Size', 'display_size', 'NUMERIC', 'inches',
     'Screen size. 13-14in is portable, 15.6in is a good balance, 16in+ is big for productivity or gaming.', true, true, 5),
    ('Display Resolution', 'display_resolution', 'TEXT', NULL,
     'Pixel sharpness. 1080p (Full HD) is standard; 1440p (QHD) and 4K are noticeably sharper.', false, true, 6),
    ('Battery Life', 'battery_life', 'NUMERIC', 'hours',
     'How long the laptop lasts on a single charge for typical use. 6-8 hours is good for all-day portability.', false, true, 7),
    ('Weight', 'weight', 'NUMERIC', 'kg',
     'Total weight of the laptop. Lighter (~1.4kg) is easier to carry daily.', false, true, 8),
    ('GPU', 'gpu', 'TEXT', NULL,
     'Graphics hardware. Integrated graphics handle office/streaming; a dedicated GPU is needed for gaming and rendering.', false, true, 9),
    ('OS', 'os', 'TEXT', NULL,
     'Operating system. Windows is the most universal, macOS only on Apple laptops, Linux is popular with developers.', false, true, 10),
    ('Thunderbolt', 'thunderbolt', 'BOOLEAN', NULL,
     'A very fast USB-C port that can connect displays, docks and external drives at high speed.', false, false, 11),
    ('Fingerprint Reader', 'fingerprint_reader', 'BOOLEAN', NULL,
     'Lets you unlock the laptop with your finger instead of typing a password.', false, false, 12)
) AS sd(name, key_name, data_type, unit, explanation, is_required, is_filterable, display_order)
WHERE c.slug = 'laptops'
ON CONFLICT DO NOTHING;

-- ---------- Smartphone specification definitions ----------
INSERT INTO specification_definitions (category_id, name, key_name, data_type, unit, explanation, is_required, is_filterable, display_order)
SELECT c.id, sd.name, sd.key_name, sd.data_type, sd.unit, sd.explanation, sd.is_required, sd.is_filterable, sd.display_order
FROM categories c
CROSS JOIN (VALUES
    ('Chipset', 'chipset', 'TEXT', NULL,
     'The phone''s brain. It decides how snappy the phone feels for apps, gaming and multitasking.', true, true, 1),
    ('RAM', 'ram', 'NUMERIC', 'GB',
     'Memory for running apps at once. 6-8GB is good for most people; 12GB suits heavy gaming and multitasking.', true, true, 2),
    ('Storage', 'storage', 'NUMERIC', 'GB',
     'Space for photos, apps and files. 128GB is the comfy minimum today.', true, true, 3),
    ('Screen Size', 'screen_size', 'NUMERIC', 'inches',
     'Display size. Larger screens are better for media; smaller phones are easier to hold.', true, true, 4),
    ('Refresh Rate', 'refresh_rate', 'NUMERIC', 'Hz',
     'How many times the screen refreshes per second. 120Hz makes scrolling and animations look smoother.', false, true, 5),
    ('Main Camera', 'main_camera', 'NUMERIC', 'MP',
     'Resolution of the primary rear camera. More megapixels does not always mean better photos — sensor quality matters more.', false, true, 6),
    ('Selfie Camera', 'selfie_camera', 'NUMERIC', 'MP',
     'Resolution of the front-facing camera used for selfies and video calls.', false, false, 7),
    ('Battery', 'battery', 'NUMERIC', 'mAh',
     'Battery capacity. Roughly 5000mAh lasts a full day for typical use; 4000mAh is adequate.', true, true, 8),
    ('Charging Speed', 'charging_speed', 'NUMERIC', 'W',
     'Charging wattage. Higher watts recharge the battery faster, e.g. 67W tops up in about 30 minutes.', false, true, 9),
    ('5G Support', 'five_g', 'BOOLEAN', NULL,
     'Whether the phone can connect to 5G mobile networks for faster data speeds.', false, true, 10),
    ('Water Resistance', 'water_resistance', 'TEXT', NULL,
     'Resistance to dust and water splashes (IP rating). IP67/IP68 can survive a drop in a puddle; basic phones have none.', false, true, 11),
    ('Weight', 'weight', 'NUMERIC', 'grams',
     'Total phone weight. Lighter phones (~180g) are easier to hold for long periods.', false, true, 12)
) AS sd(name, key_name, data_type, unit, explanation, is_required, is_filterable, display_order)
WHERE c.slug = 'smartphones'
ON CONFLICT DO NOTHING;

-- ---------- Products (Laptops, INR) ----------
INSERT INTO products (category_id, name, slug, brand, model, description, image_url, base_price, currency, avg_rating, review_count) VALUES
((SELECT id FROM categories WHERE slug='laptops'), 'HP Pavilion 15', 'hp-pavilion-15',
 'HP', 'Pavilion 15 (13th Gen)',
 'A well-rounded 15.6-inch laptop for college, office work and light entertainment. Strong 13th-gen Intel processor and 16GB RAM at a friendly price.',
 'https://placehold.co/600x400/1f2937/ffffff?text=HP+Pavilion+15', 62990, 'INR', 4.4, 412),
((SELECT id FROM categories WHERE slug='laptops'), 'Lenovo IdeaPad Slim 5', 'lenovo-ideapad-slim-5',
 'Lenovo', 'IdeaPad Slim 5 (AMD)',
 'A light, premium-feeling ultrabook with an efficient Ryzen 7 chip, 16GB RAM and a big 1TB SSD. Great value for students and programmers.',
 'https://placehold.co/600x400/0f172a/ffffff?text=Lenovo+IdeaPad+Slim+5', 68990, 'INR', 4.5, 356),
((SELECT id FROM categories WHERE slug='laptops'), 'Dell Inspiron 15', 'dell-inspiron-15',
 'Dell', 'Inspiron 15 3515',
 'A dependable everyday laptop with solid build quality and a comfortable keyboard. Ideal for study and office paperwork.',
 'https://placehold.co/600x400/172554/ffffff?text=Dell+Inspiron+15', 54990, 'INR', 4.2, 528),
((SELECT id FROM categories WHERE slug='laptops'), 'ASUS Vivobook 16X', 'asus-vivobook-16x',
 'ASUS', 'Vivobook 16X',
 'An affordable big-screen laptop with a 16-inch display and a capable 12th-gen Intel processor. Great for multimedia and general use.',
 'https://placehold.co/600x400/111827/ffffff?text=ASUS+Vivobook+16X', 48990, 'INR', 4.1, 301),
((SELECT id FROM categories WHERE slug='laptops'), 'Apple MacBook Air M1', 'apple-macbook-air-m1',
 'Apple', 'MacBook Air (M1, 2020)',
 'Fan-less, silent and ultra-portable ultrabook with exceptional battery life. The M1 chip still breezes through programming and creative work.',
 'https://placehold.co/600x400/1f2937/ffffff?text=MacBook+Air+M1', 74990, 'INR', 4.7, 892),
((SELECT id FROM categories WHERE slug='laptops'), 'Acer Predator Helios Neo 16', 'acer-predator-helios-neo-16',
 'Acer', 'Predator Helios Neo 16',
 'A powerful gaming laptop with a 13th-gen i7 and RTX 4060 graphics. Handles modern games and heavy rendering workloads.',
 'https://placehold.co/600x400/000000/ffffff?text=Acer+Predator+Neo+16', 119990, 'INR', 4.3, 187),
((SELECT id FROM categories WHERE slug='smartphones'), 'Samsung Galaxy M34 5G', 'samsung-galaxy-m34',
 'Samsung', 'Galaxy M34 5G',
 'A budget 5G phone with a big 6000mAh battery that easily lasts all day. Reliable for calls, social media and light gaming.',
 'https://placehold.co/600x400/0f172a/ffffff?text=Galaxy+M34', 16499, 'INR', 4.1, 1234),
((SELECT id FROM categories WHERE slug='smartphones'), 'Nothing Phone (2a)', 'nothing-phone-2a',
 'Nothing', 'Phone (2a)',
 'A distinctive mid-range phone with a clean, bloatware-free experience, excellent display and day-long battery.',
 'https://placehold.co/600x400/111827/ffffff?text=Nothing+Phone+2a', 23999, 'INR', 4.4, 689),
((SELECT id FROM categories WHERE slug='smartphones'), 'OnePlus Nord CE 4', 'oneplus-nord-ce-4',
 'OnePlus', 'Nord CE 4',
 'A smooth all-rounder with fast 100W charging and a great 120Hz display. Solid value for everyday performance.',
 'https://placehold.co/600x400/1e293b/ffffff?text=OnePlus+Nord+CE+4', 24999, 'INR', 4.3, 1024),
((SELECT id FROM categories WHERE slug='smartphones'), 'Google Pixel 7a', 'google-pixel-7a',
 'Google', 'Pixel 7a',
 'A compact phone famous for its excellent camera and clean Android experience. Great for photography-minded buyers.',
 'https://placehold.co/600x400/0f172a/ffffff?text=Google+Pixel+7a', 38999, 'INR', 4.5, 1431)
ON CONFLICT (slug) DO NOTHING;

-- ---------- Product specifications ----------
INSERT INTO product_specifications (product_id, spec_def_id, text_value, numeric_value, boolean_value)
SELECT p.id, sd.id, v.text_value, v.numeric_value, v.boolean_value
FROM products p
JOIN specification_definitions sd ON sd.category_id = p.category_id
JOIN (VALUES
    -- Laptops
    ('hp-pavilion-15',             'processor', 'Intel Core i5-1334U', NULL, NULL),
    ('hp-pavilion-15',             'ram', NULL, 16, NULL),
    ('hp-pavilion-15',             'storage', NULL, 512, NULL),
    ('hp-pavilion-15',             'storage_type', 'NVMe SSD', NULL, NULL),
    ('hp-pavilion-15',             'display_size', NULL, 15.6, NULL),
    ('hp-pavilion-15',             'display_resolution', '1920 x 1080 (Full HD)', NULL, NULL),
    ('hp-pavilion-15',             'battery_life', NULL, 7, NULL),
    ('hp-pavilion-15',             'weight', NULL, 1.75, NULL),
    ('hp-pavilion-15',             'gpu', 'Intel Iris Xe (integrated)', NULL, NULL),
    ('hp-pavilion-15',             'os', 'Windows 11', NULL, NULL),
    ('hp-pavilion-15',             'thunderbolt', NULL, NULL, false),
    ('hp-pavilion-15',             'fingerprint_reader', NULL, NULL, true),
    ('lenovo-ideapad-slim-5',      'processor', 'AMD Ryzen 7 7730U', NULL, NULL),
    ('lenovo-ideapad-slim-5',      'ram', NULL, 16, NULL),
    ('lenovo-ideapad-slim-5',      'storage', NULL, 1024, NULL),
    ('lenovo-ideapad-slim-5',      'storage_type', 'NVMe SSD', NULL, NULL),
    ('lenovo-ideapad-slim-5',      'display_size', NULL, 15.6, NULL),
    ('lenovo-ideapad-slim-5',      'display_resolution', '1920 x 1080 (Full HD)', NULL, NULL),
    ('lenovo-ideapad-slim-5',      'battery_life', NULL, 8, NULL),
    ('lenovo-ideapad-slim-5',      'weight', NULL, 1.5, NULL),
    ('lenovo-ideapad-slim-5',      'gpu', 'AMD Radeon (integrated)', NULL, NULL),
    ('lenovo-ideapad-slim-5',      'os', 'Windows 11', NULL, NULL),
    ('lenovo-ideapad-slim-5',      'thunderbolt', NULL, NULL, false),
    ('lenovo-ideapad-slim-5',      'fingerprint_reader', NULL, NULL, true),
    ('dell-inspiron-15',           'processor', 'Intel Core i5-1135G7', NULL, NULL),
    ('dell-inspiron-15',           'ram', NULL, 8, NULL),
    ('dell-inspiron-15',           'storage', NULL, 512, NULL),
    ('dell-inspiron-15',           'storage_type', 'NVMe SSD', NULL, NULL),
    ('dell-inspiron-15',           'display_size', NULL, 15.6, NULL),
    ('dell-inspiron-15',           'display_resolution', '1920 x 1080 (Full HD)', NULL, NULL),
    ('dell-inspiron-15',           'battery_life', NULL, 6, NULL),
    ('dell-inspiron-15',           'weight', NULL, 1.83, NULL),
    ('dell-inspiron-15',           'gpu', 'Intel Iris Xe (integrated)', NULL, NULL),
    ('dell-inspiron-15',           'os', 'Windows 11', NULL, NULL),
    ('dell-inspiron-15',           'thunderbolt', NULL, NULL, false),
    ('dell-inspiron-15',           'fingerprint_reader', NULL, NULL, false),
    ('asus-vivobook-16x',          'processor', 'Intel Core i5-12450H', NULL, NULL),
    ('asus-vivobook-16x',          'ram', NULL, 8, NULL),
    ('asus-vivobook-16x',          'storage', NULL, 512, NULL),
    ('asus-vivobook-16x',          'storage_type', 'NVMe SSD', NULL, NULL),
    ('asus-vivobook-16x',          'display_size', NULL, 16.0, NULL),
    ('asus-vivobook-16x',          'display_resolution', '1920 x 1200 (WUXGA)', NULL, NULL),
    ('asus-vivobook-16x',          'battery_life', NULL, 6, NULL),
    ('asus-vivobook-16x',          'weight', NULL, 1.8, NULL),
    ('asus-vivobook-16x',          'gpu', 'Intel UHD (integrated)', NULL, NULL),
    ('asus-vivobook-16x',          'os', 'Windows 11', NULL, NULL),
    ('asus-vivobook-16x',          'thunderbolt', NULL, NULL, false),
    ('asus-vivobook-16x',          'fingerprint_reader', NULL, NULL, false),
    ('apple-macbook-air-m1',       'processor', 'Apple M1 chip', NULL, NULL),
    ('apple-macbook-air-m1',       'ram', NULL, 8, NULL),
    ('apple-macbook-air-m1',       'storage', NULL, 256, NULL),
    ('apple-macbook-air-m1',       'storage_type', 'NVMe SSD', NULL, NULL),
    ('apple-macbook-air-m1',       'display_size', NULL, 13.3, NULL),
    ('apple-macbook-air-m1',       'display_resolution', '2560 x 1600 (Retina)', NULL, NULL),
    ('apple-macbook-air-m1',       'battery_life', NULL, 15, NULL),
    ('apple-macbook-air-m1',       'weight', NULL, 1.29, NULL),
    ('apple-macbook-air-m1',       'gpu', 'Apple 7-core GPU', NULL, NULL),
    ('apple-macbook-air-m1',       'os', 'macOS', NULL, NULL),
    ('apple-macbook-air-m1',       'thunderbolt', NULL, NULL, true),
    ('apple-macbook-air-m1',       'fingerprint_reader', NULL, NULL, true),
    ('acer-predator-helios-neo-16','processor', 'Intel Core i7-13700HX', NULL, NULL),
    ('acer-predator-helios-neo-16','ram', NULL, 16, NULL),
    ('acer-predator-helios-neo-16','storage', NULL, 1024, NULL),
    ('acer-predator-helios-neo-16','storage_type', 'NVMe SSD', NULL, NULL),
    ('acer-predator-helios-neo-16','display_size', NULL, 16.0, NULL),
    ('acer-predator-helios-neo-16','display_resolution', '2560 x 1600 (QHD+)', NULL, NULL),
    ('acer-predator-helios-neo-16','battery_life', NULL, 5, NULL),
    ('acer-predator-helios-neo-16','weight', NULL, 2.6, NULL),
    ('acer-predator-helios-neo-16','gpu', 'NVIDIA GeForce RTX 4060', NULL, NULL),
    ('acer-predator-helios-neo-16','os', 'Windows 11', NULL, NULL),
    ('acer-predator-helios-neo-16','thunderbolt', NULL, NULL, false),
    ('acer-predator-helios-neo-16','fingerprint_reader', NULL, NULL, false),
    -- Smartphones
    ('samsung-galaxy-m34',         'chipset', 'Samsung Exynos 1280', NULL, NULL),
    ('samsung-galaxy-m34',         'ram', NULL, 8, NULL),
    ('samsung-galaxy-m34',         'storage', NULL, 128, NULL),
    ('samsung-galaxy-m34',         'screen_size', NULL, 6.5, NULL),
    ('samsung-galaxy-m34',         'refresh_rate', NULL, 120, NULL),
    ('samsung-galaxy-m34',         'main_camera', NULL, 50, NULL),
    ('samsung-galaxy-m34',         'selfie_camera', NULL, 13, NULL),
    ('samsung-galaxy-m34',         'battery', NULL, 6000, NULL),
    ('samsung-galaxy-m34',         'charging_speed', NULL, 25, NULL),
    ('samsung-galaxy-m34',         'five_g', NULL, NULL, true),
    ('samsung-galaxy-m34',         'water_resistance', 'No', NULL, NULL),
    ('samsung-galaxy-m34',         'weight', NULL, 208, NULL),
    ('nothing-phone-2a',           'chipset', 'MediaTek Dimensity 7200 Pro', NULL, NULL),
    ('nothing-phone-2a',           'ram', NULL, 8, NULL),
    ('nothing-phone-2a',           'storage', NULL, 128, NULL),
    ('nothing-phone-2a',           'screen_size', NULL, 6.7, NULL),
    ('nothing-phone-2a',           'refresh_rate', NULL, 120, NULL),
    ('nothing-phone-2a',           'main_camera', NULL, 50, NULL),
    ('nothing-phone-2a',           'selfie_camera', NULL, 32, NULL),
    ('nothing-phone-2a',           'battery', NULL, 5000, NULL),
    ('nothing-phone-2a',           'charging_speed', NULL, 45, NULL),
    ('nothing-phone-2a',           'five_g', NULL, NULL, true),
    ('nothing-phone-2a',           'water_resistance', 'IP54', NULL, NULL),
    ('nothing-phone-2a',           'weight', NULL, 190, NULL),
    ('oneplus-nord-ce-4',          'chipset', 'Qualcomm Snapdragon 7 Gen 3', NULL, NULL),
    ('oneplus-nord-ce-4',          'ram', NULL, 8, NULL),
    ('oneplus-nord-ce-4',          'storage', NULL, 128, NULL),
    ('oneplus-nord-ce-4',          'screen_size', NULL, 6.7, NULL),
    ('oneplus-nord-ce-4',          'refresh_rate', NULL, 120, NULL),
    ('oneplus-nord-ce-4',          'main_camera', NULL, 50, NULL),
    ('oneplus-nord-ce-4',          'selfie_camera', NULL, 16, NULL),
    ('oneplus-nord-ce-4',          'battery', NULL, 5500, NULL),
    ('oneplus-nord-ce-4',          'charging_speed', NULL, 100, NULL),
    ('oneplus-nord-ce-4',          'five_g', NULL, NULL, true),
    ('oneplus-nord-ce-4',          'water_resistance', 'No', NULL, NULL),
    ('oneplus-nord-ce-4',          'weight', NULL, 186, NULL),
    ('google-pixel-7a',            'chipset', 'Google Tensor G2', NULL, NULL),
    ('google-pixel-7a',            'ram', NULL, 8, NULL),
    ('google-pixel-7a',            'storage', NULL, 128, NULL),
    ('google-pixel-7a',            'screen_size', NULL, 6.1, NULL),
    ('google-pixel-7a',            'refresh_rate', NULL, 90, NULL),
    ('google-pixel-7a',            'main_camera', NULL, 64, NULL),
    ('google-pixel-7a',            'selfie_camera', NULL, 13, NULL),
    ('google-pixel-7a',            'battery', NULL, 4385, NULL),
    ('google-pixel-7a',            'charging_speed', NULL, 18, NULL),
    ('google-pixel-7a',            'five_g', NULL, NULL, true),
    ('google-pixel-7a',            'water_resistance', 'IP67', NULL, NULL),
    ('google-pixel-7a',            'weight', NULL, 193, NULL)
) AS v(slug, key_name, text_value, numeric_value, boolean_value)
ON v.slug = p.slug AND v.key_name = sd.key_name
ON CONFLICT DO NOTHING;

-- ---------- Product prices ----------
INSERT INTO product_prices (product_id, seller_name, seller_url, price, original_price, currency, in_stock, shipping_cost, seller_rating, delivery_info, last_checked_at)
SELECT p.id, v.seller, v.url, v.price, v.original, 'INR', true, v.shipping, v.rating, v.delivery, NOW() - (v.checked_days || ' days')::interval
FROM products p
JOIN (VALUES
    -- Laptops
    ('hp-pavilion-15',              'Amazon.in', 'https://www.amazon.in/dp/hp-pavilion-15',  62990, 71990, 0, 4.6, '1-3 business days', 2),
    ('hp-pavilion-15',              'Flipkart',  'https://www.flipkart.com/hp-pavilion-15',   63490, 71990, 0, 4.3, '2-4 business days', 5),
    ('lenovo-ideapad-slim-5',       'Amazon.in', 'https://www.amazon.in/dp/lenovo-slim-5',   68990, 78990, 0, 4.7, '1-3 business days', 1),
    ('lenovo-ideapad-slim-5',       'Flipkart',  'https://www.flipkart.com/lenovo-slim-5',   69990, 78990, 0, 4.4, '2-4 business days', 4),
    ('dell-inspiron-15',            'Amazon.in', 'https://www.amazon.in/dp/dell-inspiron',   54990, 62990, 0, 4.4, '1-3 business days', 3),
    ('dell-inspiron-15',            'Croma',     'https://www.croma.com/dell-inspiron-15',    55990, 62990, 0, 4.2, 'Store pickup / 3-5 days', 6),
    ('asus-vivobook-16x',           'Flipkart',  'https://www.flipkart.com/asus-vivobook',    48990, 54990, 0, 4.1, '2-4 business days', 2),
    ('asus-vivobook-16x',           'Amazon.in', 'https://www.amazon.in/dp/asus-vivobook',   49490, 54990, 0, 4.0, '1-3 business days', 7),
    ('apple-macbook-air-m1',        'Amazon.in', 'https://www.amazon.in/dp/macbook-air-m1',  74990, 99900, 0, 4.8, '1-2 business days', 1),
    ('apple-macbook-air-m1',        'Flipkart',  'https://www.flipkart.com/macbook-air-m1',   75990, 99900, 0, 4.6, '1-3 business days', 3),
    ('acer-predator-helios-neo-16', 'Amazon.in', 'https://www.amazon.in/dp/acer-predator',  119990, 139990, 0, 4.5, '2-4 business days', 2),
    ('acer-predator-helios-neo-16', 'Flipkart',  'https://www.flipkart.com/acer-predator',  121990, 139990, 0, 4.2, '3-5 business days', 5),
    -- Smartphones
    ('samsung-galaxy-m34',          'Amazon.in', 'https://www.amazon.in/dp/galaxy-m34',      16499, 22999, 0, 4.4, '1-3 business days', 2),
    ('samsung-galaxy-m34',          'Flipkart',  'https://www.flipkart.com/galaxy-m34',      16999, 22999, 0, 4.1, '2-4 business days', 4),
    ('nothing-phone-2a',            'Amazon.in', 'https://www.amazon.in/dp/nothing-2a',      23999, 25999, 0, 4.5, '1-3 business days', 1),
    ('nothing-phone-2a',            'Flipkart',  'https://www.flipkart.com/nothing-2a',      24499, 25999, 0, 4.2, '2-4 business days', 3),
    ('oneplus-nord-ce-4',           'Amazon.in', 'https://www.amazon.in/dp/nord-ce-4',       24999, 27999, 0, 4.5, '1-3 business days', 2),
    ('oneplus-nord-ce-4',           'OnePlus.com','https://www.oneplus.in/nord-ce-4',        24999, 27999, 0, 4.6, '2-4 business days', 6),
    ('google-pixel-7a',             'Flipkart',  'https://www.flipkart.com/pixel-7a',        38999, 43999, 0, 4.6, '2-4 business days', 3),
    ('google-pixel-7a',             'Amazon.in', 'https://www.amazon.in/dp/pixel-7a',        39499, 43999, 0, 4.7, '1-3 business days', 5)
) AS v(slug, seller, url, price, original, shipping, rating, delivery, checked_days)
ON v.slug = p.slug
ON CONFLICT DO NOTHING;

-- ---------- Price history (sample trends) ----------
INSERT INTO price_history (product_id, seller_name, price, currency, recorded_at)
SELECT p.id, 'Amazon.in', v.price, 'INR', NOW() - (v.days || ' days')::interval
FROM products p
JOIN (VALUES
    ('hp-pavilion-15', 71990, 35), ('hp-pavilion-15', 68990, 28), ('hp-pavilion-15', 66990, 21),
    ('hp-pavilion-15', 64990, 14), ('hp-pavilion-15', 63490, 7),  ('hp-pavilion-15', 62990, 0),
    ('lenovo-ideapad-slim-5', 78990, 35), ('lenovo-ideapad-slim-5', 75990, 28), ('lenovo-ideapad-slim-5', 72990, 21),
    ('lenovo-ideapad-slim-5', 70990, 14), ('lenovo-ideapad-slim-5', 69490, 7),  ('lenovo-ideapad-slim-5', 68990, 0),
    ('apple-macbook-air-m1', 99900, 40), ('apple-macbook-air-m1', 89900, 30), ('apple-macbook-air-m1', 79900, 20),
    ('apple-macbook-air-m1', 76990, 10), ('apple-macbook-air-m1', 74990, 0),
    ('acer-predator-helios-neo-16', 139990, 35), ('acer-predator-helios-neo-16', 135000, 28),
    ('acer-predator-helios-neo-16', 129990, 21), ('acer-predator-helios-neo-16', 124990, 14),
    ('acer-predator-helios-neo-16', 121990, 7),  ('acer-predator-helios-neo-16', 119990, 0),
    ('nothing-phone-2a', 25999, 30), ('nothing-phone-2a', 24999, 20), ('nothing-phone-2a', 24499, 10),
    ('nothing-phone-2a', 23999, 0),
    ('google-pixel-7a', 43999, 40), ('google-pixel-7a', 42999, 30), ('google-pixel-7a', 40999, 20),
    ('google-pixel-7a', 39999, 10), ('google-pixel-7a', 38999, 0)
) AS v(slug, price, days)
ON v.slug = p.slug;

-- ---------- Reviews ----------
INSERT INTO product_reviews (product_id, review_type, source, source_url, author_name, rating, title, content, sentiment, sentiment_score, verified_purchase, helpful_count, review_date)
SELECT p.id, 'USER', 'Amazon.in', 'https://www.amazon.in/hp-pavilion-15', v.author, v.rating, v.title, v.content, v.sentiment, v.score, true, v.helpful, CURRENT_DATE - (v.days || ' days')::interval
FROM products p
JOIN (VALUES
    ('hp-pavilion-15', 'Rohit S.', 5.0, 'Perfect for college and coding', '16GB RAM with this processor feels very smooth. Multitasking between VS Code, browser and PDFs never slows down.', 'POSITIVE', 0.85, 42, 6),
    ('hp-pavilion-15', 'Ananya K.', 4.0, 'Good all-rounder, average battery', 'Battery gives about 6-7 hours which is okay but not outstanding. Build feels sturdy. Display is fine for the price.', 'POSITIVE', 0.62, 28, 15),
    ('hp-pavilion-15', 'Meera V.', 4.5, 'Best value buy in this range', 'I compared 5 laptops and this gave the best specs for the price. The fingerprint unlock is a nice bonus.', 'POSITIVE', 0.78, 51, 20),
    ('lenovo-ideapad-slim-5', 'Arjun D.', 5.0, 'Premium feel, great battery', 'Very light and quiet. The 1TB SSD is generous and the 8-hour battery got me through full college days.', 'POSITIVE', 0.9, 63, 8),
    ('lenovo-ideapad-slim-5', 'Sneha P.', 4.0, 'Great for programming', 'Ryzen 7 plus 16GB RAM is plenty for dev work. Speakers are average but okay.', 'POSITIVE', 0.7, 34, 12),
    ('dell-inspiron-15', 'Karan M.', 3.5, 'Fine for basics, RAM is limiting', 'Only 8GB RAM; heavy multitasking slows it down. For studies and documents it is perfectly fine.', 'NEUTRAL', 0.1, 22, 10),
    ('dell-inspiron-15', 'Pooja R.', 4.0, 'Reliable workhorse', 'Used for office work daily. Keyboard is comfortable, build is solid. Not a gaming machine.', 'POSITIVE', 0.55, 18, 25),
    ('asus-vivobook-16x', 'Varun T.', 4.0, 'Big screen on a budget', 'The 16-inch display is great for content. 8GB RAM is a slight constraint but acceptable at this price.', 'POSITIVE', 0.5, 15, 14),
    ('asus-vivobook-16x', 'Divya N.', 3.5, 'Decent but nothing special', 'Does the job for browsing and media. Expect to add more RAM later for heavy workloads.', 'NEUTRAL', 0.05, 9, 18),
    ('apple-macbook-air-m1', 'Nikhil B.', 5.0, 'Still the best ultrabook', 'Silent, instant, and the battery easily lasts a full day. M1 handles my Flutter development beautifully.', 'POSITIVE', 0.95, 110, 5),
    ('apple-macbook-air-m1', 'Rhea G.', 4.5, 'Excellent for daily work', 'Bought it for design work. Colors are accurate and it never gets hot. Only 8GB RAM is the caveat if you open many tabs.', 'POSITIVE', 0.75, 84, 30),
    ('apple-macbook-air-m1', 'Aditya L.', 4.0, 'Genuine but macOS learning curve', 'If you are switching from Windows, plan a few days to adjust. Once you do, it is very smooth.', 'POSITIVE', 0.6, 39, 22),
    ('acer-predator-helios-neo-16', 'Ishaan C.', 4.5, 'Beast for gaming and rendering', 'RTX 4060 runs everything I throw at it. Fans are audible under load and it is heavy, as expected.', 'POSITIVE', 0.72, 27, 9),
    ('acer-predator-helios-neo-16', 'Tanvi J.', 4.0, 'Great performance, needs power', 'Excellent screen and performance. Battery drains fast while gaming, so keep the charger nearby.', 'POSITIVE', 0.58, 16, 11),
    ('samsung-galaxy-m34', 'Harsh A.', 4.5, 'Two-day battery is real', 'The 6000mAh battery genuinely lasts two days of normal use. Great value for a first smartphone.', 'POSITIVE', 0.8, 96, 7),
    ('samsung-galaxy-m34', 'Nikita S.', 4.0, 'Good budget 5G phone', 'Cameras are decent in daylight. Slightly heavy, but for the price it is a steal.', 'POSITIVE', 0.6, 71, 13),
    ('nothing-phone-2a', 'Yash K.', 4.5, 'Clean software, smooth display', 'The 120Hz display and stock-like Android make everything feel fluid. Battery easily lasts a day.', 'POSITIVE', 0.82, 58, 6),
    ('nothing-phone-2a', 'Ishita B.', 4.0, 'Looks unique, works great', 'Love the design and no bloatware. Camera is good but not flagship level.', 'POSITIVE', 0.65, 44, 9),
    ('oneplus-nord-ce-4', 'Rohan M.', 4.5, 'Fast charging is a gamechanger', '100W charging tops the phone up in minutes. Snappy performance for everyday use and casual gaming.', 'POSITIVE', 0.78, 67, 8),
    ('oneplus-nord-ce-4', 'Simran P.', 4.0, 'Well-rounded performer', 'Good display, smooth UI and solid cameras. Recommend it strongly in this budget.', 'POSITIVE', 0.68, 52, 11),
    ('google-pixel-7a', 'Kunal V.', 5.0, 'Camera king at this price', 'Photos come out fantastic even in low light. Compact size and clean Android. Battery is the only weak spot.', 'POSITIVE', 0.84, 120, 4),
    ('google-pixel-7a', 'Zoya F.', 4.0, 'Smooth and secure updates', 'Best-in-class software updates and the camera justifies the price. Charging is slower than rivals.', 'POSITIVE', 0.66, 88, 10)
) AS v(slug, author, rating, title, content, sentiment, score, helpful, days)
ON v.slug = p.slug;

-- ---------- Wizards ----------

-- Laptop wizard
INSERT INTO decision_wizards (category_id, name, description) VALUES
((SELECT id FROM categories WHERE slug='laptops'), 'Laptop Finder',
 'Answer a few simple questions and ThinkStack will recommend the laptop that matches YOUR needs and budget.');

INSERT INTO wizard_questions (wizard_id, question_key, question_text, question_type, options, help_text, weight, display_order, is_required)
SELECT w.id, v.key, v.text, v.qtype, v.options::jsonb, v.help, v.weight, v.ord, v.required
FROM decision_wizards w
CROSS JOIN (VALUES
    ('purpose', 'What are you mainly going to use this laptop for?', 'SINGLE_CHOICE',
     '[{"label":"College / Study","value":"college"},{"label":"Programming","value":"programming"},{"label":"Office Work","value":"office"},{"label":"Gaming","value":"gaming"},{"label":"Video Editing","value":"video_editing"},{"label":"Designing","value":"designing"},{"label":"General Use","value":"general"}]',
     'Pick the closest match. ThinkStack tailors the rest of the questions to your answer.', 1.5, 1, true),
    ('budget_min', 'What is the lowest price you would consider? (optional)', 'NUMBER',
     '{"min":10000,"max":300000,"step":5000}', 'Leave empty if you just want to stay under a maximum.', 0.5, 2, false),
    ('budget_max', 'What is your maximum budget? Please enter in rupees (₹).', 'NUMBER',
     '{"min":10000,"max":300000,"step":5000}', 'ThinkStack will never push a laptop above this amount as the main recommendation.', 1.5, 3, true),
    ('operating_system', 'Which operating system do you prefer?', 'SINGLE_CHOICE',
     '[{"label":"Windows","value":"windows"},{"label":"macOS","value":"macos"},{"label":"Linux","value":"linux"},{"label":"No preference","value":"any"}]',
     'Windows works with everything, macOS is exclusive to Apple laptops, Linux is loved by developers.', 1.0, 4, false),
    ('performance', 'How important is raw performance to you?', 'RANGE',
     '{"min":1,"max":5,"step":1,"labels":["Not important","Slightly","Important","Very important","Critical"]}',
     'Higher performance means faster processors and more RAM. Useful for programming, editing and gaming.', 1.2, 5, false),
    ('battery', 'How important is battery life?', 'RANGE',
     '{"min":1,"max":5,"step":1,"labels":["Not important","Slightly","Important","Very important","Critical"]}',
     'If you move around a lot, a long battery avoids hunting for chargers.', 1.2, 6, false),
    ('portability', 'How important is it that the laptop is light and portable?', 'RANGE',
     '{"min":1,"max":5,"step":1,"labels":["Not important","Slightly","Important","Very important","Critical"]}',
     'Lighter laptops (under 1.5kg) are much easier to carry every day.', 1.0, 7, false),
    ('display', 'How important is screen quality?', 'RANGE',
     '{"min":1,"max":5,"step":1,"labels":["Not important","Slightly","Important","Very important","Critical"]}',
     'Higher resolution and brightness help with design work, video and long reading sessions.', 1.0, 8, false),
    ('gaming', 'Will you play games on this laptop?', 'RANGE',
     '{"min":1,"max":5,"step":1,"labels":["No gaming","Occasionally","Some","Regularly","Gaming is a priority"]}',
     'Gaming needs a dedicated GPU, which adds weight and cost.', 1.2, 9, false),
    ('ram_min', 'How much RAM do you think you need? (AI will explain if unsure)', 'NUMBER',
     '{"min":8,"max":64,"step":8}', '8GB handles basics. 16GB is the sweet spot for programming and multitasking. 32GB+ for heavy workloads.', 1.0, 10, false),
    ('storage_min', 'How much storage do you need? (GB)', 'NUMBER',
     '{"min":256,"max":2048,"step":256}', '256GB is tight; 512GB is comfortable; 1TB is great for games and media libraries.', 1.0, 11, false),
    ('brand_preferences', 'Any brand you favour?', 'MULTI_CHOICE',
     '[{"label":"Any brand","value":"any"},{"label":"HP","value":"hp"},{"label":"Lenovo","value":"lenovo"},{"label":"Dell","value":"dell"},{"label":"Apple","value":"apple"},{"label":"ASUS","value":"asus"},{"label":"Acer","value":"acer"}]',
     'You can skip this if you have no preference — ThinkStack will not penalise any brand.', 0.5, 12, false)
) AS v(key, text, qtype, options, help, weight, ord, required)
WHERE w.category_id = (SELECT id FROM categories WHERE slug='laptops')
ON CONFLICT DO NOTHING;

-- Smartphone wizard
INSERT INTO decision_wizards (category_id, name, description) VALUES
((SELECT id FROM categories WHERE slug='smartphones'), 'Smartphone Finder',
 'Tell ThinkStack how you use your phone and what you can spend — it will find the best match for you.');

INSERT INTO wizard_questions (wizard_id, question_key, question_text, question_type, options, help_text, weight, display_order, is_required)
SELECT w.id, v.key, v.text, v.qtype, v.options::jsonb, v.help, v.weight, v.ord, v.required
FROM decision_wizards w
CROSS JOIN (VALUES
    ('purpose', 'What are you mainly going to use this phone for?', 'SINGLE_CHOICE',
     '[{"label":"Everyday Use","value":"everyday"},{"label":"Photography","value":"photography"},{"label":"Gaming","value":"gaming"},{"label":"Work / Office","value":"work"},{"label":"Social Media","value":"social"},{"label":"General","value":"general"}]',
     'Choose the closest match to help ThinkStack ask the right questions.', 1.5, 1, true),
    ('budget_max', 'What is your maximum budget? Please enter in rupees (₹).', 'NUMBER',
     '{"min":5000,"max":150000,"step":1000}', 'The top recommendation will stay within this budget.', 1.5, 2, true),
    ('operating_system', 'Which operating system do you prefer?', 'SINGLE_CHOICE',
     '[{"label":"Android","value":"android"},{"label":"iOS","value":"ios"},{"label":"No preference","value":"any"}]',
     'Android is highly customisable and available at every price; iOS only on iPhones.', 1.0, 3, false),
    ('camera', 'How important is camera quality to you?', 'RANGE',
     '{"min":1,"max":5,"step":1,"labels":["Not important","Slightly","Important","Very important","Critical"]}',
     'Important if you love photography. Flagship cameras are often in pricier phones.', 1.2, 4, false),
    ('battery', 'How important is battery life?', 'RANGE',
     '{"min":1,"max":5,"step":1,"labels":["Not important","Slightly","Important","Very important","Critical"]}',
     'A 5000mAh battery typically lasts a full day of normal use.', 1.2, 5, false),
    ('performance', 'How important is gaming/performance?', 'RANGE',
     '{"min":1,"max":5,"step":1,"labels":["Not important","Slightly","Important","Very important","Critical"]}',
     'Heavy games need a faster chipset, which usually raises the price.', 1.2, 6, false),
    ('display', 'How important is screen quality?', 'RANGE',
     '{"min":1,"max":5,"step":1,"labels":["Not important","Slightly","Important","Very important","Critical"]}',
     'A 120Hz display makes scrolling and animations noticeably smoother.', 1.0, 7, false),
    ('storage_min', 'How much storage do you need? (GB)', 'NUMBER',
     '{"min":64,"max":512,"step":64}', '128GB is the comfortable minimum for most users today.', 1.0, 8, false),
    ('brand_preferences', 'Any brand you favour?', 'MULTI_CHOICE',
     '[{"label":"Any brand","value":"any"},{"label":"Samsung","value":"samsung"},{"label":"Nothing","value":"nothing"},{"label":"OnePlus","value":"oneplus"},{"label":"Google Pixel","value":"google"},{"label":"Apple","value":"apple"},{"label":"Xiaomi","value":"xiaomi"}]',
     'Optional. Skip it if you are open to any brand.', 0.5, 9, false)
) AS v(key, text, qtype, options, help, weight, ord, required)
WHERE w.category_id = (SELECT id FROM categories WHERE slug='smartphones')
ON CONFLICT DO NOTHING;