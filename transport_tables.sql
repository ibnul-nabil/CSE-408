-- Transport Tables Schema
-- This file creates the transport-related tables for the tour planning system

-- =============================================
-- TRANSPORT TABLES
-- =============================================

-- Transport options table (bus, train, flight)
CREATE TABLE transport (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'bus', 'train', 'flight'
    class VARCHAR(20) NOT NULL, -- 'economy', 'business'
    description TEXT,
    start_place_id INTEGER REFERENCES destinations(id) ON DELETE SET NULL,
    end_place_id INTEGER REFERENCES destinations(id) ON DELETE SET NULL,
    CONSTRAINT valid_transport_type CHECK (type IN ('bus', 'train', 'flight')),
    CONSTRAINT valid_transport_class CHECK (class IN ('economy', 'business'))
);

-- Transport stops table for pricing between destinations
CREATE TABLE transport_stops (
    transport_id INTEGER NOT NULL REFERENCES transport(id) ON DELETE CASCADE,
    stop_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    cumulative_price DECIMAL(10, 2),
    PRIMARY KEY (transport_id, stop_id)
);

-- Tour transport selections table
CREATE TABLE tour_transport (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    transport_id INTEGER NOT NULL REFERENCES transport(id) ON DELETE CASCADE,
    travel_date DATE NOT NULL,
    passenger_count INTEGER NOT NULL CHECK (passenger_count > 0),
    cost_per_person DECIMAL(10, 2) NOT NULL CHECK (cost_per_person >= 0),
    total_cost DECIMAL(10, 2) NOT NULL CHECK (total_cost = passenger_count * cost_per_person),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR BETTER PERFORMANCE
-- =============================================

-- Indexes for transport table
CREATE INDEX idx_transport_type ON transport(type);
CREATE INDEX idx_transport_class ON transport(class);
CREATE INDEX idx_transport_start_place ON transport(start_place_id);
CREATE INDEX idx_transport_end_place ON transport(end_place_id);

-- Indexes for transport_stops table
CREATE INDEX idx_transport_stops_transport ON transport_stops(transport_id);
CREATE INDEX idx_transport_stops_stop ON transport_stops(stop_id);

-- Indexes for tour_transport table
CREATE INDEX idx_tour_transport_tour ON tour_transport(tour_id);
CREATE INDEX idx_tour_transport_transport ON tour_transport(transport_id);
CREATE INDEX idx_tour_transport_date ON tour_transport(travel_date);

-- =============================================
-- DUMMY DATA
-- =============================================

-- Insert transport options
INSERT INTO transport (name, type, class, description, start_place_id, end_place_id) VALUES
-- Bus Routes
('Green Line Express', 'bus', 'economy', 'Comfortable AC bus service from Dhaka to Cox''s Bazar', 10, 1),
('Shyamoli Express', 'bus', 'economy', 'Reliable bus service connecting major cities', 10, 2),
('Hanif Express', 'bus', 'business', 'Premium bus service with extra amenities', 10, 7),
('Ena Transport', 'bus', 'economy', 'Popular bus service for inter-city travel', 7, 1),
('Unique Express', 'bus', 'business', 'Luxury bus service with reclining seats', 2, 3),
('Soudia Express', 'bus', 'economy', 'Budget-friendly bus service', 1, 5),
('Desh Travels', 'bus', 'economy', 'Comfortable journey to hill stations', 5, 6),
('Eagle Express', 'bus', 'business', 'Premium service to Sundarbans', 7, 8),
('Royal Express', 'bus', 'economy', 'Reliable service to Rangamati', 7, 9),
('City Express', 'bus', 'economy', 'Local bus service within cities', 4, 3),

-- Train Routes
('Turna Express', 'train', 'economy', 'Fast train service from Dhaka to Chittagong', 10, 7),
('Mohanagar Express', 'train', 'business', 'Premium train service with AC compartments', 10, 2),
('Ekota Express', 'train', 'economy', 'Comfortable train journey', 7, 1),
('Tista Express', 'train', 'business', 'Luxury train service', 2, 3),
('Kapotaksha Express', 'train', 'economy', 'Scenic train route', 3, 4),

-- Flight Routes
('Biman Bangladesh Airlines', 'flight', 'economy', 'National carrier connecting major cities', 10, 7),
('US-Bangla Airlines', 'flight', 'business', 'Premium domestic flights', 10, 1),
('NOVOAIR', 'flight', 'economy', 'Reliable domestic airline', 7, 2),
('Air Astra', 'flight', 'business', 'New domestic airline with modern fleet', 10, 5),
('Biman Bangladesh Airlines', 'flight', 'economy', 'Connecting hill stations', 7, 9);

-- Insert transport stops with cumulative pricing
INSERT INTO transport_stops (transport_id, stop_id, cumulative_price) VALUES
-- Green Line Express (Dhaka to Cox''s Bazar) - Route: Dhaka -> Chittagong -> Cox''s Bazar
(1, 10, 0.00),      -- Dhaka (starting point)
(1, 7, 500.00),     -- Chittagong
(1, 1, 1200.00),    -- cox''s Bazar

-- Shyamoli Express (Dhaka to Sylhet) - Route: Dhaka -> Sreemangal -> Sylhet
(2, 10, 0.00),      -- Dhaka (starting point)
(2, 3, 400.00),     -- Sreemangal
(2, 2, 800.00),     -- Sylhet

-- Hanif Express (Dhaka to Chittagong)
(3, 10, 0.00),      -- Dhaka (starting point)
(3, 7, 600.00),     -- Chittagong

-- Ena Transport (Chittagong to cox''s Bazar)
(4, 7, 0.00),       -- Chittagong (starting point)
(4, 1, 700.00),     -- cox''s Bazar

-- Unique Express (Sylhet to Sreemangal)
(5, 2, 0.00),       -- Sylhet (starting point)
(5, 3, 300.00),     -- Sreemangal

-- Soudia Express (cox''s Bazar to Bandarban)
(6, 1, 0.00),       -- cox''s Bazar (starting point)
(6, 5, 500.00),     -- Bandarban

-- Desh Travels (Bandarban to Khagrachari)
(7, 5, 0.00),       -- Bandarban (starting point)
(7, 6, 300.00),     -- Khagrachari

-- Eagle Express (Chittagong to Sundarbans)
(8, 7, 0.00),       -- Chittagong (starting point)
(8, 8, 800.00),     -- Sundarbans

-- Royal Express (Chittagong to Rangamati)
(9, 7, 0.00),       -- Chittagong (starting point)
(9, 9, 600.00),     -- Rangamati

-- City Express (Sunamganj to Sreemangal)
(10, 4, 0.00),      -- Sunamganj (starting point)
(10, 3, 200.00),    -- Sreemangal

-- Turna Express (Dhaka to Chittagong)
(11, 10, 0.00),     -- Dhaka (starting point)
(11, 7, 400.00),    -- Chittagong

-- Mohanagar Express (Dhaka to Sylhet)
(12, 10, 0.00),     -- Dhaka (starting point)
(12, 2, 600.00),    -- Sylhet

-- Ekota Express (Chittagong to cox''s Bazar)
(13, 7, 0.00),      -- Chittagong (starting point)
(13, 1, 500.00),    -- cox''s Bazar

-- Tista Express (Sylhet to Sreemangal)
(14, 2, 0.00),      -- Sylhet (starting point)
(14, 3, 250.00),    -- Sreemangal

-- Kapotaksha Express (Sreemangal to Sunamganj)
(15, 3, 0.00),      -- Sreemangal (starting point)
(15, 4, 200.00),    -- Sunamganj

-- Biman Bangladesh Airlines (Dhaka to Chittagong)
(16, 10, 0.00),     -- Dhaka (starting point)
(16, 7, 2500.00),   -- Chittagong

-- US-Bangla Airlines (Dhaka to cox''s Bazar)
(17, 10, 0.00),     -- Dhaka (starting point)
(17, 1, 3500.00),   -- cox''s Bazar

-- NOVOAIR (Chittagong to Sylhet)
(18, 7, 0.00),      -- Chittagong (starting point)
(18, 2, 2800.00),   -- Sylhet

-- Air Astra (Dhaka to Bandarban)
(19, 10, 0.00),     -- Dhaka (starting point)
(19, 5, 3200.00),   -- Bandarban

-- Biman Bangladesh Airlines (Chittagong to Rangamati)
(20, 7, 0.00),      -- Chittagong (starting point)
(20, 9, 1800.00);   -- Rangamati

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE transport IS 'Available transport options (bus, train, flight) with routes and pricing';
COMMENT ON TABLE transport_stops IS 'Pricing for each destination along transport routes';
COMMENT ON TABLE tour_transport IS 'Selected transport options for specific tours';

COMMENT ON COLUMN transport.type IS 'Type of transport: bus, train, or flight';
COMMENT ON COLUMN transport.class IS 'Service class: economy or business';
COMMENT ON COLUMN transport.start_place_id IS 'Starting destination for this transport route';
COMMENT ON COLUMN transport.end_place_id IS 'Ending destination for this transport route';

COMMENT ON COLUMN transport_stops.cumulative_price IS 'Cumulative price from start to this stop';
COMMENT ON COLUMN tour_transport.passenger_count IS 'Number of passengers for this transport selection';
COMMENT ON COLUMN tour_transport.cost_per_person IS 'Cost per person for this transport';
COMMENT ON COLUMN tour_transport.total_cost IS 'Total cost for all passengers (passenger_count * cost_per_person)'; 