from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware


from app.api.admin.admin import router as admin_router
from app.api.admin.analytics import router as admin_analytics_router
from app.api.admin.blogs import router as admin_blogs_router

from app.core.permissions import is_admin_authenticated
from app.api.users.users import router as users_router
from app.api.users.social_auth import router as social_router
from app.api.blogs.blogs import router as blogs_router
from app.api.sitemap import router as sitemap_router
from app.api.home import router as home_router

from app.admin import setup_admin

app = FastAPI()


class AdminAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/admin/login":
            return await call_next(request)

        if request.url.path.startswith("/admin"):
            try:
                await is_admin_authenticated(request.cookies.get("admin_session_id"))
            except Exception:
                return RedirectResponse(url="/admin/login")

        return await call_next(request)


# Middleware
app.add_middleware(SessionMiddleware, secret_key="your-secret-key")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://www.typortfolio.live"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home page all in 1 request
app.include_router(home_router)

# Sitemap
app.include_router(sitemap_router)

# Users Routers
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(social_router, prefix="/users", tags=["users"])

# Admin Routers
app.include_router(admin_router, prefix="/admin", tags=["admin"])
app.include_router(admin_analytics_router, prefix="/admin", tags=["admin"])
app.include_router(admin_blogs_router, prefix="/admin/blogs", tags=["admin"])

# Blogposts routers
app.include_router(blogs_router, prefix="/blogposts", tags=["Blogposts"])

# Add middleware after routers
app.add_middleware(AdminAuthMiddleware)

# Setup SQLAdmin
setup_admin(app)
