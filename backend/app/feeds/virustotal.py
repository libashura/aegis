import httpx
from app.core.config import get_settings

settings = get_settings()


async def fetch(ip: str) -> dict:
    """
    Fetch IP reputation data from VirusTotal.
    
    Calculates score as (malicious / total_engines) * 100.
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {
                "x-apikey": settings.virustotal_key,
            }
            
            response = await client.get(
                f"https://www.virustotal.com/api/v3/ip_addresses/{ip}",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                attributes = data.get("data", {}).get("attributes", {})
                last_analysis = attributes.get("last_analysis_stats", {})
                
                malicious = last_analysis.get("malicious", 0)
                total_engines = sum(last_analysis.values())
                
                vt_score = (malicious / total_engines * 100) if total_engines > 0 else 0.0
                
                return {
                    "source": "virustotal",
                    "vt_score": vt_score,
                    "malicious_count": malicious,
                    "total_vendors": total_engines,
                    "country": attributes.get("country", None),
                    "asn": attributes.get("asn", None),
                }
            else:
                return {
                    "source": "virustotal",
                    "error": f"HTTP {response.status_code}",
                }
    except Exception as e:
        return {
            "source": "virustotal",
            "error": str(e),
        }
