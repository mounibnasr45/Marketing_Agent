from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import httpx
import asyncio
import json
import logging
import time
from datetime import datetime
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('backend.log')
    ]
)
logger = logging.getLogger(__name__)

# Debug environment loading
print(f"Current working directory: {os.getcwd()}")
print(f".env file exists: {os.path.exists('.env')}")
print(f"All environment variables: {list(os.environ.keys())}")
logger.info("Backend starting up...")
logger.info(f"Current working directory: {os.getcwd()}")
logger.info(f".env file exists: {os.path.exists('.env')}")

# Initialize Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

print(f"SUPABASE_URL from env: {url}")
print(f"SUPABASE_KEY from env: {key[:20] + '...' if key else None}")
logger.info(f"SUPABASE_URL configured: {'Yes' if url else 'No'}")
logger.info(f"SUPABASE_KEY configured: {'Yes' if key else 'No'}")

# Check if Supabase credentials are available
supabase: Optional[Client] = None
if url and key:
    try:
        supabase = create_client(url, key)
        print("✅ Supabase client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
        supabase = None
else:
    print("⚠️ Supabase credentials not found in environment variables")
    print(f"SUPABASE_URL: {'✅' if url else '❌'}")
    print(f"SUPABASE_KEY: {'✅' if key else '❌'}")

app = FastAPI(title="BuiltWith Analyzer API", version="1.0.0")

# Logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log incoming request
    logger.info(f"📥 Incoming {request.method} request to {request.url.path}")
    logger.info(f"   Client: {request.client.host if request.client else 'unknown'}")
    logger.info(f"   Headers: {dict(request.headers)}")
    
    # Call the actual endpoint
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    
    # Log response
    logger.info(f"📤 Response for {request.method} {request.url.path}")
    logger.info(f"   Status: {response.status_code}")
    logger.info(f"   Processing time: {process_time:.3f}s")
    
    # Add processing time to response headers
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
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

# Pydantic models for BuiltWith
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

class ChatMessage(BaseModel):
    message: str
    analysis_data: dict

class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None

class ApifyClient:
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.actor_id = "heLi1j7hzjC2gFlIx"

    async def analyze_domains(self, websites: List[str]) -> List[ApifyResult]:
        async with httpx.AsyncClient() as client:
            try:
                # Start the actor run
                # The input format might need to be different for this actor
                input_data = {
                    "websites": websites,
                    "maxPages": 1,  # Add this to limit pages if needed
                }
                
                run_response = await client.post(
                    f"https://api.apify.com/v2/acts/{self.actor_id}/runs",
                    headers={
                        "Authorization": f"Bearer {self.api_token}",
                        "Content-Type": "application/json",
                    },
                    json=input_data,
                    timeout=30.0
                )

                if run_response.status_code != 201:  # Actor runs return 201 on creation
                    print(f"Unexpected status code: {run_response.status_code}")
                    print(f"Response: {run_response.text}")
                    raise HTTPException(status_code=500, detail=f"Failed to start actor run: {run_response.text}")

                run_data = run_response.json()
                run_id = run_data["data"]["id"]
                print(f"Started actor run with ID: {run_id}")

                # Poll for completion with a timeout
                max_polls = 60  # 5 minutes maximum
                poll_count = 0
                while poll_count < max_polls:
                    await asyncio.sleep(5)  # Wait 5 seconds
                    poll_count += 1
                    
                    status_response = await client.get(
                        f"https://api.apify.com/v2/acts/{self.actor_id}/runs/{run_id}",
                        headers={"Authorization": f"Bearer {self.api_token}"},
                        timeout=30.0
                    )
                    run = status_response.json()
                    current_status = run["data"]["status"]
                    print(f"Poll {poll_count}: Status = {current_status}")
                    
                    if current_status not in ["RUNNING", "READY"]:
                        break

                if poll_count >= max_polls:
                    raise HTTPException(status_code=504, detail="Actor run timed out")

                if run["data"]["status"] != "SUCCEEDED":
                    print(f"Actor run failed with status: {run['data']['status']}")
                    print(f"Run data: {run['data']}")
                    raise HTTPException(status_code=500, detail=f"Actor run failed with status: {run['data']['status']}")

                # Get the results from the dataset
                dataset_id = run["data"]["defaultDatasetId"]
                print(f"Fetching results from dataset: {dataset_id}")
                results_response = await client.get(
                    f"https://api.apify.com/v2/datasets/{dataset_id}/items",
                    headers={"Authorization": f"Bearer {self.api_token}"},
                    timeout=30.0
                )

                if results_response.status_code != 200:
                    print(f"Failed to fetch results: {results_response.status_code} - {results_response.text}")
                    raise HTTPException(status_code=500, detail=f"Failed to fetch results: {results_response.text}")

                results = results_response.json()
                print(f"Retrieved {len(results)} results")
                print(f"Sample result structure: {results[0] if results else 'No results'}")
                
                # Transform the results to match our model if needed
                transformed_results = []
                for result in results:
                    try:
                        # Create an ApifyResult object from the raw data
                        transformed_result = ApifyResult(**result)
                        transformed_results.append(transformed_result)
                    except Exception as transform_error:
                        print(f"Error transforming result: {transform_error}")
                        print(f"Result data: {result}")
                        # Skip invalid results or create a default one
                        continue
                
                return transformed_results

            except httpx.TimeoutException:
                raise HTTPException(status_code=504, detail="Request timeout")
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

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

class BuiltWithClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.builtwith.com/v20/api.json"

    async def analyze_domain(self, domain: str):
        if not self.api_key:
            return self._get_mock_builtwith_data(domain)
    
        print(f"   🌐 Calling BuiltWith API...")
        url = f"https://api.builtwith.com/v20/api.json?KEY={self.api_key}&LOOKUP={domain}"
        print(f"   🔗 URL: {url}")
    
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
    
        print(f"   📊 Response Status: {response.status_code}")
        print(f"   ✅ API response received")
        print(f"   📊 Response size: {len(response.text)} characters")
    
        try:
            return self._parse_builtwith_response(domain, data)
        except Exception as e:
            print(f"❌ Error parsing BuiltWith data: {e}")
            return self._get_mock_builtwith_data(domain)

    def _parse_builtwith_response(self, domain: str, data: dict) -> BuiltWithResult:
        """Parse BuiltWith API response into our model"""
        technologies = []
        
        try:
            print(f"🔍 Parsing BuiltWith response for {domain}")
            print(f"Response keys: {list(data.keys())}")
            
            if "Results" in data and len(data["Results"]) > 0:
                result = data["Results"][0]
                print(f"Result keys: {list(result.keys())}")
                
                if "Result" in result and "Paths" in result["Result"]:
                    paths = result["Result"]["Paths"]
                    print(f"Found {len(paths)} paths")
                    
                    for path in paths:
                        if "Technologies" in path:
                            techs = path["Technologies"]
                            print(f"Found {len(techs)} technology categories in path")
                            
                            for tech_category in techs:
                                # Ensure tech_category is a dict
                                if not isinstance(tech_category, dict):
                                    continue
                                    
                                category_name = tech_category.get("Name", "Other")
                                print(f"Processing category: {category_name}")
                                
                                # Check for direct technologies in the category
                                if "Technologies" in tech_category:
                                    for tech in tech_category["Technologies"]:
                                        if isinstance(tech, dict):
                                            tech_name = tech.get("Name", "Unknown")
                                            version = tech.get("Version", None)
                                            if tech_name and tech_name != "Unknown":
                                                technologies.append(Technology(
                                                    name=tech_name,
                                                    tag=category_name,
                                                    version=version
                                                ))
                                                print(f"Added tech: {tech_name} ({category_name})")
                                
                                # Also check for Categories structure
                                if "Categories" in tech_category:
                                    for category in tech_category["Categories"]:
                                        # Ensure category is a dict
                                        if not isinstance(category, dict):
                                            continue
                                            
                                        for tech in category.get("Technologies", []):
                                            # Ensure tech is a dict
                                            if not isinstance(tech, dict):
                                                continue
                                                
                                            tech_name = tech.get("Name", "Unknown")
                                            version = tech.get("Version", None)
                                            if tech_name and tech_name != "Unknown":
                                                technologies.append(Technology(
                                                    name=tech_name,
                                                    tag=category_name,
                                                    version=version
                                                ))
                                                print(f"Added tech: {tech_name} ({category_name})")
                
                # If no technologies found in Paths, check for a simpler structure
                if not technologies and "Technologies" in result:
                    print("Checking alternative technologies structure")
                    for tech_item in result["Technologies"]:
                        if isinstance(tech_item, dict):
                            tech_name = tech_item.get("Name", tech_item.get("name", "Unknown"))
                            category = tech_item.get("Category", tech_item.get("tag", "Other"))
                            version = tech_item.get("Version", None)
                            if tech_name and tech_name != "Unknown":
                                technologies.append(Technology(
                                    name=tech_name,
                                    tag=category,
                                    version=version
                                ))
                                print(f"Added tech (alt): {tech_name} ({category})")
                                
        except Exception as e:
            print(f"Error parsing BuiltWith response for {domain}: {e}")
            print(f"Response data: {data}")
        
        print(f"Final result: {len(technologies)} technologies parsed for {domain}")
        
        # If no technologies were found, fallback to mock data
        if not technologies:
            print(f"⚠️ No technologies found for {domain}, using mock data fallback")
            return self._get_mock_builtwith_data(domain)
        
        return BuiltWithResult(domain=domain, technologies=technologies)

    def _get_mock_builtwith_data(self, domain: str) -> BuiltWithResult:
        """Generate mock BuiltWith data for testing"""
        mock_data = {
            "linkedin.com": [
                Technology(name="React", tag="JavaScript Frameworks", version="18.2.0", popularity=88),
                Technology(name="Node.js", tag="Web Servers", version="18.17.0", popularity=82),
                Technology(name="Amazon CloudFront", tag="CDN", popularity=75),
                Technology(name="Google Analytics", tag="Analytics", version="GA4", popularity=95),
                Technology(name="Nginx", tag="Web Servers", version="1.21.1", popularity=85),
                Technology(name="Amazon Web Services", tag="Cloud Computing", popularity=75),
                Technology(name="Bootstrap", tag="CSS Frameworks", popularity=70),
                Technology(name="jQuery", tag="JavaScript Libraries", popularity=65),
            ],
            "github.com": [
                Technology(name="Ruby on Rails", tag="Web Frameworks", popularity=70),
                Technology(name="MySQL", tag="Databases", version="8.0.33", popularity=73),
                Technology(name="Redis", tag="Caching", popularity=68),
                Technology(name="Fastly", tag="CDN", popularity=75),
                Technology(name="GitHub Analytics", tag="Analytics", popularity=80),
                Technology(name="Amazon Web Services", tag="Cloud Computing", popularity=75),
                Technology(name="Elasticsearch", tag="Search Engines", popularity=65),
                Technology(name="JavaScript", tag="Programming Languages", popularity=85),
            ],
            "medium.com": [
                Technology(name="Node.js", tag="Web Servers", popularity=80),
                Technology(name="React", tag="JavaScript Frameworks", version="18.0.0", popularity=85),
                Technology(name="Amazon CloudFront", tag="CDN", popularity=75),
                Technology(name="Google Analytics", tag="Analytics", version="GA4", popularity=95),
                Technology(name="Amazon Web Services", tag="Cloud Computing", popularity=75),
                Technology(name="GraphQL", tag="APIs", popularity=70),
                Technology(name="PostgreSQL", tag="Databases", version="14.0", popularity=75),
                Technology(name="TypeScript", tag="Programming Languages", version="5.1.0", popularity=80),
            ],
            "facebook.com": [
                Technology(name="React", tag="JavaScript Frameworks", version="18.2.0", popularity=88),
                Technology(name="PHP", tag="Programming Languages", version="8.2.0", popularity=55),
                Technology(name="MySQL", tag="Databases", version="8.0.33", popularity=73),
                Technology(name="Memcached", tag="Caching", popularity=60),
                Technology(name="Facebook CDN", tag="CDN", popularity=90),
                Technology(name="Facebook Analytics", tag="Analytics", popularity=95),
                Technology(name="HipHop", tag="Web Frameworks", popularity=40),
                Technology(name="Cassandra", tag="Databases", popularity=65),
            ],
            "google.com": [
                Technology(name="Go", tag="Programming Languages", popularity=75),
                Technology(name="JavaScript", tag="Programming Languages", popularity=85),
                Technology(name="Google Cloud CDN", tag="CDN", popularity=85),
                Technology(name="Google Analytics", tag="Analytics", version="GA4", popularity=95),
                Technology(name="Bigtable", tag="Databases", popularity=70),
                Technology(name="Google Cloud Platform", tag="Cloud Computing", popularity=80),
                Technology(name="V8", tag="JavaScript Engines", popularity=85),
                Technology(name="Protocol Buffers", tag="APIs", popularity=70),
            ]
        }
        
        # Get mock data for the domain or default
        technologies = mock_data.get(domain, [
            Technology(name="JavaScript", tag="Programming Languages", popularity=85),
            Technology(name="HTML5", tag="Markup Languages", popularity=90),
            Technology(name="CSS3", tag="Stylesheets", popularity=85),
            Technology(name="Google Analytics", tag="Analytics", version="GA4", popularity=95),
            Technology(name="Cloudflare", tag="CDN", popularity=80),
        ])
        
        return BuiltWithResult(domain=domain, technologies=technologies)

class OpenRouterClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"

    async def chat_completion(self, message: str, analysis_data: dict) -> ChatResponse:
        if not self.api_key:
            print("getting mocking data")
            return self._get_mock_chat_response(message)

        # Prepare context from analysis data
        context = self._prepare_analysis_context(analysis_data)
        
        system_prompt = f"""You are an expert web analytics and technology stack analyst. You have access to comprehensive data about websites including traffic analytics, technology stacks, and competitive landscape. 

Based on the following analysis data:
{context}

Provide insightful, actionable answers to user questions about:
- Website traffic patterns and sources
- Technology stack analysis and recommendations
- Competitive positioning and opportunities
- Growth strategies and optimization suggestions
- Market insights and trends

Keep responses conversational but professional, and always back up insights with specific data points from the analysis."""

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "anthropic/claude-3.5-sonnet",  # or any other model available
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": message}
                        ],
                        "max_tokens": 1000,
                        "temperature": 0.7
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    assistant_message = data["choices"][0]["message"]["content"]
                    
                    # Generate relevant suggestions based on the response
                    suggestions = self._generate_suggestions(message, assistant_message)
                    
                    return ChatResponse(
                        response=assistant_message,
                        suggestions=suggestions
                    )
                else:
                    print(f"OpenRouter API error: {response.status_code} - {response.text}")
                    return self._get_mock_chat_response(message)
                    
            except Exception as e:
                print(f"Error calling OpenRouter API: {e}")
                return self._get_mock_chat_response(message)

    def _prepare_analysis_context(self, analysis_data: dict) -> str:
        """Convert analysis data into a readable context for the LLM"""
        context_parts = []
        
        if "data" in analysis_data:
            for website in analysis_data["data"]:
                context_parts.append(f"""
Website: {website.get('name', 'Unknown')}
- Global Rank: #{website.get('globalRank', 'N/A')}
- Monthly Visits: {website.get('totalVisits', 'N/A')}
- Bounce Rate: {website.get('bounceRate', 'N/A')}
- Avg Visit Duration: {website.get('avgVisitDuration', 'N/A')}
- Company: {website.get('companyName', 'N/A')} (Founded: {website.get('companyYearFounded', 'N/A')})

Traffic Sources:
{self._format_traffic_sources(website.get('trafficSources', {}))}

Top Technologies:
{self._format_technologies(website.get('builtwith_result', {}))}

Top Competitors:
{self._format_competitors(website.get('topSimilarityCompetitors', []))}
""")
        
        return "\n".join(context_parts)

    def _format_traffic_sources(self, traffic_sources: dict) -> str:
        if not traffic_sources:
            return "No traffic source data available"
        
        sources = []
        for key, value in traffic_sources.items():
            if isinstance(value, (int, float)) and value > 0:
                percentage = value * 100 if value <= 1 else value
                sources.append(f"- {key.replace('Share', '').replace('Visits', '').title()}: {percentage:.1f}%")
        
        return "\n".join(sources) if sources else "No traffic source data available"

    def _format_technologies(self, builtwith_result: dict) -> str:
        if not builtwith_result or 'technologies' not in builtwith_result:
            return "No technology data available"
        
        technologies = builtwith_result['technologies']
        if not technologies:
            return "No technologies found"
        
        tech_by_category = {}
        for tech in technologies[:10]:  # Limit to top 10
            category = tech.get('tag', 'Other')
            if category not in tech_by_category:
                tech_by_category[category] = []
            tech_by_category[category].append(tech.get('name', 'Unknown'))
        
        formatted = []
        for category, techs in tech_by_category.items():
            formatted.append(f"- {category}: {', '.join(techs)}")
        
        return "\n".join(formatted)

    def _format_competitors(self, competitors: list) -> str:
        if not competitors:
            return "No competitor data available"
        
        formatted = []
        for comp in competitors[:5]:  # Top 5 competitors
            visits = comp.get('visitsTotalCount', 0)
            visits_formatted = f"{visits/1000000:.0f}M" if visits > 1000000 else f"{visits/1000:.0f}K" if visits > 1000 else str(visits)
            affinity = comp.get('affinity', 0) * 100
            formatted.append(f"- {comp.get('domain', 'Unknown')}: {visits_formatted} visits, {affinity:.0f}% affinity")
        
        return "\n".join(formatted)

    def _generate_suggestions(self, user_message: str, assistant_response: str) -> List[str]:
        """Generate follow-up suggestions based on the conversation"""
        suggestions = [
            "How can I improve my website's traffic sources?",
            "What technologies should I consider implementing?",
            "How do I compare to my top competitors?",
            "What are the growth opportunities in my market?",
            "Can you analyze the user engagement metrics?",
        ]
        
        # Simple keyword-based suggestion customization
        message_lower = user_message.lower()
        
        if "traffic" in message_lower:
            suggestions = [
                "What are the best channels for traffic growth?",
                "How can I reduce my bounce rate?",
                "What countries should I target for expansion?",
                "How effective is my current SEO strategy?",
                "What social media opportunities exist?"
            ]
        elif "technology" in message_lower or "tech" in message_lower:
            suggestions = [
                "What modern frameworks should I adopt?",
                "How can I improve my website performance?",
                "What analytics tools do competitors use?",
                "Should I migrate to a different tech stack?",
                "What security technologies are missing?"
            ]
        elif "competitor" in message_lower:
            suggestions = [
                "Who are my biggest competitive threats?",
                "What do top competitors do differently?",
                "How can I differentiate from competitors?",
                "What market gaps can I exploit?",
                "Which competitor strategies should I adopt?"
            ]
        
        return suggestions[:3]  # Return top 3 suggestions

    def _get_mock_chat_response(self, message: str) -> ChatResponse:
        """Generate mock chat responses for testing"""
        mock_responses = {
            "traffic": "Based on the analysis, your website shows strong direct traffic (45%) which indicates good brand recognition. However, there's opportunity to improve organic search traffic (35%) through better SEO optimization. Consider focusing on content marketing and technical SEO improvements to capture more organic visitors.",
            "technology": "Your current tech stack shows you're using React and Node.js, which are excellent modern choices. I notice you're using an older version of some dependencies. Consider upgrading to the latest React 18.2.0 and implementing better caching with Redis to improve performance.",
            "competitor": "Compared to your main competitors, you're performing well in user engagement metrics. Your bounce rate of 35% is better than the industry average. However, competitors like Indeed.com have higher traffic volumes. Focus on content strategy and user acquisition to bridge this gap.",
            "default": "I can help you analyze various aspects of your website performance, technology stack, and competitive positioning. What specific area would you like to explore further?"
        }
        
        message_lower = message.lower()
        response_key = "default"
        
        for key in mock_responses:
            if key in message_lower:
                response_key = key
                break
        
        suggestions = [
            "How can I improve my conversion rate?",
            "What are the latest industry trends?",
            "Show me detailed competitor analysis"
        ]
        
        return ChatResponse(
            response=mock_responses[response_key],
            suggestions=suggestions
        )

