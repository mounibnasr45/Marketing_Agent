"""
API route handlers for the BuiltWith Analyzer
"""

import json
import logging
from typing import List
from fastapi import APIRouter, HTTPException
from config import config
from models import WebsiteAnalysisRequest, AnalysisResponse, ChatMessage, ChatResponse, ApifyResult, GoogleTrendsRequest, GoogleTrendsResponse
from mock_data import get_mock_data
from clients import ApifyClient, OpenRouterClient
from clients.builtwith_client_fixed import BuiltWithClientFixed
from clients.google_trends_client import GoogleTrendsClient
from database_service import db_service
import uuid

# Setup router
router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize clients
apify_client = ApifyClient(config.apify_token) if config.apify_token else None
builtwith_client = BuiltWithClientFixed(config.builtwith_key)
openrouter_client = OpenRouterClient(config.openrouter_key)
google_trends_client = GoogleTrendsClient()


@router.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "BuiltWith Analyzer API",
        "endpoints": {
            "similarweb": "POST /api/analyze",
            "builtwith": "POST /api/analyze-tech-stack",
            "google-trends": "POST /api/google-trends",
            "chat": "POST /api/chat"
        }
    }


@router.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_websites(request: WebsiteAnalysisRequest):
    """Step 1: Analyze websites with SimilarWeb only"""
    logger.info(f"[ANALYZE] Starting website analysis for {len(request.websites)} websites")
    logger.info(f"   Websites: {request.websites}")
    logger.info(f"   User ID: {request.userId}")
    
    if not request.websites:
        logger.error("[ERROR] No websites provided in request")
        raise HTTPException(status_code=400, detail="Please provide an array of websites to analyze")

    logger.info("[START] Starting SimilarWeb Analysis (Step 1)")
    print("[START] Starting SimilarWeb Analysis (Step 1)")
    print("=" * 50)

    logger.info(f"API Token Status - APIFY: {'YES' if config.apify_token else 'NO'}")
    print(f"APIFY_API_TOKEN: {'YES' if config.apify_token else 'NO'}")
    
    if not config.apify_token:
        logger.warning("[MOCK] No Apify API token found, using mock data")
        print("[MOCK] No Apify API token found, using mock data")
        
        # Return mock data WITHOUT BuiltWith analysis initially
        mock_data = get_mock_data()
        
        # Remove BuiltWith data for step-by-step process
        for item in mock_data:
            item.builtwith_result = None
        
        # Save to Supabase with session tracking
        session_id = await db_service.save_analysis_session(
            user_id=request.userId,
            domains=request.websites,
            similarweb_data=mock_data
        )

        logger.info("[SUCCESS] Step 1 (SimilarWeb) completed with mock data")
        print("[SUCCESS] Step 1 (SimilarWeb) completed with mock data")
        return AnalysisResponse(
            success=True,
            data=mock_data,
            count=len(mock_data),
            note=f"Step 1 complete: SimilarWeb analysis ready. Click 'Analyze Tech Stack' to continue.",
            session_id=session_id
        )

    try:
        logger.info("[API] Fetching data from Apify API...")
        print("[API] Fetching data from Apify API...")
        
        # Get SimilarWeb data only
        results = await apify_client.analyze_domains(request.websites)
        
        # Ensure no BuiltWith data is included yet
        for result in results:
            result.builtwith_result = None
        
        # Save to Supabase with session tracking
        session_id = await db_service.save_analysis_session(
            user_id=request.userId,
            domains=request.websites,
            similarweb_data=results
        )

        logger.info("[SUCCESS] Step 1 (SimilarWeb) completed successfully")
        print("[SUCCESS] Step 1 (SimilarWeb) completed successfully")
        return AnalysisResponse(
            success=True,
            data=results,
            count=len(results),
            note=f"Step 1 complete: SimilarWeb analysis ready. Click 'Analyze Tech Stack' to continue.",
            session_id=session_id
        )

    except Exception as e:
        logger.error(f"[ERROR] Error with Apify API: {str(e)}")
        print(f"[ERROR] Error with Apify API: {str(e)}")
        logger.warning("[FALLBACK] Falling back to mock data")
        print("[FALLBACK] Falling back to mock data")
        
        # Fall back to mock data if API fails
        mock_data = get_mock_data()
        
        # Remove BuiltWith data for step-by-step process
        for item in mock_data:
            item.builtwith_result = None
        
        # Save to Supabase with session tracking
        session_id = await db_service.save_analysis_session(
            user_id=request.userId,
            domains=request.websites,
            similarweb_data=mock_data
        )
            
        logger.info("[SUCCESS] Step 1 (SimilarWeb) completed with fallback data")
        print("[SUCCESS] Step 1 (SimilarWeb) completed with fallback data")
        return AnalysisResponse(
            success=True,
            data=mock_data,
            count=len(mock_data),
            note=f"Step 1 complete (with fallback): SimilarWeb analysis ready. API Error: {str(e)}",
            session_id=session_id
        )


