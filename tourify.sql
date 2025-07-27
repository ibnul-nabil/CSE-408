CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255)
);

CREATE TABLE destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cover_image VARCHAR(255),
    location VARCHAR(100) NOT NULL,
    coordinates POINT
);

CREATE TABLE sub_places (
    id SERIAL PRIMARY KEY,
    destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(255),
    coordinates POINT
);

CREATE TABLE tours (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft', -- Draft, Planned, Upcoming, Ongoing, Completed, Cancelled
    start_date DATE,
    end_date DATE,
    estimated_cost DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finalized_at TIMESTAMP WITH TIME ZONE
);

-- CREATE TABLE tour_destinations (
--     id SERIAL PRIMARY KEY,
--     tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
--     destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
--     visit_order INTEGER NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE (tour_id, destination_id)
-- );

-- CREATE TABLE tour_sub_places (
--     id SERIAL PRIMARY KEY,
--     tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
--     sub_place_id INTEGER NOT NULL REFERENCES sub_places(id) ON DELETE CASCADE,
--     visit_order INTEGER,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE (tour_id, sub_place_id)
-- );

CREATE TABLE tour_routes (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    route_source VARCHAR(20) NOT NULL DEFAULT 'system', -- 'system' for default, 'user' for customized
    estimated_travel_time VARCHAR(50),
    distance_km INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE route_stops (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES tour_routes(id) ON DELETE CASCADE,
    place_type VARCHAR(20) NOT NULL, -- 'Destination' or 'SubPlace'
    place_id INTEGER NOT NULL, 
    stop_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_place_type CHECK (place_type IN ('Destination', 'SubPlace'))
);



CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    destination_id INTEGER REFERENCES destinations(id) ON DELETE SET NULL,
    sub_place_id INTEGER REFERENCES sub_places(id) ON DELETE SET NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    coordinates POINT,
    thumbnail VARCHAR(255),
    external_link VARCHAR(255),
    amenities TEXT[]
);

CREATE TABLE tour_accommodations (
    tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (tour_id, hotel_id)
);

CREATE TABLE tour_packages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    duration_days INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1),
    highlights TEXT[], -- Store as an array of text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE package_destinations (
    package_id INTEGER NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
    destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, destination_id)
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- data entry
INSERT INTO destinations (name, description, cover_image, location, coordinates) VALUES
('Cox''s Bazar', 'World''s longest natural sea beach and a popular tourist destination in Bangladesh.', 'coxs-bazar.jpg', 'Cox''s Bazar', POINT(91.9833, 21.4333)),

('Sylhet', 'A picturesque region with tea gardens, hills, and rivers, known for its natural beauty.', 'sylhet.jpg', 'Sylhet', POINT(91.8833, 24.8917)),

('Sreemangal', 'The tea capital of Bangladesh, famous for its lush green tea gardens and rainforests.', 'sreemangal.jpg', 'Sreemangal', POINT(91.7316, 24.3065)),

('Sunamganj', 'Famous for haors, wetlands, and the Tanguar Haor ecosystem.', 'sunamganj.jpg', 'Sunamganj', POINT(91.3991, 25.0658)),

('Bandarban', 'Hilly district with tribal culture, waterfalls, and scenic trekking spots.', 'bandarban.jpg', 'Bandarban', POINT(92.2985, 21.8311)),

('Khagrachari', 'Known for hills, tribal life, and natural beauty.', 'khagrachari.jpg', 'Khagrachari', POINT(91.9680, 23.1193)),

('Chattogram', 'Major port city with hills, beaches, and heritage sites.', 'chattogram.jpg', 'Chattogram', POINT(91.8332, 22.3569)),

('Sundarbans', 'World''s largest mangrove forest, home of the Royal Bengal Tiger.', 'sundarbans.jpg', 'Sundarbans', POINT(89.1833, 21.9500)),

('Rangamati', 'Lake district with serene water bodies and indigenous cultures.', 'rangamati.jpg', 'Rangamati', POINT(92.1825, 22.6500));

INSERT INTO sub_places (destination_id, name, type, description, thumbnail_url, coordinates) VALUES
(1, 'Inani Beach', 'Beach', 'Known for its coral stones and calm waves.', 'inani.jpg', POINT(92.0122, 21.2511)),
(1, 'Himchari National Park', 'Nature Reserve', 'A scenic park with hills, waterfalls, and sea views.', 'himchari.jpg', POINT(92.0174, 21.3762)),
(1, 'Laboni Beach', 'Beach', 'Popular beach near the town center with easy access.', 'laboni.jpg', POINT(91.9757, 21.4304));


