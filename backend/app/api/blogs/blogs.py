from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List

from app.core.permissions import is_authenticated
from app.db.session import get_read_session
from app.db.models.blog import BlogPost
from app.schemas.blog import BlogPostOut, BlogPostsWithAuthors
from app.services.pagination import paginate
from app.services.search import apply_filters_search_ordering

router = APIRouter()


# ==========================================
# List Blog Posts (Pagination + Search + Authors)
# ==========================================
@router.get("/", response_model=BlogPostsWithAuthors)
async def list_blog_posts_with_authors(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    author: Optional[str] = None,
    ordering: str = "-created_at",
    db: AsyncSession = Depends(get_read_session),
    current_user=Depends(is_authenticated)
):
    """
    Get paginated blog posts with optional search (title),
    filter by author, ordering, and return distinct authors in the same response.
    """

    # Base filters
    filters = []
    if author:
        filters.append(BlogPost.authored_by == author)

    # Apply search on title
    filters, order_by = await apply_filters_search_ordering(
        model=BlogPost,
        db=db,
        search=search,
        search_columns=[
            BlogPost.title,
        ],
        filters=filters,
        ordering=ordering,
    )

    # Paginate results
    paginated = await paginate(
        model=BlogPost,
        db=db,
        page=page,
        page_size=page_size,
        extra_filters=filters,
        ordering=order_by,
        schema=BlogPostOut,
    )

    # Get distinct authors in one query
    result = await db.execute(select(func.distinct(BlogPost.authored_by)))
    authors = [a[0] for a in result.all() if a[0]]

    # Combine into single response
    return BlogPostsWithAuthors(**paginated, authors=authors)


# ==========================================
# Get Single Blog Post
# ==========================================
@router.get("/{slug}", response_model=BlogPostOut)
async def get_blog_post(
    slug: str,
    db: AsyncSession = Depends(get_read_session),
    current_user=Depends(is_authenticated)
):
    result = await db.execute(select(BlogPost).where(BlogPost.slug == slug))
    post = result.scalars().first()

    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    return post
