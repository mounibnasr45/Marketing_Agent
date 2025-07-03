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
            name="LinkedIn",
            globalRank=27,
            countryRank=15,
            categoryRank=1,
            companyName="LinkedIn Corporation",
            companyYearFounded=2003,
            companyEmployeesMin=10000,
            companyEmployeesMax=50000,
            totalVisits=2500000000,
            avgVisitDuration="8:45",
            pagesPerVisit=4.2,
            bounceRate=0.35,
            trafficSources=TrafficSources(
                directVisitsShare=0.45,
                organicSearchVisitsShare=0.35,
                referralVisitsShare=0.10,
                socialNetworksVisitsShare=0.05,
                mailVisitsShare=0.03,
                paidSearchVisitsShare=0.02,
                adsVisitsShare=0.00
            ),
            topCountries=[
                TopCountry(countryAlpha2Code="US", visitsShare=0.42, visitsShareChange=0.02),
                TopCountry(countryAlpha2Code="IN", visitsShare=0.15, visitsShareChange=0.05),
                TopCountry(countryAlpha2Code="GB", visitsShare=0.08, visitsShareChange=-0.01),
            ],
            topKeywords=[
                TopKeyword(name="linkedin", volume=50000000, estimatedValue=45000000, cpc=2.50),
                TopKeyword(name="linkedin login", volume=25000000, estimatedValue=20000000, cpc=1.80),
                TopKeyword(name="jobs", volume=15000000, estimatedValue=12000000, cpc=3.20),
            ],
            socialNetworkDistribution=[
                SocialNetworkDistribution(name="Facebook", visitsShare=0.35),
                SocialNetworkDistribution(name="Twitter", visitsShare=0.25),
                SocialNetworkDistribution(name="Instagram", visitsShare=0.20),
            ],
            topSimilarityCompetitors=[
                TopSimilarityCompetitor(domain="indeed.com", visitsTotalCount=1800000000, affinity=0.85, categoryRank=2),
                TopSimilarityCompetitor(domain="glassdoor.com", visitsTotalCount=500000000, affinity=0.75, categoryRank=5),
            ],
            organicTraffic=875000000.0,
            paidTraffic=50000000.0,
            builtwith_result=BuiltWithResult(
                domain="linkedin.com",
                technologies=[
                    Technology(name="React", tag="JavaScript Frameworks", version="18.2.0", popularity=88),
                    Technology(name="Node.js", tag="Web Servers", version="18.17.0", popularity=82),
                    Technology(name="Amazon CloudFront", tag="CDN", popularity=75),
                    Technology(name="Google Analytics", tag="Analytics", version="GA4", popularity=95),
                    Technology(name="Nginx", tag="Web Servers", version="1.21.1", popularity=85),
                    Technology(name="Amazon Web Services", tag="Cloud Computing", popularity=75),
                    Technology(name="Bootstrap", tag="CSS Frameworks", popularity=70),
                    Technology(name="jQuery", tag="JavaScript Libraries", popularity=65),
                ]
            )
        ),
        ApifyResult(
            name="GitHub",
            globalRank=64,
            countryRank=35,
            categoryRank=2,
            companyName="GitHub Inc.",
            companyYearFounded=2008,
            companyEmployeesMin=1000,
            companyEmployeesMax=5000,
            totalVisits=1200000000,
            avgVisitDuration="12:30",
            pagesPerVisit=6.8,
            bounceRate=0.28,
            trafficSources=TrafficSources(
                directVisitsShare=0.55,
                organicSearchVisitsShare=0.30,
                referralVisitsShare=0.12,
                socialNetworksVisitsShare=0.02,
                mailVisitsShare=0.01,
                paidSearchVisitsShare=0.00,
                adsVisitsShare=0.00
            ),
            topCountries=[
                TopCountry(countryAlpha2Code="US", visitsShare=0.38, visitsShareChange=0.01),
                TopCountry(countryAlpha2Code="CN", visitsShare=0.12, visitsShareChange=0.03),
                TopCountry(countryAlpha2Code="IN", visitsShare=0.11, visitsShareChange=0.04),
            ],
            topKeywords=[
                TopKeyword(name="github", volume=30000000, estimatedValue=25000000, cpc=1.20),
                TopKeyword(name="git", volume=20000000, estimatedValue=15000000, cpc=0.80),
                TopKeyword(name="open source", volume=8000000, estimatedValue=6000000, cpc=1.50),
            ],
            socialNetworkDistribution=[
                SocialNetworkDistribution(name="Twitter", visitsShare=0.45),
                SocialNetworkDistribution(name="Reddit", visitsShare=0.30),
                SocialNetworkDistribution(name="LinkedIn", visitsShare=0.15),
            ],
            topSimilarityCompetitors=[
                TopSimilarityCompetitor(domain="gitlab.com", visitsTotalCount=150000000, affinity=0.90, categoryRank=3),
                TopSimilarityCompetitor(domain="stackoverflow.com", visitsTotalCount=800000000, affinity=0.70, categoryRank=1),
            ],
            organicTraffic=360000000.0,
            paidTraffic=0.0,
            builtwith_result=BuiltWithResult(
                domain="github.com",
                technologies=[
                    Technology(name="Ruby on Rails", tag="Web Frameworks", popularity=70),
                    Technology(name="MySQL", tag="Databases", version="8.0.33", popularity=73),
                    Technology(name="Redis", tag="Caching", popularity=68),
                    Technology(name="Fastly", tag="CDN", popularity=75),
                    Technology(name="GitHub Analytics", tag="Analytics", popularity=80),
                    Technology(name="Amazon Web Services", tag="Cloud Computing", popularity=75),
                    Technology(name="Elasticsearch", tag="Search Engines", popularity=65),
                    Technology(name="JavaScript", tag="Programming Languages", popularity=85),
                ]
            )
        )
    ]
