import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishnaArjun Bakers Management Suite"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "krishnaarjun-bakers-super-secret-key-2026-sangola")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./krishnaarjun_bakers.db")
    
    # Bakery business settings
    BAKERY_NAME: str = "KrishnaArjun Bakers"
    BAKERY_TAGLINE: str = "Chakote Brand Dealer"
    BAKERY_LOCATION: str = "Sangola, Solapur, Maharashtra, India"
    BAKERY_PHONE: str = "+91 98765 43210"
    BAKERY_EMAIL: str = "contact@krishnaarjunbakers.com"
    
    # Order cutoff hours before delivery date (e.g. 4 hours)
    ORDER_CUTOFF_HOURS: int = 4
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
