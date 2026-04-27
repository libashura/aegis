import httpx
from app.core.config import get_settings

settings = get_settings()


async def fetch(ip: str) -> dict:
    """
    Fetch IP reputation data from AbuseIPDB.
    
    Returns a dict with abuse_score and additional info.
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {
                "Key": settings.abuseipdb_key,
                "Accept": "application/json",
            }
            params = {
                "ipAddress": ip,
                "maxAgeInDays": 90,
                "verbose": ""
            }
            
            response = await client.get(
                "https://api.abuseipdb.com/api/v2/check",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                ip_data = data.get("data", {})
                return {
                    "source": "abuseipdb",
                    "abuse_score": ip_data.get("abuseConfidenceScore", 0.0),
                    "total_reports": ip_data.get("totalReports", 0),
                    "is_whitelisted": ip_data.get("isWhitelisted", False),
                    "usage_type": ip_data.get("usageType", "Unknown"),
                }
            else:
                return {
                    "source": "abuseipdb",
                    "error": f"HTTP {response.status_code}",
                }
    except Exception as e:
        return {
            "source": "abuseipdb",
            "error": str(e),
        }
