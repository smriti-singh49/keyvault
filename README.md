# KeyVault

**KeyVault** is an API key management and usage platform for developers. It provides a centralized dashboard to create, manage, rotate, revoke and monitor API keys with configurable scopes, expiration, usage tracking and audit logs.

## Live Demo

| Resource | Link |
|---|---|
| Live Application | [KeyVault](https://keyvault-murex.vercel.app) |
| API Documentation | [FastAPI Swagger UI](https://keyvault-api-backend.onrender.com/docs) |
| GitHub Repository | [smriti-singh49/keyvault](https://github.com/smriti-singh49/keyvault) |

## Features

- **User Authentication:** Register and log in using username and password.
- **Session Management:** JWT-based authentication using HttpOnly cookies.
- **API Key Generation:** Create unique API keys with a `kv_live_` prefix.
- **Secure Key Storage:** Store API key hashes for verification and encrypted copies for authorized recovery.
- **Password-Confirmed Reveal:** Require password confirmation before revealing a stored API key.
- **Expiration Management:** Configure optional key expiration.
- **Scopes and Environments:** Associate keys with `read`, `write` and `delete` scopes and development or production environments.
- **Key Rotation and Revocation:** Rotate keys or revoke them to prevent further use.
- **API Key Authentication:** Authenticate requests using the `X-API-Key` HTTP header.
- **Usage Tracking:** Record API key requests and display usage information.
- **Rate Limiting:** Apply a fixed-window limit of five requests per minute to API-key-authenticated endpoints.
- **Audit Logs:** Record key creation, reveal attempts, rotation and revocation.
- **Dashboard:** View API keys, key statuses, usage statistics and recent security activity.
- **Landing and Documentation Pages:** Explore the platform and its functionality through the frontend.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI, Uvicorn |
| ORM | SQLAlchemy |
| Database | PostgreSQL, Supabase |
| Authentication | JWT, HttpOnly cookies |
| Password Hashing | `pwdlib` with Argon2 |
| Encryption | Fernet using `cryptography` |
| API Key Verification | SHA-256 hashing |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Database Hosting | Supabase |

## Architecture

KeyVault separates the frontend, backend and database into independently deployed components.

```mermaid
flowchart LR
    U[User / Browser] -->|HTTPS| F[React + Vite Frontend]
    F -->|API requests and session cookie| B[FastAPI Backend]
    C[External API Client] -->|X-API-Key Header| B
    B -->|SQLAlchemy| D[(PostgreSQL Database)]
    F --- V[Vercel]
    B --- R[Render]
    D --- S[Supabase]
```

**Request flow:**

1. Users interact with the React frontend hosted on Vercel.
2. The frontend communicates with the FastAPI backend hosted on Render.
3. Dashboard requests use session-cookie authentication.
4. External clients authenticate protected API requests using an API key.
5. The backend reads and writes application data in PostgreSQL hosted on Supabase.

## Project Structure

```text
keyvault/
├── backend/
│   ├── main.py          # FastAPI application and API endpoints
│   ├── models.py        # SQLAlchemy database models
│   ├── database.py      # Database engine and session configuration
│   └── security.py      # Security and encryption helpers
├── frontend/
│   ├── public/
│   │   └── Keyvault.png # Application logo
│   ├── src/
│   │   ├── main.jsx     # React entry point
│   │   ├── App.jsx      # Application pages and dashboard
│   │   └── index.css    # Application styling
│   └── package.json
├── requirements.txt
├── .gitignore
└── README.md
```

## Prerequisites

- Python 3.10 or newer
- Node.js and npm
- Git
- Access to a PostgreSQL database, either local or hosted

## Local Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/smriti-singh49/keyvault.git
cd keyvault
```

### 2. Set up the backend

Create and activate a Python virtual environment.

**Windows:**

```bash
python -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root, alongside `requirements.txt`.

Add the following variables using your own local database credentials and generated secrets:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
JWT_SECRET=replace-with-a-long-random-secret
ENCRYPTION_KEY=replace-with-a-generated-fernet-key
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

**Important:** These are placeholders, not working credentials. Never commit your real `.env` file to GitHub.

Generate a JWT secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Generate a Fernet encryption key:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Keep the generated encryption key safe. Changing it after API keys have been encrypted may prevent those stored keys from being decrypted.

### 4. Start the backend

From the project root, with the virtual environment activated, run:

```bash
uvicorn backend.main:app --reload
```

The backend will be available at:

- API: `http://localhost:8000`
- Interactive API documentation: `http://localhost:8000/docs`

### 5. Start the frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will typically be available at:

`http://localhost:5173`

**Local development note:** The frontend currently uses a hardcoded API base URL. For local development, configure it to point to `http://localhost:8000`. For the deployed website, it must point to the live Render backend. Check `frontend/src/App.jsx` before making this change.

## API Overview

Interactive API documentation is available at the [live Swagger UI](https://keyvault-api-backend.onrender.com/docs).

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user |
| `GET` | `/check-username` | Check username availability |
| `POST` | `/login` | Authenticate and set the session cookie |
| `POST` | `/logout` | Clear the session cookie |
| `GET` | `/me` | Retrieve the authenticated user |

### API Key Management

These endpoints use the authenticated dashboard session.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/keys` | Create an API key |
| `GET` | `/keys` | List the user's API keys |
| `GET` | `/keys/{key_id}` | Retrieve key metadata |
| `POST` | `/keys/{key_id}/reveal` | Reveal a key after password confirmation |
| `PATCH` | `/keys/{key_id}/rotate` | Rotate an API key |
| `PATCH` | `/keys/{key_id}/revoke` | Revoke an API key |
| `GET` | `/usage` | Retrieve recorded API usage |
| `GET` | `/audit-logs` | Retrieve audit events |

### API Key Authentication

External clients can authenticate using the `X-API-Key` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/test-api-key` | Validate an API key |
| `GET` | `/protected-read` | Validate an API key with the `read` scope |

Example request:

```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  https://keyvault-api-backend.onrender.com/test-api-key
```

Replace `YOUR_API_KEY` with your own valid key. Never commit real API keys to source control or include them in public screenshots.

Common responses include:

- `401 Unauthorized` — invalid, expired or revoked credentials.
- `403 Forbidden` — insufficient scope for an operation.
- `429 Too Many Requests` — the API key has exceeded its configured rate limit.

Refer to Swagger UI for the actual request schemas and response formats.

## Security Considerations

KeyVault implements several security mechanisms:

- Passwords are stored as hashes rather than plaintext.
- Session JWTs are issued through HttpOnly cookies.
- Production cookies use the `Secure` attribute and `SameSite=None` for cross-site requests.
- CORS is configured using the `FRONTEND_URL` environment variable.
- API key hashes are used for verification, while encrypted copies support authorized key recovery.
- Revealing a stored API key requires password confirmation.
- Key creation, reveal attempts, rotation and revocation are recorded in audit logs.
- User-specific queries are filtered by the authenticated user's ID.
- Sensitive configuration is loaded from environment variables.

**Security disclaimer:** KeyVault is a learning and portfolio project. It has not undergone a formal security audit and should not be considered production-grade or guaranteed secure.

## Deployment

| Component | Platform | Purpose |
|---|---|---|
| Frontend | Vercel | Hosts the React/Vite application |
| Backend | Render | Runs the FastAPI application |
| Database | Supabase | Hosts PostgreSQL |

The frontend communicates with the backend over HTTPS. The backend connects to Supabase using the `DATABASE_URL` environment variable.

Configure the backend's environment variables in Render, including `ENVIRONMENT=production` and `FRONTEND_URL` set to the deployed frontend origin.

Never expose database credentials, JWT secrets, encryption keys or other private configuration in frontend code.

## Known Limitations

The following limitations should be considered when extending the project:

- Only the `read` scope is currently enforced by the protected-read endpoint; `write` and `delete` scopes require further enforcement.
- The rate limiter uses a fixed window of five requests per minute and applies to API-key-authenticated endpoints.
- Login and key-reveal attempts do not currently have their own rate-limiting mechanism.
- API usage logging currently uses a fixed endpoint label for authenticated API-key requests.
- Database tables are created using SQLAlchemy's `create_all`; a database migration tool is not configured.
- The frontend API base URL is hardcoded rather than configured through a Vite environment variable.
- Automated tests and continuous integration need to be added.

## Future Improvements

Potential improvements include:

- Enforcing scopes across real protected resources.
- Recording the actual endpoint for each API request.
- Configurable rate limits and authentication throttling.
- Stronger backend input validation.
- Environment-based frontend API configuration.
- Database migrations using Alembic.
- Automated tests and continuous integration.
- Editable key metadata and expiration settings.
- Additional security testing and review.