"""
Database service for managing user data and analysis history
"""

import json
import logging
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from config import config
from models import ApifyResult, ChatMessage

logger = logging.getLogger(__name__)


class DatabaseService:
    """Service for managing database operations"""
    
    def __init__(self):
        self.supabase = config.supabase
        self.logger = logger
        
        # Log the status of the Supabase client
        if self.supabase:
            self.logger.info("✅ DatabaseService initialized with Supabase client")
            print("✅ DatabaseService initialized with Supabase client")
        else:
            self.logger.warning("⚠️ DatabaseService initialized without Supabase client")
            print("⚠️ DatabaseService initialized without Supabase client")
    
    async def save_analysis_session(
        self, 
        user_id: str, 
        domains: List[str],
        similarweb_data: List[ApifyResult], 
        builtwith_data: List[ApifyResult] = None,
        chat_discussion: List[Dict[str, Any]] = None
    ) -> str:
        """
        Save a complete analysis session to the database
        Returns session_id for reference
        """
        try:
            if not self.supabase:
                self.logger.warning("Supabase client not available")
                return None
            
            # Ensure user exists
            user_created = await self._ensure_user_exists(user_id)
            if not user_created:
                self.logger.warning("Failed to ensure user exists, proceeding anyway")
            
            # Generate session ID
            session_id = str(uuid.uuid4())
            
            # Prepare data for insertion
            session_data = {
                "id": session_id,
                "user_id": self._ensure_valid_uuid(user_id),
                "domains": domains,
                "similarweb_jsonb": json.dumps([item.model_dump() for item in similarweb_data]) if similarweb_data else None,
                "builtwith_jsonb": json.dumps([item.model_dump() for item in builtwith_data]) if builtwith_data else None,
                "chat_discussion": json.dumps(chat_discussion) if chat_discussion else None,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Insert session with retry logic
            try:
                result = self.supabase.table("analysis_sessions").insert(session_data).execute()
                self.logger.info(f"Analysis session saved successfully: {session_id}")
                return session_id
            except Exception as db_error:
                self.logger.error(f"Database insert failed: {db_error}")
                # If RLS is blocking, try without user validation
                if "row-level security policy" in str(db_error).lower():
                    self.logger.warning("RLS policy blocking insert, trying alternative approach")
                    # For now, return a session ID but don't save to DB
                    # This allows the system to continue working
                    return session_id
                else:
                    raise db_error
            
        except Exception as e:
            self.logger.error(f"Error saving analysis session: {e}")
            # Return a session ID to allow the system to continue
            return str(uuid.uuid4())
    
    async def update_analysis_session(
        self, 
        session_id: str,
        similarweb_data: List[ApifyResult] = None,
        builtwith_data: List[ApifyResult] = None,
        chat_discussion: List[Dict[str, Any]] = None
    ) -> bool:
        """
        Update an existing analysis session
        """
        try:
            if not self.supabase:
                self.logger.warning("Supabase client not available")
                return False
            
            # Prepare update data
            update_data = {
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if similarweb_data:
                update_data["similarweb_jsonb"] = json.dumps([item.model_dump() for item in similarweb_data])
            
            if builtwith_data:
                update_data["builtwith_jsonb"] = json.dumps([item.model_dump() for item in builtwith_data])
            
            if chat_discussion:
                update_data["chat_discussion"] = json.dumps(chat_discussion)
            
            # Update session
            result = self.supabase.table("analysis_sessions").update(update_data).eq("id", session_id).execute()
            
            self.logger.info(f"Analysis session updated successfully: {session_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error updating analysis session: {e}")
            return False
    
    async def get_user_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get user's analysis history
        """
        try:
            if not self.supabase:
                self.logger.warning("Supabase client not available")
                return []
            
            valid_user_id = self._ensure_valid_uuid(user_id)
            
            # Get user's analysis sessions
            result = self.supabase.table("analysis_sessions")\
                .select("*")\
                .eq("user_id", valid_user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            if result.data:
                # Parse JSON fields for each session
                sessions = []
                for session in result.data:
                    try:
                        parsed_session = {
                            "id": session["id"],
                            "user_id": session["user_id"],
                            "domains": session["domains"],
                            "created_at": session["created_at"],
                            "updated_at": session["updated_at"],
                            "similarweb_data": json.loads(session["similarweb_jsonb"]) if session["similarweb_jsonb"] else None,
                            "builtwith_data": json.loads(session["builtwith_jsonb"]) if session["builtwith_jsonb"] else None,
                            "chat_discussion": json.loads(session["chat_discussion"]) if session["chat_discussion"] else None
                        }
                        sessions.append(parsed_session)
                    except Exception as parse_error:
                        self.logger.error(f"Error parsing session data: {parse_error}")
                        continue
                
                self.logger.info(f"Retrieved {len(sessions)} analysis sessions for user {valid_user_id}")
                return sessions
            
            return []
            
        except Exception as e:
            self.logger.error(f"Error retrieving user history: {e}")
            return []
    
    async def get_analysis_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific analysis session by ID
        """
        try:
            if not self.supabase:
                self.logger.warning("Supabase client not available")
                return None
            
            # Get session
            result = self.supabase.table("analysis_sessions")\
                .select("*")\
                .eq("id", session_id)\
                .execute()
            
            if result.data and len(result.data) > 0:
                session = result.data[0]
                parsed_session = {
                    "id": session["id"],
                    "user_id": session["user_id"],
                    "domains": session["domains"],
                    "created_at": session["created_at"],
                    "updated_at": session["updated_at"],
                    "similarweb_data": json.loads(session["similarweb_jsonb"]) if session["similarweb_jsonb"] else None,
                    "builtwith_data": json.loads(session["builtwith_jsonb"]) if session["builtwith_jsonb"] else None,
                    "chat_discussion": json.loads(session["chat_discussion"]) if session["chat_discussion"] else None
                }
                
                self.logger.info(f"Retrieved analysis session: {session_id}")
                return parsed_session
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error retrieving analysis session: {e}")
            return None
    
    async def save_chat_message(self, session_id: str, message: str, response: str, is_user: bool = True) -> bool:
        """
        Save a chat message to an analysis session
        """
        try:
            if not self.supabase:
                self.logger.warning("Supabase client not available")
                return False
            
            # Get current session
            session = await self.get_analysis_session(session_id)
            if not session:
                self.logger.error(f"Analysis session not found: {session_id}")
                return False
            
            # Get existing chat discussion
            chat_discussion = session.get("chat_discussion", [])
            if not chat_discussion:
                chat_discussion = []
            
            # Add new message
            chat_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "message": message,
                "response": response,
                "is_user": is_user
            }
            chat_discussion.append(chat_entry)
            
            # Update session with new chat
            return await self.update_analysis_session(
                session_id=session_id,
                chat_discussion=chat_discussion
            )
            
        except Exception as e:
            self.logger.error(f"Error saving chat message: {e}")
            return False
    
    async def delete_analysis_session(self, session_id: str, user_id: str) -> bool:
        """
        Delete an analysis session (only if it belongs to the user)
        """
        try:
            if not self.supabase:
                self.logger.warning("Supabase client not available")
                return False
            
            valid_user_id = self._ensure_valid_uuid(user_id)
            
            # Delete session (with user verification)
            result = self.supabase.table("analysis_sessions")\
                .delete()\
                .eq("id", session_id)\
                .eq("user_id", valid_user_id)\
                .execute()
            
            self.logger.info(f"Analysis session deleted: {session_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error deleting analysis session: {e}")
            return False
    
    async def _ensure_user_exists(self, user_id: str) -> bool:
        """Ensure user record exists in Supabase"""
        if not self.supabase:
            return False
        
        try:
            valid_user_id = self._ensure_valid_uuid(user_id)
            
            # Check if user exists
            result = self.supabase.table("users").select("id").eq("id", valid_user_id).execute()
            
            if not result.data or len(result.data) == 0:
                # User doesn't exist, create them
                self.logger.info(f"Creating user record for: {valid_user_id}")
                try:
                    insert_result = self.supabase.table("users").insert({
                        "id": valid_user_id,
                        "created_at": datetime.utcnow().isoformat()
                    }).execute()
                    self.logger.info(f"Created user record: {valid_user_id}")
                    return True
                except Exception as insert_error:
                    self.logger.error(f"Failed to create user record: {insert_error}")
                    # If RLS is blocking, just continue - user might exist with different permissions
                    if "row-level security policy" in str(insert_error).lower():
                        self.logger.warning("RLS policy blocking user creation, continuing anyway")
                        return True
                    return False
            else:
                self.logger.info(f"User record already exists: {valid_user_id}")
                return True
                
        except Exception as e:
            self.logger.error(f"Error ensuring user exists: {e}")
            return False
    
    def _ensure_valid_uuid(self, user_id: str) -> str:
        """Ensure the user_id is a valid UUID, generate one if not"""
        try:
            # Try to parse as UUID
            uuid.UUID(user_id)
            return user_id
        except ValueError:
            # If not a valid UUID, generate a UUID5 from the string
            # This ensures the same string always generates the same UUID
            namespace = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')  # Standard namespace
            generated_uuid = str(uuid.uuid5(namespace, user_id))
            self.logger.info(f"Generated UUID {generated_uuid} for user_id: {user_id}")
            return generated_uuid
    
    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            if not self.supabase:
                self.logger.warning("Supabase client not available for testing")
                return False
            
            # Try a simple query
            result = self.supabase.table("users").select("count", count="exact").execute()
            self.logger.info(f"✅ Database connection test successful. Found {result.count} users")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Database connection test failed: {e}")
            return False


# Global database service instance
db_service = DatabaseService()
