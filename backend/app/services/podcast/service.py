import ast
import os
import shutil
import subprocess
import uuid

import edge_tts
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ...models.podcast import (
    Episode,
    EpisodeStatus,
    GenerationJob,
    JobStatus,
    Podcast,
    PodcastStatus,
    Voice,
)
from ...services.llm.service import llm_service
from ...services.tts.service import tts_service


class PodcastService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Podcast CRUD ──────────────────────────────────────────────────────

    async def create_podcast(
        self, owner_id: uuid.UUID, title: str, description: str | None = None, topic: str | None = None
    ) -> Podcast:
        podcast = Podcast(owner_id=owner_id, title=title, description=description, topic=topic)
        self.db.add(podcast)
        await self.db.flush()
        return podcast

    async def get_podcast(self, podcast_id: uuid.UUID, owner_id: uuid.UUID) -> Podcast:
        result = await self.db.execute(select(Podcast).where(Podcast.id == podcast_id, Podcast.owner_id == owner_id))
        podcast = result.scalar_one_or_none()
        if not podcast:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Podcast not found")
        return podcast

    async def get_podcast_with_relations(self, podcast_id: uuid.UUID, owner_id: uuid.UUID) -> Podcast:
        result = await self.db.execute(
            select(Podcast)
            .where(Podcast.id == podcast_id, Podcast.owner_id == owner_id)
            .options(selectinload(Podcast.episodes), selectinload(Podcast.voices))
        )
        podcast = result.scalar_one_or_none()
        if not podcast:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Podcast not found")
        return podcast

    async def list_podcasts(self, owner_id: uuid.UUID) -> list[Podcast]:
        result = await self.db.execute(
            select(Podcast).where(Podcast.owner_id == owner_id).order_by(Podcast.created_at.desc())
        )
        return list(result.scalars().all())

    async def delete_podcast(self, podcast_id: uuid.UUID, owner_id: uuid.UUID) -> None:
        podcast = await self.get_podcast(podcast_id, owner_id)
        await self.db.delete(podcast)

    # ── Voice Management ──────────────────────────────────────────────────

    async def add_voice(
        self, podcast_id: uuid.UUID, name: str, role: str, language: str = "en", voice_settings: dict | None = None
    ) -> Voice:
        voice = Voice(
            podcast_id=podcast_id,
            name=name,
            role=role,
            language=language,
            voice_settings=voice_settings or {},
        )
        self.db.add(voice)
        await self.db.flush()
        return voice

    async def get_voices(self, podcast_id: uuid.UUID) -> list[Voice]:
        result = await self.db.execute(select(Voice).where(Voice.podcast_id == podcast_id))
        return list(result.scalars().all())

    # ── Episode CRUD ──────────────────────────────────────────────────────

    async def create_episode(
        self,
        podcast_id: uuid.UUID,
        title: str,
        episode_number: int,
        voice_id: uuid.UUID | None = None,
        script: str | None = None,
    ) -> Episode:
        episode = Episode(
            podcast_id=podcast_id,
            title=title,
            episode_number=episode_number,
            voice_id=voice_id,
            script=script,
        )
        self.db.add(episode)
        await self.db.flush()
        return episode

    async def get_episode(self, episode_id: uuid.UUID) -> Episode:
        result = await self.db.execute(select(Episode).where(Episode.id == episode_id))
        episode = result.scalar_one_or_none()
        if not episode:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episode not found")
        return episode

    async def list_episodes(self, podcast_id: uuid.UUID) -> list[Episode]:
        result = await self.db.execute(
            select(Episode).where(Episode.podcast_id == podcast_id).order_by(Episode.episode_number)
        )
        return list(result.scalars().all())

    # ── Generation Pipeline ───────────────────────────────────────────────

    async def generate_script(
        self,
        episode_id: uuid.UUID,
        topic: str,
        duration_minutes: int = 10,
        style: str = "conversational",
        num_speakers: int = 2,
    ) -> GenerationJob:
        episode = await self.get_episode(episode_id)

        # Create job
        job = GenerationJob(episode_id=episode_id, job_type="script", status=JobStatus.RUNNING)
        self.db.add(job)
        await self.db.flush()

        try:
            # Generate script via LLM
            script_data = await llm_service.generate_podcast_script(
                topic=topic,
                episode_title=episode.title,
                num_speakers=num_speakers,
                duration_minutes=duration_minutes,
                style=style,
            )

            # Update episode with script
            episode.script = str(script_data)
            episode.status = EpisodeStatus.SCRIPTED
            job.status = JobStatus.COMPLETED
            job.result = script_data
            job.progress = 1.0

        except Exception as e:
            episode.status = EpisodeStatus.FAILED
            job.status = JobStatus.FAILED
            job.error_message = str(e)

        await self.db.flush()
        return job

    async def generate_audio(self, episode_id: uuid.UUID) -> GenerationJob:
        episode = await self.get_episode(episode_id)

        if not episode.script:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Episode must have a script before generating audio"
            )

        # Create job
        job = GenerationJob(episode_id=episode_id, job_type="tts", status=JobStatus.RUNNING)
        self.db.add(job)
        await self.db.flush()

        try:
            episode.status = EpisodeStatus.GENERATING_AUDIO
            await self.db.flush()

            # Parse the script — it's a string repr of a dict
            script_data = ast.literal_eval(episode.script)
            segments = script_data.get("segments", [])

            if segments:
                # Multi-speaker: synthesize each segment with the right voice
                segment_files = []
                for i, seg in enumerate(segments):
                    speaker = seg.get("speaker", "")
                    text = seg.get("text", "")
                    if not text:
                        continue

                    # Map speaker to voice role
                    role = "host" if i % 2 == 0 else "guest"
                    voice = tts_service.voices.get(role, "en-US-GuyNeural")

                    filename = f"ep_{episode_id.hex[:8]}_{i}.mp3"
                    filepath = settings.audio_storage_dir / filename

                    communicate = edge_tts.Communicate(text, voice)
                    await communicate.save(str(filepath))
                    segment_files.append(str(filepath))

                # Concatenate all segments into one file using ffmpeg
                if segment_files:
                    output_file = settings.audio_storage_dir / f"ep_{episode_id.hex[:8]}.mp3"
                    list_file = settings.audio_storage_dir / f"ep_{episode_id.hex[:8]}_list.txt"

                    # Write file list for ffmpeg
                    with open(list_file, "w") as f:
                        for sf in segment_files:
                            f.write(f"file '{sf}'\n")

                    ffmpeg = shutil.which("ffmpeg")
                    if ffmpeg:
                        subprocess.run(
                            [ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(list_file), "-c", "copy", str(output_file)],
                            capture_output=True,
                        )
                        episode.audio_file_path = str(output_file)
                    else:
                        # No ffmpeg — just use the last segment
                        episode.audio_file_path = segment_files[-1] if segment_files else None

                    # Clean up segment files
                    for sf in segment_files:
                        os.remove(sf)
                    if list_file.exists():
                        os.remove(list_file)
            else:
                # Fallback: single speaker
                audio_path = await tts_service.synthesize(
                    text=episode.script,
                    output_filename=f"ep_{episode_id.hex[:8]}.mp3",
                )
                episode.audio_file_path = audio_path

            episode.status = EpisodeStatus.COMPLETED
            episode.duration_seconds = 0.0
            job.status = JobStatus.COMPLETED
            job.progress = 1.0
            job.result = {"audio_path": episode.audio_file_path}

        except Exception as e:
            episode.status = EpisodeStatus.FAILED
            job.status = JobStatus.FAILED
            job.error_message = str(e)

        await self.db.flush()
        return job

    async def generate_full(
        self,
        title: str,
        topic: str,
        owner_id: uuid.UUID,
        description: str | None = None,
        num_episodes: int = 1,
        duration_minutes: int = 10,
        num_speakers: int = 2,
        style: str = "conversational",
    ) -> Podcast:
        """End-to-end: create podcast, generate scripts, then audio."""
        podcast = await self.create_podcast(owner_id=owner_id, title=title, description=description, topic=topic)

        podcast.status = PodcastStatus.GENERATING
        await self.db.flush()

        for ep_num in range(1, num_episodes + 1):
            ep_title = f"{title} - Episode {ep_num}" if num_episodes > 1 else title
            episode = await self.create_episode(
                podcast_id=podcast.id,
                title=ep_title,
                episode_number=ep_num,
            )

            # Generate script
            await self.generate_script(
                episode_id=episode.id,
                topic=topic,
                duration_minutes=duration_minutes,
                style=style,
                num_speakers=num_speakers,
            )

            # Generate audio
            await self.generate_audio(episode_id=episode.id)

        podcast.status = PodcastStatus.READY
        await self.db.flush()

        # Eagerly load relations for response serialization
        return await self.get_podcast_with_relations(podcast.id, owner_id)


podcast_service_factory = PodcastService
