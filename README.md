# PodcastMaker

AI-powered podcast generation platform. Give it a topic, get a full podcast episode with natural-sounding AI voices.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| **Backend** | Python 3.12+, FastAPI, SQLAlchemy (async), Alembic |
| **Database** | PostgreSQL 16 |
| **LLM** | Groq API (Llama 3.3 70B) |
| **TTS** | Edge TTS (free), OpenAI TTS, ElevenLabs TTS |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **Tooling** | uv (Python), ruff (linting) |

## Prerequisites

- **Python 3.12+** — [python.org](https://python.org) or install via `uv python install 3.12`
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **PostgreSQL 16** — [postgresql.org](https://postgresql.org) or Docker
- **uv** — `pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Groq API key** — [console.groq.com](https://console.groq.com) (free tier available)

## Quick Start

### 1. Clone & enter the project

```bash
git clone https://github.com/SyabAhmad/PodcastMaker-AI-Podcast-Generation-System.git
cd PodcastMaker-AI-Podcast-Generation-System
```

### 2. Database setup

Connect to PostgreSQL and create the database:

```bash
psql -U postgres
CREATE USER podcastmaker WITH PASSWORD 'your_password';
CREATE DATABASE podcastmaker OWNER podcastmaker;
\q
```

### 3. Environment variables

Copy the example env and fill in your values:

```bash
cp .env.example backend/.env
```

Edit `backend/.env` — the minimum you need to set:

```env
# PostgreSQL — use YOUR postgres password
POSTGRES_PASSWORD=your_password

# Groq — get your key from console.groq.com
GROQ_API_KEY=gsk_your_key_here

# JWT — generate a random string
JWT_SECRET_KEY=any-random-string-here
```

Everything else has working defaults. Edge TTS is enabled by default (free, no API key needed).

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

API running at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 5. Frontend setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App running at `http://localhost:3000`.

### 6. Register & create your first podcast

1. Open `http://localhost:3000`
2. Click **Get Started** and create an account
3. Go to **Dashboard** → **New Podcast**
4. Enter a topic and click **Generate Podcast**
5. Once script is generated, click **Audio** to generate TTS
6. Click the episode to expand and see transcript + audio player

## TTS Providers

The app supports 3 TTS providers, configured via `.env`:

| Provider | Cost | Quality | Setup |
|----------|------|---------|-------|
| **Edge TTS** | Free | Good | No API key needed (default) |
| **OpenAI TTS** | ~$0.015/1K chars | Great | Requires `OPENAI_API_KEY` |
| **ElevenLabs** | Paid plans | Best | Requires `ELEVENLABS_API_KEY` |

### Configuring TTS

In `backend/.env`:

```env
# Set which provider to use
TTS_PROVIDER=edge

# Enable/disable providers (1 = on, 0 = off)
EDGE_TTS_ENABLED=1
OPENAI_TTS_ENABLED=0
ELEVENLABS_TTS_ENABLED=0

# OpenAI (if enabled)
OPENAI_API_KEY=sk-...
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=nova

# ElevenLabs (if enabled)
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Available voices (provider:voice_id:name, comma-separated)
AVAILABLE_VOICES=edge:en-US-GuyNeural:host,edge:en-US-JennyNeural:guest,edge:en-US-AriaNeural:narrator,edge:en-US-DavisNeural:deep,edge:en-US-SaraNeural:energetic,edge:en-GB-RyanNeural:british
```

Users can pick a voice from the dropdown when generating audio on each episode.

## Project Structure

```
PodcastMaker-AI-Podcast-Generation-System/
├── .env.example              # Env template (copy to backend/.env)
├── docker-compose.yml        # Postgres + Redis
├── backend/
│   ├── pyproject.toml        # Python project config
│   ├── uv.lock               # Locked dependencies
│   ├── run.py                # Entry point
│   ├── alembic.ini           # DB migration config
│   ├── API_DOCUMENTATION.md  # Full API reference
│   ├── alembic/
│   │   ├── env.py            # Migration runner
│   │   └── versions/         # Migration files
│   └── app/
│       ├── main.py           # FastAPI app
│       ├── core/
│       │   ├── settings.py   # Pydantic settings (reads .env)
│       │   ├── database.py   # Async SQLAlchemy engine
│       │   └── security.py   # JWT token helpers
│       ├── models/
│       │   ├── user.py       # User, RefreshToken
│       │   └── podcast.py    # Podcast, Episode, Voice, GenerationJob
│       ├── schemas/
│       │   ├── user.py       # Auth request/response schemas
│       │   └── podcast.py    # Podcast request/response schemas
│       ├── routers/
│       │   ├── auth.py       # /auth/register, /login, /refresh, /me
│       │   ├── podcasts.py   # CRUD + generation endpoints
│       │   └── health.py     # /health, /voices, /files
│       └── services/
│           ├── auth/service.py    # Auth logic (register, login, tokens)
│           ├── llm/service.py     # Groq API integration
│           ├── tts/service.py     # Multi-provider TTS (Edge/OpenAI/ElevenLabs)
│           └── podcast/service.py # Orchestration (script gen, TTS, full pipeline)
└── frontend/
    ├── package.json
    ├── vite.config.js        # Vite + Tailwind + API proxy to :8000
    └── src/
        ├── App.jsx           # Router + auth guards + layouts
        ├── index.css          # Tailwind theme (purple accent)
        ├── lib/api.js         # API client with auto token refresh
        ├── contexts/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Header.jsx         # Public nav (landing pages)
        │   ├── Footer.jsx         # Public footer
        │   ├── AppLayout.jsx      # Dashboard sidebar + podcast list
        │   └── landing/           # Hero, Features, Pricing, CTA
        └── pages/
            ├── LandingPage.jsx    # Public homepage
            ├── AboutPage.jsx      # About us
            ├── PricingPage.jsx    # Pricing tiers
            ├── LoginPage.jsx      # Split-screen login
            ├── RegisterPage.jsx   # Split-screen register
            ├── DashboardPage.jsx  # Podcast list
            ├── NewPodcastPage.jsx # Create/generate podcast
            └── PodcastDetailPage.jsx  # Episodes, transcript, audio player
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | No | Create account |
| `POST` | `/api/v1/auth/login` | No | Login, get tokens |
| `POST` | `/api/v1/auth/refresh` | No | Refresh access token |
| `POST` | `/api/v1/auth/logout` | No | Revoke refresh token |
| `GET` | `/api/v1/auth/me` | Yes | Get current user |
| `GET` | `/api/v1/voices` | No | List available TTS voices |
| `POST` | `/api/v1/podcasts` | Yes | Create podcast |
| `GET` | `/api/v1/podcasts` | Yes | List user's podcasts |
| `GET` | `/api/v1/podcasts/:id` | Yes | Get podcast with episodes |
| `PATCH` | `/api/v1/podcasts/:id` | Yes | Update podcast |
| `DELETE` | `/api/v1/podcasts/:id` | Yes | Delete podcast |
| `POST` | `/api/v1/podcasts/:id/voices` | Yes | Add voice to podcast |
| `GET` | `/api/v1/podcasts/:id/voices` | Yes | List voices |
| `POST` | `/api/v1/podcasts/:id/episodes` | Yes | Create episode |
| `GET` | `/api/v1/podcasts/:id/episodes` | Yes | List episodes |
| `POST` | `/api/v1/podcasts/generate/script` | Yes | Generate script (Groq LLM) |
| `POST` | `/api/v1/podcasts/generate/audio` | Yes | Generate audio (TTS, optional voice param) |
| `POST` | `/api/v1/podcasts/generate/full` | Yes | Full pipeline (topic → script → audio) |
| `GET` | `/api/v1/health` | No | Health check |
| `GET` | `/api/v1/health/tts` | No | TTS provider status |
| `GET` | `/api/v1/files/:filename` | No | Serve audio files |

Full interactive API docs: `http://localhost:8000/docs`

## Development

### Backend

```bash
cd backend

# Run with auto-reload
uv run python run.py

# Lint
uv run ruff check app/

# Format
uv run ruff format app/

# Generate migration after model changes
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head
```

### Frontend

```bash
cd frontend

# Dev server (proxies /api to backend)
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

### How the generation flow works

1. User enters a topic → frontend calls `POST /podcasts/generate/full`
2. Backend creates podcast + episode in DB
3. Backend calls Groq LLM to generate a podcast script (multi-speaker dialogue)
4. Script is saved to the episode
5. Backend calls TTS (Edge/OpenAI/ElevenLabs) to convert script to audio
6. Audio file is saved to `storage/audio/`
7. Frontend polls for status updates, shows transcript + audio player when done

## Docker (Optional)

Start PostgreSQL and Redis:

```bash
docker-compose up -d
```

## License

MIT
