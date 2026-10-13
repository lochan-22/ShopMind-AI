import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode

# Ensure 'backend' directory is in sys.path so 'app' imports work from repo root or backend/
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.products import router as products_router
from app.routes.agent import router as agent_router
from app.routes.health import router as health_router

app = FastAPI(
    title="ShopMind AI Backend",
    description="Backend API for ShopMind AI - an AI-powered shopping assistant.",
    version="1.0.0",
)


class SensitiveQueryParameterRedactionMiddleware:
    """Remove sensitive query values before application and access logging."""

    _SENSITIVE_PARAMETERS = {"details_token"}

    def __init__(self, app: FastAPI) -> None:
        self.app = app

    async def __call__(self, scope, receive, send):
        """Redact configured query values while preserving normal request logging."""
        if scope["type"] == "http" and scope.get("query_string"):
            query_items = parse_qsl(
                scope["query_string"].decode("latin-1"), keep_blank_values=True
            )
            if any(key.lower() in self._SENSITIVE_PARAMETERS for key, _ in query_items):
                scope["query_string"] = urlencode(
                    [
                        (key, "[REDACTED]" if key.lower() in self._SENSITIVE_PARAMETERS else value)
                        for key, value in query_items
                    ]
                ).encode("latin-1")
        await self.app(scope, receive, send)


app.add_middleware(SensitiveQueryParameterRedactionMiddleware)

# Production-ready CORS configuration
allowed_origins = settings.get_allowed_origins()
allow_credentials = allowed_origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers AFTER creating app
app.include_router(products_router, prefix="/api")
app.include_router(agent_router, prefix="/api")
app.include_router(health_router)
app.include_router(health_router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "ShopMind AI Backend Running"}
