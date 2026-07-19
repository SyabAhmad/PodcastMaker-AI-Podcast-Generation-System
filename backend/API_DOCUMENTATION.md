# PodcastMaker API Documentation

Base URL: `http://localhost:8000/api/v1`

Interactive docs available at: `http://localhost:8000/docs`

---

## Authentication

All endpoints under `/podcasts` require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

### POST `/auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-07-19T15:00:00Z"
}
```

### POST `/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### POST `/auth/refresh`
Exchange refresh token for new token pair.

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response (200):** Same as login response.

### POST `/auth/logout`
Revoke a refresh token. Requires no auth header.

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response:** `204 No Content`

### GET `/auth/me`
Get current user profile. Requires Bearer token.

**Response (200):** Same as register response.

---

## Podcasts

### POST `/podcasts`
Create a new podcast project.

**Request:**
```json
{
  "title": "Tech Talk Weekly",
  "description": "Weekly tech discussions",
  "topic": "Latest in AI and machine learning"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Tech Talk Weekly",
  "description": "Weekly tech discussions",
  "topic": "Latest in AI and machine learning",
  "status": "draft",
  "created_at": "...",
  "updated_at": "..."
}
```

### GET `/podcasts`
List all podcasts for the authenticated user.

**Response (200):** Array of podcast objects.

### GET `/podcasts/{podcast_id}`
Get podcast with episodes and voices.

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Tech Talk Weekly",
  "description": "...",
  "topic": "...",
  "status": "ready",
  "created_at": "...",
  "updated_at": "...",
  "episodes": [...],
  "voices": [...]
}
```

### PATCH `/podcasts/{podcast_id}`
Update podcast details. All fields optional.

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

### DELETE `/podcasts/{podcast_id}`
Delete a podcast and all its episodes/voices.

**Response:** `204 No Content`

---

## Voices

### POST `/podcasts/{podcast_id}/voices`
Add a voice to a podcast.

**Request:**
```json
{
  "name": "Alex",
  "role": "host",
  "language": "en",
  "voice_settings": {
    "pitch": 1.0,
    "speed": 1.0
  }
}
```

### GET `/podcasts/{podcast_id}/voices`
List all voices for a podcast.

---

## Episodes

### POST `/podcasts/{podcast_id}/episodes`
Create an episode.

**Request:**
```json
{
  "title": "Episode 1: AI in 2026",
  "episode_number": 1,
  "voice_id": "uuid-or-null",
  "script": "Optional pre-written script"
}
```

### GET `/podcasts/{podcast_id}/episodes`
List all episodes for a podcast.

### GET `/podcasts/episodes/{episode_id}`
Get episode detail with script, voice, and job history.

---

## Generation (AI Pipeline)

### POST `/podcasts/generate/script`
Generate a script using Groq LLM. Creates a job and returns immediately.

**Request:**
```json
{
  "topic": "The future of autonomous vehicles",
  "episode_title": "Self-Driving Cars: Are We There Yet?",
  "duration_minutes": 15,
  "style": "conversational",
  "num_speakers": 2
}
```

**Response (201):**
```json
{
  "id": "job-uuid",
  "episode_id": "episode-uuid",
  "job_type": "script",
  "status": "running",
  "progress": 0.0,
  "error_message": null,
  "created_at": "..."
}
```

### POST `/podcasts/generate/audio`
Generate audio for an episode using Coqui TTS.

**Request:**
```json
{
  "episode_id": "uuid"
}
```

### POST `/podcasts/generate/full`
Full pipeline: create podcast + generate scripts + audio for all episodes.

**Request:**
```json
{
  "title": "AI Revolution Podcast",
  "topic": "How AI is changing healthcare",
  "description": "A deep dive into AI in medicine",
  "num_episodes": 3,
  "duration_minutes": 10,
  "num_speakers": 2,
  "style": "conversational"
}
```

**Response (201):** Full podcast object with episodes.

---

## Health

### GET `/health`
```json
{"status": "ok", "service": "PodcastMaker API"}
```

### GET `/health/tts`
Check XTTS server availability.
```json
{"status": "ok", "service": "XTTS"}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 204  | No Content |
| 400  | Bad Request |
| 401  | Unauthorized (invalid/missing token) |
| 403  | Forbidden (account disabled) |
| 404  | Not Found |
| 409  | Conflict (email/username exists) |
| 500  | Internal Server Error |

---

## Podcast/Episode Status Flow

```
Podcast:  draft → generating → ready | failed
Episode:  draft → scripted → generating_audio → completed | failed
Job:      pending → running → completed | failed
```

---

## Frontend Integration Notes

1. **Token Storage**: Store `access_token` and `refresh_token` in localStorage or httpOnly cookies.
2. **Auto-Refresh**: Before the access token expires (30 min), call `/auth/refresh` with the refresh token.
3. **Auth Header**: Every `/podcasts` request needs `Authorization: Bearer <access_token>`.
4. **Generation Polling**: After calling `/generate/script` or `/generate/audio`, poll the episode detail to check `status` changes.
5. **WebSocket (future)**: For real-time progress updates, a WebSocket endpoint will be added later.
