from fastapi import APIRouter
from fastapi.responses import FileResponse

from ..core.settings import settings
from ..services.tts.service import tts_service

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "PodcastMaker API"}


@router.get("/health/tts")
async def tts_health():
    healthy = await tts_service.health_check()
    return {"status": "ok" if healthy else "unavailable", "service": "Edge TTS"}


@router.get("/files/{filename:path}")
async def serve_file(filename: str):
    """Serve audio files from storage."""
    file_path = settings.audio_storage_dir / filename
    if file_path.exists():
        return FileResponse(str(file_path))
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="File not found")
