-- Enhanced Blog Database Schema
-- This file contains the modifications needed for the advanced blog features

-- =============================================
-- STEP 1: MODIFY EXISTING BLOGS TABLE
-- =============================================

-- Drop the current blogs table (backup data first!)
DROP TABLE IF EXISTS blogs CASCADE;

-- Create the enhanced blogs table
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255), -- Made OPTIONAL as requested
    content TEXT NOT NULL,
    thumbnail_url VARCHAR(255), -- Auto-generated from first media
    likes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published', -- draft, published, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- STEP 2: MULTIPLE DESTINATIONS SUPPORT
-- =============================================

-- Create blog_destinations junction table for many-to-many relationship
CREATE TABLE blog_destinations (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blog_id, destination_id) -- Prevent duplicate destination for same blog
);

-- Alternative: Support custom destination names (not in destinations table)
CREATE TABLE blog_custom_destinations (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    destination_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- STEP 3: MEDIA SUPPORT (Photos & Videos)
-- =============================================

-- Blog media table for multiple photos and videos with captions
CREATE TABLE blog_media (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    media_url VARCHAR(500) NOT NULL, -- URL to the uploaded file
    media_type VARCHAR(20) NOT NULL, -- 'image' or 'video'
    caption TEXT, -- Individual caption for each media
    media_order INTEGER NOT NULL, -- Order of display
    file_size INTEGER, -- File size in bytes
    file_name VARCHAR(255), -- Original file name
    mime_type VARCHAR(100), -- image/jpeg, video/mp4, etc.
    width INTEGER, -- Media dimensions
    height INTEGER,
    duration INTEGER, -- For videos (in seconds)
    is_thumbnail BOOLEAN DEFAULT FALSE, -- Mark which image to use as blog thumbnail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_media_type CHECK (media_type IN ('image', 'video'))
);

-- =============================================
-- STEP 4: COMMENTS SYSTEM
-- =============================================

-- Blog comments table
CREATE TABLE blog_comments (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE, -- For nested replies
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- STEP 5: LIKES SYSTEM ENHANCEMENT
-- =============================================

-- Track who liked what (prevent multiple likes from same user)
CREATE TABLE blog_likes (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blog_id, user_id) -- One like per user per blog
);

-- Track comment likes
CREATE TABLE comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES blog_comments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id) -- One like per user per comment
);

-- =============================================
-- STEP 6: INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for better query performance
CREATE INDEX idx_blogs_user_id ON blogs(user_id);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_blogs_status ON blogs(status);

CREATE INDEX idx_blog_destinations_blog_id ON blog_destinations(blog_id);
CREATE INDEX idx_blog_destinations_destination_id ON blog_destinations(destination_id);

CREATE INDEX idx_blog_media_blog_id ON blog_media(blog_id);
CREATE INDEX idx_blog_media_order ON blog_media(blog_id, media_order);

CREATE INDEX idx_blog_comments_blog_id ON blog_comments(blog_id);
CREATE INDEX idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent ON blog_comments(parent_comment_id);

CREATE INDEX idx_blog_likes_blog_id ON blog_likes(blog_id);
CREATE INDEX idx_blog_likes_user_id ON blog_likes(user_id);

-- =============================================
-- STEP 8: USEFUL VIEWS FOR EASIER QUERYING
-- =============================================

-- View to get blog with destination names
CREATE VIEW blog_with_destinations AS
SELECT 
    b.*,
    STRING_AGG(d.name, ', ') as destination_names,
    COUNT(bd.destination_id) as destination_count
FROM blogs b
LEFT JOIN blog_destinations bd ON b.id = bd.blog_id
LEFT JOIN destinations d ON bd.destination_id = d.id
GROUP BY b.id;

-- View to get blog with media count
CREATE VIEW blog_with_media_stats AS
SELECT 
    b.*,
    COUNT(bm.id) as media_count,
    COUNT(CASE WHEN bm.media_type = 'image' THEN 1 END) as image_count,
    COUNT(CASE WHEN bm.media_type = 'video' THEN 1 END) as video_count
FROM blogs b
LEFT JOIN blog_media bm ON b.id = bm.blog_id
GROUP BY b.id;

-- View to get blog with engagement stats
CREATE VIEW blog_with_engagement AS
SELECT 
    b.*,
    COALESCE(like_count.total, 0) as total_likes,
    COALESCE(comment_count.total, 0) as total_comments
FROM blogs b
LEFT JOIN (
    SELECT blog_id, COUNT(*) as total 
    FROM blog_likes 
    GROUP BY blog_id
) like_count ON b.id = like_count.blog_id
LEFT JOIN (
    SELECT blog_id, COUNT(*) as total 
    FROM blog_comments 
    GROUP BY blog_id
) comment_count ON b.id = comment_count.blog_id; 