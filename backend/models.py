"""
Pydantic models for the BuiltWith Analyzer API
"""

from pydantic import BaseModel
from typing import List, Optional


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