@router.post("/api/analyze-tech-stack", response_model=AnalysisResponse)
async def analyze_tech_stack(request: WebsiteAnalysisRequest):
    """Step 2: Add BuiltWith technology analysis to existing SimilarWeb data"""
    logger.info(f"[TECH] Starting tech stack analysis for {len(request.websites)} websites")
    logger.info(f"   Websites: {request.websites}")
    logger.info(f"   User ID: {request.userId}")
    
    if not request.websites:
        logger.error("[ERROR] No websites provided in request")
        raise HTTPException(status_code=400, detail="Please provide an array of websites to analyze")

    logger.info("[TECH] Starting BuiltWith Tech Stack Analysis (Step 2)")
    print("[TECH] Starting BuiltWith Tech Stack Analysis (Step 2)")
    print("=" * 60)
    
    print(f"BUILTWITH_API_KEY: {'YES' if config.builtwith_key else 'NO'}")
    
    try:
        # Try to get existing data from user's latest session
        user_history = await db_service.get_user_history(request.userId, limit=1)
        
        # If no existing data, use mock data or get fresh data
        if not user_history or not user_history[0].get('similarweb_data'):
            print("[MOCK] Using mock data as base for BuiltWith analysis...")
            mock_data = get_mock_data()
            # Remove existing BuiltWith data
            for item in mock_data:
                item.builtwith_result = None
            results = mock_data
        else:
            # Convert existing data back to ApifyResult objects
            print("[CONVERT] Converting existing SimilarWeb data to objects...")
            results = []
            for item_data in user_history[0]['similarweb_data']:
                try:
                    # Remove existing BuiltWith data if any
                    item_data.pop('builtwith_result', None)
                    result = ApifyResult(**item_data)
                    results.append(result)
                except Exception as e:
                    print(f"[ERROR] Error converting data item: {e}")
                    continue
        
        print(f"[PROCESS] Starting BuiltWith analysis for {len(results)} websites...")
        print("-" * 60)
        
        # Add BuiltWith analysis for each domain
        for i, website_result in enumerate(results):
            # Extract domain from website name or use the provided URL
            if i < len(request.websites):
                website_url = request.websites[i]
            else:
                # Fallback: construct domain from website name
                website_url = website_result.name.lower().replace(" ", "") + ".com"
            
            print(f"\n[ANALYZE] Step 2.{i+1}: Analyzing {website_url}")
            print(f"   Website: {website_result.name}")
            print(f"   Global Rank: #{website_result.globalRank}")
            
            try:
                builtwith_result = await builtwith_client.analyze_domain(website_url)
                results[i].builtwith_result = builtwith_result
                
                tech_count = len(builtwith_result.technologies) if builtwith_result.technologies else 0
                print(f"   [SUCCESS] BuiltWith analysis complete: {tech_count} technologies found")
                
                if tech_count > 0:
                    # Show first few technologies as preview
                    preview_techs = builtwith_result.technologies[:3]
                    tech_preview = ", ".join([f"{t.name}" for t in preview_techs])
                    print(f"   [PREVIEW] Preview: {tech_preview}{'...' if tech_count > 3 else ''}")
                
            except Exception as e:
                print(f"   [ERROR] Error analyzing {website_url}: {e}")
                # Set empty BuiltWith result on error
                from models import BuiltWithResult
                results[i].builtwith_result = BuiltWithResult(domain=website_url, technologies=[])
        
        print("\n" + "=" * 60)
        print("[SAVE] Saving enhanced data (SimilarWeb + BuiltWith) to Supabase...")
        
        # Save enhanced data to Supabase - update existing session or create new one
        if user_history and user_history[0].get('id'):
            # Update existing session with BuiltWith data
            await db_service.update_analysis_session(
                session_id=user_history[0]['id'],
                builtwith_data=results
            )
        else:
            # Create new session with both SimilarWeb and BuiltWith data
            await db_service.save_analysis_session(
                user_id=request.userId,
                domains=request.websites,
                similarweb_data=results,
                builtwith_data=results
            )

        # Calculate summary statistics
        total_technologies = sum(
            len(item.builtwith_result.technologies) if item.builtwith_result else 0 
            for item in results
        )
        
        print("[COMPLETE] Step 2 Complete!")
        print(f"   Websites analyzed: {len(results)}")
        print(f"   Total technologies found: {total_technologies}")
        print("=" * 60)

        return AnalysisResponse(
            success=True,
            data=results,
            count=len(results),
            note=f"Step 2 complete: BuiltWith analysis added. Found {total_technologies} technologies across {len(results)} websites."
        )

    except Exception as e:
        print(f"\n[ERROR] Error in BuiltWith analysis: {str(e)}")
        print("[FALLBACK] Falling back to mock BuiltWith data...")
        
        # Fallback: use mock data with BuiltWith analysis
        mock_data = get_mock_data()
        
        # Save fallback data to Supabase
        await db_service.save_analysis_session(
            user_id=request.userId,
            domains=request.websites,
            similarweb_data=mock_data,
            builtwith_data=mock_data
        )
            
        return AnalysisResponse(
            success=True,
            data=mock_data,
            count=len(mock_data),
            note=f"Step 2 complete (with fallback): BuiltWith analysis added. Error: {str(e)}"
        )


