-- Migration to add starting_point column to tours table
ALTER TABLE tours ADD COLUMN starting_point VARCHAR(100); 