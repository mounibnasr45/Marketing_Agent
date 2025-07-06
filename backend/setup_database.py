#!/usr/bin/env python3
"""
Database setup script for BuiltWith Analyzer
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client

def setup_database():
    """Setup database tables and configuration"""
    print("🔧 Setting up BuiltWith Analyzer database...")
    
    # Load environment variables
    load_dotenv()
    
    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY in .env file")
        print("Please add these to your .env file:")
        print("SUPABASE_URL=your_supabase_project_url")
        print("SUPABASE_KEY=your_supabase_service_key")
        return False
    
    try:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)
        
        # Test connection
        print("🔍 Testing database connection...")
        
        # Try to query tables (this will fail if tables don't exist)
        try:
            result = supabase.table("users").select("count", count="exact").execute()
            print(f"✅ Found {result.count} users in database")
        except Exception as e:
            if "relation \"users\" does not exist" in str(e):
                print("⚠️ Tables don't exist yet. Please run the SQL schema first.")
                print("1. Go to your Supabase project dashboard")
                print("2. Open the SQL Editor")
                print("3. Run the contents of 'database_schema_simple.sql'")
                return False
            else:
                print(f"❌ Database connection test failed: {e}")
                return False
      
        # Try to insert a test user
        print("🧪 Testing database operations...")
        test_user_id = "00000000-0000-0000-0000-000000000001"
        
        try:
            # Try to insert test user
            supabase.table("users").upsert({
                "id": test_user_id,
                "created_at": "2024-01-01T00:00:00Z"
            }).execute()
            print("✅ Database write test successful")
            
            # Clean up test user
            supabase.table("users").delete().eq("id", test_user_id).execute()
            print("✅ Database cleanup successful")
            
        except Exception as e:
            if "row-level security policy" in str(e).lower():
                print("⚠️ RLS (Row Level Security) is blocking operations")
                print("This is likely because you're using the full schema with RLS enabled.")
                print("For development, consider using 'database_schema_simple.sql' without RLS.")
                print("Or configure RLS policies to allow service key access.")
                return False
            else:
                print(f"❌ Database operation test failed: {e}")
                return False
        
        print("✅ Database setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Make sure your .env file has all required API keys")
        print("2. Start the backend server: python main_new.py")
        print("3. Test the API endpoints")
        
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False

if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1)