@app.get("/")
async def root():
    return {
        "message": "BuiltWith Analyzer API",
        "endpoints": {
            "similarweb": "POST /api/analyze",
            "builtwith": "POST /api/analyze-tech-stack",
            "chat": "POST /api/chat"
        }
    }

@app.options("/api/analyze")
async def options_analyze():
    """Handle CORS preflight requests"""
    return {"message": "OK"}

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_websites(request: WebsiteAnalysisRequest):
    """Step 1: Analyze websites with SimilarWeb only"""
    logger.info(f"🔍 Starting website analysis for {len(request.websites)} websites")
    logger.info(f"   Websites: {request.websites}")
    logger.info(f"   User ID: {request.userId}")
    
    if not request.websites:
        logger.error("❌ No websites provided in request")
        raise HTTPException(status_code=400, detail="Please provide an array of websites to analyze")

    logger.info("📊 Starting SimilarWeb Analysis (Step 1)")
    print("📊 Starting SimilarWeb Analysis (Step 1)")
    print("=" * 50)

    # Check if API tokens are available
    apify_token = os.getenv("APIFY_API_TOKEN")
    
    logger.info(f"API Token Status - APIFY: {'✅' if apify_token else '❌'}")
    print(f"APIFY_API_TOKEN: {'✅' if apify_token else '❌'}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Environment file exists: {os.path.exists('.env')}")
    
    if not apify_token:
        logger.warning("📋 No Apify API token found, using mock data")
        print("📋 No Apify API token found, using mock data")
        # Return mock data WITHOUT BuiltWith analysis initially
        mock_data = get_mock_data()
        
        # Remove BuiltWith data for step-by-step process
        for item in mock_data:
            item.builtwith_result = None
        
        # Save to Supabase
        try:
            if supabase:
                data_to_insert = [item.model_dump() for item in mock_data]
                result = supabase.table("users").update({
                    "similarweb_result": json.dumps(data_to_insert)
                }).eq("id", request.userId).execute()
                print("✅ SimilarWeb data saved to Supabase successfully")
            else:
                print("⚠️ Supabase client not available, skipping database save")
        except Exception as e:
            print(f"❌ Error saving to Supabase: {e}")

        logger.info("✅ Step 1 (SimilarWeb) completed with mock data")
        print("✅ Step 1 (SimilarWeb) completed with mock data")
        return AnalysisResponse(
            success=True,
            data=mock_data,
            count=len(mock_data),
            note="Step 1 complete: SimilarWeb analysis ready. Click 'Analyze Tech Stack' to continue."
        )

    try:
        logger.info("🔄 Fetching data from Apify API...")
        print("🔄 Fetching data from Apify API...")
        # Get SimilarWeb data only
        apify_client = ApifyClient(apify_token)
        results = await apify_client.analyze_domains(request.websites)
        
        # Ensure no BuiltWith data is included yet
        for result in results:
            result.builtwith_result = None
        
        # Save to Supabase
        try:
            if supabase:
                data_to_insert = [item.model_dump() for item in results]
                result = supabase.table("users").update({
                    "similarweb_result": json.dumps(data_to_insert)
                }).eq("id", request.userId).execute()
                logger.info("✅ SimilarWeb data saved to Supabase successfully")
                print("✅ SimilarWeb data saved to Supabase successfully")
            else:
                logger.warning("⚠️ Supabase client not available, skipping database save")
                print("⚠️ Supabase client not available, skipping database save")
        except Exception as e:
            logger.error(f"❌ Error saving to Supabase: {e}")
            print(f"❌ Error saving to Supabase: {e}")

        logger.info("✅ Step 1 (SimilarWeb) completed successfully")
        print("✅ Step 1 (SimilarWeb) completed successfully")
        return AnalysisResponse(
            success=True,
            data=results,
            count=len(results),
            note="Step 1 complete: SimilarWeb analysis ready. Click 'Analyze Tech Stack' to continue."
        )

    except Exception as e:
        logger.error(f"❌ Error with Apify API: {str(e)}")
        print(f"❌ Error with Apify API: {str(e)}")
        logger.warning("📋 Falling back to mock data")
        print("📋 Falling back to mock data")
        # Fall back to mock data if API fails
        mock_data = get_mock_data()
        
        # Remove BuiltWith data for step-by-step process
        for item in mock_data:
            item.builtwith_result = None
        
        # Save to Supabase
        try:
            if supabase:
                data_to_insert = [item.model_dump() for item in mock_data]
                result = supabase.table("users").update({
                    "similarweb_result": json.dumps(data_to_insert)
                }).eq("id", request.userId).execute()
                logger.info("✅ SimilarWeb data saved to Supabase successfully")
                print("✅ SimilarWeb data saved to Supabase successfully")
            else:
                logger.warning("⚠️ Supabase client not available, skipping database save")
                print("⚠️ Supabase client not available, skipping database save")
        except Exception as e:
            logger.error(f"❌ Error saving to Supabase: {e}")
            print(f"❌ Error saving to Supabase: {e}")
            
        logger.info("✅ Step 1 (SimilarWeb) completed with fallback data")
        print("✅ Step 1 (SimilarWeb) completed with fallback data")
        return AnalysisResponse(
            success=True,
            data=mock_data,
            count=len(mock_data),
            note=f"Step 1 complete (with fallback): SimilarWeb analysis ready. API Error: {str(e)}"
        )

