# clients/dataforseo_client.py

import os
import base64
import requests
from typing import List, Dict, Any, Optional
import logging

# It's a good practice to set up a logger
logger = logging.getLogger(__name__)

class DataForSEOClient:
    """
    A client for interacting with the DataForSEO Keywords Data API v3 for Google Ads.
    Handles authentication and provides methods for all core keyword features.
    """
    def __init__(self):
        """
        Initializes the client by fetching credentials from environment variables.
        """
        login = os.getenv("DATAFORSEO_LOGIN")
        pwd = os.getenv("DATAFORSEO_PASSWORD")

        if not login or not pwd:
            raise ValueError("FATAL: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables must be set.")

        auth = f"{login}:{pwd}".encode()
        self._token = base64.b64encode(auth).decode()
        self._base_url = "https://api.dataforseo.com/v3/keywords_data/google_ads"
        logger.info("DataForSEOClient initialized successfully.")

    def _request(self, method: str, url: str, payload: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        A generic, internal method to make authenticated requests to the DataForSEO API.
        """
        headers = {
            "Authorization": f"Basic {self._token}",
            "Content-Type": "application/json"
        }
        try:
            if method.upper() == 'POST':
                response = requests.post(url, headers=headers, json=payload)
            elif method.upper() == 'GET':
                response = requests.get(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API request to {url} failed: {e}")
            # Re-raise to be handled by the caller, attaching the response if available
            raise requests.exceptions.HTTPError(f"API request failed: {e}", response=e.response) from e

    def _post(self, path: str, payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Makes a POST request to a specified API path."""
        url = f"{self._base_url}/{path}"
        return self._request('POST', url, payload)

    def _get(self, path: str) -> Dict[str, Any]:
        """Makes a GET request to a specified API path."""
        url = f"{self._base_url}/{path}"
        return self._request('GET', url)

    # --- Live (Real-Time) Methods ---

    def search_volume_live(self, payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self._post("search_volume/live", payload)

    def keywords_for_site_live(self, payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self._post("keywords_for_site/live", payload)

    def keywords_for_keywords_live(self, payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self._post("keywords_for_keywords/live", payload)

    def ad_traffic_by_keywords_live(self, payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self._post("ad_traffic_by_keywords/live", payload)

    # --- Standard (Asynchronous) Methods ---

    def search_volume_post_task(self, payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self._post("search_volume/task_post", payload)

    def search_volume_get_tasks_ready(self) -> Dict[str, Any]:
        return self._get("search_volume/tasks_ready")

    def search_volume_get_task_results(self, task_id: str) -> Dict[str, Any]:
        return self._get(f"search_volume/task_get/{task_id}")

    def keywords_for_site_post_task(self, payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self._post("keywords_for_site/task_post", payload)

    def keywords_for_site_get_tasks_ready(self) -> Dict[str, Any]:
        return self._get("keywords_for_site/tasks_ready")

    def keywords_for_site_get_task_results(self, task_id: str) -> Dict[str, Any]:
        return self._get(f"keywords_for_site/task_get/{task_id}")

    def keywords_for_keywords_post_task(self, payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self._post("keywords_for_keywords/task_post", payload)

    def keywords_for_keywords_get_tasks_ready(self) -> Dict[str, Any]:
        return self._get("keywords_for_keywords/tasks_ready")

    def keywords_for_keywords_get_task_results(self, task_id: str) -> Dict[str, Any]:
        return self._get(f"keywords_for_keywords/task_get/{task_id}")

    def ad_traffic_by_keywords_post_task(self, payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self._post("ad_traffic_by_keywords/task_post", payload)

    def ad_traffic_by_keywords_get_tasks_ready(self) -> Dict[str, Any]:
        return self._get("ad_traffic_by_keywords/tasks_ready")

    def ad_traffic_by_keywords_get_task_results(self, task_id: str) -> Dict[str, Any]:
        return self._get(f"ad_traffic_by_keywords/task_get/{task_id}")