@router.post("/api/chat", response_model=ChatResponse)
async def chat_with_analysis(request: ChatMessage):
    """Chat endpoint with analysis data context"""
    logger.info(f"[CHAT] Received chat message: {request.message}")
    logger.info(f"   Analysis data size: {len(str(request.analysis_data))} characters")
    print(f"[CHAT] Received chat message: {request.message}")
    
    logger.info(f"API Token Status - OPENROUTER: {'YES' if config.openrouter_key else 'NO'}")
    print(f"OPENROUTER_API_KEY: {'YES' if config.openrouter_key else 'NO'}")
    
    try:
        response = await openrouter_client.chat_completion(request.message, request.analysis_data)
        
        # Save chat message to database if session_id is provided
        if hasattr(request, 'session_id') and request.session_id:
            await db_service.save_chat_message(
                session_id=request.session_id,
                message=request.message,
                response=response.response
            )
        
        logger.info(f"[SUCCESS] Chat response generated successfully")
        print(f"[SUCCESS] Chat response generated successfully")
        return response
    except Exception as e:
        logger.error(f"[ERROR] Error in chat completion: {e}")
        print(f"[ERROR] Error in chat completion: {e}")
        # Return a fallback response
        return ChatResponse(
            response="I'm having trouble processing your request right now. Please try again later or rephrase your question.",
            suggestions=[
                "What are the main traffic sources?",
                "How does the technology stack compare?",
                "What are the growth opportunities?"
            ]
        )


