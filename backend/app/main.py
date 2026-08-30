from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import assignments, auth, deliveries, dispatcher, retailer, rider
from app.websocket.router import router as websocket_router

app = FastAPI(title="Reflex API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(deliveries.router, prefix="/api/deliveries", tags=["deliveries"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["assignments"])
app.include_router(dispatcher.router, prefix="/api/dispatcher", tags=["dispatcher"])
app.include_router(retailer.router, prefix="/api/retailer", tags=["retailer"])
app.include_router(rider.router, prefix="/api/rider", tags=["rider"])
app.include_router(websocket_router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
