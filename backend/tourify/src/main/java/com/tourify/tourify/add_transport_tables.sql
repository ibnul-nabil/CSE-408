-- Create transportation tables
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

CREATE TABLE transport_stops (
    transport_id INTEGER REFERENCES transport(id) ON DELETE CASCADE,
    stop_id INTEGER REFERENCES destinations(id),
    price DECIMAL(10, 2),
    PRIMARY KEY (transport_id, stop_id)
);

CREATE TABLE tour_transport (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
    transport_id INTEGER REFERENCES transport(id),
    date DATE,
    cost DECIMAL(10, 2)
);

-- Insert dummy transport data
INSERT INTO transport (name, type, class, description, start_point, end_point, depart_start, depart_end) VALUES
-- Cox's Bazar to Sylhet routes
('Cox's Bazar Express', 'bus', 'economy', 'Comfortable bus service from Cox's Bazar to Sylhet', 1, 2, '08:00:00', '16:00:00'),
('Cox's Bazar Premium', 'bus', 'business', 'Premium bus service with extra amenities', 1, 2, '10:00:00', '18:00:00'),
('Cox's Bazar Air', 'flight', 'economy', 'Direct flight from Cox's Bazar to Sylhet', 1, 2, '14:00:00', '15:30:00'),

-- Cox's Bazar to Sreemangal routes
('Cox's Bazar-Sreemangal Bus', 'bus', 'economy', 'Direct bus to Sreemangal', 1, 3, '07:30:00', '14:30:00'),
('Cox's Bazar-Sreemangal Train', 'train', 'economy', 'Scenic train journey to Sreemangal', 1, 3, '06:00:00', '13:00:00'),

-- Cox's Bazar to Sunamganj routes
('Cox's Bazar-Sunamganj Express', 'bus', 'economy', 'Express bus service', 1, 4, '09:00:00', '17:00:00'),

-- Cox's Bazar to Bandarban routes
('Cox's Bazar-Bandarban Bus', 'bus', 'economy', 'Mountain route bus service', 1, 5, '08:30:00', '15:30:00'),

-- Cox's Bazar to Khagrachari routes
('Cox's Bazar-Khagrachari Express', 'bus', 'economy', 'Hill district express service', 1, 6, '07:00:00', '14:00:00'),

-- Cox's Bazar to Chattogram routes
('Cox's Bazar-Chattogram Bus', 'bus', 'economy', 'Frequent bus service to Chattogram', 1, 7, '06:00:00', '12:00:00'),
('Cox's Bazar-Chattogram Train', 'train', 'economy', 'Coastal train service', 1, 7, '05:30:00', '11:30:00'),
('Cox's Bazar-Chattogram Air', 'flight', 'business', 'Quick flight to Chattogram', 1, 7, '16:00:00', '16:45:00'),

-- Cox's Bazar to Sundarbans routes
('Cox's Bazar-Sundarbans Boat', 'boat', 'economy', 'Scenic boat journey to Sundarbans', 1, 8, '07:00:00', '18:00:00'),

-- Cox's Bazar to Rangamati routes
('Cox's Bazar-Rangamati Bus', 'bus', 'economy', 'Hill district bus service', 1, 9, '08:00:00', '16:00:00'),

-- Sylhet to other destinations
('Sylhet-Cox's Bazar Express', 'bus', 'economy', 'Return journey to Cox's Bazar', 2, 1, '08:00:00', '16:00:00'),
('Sylhet-Sreemangal Local', 'bus', 'economy', 'Local bus to Sreemangal', 2, 3, '09:00:00', '11:00:00'),
('Sylhet-Sunamganj Express', 'bus', 'economy', 'Express to Sunamganj', 2, 4, '10:00:00', '12:00:00'),
('Sylhet-Chattogram Air', 'flight', 'business', 'Flight to Chattogram', 2, 7, '15:00:00', '15:45:00'),

-- Sreemangal to other destinations
('Sreemangal-Cox's Bazar Bus', 'bus', 'economy', 'Return to Cox's Bazar', 3, 1, '07:30:00', '14:30:00'),
('Sreemangal-Sylhet Local', 'bus', 'economy', 'Local to Sylhet', 3, 2, '09:00:00', '11:00:00'),
('Sreemangal-Chattogram Express', 'bus', 'economy', 'Express to Chattogram', 3, 7, '08:00:00', '14:00:00'),

-- Sunamganj to other destinations
('Sunamganj-Cox's Bazar Express', 'bus', 'economy', 'Return to Cox's Bazar', 4, 1, '09:00:00', '17:00:00'),
('Sunamganj-Sylhet Express', 'bus', 'economy', 'Express to Sylhet', 4, 2, '10:00:00', '12:00:00'),

-- Bandarban to other destinations
('Bandarban-Cox's Bazar Bus', 'bus', 'economy', 'Return to Cox's Bazar', 5, 1, '08:30:00', '15:30:00'),
('Bandarban-Chattogram Express', 'bus', 'economy', 'Express to Chattogram', 5, 7, '07:00:00', '13:00:00'),

-- Khagrachari to other destinations
('Khagrachari-Cox's Bazar Express', 'bus', 'economy', 'Return to Cox's Bazar', 6, 1, '07:00:00', '14:00:00'),
('Khagrachari-Chattogram Bus', 'bus', 'economy', 'Bus to Chattogram', 6, 7, '08:00:00', '14:00:00'),

-- Chattogram to other destinations
('Chattogram-Cox's Bazar Bus', 'bus', 'economy', 'Return to Cox's Bazar', 7, 1, '06:00:00', '12:00:00'),
('Chattogram-Cox's Bazar Train', 'train', 'economy', 'Return train to Cox's Bazar', 7, 1, '05:30:00', '11:30:00'),
('Chattogram-Cox's Bazar Air', 'flight', 'business', 'Return flight to Cox's Bazar', 7, 1, '16:00:00', '16:45:00'),
('Chattogram-Sylhet Air', 'flight', 'business', 'Flight to Sylhet', 7, 2, '15:00:00', '15:45:00'),
('Chattogram-Sreemangal Express', 'bus', 'economy', 'Express to Sreemangal', 7, 3, '08:00:00', '14:00:00'),
('Chattogram-Bandarban Express', 'bus', 'economy', 'Express to Bandarban', 7, 5, '07:00:00', '13:00:00'),
('Chattogram-Khagrachari Bus', 'bus', 'economy', 'Bus to Khagrachari', 7, 6, '08:00:00', '14:00:00'),
('Chattogram-Sundarbans Boat', 'boat', 'economy', 'Boat to Sundarbans', 7, 8, '06:00:00', '17:00:00'),
('Chattogram-Rangamati Bus', 'bus', 'economy', 'Bus to Rangamati', 7, 9, '09:00:00', '17:00:00'),

-- Sundarbans to other destinations
('Sundarbans-Cox's Bazar Boat', 'boat', 'economy', 'Return boat to Cox's Bazar', 8, 1, '07:00:00', '18:00:00'),
('Sundarbans-Chattogram Boat', 'boat', 'economy', 'Boat to Chattogram', 8, 7, '06:00:00', '17:00:00'),

-- Rangamati to other destinations
('Rangamati-Cox's Bazar Bus', 'bus', 'economy', 'Return to Cox's Bazar', 9, 1, '08:00:00', '16:00:00'),
('Rangamati-Chattogram Bus', 'bus', 'economy', 'Bus to Chattogram', 9, 7, '09:00:00', '17:00:00');

-- Insert transport stops data
INSERT INTO transport_stops (transport_id, stop_id, price) VALUES
-- Cox's Bazar Express stops (Cox's Bazar -> Sylhet)
(1, 1, 0.00), -- Cox's Bazar (start)
(1, 3, 150.00), -- Sreemangal
(1, 2, 300.00), -- Sylhet (end)

-- Cox's Bazar Premium stops
(2, 1, 0.00), -- Cox's Bazar (start)
(2, 3, 200.00), -- Sreemangal
(2, 2, 450.00), -- Sylhet (end)

-- Cox's Bazar Air (direct flight)
(3, 1, 0.00), -- Cox's Bazar (start)
(3, 2, 2500.00), -- Sylhet (end)

-- Cox's Bazar-Sreemangal Bus
(4, 1, 0.00), -- Cox's Bazar (start)
(4, 3, 200.00), -- Sreemangal (end)

-- Cox's Bazar-Sreemangal Train
(5, 1, 0.00), -- Cox's Bazar (start)
(5, 3, 180.00), -- Sreemangal (end)

-- Cox's Bazar-Sunamganj Express
(6, 1, 0.00), -- Cox's Bazar (start)
(6, 4, 250.00), -- Sunamganj (end)

-- Cox's Bazar-Bandarban Bus
(7, 1, 0.00), -- Cox's Bazar (start)
(7, 5, 200.00), -- Bandarban (end)

-- Cox's Bazar-Khagrachari Express
(8, 1, 0.00), -- Cox's Bazar (start)
(8, 6, 180.00), -- Khagrachari (end)

-- Cox's Bazar-Chattogram Bus
(9, 1, 0.00), -- Cox's Bazar (start)
(9, 7, 150.00), -- Chattogram (end)

-- Cox's Bazar-Chattogram Train
(10, 1, 0.00), -- Cox's Bazar (start)
(10, 7, 120.00), -- Chattogram (end)

-- Cox's Bazar-Chattogram Air
(11, 1, 0.00), -- Cox's Bazar (start)
(11, 7, 1800.00), -- Chattogram (end)

-- Cox's Bazar-Sundarbans Boat
(12, 1, 0.00), -- Cox's Bazar (start)
(12, 8, 400.00), -- Sundarbans (end)

-- Cox's Bazar-Rangamati Bus
(13, 1, 0.00), -- Cox's Bazar (start)
(13, 9, 220.00), -- Rangamati (end)

-- Sylhet-Cox's Bazar Express
(14, 2, 0.00), -- Sylhet (start)
(14, 3, 150.00), -- Sreemangal
(14, 1, 300.00), -- Cox's Bazar (end)

-- Sylhet-Sreemangal Local
(15, 2, 0.00), -- Sylhet (start)
(15, 3, 80.00), -- Sreemangal (end)

-- Sylhet-Sunamganj Express
(16, 2, 0.00), -- Sylhet (start)
(16, 4, 100.00), -- Sunamganj (end)

-- Sylhet-Chattogram Air
(17, 2, 0.00), -- Sylhet (start)
(17, 7, 2200.00), -- Chattogram (end)

-- Sreemangal-Cox's Bazar Bus
(18, 3, 0.00), -- Sreemangal (start)
(18, 1, 200.00), -- Cox's Bazar (end)

-- Sreemangal-Sylhet Local
(19, 3, 0.00), -- Sreemangal (start)
(19, 2, 80.00), -- Sylhet (end)

-- Sreemangal-Chattogram Express
(20, 3, 0.00), -- Sreemangal (start)
(20, 7, 200.00), -- Chattogram (end)

-- Sunamganj-Cox's Bazar Express
(21, 4, 0.00), -- Sunamganj (start)
(21, 1, 250.00), -- Cox's Bazar (end)

-- Sunamganj-Sylhet Express
(22, 4, 0.00), -- Sunamganj (start)
(22, 2, 100.00), -- Sylhet (end)

-- Bandarban-Cox's Bazar Bus
(23, 5, 0.00), -- Bandarban (start)
(23, 1, 200.00), -- Cox's Bazar (end)

-- Bandarban-Chattogram Express
(24, 5, 0.00), -- Bandarban (start)
(24, 7, 180.00), -- Chattogram (end)

-- Khagrachari-Cox's Bazar Express
(25, 6, 0.00), -- Khagrachari (start)
(25, 1, 180.00), -- Cox's Bazar (end)

-- Khagrachari-Chattogram Bus
(26, 6, 0.00), -- Khagrachari (start)
(26, 7, 160.00), -- Chattogram (end)

-- Chattogram-Cox's Bazar Bus
(27, 7, 0.00), -- Chattogram (start)
(27, 1, 150.00), -- Cox's Bazar (end)

-- Chattogram-Cox's Bazar Train
(28, 7, 0.00), -- Chattogram (start)
(28, 1, 120.00), -- Cox's Bazar (end)

-- Chattogram-Cox's Bazar Air
(29, 7, 0.00), -- Chattogram (start)
(29, 1, 1800.00), -- Cox's Bazar (end)

-- Chattogram-Sylhet Air
(30, 7, 0.00), -- Chattogram (start)
(30, 2, 2200.00), -- Sylhet (end)

-- Chattogram-Sreemangal Express
(31, 7, 0.00), -- Chattogram (start)
(31, 3, 200.00), -- Sreemangal (end)

-- Chattogram-Bandarban Express
(32, 7, 0.00), -- Chattogram (start)
(32, 5, 180.00), -- Bandarban (end)

-- Chattogram-Khagrachari Bus
(33, 7, 0.00), -- Chattogram (start)
(33, 6, 160.00), -- Khagrachari (end)

-- Chattogram-Sundarbans Boat
(34, 7, 0.00), -- Chattogram (start)
(34, 8, 350.00), -- Sundarbans (end)

-- Chattogram-Rangamati Bus
(35, 7, 0.00), -- Chattogram (start)
(35, 9, 200.00), -- Rangamati (end)

-- Sundarbans-Cox's Bazar Boat
(36, 8, 0.00), -- Sundarbans (start)
(36, 1, 400.00), -- Cox's Bazar (end)

-- Sundarbans-Chattogram Boat
(37, 8, 0.00), -- Sundarbans (start)
(37, 7, 350.00), -- Chattogram (end)

-- Rangamati-Cox's Bazar Bus
(38, 9, 0.00), -- Rangamati (start)
(38, 1, 220.00), -- Cox's Bazar (end)

-- Rangamati-Chattogram Bus
(39, 9, 0.00), -- Rangamati (start)
(39, 7, 200.00); -- Chattogram (end)

-- Insert sample tour transport data
INSERT INTO tour_transport (tour_id, transport_id, date, cost) VALUES
(1, 1, '2025-01-15', 300.00),
(1, 9, '2025-01-20', 150.00),
(2, 3, '2025-02-10', 2500.00),
(2, 17, '2025-02-15', 2200.00); 