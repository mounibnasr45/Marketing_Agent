# Database Integration Guide

## Overview
This system now integrates with Supabase to store user analysis data and provide history functionality. The system tracks user analysis sessions including SimilarWeb data, BuiltWith technology stack information, and chat discussions.

## Database Schema

### Tables

1. **users** - Stores user information
   - `id` (UUID, Primary Key)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

2. **analysis_sessions** - Stores analysis sessions
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to users)
   - `domains` (Text Array) - List of analyzed domains
   - `similarweb_jsonb` (JSONB) - SimilarWeb analysis data
   - `builtwith_jsonb` (JSONB) - BuiltWith technology stack data
   - `chat_discussion` (JSONB) - Chat conversation history
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

## Environment Variables Required

Add these to your `.env` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_key
```

## Database Setup

1. **Create Tables**: Run the SQL script `database_schema.sql` in your Supabase SQL editor
2. **Configure Environment**: Add your Supabase credentials to the `.env` file
3. **Test Connection**: The system will automatically test the connection on startup

## New API Endpoints

### History Endpoints

- `GET /api/history/{user_id}` - Get user's analysis history
- `GET /api/history/{user_id}/domains` - Get list of domains user has analyzed
- `GET /api/session/{session_id}` - Get specific analysis session
- `DELETE /api/session/{session_id}?user_id={user_id}` - Delete analysis session

### Enhanced Existing Endpoints

- `POST /api/analyze` - Now saves SimilarWeb data and returns session ID
- `POST /api/analyze-tech-stack` - Now updates existing session with BuiltWith data
- `POST /api/chat` - Now saves chat messages to session (when session_id provided)

## Usage Flow

1. **Initial Analysis**: User submits domains → SimilarWeb analysis → Session created
2. **Tech Stack Analysis**: User continues → BuiltWith analysis → Session updated
3. **Chat Interaction**: User chats about results → Messages saved to session
4. **History Access**: User can view all past analysis sessions

## Data Structure

### Analysis Session Data
```json
{
  "id": "session-uuid",
  "user_id": "user-uuid",
  "domains": ["example.com", "another.com"],
  "similarweb_data": [{...}],
  "builtwith_data": [{...}],
  "chat_discussion": [
    {
      "timestamp": "2024-01-01T10:00:00Z",
      "message": "What are the main traffic sources?",
      "response": "Based on the analysis...",
      "is_user": true
    }
  ],
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:30:00Z"
}
```

## Key Features

1. **Session Tracking**: Each analysis creates a unique session
2. **Data Persistence**: All analysis data is saved automatically
3. **User History**: Users can view their complete analysis history
4. **Chat History**: Conversations are saved per session
5. **Domain Tracking**: Easy access to previously analyzed domains

## Security

- Row Level Security (RLS) enabled
- Users can only access their own data
- UUID-based user identification
- Service key access for backend operations

## Error Handling

- Graceful fallback when database is unavailable
- Automatic UUID generation for invalid user IDs
- Comprehensive error logging
- Mock data fallback for development

## Development Notes

- All database operations are handled by `database_service.py`
- Old helper functions have been removed and replaced with service methods
- The system is backward compatible with existing frontend code
- Session IDs are returned in analysis responses for tracking
