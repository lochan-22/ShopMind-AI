from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.products import router as products_router
from app.routes.agent import router as agent_router
from app.routes.health import router as health_router

app = FastAPI(
    title="ShopMind AI Backend",
    description="Backend API for ShopMind AI - an AI-powered shopping assistant.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers AFTER creating app
app.include_router(products_router, prefix="/api")
app.include_router(agent_router, prefix="/api")
app.include_router(health_router)


@app.get("/")
def read_root():
    return {"message": "ShopMind AI Backend Running"}
