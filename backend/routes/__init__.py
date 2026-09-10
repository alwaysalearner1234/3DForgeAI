from .generate import router as generate_router
from .status import router as status_router
from .result import router as result_router

__all__ = ["generate_router", "status_router", "result_router"]
