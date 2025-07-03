"""
Middleware for the BuiltWith Analyzer API
"""

import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests and responses"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        try:
            # Log incoming request (without emojis to avoid encoding issues)
            logger.info(f"[INCOMING] {request.method} request to {request.url.path}")
            logger.info(f"   Client: {request.client.host if request.client else 'unknown'}")
            logger.info(f"   Headers: {dict(request.headers)}")
            
            # Call the actual endpoint
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response
            logger.info(f"[RESPONSE] {request.method} {request.url.path}")
            logger.info(f"   Status: {response.status_code}")
            logger.info(f"   Processing time: {process_time:.3f}s")
            
            # Add processing time to response headers
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(f"[ERROR] Error in middleware: {e}")
            logger.error(f"   Processing time: {process_time:.3f}s")
            raise
