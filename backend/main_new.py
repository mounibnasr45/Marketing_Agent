"""
Main application file for the BuiltWith Analyzer API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import router
from middleware import LoggingMiddleware
from config import config

# Create FastAPI app
app = FastAPI(title="BuiltWith Analyzer API", version="1.0.0")

# Add CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://25.49.42.97:3000",  # Add the IP that's making requests
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add logging middleware after CORS
app.add_middleware(LoggingMiddleware)

# Include routes
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
