from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str
    
    # Redis
    redis_url: str
    
    # API Keys
    abuseipdb_key: str
    virustotal_key: str
    shodan_key: str
    ipqs_key: str
    
    # App Config
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
