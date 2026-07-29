import time
from collections import defaultdict
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
from app.core.exceptions import AppException

class RateLimitingMiddleware(BaseHTTPMiddleware):
    """In-memory rate limiter preventing DDoS/brute-force endpoints scraping."""
    def __init__(self, app):
        super().__init__(app)
        self.request_timestamps = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clear timestamps older than 60 seconds
        self.request_timestamps[client_ip] = [
            t for t in self.request_timestamps[client_ip] if current_time - t < 60
        ]
        
        if len(self.request_timestamps[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
            return Response(
                content='{"success": false, "message": "Too many requests. Please try again later.", "errors": []}',
                status_code=429,
                media_type="application/json"
            )
            
        self.request_timestamps[client_ip].append(current_time)
        
        # Add basic security headers
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response
