"""
Configuration and environment setup for the BuiltWith Analyzer API
"""

import os
import logging
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client


class Config:
    """Configuration class for application settings"""
    
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Setup logging
        self.setup_logging()
        
        # Initialize logger
        self.logger = logging.getLogger(__name__)
        
        # Environment variables
        self.supabase_url = os.environ.get("SUPABASE_URL")
        self.supabase_key = os.environ.get("SUPABASE_KEY")
        self.apify_token = os.environ.get("APIFY_API_TOKEN")
        self.builtwith_key = os.environ.get("BUILTWITH_API_KEY")
        self.openrouter_key = os.environ.get("OPENROUTER_API_KEY")
        
        # Initialize Supabase client
        self.supabase = self.setup_supabase()
        
        # Log configuration status
        self.log_configuration_status()
    
    def setup_logging(self):
        """Configure logging for the application"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler('backend.log', encoding='utf-8')
            ]
        )
    
    def setup_supabase(self) -> Optional[Client]:
        """Initialize Supabase client"""
        if self.supabase_url and self.supabase_key:
            try:
                # Create client with service key for backend operations
                client = create_client(self.supabase_url, self.supabase_key)
                
                # Test the connection
                try:
                    result = client.table("users").select("count", count="exact").execute()
                    print("✅ Supabase client initialized and tested successfully")
                    self.logger.info("✅ Supabase client initialized and tested successfully")
                    return client
                except Exception as test_error:
                    print(f"⚠️ Supabase client created but connection test failed: {test_error}")
                    self.logger.warning(f"⚠️ Supabase client created but connection test failed: {test_error}")
                    # Return client anyway, as it might work for other operations
                    return client
                    
            except Exception as e:
                print(f"❌ Failed to initialize Supabase client: {e}")
                self.logger.error(f"❌ Failed to initialize Supabase client: {e}")
                return None
        else:
            print("⚠️ Supabase credentials not found in environment variables")
            self.logger.warning("⚠️ Supabase credentials not found in environment variables")
            return None
    
    def log_configuration_status(self):
        """Log the status of all configuration items"""
        print(f"Current working directory: {os.getcwd()}")
        print(f".env file exists: {os.path.exists('.env')}")
        
        self.logger.info("Backend starting up...")
        self.logger.info(f"Current working directory: {os.getcwd()}")
        self.logger.info(f".env file exists: {os.path.exists('.env')}")
        self.logger.info(f"SUPABASE_URL configured: {'Yes' if self.supabase_url else 'No'}")
        self.logger.info(f"SUPABASE_KEY configured: {'Yes' if self.supabase_key else 'No'}")
        self.logger.info(f"APIFY_TOKEN configured: {'Yes' if self.apify_token else 'No'}")
        self.logger.info(f"BUILTWITH_KEY configured: {'Yes' if self.builtwith_key else 'No'}")
        self.logger.info(f"OPENROUTER_KEY configured: {'Yes' if self.openrouter_key else 'No'}")
    
    def get_health_status(self) -> dict:
        """Get health status of all services"""
        return {
            "supabase": "✅" if self.supabase else "❌",
            "apify": "✅" if self.apify_token else "❌",
            "builtwith": "✅" if self.builtwith_key else "❌",
            "openrouter": "✅" if self.openrouter_key else "❌"
        }


# Global configuration instance
config = Config()
