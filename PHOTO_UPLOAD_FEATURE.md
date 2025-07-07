# Profile Photo Upload Feature

This document explains the new profile and cover photo upload functionality added to the Tourify application.

## Overview

Users can now upload and manage their profile pictures and cover photos through an intuitive modal interface on their profile page.

## Features

### Profile Picture Upload
- Click on the profile avatar or the camera icon that appears on hover
- Options to view current profile picture or upload a new one
- Circular preview for profile pictures
- File validation (images only, max 10MB)

### Cover Photo Upload
- Click on the cover photo or the camera icon that appears on hover
- Options to view current cover photo or upload a new one
- Rectangular preview for cover photos
- File validation (images only, max 10MB)

## Backend Changes

### Database Schema
- Added `cover_photo` column to the `users` table
- Run the migration script: `backend/add_cover_photo_migration.sql`

### API Endpoints
- `PUT /api/profile/{id}/profile-image` - Update profile picture
- `PUT /api/profile/{id}/cover-photo` - Update cover photo
- Uses existing `/api/upload/media` endpoint for file uploads

### Entity Updates
- Updated `User.java` entity with `coverPhoto` field
- Updated `ProfileResponse.java` DTO with `coverPhoto` field

## Frontend Changes

### New Components
- `PhotoUploadModal.js` - Modal for photo upload/view functionality
- `PhotoUploadModal.css` - Styling for the modal

### Updated Components
- `ProfilePage.js` - Integrated photo upload functionality
- `ProfilePage.css` - Added styling for photo edit buttons

## How to Use

1. **Navigate to Profile Page**: Go to your profile page
2. **Upload Profile Picture**:
   - Hover over your profile avatar
   - Click the camera icon that appears
   - Choose "See Profile Picture" to view current photo
   - Choose "Upload New Profile Picture" to upload a new one
3. **Upload Cover Photo**:
   - Hover over the cover photo area
   - Click the camera icon that appears
   - Choose "See Cover Photo" to view current photo
   - Choose "Upload New Cover Photo" to upload a new one

## Technical Details

### File Upload Process
1. File is validated on the frontend (type, size)
2. File is uploaded to `/api/upload/media` endpoint
3. Uploaded file URL is sent to profile update endpoint
4. Profile is updated in database
5. UI is refreshed with new photo

### Error Handling
- File type validation (images only)
- File size validation (max 10MB)
- Upload error handling with user feedback
- Network error handling

### Security
- Authentication required for all endpoints
- User can only update their own profile
- File uploads are validated server-side

## Database Migration

Before using this feature, run the following SQL migration:

```sql
ALTER TABLE users ADD COLUMN cover_photo VARCHAR(255);
```

Or use the provided migration file:
```bash
# Run the migration script
psql -d your_database -f backend/add_cover_photo_migration.sql
```

## Default Images

- Profile pictures use a default placeholder if none is uploaded
- Cover photos use an Unsplash landscape image as default
- Both can be easily customized by changing the default URLs in the code 