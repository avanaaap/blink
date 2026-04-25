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


settings = Settings()
