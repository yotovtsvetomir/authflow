from pydantic import BaseModel, Field
from typing import List, Optional, Generic, TypeVar
from datetime import datetime
from pydantic.generics import GenericModel

# ===============================
# Base Blog Schema
# ===============================

class BlogPostBase(BaseModel):
    title: str
    image: Optional[str] = None
    paragraphs: List[str]
    authored_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# ===============================
# Create
# ===============================

class BlogPostCreate(BaseModel):
    title: str
    image: Optional[str] = None
    paragraphs: List[str]
    authored_by: Optional[str] = None


# ===============================
# Update
# ===============================

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    image: Optional[str] = None
    paragraphs: Optional[List[str]] = None
    authored_by: Optional[str] = None


# ===============================
# Output
# ===============================

class BlogPostOut(BlogPostBase):
    id: int
    slug: str

    model_config = {
        "from_attributes": True
    }


# ===============================
# List Query (Pagination + Search)
# ===============================

class BlogPostListQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)
    search: Optional[str] = None
    ordering: str = "-created_at"


# ===============================
# Generic Pagination Response
# ===============================

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    total_count: int
    current_page: int
    page_size: int
    total_pages: int
    items: List[T]


class BlogPostsWithAuthors(PaginatedResponse[BlogPostOut]):
    authors: List[str] = []
