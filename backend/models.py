"""
Pydantic models for the BuiltWith Analyzer API
"""

from pydantic import BaseModel
from typing import List, Optional

"""
Pydantic models for the BuiltWith Analyzer API
"""

from pydantic import BaseModel, Field
from typing import List, Optional

# --- Existing models can remain here ---
# ...

# --- NEW: Models for the Keywords Data API Tool ---

class BaseKeywordRequest(BaseModel):
    """A base model containing common fields for all keyword requests."""
    location_code: int = Field(2840, description="Location code for the search. Default is 2840 for US.")
    language_code: str = Field("en", description="Language code for the search. Default is 'en'.")
    method: str = Field("live", description="The method to use: 'live' for instant results or 'standard' for asynchronous tasks.")
    tag: Optional[str] = Field(None, description="An optional user-defined tag for tracking asynchronous tasks.")

class SearchVolumeRequest(BaseKeywordRequest):
    """Request model for the Search Volume endpoint."""
    keywords: List[str] = Field(..., description="A list of keywords to get search volume for.")
    search_partners: bool = Field(True, description="Indicates if Google search partners should be included.")

class KeywordsForSiteRequest(BaseKeywordRequest):
    """Request model for the Keywords For Site endpoint."""
    target: str = Field(..., description="The domain or URL to find keywords for.")
    target_type: str = Field("site", description="The type of target: 'site' or 'page'.")

class KeywordsForKeywordsRequest(BaseKeywordRequest):
    """Request model for the Keywords For Keywords endpoint."""
    keywords: List[str] = Field(..., description="A list of seed keywords to generate ideas from.")

class AdTrafficRequest(BaseKeywordRequest):
    """Request model for the Ad Traffic By Keywords endpoint."""
    keywords: List[str] = Field(..., description="A list of keywords to estimate ad traffic for.")
    bid: int = Field(999, description="The maximum custom bid amount.")
    match: str = Field("exact", description="The keyword match type: 'exact', 'phrase', or 'broad'.")
    date_interval: str = Field("next_month", description="The forecasting date interval.")
class TrafficSources(BaseModel):
    directVisitsShare: float
    organicSearchVisitsShare: float
    referralVisitsShare: float
    socialNetworksVisitsShare: float
    mailVisitsShare: float
    paidSearchVisitsShare: float
    adsVisitsShare: float


class TopCountry(BaseModel):
    countryAlpha2Code: str
    visitsShare: float
    visitsShareChange: float


class TopKeyword(BaseModel):
    name: str
    volume: int
    estimatedValue: int
    cpc: float


class SocialNetworkDistribution(BaseModel):
    name: str
    visitsShare: float


class TopSimilarityCompetitor(BaseModel):
    domain: str
    visitsTotalCount: int
    affinity: float
    categoryRank: Optional[int] = None  # Allow None values


class Technology(BaseModel):
    name: str
    tag: str  # e.g., "Analytics", "Frameworks", "CDN"
    version: Optional[str] = None
    popularity: Optional[int] = None


class BuiltWithResult(BaseModel):
    domain: str
    technologies: List[Technology]


class ApifyResult(BaseModel):
    name: str
    globalRank: int
    countryRank: int
    categoryRank: int
    companyName: str
    companyYearFounded: int
    companyEmployeesMin: int
    companyEmployeesMax: Optional[int] = None
    totalVisits: int
    avgVisitDuration: str
    pagesPerVisit: float
    bounceRate: float
    trafficSources: TrafficSources
    topCountries: List[TopCountry]
    topKeywords: List[TopKeyword]
    socialNetworkDistribution: List[SocialNetworkDistribution]
    topSimilarityCompetitors: List[TopSimilarityCompetitor]
    organicTraffic: float
    paidTraffic: float
    builtwith_result: Optional[BuiltWithResult] = None  # Add BuiltWith data


class WebsiteAnalysisRequest(BaseModel):
    websites: List[str]
    userId: str


class AnalysisResponse(BaseModel):
    success: bool
    data: List[ApifyResult]
    count: int
    note: Optional[str] = None
    session_id: Optional[str] = None  # Add session_id field


class ChatMessage(BaseModel):
    message: str
    analysis_data: dict
    session_id: Optional[str] = None  # Add session_id for chat tracking


class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None


class GoogleTrendsRequest(BaseModel):
    keywords: List[str]
    timeframe: str = "today 12-m"
    geography: str = "worldwide"


class GoogleTrendsResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


class BuiltWithOnlyResult(BaseModel):
    domain: str
    name: str
    builtwith_result: Optional[BuiltWithResult] = None


class BuiltWithAnalysisResponse(BaseModel):
    success: bool
    data: List[BuiltWithOnlyResult]
    count: int
    note: Optional[str] = None
    session_id: Optional[str] = None
