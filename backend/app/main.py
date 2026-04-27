from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db
from app.api import lookup, stats

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Initializing database...")
    await init_db()
    print("Database initialized successfully!")
    yield
    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Threat Intelligence Dashboard",
    description="Aggregates IP reputation data from multiple threat intel APIs",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(lookup.router, prefix="/api", tags=["lookup"])
app.include_router(stats.router, prefix="/api", tags=["stats"])


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}
