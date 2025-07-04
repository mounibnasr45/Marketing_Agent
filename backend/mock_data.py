"""
Mock data generator for testing
"""

from typing import List
from models import (
    ApifyResult, 
    BuiltWithResult, 
    Technology, 
    TrafficSources, 
    TopCountry, 
    TopKeyword, 
    SocialNetworkDistribution, 
    TopSimilarityCompetitor
)


def get_mock_data() -> List[ApifyResult]:
    """Return mock data for testing when no API token is available"""
    return [
        ApifyResult(
            name="ooredoo.tn",
            globalRank=43976,
            countryRank=18,
            categoryRank=3,
            companyName="Ooredoo Tunisia",
            companyYearFounded=2001,
            companyEmployeesMin=1000,
            companyEmployeesMax=5000,
            totalVisits=1100000,
            avgVisitDuration="4:17",
            pagesPerVisit=3.2,
            bounceRate=0.417,
            trafficSources=TrafficSources(
                directVisitsShare=0.328,
                organicSearchVisitsShare=0.555,
                referralVisitsShare=0.087,
                socialNetworksVisitsShare=0.024,
                mailVisitsShare=0.004,
                paidSearchVisitsShare=0.002,
                adsVisitsShare=0.000
            ),
            topCountries=[
                TopCountry(countryAlpha2Code="TN", visitsShare=0.92, visitsShareChange=0.01),
                TopCountry(countryAlpha2Code="FR", visitsShare=0.05, visitsShareChange=0.00),
                TopCountry(countryAlpha2Code="DZ", visitsShare=0.02, visitsShareChange=0.00),
            ],
            topKeywords=[
                TopKeyword(name="ooredoo", volume=450000, estimatedValue=350000, cpc=0.45),
                TopKeyword(name="internet ooredoo", volume=180000, estimatedValue=140000, cpc=0.38),
                TopKeyword(name="ooredoo tunisie", volume=120000, estimatedValue=95000, cpc=0.42),
            ],
            socialNetworkDistribution=[
                SocialNetworkDistribution(name="Facebook", visitsShare=0.65),
                SocialNetworkDistribution(name="Instagram", visitsShare=0.25),
                SocialNetworkDistribution(name="YouTube", visitsShare=0.10),
            ],
            topSimilarityCompetitors=[
                TopSimilarityCompetitor(domain="tunisietelecom.tn", visitsTotalCount=800000, affinity=0.78, categoryRank=1),
                TopSimilarityCompetitor(domain="orange.tn", visitsTotalCount=650000, affinity=0.72, categoryRank=2),
                TopSimilarityCompetitor(domain="topnet.tn", visitsTotalCount=420000, affinity=0.65, categoryRank=4),
            ],
            organicTraffic=610500.0,
            paidTraffic=2200.0,
            builtwith_result=None  # Will be populated in step 2
        )
    ]
