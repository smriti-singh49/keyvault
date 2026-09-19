from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import secrets
import hashlib
from backend.database import engine, Base, SessionLocal
from backend.models import APIKey, User
from pwdlib import PasswordHash
import os
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta, timezone
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


app = FastAPI()

Base.metadata.create_all(bind=engine)

password_hash = PasswordHash.recommended()

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")

def create_access_token(user_id: int):

    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return token

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return int(user_id)

    except (jwt.InvalidTokenError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

class KeyCreate(BaseModel):
    name: str
    environment: str

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class APIKeyResponse(BaseModel):
    id: int
    name: str
    environment: str
    status: str


@app.get("/")
def home():
    return {"message": "Welcome to KeyVault"}


@app.get("/keys", response_model=list[APIKeyResponse])
def get_keys(current_user_id: int = Depends(get_current_user)):
    db = SessionLocal()

    keys = db.query(APIKey).filter(
        APIKey.user_id == current_user_id
    ).all()

    db.close()

    return keys


@app.get("/keys/{key_id}", response_model=APIKeyResponse)
def get_key(
    key_id: int,
    current_user_id: int = Depends(get_current_user)
):

    db = SessionLocal()

    key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user_id
    ).first()

    db.close()

    if key is None:
        raise HTTPException(status_code=404, detail="Key not found")

    return key


@app.patch("/keys/{key_id}/revoke")
def revoke_key(
    key_id: int,
    current_user_id: int = Depends(get_current_user)
):

    db = SessionLocal()

    key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user_id
    ).first()

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
def create_key(
    key: KeyCreate,
    current_user_id: int = Depends(get_current_user)
):

    db = SessionLocal()

    api_key = "kv_live_" + secrets.token_urlsafe(32)

    hashed_key = hashlib.sha256(api_key.encode()).hexdigest()

    new_key = APIKey(
        name=key.name,
        environment=key.environment,
        key_hash=hashed_key,
        user_id=current_user_id
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

@app.post("/register")
def register_user(user: UserCreate):

    db = SessionLocal()

    existing_user = db.query(User).filter(User.username == user.username).first()

    if existing_user:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    hashed_password = password_hash.hash(user.password)

    new_user = User(
        username=user.username,
        password_hash=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    db.close()

    return {
        "message": "User registered successfully",
        "username": new_user.username
    }


@app.post("/login")
def login_user(user: UserLogin):

    db = SessionLocal()

    db_user = db.query(User).filter(User.username == user.username).first()

    if db_user is None:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    password_valid = password_hash.verify(
        user.password,
        db_user.password_hash
    )

    if not password_valid:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    access_token = create_access_token(db_user.id)

    db.close()

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }