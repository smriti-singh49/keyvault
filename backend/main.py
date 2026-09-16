from fastapi import FastAPI, HTTPException
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

class APIKeyResponse(BaseModel):
    id: int
    name: str
    environment: str
    status: str

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


@app.get("/keys", response_model=list[APIKeyResponse])
def get_keys():
    db = SessionLocal()

    keys = db.query(APIKey).all()

    db.close()

    return keys


@app.get("/keys/{key_id}", response_model=APIKeyResponse)
def get_key(key_id: int):

    db = SessionLocal()

    key = db.query(APIKey).filter(APIKey.id == key_id).first()

    db.close()

    if key is None:
        raise HTTPException(status_code=404, detail="Key not found")

    return key


@app.patch("/keys/{key_id}/revoke")
def revoke_key(key_id: int):

    db = SessionLocal()

    key = db.query(APIKey).filter(APIKey.id == key_id).first()

    if key is None:
        db.close()
        raise HTTPException(status_code=404, detail="Key not found")

    key.status = "revoked"

    db.commit()
    db.refresh(key)

    db.close()

    return {
        "message": "API key revoked",
        "key_id": key.id,
        "status": key.status
    }


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