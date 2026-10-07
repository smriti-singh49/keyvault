from fastapi import FastAPI, HTTPException, Depends, Response, Request
from pydantic import BaseModel
import secrets
import hashlib
from backend.database import engine, Base, SessionLocal
from backend.models import APIKey, User, APIKeyUsage, APIKeyRateLimit, APIKeyScope, AuditLog
from pwdlib import PasswordHash
import os
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta, timezone
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from backend.security import encrypt_api_key, decrypt_api_key

ALLOWED_SCOPES = {"read", "write", "delete"}


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


api_key_security = APIKeyHeader(name="X-API-Key")

def get_current_user(request: Request):
    token = request.cookies.get("access_token")

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

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


def get_current_api_key(
    api_key: str = Depends(api_key_security)
):
    hashed_key = hashlib.sha256(
        api_key.encode()
    ).hexdigest()

    db = SessionLocal()

    key = db.query(APIKey).filter(
        APIKey.key_hash == hashed_key
    ).first()

    if key is None:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )

    if key.status != "active":
        db.close()
        raise HTTPException(
            status_code=401,
            detail="API key is inactive"
        )

    if key.expires_at is not None and key.expires_at <= datetime.now(timezone.utc):
        db.close()
        raise HTTPException(
            status_code=401,
            detail="API key expired"
        )

    rate_limit = db.query(APIKeyRateLimit).filter(
        APIKeyRateLimit.api_key_id == key.id
    ).first()

    now = datetime.now(timezone.utc)

    if rate_limit is None:
        rate_limit = APIKeyRateLimit(
            api_key_id=key.id,
            window_start=now,
            request_count=1
        )
        db.add(rate_limit)

    else:
        elapsed = now - rate_limit.window_start

        if elapsed >= timedelta(minutes=1):
            rate_limit.window_start = now
            rate_limit.request_count = 1

        elif rate_limit.request_count >= 5:
            db.close()
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded"
            )

        else:
            rate_limit.request_count += 1

    usage = APIKeyUsage(
        api_key_id=key.id,
        endpoint="/test-api-key"
    )

    db.add(usage)
    db.commit()

    db.refresh(key)
    db.expunge(key)
    db.close()

    return key


def require_scope(required_scope: str):
    def scope_checker(
        current_api_key: APIKey = Depends(get_current_api_key)
    ):
        db = SessionLocal()

        scope = db.query(APIKeyScope).filter(
            APIKeyScope.api_key_id == current_api_key.id,
            APIKeyScope.scope == required_scope
        ).first()

        db.close()

        if scope is None:
            raise HTTPException(
                status_code=403,
                detail="Insufficient scope"
            )

        return current_api_key

    return scope_checker


@app.get("/protected-read")
def protected_read(
    current_api_key: APIKey = Depends(require_scope("read"))
):
    return {
        "message": "You have read access",
        "key_id": current_api_key.id
    }


class KeyCreate(BaseModel):
    name: str
    environment: str
    expires_in_days: int | None = None
    scopes: list[str] = []

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class RevealKeyRequest(BaseModel):
    password: str

class APIKeyResponse(BaseModel):
    id: int
    name: str
    environment: str
    status: str
    expires_at: datetime | None
    scopes: list[str]

class AuditLogResponse(BaseModel):
    id: int
    api_key_id: int | None
    action: str
    details: str | None
    created_at: datetime

class UsageResponse(BaseModel):
    id: int
    api_key_id: int
    endpoint: str | None
    used_at: datetime

def create_audit_log(
    db,
    user_id: int,
    action: str,
    api_key_id: int | None = None,
    details: str | None = None
):
    audit_log = AuditLog(
        user_id=user_id,
        api_key_id=api_key_id,
        action=action,
        details=details
    )

    db.add(audit_log)


@app.get("/")
def home():
    return {"message": "Welcome to KeyVault"}


@app.get("/keys", response_model=list[APIKeyResponse])
def get_keys(current_user_id: int = Depends(get_current_user)):
    db = SessionLocal()

    keys = db.query(APIKey).filter(
        APIKey.user_id == current_user_id
    ).all()

    result = []

    for key in keys:
        scopes = db.query(APIKeyScope).filter(
            APIKeyScope.api_key_id == key.id
        ).all()

        result.append(
            APIKeyResponse(
                id=key.id,
                name=key.name,
                environment=key.environment,
                status=key.status,
                expires_at=key.expires_at,
                scopes=[scope.scope for scope in scopes]
            )
        )

    db.close()

    return result


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

    if key is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Key not found"
        )

    scopes = db.query(APIKeyScope).filter(
        APIKeyScope.api_key_id == key.id
    ).all()

    result = APIKeyResponse(
        id=key.id,
        name=key.name,
        environment=key.environment,
        status=key.status,
        expires_at=key.expires_at,
        scopes=[scope.scope for scope in scopes]
    )

    db.close()

    return result


