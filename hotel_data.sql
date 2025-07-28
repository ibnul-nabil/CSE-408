-- Hotel data for the specified subplaces
-- Generated hotel data with realistic names, prices, and amenities

INSERT INTO hotels (name, destination_id, sub_place_id, price_per_night, location, coordinates, thumbnail, external_link, amenities) VALUES
-- Inani Beach (subplace_id: 1, destination_id: 1)
('Inani Beach Resort & Spa', 1, 1, 4500.00, 'Inani Beach Road, Cox''s Bazar', '(21.1234, 92.1234)', 'inani_beach_resort.jpg', 'https://booking.com/inani-beach-resort', ARRAY['WiFi', 'Beach Access', 'Restaurant', 'Spa', 'Pool']),
('Coral Paradise Hotel', 1, 1, 3200.00, 'Inani Beach Front, Cox''s Bazar', '(21.1235, 92.1235)', 'coral_paradise.jpg', 'https://booking.com/coral-paradise', ARRAY['WiFi', 'Beach View', 'Restaurant', 'Bar']),
('Inani Ocean View Resort', 1, 1, 5800.00, 'Inani Beach, Cox''s Bazar', '(21.1236, 92.1236)', 'ocean_view_resort.jpg', 'https://booking.com/ocean-view-resort', ARRAY['WiFi', 'Ocean View', 'Restaurant', 'Spa', 'Pool', 'Gym']),

-- Himchari National Park (subplace_id: 2, destination_id: 1)
('Himchari Eco Resort', 1, 2, 3800.00, 'Himchari Road, Cox''s Bazar', '(21.2234, 92.2234)', 'himchari_eco.jpg', 'https://booking.com/himchari-eco', ARRAY['WiFi', 'Mountain View', 'Restaurant', 'Hiking Tours']),
('Forest Lodge Himchari', 1, 2, 2800.00, 'Himchari National Park, Cox''s Bazar', '(21.2235, 92.2235)', 'forest_lodge.jpg', 'https://booking.com/forest-lodge', ARRAY['WiFi', 'Garden', 'Restaurant']),
('Himchari Nature Resort', 1, 2, 4200.00, 'Himchari Area, Cox''s Bazar', '(21.2236, 92.2236)', 'nature_resort.jpg', 'https://booking.com/nature-resort', ARRAY['WiFi', 'Nature View', 'Restaurant', 'Guided Tours']),

-- Laboni Beach (subplace_id: 3, destination_id: 1)
('Laboni Beach Hotel', 1, 3, 3500.00, 'Laboni Beach Road, Cox''s Bazar', '(21.3234, 92.3234)', 'laboni_beach_hotel.jpg', 'https://booking.com/laboni-beach', ARRAY['WiFi', 'Beach Access', 'Restaurant', 'Bar']),
('Sea Pearl Beach Resort', 1, 3, 5200.00, 'Laboni Beach Front, Cox''s Bazar', '(21.3235, 92.3235)', 'sea_pearl.jpg', 'https://booking.com/sea-pearl', ARRAY['WiFi', 'Beach View', 'Restaurant', 'Spa', 'Pool']),
('Laboni Grand Hotel', 1, 3, 4100.00, 'Laboni Beach Area, Cox''s Bazar', '(21.3236, 92.3236)', 'laboni_grand.jpg', 'https://booking.com/laboni-grand', ARRAY['WiFi', 'Restaurant', 'Conference Room', 'Gym']),

-- Kaptai Lake (subplace_id: 4, destination_id: 9)
('Kaptai Lake Resort', 9, 4, 2800.00, 'Kaptai Lake Road, Rangamati', '(22.6234, 92.6234)', 'kaptai_lake_resort.jpg', 'https://booking.com/kaptai-lake', ARRAY['WiFi', 'Lake View', 'Restaurant', 'Boat Tours']),
('Lake View Hotel Kaptai', 9, 4, 2200.00, 'Kaptai Lake Front, Rangamati', '(22.6235, 92.6235)', 'lake_view_hotel.jpg', 'https://booking.com/lake-view', ARRAY['WiFi', 'Lake Access', 'Restaurant']),
('Kaptai Waterfront Resort', 9, 4, 3600.00, 'Kaptai Lake, Rangamati', '(22.6236, 92.6236)', 'waterfront_resort.jpg', 'https://booking.com/waterfront', ARRAY['WiFi', 'Lake View', 'Restaurant', 'Fishing', 'Boat Rental']),

