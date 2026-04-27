from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.feeds.orchestrator import lookup_ip

router = APIRouter()


@router.get("/lookup/{ip}")
async def get_lookup(ip: str, db: AsyncSession = Depends(get_db)):
    """
    Lookup IP reputation from all threat intelligence feeds.
    
    Returns normalized results from AbuseIPDB, VirusTotal, IPQualityScore, and Shodan.
    """
    try:
        result = await lookup_ip(ip, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
