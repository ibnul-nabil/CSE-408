-- Fix permissions for tour_transport sequence
-- Run this as a database superuser (postgres)

-- Grant usage on the sequence
GRANT USAGE ON SEQUENCE tour_transport_id_seq TO tourify_user;

-- Grant select on the sequence (needed for nextval)
GRANT SELECT ON SEQUENCE tour_transport_id_seq TO tourify_user;

-- If the sequence doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'tour_transport_id_seq') THEN
        CREATE SEQUENCE tour_transport_id_seq
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 9223372036854775807
        CACHE 1;
        
        -- Grant permissions
        GRANT USAGE ON SEQUENCE tour_transport_id_seq TO tourify_user;
        GRANT SELECT ON SEQUENCE tour_transport_id_seq TO tourify_user;
    END IF;
END $$;

-- Make sure the tour_transport table exists and has the correct sequence
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tour_transport') THEN
        -- Alter the table to use the sequence if it's not already using it
        EXECUTE 'ALTER TABLE tour_transport ALTER COLUMN id SET DEFAULT nextval(''tour_transport_id_seq'')';
    END IF;
END $$; 