-- Hanging Bridge (subplace_id: 5, destination_id: 9)
('Bridge View Hotel', 9, 5, 2400.00, 'Hanging Bridge Road, Rangamati', '(22.7234, 92.7234)', 'bridge_view_hotel.jpg', 'https://booking.com/bridge-view', ARRAY['WiFi', 'Bridge View', 'Restaurant']),
('Rangamati Bridge Resort', 9, 5, 3200.00, 'Near Hanging Bridge, Rangamati', '(22.7235, 92.7235)', 'rangamati_bridge.jpg', 'https://booking.com/rangamati-bridge', ARRAY['WiFi', 'Mountain View', 'Restaurant', 'Guided Tours']),
('Hanging Bridge Lodge', 9, 5, 1800.00, 'Hanging Bridge Area, Rangamati', '(22.7236, 92.7236)', 'hanging_bridge_lodge.jpg', 'https://booking.com/hanging-bridge', ARRAY['WiFi', 'Restaurant', 'Local Tours']),

-- Rajban Vihara (subplace_id: 6, destination_id: 9)
('Rajban Vihara Guest House', 9, 6, 1600.00, 'Near Rajban Vihara, Rangamati', '(22.8234, 92.8234)', 'rajban_guest_house.jpg', 'https://booking.com/rajban-guest', ARRAY['WiFi', 'Restaurant', 'Temple Tours']),
('Vihara View Hotel', 9, 6, 2100.00, 'Rajban Vihara Road, Rangamati', '(22.8235, 92.8235)', 'vihara_view.jpg', 'https://booking.com/vihara-view', ARRAY['WiFi', 'Temple View', 'Restaurant']),
('Rajban Heritage Resort', 9, 6, 2900.00, 'Rajban Vihara Area, Rangamati', '(22.8236, 92.8236)', 'heritage_resort.jpg', 'https://booking.com/heritage-resort', ARRAY['WiFi', 'Heritage Tours', 'Restaurant', 'Cultural Shows']),

-- Ratargul Swamp Forest (subplace_id: 7, destination_id: 2)
('Ratargul Forest Lodge', 2, 7, 2600.00, 'Ratargul Swamp Forest, Sylhet', '(25.1234, 92.1234)', 'ratargul_lodge.jpg', 'https://booking.com/ratargul-lodge', ARRAY['WiFi', 'Forest View', 'Restaurant', 'Boat Tours']),
('Swamp Forest Resort', 2, 7, 3400.00, 'Ratargul Forest Road, Sylhet', '(25.1235, 92.1235)', 'swamp_forest.jpg', 'https://booking.com/swamp-forest', ARRAY['WiFi', 'Nature Tours', 'Restaurant', 'Bird Watching']),
('Ratargul Eco Resort', 2, 7, 2200.00, 'Ratargul Area, Sylhet', '(25.1236, 92.1236)', 'eco_resort.jpg', 'https://booking.com/eco-resort', ARRAY['WiFi', 'Eco Tours', 'Restaurant']),

-- Jaflong (subplace_id: 8, destination_id: 2)
('Jaflong View Resort', 2, 8, 3100.00, 'Jaflong Road, Sylhet', '(25.2234, 92.2234)', 'jaflong_view.jpg', 'https://booking.com/jaflong-view', ARRAY['WiFi', 'Mountain View', 'Restaurant', 'Stone Collection Tours']),
('Jaflong Stone Resort', 2, 8, 2800.00, 'Jaflong Stone Area, Sylhet', '(25.2235, 92.2235)', 'stone_resort.jpg', 'https://booking.com/stone-resort', ARRAY['WiFi', 'Stone View', 'Restaurant', 'Boat Tours']),
('Jaflong Riverside Hotel', 2, 8, 2400.00, 'Jaflong Riverside, Sylhet', '(25.2236, 92.2236)', 'riverside_hotel.jpg', 'https://booking.com/riverside', ARRAY['WiFi', 'River View', 'Restaurant', 'Fishing']),

