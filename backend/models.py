from sqlalchemy import Column, Integer, String, DateTime
from backend.database import Base
from datetime import datetime, timezone


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    environment = Column(String)
    key_hash = Column(String)
    encrypted_key = Column(String, nullable=True)
    status = Column(String, default="active")
    user_id = Column(Integer)
    expires_at = Column(DateTime(timezone=True), nullable=True)


class APIKeyScope(Base):
    __tablename__ = "api_key_scopes"

    id = Column(Integer, primary_key=True, index=True)
    api_key_id = Column(Integer, nullable=False)
    scope = Column(String, nullable=False)


class APIKeyUsage(Base):
    __tablename__ = "api_key_usage"

    id = Column(Integer, primary_key=True, index=True)
    api_key_id = Column(Integer, nullable=False)
    used_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    endpoint = Column(String)


class APIKeyRateLimit(Base):
    __tablename__ = "api_key_rate_limits"

    id = Column(Integer, primary_key=True, index=True)
    api_key_id = Column(Integer, unique=True, nullable=False)
    window_start = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    request_count = Column(Integer, default=0)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    api_key_id = Column(Integer, nullable=True)
    action = Column(String, nullable=False)
    details = Column(String, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)