from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import init_db
from routes.scan import router as scan_router
from routes.feedback import router as feedback_router
from routes.metrics import router as metrics_router

load_dotenv()

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield


app = FastAPI(
    title="CheckMate API",
    description="Human-in-the-loop anomaly detection for AI-generated code",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(scan_router)
app.include_router(feedback_router)
app.include_router(metrics_router)


@app.get("/")
async def root():
    return {"message": "CheckMate API is running", "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
