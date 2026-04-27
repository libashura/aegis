import httpx
from app.core.config import get_settings

settings = get_settings()


async def fetch(ip: str) -> dict:
    """
    Fetch IP data from Shodan.
    
    Returns ports, hostnames, OS, vulnerabilities, and tags.
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            params = {
                "key": settings.shodan_key,
                "minify": True,
            }
            
            response = await client.get(
                f"https://api.shodan.io/shodan/host/{ip}",
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    "source": "shodan",
                    "ports": data.get("ports", []),
                    "hostnames": data.get("hostnames", []),
                    "os": data.get("os", None),
                    "vulns": data.get("vulns", []),
                    "tags": data.get("tags", []),
                    "org": data.get("org", None),
                }
            elif response.status_code == 404:
                # IP not found in Shodan
                return {
                    "source": "shodan",
                    "ports": [],
                    "hostnames": [],
                    "os": None,
                    "vulns": [],
                    "tags": [],
                }
            else:
                return {
                    "source": "shodan",
                    "error": f"HTTP {response.status_code}",
                }
    except Exception as e:
        return {
            "source": "shodan",
            "error": str(e),
        }
