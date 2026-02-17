
-- Seed categories
INSERT INTO public.categories (id, name, slug, type) VALUES
('a1000000-0000-0000-0000-000000000001', 'Real Madrid', 'real-madrid', 'team'),
('a1000000-0000-0000-0000-000000000002', 'FC Barcelona', 'fc-barcelona', 'team'),
('a1000000-0000-0000-0000-000000000003', 'Manchester United', 'manchester-united', 'team'),
('a1000000-0000-0000-0000-000000000004', 'Liverpool FC', 'liverpool-fc', 'team'),
('a1000000-0000-0000-0000-000000000005', 'AC Milan', 'ac-milan', 'team'),
('a1000000-0000-0000-0000-000000000006', 'Bayern Munich', 'bayern-munich', 'team'),
('a1000000-0000-0000-0000-000000000007', 'Paris Saint-Germain', 'paris-saint-germain', 'team'),
('a1000000-0000-0000-0000-000000000008', 'Juventus', 'juventus', 'team'),
('b1000000-0000-0000-0000-000000000001', 'La Liga', 'la-liga', 'league'),
('b1000000-0000-0000-0000-000000000002', 'Premier League', 'premier-league', 'league'),
('b1000000-0000-0000-0000-000000000003', 'Serie A', 'serie-a', 'league'),
('b1000000-0000-0000-0000-000000000004', 'Bundesliga', 'bundesliga', 'league'),
('b1000000-0000-0000-0000-000000000005', 'Ligue 1', 'ligue-1', 'league'),
('c1000000-0000-0000-0000-000000000001', 'Brazil', 'brazil', 'country'),
('c1000000-0000-0000-0000-000000000002', 'Argentina', 'argentina', 'country'),
('c1000000-0000-0000-0000-000000000003', 'France', 'france', 'country'),
('c1000000-0000-0000-0000-000000000004', 'Germany', 'germany', 'country'),
('d1000000-0000-0000-0000-000000000001', '2024/25', '2024-25', 'season'),
('d1000000-0000-0000-0000-000000000002', '2023/24', '2023-24', 'season'),
('d1000000-0000-0000-0000-000000000003', '2022/23', '2022-23', 'season'),
('e1000000-0000-0000-0000-000000000001', 'Home', 'home', 'jersey_type'),
('e1000000-0000-0000-0000-000000000002', 'Away', 'away', 'jersey_type'),
('e1000000-0000-0000-0000-000000000003', 'Third', 'third', 'jersey_type'),
('e1000000-0000-0000-0000-000000000004', 'Goalkeeper', 'goalkeeper', 'jersey_type'),
('e1000000-0000-0000-0000-000000000005', 'Training', 'training', 'jersey_type');

