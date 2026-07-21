from fastapi import APIRouter

from app.schemas.health import HealthResponse
from app.services.health import HealthService

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Return service health status for load balancers and monitoring."""
    return HealthService.get_status()
