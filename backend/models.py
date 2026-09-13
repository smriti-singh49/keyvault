from sqlalchemy import Column, Integer, String
from backend.database import Base


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    environment = Column(String)
    key_hash = Column(String)
    status = Column(String, default="active")