# Database Troubleshooting Guide

## Common Issues and Solutions

### 1. Row Level Security (RLS) Error

**Error**: `new row violates row-level security policy for table "users"`

**Solution**: Use the simple database schema without RLS:

```sql
-- Run this in your Supabase SQL Editor
-- First, drop existing tables if they have RLS
DROP TABLE IF EXISTS analysis_sessions;
DROP TABLE IF EXISTS users;

-- Then run the contents of database_schema_simple.sql
```

### 2. Database Connection Issues

**Error**: `Failed to initialize Supabase client`

**Solutions**:
- Check your `.env` file has correct `SUPABASE_URL` and `SUPABASE_KEY`
- Ensure you're using the service key, not the public key
- Verify the URL format: `https://your-project-id.supabase.co`

### 3. Service Key vs Public Key

**Issue**: Using the wrong key type

**Solution**: 
- Use the **service_role** key for backend operations
- The service key can bypass RLS policies
- Find it in: Supabase Dashboard → Settings → API → service_role

### 4. Tables Don't Exist

**Error**: `relation "users" does not exist`

**Solution**:
1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the contents of `database_schema_simple.sql`

### 5. Test Database Setup

Run the setup script to verify everything is working:

```bash
python setup_database.py
```

### 6. Environment Variables

Required in your `.env` file:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key
APIFY_API_TOKEN=your-apify-token
BUILTWITH_API_KEY=your-builtwith-key
OPENROUTER_API_KEY=your-openrouter-key
```

### 7. Manual Database Check

You can manually check your database in Supabase:

1. Go to Table Editor
2. You should see `users` and `analysis_sessions` tables
3. Try inserting a test record

### 8. Development vs Production

**Development**: Use `database_schema_simple.sql` (no RLS)
**Production**: Use `database_schema.sql` (with RLS and proper policies)

### 9. If All Else Fails

The system has fallback mechanisms:
- If database is unavailable, it continues with mock data
- Session IDs are still generated even if not saved
- Frontend will still receive responses

### 10. Debug Mode

Add this to your `.env` for more detailed logging:
```env
LOG_LEVEL=DEBUG
```

## Quick Setup Steps

1. **Create Supabase Project**: Go to supabase.com
2. **Get Credentials**: Copy URL and service key
3. **Add to .env**: Update your environment file
4. **Run Schema**: Execute `database_schema_simple.sql`
5. **Test Setup**: Run `python setup_database.py`
6. **Start Server**: Run `python main_new.py`

## Verification Commands

```bash
# Check if .env exists and has required variables
cat .env | grep -E "(SUPABASE_URL|SUPABASE_KEY)"

# Test database setup
python setup_database.py

# Start server with debug info
python main_new.py
```

## Contact Support

If you're still having issues:
1. Check the console logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure you're using the service key, not public key
4. Try the simple database schema first
