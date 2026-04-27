import httpx
from app.core.config import get_settings

settings = get_settings()


async def fetch(ip: str) -> dict:
    """
    Fetch IP reputation data from IPQualityScore.
    
    Returns reputation score and tags (proxy, vpn, tor, recent_abuse).
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            params = {
                "ip": ip,
                "key": settings.ipqs_key,
                "strictness": 1,
            }
            
            response = await client.get(
                "https://ipqualityscore.com/api/json/ip",
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract tag data
                tags = []
                if data.get("is_proxy"):
                    tags.append("proxy")
                if data.get("is_vpn"):
                    tags.append("vpn")
                if data.get("is_tor"):
                    tags.append("tor")
                if data.get("recent_abuse"):
                    tags.append("recent_abuse")
                
                return {
                    "source": "ipqs",
                    "ipqs_score": data.get("fraud_score", 0),
                    "tags": tags,
                    "is_proxy": data.get("is_proxy", False),
                    "is_vpn": data.get("is_vpn", False),
                    "is_tor": data.get("is_tor", False),
                    "country": data.get("country_code", None),
                }
            else:
                return {
                    "source": "ipqs",
                    "error": f"HTTP {response.status_code}",
                }
    except Exception as e:
        return {
            "source": "ipqs",
            "error": str(e),
        }