@router.post("/api/google-trends", response_model=GoogleTrendsResponse)
async def analyze_google_trends(request: GoogleTrendsRequest):
    """Step 3: Analyze Google Trends data for given keywords"""
    logger.info(f"[GOOGLE TRENDS] Starting Google Trends analysis for {len(request.keywords)} keywords")
    logger.info(f"   Keywords: {request.keywords}")
    logger.info(f"   Timeframe: {request.timeframe}")
    logger.info(f"   Geography: {request.geography}")
    
    if not request.keywords:
        logger.error("[ERROR] No keywords provided in request")
        raise HTTPException(status_code=400, detail="Please provide keywords to analyze")

    print(f"[GOOGLE TRENDS] Starting Google Trends Analysis (Step 3)")
    print("=" * 60)
    print(f"Keywords: {request.keywords}")
    print(f"Timeframe: {request.timeframe}")
    print(f"Geography: {request.geography}")
    
    try:
        # Convert frontend timeframe format to Google Trends format
        timeframe_map = {
            "1hour": "now 1-H",
            "4hours": "now 4-H", 
            "1day": "now 1-d",
            "7days": "now 7-d",
            "1month": "today 1-m",
            "3months": "today 3-m",
            "12months": "today 12-m",
            "5years": "today 5-y"
        }
        
        # Convert geography format
        geo_map = {
            "worldwide": "",
            "united-states": "US",
            "canada": "CA",
            "united-kingdom": "GB",
            "australia": "AU",
            "germany": "DE",
            "france": "FR",
            "japan": "JP",
            "india": "IN",
            "brazil": "BR"
        }
        
        trends_timeframe = timeframe_map.get(request.timeframe, "today 12-m")
        trends_geo = geo_map.get(request.geography, "")
        
        logger.info(f"[GOOGLE TRENDS] Converted timeframe: {trends_timeframe}, geo: {trends_geo}")
        
        # Get trends data using the Google Trends client
        trends_data = google_trends_client.get_trends_data(
            keywords=request.keywords,
            timeframe=trends_timeframe,
            geo=trends_geo
        )
        
        if not trends_data['success']:
            logger.error(f"[ERROR] Google Trends client returned error: {trends_data.get('error', 'Unknown error')}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to fetch Google Trends data: {trends_data.get('error', 'Unknown error')}"
            )
        
        logger.info(f"[SUCCESS] Google Trends analysis completed successfully")
        print(f"[SUCCESS] Google Trends analysis completed successfully")
        print(f"   Keywords processed: {len(trends_data.get('keywords', []))}")
        print(f"   Data points: {len(trends_data.get('interest_over_time', {}).get('data', []))}")
        print("=" * 60)
        
        return GoogleTrendsResponse(
            success=True,
            data=trends_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Google Trends analysis error: {str(e)}")
        print(f"[ERROR] Google Trends analysis error: {str(e)}")
        
        # Return fallback response
        return GoogleTrendsResponse(
            success=False,
            error=f"Google Trends analysis failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": config.get_health_status()
    }


@router.get("/api/history/{user_id}")
async def get_user_history(user_id: str, limit: int = 50):
    """Get user's analysis history"""
    try:
        history = await db_service.get_user_history(user_id, limit)
        return {
            "success": True,
            "data": history,
            "count": len(history)
        }
    except Exception as e:
        logger.error(f"[ERROR] Error retrieving user history: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")


@router.get("/api/session/{session_id}")
async def get_analysis_session(session_id: str):
    """Get a specific analysis session"""
    try:
        session = await db_service.get_analysis_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Analysis session not found")
        
        return {
            "success": True,
            "data": session
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Error retrieving analysis session: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving session: {str(e)}")


@router.delete("/api/session/{session_id}")
async def delete_analysis_session(session_id: str, user_id: str):
    """Delete an analysis session"""
    try:
        success = await db_service.delete_analysis_session(session_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Analysis session not found or access denied")
        
        return {
            "success": True,
            "message": "Analysis session deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Error deleting analysis session: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")


@router.get("/api/history/{user_id}/domains")
async def get_user_analyzed_domains(user_id: str):
    """Get list of domains the user has analyzed"""
    try:
        history = await db_service.get_user_history(user_id)
        
        # Extract unique domains from history
        domains = set()
        for session in history:
            if session.get('domains'):
                domains.update(session['domains'])
        
        return {
            "success": True,
            "data": list(domains),
            "count": len(domains)
        }
    except Exception as e:
        logger.error(f"[ERROR] Error retrieving user domains: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving domains: {str(e)}")


@router.get("/api/test-db")
async def test_database_connection():
    """Test database connection"""
    try:
        connection_ok = db_service.test_connection()
        
        return {
            "success": connection_ok,
            "message": "Database connection successful" if connection_ok else "Database connection failed",
            "supabase_available": db_service.supabase is not None,
            "config_status": config.get_health_status()
        }
    except Exception as e:
        logger.error(f"[ERROR] Error testing database connection: {e}")
        return {
            "success": False,
            "message": f"Database test failed: {str(e)}",
            "supabase_available": False,
            "config_status": config.get_health_status()
        }


@router.get("/google-trends")
async def get_google_trends(query: str, timeframe: str = "today 12-m", geo: str = ""):
    """Get Google Trends data for a search query"""
    logger.info(f"[GOOGLE TRENDS] Fetching trends for query: {query}")
    
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query parameter is required")
    
    try:
        # Split query into keywords if multiple terms provided
        keywords = [keyword.strip() for keyword in query.split(',') if keyword.strip()]
        
        # Convert empty geo to worldwide
        if geo == "worldwide":
            geo = ""
        
        logger.info(f"[GOOGLE TRENDS] Processing keywords: {keywords}, timeframe: {timeframe}, geo: {geo}")
        
        # Get trends data
        trends_data = google_trends_client.get_trends_data(
            keywords=keywords,
            timeframe=timeframe,
            geo=geo
        )
        
        if not trends_data['success']:
            logger.error(f"[ERROR] Google Trends client returned error: {trends_data.get('error', 'Unknown error')}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to fetch Google Trends data: {trends_data.get('error', 'Unknown error')}"
            )
        
        logger.info(f"[SUCCESS] Google Trends data fetched successfully for {len(keywords)} keywords")
        return trends_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Google Trends API error: {str(e)}")
        logger.error(f"[ERROR] Exception type: {type(e)}")
        import traceback
        logger.error(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/google-trends/compare")
async def compare_google_trends(keywords: str, timeframe: str = "today 12-m"):
    """Compare multiple keywords in Google Trends"""
    logger.info(f"[GOOGLE TRENDS COMPARE] Comparing keywords: {keywords}")
    
    if not keywords.strip():
        raise HTTPException(status_code=400, detail="Keywords parameter is required")
    
    try:
        # Parse keywords
        keyword_list = [keyword.strip() for keyword in keywords.split(',') if keyword.strip()]
        
        if len(keyword_list) < 2:
            raise HTTPException(
                status_code=400, 
                detail="At least 2 keywords are required for comparison"
            )
        
        if len(keyword_list) > 5:
            raise HTTPException(
                status_code=400, 
                detail="Maximum 5 keywords allowed for comparison"
            )
        
        # Get comparison data
        comparison_data = google_trends_client.compare_keywords(
            keywords=keyword_list,
            timeframe=timeframe
        )
        
        if not comparison_data['success']:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to compare keywords: {comparison_data.get('error', 'Unknown error')}"
            )
        
        logger.info(f"[SUCCESS] Keywords compared successfully: {len(keyword_list)} keywords")
        return comparison_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Google Trends comparison error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