@app.post("/keys/{key_id}/reveal")
def reveal_api_key(
    key_id: int,
    data: RevealKeyRequest,
    current_user_id: int = Depends(get_current_user)
):
    db = SessionLocal()

    key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user_id
    ).first()

    if key is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Key not found"
        )

    if key.encrypted_key is None:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="This API key cannot be revealed. Rotate it first."
        )

    user = db.query(User).filter(
        User.id == current_user_id
    ).first()

    if user is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    password_valid = password_hash.verify(
        data.password,
        user.password_hash
    )

    if not password_valid:
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action="REVEAL_FAILED",
            api_key_id=key.id,
            details=f"Failed reveal attempt for API key: {key.name}"
        )

        db.commit()
        db.close()

        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )

    raw_api_key = decrypt_api_key(key.encrypted_key)

    create_audit_log(
        db=db,
        user_id=current_user_id,
        action="REVEAL",
        api_key_id=key.id,
        details=f"Revealed API key: {key.name}"
    )

    db.commit()
    db.close()

    return {
        "api_key": raw_api_key
    }


@app.get("/audit-logs", response_model=list[AuditLogResponse])
def get_audit_logs(
    current_user_id: int = Depends(get_current_user)
):
    db = SessionLocal()

    logs = db.query(AuditLog).filter(
        AuditLog.user_id == current_user_id
    ).order_by(
        AuditLog.created_at.desc()
    ).all()

    result = []

    for log in logs:
        result.append(
            AuditLogResponse(
                id=log.id,
                api_key_id=log.api_key_id,
                action=log.action,
                details=log.details,
                created_at=log.created_at
            )
        )

    db.close()

    return result


@app.get("/usage", response_model=list[UsageResponse])
def get_usage(
    current_user_id: int = Depends(get_current_user)
):
    db = SessionLocal()

    user_keys = db.query(APIKey).filter(
        APIKey.user_id == current_user_id
    ).all()

    user_key_ids = [key.id for key in user_keys]

    usage_logs = db.query(APIKeyUsage).filter(
        APIKeyUsage.api_key_id.in_(user_key_ids)
    ).order_by(
        APIKeyUsage.used_at.desc()
    ).all()

    result = []

    for usage in usage_logs:
        result.append(
            UsageResponse(
                id=usage.id,
                api_key_id=usage.api_key_id,
                endpoint=usage.endpoint,
                used_at=usage.used_at
            )
        )

    db.close()

    return result


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

    create_audit_log(
        db=db,
        user_id=current_user_id,
        action="REVOKE",
        api_key_id=key.id,
        details=f"Revoked API key: {key.name}"
    )

    db.commit()
    db.refresh(key)
    db.close()

    return {
        "message": "API key revoked",
        "key_id": key.id,
        "status": key.status
    }


@app.patch("/keys/{key_id}/rotate")
def rotate_key(
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
        raise HTTPException(
            status_code=404,
            detail="Key not found"
        )

    new_api_key = "kv_live_" + secrets.token_urlsafe(32)

    new_hashed_key = hashlib.sha256(
        new_api_key.encode()
    ).hexdigest()

    key.key_hash = new_hashed_key

    new_encrypted_key = encrypt_api_key(new_api_key)
    key.encrypted_key = new_encrypted_key

    create_audit_log(
        db=db,
        user_id=current_user_id,
        action="ROTATE",
        api_key_id=key.id,
        details=f"Rotated API key: {key.name}"
    )

    db.commit()
    db.refresh(key)
    db.close()

    return {
        "message": "API key rotated successfully",
        "api_key": new_api_key,
        "key_id": key.id
    }


@app.post("/keys")
def create_key(
    key: KeyCreate,
    current_user_id: int = Depends(get_current_user)
):
    for scope in key.scopes:
        if scope not in ALLOWED_SCOPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid scope: {scope}"
            )

    db = SessionLocal()

    api_key = "kv_live_" + secrets.token_urlsafe(32)

    hashed_key = hashlib.sha256(api_key.encode()).hexdigest()

    encrypted_key = encrypt_api_key(api_key)

    expires_at = None

    if key.expires_in_days is not None:
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=key.expires_in_days
        )

    new_key = APIKey(
        name=key.name,
        environment=key.environment,
        key_hash=hashed_key,
        encrypted_key=encrypted_key,
        user_id=current_user_id,
        expires_at=expires_at
    )

    db.add(new_key)
    db.commit()
    db.refresh(new_key)

    for scope in key.scopes:
        db.add(
            APIKeyScope(
                api_key_id=new_key.id,
                scope=scope
            )
        )

    create_audit_log(
        db=db,
        user_id=current_user_id,
        action="CREATE",
        api_key_id=new_key.id,
        details=f"Created API key: {new_key.name}"
    )

    db.commit()

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
def login_user(
    user: UserLogin,
    response: Response
):

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

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=1800
    )

    db.close()

    return {
        "message": "Login successful"
    }



@app.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token"
    )

    return {
        "message": "Logout successful"
    }


@app.get("/me")
def get_me(
    current_user_id: int = Depends(get_current_user)
):
    return {
        "authenticated": True,
        "user_id": current_user_id
    }


@app.get("/test-api-key")
def test_api_key(
    current_api_key: APIKey = Depends(get_current_api_key)
):
    return {
        "message": "API key is valid",
        "key_id": current_api_key.id
    }