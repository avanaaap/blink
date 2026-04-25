"""Agora RTC token generation for voice and video calls."""

from __future__ import annotations

import time

from agora_token_builder.RtcTokenBuilder import (
    RtcTokenBuilder,
    Role_Publisher,
)

from app.core.config import settings

TOKEN_EXPIRY_SECONDS = 3600  # 1 hour


def generate_rtc_token(
    channel_name: str,
    uid: int,
) -> str:
    """Build a time-limited Agora RTC token for the given channel.

    Both participants in a call use ``Role_Publisher`` so they can
    send and receive audio/video.
    """
    if not settings.agora_app_id or not settings.agora_app_certificate:
        raise RuntimeError(
            "Agora credentials not configured. "
            "Set AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env"
        )

    expire_ts = int(time.time()) + TOKEN_EXPIRY_SECONDS

    return RtcTokenBuilder.buildTokenWithUid(
        settings.agora_app_id,
        settings.agora_app_certificate,
        channel_name,
        uid,
        Role_Publisher,
        expire_ts,
    )


def match_channel_name(match_id: str) -> str:
    """Deterministic channel name for a match."""
    return f"blink-{match_id}"
