from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_env: str = "development"

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # World ID
    worldid_app_id: str = ""
    worldid_rp_id: str = ""
    worldid_rp_signing_key: str = ""
    worldid_action: str = "verify-blink-user"

    # JWT (for issuing our own tokens after World ID verification)
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 720  # 30 days

    # Google Gemini (AI-powered matching)
    gemini_api_key: str = ""

    # Agora RTC (voice & video calling)
    agora_app_id: str = ""
    agora_app_certificate: str = ""


settings = Settings()