INSERT INTO sub_places (destination_id, name, type, description, thumbnail_url, coordinates) VALUES
(9, 'Kaptai Lake', 'Lake', 'Man-made lake ideal for boat rides and sightseeing.', 'kaptai-lake.jpg', POINT(92.2154, 22.6326)),
(9, 'Hanging Bridge', 'Bridge', 'A scenic suspension bridge over Kaptai Lake.', 'hanging-bridge.jpg', POINT(92.2000, 22.6376)),
(9, 'Rajban Vihara', 'Religious Site', 'A Buddhist temple and monastery nestled in the hills.', 'rajban-vihara.jpg', POINT(92.1830, 22.6380));


INSERT INTO sub_places (destination_id, name, type, description, thumbnail_url, coordinates) VALUES
(2, 'Ratargul Swamp Forest', 'Forest', 'A freshwater swamp forest submerged during the monsoon.', 'ratargul.jpg', POINT(91.9567, 25.0474)),
(2, 'Jaflong', 'Natural Site', 'Famous for stones, tea gardens, and view of Meghalaya hills.', 'jaflong.jpg', POINT(92.0256, 25.1653)),
(2, 'Hazrat Shah Jalal Mazar Sharif', 'Religious Site', 'Shrine of the famous Sufi saint, Shah Jalal.', 'shahjalal.jpg', POINT(91.8671, 24.8949));


INSERT INTO tour_packages (
    title, duration_days, price, rating, highlights
) VALUES (
    'Coastal Bliss: Cox’s Bazar & Chattogram',
    4,
    12000.00,
    4.5,
    ARRAY['Cox’s Bazar Sea Beach', 'Foy’s Lake Adventure', 'Chattogram Hill Views']
);
-- Assuming Cox’s Bazar is id = 1, Chattogram is id = 2
INSERT INTO package_destinations (package_id, destination_id) VALUES
(1, 1), -- Cox's Bazar
(1, 7); -- Chattogram

INSERT INTO tour_packages (
    title, duration_days, price, rating, highlights
) VALUES (
    'Nature Trail: Sylhet & Sreemangal',
    3,
    9500.00,
    4.7,
    ARRAY['Ratargul Swamp Forest', 'Tea Gardens of Sreemangal', 'Jaflong River View']
);
-- Assuming Sylhet is id = 3, Sreemangal is id = 4
INSERT INTO package_destinations (package_id, destination_id) VALUES
(2, 2), -- Sylhet
(2, 3); -- Sreemangal

INSERT INTO tour_packages (
    title, duration_days, price, rating, highlights
) VALUES (
    'Hill Escape: Rangamati & Bandarban',
    5,
    13500.00,
    4.8,
    ARRAY['Kaptai Lake Boating', 'Nilgiri Hills Sunrise', 'Hiking Trails']
);
-- Assuming Rangamati is id = 5, Bandarban is id = 6
INSERT INTO package_destinations (package_id, destination_id) VALUES
(3, 9), -- Rangamati
(3, 5); -- Bandarban


-- Blog 1: Rangamati
INSERT INTO blogs (user_id, destination, title, content, thumbnail_url)
VALUES (
    1,
    'Rangamati',
    'Exploring the Hidden Beauty of Rangamati',
    'Nestled in the Chittagong Hill Tracts, Rangamati is a land of majestic hills, deep blue lakes, and vibrant tribal culture. 
     My journey began with a boat ride across Kaptai Lake, the largest man-made lake in Bangladesh. The crystal-clear water 
     and the green-covered hills created a tranquil setting like no other. We stopped by the tribal markets, where locals 
     were selling handmade textiles and organic fruits. Later, I visited the Hanging Bridge and the tribal museum, each offering 
     a glimpse into the unique culture and traditions of the indigenous people. Rangamati isn’t just a place—it’s an experience 
     that touches your soul.',
    'https://example.com/images/rangamati1.jpg'
);

-- Blog 2: Cox's Bazar
INSERT INTO blogs (user_id, destination, title, content, thumbnail_url)
VALUES (
    1,
    'Cox''s Bazar',
    'A Journey Through Cox''s Bazar – The Longest Sea Beach in the World',
    'Cox''s Bazar, stretching over 120 kilometers, is the world''s longest uninterrupted natural sea beach. My trip there was 
     unforgettable. I started my day with an early morning walk along the shoreline, watching the sunrise bathe the sea in gold. 
     The bustling beach area is filled with street vendors, seafood shacks, and parasailing adventures. In the afternoon, I visited 
     Himchari and Inani Beach, both known for their rocky cliffs and crystal-clear waters. As evening approached, I relaxed at a 
     beachside café sipping coconut water and watching the sky turn pink. Cox''s Bazar is not just about the beach; it’s about 
     escaping the rush of life and reconnecting with nature.',
    'https://example.com/images/coxbazar1.jpg'
);


ALTER TABLE users ADD COLUMN cover_photo VARCHAR(255);