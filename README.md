# PodcastMaker

AI-powered podcast generation platform. Give it a topic, get a full podcast episode with natural-sounding AI voices.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| **Backend** | Python 3.12+, FastAPI, SQLAlchemy (async), Alembic |
| **Database** | PostgreSQL 16 |
| **LLM** | Groq API (Llama 3.3 70B) |
| **TTS** | Coqui XTTS v2 |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **Tooling** | uv (Python), ruff (linting) |

## Prerequisites

- **Python 3.12+** — [python.org](https://python.org) or install via `uv python install 3.12`
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **PostgreSQL 16** — [postgresql.org](https://postgresql.org) or Docker
- **uv** — `pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Groq API key** — [console.groq.com](https://console.groq.com)
- **XTTS server** (optional) — for audio generation

## Quick Start

### 1. Clone & enter the project

```bash
git clone <repo-url>
cd PodcastMaker-AI-Podcast-Generation-System
```

### 2. Database setup

```bash
# Connect to PostgreSQL and create the database
psql -U postgres
CREATE USER podcastmaker WITH PASSWORD 'your_password';
CREATE DATABASE podcastmaker OWNER podcastmaker;
\q
```

### 3. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example backend/.env
```

Edit `backend/.env`:

```env
# PostgreSQL — use YOUR postgres password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=podcastmaker
POSTGRES_PASSWORD=your_password
POSTGRES_DB=podcastmaker

# Groq — get your key from console.groq.com
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# JWT — generate a random string for production
JWT_SECRET_KEY=some-random-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# TTS (optional — only needed for audio generation)
XTTS_API_URL=http://localhost:5002
XTTS_MODEL=xtts_v2
```

### 4. Backend setup

```bash
cd backend

# Install Python dependencies
uv sync

# Run database migrations
uv run alembic upgrade head

# Start the API server
uv run python run.py
```

The API is now running at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 5. Frontend setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app is now running at `http://localhost:3000`.

### 6. Register & create your first podcast

1. Open `http://localhost:3000`
2. Click **Get Started** and create an account
3. Go to **Dashboard** → **New Podcast**
4. Enter a topic and click **Generate Podcast**

## Project Structure

```
PodcastMaker-AI-Podcast-Generation-System/
├── .env.example              # Env template
├── docker-compose.yml        # Postgres + Redis + XTTS
├── backend/
│   ├── pyproject.toml        # Python project config
│   ├── uv.lock               # Locked dependencies
│   ├── run.py                # Entry point
│   ├── alembic.ini           # DB migration config
│   ├── API_DOCUMENTATION.md  # Full API reference
│   ├── alembic/
│   │   └── env.py            # Migration runner
│   └── app/
│       ├── main.py           # FastAPI app
│       ├── core/
│       │   ├── settings.py   # Pydantic settings
│       │   ├── database.py   # Async SQLAlchemy
│       │   └── security.py   # JWT helpers
│       ├── models/
│       │   ├── user.py       # User, RefreshToken
│       │   └── podcast.py    # Podcast, Episode, Voice, Job
│       ├── schemas/
│       │   ├── user.py       # Auth request/response
│       │   └── podcast.py    # Podcast request/response
│       ├── routers/
│       │   ├── auth.py       # POST /auth/register, /login, /refresh
│       │   ├── podcasts.py   # CRUD + generation endpoints
│       │   └── health.py     # GET /health
│       └── services/
│           ├── auth/service.py    # Auth logic
│           ├── llm/service.py     # Groq API integration
│           ├── tts/service.py     # XTTS integration
│           └── podcast/service.py # Orchestration
└── frontend/
    ├── package.json
    ├── vite.config.js        # Vite + Tailwind + API proxy
    └── src/
        ├── main.jsx
        ├── App.jsx           # Router + layouts
        ├── index.css          # Tailwind config
        ├── lib/api.js         # API client (auto-refresh tokens)
        ├── contexts/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Header.jsx
        │   ├── Footer.jsx
        │   ├── AppLayout.jsx
        │   └── landing/
        │       ├── Hero.jsx
        │       ├── Features.jsx
        │       ├── HowItWorks.jsx
        │       ├── Pricing.jsx
        │       └── CTA.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── AboutPage.jsx
            ├── PricingPage.jsx
            ├── PrivacyPage.jsx
            ├── TermsPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx
            ├── NewPodcastPage.jsx
            └── PodcastDetailPage.jsx
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | No | Create account |
| `POST` | `/api/v1/auth/login` | No | Login, get tokens |
| `POST` | `/api/v1/auth/refresh` | No | Refresh access token |
| `POST` | `/api/v1/auth/logout` | No | Revoke refresh token |
| `GET` | `/api/v1/auth/me` | Yes | Get current user |
| `POST` | `/api/v1/podcasts` | Yes | Create podcast |
| `GET` | `/api/v1/podcasts` | Yes | List user's podcasts |
| `GET` | `/api/v1/podcasts/:id` | Yes | Get podcast detail |
| `PATCH` | `/api/v1/podcasts/:id` | Yes | Update podcast |
| `DELETE` | `/api/v1/podcasts/:id` | Yes | Delete podcast |
| `POST` | `/api/v1/podcasts/:id/voices` | Yes | Add voice |
| `POST` | `/api/v1/podcasts/:id/episodes` | Yes | Create episode |
| `POST` | `/api/v1/podcasts/generate/script` | Yes | Generate script (LLM) |
| `POST` | `/api/v1/podcasts/generate/audio` | Yes | Generate audio (TTS) |
| `POST` | `/api/v1/podcasts/generate/full` | Yes | Full pipeline |
| `GET` | `/api/v1/health` | No | Health check |
| `GET` | `/api/v1/health/tts` | No | TTS server check |

Full API docs: `http://localhost:8000/docs`

## Development

### Backend commands

```bash
cd backend

# Run server with auto-reload
uv run uvicorn app.main:app --reload --port 8000

# Lint
uv run ruff check app/

# Format
uv run ruff format app/

# Generate migration after model changes
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head
```

### Frontend commands

```bash
cd frontend

# Dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Docker (Optional)

Start PostgreSQL and Redis with Docker:

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **XTTS** on port 5002 (for audio generation)

## License

MIT
