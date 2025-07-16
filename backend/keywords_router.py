# routes/keywords_router.py

import logging
from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from requests.exceptions import HTTPError

# Corrected import path based on the suggested project structure
from clients.dataforseo_client import DataForSEOClient

# --- Pydantic Models for Request Validation ---

class BaseKeywordsRequest(BaseModel):
    """Base model for common optional fields across keyword requests."""
    location_name: Optional[str] = Field(None, description="Full name of the location, e.g., 'United States'. Use this or location_code.")
    location_code: Optional[int] = Field(None, description="Location code. Find at https://docs.dataforseo.com/v3/keywords_data/google_ads/locations")
    language_code: Optional[str] = Field("en", description="Language code, e.g., 'en'.")
    search_partners: Optional[bool] = Field(False, description="Set to true to include Google search partners.")
    tag: Optional[str] = Field(None, description="User-defined tag for the task.", max_length=255)

class SearchVolumeRequest(BaseKeywordsRequest):
    keywords: List[str] = Field(..., description="A list of up to 1000 keywords.", min_items=1, max_items=1000)

class KeywordsForSiteRequest(BaseKeywordsRequest):
    target: str = Field(..., description="The domain or page URL to analyze.")
    target_type: Literal['site', 'page'] = Field('page', description="Analyze the entire site or just the target page.")

class KeywordsForKeywordsRequest(BaseKeywordsRequest):
    keywords: List[str] = Field(..., description="A list of up to 20 seed keywords.", min_items=1, max_items=20)

class AdTrafficByKeywordsRequest(BaseKeywordsRequest):
    keywords: List[str] = Field(..., description="A list of up to 1000 keywords for traffic estimation.", min_items=1, max_items=1000)
    bid: float = Field(..., description="Maximum CPC bid you are willing to pay, e.g., 5.50.", gt=0)
    match: Literal['exact', 'broad', 'phrase'] = Field(..., description="Keyword match type.")
    date_interval: Optional[Literal['next_week', 'next_month', 'next_quarter']] = Field('next_month', description="Forecasting time period.")

# --- Router Setup ---
router = APIRouter(
    prefix="/api/keywords_data/google_ads",
    tags=["DataForSEO - Keywords"]
)
logger = logging.getLogger(__name__)

# --- Client Initialization ---
try:
    client = DataForSEOClient()
except ValueError as e:
    logger.error(f"FATAL: Could not initialize DataForSEOClient. {e}")
    client = None

# --- Helper Function ---
def handle_api_call(api_function, request_model_instance, is_get_call=False, **kwargs):
    if not client:
        raise HTTPException(status_code=503, detail="Keywords API client is not configured. Check server environment variables.")
    try:
        if is_get_call:
            logger.info(f"Calling DataForSEO GET API: {api_function.__name__}")
            return api_function(**kwargs)
        else:
            logger.info(f"Calling DataForSEO POST API: {api_function.__name__}")
            payload = [request_model_instance]
            return api_function(payload)
    except HTTPError as e:
        status_code = e.response.status_code if e.response is not None else 500
        try:
            error_detail = e.response.json()
        except:
            error_detail = f"DataForSEO API error: {e}"
        logger.error(f"API call failed with status {status_code}: {error_detail}")
        raise HTTPException(status_code=status_code, detail=error_detail)
    except Exception as e:
        logger.error(f"An unexpected server error occurred: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

# --- API Endpoints ---

# A. Live (Real-Time) Endpoints
@router.post("/search_volume/live", summary="Get Live Search Volume", response_model=dict)
def live_search_volume(request: SearchVolumeRequest):
    return handle_api_call(client.search_volume_live, request.model_dump(exclude_none=True))

@router.post("/keywords_for_site/live", summary="Get Live Keywords for Site", response_model=dict)
def live_keywords_for_site(request: KeywordsForSiteRequest):
    return handle_api_call(client.keywords_for_site_live, request.model_dump(exclude_none=True))

@router.post("/keywords_for_keywords/live", summary="Get Live Keywords for Keywords", response_model=dict)
def live_keywords_for_keywords(request: KeywordsForKeywordsRequest):
    return handle_api_call(client.keywords_for_keywords_live, request.model_dump(exclude_none=True))

@router.post("/ad_traffic_by_keywords/live", summary="Get Live Ad Traffic By Keywords", response_model=dict)
def live_ad_traffic_by_keywords(request: AdTrafficByKeywordsRequest):
    return handle_api_call(client.ad_traffic_by_keywords_live, request.model_dump(exclude_none=True))

# B. Standard (Asynchronous) Endpoints
@router.post("/search_volume/task", summary="Post Search Volume Task", response_model=dict)
def post_search_volume_task(request: SearchVolumeRequest):
    return handle_api_call(client.search_volume_post_task, request.model_dump(exclude_none=True))

@router.post("/keywords_for_site/task", summary="Post Keywords for Site Task", response_model=dict)
def post_keywords_for_site_task(request: KeywordsForSiteRequest):
    return handle_api_call(client.keywords_for_site_post_task, request.model_dump(exclude_none=True))

@router.post("/keywords_for_keywords/task", summary="Post Keywords for Keywords Task", response_model=dict)
def post_keywords_for_keywords_task(request: KeywordsForKeywordsRequest):
    return handle_api_call(client.keywords_for_keywords_post_task, request.model_dump(exclude_none=True))

@router.post("/ad_traffic_by_keywords/task", summary="Post Ad Traffic by Keywords Task", response_model=dict)
def post_ad_traffic_by_keywords_task(request: AdTrafficByKeywordsRequest):
    return handle_api_call(client.ad_traffic_by_keywords_post_task, request.model_dump(exclude_none=True))

@router.get("/{feature}/tasks_ready", summary="Check for completed tasks", response_model=dict)
def get_tasks_ready(feature: Literal['search_volume', 'keywords_for_site', 'keywords_for_keywords', 'ad_traffic_by_keywords']):
    api_map = {
        'search_volume': client.search_volume_get_tasks_ready,
        'keywords_for_site': client.keywords_for_site_get_tasks_ready,
        'keywords_for_keywords': client.keywords_for_keywords_get_tasks_ready,
        'ad_traffic_by_keywords': client.ad_traffic_by_keywords_get_tasks_ready,
    }
    return handle_api_call(api_map[feature], request_model_instance=None, is_get_call=True)

@router.get("/{feature}/task_get/{task_id}", summary="Retrieve task results by ID", response_model=dict)
def get_task_results(
    task_id: str = Path(..., description="The unique ID of the task."),
    feature: Literal['search_volume', 'keywords_for_site', 'keywords_for_keywords', 'ad_traffic_by_keywords'] = Path(..., description="The feature the task belongs to.")
):
    api_map = {
        'search_volume': client.search_volume_get_task_results,
        'keywords_for_site': client.keywords_for_site_get_task_results,
        'keywords_for_keywords': client.keywords_for_keywords_get_task_results,
        'ad_traffic_by_keywords': client.ad_traffic_by_keywords_get_task_results,
    }
    return handle_api_call(api_map[feature], request_model_instance=None, is_get_call=True, task_id=task_id)