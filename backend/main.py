from fastapi import FastAPI
from pydantic import BaseModel
import secrets
import hashlib
from backend.database import engine, Base, SessionLocal
from backend.models import APIKey

app = FastAPI()

Base.metadata.create_all(bind=engine)

class KeyCreate(BaseModel):
    name: str
    environment: str

keys = [
    {
        "id": 1,
        "name": "News Service",
        "status": "active"
    },
    {
        "id": 2,
        "name": "Analytics Service",
        "status": "revoked"
    }
]


@app.get("/")
def home():
    return {"message": "Welcome to KeyVault"}


@app.get("/keys")
def get_keys():
    return {"keys": keys}


@app.get("/keys/{key_id}")
def get_key(key_id: int):
    for key in keys:
        if key["id"] == key_id:
            return key

    return {"message": "Key not found"}

@app.post("/keys")
def create_key(key: KeyCreate):

    db = SessionLocal()

    api_key = "kv_live_" + secrets.token_urlsafe(32)

    hashed_key = hashlib.sha256(api_key.encode()).hexdigest()

    new_key = APIKey(
        name=key.name,
        environment=key.environment,
        key_hash=hashed_key
    )

    db.add(new_key)
    db.commit()
    db.refresh(new_key)

    db.close()

    return {
        "message": "API key created",
        "name": key.name,
        "environment": key.environment,
        "api_key": api_key
    }