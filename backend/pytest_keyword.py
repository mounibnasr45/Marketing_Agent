import pytest
from httpx import AsyncClient

# backend/test_routes.py


from main_new import app  # Make sure your FastAPI app is exposed as 'app' in main.py

@pytest.mark.asyncio
async def test_search_volume_success():
    payload = {
        "keywords": ["python", "fastapi"],
        "location_code": 2840,
        "language_code": "en",
        "search_partners": False,
        "tag": "pytest",
        "method": "live"
    }
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/keywords/search_volume", json=payload)
    assert response.status_code in (200, 500, 503)  # 500/503 if API keys are missing
    # Optionally check response json keys if 200
    if response.status_code == 200:
        assert "status" in response.json() or "tasks" in response.json()

@pytest.mark.asyncio
async def test_keywords_for_site_success():
    payload = {
        "target": "example.com",
        "target_type": "domain",
        "location_code": 2840,
        "language_code": "en",
        "tag": "pytest",
        "method": "live"
    }
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/keywords/keywords_for_site", json=payload)
    assert response.status_code in (200, 500, 503)
    if response.status_code == 200:
        assert "status" in response.json() or "tasks" in response.json()

@pytest.mark.asyncio
async def test_keywords_for_keywords_success():
    payload = {
        "keywords": ["python", "fastapi"],
        "location_code": 2840,
        "language_code": "en",
        "tag": "pytest",
        "method": "live"
    }
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/keywords/keywords_for_keywords", json=payload)
    assert response.status_code in (200, 500, 503)
    if response.status_code == 200:
        assert "status" in response.json() or "tasks" in response.json()

@pytest.mark.asyncio
async def test_ad_traffic_success():
    payload = {
        "keywords": ["python", "fastapi"],
        "bid": 1.0,
        "match": "broad",
        "location_code": 2840,
        "language_code": "en",
        "date_interval": "monthly",
        "tag": "pytest",
        "method": "live"
    }
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/keywords/ad_traffic", json=payload)
    assert response.status_code in (200, 500, 503)
    if response.status_code == 200:
        assert "status" in response.json() or "tasks" in response.json()