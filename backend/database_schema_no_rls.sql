-- Simple database schema for BuiltWith Analyzer (without RLS)
-- This version disables Row Level Security for easier development

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis sessions table
CREATE TABLE IF NOT EXISTS analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domains TEXT[] NOT NULL,
    similarweb_jsonb JSONB,
    builtwith_jsonb JSONB,
    chat_discussion JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_id ON analysis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_created_at ON analysis_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_domains ON analysis_sessions USING GIN(domains);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_sessions_updated_at BEFORE UPDATE ON analysis_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DISABLE Row Level Security (RLS) for easier development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions DISABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own analysis sessions" ON analysis_sessions;
DROP POLICY IF EXISTS "Users can create their own analysis sessions" ON analysis_sessions;
DROP POLICY IF EXISTS "Users can update their own analysis sessions" ON analysis_sessions;
DROP POLICY IF EXISTS "Users can delete their own analysis sessions" ON analysis_sessions;

-- Grant permissions to authenticated users and service key
GRANT ALL ON users TO authenticated;
GRANT ALL ON analysis_sessions TO authenticated;
GRANT ALL ON users TO service_role;
GRANT ALL ON analysis_sessions TO service_role;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
