import os
import uuid

import edge_tts

from ...core.settings import settings


# Free Edge TTS voices — high quality, no API key, no GPU
VOICE_MAP = {
    "host": "en-US-GuyNeural",       # Male host
    "guest": "en-US-JennyNeural",     # Female guest
    "narrator": "en-US-AriaNeural",   # Female narrator
    "male": "en-US-GuyNeural",
    "female": "en-US-JennyNeural",
}


class TTSService:
    """Microsoft Edge TTS — free, fast, high quality."""

    def __init__(self):
        self.voices = VOICE_MAP

    async def synthesize(
        self,
        text: str,
        output_filename: str | None = None,
        language: str = "en",
        voice_settings: dict | None = None,
    ) -> str:
        """Synthesize text to speech using Edge TTS."""
        if not output_filename:
            output_filename = f"tts_{uuid.uuid4().hex[:12]}.mp3"

        output_path = settings.audio_storage_dir / output_filename

        # Pick voice from settings or default to male
        voice = "en-US-GuyNeural"
        if voice_settings and "voice" in voice_settings:
            voice = voice_settings["voice"]
        elif voice_settings and "role" in voice_settings:
            voice = self.voices.get(voice_settings["role"], voice)

        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_path))

        return str(output_path)

    async def synthesize_multi_speaker(
        self,
        segments: list[dict],
        language: str = "en",
    ) -> list[str]:
        """Synthesize multiple segments with different voices."""
        paths = []
        for i, segment in enumerate(segments):
            voice_key = segment.get("role", "host")
            voice = self.voices.get(voice_key, "en-US-GuyNeural")

            filename = f"segment_{uuid.uuid4().hex[:8]}_{i}.mp3"
            path = await self.synthesize(
                text=segment["text"],
                output_filename=filename,
                language=language,
                voice_settings={"voice": voice},
            )
            paths.append(path)
        return paths

    async def health_check(self) -> bool:
        """Edge TTS is always available (just needs internet)."""
        return True


tts_service = TTSService()
