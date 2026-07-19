from .auth import router as auth_router
from .health import router as health_router
from .podcasts import router as podcasts_router

__all__ = ["auth_router", "podcasts_router", "health_router"]
