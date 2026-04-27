from sqlalchemy import Column, String, Integer, Float, JSON, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime


class IPRecord(Base):
    """IP reputation record."""
    
    __tablename__ = "ip_records"
    
    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String(45), unique=True, index=True, nullable=False)
    country = Column(String(100), nullable=True)
    asn = Column(String(50), nullable=True)
    abuse_score = Column(Float, default=0.0)
    vt_score = Column(Float, default=0.0)
    ipqs_score = Column(Float, default=0.0)
    shodan_data = Column(JSON, nullable=True)
    tags = Column(JSON, default=list)  # e.g., ["proxy", "vpn", "tor", "recent_abuse"]
    sources_seen = Column(Integer, default=0)  # Count of feeds that flagged this IP
    raw_data = Column(JSON, nullable=True)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
