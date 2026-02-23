from transliterate import translit
import re
from fastapi import APIRouter, HTTPException, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.models.user import User
from app.db.session import get_write_session, get_read_session
from app.services.stats import increment_daily_user_stat
from app.services.auth import create_session, hash_password, delete_session
import httpx
from app.core.settings import settings
from pydantic import BaseModel
import secrets
import json
from urllib.parse import unquote

router = APIRouter()


class GoogleLoginPayload(BaseModel):
    id_token: str
    state: str | None = None


class FacebookLoginPayload(BaseModel):
    user: dict
    state: str | None = None


# ------------------------------
# Google login
# ------------------------------
@router.post("/google-login")
async def google_login(
    payload: GoogleLoginPayload,
    request: Request,
    db_read: AsyncSession = Depends(get_read_session),
    db_write: AsyncSession = Depends(get_write_session),
):
    # Extract dynamic redirect from state
    redirect_to = "/profile"
    if payload.state:
        try:
            redirect_to = json.loads(unquote(payload.state)).get("from", "/profile")
        except Exception:
            redirect_to = "/profile"

    # Extract anonymous_session_id from cookies
    anon_session_id = None
    cookie_header = request.headers.get("cookie")
    if cookie_header:
        from http.cookies import SimpleCookie

        cookies = SimpleCookie(cookie_header)
        if "anonymous_session_id" in cookies:
            anon_session_id = cookies["anonymous_session_id"].value

    # Verify Google ID token
    id_token = payload.id_token
    verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(verify_url)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google ID token",
            )
        data = resp.json()

    if data.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid audience in token",
        )

    email = data.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email not available"
        )

    first_name = data.get("given_name", "")
    last_name = data.get("family_name", "")
    profile_picture = data.get("picture")

    # Check if user exists
    result = await db_read.execute(select(User).filter_by(email=email))
    user = result.scalars().first()

    if not user:
        hashed_password = hash_password(secrets.token_urlsafe(16))
        user = User(
            email=email,
            hashed_password=hashed_password,
            role="customer",
            first_name=first_name,
            last_name=last_name,
            profile_picture=profile_picture,
        )
        db_write.add(user)
        await db_write.commit()
        await db_write.refresh(user)

    # Create session
    session_id = await create_session(user)

    return {
        "session_id": session_id,
        "redirect_to": redirect_to,
        "message": "Login successful",
    }


# ------------------------------
# Facebook login
# ------------------------------
@router.post("/facebook-login")
async def facebook_login(
    payload: FacebookLoginPayload,
    request: Request,
    db_read: AsyncSession = Depends(get_read_session),
    db_write: AsyncSession = Depends(get_write_session),
):
    # Extract dynamic redirect from state
    redirect_to = "/profile"
    if payload.state:
        try:
            redirect_to = json.loads(unquote(payload.state)).get("from", "/profile")
        except Exception:
            redirect_to = "/profile"

    # Extract anonymous_session_id from cookies
    anon_session_id = None
    cookie_header = request.headers.get("cookie")
    if cookie_header:
        from http.cookies import SimpleCookie

        cookies = SimpleCookie(cookie_header)
        if "anonymous_session_id" in cookies:
            anon_session_id = cookies["anonymous_session_id"].value

    user_data = payload.user
    email = user_data.get("email")
    fb_id = user_data.get("id")

    if not email and not fb_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Facebook user data must include email or id",
        )

    email = email if email else f"fb_{fb_id}"

    # Split full name into first/last
    name = user_data.get("name", "")
    first_name, last_name = (name.split(" ", 1) + [""])[:2]

    profile_picture = (
        user_data.get("picture", {}).get("data", {}).get("url")
        if "picture" in user_data
        else None
    )

    # Check if user exists
    result = await db_read.execute(select(User).filter_by(email=email))
    user = result.scalars().first()

    if not user:
        hashed_password = hash_password(secrets.token_urlsafe(16))
        user = User(
            email=email,
            hashed_password=hashed_password,
            role="customer",
            first_name=first_name,
            last_name=last_name,
            profile_picture=profile_picture,
        )
        db_write.add(user)
        await db_write.commit()
        await db_write.refresh(user)

    # Create session
    session_id = await create_session(user)

    return {
        "session_id": session_id,
        "redirect_to": redirect_to,
        "message": "Login successful",
    }
