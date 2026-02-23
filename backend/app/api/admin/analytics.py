import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import aliased

from app.db.session import get_read_session
from app.db.models.user import User, DailyUserStats

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

ACTIVE_MINUTES = 15

@router.get("/analytics", response_class=HTMLResponse)
async def admin_analytics(
    request: Request, db: AsyncSession = Depends(get_read_session)
):
    now = datetime.now(timezone.utc)
    today = now.date()
    first_day_month = today.replace(day=1)
    first_day_year = today.replace(month=1, day=1)
    window_start = (datetime.now(timezone.utc) - timedelta(minutes=ACTIVE_MINUTES)).replace(tzinfo=None)

    # --- Active users in last 15 minutes ---
    recent_stats_result = await db.execute(
        select(func.count(func.distinct(DailyUserStats.unique_id))).where(
            DailyUserStats.updated_at >= window_start
        )
    )
    active_users_recent = recent_stats_result.scalar() or 0

    # --- Daily unique users ---
    daily_stats_result = await db.execute(
        select(func.count(func.distinct(DailyUserStats.unique_id))).where(
            DailyUserStats.date == today
        )
    )
    active_users_today = daily_stats_result.scalar() or 0

    # --- Monthly unique users ---
    monthly_stats_result = await db.execute(
        select(func.count(func.distinct(DailyUserStats.unique_id))).where(
            DailyUserStats.date >= first_day_month
        )
    )
    active_users_this_month = monthly_stats_result.scalar() or 0

    # --- Total registered customers ---
    total_customers = await db.scalar(
        select(func.count()).select_from(User).filter(User.role == "customer")
    )

    return templates.TemplateResponse(
        "admin/analytics.html",
        {
            "request": request,
            "active_users_recent": active_users_recent,
            "active_users_today": active_users_today,
            "active_users_this_month": active_users_this_month,
            "total_customers": total_customers,
        },
    )