@app.post("/api/analyze-tech-stack", response_model=AnalysisResponse)
async def analyze_tech_stack(request: WebsiteAnalysisRequest):
    """Step 2: Add BuiltWith technology analysis to existing SimilarWeb data"""
    logger.info(f"🔧 Starting tech stack analysis for {len(request.websites)} websites")
    logger.info(f"   Websites: {request.websites}")
    logger.info(f"   User ID: {request.userId}")
    
    if not request.websites:
        logger.error("❌ No websites provided in request")
        raise HTTPException(status_code=400, detail="Please provide an array of websites to analyze")

    logger.info("🔧 Starting BuiltWith Tech Stack Analysis (Step 2)")
    print("🔧 Starting BuiltWith Tech Stack Analysis (Step 2)")
    print("=" * 60)
    
    # Check BuiltWith API key
    builtwith_key = os.getenv("BUILTWITH_API_KEY")
    print(f"BUILTWITH_API_KEY: {'✅' if builtwith_key else '❌'}")
    
    # Initialize BuiltWith client with enhanced logging
    builtwith_client = BuiltWithClient(builtwith_key)
    
    try:
        # Try to get existing data from Supabase first
        existing_data = None
        if supabase:
            try:
                print("📊 Retrieving existing SimilarWeb data from Supabase...")
                result = supabase.table("users").select("similarweb_result").eq("id", request.userId).execute()
                if result.data and len(result.data) > 0 and result.data[0]["similarweb_result"]:
                    existing_data = json.loads(result.data[0]["similarweb_result"])
                    print(f"✅ Found existing data for {len(existing_data)} websites")
                else:
                    print("⚠️ No existing SimilarWeb data found in Supabase")
            except Exception as e:
                print(f"❌ Error retrieving existing data: {e}")
        
        # If no existing data, use mock data or get fresh data
        if not existing_data:
            print("📋 Using mock data as base for BuiltWith analysis...")
            mock_data = get_mock_data()
            # Remove existing BuiltWith data
            for item in mock_data:
                item.builtwith_result = None
            results = mock_data
        else:
            # Convert existing data back to ApifyResult objects
            print("🔄 Converting existing SimilarWeb data to objects...")
            results = []
            for item_data in existing_data:
                try:
                    # Remove existing BuiltWith data if any
                    item_data.pop('builtwith_result', None)
                    result = ApifyResult(**item_data)
                    results.append(result)
                except Exception as e:
                    print(f"❌ Error converting data item: {e}")
                    continue
        
        print(f"🎯 Starting BuiltWith analysis for {len(results)} websites...")
        print("-" * 60)
        
        # Add BuiltWith analysis for each domain
        for i, website_result in enumerate(results):
            # Extract domain from website name or use the provided URL
            if i < len(request.websites):
                website_url = request.websites[i]
            else:
                # Fallback: construct domain from website name
                website_url = website_result.name.lower().replace(" ", "") + ".com"
            
            print(f"\n🔍 Step 2.{i+1}: Analyzing {website_url}")
            print(f"   Website: {website_result.name}")
            print(f"   Global Rank: #{website_result.globalRank}")
            
            try:
                builtwith_result = await builtwith_client.analyze_domain(website_url)
                results[i].builtwith_result = builtwith_result
                
                tech_count = len(builtwith_result.technologies) if builtwith_result.technologies else 0
                print(f"   ✅ BuiltWith analysis complete: {tech_count} technologies found")
                
                if tech_count > 0:
                    # Show first few technologies as preview
                    preview_techs = builtwith_result.technologies[:3]
                    tech_preview = ", ".join([f"{t.name}" for t in preview_techs])
                    print(f"   📋 Preview: {tech_preview}{'...' if tech_count > 3 else ''}")
                
            except Exception as e:
                print(f"   ❌ Error analyzing {website_url}: {e}")
                # Set empty BuiltWith result on error
                results[i].builtwith_result = BuiltWithResult(domain=website_url, technologies=[])
        
        print("\n" + "=" * 60)
        print("💾 Saving enhanced data (SimilarWeb + BuiltWith) to Supabase...")
        
        # Save enhanced data to Supabase
        try:
            if supabase:
                data_to_insert = [item.model_dump() for item in results]
                result = supabase.table("users").update({
                    "similarweb_result": json.dumps(data_to_insert)
                }).eq("id", request.userId).execute()
                print("✅ Enhanced data saved to Supabase successfully")
            else:
                print("⚠️ Supabase client not available, skipping database save")
        except Exception as e:
            print(f"❌ Error saving enhanced data to Supabase: {e}")

        # Calculate summary statistics
        total_technologies = sum(
            len(item.builtwith_result.technologies) if item.builtwith_result else 0 
            for item in results
        )
        
        print(f"🎉 Step 2 Complete!")
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
        print(f"\n❌ Error in BuiltWith analysis: {str(e)}")
        print("🔄 Falling back to mock BuiltWith data...")
        
        # Fallback: use mock data with BuiltWith analysis
        mock_data = get_mock_data()
        
        # Save fallback data to Supabase
        try:
            if supabase:
                data_to_insert = [item.model_dump() for item in mock_data]
                result = supabase.table("users").update({
                    "similarweb_result": json.dumps(data_to_insert)
                }).eq("id", request.userId).execute()
                print("✅ Fallback data saved to Supabase successfully")
        except Exception as save_error:
            print(f"❌ Error saving fallback data: {save_error}")
            
        return AnalysisResponse(
            success=True,
            data=mock_data,
            count=len(mock_data),
            note=f"Step 2 complete (with fallback): BuiltWith analysis added. Error: {str(e)}"
        )

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_analysis(request: ChatMessage):
    """Chat endpoint with analysis data context"""
    logger.info(f"💬 Received chat message: {request.message}")
    logger.info(f"   Analysis data size: {len(str(request.analysis_data))} characters")
    print(f"💬 Received chat message: {request.message}")
    
    # Check OpenRouter API key
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    logger.info(f"API Token Status - OPENROUTER: {'✅' if openrouter_key else '❌'}")
    print(f"OPENROUTER_API_KEY: {'✅' if openrouter_key else '❌'}")
    
    # Initialize OpenRouter client
    openrouter_client = OpenRouterClient(openrouter_key)
    
    try:
        response = await openrouter_client.chat_completion(request.message, request.analysis_data)
        logger.info(f"✅ Chat response generated successfully")
        print(f"✅ Chat response generated successfully")
        return response
    except Exception as e:
        logger.error(f"❌ Error in chat completion: {e}")
        print(f"❌ Error in chat completion: {e}")
        # Return a fallback response
        return ChatResponse(
            response="I'm having trouble processing your request right now. Please try again later or rephrase your question.",
            suggestions=[
                "What are the main traffic sources?",
                "How does the technology stack compare?",
                "What are the growth opportunities?"
            ]
        )

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "supabase": "✅" if supabase else "❌",
            "apify": "✅" if os.getenv("APIFY_API_TOKEN") else "❌",
            "builtwith": "✅" if os.getenv("BUILTWITH_API_KEY") else "❌",
            "openrouter": "✅" if os.getenv("OPENROUTER_API_KEY") else "❌"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
