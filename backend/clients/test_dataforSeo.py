from fastapi import FastAPI, Query
from pydantic import BaseModel
import requests
import base64

app = FastAPI()

# Replace these with your actual DataForSEO API credentials
DATAFORSEO_LOGIN = "mohammed@skylightad.com"
DATAFORSEO_PASSWORD = "4b463a5249535fb1"

# Create basic authentication
auth = base64.b64encode(f"{DATAFORSEO_LOGIN}:{DATAFORSEO_PASSWORD}".encode()).decode()

# Endpoint 1: Domain Technologies
@app.get("/domain_technologies")
def get_domain_technologies(target: str = Query(..., description="The domain to analyze")):
    """
    Retrieves the technologies used by the specified domain using DataForSEO Domain Analytics API.
    """
    url = "https://api.dataforseo.com/v3/domain_analytics/technologies/domain_technologies/live"
    headers = {
        "Authorization": f"Basic {auth}",
        "Content-Type": "application/json"
    }
    data = [
        {
            "target": target
        }
    ]
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to retrieve data", "status_code": response.status_code}

# Define Pydantic model for Keyword Search Volume request
class KeywordRequest(BaseModel):
    keywords: list[str]
    language_code: str
    location: str

# Endpoint 2: Keyword Search Volume
@app.post("/keyword_search_volume")
def get_keyword_search_volume(request: KeywordRequest):
    """
    Retrieves search volume data for the specified keywords using DataForSEO Keywords Data API.
    """
    url = "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live"
    headers = {
        "Authorization": f"Basic {auth}",
        "Content-Type": "application/json"
    }
    data = [
        {
            "keywords": request.keywords,
            "language_code": request.language_code,
            "location": request.location
        }
    ]
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to retrieve data", "status_code": response.status_code}

# Run the FastAPI application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)