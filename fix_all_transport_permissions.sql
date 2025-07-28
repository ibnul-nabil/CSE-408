-- Fix permissions for all transport-related tables and sequences
-- Run this as a database superuser (postgres)

-- Grant permissions on transport table
GRANT SELECT, INSERT, UPDATE, DELETE ON transport TO tourify_user;

-- Grant permissions on transport_stops table
GRANT SELECT, INSERT, UPDATE, DELETE ON transport_stops TO tourify_user;

-- Grant permissions on tour_transport table
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_transport TO tourify_user;

-- Fix sequence permissions for all transport tables
DO $$
DECLARE
    seq_name text;
BEGIN
    -- Fix tour_transport sequence
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'tour_transport_id_seq') THEN
        GRANT USAGE ON SEQUENCE tour_transport_id_seq TO tourify_user;
        GRANT SELECT ON SEQUENCE tour_transport_id_seq TO tourify_user;
    END IF;
    
    -- Fix transport sequence
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'transport_id_seq') THEN
        GRANT USAGE ON SEQUENCE transport_id_seq TO tourify_user;
        GRANT SELECT ON SEQUENCE transport_id_seq TO tourify_user;
    END IF;
    
    -- Fix transport_stops sequence
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'transport_stops_id_seq') THEN
        GRANT USAGE ON SEQUENCE transport_stops_id_seq TO tourify_user;
        GRANT SELECT ON SEQUENCE transport_stops_id_seq TO tourify_user;
    END IF;
END $$;

-- Create sequences if they don't exist
DO $$
BEGIN
    -- Create tour_transport_id_seq if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'tour_transport_id_seq') THEN
        CREATE SEQUENCE tour_transport_id_seq
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 9223372036854775807
        CACHE 1;
        
        GRANT USAGE ON SEQUENCE tour_transport_id_seq TO tourify_user;
        GRANT SELECT ON SEQUENCE tour_transport_id_seq TO tourify_user;
    END IF;
    
    -- Create transport_id_seq if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'transport_id_seq') THEN
        CREATE SEQUENCE transport_id_seq
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 9223372036854775807
        CACHE 1;
        
        GRANT USAGE ON SEQUENCE transport_id_seq TO tourify_user;
        GRANT SELECT ON SEQUENCE transport_id_seq TO tourify_user;
    END IF;
    
    -- Create transport_stops_id_seq if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'transport_stops_id_seq') THEN
        CREATE SEQUENCE transport_stops_id_seq
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 9223372036854775807
        CACHE 1;
        
        GRANT USAGE ON SEQUENCE transport_stops_id_seq TO tourify_user;
        GRANT SELECT ON SEQUENCE transport_stops_id_seq TO tourify_user;
    END IF;
END $$;

-- Ensure tables use the correct sequences
DO $$
BEGIN
    -- Fix tour_transport table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tour_transport') THEN
        EXECUTE 'ALTER TABLE tour_transport ALTER COLUMN id SET DEFAULT nextval(''tour_transport_id_seq'')';
    END IF;
    
    -- Fix transport table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transport') THEN
        EXECUTE 'ALTER TABLE transport ALTER COLUMN id SET DEFAULT nextval(''transport_id_seq'')';
    END IF;
    
    -- Fix transport_stops table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transport_stops') THEN
        EXECUTE 'ALTER TABLE transport_stops ALTER COLUMN id SET DEFAULT nextval(''transport_stops_id_seq'')';
    END IF;
END $$; 