from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_read_session
from app.db.models.blog import BlogPost
from app.schemas.blog import BlogPostOut

router = APIRouter()

@router.get("/home")
async def get_home(db: AsyncSession = Depends(get_read_session)):
    """
    Get data for homepage:
    - Blog posts (2 latest)
    """

    # Blog posts query
    stmt_blogs = (
        select(BlogPost)
        .order_by(BlogPost.created_at.desc())
        .limit(2)
    )

    result_blogs = await db.execute(stmt_blogs)
    blogs = result_blogs.scalars().all()

    return {
        "blogposts": [BlogPostOut.from_orm(b) for b in blogs],
    }
