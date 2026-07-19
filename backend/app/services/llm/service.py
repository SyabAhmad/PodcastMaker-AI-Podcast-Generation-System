import json

import httpx

from ...core.settings import settings


class LLMService:
    """Groq API client for script generation and content tasks."""

    BASE_URL = "https://api.groq.com/openai/v1"

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def generate_podcast_script(
        self,
        topic: str,
        episode_title: str,
        num_speakers: int = 2,
        duration_minutes: int = 10,
        style: str = "conversational",
    ) -> dict:
        """Generate a full podcast script with speaker turns."""
        system_prompt = f"""You are a professional podcast script writer. Generate a podcast script for the following:
        
Topic: {topic}
Episode Title: {episode_title}
Number of Speakers: {num_speakers}
Duration: ~{duration_minutes} minutes
Style: {style}

IMPORTANT: Respond with ONLY valid JSON, no markdown. Format:
{{
    "speakers": [
        {{"name": "Speaker 1", "role": "host"}},
        {{"name": "Speaker 2", "role": "guest"}}
    ],
    "intro": "Brief podcast intro text",
    "segments": [
        {{
            "speaker": "Speaker 1",
            "text": "dialogue line..."
        }}
    ],
    "outro": "Brief outro text"
}}

Make the dialogue natural, engaging, and appropriate for the {duration_minutes}-minute duration.
A typical speaking pace is ~150 words per minute, so aim for approximately {duration_minutes * 150} words total."""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/chat/completions",
                headers=self.headers,
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Generate a {style} podcast script about: {topic}"},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 4096,
                },
                timeout=60.0,
            )
            response.raise_for_status()

        content = response.json()["choices"][0]["message"]["content"]
        # Strip markdown code fences if present
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
        if content.endswith("```"):
            content = content.rsplit("```", 1)[0]
        content = content.strip()

        return json.loads(content)

    async def generate_show_notes(self, script: dict, topic: str) -> str:
        """Generate show notes / summary from a script."""
        script_text = "\n".join(f"{s['speaker']}: {s['text']}" for s in script.get("segments", []))

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/chat/completions",
                headers=self.headers,
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "Generate concise podcast show notes. Include a 2-3 sentence summary, "
                            "key topics covered, and 3-5 bullet points of main takeaways.",
                        },
                        {"role": "user", "content": f"Topic: {topic}\n\nScript:\n{script_text}"},
                    ],
                    "temperature": 0.5,
                    "max_tokens": 1024,
                },
                timeout=30.0,
            )
            response.raise_for_status()

        return response.json()["choices"][0]["message"]["content"]

    async def chat(self, messages: list[dict], temperature: float = 0.7) -> str:
        """Generic chat completion."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/chat/completions",
                headers=self.headers,
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                },
                timeout=60.0,
            )
            response.raise_for_status()

        return response.json()["choices"][0]["message"]["content"]


llm_service = LLMService()
