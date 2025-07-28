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







******************************************************************************************************






-- Transportation options
CREATE TABLE transport (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    type VARCHAR(20), -- 'bus', 'train', 'flight', 'boat'
    class VARCHAR(20), -- 'business' or 'economy'
    description TEXT,
    start_point INTEGER REFERENCES destinations(id),
    end_point INTEGER REFERENCES destinations(id),
    depart_start TIME,
    depart_end TIME
);

-- Transport stops with pricing
CREATE TABLE transport_stops (
    transport_id INTEGER REFERENCES transport(id) ON DELETE CASCADE,
    stop_id INTEGER REFERENCES destinations(id),
    price DECIMAL(10, 2),
    PRIMARY KEY (transport_id, stop_id)
);

-- User's selected transport for tour
CREATE TABLE tour_transport (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
    transport_id INTEGER REFERENCES transport(id),
    date DATE,
    cost DECIMAL(10, 2)
);


-- -- Transport options (using correct destination IDs)
-- INSERT INTO transport (name, type, class, description, start_point, end_point, depart_start, depart_end) VALUES
-- ('Green Line Express', 'bus', 'business', 'Premium AC bus with WiFi and refreshments', 7, 1, '08:00:00', '18:00:00'),
-- ('Green Line Express', 'bus', 'economy', 'Standard AC bus service', 7, 1, '08:00:00', '18:00:00'),
-- ('Shyamoli Express', 'bus', 'economy', 'Budget bus service', 7, 1, '09:00:00', '19:00:00'),
-- ('Bangladesh Railway', 'train', 'business', 'AC compartment with meal service', 7, 2, '07:30:00', '14:30:00'),
-- ('Bangladesh Railway', 'train', 'economy', 'Non-AC compartment', 7, 2, '07:30:00', '14:30:00'),
-- ('Biman Bangladesh', 'flight', 'business', 'Business class with priority boarding', 7, 1, '10:00:00', '11:00:00'),
-- ('Biman Bangladesh', 'flight', 'economy', 'Economy class', 7, 1, '10:00:00', '11:00:00'),
-- ('US Bangla Airlines', 'flight', 'economy', 'Budget airline service', 7, 1, '12:00:00', '13:00:00'),
-- ('Royal Express', 'bus', 'business', 'Luxury bus with sleeper seats', 7, 9, '07:00:00', '15:00:00'),
-- ('Sylhet Express', 'bus', 'economy', 'Direct bus to Sylhet', 7, 2, '08:30:00', '15:30:00'),
-- ('Cox''s Bazar Express', 'bus', 'economy', 'Direct bus to Cox''s Bazar', 7, 1, '06:00:00', '16:00:00'),
-- ('Rangamati Express', 'bus', 'business', 'Premium bus to Rangamati', 7, 9, '06:30:00', '14:30:00');

