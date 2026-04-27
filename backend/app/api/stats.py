from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.feeds.orchestrator import get_stats

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """
    Get dashboard statistics.
    
    Returns:
    - total_ips: Total number of IPs tracked
    - high_risk_ips: Count of IPs with abuse_score >= 50
    - top_countries: Top 10 countries by frequency
    """
    stats = await get_stats(db)
    return stats
