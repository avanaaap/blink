from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import agora, call_invites, health, matching, matches, messages, photos, profiles, ratings, worldid

app = FastAPI(title="Blink API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(worldid.router)
app.include_router(profiles.router)
app.include_router(matches.router)
app.include_router(messages.router)
app.include_router(ratings.router)
app.include_router(photos.router)
app.include_router(matching.router)
app.include_router(agora.router)
app.include_router(call_invites.router)