-- Hazrat Shah Jalal Mazar Sharif (subplace_id: 9, destination_id: 2)
('Shah Jalal Guest House', 2, 9, 1900.00, 'Near Shah Jalal Mazar, Sylhet', '(24.8234, 91.8234)', 'shah_jalal_guest.jpg', 'https://booking.com/shah-jalal-guest', ARRAY['WiFi', 'Restaurant', 'Religious Tours']),
('Mazar View Hotel', 2, 9, 2500.00, 'Shah Jalal Mazar Road, Sylhet', '(24.8235, 91.8235)', 'mazar_view.jpg', 'https://booking.com/mazar-view', ARRAY['WiFi', 'Mazar View', 'Restaurant', 'Prayer Room']),
('Sylhet Heritage Resort', 2, 9, 3600.00, 'Shah Jalal Area, Sylhet', '(24.8236, 91.8236)', 'heritage_resort_sylhet.jpg', 'https://booking.com/heritage-sylhet', ARRAY['WiFi', 'Heritage Tours', 'Restaurant', 'Cultural Programs']),

-- Additional hotels for popular destinations
-- Inani Beach (more options)
('Inani Sunset Resort', 1, 1, 4800.00, 'Inani Beach Sunset Point, Cox''s Bazar', '(21.1237, 92.1237)', 'sunset_resort.jpg', 'https://booking.com/sunset-resort', ARRAY['WiFi', 'Sunset View', 'Restaurant', 'Spa', 'Pool']),
('Inani Beach Villa', 1, 1, 6500.00, 'Inani Beach Private Villa, Cox''s Bazar', '(21.1238, 92.1238)', 'beach_villa.jpg', 'https://booking.com/beach-villa', ARRAY['WiFi', 'Private Beach', 'Restaurant', 'Spa', 'Pool', 'Butler Service']),

-- Laboni Beach (more options)
('Laboni Beach Palace', 1, 3, 7200.00, 'Laboni Beach Palace Road, Cox''s Bazar', '(21.3237, 92.3237)', 'beach_palace.jpg', 'https://booking.com/beach-palace', ARRAY['WiFi', 'Beach View', 'Restaurant', 'Spa', 'Pool', 'Gym', 'Conference Room']),
('Laboni Comfort Inn', 1, 3, 2800.00, 'Laboni Beach Comfort Area, Cox''s Bazar', '(21.3238, 92.3238)', 'comfort_inn.jpg', 'https://booking.com/comfort-inn', ARRAY['WiFi', 'Restaurant', 'Bar']),

-- Kaptai Lake (more options)
('Kaptai Lake Palace', 9, 4, 4200.00, 'Kaptai Lake Palace Road, Rangamati', '(22.6237, 92.6237)', 'lake_palace.jpg', 'https://booking.com/lake-palace', ARRAY['WiFi', 'Lake View', 'Restaurant', 'Spa', 'Boat Tours']),
('Kaptai Eco Lodge', 9, 4, 1900.00, 'Kaptai Lake Eco Area, Rangamati', '(22.6238, 92.6238)', 'eco_lodge.jpg', 'https://booking.com/eco-lodge', ARRAY['WiFi', 'Eco Tours', 'Restaurant', 'Bird Watching']),

-- Jaflong (more options)
('Jaflong Mountain Resort', 2, 8, 3800.00, 'Jaflong Mountain Road, Sylhet', '(25.2237, 92.2237)', 'mountain_resort.jpg', 'https://booking.com/mountain-resort', ARRAY['WiFi', 'Mountain View', 'Restaurant', 'Hiking Tours', 'Stone Collection']),
('Jaflong Comfort Hotel', 2, 8, 2200.00, 'Jaflong Comfort Area, Sylhet', '(25.2238, 92.2238)', 'comfort_hotel.jpg', 'https://booking.com/comfort-hotel', ARRAY['WiFi', 'Restaurant', 'Local Tours']); 