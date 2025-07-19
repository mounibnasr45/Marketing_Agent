# routes.py

import json
import logging
import base64
import os
import traceback
from fastapi import APIRouter, HTTPException
import requests
from dotenv import load_dotenv

# Import the specific models required for this tool
from models import (
    DomainTechnologiesRequest,
    DomainsByTechnologyRequest,
    TechnologiesSummaryRequest
)

# Load environment variables from a .env file for security
load_dotenv()

# Setup a new router for this specific feature set
router_builtwith = APIRouter(
    prefix="/api/domain-analytics", 
    tags=["Domain Analytics"]
)
logger = logging.getLogger(__name__)


# --- DataForSEO API Configuration ---
DATAFORSEO_LOGIN = os.getenv("DATAFORSEO_LOGIN")
DATAFORSEO_PASSWORD = os.getenv("DATAFORSEO_PASSWORD")

# Ensure credentials are present before starting the application
if not DATAFORSEO_LOGIN or not DATAFORSEO_PASSWORD:
    raise ValueError("DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set in the environment.")

# Encode credentials once for use in all API calls
AUTH_TOKEN = base64.b64encode(f"{DATAFORSEO_LOGIN}:{DATAFORSEO_PASSWORD}".encode()).decode()
DATAFORSEO_API_BASE_URL = "https://api.dataforseo.com/v3"


def call_dataforseo_v3_api(endpoint_path: str, data: list):
    """
    A centralized function to handle all POST requests to the DataForSEO v3 API.

    This function sets the required headers, sends the request, and performs robust
    error handling, converting API errors into FastAPI HTTPExceptions.
    """
    url = f"{DATAFORSEO_API_BASE_URL}/{endpoint_path}"
    headers = {
        "Authorization": f"Basic {AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        logger.info(f"Calling DataForSEO Endpoint: {url}")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()  # Raises an exception for 4xx/5xx responses
        return response.json()
        
    except requests.exceptions.HTTPError as http_err:
        error_detail = response.text
        logger.error(f"HTTP error occurred: {http_err} - {error_detail}")
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Error from DataForSEO API: {error_detail}"
        )
    except requests.exceptions.RequestException as req_err:
        logger.error(f"Request error occurred: {req_err}")
        raise HTTPException(
            status_code=503,
            detail=f"Could not connect to the DataForSEO API: {req_err}"
        )
    except Exception:
        logger.error(f"An unexpected error occurred: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail="An internal server error occurred."
        )


# --- API Endpoints for BuiltWith Functionality ---

@router_builtwith.post("/domain-technologies", summary="Get Technology Stack for a Domain")
async def get_domain_technologies(request: DomainTechnologiesRequest):
    """
    Proxies a request to the DataForSEO Domain Technologies API to identify 
    the technology stack for a single target domain.
    """
    endpoint_path = "domain_analytics/technologies/domain_technologies/live"
    post_data = [{"target": request.target}]
    return call_dataforseo_v3_api(endpoint_path, post_data)


@router_builtwith.post("/domains-by-technology", summary="Find Domains Using a Technology")
async def get_domains_by_technology(request: DomainsByTechnologyRequest):
    """
    Proxies a request to the DataForSEO Domains by Technology API to find a list 
    of domains that use a specific technology, with filtering and sorting options.
    """
    endpoint_path = "domain_analytics/technologies/domains_by_technology/live"
    
    # Dynamically build the 'filters' array for the API payload
    filters = []
    # The frontend sends 'ANY' for no filter; otherwise, add the country filter
    if request.country_iso_code and request.country_iso_code.upper() != "ANY":
        filters.append(["country_iso_code", "=", request.country_iso_code])
        
    if request.domain_rank_min is not None and request.domain_rank_min > 0:
        if filters: # Add 'and' if a filter already exists
            filters.append("and")
        filters.append(["domain_rank", ">", request.domain_rank_min])

    post_data = [{
        "technologies": request.technologies,
        "filters": filters if filters else None,  # API requires null for no filters
        "order_by": [request.order_by],
        "limit": request.limit
    }]
    return call_dataforseo_v3_api(endpoint_path, post_data)


@router_builtwith.post("/technologies-summary", summary="Get Aggregated Tech Statistics")
async def get_technologies_summary(request: TechnologiesSummaryRequest):
    """
    Proxies a request to the DataForSEO Technologies Summary API to get aggregated 
    statistics about technology usage across the web, with filters.
    """
    endpoint_path = "domain_analytics/technologies/technologies_summary/live"

    filters = []
    if request.country_iso_code and request.country_iso_code.upper() != "ANY":
        filters.append(["country_iso_code", "=", request.country_iso_code])
        
    if request.domain_rank_min is not None and request.domain_rank_min > 0:
        if filters:
            filters.append("and")
        filters.append(["domain_rank", ">", request.domain_rank_min])
        
    post_data = [{
        "mode": request.mode,
        "technologies": request.technologies,
        "keywords": request.keywords,
        "filters": filters if filters else None
    }]
    return call_dataforseo_v3_api(endpoint_path, post_data)