-- Seed products
INSERT INTO public.products (id, title, slug, description, price, sale_price, is_featured, is_active, team_id, league_id, season_id, jersey_type_id, country_id) VALUES
('f1000000-0000-0000-0000-000000000001', 'Real Madrid Home Jersey 2024/25', 'real-madrid-home-2024-25', 'The iconic white home kit of Real Madrid for the 2024/25 season. Features Adidas Aeroready technology for comfort and performance. Official La Liga and Champions League patches included.', 129.99, NULL, true, true, 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', NULL),
('f1000000-0000-0000-0000-000000000002', 'Real Madrid Away Jersey 2024/25', 'real-madrid-away-2024-25', 'Bold orange away kit for Real Madrid 2024/25 season. Breathable fabric with moisture-wicking technology.', 129.99, 99.99, true, true, 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', NULL),
('f1000000-0000-0000-0000-000000000003', 'FC Barcelona Home Jersey 2024/25', 'fc-barcelona-home-2024-25', 'Classic blaugrana stripes for the 2024/25 season. Nike Dri-FIT technology keeps you cool on and off the pitch.', 134.99, NULL, true, true, 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', NULL),
('f1000000-0000-0000-0000-000000000004', 'Manchester United Home Jersey 2024/25', 'man-utd-home-2024-25', 'The legendary red home shirt of Manchester United. Premium Adidas quality with official Premier League patches.', 124.99, NULL, true, true, 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', NULL),
('f1000000-0000-0000-0000-000000000005', 'Liverpool FC Home Jersey 2024/25', 'liverpool-home-2024-25', 'Anfield red home jersey for the 2024/25 season. Nike Dri-FIT ADV for elite performance.', 134.99, 109.99, true, true, 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', NULL),
('f1000000-0000-0000-0000-000000000006', 'AC Milan Home Jersey 2024/25', 'ac-milan-home-2024-25', 'Rossoneri stripes for the 2024/25 campaign. Puma dryCELL technology for a dry and comfortable fit.', 119.99, NULL, false, true, 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', NULL),
('f1000000-0000-0000-0000-000000000007', 'Bayern Munich Home Jersey 2024/25', 'bayern-home-2024-25', 'Classic FCB red home jersey. Adidas HEAT.RDY technology for maximum ventilation.', 124.99, NULL, true, true, 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', NULL),
('f1000000-0000-0000-0000-000000000008', 'PSG Home Jersey 2024/25', 'psg-home-2024-25', 'Paris Saint-Germain navy blue home kit. Nike premium quality with Ligue 1 patches.', 134.99, NULL, true, true, 'a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', NULL),
('f1000000-0000-0000-0000-000000000009', 'Juventus Away Jersey 2024/25', 'juventus-away-2024-25', 'Stylish away kit for Juventus 2024/25. Adidas quality with Serie A patches.', 124.99, 94.99, false, true, 'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', NULL),
('f1000000-0000-0000-0000-000000000010', 'Brazil Home Jersey 2024', 'brazil-home-2024', 'The famous Canarinho yellow kit. Nike Dri-FIT for international matches.', 139.99, NULL, true, true, NULL, NULL, 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001'),
('f1000000-0000-0000-0000-000000000011', 'Argentina Away Jersey 2024', 'argentina-away-2024', 'Dark navy Albiceleste away jersey. Adidas premium quality from the World Cup champions.', 139.99, 119.99, false, true, NULL, NULL, 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002'),
('f1000000-0000-0000-0000-000000000012', 'France Home Jersey 2024', 'france-home-2024', 'Les Bleus iconic dark blue kit. Nike quality for the 2024 European Championship.', 134.99, NULL, false, true, NULL, NULL, 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003'),
('f1000000-0000-0000-0000-000000000013', 'FC Barcelona Third Jersey 2024/25', 'fc-barcelona-third-2024-25', 'Unique third kit design for Barcelona. Limited edition with special colorway.', 134.99, NULL, false, true, 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000003', NULL),
('f1000000-0000-0000-0000-000000000014', 'Manchester United Away Jersey 2023/24', 'man-utd-away-2023-24', 'Last season''s classic green away kit. Collectors'' item at a discounted price.', 124.99, 79.99, false, true, 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', NULL),
('f1000000-0000-0000-0000-000000000015', 'Liverpool FC Goalkeeper Jersey 2024/25', 'liverpool-gk-2024-25', 'Bright yellow goalkeeper jersey worn by Alisson. Stand out between the posts.', 114.99, NULL, false, true, 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000004', NULL),
('f1000000-0000-0000-0000-000000000016', 'Bayern Munich Training Jersey 2024/25', 'bayern-training-2024-25', 'Official training top used by the squad. Lightweight and breathable.', 89.99, 69.99, false, true, 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000005', NULL);

-- Seed product variants (S/M/L/XL/XXL for each product)
INSERT INTO public.product_variants (product_id, size, stock, sku)
SELECT p.id, s.size, (RANDOM() * 20 + 2)::int, p.slug || '-' || LOWER(s.size)
FROM public.products p
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS s(size);

-- Seed product images (placeholder URLs)
INSERT INTO public.product_images (product_id, url, alt_text, position)
SELECT id, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=800&fit=crop', title || ' - Front', 0 FROM public.products WHERE slug LIKE '%home%'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=800&fit=crop', title || ' - Front', 0 FROM public.products WHERE slug LIKE '%away%'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=800&fit=crop', title || ' - Front', 0 FROM public.products WHERE slug LIKE '%third%' OR slug LIKE '%gk%' OR slug LIKE '%training%';

-- Seed promo codes
INSERT INTO public.promo_codes (code, type, value, min_order, is_active) VALUES
('WELCOME10', 'percentage', 10, 50, true),
('GOAT20', 'percentage', 20, 100, true),
('FLAT15', 'fixed', 15, 75, true),
('JERSEY25', 'percentage', 25, 150, true);
