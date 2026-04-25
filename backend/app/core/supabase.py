"""
Supabase client initialisation (server-side, uses service-role key).

Usage:
    from app.core.supabase import get_supabase
    client = get_supabase()
"""

from supabase import Client, create_client

from app.core.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise RuntimeError(
                "Supabase credentials not configured. "
                "Copy .env.example to .env and fill in your values."
            )
        _client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    return _client