-- -- Transport stops with pricing (using correct destination IDs)
-- INSERT INTO transport_stops (transport_id, stop_id, price) VALUES
-- -- Green Line Business (Chattogram to Cox's Bazar)
-- (1, 7, 0.00),    -- Chattogram (start) - free
-- (1, 3, 800.00),  -- Sreemangal stop
-- (1, 1, 1200.00), -- Cox's Bazar (end)

-- -- Green Line Economy (Chattogram to Cox's Bazar)
-- (2, 7, 0.00),    -- Chattogram (start) - free
-- (2, 3, 600.00),  -- Sreemangal stop
-- (2, 1, 800.00),  -- Cox's Bazar (end)

-- -- Shyamoli Express (Chattogram to Cox's Bazar)
-- (3, 7, 0.00),    -- Chattogram (start) - free
-- (3, 1, 600.00),  -- Cox's Bazar (end)

-- -- Bangladesh Railway Business (Chattogram to Sylhet)
-- (4, 7, 0.00),    -- Chattogram (start) - free
-- (4, 2, 800.00),  -- Sylhet (end)

-- -- Bangladesh Railway Economy (Chattogram to Sylhet)
-- (5, 7, 0.00),    -- Chattogram (start) - free
-- (5, 2, 450.00),  -- Sylhet (end)

-- -- Biman Business (Chattogram to Cox's Bazar)
-- (6, 7, 0.00),    -- Chattogram (start) - free
-- (6, 1, 5000.00), -- Cox's Bazar (end)

-- -- Biman Economy (Chattogram to Cox's Bazar)
-- (7, 7, 0.00),    -- Chattogram (start) - free
-- (7, 1, 2500.00), -- Cox's Bazar (end)

-- -- US Bangla Economy (Chattogram to Cox's Bazar)
-- (8, 7, 0.00),    -- Chattogram (start) - free
-- (8, 1, 2200.00), -- Cox's Bazar (end)

-- -- Royal Express (Chattogram to Rangamati)
-- (9, 7, 0.00),    -- Chattogram (start) - free
-- (9, 9, 1000.00), -- Rangamati (end)

-- -- Sylhet Express (Chattogram to Sylhet)
-- (10, 7, 0.00),   -- Chattogram (start) - free
-- (10, 2, 400.00), -- Sylhet (end)

-- -- Cox's Bazar Express (Chattogram to Cox's Bazar)
-- (11, 7, 0.00),   -- Chattogram (start) - free
-- (11, 1, 700.00), -- Cox's Bazar (end)

-- -- Rangamati Express (Chattogram to Rangamati)
-- (12, 7, 0.00),   -- Chattogram (start) - free
-- (12, 9, 1200.00); -- Rangamati (end)


-- Transport options (all possible routes)
INSERT INTO transport (name, type, class, description, start_point, end_point, depart_start, depart_end) VALUES
-- Chattogram to other destinations
('Green Line Express', 'bus', 'business', 'Premium AC bus with WiFi', 7, 1, '08:00:00', '18:00:00'),
('Green Line Express', 'bus', 'economy', 'Standard AC bus', 7, 1, '08:00:00', '18:00:00'),
('Bangladesh Railway', 'train', 'business', 'AC compartment', 7, 2, '07:30:00', '14:30:00'),
('Bangladesh Railway', 'train', 'economy', 'Non-AC compartment', 7, 2, '07:30:00', '14:30:00'),
('Royal Express', 'bus', 'business', 'Luxury bus to Rangamati', 7, 9, '07:00:00', '15:00:00'),
('Hill Express', 'bus', 'economy', 'Budget bus to Bandarban', 7, 5, '06:00:00', '12:00:00'),
('Sundarbans Express', 'bus', 'business', 'Premium bus to Sundarbans', 7, 8, '05:00:00', '14:00:00'),
('Khagrachari Express', 'bus', 'economy', 'Direct bus to Khagrachari', 7, 6, '07:30:00', '13:30:00'),

-- Cox's Bazar to other destinations
('Cox''s Bazar Express', 'bus', 'business', 'Premium bus from Cox''s Bazar', 1, 7, '06:00:00', '16:00:00'),
('Cox''s Bazar Express', 'bus', 'economy', 'Standard bus from Cox''s Bazar', 1, 7, '06:00:00', '16:00:00'),
('Cox''s Bazar Railway', 'train', 'economy', 'Train from Cox''s Bazar', 1, 2, '09:00:00', '16:00:00'),

-- Sylhet to other destinations
('Sylhet Express', 'bus', 'business', 'Premium bus from Sylhet', 2, 7, '08:30:00', '15:30:00'),
('Sylhet Express', 'bus', 'economy', 'Standard bus from Sylhet', 2, 7, '08:30:00', '15:30:00'),
('Sylhet Railway', 'train', 'business', 'AC train from Sylhet', 2, 7, '07:00:00', '14:00:00'),
('Sylhet to Sreemangal', 'bus', 'economy', 'Local bus service', 2, 3, '10:00:00', '11:30:00'),

-- Rangamati to other destinations
('Rangamati Express', 'bus', 'business', 'Premium bus from Rangamati', 9, 7, '06:30:00', '14:30:00'),
('Rangamati Express', 'bus', 'economy', 'Standard bus from Rangamati', 9, 7, '06:30:00', '14:30:00'),
('Rangamati to Bandarban', 'bus', 'economy', 'Hill region bus', 9, 5, '08:00:00', '10:00:00'),

-- Bandarban to other destinations
('Bandarban Express', 'bus', 'business', 'Premium bus from Bandarban', 5, 7, '07:00:00', '13:00:00'),
('Bandarban Express', 'bus', 'economy', 'Standard bus from Bandarban', 5, 7, '07:00:00', '13:00:00'),
('Bandarban to Khagrachari', 'bus', 'economy', 'Hill region bus', 5, 6, '09:00:00', '11:00:00'),

-- Khagrachari to other destinations
('Khagrachari Express', 'bus', 'business', 'Premium bus from Khagrachari', 6, 7, '08:00:00', '14:00:00'),
('Khagrachari Express', 'bus', 'economy', 'Standard bus from Khagrachari', 6, 7, '08:00:00', '14:00:00'),

-- Sreemangal to other destinations
('Sreemangal Express', 'bus', 'business', 'Premium bus from Sreemangal', 3, 7, '09:00:00', '16:00:00'),
('Sreemangal Express', 'bus', 'economy', 'Standard bus from Sreemangal', 3, 7, '09:00:00', '16:00:00'),
('Sreemangal to Sylhet', 'bus', 'economy', 'Local bus service', 3, 2, '08:00:00', '09:30:00'),

-- Sunamganj to other destinations
('Sunamganj Express', 'bus', 'business', 'Premium bus from Sunamganj', 4, 7, '07:30:00', '15:30:00'),
('Sunamganj Express', 'bus', 'economy', 'Standard bus from Sunamganj', 4, 7, '07:30:00', '15:30:00'),
('Sunamganj to Sylhet', 'bus', 'economy', 'Local bus service', 4, 2, '09:00:00', '10:30:00'),

-- Sundarbans to other destinations
('Sundarbans Express', 'bus', 'business', 'Premium bus from Sundarbans', 8, 7, '06:00:00', '15:00:00'),
('Sundarbans Express', 'bus', 'economy', 'Standard bus from Sundarbans', 8, 7, '06:00:00', '15:00:00'),

-- Flights (Chattogram to major destinations)
('Biman Bangladesh', 'flight', 'business', 'Business class flight', 7, 1, '10:00:00', '11:00:00'),
('Biman Bangladesh', 'flight', 'economy', 'Economy class flight', 7, 1, '10:00:00', '11:00:00'),
('US Bangla Airlines', 'flight', 'economy', 'Budget airline', 7, 1, '12:00:00', '13:00:00'),
('Biman Bangladesh', 'flight', 'business', 'Business class to Sylhet', 7, 2, '11:00:00', '12:00:00'),
('Biman Bangladesh', 'flight', 'economy', 'Economy class to Sylhet', 7, 2, '11:00:00', '12:00:00');

-- Transport stops with pricing (comprehensive stoppages)
INSERT INTO transport_stops (transport_id, stop_id, price) VALUES
-- Chattogram to Cox's Bazar (with stops)
(1, 7, 0.00),    -- Chattogram (start)
(1, 3, 800.00),  -- Sreemangal stop
(1, 1, 1200.00), -- Cox's Bazar (end)

(2, 7, 0.00),    -- Chattogram (start)
(2, 3, 600.00),  -- Sreemangal stop
(2, 1, 800.00),  -- Cox's Bazar (end)

-- Chattogram to Sylhet (direct)
(3, 7, 0.00),    -- Chattogram (start)
(3, 2, 800.00),  -- Sylhet (end)

(4, 7, 0.00),    -- Chattogram (start)
(4, 2, 450.00),  -- Sylhet (end)

-- Chattogram to Rangamati (direct)
(5, 7, 0.00),    -- Chattogram (start)
(5, 9, 1000.00), -- Rangamati (end)

-- Chattogram to Bandarban (direct)
(6, 7, 0.00),    -- Chattogram (start)
(6, 5, 600.00),  -- Bandarban (end)

-- Chattogram to Sundarbans (with stops)
(7, 7, 0.00),    -- Chattogram (start)
(7, 4, 400.00),  -- Sunamganj stop
(7, 8, 800.00),  -- Sundarbans (end)

-- Chattogram to Khagrachari (direct)
(8, 7, 0.00),    -- Chattogram (start)
(8, 6, 500.00),  -- Khagrachari (end)

-- Cox's Bazar to Chattogram (return)
(9, 1, 0.00),    -- Cox's Bazar (start)
(9, 7, 1200.00), -- Chattogram (end)

(10, 1, 0.00),   -- Cox's Bazar (start)
(10, 7, 800.00), -- Chattogram (end)

-- Cox's Bazar to Sylhet
(11, 1, 0.00),   -- Cox's Bazar (start)
(11, 2, 600.00), -- Sylhet (end)

-- Sylhet to Chattogram (return)
(12, 2, 0.00),   -- Sylhet (start)
(12, 7, 800.00), -- Chattogram (end)

(13, 2, 0.00),   -- Sylhet (start)
(13, 7, 450.00), -- Chattogram (end)

(14, 2, 0.00),   -- Sylhet (start)
(14, 7, 800.00), -- Chattogram (end)

-- Sylhet to Sreemangal
(15, 2, 0.00),   -- Sylhet (start)
(15, 3, 200.00), -- Sreemangal (end)

-- Rangamati to Chattogram (return)
(16, 9, 0.00),   -- Rangamati (start)
(16, 7, 1000.00), -- Chattogram (end)

(17, 9, 0.00),   -- Rangamati (start)
(17, 7, 800.00), -- Chattogram (end)

-- Rangamati to Bandarban
(18, 9, 0.00),   -- Rangamati (start)
(18, 5, 300.00), -- Bandarban (end)

-- Bandarban to Chattogram (return)
(19, 5, 0.00),   -- Bandarban (start)
(19, 7, 600.00), -- Chattogram (end)

(20, 5, 0.00),   -- Bandarban (start)
(20, 7, 400.00), -- Chattogram (end)

-- Bandarban to Khagrachari
(21, 5, 0.00),   -- Bandarban (start)
(21, 6, 200.00), -- Khagrachari (end)

-- Khagrachari to Chattogram (return)
(22, 6, 0.00),   -- Khagrachari (start)
(22, 7, 500.00), -- Chattogram (end)

(23, 6, 0.00),   -- Khagrachari (start)
(23, 7, 350.00), -- Chattogram (end)

-- Sreemangal to Chattogram (return)
(24, 3, 0.00),   -- Sreemangal (start)
(24, 7, 600.00), -- Chattogram (end)

(25, 3, 0.00),   -- Sreemangal (start)
(25, 7, 400.00), -- Chattogram (end)

-- Sreemangal to Sylhet
(26, 3, 0.00),   -- Sreemangal (start)
(26, 2, 200.00), -- Sylhet (end)

-- Sunamganj to Chattogram (return)
(27, 4, 0.00),   -- Sunamganj (start)
(27, 7, 700.00), -- Chattogram (end)

(28, 4, 0.00),   -- Sunamganj (start)
(28, 7, 500.00), -- Chattogram (end)

-- Sunamganj to Sylhet
(29, 4, 0.00),   -- Sunamganj (start)
(29, 2, 300.00), -- Sylhet (end)

-- Sundarbans to Chattogram (return)
(30, 8, 0.00),   -- Sundarbans (start)
(30, 7, 800.00), -- Chattogram (end)

(31, 8, 0.00),   -- Sundarbans (start)
(31, 7, 600.00), -- Chattogram (end)

-- Flights (direct routes)
(32, 7, 0.00),   -- Chattogram (start)
(32, 1, 5000.00), -- Cox's Bazar (end)

(33, 7, 0.00),   -- Chattogram (start)
(33, 1, 2500.00), -- Cox's Bazar (end)

(34, 7, 0.00),   -- Chattogram (start)
(34, 1, 2200.00), -- Cox's Bazar (end)

(35, 7, 0.00),   -- Chattogram (start)
(35, 2, 3000.00), -- Sylhet (end)

(36, 7, 0.00),   -- Chattogram (start)
(36, 2, 1500.00); -- Sylhet (end)



**************************************************************************************

\c tourify
GRANT SELECT, INSERT, UPDATE, DELETE ON transport TO tourify_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON transport_stops TO tourify_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_transport TO tourify_user;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON transport TO tourify_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON transport_stops TO tourify_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_transport TO tourify_user;

-- Grant permissions on sequences
GRANT USAGE ON SEQUENCE tour_transport_id_seq TO tourify_user;
GRANT SELECT ON SEQUENCE tour_transport_id_seq TO tourify_user;
