import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "triconnect API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    # Hackathon switch: only student credentials receive JWTs while enabled.
    # Set DEMO_MODE=false to re-enable standard multi-role authentication.
    DEMO_MODE: bool = True

    # Security
    SECRET_KEY: str = Field(default="supersecretkeythatsshouldbechangedinproduction12345")
    JWT_SECRET: str = Field(default="anotherjwtsecretkeyforauthsigningshouldbechanged67890")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = Field(default="postgresql://postgres:postgres@localhost:5432/triconnect")

    # File uploads
    UPLOAD_DIRECTORY: str = "uploads"

    # AI integrations
    OPENAI_API_KEY: str = "sk-placeholderopenaiapikeyformocking"

    # Email config
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USERNAME: str = ""
    EMAIL_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@triconnect.com"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # CORS Origins (default allow all for Next.js dashboard connection ease)
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
