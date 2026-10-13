from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Resolve relative to the backend package so uvicorn works whether it
        # is started from the repository root or from ``backend/``.
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "ShopMind AI"
    app_version: str = "0.1.0"
    debug: bool = False
    database_url: str = "sqlite:///./shopmind.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-4o-mini"
    openrouter_site_url: str = "http://localhost:5173"
    openrouter_app_name: str = "ShopMind AI"
    openrouter_timeout_seconds: float = 25.0
    serpapi_api_key: str = ""

    def get_allowed_origins(self) -> list[str]:
        """Parse comma-separated cors_origins string into a list of origins."""
        if not self.cors_origins:
            return ["*"]
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @field_validator("debug", mode="before")
    @classmethod
    def normalize_debug_value(cls, value: object) -> object:
        if isinstance(value, str) and value.lower() in {"release", "production", "prod"}:
            return False
        if isinstance(value, str) and value.lower() in {"development", "dev"}:
            return True
        return value


settings = Settings()
