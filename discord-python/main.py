import os
import httpx
import base64
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

# Load environment variables
load_dotenv()

TIKTOK_TTS_URL = "https://api16-normal-v6.tiktokv.com/media/api/text/speech/invoke/"
TIKTOK_USER_AGENT = "com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)"
VOICE_DAT = "BV075_streaming"  # Voice: Đạt (North)

app = FastAPI()

class TTSRequest(BaseModel):
    text: str
    voice: str = VOICE_DAT
    session_id: str | None = None

async def synthesize_tiktok_segment(text: str, session_id: str, voice: str = VOICE_DAT, max_retries: int = 3) -> bytes:
    """
    Synthesize a single segment using TikTok TTS with retry logic.
    Returns audio bytes (MP3 format).
    """
    if not session_id:
        raise ValueError("TikTok session ID is required.")

    headers = {
        "User-Agent": TIKTOK_USER_AGENT,
        "Cookie": f"sessionid={session_id}",
    }

    params = {
        "text_speaker": voice,
        "req_text": text,
        "speaker_map_type": 0,
        "aid": 1233,
    }

    last_error = None

    for attempt in range(max_retries):
        try:
            print(f"Attempt {attempt+1}/{max_retries}...")
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    TIKTOK_TTS_URL,
                    headers=headers,
                    params=params,
                    timeout=20.0
                )
                response.raise_for_status()

                json_data = response.json()

                if json_data.get("message") == "Couldn't load speech. Try again.":
                    raise Exception("TikTok API Error: Couldn't load speech. Session ID may be invalid.")

                if json_data.get("status_code") == 0 and json_data.get("data"):
                    audio_base64 = json_data["data"].get("v_str")
                    if not audio_base64:
                        raise Exception("API returned success but audio data is empty.")
                    return base64.b64decode(audio_base64)
                else:
                    error_message = json_data.get("message", "Unknown API error")
                    raise Exception(f"TikTok API Error: {error_message}")

        except httpx.HTTPStatusError as e:
            last_error = e
            print(f"TikTok TTS HTTP error: {e.response.status_code}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1.0 * (attempt + 1))
        except Exception as e:
            last_error = e
            print(f"TikTok TTS error: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1.0 * (attempt + 1))

    raise Exception(f"TikTok TTS failed after {max_retries} attempts: {last_error}")

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    session_id = request.session_id or os.getenv("TIKTOK_SESSIONID")
    if not session_id:
        raise HTTPException(status_code=500, detail="TIKTOK_SESSIONID not configured and not provided in request.")

    try:
        audio_bytes = await synthesize_tiktok_segment(request.text, session_id, request.voice)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

