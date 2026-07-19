from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from ..core.settings import settings
from ..services.tts.service import get_available_voices

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "PodcastMaker API"}


@router.get("/health/tts")
async def tts_health():
    providers = settings.enabled_tts_providers
    return {"status": "ok", "providers": providers}


@router.get("/voices")
async def list_voices():
    """List available voices based on enabled TTS providers."""
    return {
        "voices": get_available_voices(),
        "providers": settings.enabled_tts_providers,
    }


@router.get("/files/{filename:path}")
async def serve_file(filename: str):
    """Serve audio files from storage."""
    file_path = settings.audio_storage_dir / filename
    if file_path.exists():
        return FileResponse(str(file_path))
    raise HTTPException(status_code=404, detail="File not found")
