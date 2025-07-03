"""
Client for Apify API integration
"""

import asyncio
import httpx
from typing import List
from fastapi import HTTPException
from models import ApifyResult, Technology, BuiltWithResult


class ApifyClient:
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.actor_id = "heLi1j7hzjC2gFlIx"

    async def analyze_domains(self, websites: List[str]) -> List[ApifyResult]:
        async with httpx.AsyncClient() as client:
            try:
                # Start the actor run
                input_data = {
                    "websites": websites,
                    "maxPages": 1,
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

                if run_response.status_code != 201:
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
                    await asyncio.sleep(5)
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
                
                # Transform the results to match our model
                transformed_results = []
                for result in results:
                    try:
                        transformed_result = ApifyResult(**result)
                        transformed_results.append(transformed_result)
                    except Exception as transform_error:
                        print(f"Error transforming result: {transform_error}")
                        continue
                
                return transformed_results

            except httpx.TimeoutException:
                raise HTTPException(status_code=504, detail="Request timeout")
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
