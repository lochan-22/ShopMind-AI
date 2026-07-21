from app.core.config import settings
from app.schemas.health import HealthResponse


class HealthService:
    """Business logic for application health checks."""

    @staticmethod
    def get_status() -> HealthResponse:
        return HealthResponse(
            status="ok",
            service="shopmind-ai",
            version=settings.app_version,
        )
