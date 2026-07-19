import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..schemas.podcast import (
    EpisodeCreate,
    EpisodeDetail,
    EpisodeResponse,
    GenerateAudioRequest,
    GenerateFullRequest,
    GenerateScriptRequest,
    GenerationJobResponse,
    PodcastCreate,
    PodcastDetail,
    PodcastResponse,
    PodcastUpdate,
    VoiceCreate,
    VoiceResponse,
)
from ..services.podcast.service import PodcastService
from .auth import get_current_user_id

router = APIRouter(prefix="/podcasts", tags=["Podcasts"])


def get_service(db: AsyncSession = Depends(get_db)) -> PodcastService:
    return PodcastService(db)


# ── Podcast CRUD ──────────────────────────────────────────────────────────


@router.post("", response_model=PodcastResponse, status_code=status.HTTP_201_CREATED)
async def create_podcast(
    body: PodcastCreate, user_id: str = Depends(get_current_user_id), svc: PodcastService = Depends(get_service)
):
    return await svc.create_podcast(
        owner_id=uuid.UUID(user_id), title=body.title, description=body.description, topic=body.topic
    )


@router.get("", response_model=list[PodcastResponse])
async def list_podcasts(user_id: str = Depends(get_current_user_id), svc: PodcastService = Depends(get_service)):
    return await svc.list_podcasts(owner_id=uuid.UUID(user_id))


@router.get("/{podcast_id}", response_model=PodcastDetail)
async def get_podcast(
    podcast_id: uuid.UUID, user_id: str = Depends(get_current_user_id), svc: PodcastService = Depends(get_service)
):
    return await svc.get_podcast_with_relations(podcast_id=podcast_id, owner_id=uuid.UUID(user_id))


@router.patch("/{podcast_id}", response_model=PodcastResponse)
async def update_podcast(
    podcast_id: uuid.UUID,
    body: PodcastUpdate,
    user_id: str = Depends(get_current_user_id),
    svc: PodcastService = Depends(get_service),
):
    podcast = await svc.get_podcast(podcast_id=podcast_id, owner_id=uuid.UUID(user_id))
    if body.title is not None:
        podcast.title = body.title
    if body.description is not None:
        podcast.description = body.description
    if body.topic is not None:
        podcast.topic = body.topic
    return podcast


@router.delete("/{podcast_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_podcast(
    podcast_id: uuid.UUID, user_id: str = Depends(get_current_user_id), svc: PodcastService = Depends(get_service)
):
    await svc.delete_podcast(podcast_id=podcast_id, owner_id=uuid.UUID(user_id))


# ── Voices ────────────────────────────────────────────────────────────────


@router.post("/{podcast_id}/voices", response_model=VoiceResponse, status_code=status.HTTP_201_CREATED)
async def add_voice(
    podcast_id: uuid.UUID,
    body: VoiceCreate,
    user_id: str = Depends(get_current_user_id),
    svc: PodcastService = Depends(get_service),
):
    await svc.get_podcast(podcast_id=podcast_id, owner_id=uuid.UUID(user_id))  # ownership check
    return await svc.add_voice(
        podcast_id=podcast_id,
        name=body.name,
        role=body.role,
        language=body.language,
        voice_settings=body.voice_settings,
    )


@router.get("/{podcast_id}/voices", response_model=list[VoiceResponse])
async def list_voices(
    podcast_id: uuid.UUID, user_id: str = Depends(get_current_user_id), svc: PodcastService = Depends(get_service)
):
    await svc.get_podcast(podcast_id=podcast_id, owner_id=uuid.UUID(user_id))
    return await svc.get_voices(podcast_id=podcast_id)


# ── Episodes ──────────────────────────────────────────────────────────────


@router.post("/{podcast_id}/episodes", response_model=EpisodeResponse, status_code=status.HTTP_201_CREATED)
async def create_episode(
    podcast_id: uuid.UUID,
    body: EpisodeCreate,
    user_id: str = Depends(get_current_user_id),
    svc: PodcastService = Depends(get_service),
):
    await svc.get_podcast(podcast_id=podcast_id, owner_id=uuid.UUID(user_id))
    return await svc.create_episode(
        podcast_id=podcast_id,
        title=body.title,
        episode_number=body.episode_number,
        voice_id=body.voice_id,
        script=body.script,
    )


@router.get("/{podcast_id}/episodes", response_model=list[EpisodeResponse])
async def list_episodes(
    podcast_id: uuid.UUID, user_id: str = Depends(get_current_user_id), svc: PodcastService = Depends(get_service)
):
    await svc.get_podcast(podcast_id=podcast_id, owner_id=uuid.UUID(user_id))
    return await svc.list_episodes(podcast_id=podcast_id)


@router.get("/episodes/{episode_id}", response_model=EpisodeDetail)
async def get_episode(episode_id: uuid.UUID, svc: PodcastService = Depends(get_service)):
    return await svc.get_episode(episode_id=episode_id)


# ── Generation ────────────────────────────────────────────────────────────


@router.post("/generate/script", response_model=GenerationJobResponse)
async def generate_script(
    body: GenerateScriptRequest, user_id: str = Depends(get_current_user_id), svc: PodcastService = Depends(get_service)
):
    """Generate a script for an episode using Groq LLM."""
    # Create a temporary episode for the script

    # For now, require an existing episode
    # In production, this could create one automatically
    return await svc.generate_script(
        episode_id=uuid.UUID(body.episode_id) if hasattr(body, "episode_id") else uuid.uuid4(),
        topic=body.topic,
        duration_minutes=body.duration_minutes,
        style=body.style,
        num_speakers=body.num_speakers,
    )


@router.post("/generate/audio", response_model=GenerationJobResponse)
async def generate_audio(
    body: GenerateAudioRequest, user_id: str = Depends(get_current_user_id), svc: PodcastService = Depends(get_service)
):
    """Generate audio for an episode using Coqui TTS."""
    return await svc.generate_audio(episode_id=body.episode_id)


@router.post("/generate/full", response_model=PodcastDetail)
async def generate_full(
    body: GenerateFullRequest, user_id: str = Depends(get_current_user_id), svc: PodcastService = Depends(get_service)
):
    """Full pipeline: create podcast, generate scripts + audio for all episodes."""
    podcast = await svc.generate_full(
        title=body.title,
        topic=body.topic,
        owner_id=uuid.UUID(user_id),
        description=body.description,
        num_episodes=body.num_episodes,
        duration_minutes=body.duration_minutes,
        num_speakers=body.num_speakers,
        style=body.style,
    )
    return podcast
