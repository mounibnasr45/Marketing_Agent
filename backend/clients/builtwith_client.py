"""
Client for BuiltWith API integration
"""

import httpx
from typing import Optional, List
from models import BuiltWithResult, Technology


class BuiltWithClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.builtwith.com/v20/api.json"

    async def analyze_domain(self, domain: str) -> BuiltWithResult:
        if not self.api_key:
            return self._get_mock_builtwith_data(domain)
    
        print(f"   [API] Calling BuiltWith API...")
        url = f"https://api.builtwith.com/v20/api.json?KEY={self.api_key}&LOOKUP={domain}"
        print(f"   [URL] URL: {url}")
    
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
    
        print(f"   [STATUS] Response Status: {response.status_code}")
        print(f"   [SUCCESS] API response received")
        print(f"   [DATA] Response size: {len(response.text)} characters")
    
        try:
            return self._parse_builtwith_response(domain, data)
        except Exception as e:
            print(f"[ERROR] Error parsing BuiltWith data: {e}")
            return self._get_mock_builtwith_data(domain)

    def _parse_builtwith_response(self, domain: str, data: dict) -> BuiltWithResult:
        """Parse BuiltWith API response into our model"""
        technologies = []
        
        try:
            print(f"[PARSE] Parsing BuiltWith response for {domain}")
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
                                        if not isinstance(category, dict):
                                            continue
                                            
                                        for tech in category.get("Technologies", []):
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
            print(f"[WARNING] No technologies found for {domain}, using mock data fallback")
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
