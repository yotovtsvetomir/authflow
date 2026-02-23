import re
from fastapi import APIRouter, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from xml.sax.saxutils import escape
from datetime import datetime
from typing import List, Any
from transliterate import translit

from app.core.redis_client import get_redis_client
from app.db.session import get_read_session
from app.db.models.blog import BlogPost
from pydantic import BaseModel

REDIS_KEY = "sitemap_xml"
CACHE_TTL_SECONDS = 24 * 60 * 60  # 24h cache

router = APIRouter()


class UrlEntry(BaseModel):
    loc: str
    lastmod: datetime


def slugifycats(name: str) -> str:
    latin_name = translit(name, reversed=True)
    slug = re.sub(r'[^a-z0-9]+', '-', latin_name.lower()).strip('-')
    return slug


@router.get("/sitemap.xml", response_class=Response)
async def sitemap(
    db: AsyncSession = Depends(get_read_session),
    redis: Any = Depends(get_redis_client),
):
    # --- Try cached sitemap ---
    cached_sitemap = await redis.get(REDIS_KEY)
    if cached_sitemap:
        return Response(content=cached_sitemap, media_type="application/xml")

    base_url = "https://www.authflow.com"
    urls: List[UrlEntry] = []

    # --- Static pages ---
    static_pages = [
        "/", "/blogposts", "/privacy", "/cookies", "/data-deletion"
    ]
    for page in static_pages:
        urls.append(UrlEntry(loc=f"{base_url}{page}", lastmod=datetime.utcnow()))

    # --- Blog posts ---
    result_posts = await db.execute(select(BlogPost))
    posts: List[BlogPost] = result_posts.scalars().all()
    for post in posts:
        urls.append(
            UrlEntry(
                loc=f"{base_url}/blogposts/{post.slug}",
                lastmod=post.updated_at or post.created_at or datetime.utcnow()
            )
        )

    # --- Build XML ---
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    for url in urls:
        loc_escaped = escape(url.loc, entities={"'": "&apos;", '"': "&quot;"})
        xml += "  <url>\n"
        xml += f"    <loc>{loc_escaped}</loc>\n"
        xml += f"    <lastmod>{url.lastmod.date()}</lastmod>\n"
        xml += "  </url>\n"
    xml += "</urlset>"

    # --- Cache in Redis ---
    await redis.set(REDIS_KEY, xml, ex=CACHE_TTL_SECONDS)

    return Response(content=xml, media_type="application/xml")


@router.get("/sitemap/flush")
async def flush_sitemap_cache(redis: Any = Depends(get_redis_client)):
    await redis.delete(REDIS_KEY)
    return {"status": "ok", "message": "Sitemap cache cleared"}
