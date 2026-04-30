from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.models import IPRecord
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
    - recent_ips: Last 10 IPs looked up
    """
    stats = await get_stats(db)
    
    # Get recent IPs
    stmt = select(IPRecord).order_by(desc(IPRecord.last_updated)).limit(10)
    result = await db.execute(stmt)
    recent_ips = result.scalars().all()
    
    stats["recent_ips"] = [
        {
            "id": ip.id,
            "ip": ip.ip,
            "country": ip.country,
            "asn": ip.asn,
            "abuse_score": ip.abuse_score,
            "vt_score": ip.vt_score,
            "ipqs_score": ip.ipqs_score,
            "tags": ip.tags,
            "sources_seen": ip.sources_seen,
            "last_updated": ip.last_updated.isoformat(),
        }
        for ip in recent_ips
    ]
    
    return stats
