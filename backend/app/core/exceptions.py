from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.logging import logger

class AppException(Exception):
    """Base exception class for applications errors."""
    def __init__(self, message: str, status_code: int = 400, errors: list = None):
        self.message = message
        self.status_code = status_code
        self.errors = errors or []
        super().__init__(self.message)

class AuthException(AppException):
    """Authentication specific exceptions."""
    def __init__(self, message: str, errors: list = None):
        super().__init__(message=message, status_code=401, errors=errors)

class NotFoundException(AppException):
    """Resource not found exceptions."""
    def __init__(self, message: str, errors: list = None):
        super().__init__(message=message, status_code=404, errors=errors)

class ForbiddenException(AppException):
    """Permission denied exceptions."""
    def __init__(self, message: str, errors: list = None):
        super().__init__(message=message, status_code=403, errors=errors)

def register_exception_handlers(app: FastAPI):
    """Register custom exception hooks to ensure consistent JSON formats."""
    
    @app.exception_handler(AppException)
    async def app_error_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.message,
                "errors": exc.errors
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        errors_list = []
        for error in exc.errors():
            loc = " -> ".join(str(x) for x in error.get("loc", []))
            errors_list.append({
                "field": loc,
                "type": error.get("type"),
                "msg": error.get("msg")
            })
            
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": "Request validation failed",
                "errors": errors_list
            }
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception caught on request {request.url}: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal Server Error",
                "errors": []
            }
        )
