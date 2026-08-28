from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Reflex API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://reflex:reflex@localhost:5432/reflex"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
