import uuid
from datetime import datetime

from pydantic import BaseModel

# ── Podcast ──────────────────────────────────────────────────────────────────


class PodcastCreate(BaseModel):
    title: str
    description: str | None = None
    topic: str | None = None


class PodcastUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    topic: str | None = None


class PodcastResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    topic: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PodcastDetail(PodcastResponse):
    episodes: list["EpisodeResponse"] = []
    voices: list["VoiceResponse"] = []


# ── Voice ────────────────────────────────────────────────────────────────────


class VoiceCreate(BaseModel):
    name: str
    role: str  # "host", "guest", "narrator"
    language: str = "en"
    voice_settings: dict = {}


class VoiceResponse(BaseModel):
    id: uuid.UUID
    name: str
    role: str
    language: str
    voice_settings: dict

    model_config = {"from_attributes": True}


# ── Episode ──────────────────────────────────────────────────────────────────


class EpisodeCreate(BaseModel):
    title: str
    episode_number: int
    voice_id: uuid.UUID | None = None
    script: str | None = None


class EpisodeUpdate(BaseModel):
    title: str | None = None
    voice_id: uuid.UUID | None = None
    script: str | None = None


class EpisodeResponse(BaseModel):
    id: uuid.UUID
    podcast_id: uuid.UUID
    episode_number: int
    title: str
    status: str
    audio_file_path: str | None
    duration_seconds: float | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EpisodeDetail(EpisodeResponse):
    script: str | None = None
    voice: VoiceResponse | None = None
    jobs: list["GenerationJobResponse"] = []


# ── Generation ───────────────────────────────────────────────────────────────


class GenerateScriptRequest(BaseModel):
    topic: str
    episode_title: str
    duration_minutes: int = 10
    style: str = "conversational"  # "conversational", "formal", "storytelling"
    num_speakers: int = 2


class GenerateAudioRequest(BaseModel):
    episode_id: uuid.UUID


class GenerateFullRequest(BaseModel):
    title: str
    topic: str
    description: str | None = None
    num_episodes: int = 1
    duration_minutes: int = 10
    num_speakers: int = 2
    style: str = "conversational"


class GenerationJobResponse(BaseModel):
    id: uuid.UUID
    episode_id: uuid.UUID
    job_type: str
    status: str
    progress: float
    error_message: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
