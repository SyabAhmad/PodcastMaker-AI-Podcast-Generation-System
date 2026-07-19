import logging
import uuid

import edge_tts
import httpx

from ...core.settings import settings

log = logging.getLogger(__name__)


async def synthesize_edge(text: str, voice: str, output_path: str) -> str:
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)
    return output_path


async def synthesize_openai(text: str, voice: str, output_path: str) -> str:
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.OPENAI_TTS_MODEL,
        "input": text,
        "voice": voice,
        "response_format": "mp3",
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/audio/speech",
            headers=headers,
            json=payload,
            timeout=120.0,
        )
        response.raise_for_status()
    with open(output_path, "wb") as f:
        f.write(response.content)
    return output_path


async def synthesize_elevenlabs(text: str, voice_id: str, output_path: str) -> str:
    headers = {
        "xi-api-key": settings.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {"text": text, "model_id": "eleven_monolingual_v1"}
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers=headers,
            json=payload,
            timeout=120.0,
        )
        response.raise_for_status()
    with open(output_path, "wb") as f:
        f.write(response.content)
    return output_path


PROVIDERS = {
    "edge": synthesize_edge,
    "openai": synthesize_openai,
    "elevenlabs": synthesize_elevenlabs,
}


def get_available_voices() -> list[dict]:
    """Return list of available voices based on enabled providers."""
    enabled = settings.enabled_tts_providers
    voices = []
    for v in settings.parsed_voices:
        if v["provider"] in enabled:
            voices.append(v)
    # Fallback: if no voices match, return all configured
    if not voices:
        voices = settings.parsed_voices
    return voices


async def synthesize(
    text: str,
    output_filename: str | None = None,
    voice: str | None = None,
    provider: str | None = None,
) -> str:
    """Synthesize text to speech using the configured provider."""
    if not output_filename:
        output_filename = f"tts_{uuid.uuid4().hex[:12]}.mp3"

    output_path = str(settings.audio_storage_dir / output_filename)

    # Determine provider
    prov = provider or settings.TTS_PROVIDER
    enabled = settings.enabled_tts_providers
    if prov not in enabled:
        prov = enabled[0] if enabled else "edge"

    # Determine voice
    v = voice or settings.EDGE_TTS_VOICE
    if prov == "openai":
        v = voice or settings.OPENAI_TTS_VOICE
    elif prov == "elevenlabs":
        v = voice or settings.ELEVENLABS_VOICE_ID

    # Truncate if needed (Edge TTS has limits)
    if len(text) > 50000:
        text = text[:50000]

    log.info(f"TTS: provider={prov}, voice={v}, text_len={len(text)}")

    synth_fn = PROVIDERS.get(prov, synthesize_edge)
    await synth_fn(text, v, output_path)

    return output_path
