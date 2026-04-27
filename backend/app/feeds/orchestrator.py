import asyncio
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.models import IPRecord
from app.feeds import abuseipdb, virustotal, ipqualityscore, shodan


async def lookup_ip(ip: str, db: AsyncSession) -> Dict[str, Any]:
    """
    Lookup IP reputation from all feeds.
    
    - Checks if IP exists in DB
    - Fetches all 4 feeds in parallel using asyncio.gather
    - Normalizes results into IPRecord schema
    - Builds tags list from IPQS data
    - Counts sources_seen
    - Upserts into PostgreSQL
    - Returns normalized dict
    """
    
    # Check if IP exists in DB
    stmt = select(IPRecord).where(IPRecord.ip == ip)
    result = await db.execute(stmt)
    existing_record = result.scalar_one_or_none()
    
    # Fetch all feeds in parallel
    feed_results = await asyncio.gather(
        abuseipdb.fetch(ip),
        virustotal.fetch(ip),
        ipqualityscore.fetch(ip),
        shodan.fetch(ip),
        return_exceptions=True
    )
    
    # Process results
    abuseipdb_data = feed_results[0] if isinstance(feed_results[0], dict) else {}
    vt_data = feed_results[1] if isinstance(feed_results[1], dict) else {}
    ipqs_data = feed_results[2] if isinstance(feed_results[2], dict) else {}
    shodan_data = feed_results[3] if isinstance(feed_results[3], dict) else {}
    
    # Normalize scores
    abuse_score = abuseipdb_data.get("abuse_score", 0.0) if "error" not in abuseipdb_data else 0.0
    vt_score = vt_data.get("vt_score", 0.0) if "error" not in vt_data else 0.0
    ipqs_score = ipqs_data.get("ipqs_score", 0.0) if "error" not in ipqs_data else 0.0
    
    # Build tags from IPQS data
    tags = ipqs_data.get("tags", []) if "error" not in ipqs_data else []
    
    # Count sources_seen (feeds that returned valid data)
    sources_seen = 0
    if "error" not in abuseipdb_data:
        sources_seen += 1
    if "error" not in vt_data:
        sources_seen += 1
    if "error" not in ipqs_data:
        sources_seen += 1
    if "error" not in shodan_data:
        sources_seen += 1
    
    # Extract country and ASN (prefer VirusTotal)
    country = vt_data.get("country") or ipqs_data.get("country")
    asn = vt_data.get("asn")
    
    # Prepare shodan data (exclude errors)
    shodan_output = {
        "ports": shodan_data.get("ports", []),
        "hostnames": shodan_data.get("hostnames", []),
        "os": shodan_data.get("os"),
        "vulns": shodan_data.get("vulns", []),
        "tags": shodan_data.get("tags", []),
    } if "error" not in shodan_data else {}
    
    # Raw data for reference
    raw_data = {
        "abuseipdb": abuseipdb_data,
        "virustotal": vt_data,
        "ipqualityscore": ipqs_data,
        "shodan": shodan_data,
    }
    
    # Upsert into database
    if existing_record:
        # Update existing record
        existing_record.abuse_score = abuse_score
        existing_record.vt_score = vt_score
        existing_record.ipqs_score = ipqs_score
        existing_record.shodan_data = shodan_output
        existing_record.tags = tags
        existing_record.sources_seen = sources_seen
        existing_record.country = country
        existing_record.asn = asn
        existing_record.raw_data = raw_data
        db.add(existing_record)
        record = existing_record
    else:
        # Create new record
        record = IPRecord(
            ip=ip,
            country=country,
            asn=asn,
            abuse_score=abuse_score,
            vt_score=vt_score,
            ipqs_score=ipqs_score,
            shodan_data=shodan_output,
            tags=tags,
            sources_seen=sources_seen,
            raw_data=raw_data,
        )
        db.add(record)
    
    await db.commit()
    await db.refresh(record)
    
    # Return normalized dict
    return {
        "id": record.id,
        "ip": record.ip,
        "country": record.country,
        "asn": record.asn,
        "abuse_score": record.abuse_score,
        "vt_score": record.vt_score,
        "ipqs_score": record.ipqs_score,
        "shodan_data": record.shodan_data,
        "tags": record.tags,
        "sources_seen": record.sources_seen,
        "first_seen": record.first_seen.isoformat(),
        "last_updated": record.last_updated.isoformat(),
    }


async def get_stats(db: AsyncSession) -> Dict[str, Any]:
    """
    Get dashboard statistics.
    
    Returns: total IPs tracked, high-risk count, top 10 countries.
    """
    
    # Total IPs tracked
    total_ips_stmt = select(func.count(IPRecord.id))
    total_ips_result = await db.execute(total_ips_stmt)
    total_ips = total_ips_result.scalar() or 0
    
    # High-risk IPs (abuse_score >= 50)
    high_risk_stmt = select(func.count(IPRecord.id)).where(IPRecord.abuse_score >= 50)
    high_risk_result = await db.execute(high_risk_stmt)
    high_risk_ips = high_risk_result.scalar() or 0
    
    # Top 10 countries by frequency
    countries_stmt = (
        select(IPRecord.country, func.count(IPRecord.id).label("count"))
        .where(IPRecord.country.isnot(None))
        .group_by(IPRecord.country)
        .order_by(func.count(IPRecord.id).desc())
        .limit(10)
    )
    countries_result = await db.execute(countries_stmt)
    top_countries = [
        {"country": row[0], "count": row[1]}
        for row in countries_result.fetchall()
    ]
    
    return {
        "total_ips": total_ips,
        "high_risk_ips": high_risk_ips,
        "top_countries": top_countries,
    }
