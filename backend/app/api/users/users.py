import aiodns
from datetime import datetime, timedelta
import uuid
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Cookie,
    Request,
    File,
    UploadFile,
)
from urllib.parse import quote, unquote
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update

from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from app.core.permissions import require_role
from app.core.settings import settings
from app.db.session import get_read_session, get_write_session
from app.db.models.user import User, PasswordResetToken, DailyUserStats
from app.schemas.user import (
    UserRead,
    UserLogin,
    UserCreate,
    UserUpdate,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from app.services.email import send_email, render_email
from app.services.stats import increment_daily_user_stat
from app.services.s3.profile_picture import ProfilePictureService
from app.services.auth import (
    authenticate_user,
    create_session,
    update_session_data,
    delete_session,
    extend_session_expiry,
    create_anonymous_session,
    create_user,
    hash_password,
)

router = APIRouter()

serializer = URLSafeTimedSerializer(settings.SECRET_KEY)


async def check_email_mx(email: str) -> bool:
    domain = email.split("@")[-1]
    resolver = aiodns.DNSResolver()
    try:
        result = await resolver.query(domain, "MX")
        return len(result) > 0
    except aiodns.error.DNSError:
        return False


# ------------------------------
# Registration
# ------------------------------
@router.post("/")
async def register(
    user_create: UserCreate,
    request: Request,
    anonymous_session_id: str | None = Cookie(None),
    db_read: AsyncSession = Depends(get_read_session),
    db_write: AsyncSession = Depends(get_write_session),
):
    if not await check_email_mx(user_create.email):
        raise HTTPException(status_code=400, detail="The email is invalid.")

    existing_user = (
        (await db_read.execute(select(User).where(User.email == user_create.email)))
        .scalars()
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400, detail="An account with this email already exists."
        )

    user = await create_user(user_create, db_write)

    # -------------------- Send Confirmation Email --------------------
    raw_token = serializer.dumps(user.email, salt="email-confirm-salt")

    # Include redirect_to as a query parameter if provided
    redirect_param = f"&from={quote(user_create.redirect_to)}" if user_create.redirect_to else ""
    confirmation_link = f"{settings.FRONTEND_BASE_URL}/confirm-email/{quote(raw_token)}/?{redirect_param}"

    html_content = render_email(
        "customers/emails/email_confirmation.html",
        {
            "first_name": user.first_name or user.email,
            "confirm_url": confirmation_link,
            "logo_url": f"{settings.FRONTEND_BASE_URL}/logo.png",
        },
    )

    send_email(
        to=user.email,
        subject="Confirm Your Email",
        body=f"Hello {user.first_name or user.email}, please confirm your email: {confirmation_link}",
        html=html_content,
    )

    return {
        "message": "Registration successful",
    }

# ------------------------------
# Confirm Email
# ------------------------------
@router.get("/confirm-email/{token}")
async def confirm_email(token: str, db_write: AsyncSession = Depends(get_write_session)):
    try:
        email = serializer.loads(token, salt="email-confirm-salt", max_age=86400)
    except SignatureExpired:
        raise HTTPException(status_code=400, detail="Confirmation link expired")
    except BadSignature:
        raise HTTPException(status_code=400, detail="Invalid confirmation link")

    result = await db_write.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.active:
        return {"message": "Email already confirmed"}

    user.active = True
    db_write.add(user)
    await db_write.commit()
    await db_write.refresh(user)

    html_content = render_email(
        "customers/emails/welcome.html",
        {
            "first_name": user.first_name or user.email,
            "email": user.email,
            "provider": getattr(user_create, "provider", None),
            "logo_url": f"{settings.FRONTEND_BASE_URL}/logo.png",
        },
    )

    send_email(
        to=user.email,
        subject="Welcome to Authflow",
        body=f"Welcome, {user.first_name or user.email}!",
        html=html_content,
    )

    return {"message": "Email confirmed successfully"}

# ------------------------------
# Login
# ------------------------------
@router.post("/login")
async def login(
    form_data: UserLogin,
    request: Request,
    anonymous_session_id: str | None = Cookie(None),
    db_read: AsyncSession = Depends(get_read_session),
    db_write: AsyncSession = Depends(get_write_session),
):
    user = await authenticate_user(form_data.email, form_data.password, db_read)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please confirm your email before logging in."
        )

    if user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to log in.",
        )

    # Delete any anonymous session on login
    if anonymous_session_id:
        await delete_session(anonymous_session_id, anonymous=True)

    # Create user session
    session_id = await create_session(user)
    expires_at = datetime.utcnow() + timedelta(seconds=settings.SESSION_EXPIRE_SECONDS)

    # Use the existing unique_id cookie (or fallback to user id if missing)
    unique_id = request.cookies.get("unique_id") or str(user.id)
    await increment_daily_user_stat(unique_id, db_write)

    return {
        "session_id": session_id,
        "unique_id": unique_id,
        "message": "Login successful",
        "expires_at": expires_at.isoformat() + "Z",
    }


# ------------------------------
# Get current user
# ------------------------------
@router.get("/me", response_model=UserRead)
async def get_me(
    session_data: dict = Depends(require_role("customer")),
    db_read: AsyncSession = Depends(get_read_session),
):
    email = session_data.get("email")
    result = await db_read.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="You do not have permission")
    return user


# ------------------------------
# Update profile
# ------------------------------
@router.patch("/me", response_model=UserUpdate)
async def update_profile(
    request: Request,
    profile_picture: UploadFile | None = File(None),
    session_data: dict = Depends(require_role("customer")),
    db_write: AsyncSession = Depends(get_write_session),
):
    email = session_data.get("email")

    if request.headers.get("content-type", "").startswith("application/json"):
        body = await request.json()
        first_name = body.get("first_name")
        last_name = body.get("last_name")
    else:
        form = await request.form()
        first_name = form.get("first_name")
        last_name = form.get("last_name")
        if not profile_picture and "profile_picture" in form:
            profile_picture = form["profile_picture"]

    result = await db_write.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name

    if profile_picture:
        profile_service = ProfilePictureService()
        if user.profile_picture:
            try:
                await profile_service._delete(user.profile_picture)
            except Exception as e:
                print(f"Failed to delete old profile picture: {e}")
        url = await profile_service.upload_profile_picture(profile_picture)
        user.profile_picture = url

    db_write.add(user)
    await db_write.commit()
    await db_write.refresh(user)
    await update_session_data(session_data["session_id"], user)

    return UserUpdate(
        first_name=user.first_name,
        last_name=user.last_name,
        profile_picture=user.profile_picture,
    )


# ------------------------------
# Logout
# ------------------------------
@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    session_id: str | None = Cookie(None),
    _=Depends(require_role("customer")),
):
    if not session_id:
        raise HTTPException(status_code=401, detail="No session found")

    await delete_session(session_id)
    return


# ------------------------------
# Refresh session
# ------------------------------
@router.post("/refresh-session")
async def refresh_session(
    session_id: str | None = Cookie(None),
    _=Depends(require_role("customer")),
):
    if not session_id:
        raise HTTPException(status_code=401, detail="No session found")

    updated = await extend_session_expiry(session_id)
    if not updated:
        raise HTTPException(
            status_code=401, detail="Error updating the session"
        )

    return {"message": "Session has been refreshed", "session_id": session_id}


BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

# ------------------------------
# Password reset
# ------------------------------
@router.post("/password-reset/request")
async def password_reset_request(
    request: PasswordResetRequest,
    db_read: AsyncSession = Depends(get_read_session),
    db_write: AsyncSession = Depends(get_write_session),
):
    result = await db_read.execute(select(User).filter(User.email == request.email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=404, detail="An account with this email does not exist."
        )

    if user.role != "customer":
        raise HTTPException(
            status_code=403, detail="You do not have permission to perform this action."
        )

    # Keep token in Base64 / Latin letters only
    raw_token = serializer.dumps(user.email, salt="password-reset-salt")
    reset_token = PasswordResetToken(user_id=user.id, token=raw_token)
    db_write.add(reset_token)
    await db_write.commit()

    reset_link = f"{settings.FRONTEND_BASE_URL}/password-reset/{quote(raw_token)}/"

    html_content = render_email(
        "/customers/emails/password_reset.html",
        {
            "first_name": user.first_name,
            "reset_url": reset_link,
            "logo_url": f"{settings.FRONTEND_BASE_URL}/logo.png",
        },
    )

    subject = "Password Reset"
    plain_body = (
        f"Hello {user.first_name or user.email},\n\n"
        f"Click the link to reset your password:\n{reset_link}"
    )

    send_email(to=user.email, subject=subject, body=plain_body, html=html_content)
    return {"message": "A link to reset your password has been sent to your email."}


@router.post("/password-reset/confirm")
async def password_reset_confirm(
    data: PasswordResetConfirm,
    db_write: AsyncSession = Depends(get_write_session),
):
    raw_token = unquote(data.token)

    try:
        email = serializer.loads(
            raw_token,
            salt="password-reset-salt",
            max_age=settings.RESET_TOKEN_EXPIRE_SECONDS,
        )
    except (SignatureExpired, BadSignature):
        raise HTTPException(status_code=400, detail="Invalid token")

    result = await db_write.execute(
        select(PasswordResetToken).where(
            (PasswordResetToken.token == raw_token) & (~PasswordResetToken.used)
        )
    )
    reset_token = result.scalars().first()
    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid token")

    result = await db_write.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="An account with this email does not exist.")

    if user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action.",
        )

    user.hashed_password = hash_password(data.new_password)
    reset_token.used = True
    await db_write.commit()

    return {"message": "Password has been successfully changed."}


# ------------------------------
# Anonymous session
# ------------------------------
@router.post("/anonymous-session")
async def create_anon_session(
    request: Request,
    session: AsyncSession = Depends(get_write_session),
):
    session_id = await create_anonymous_session()
    expires_at = datetime.utcnow() + timedelta(seconds=settings.SESSION_EXPIRE_SECONDS)
    unique_id = request.cookies.get("unique_id")
    if not unique_id:
        unique_id = str(uuid.uuid4())

    await increment_daily_user_stat(unique_id, session)

    return {
        "anonymous_session_id": session_id,
        "unique_id": unique_id,
        "message": "Anonymous session created",
        "expires_at": expires_at.isoformat() + "Z",
    }


# ------------------------------
# Mark user as active
# ------------------------------
@router.post("/mark-active")
async def mark_active(
    request: Request,
    session: AsyncSession = Depends(get_write_session),
):
    # Get unique_id from cookies or generate a new one
    unique_id = request.cookies.get("unique_id")
    if not unique_id:
        unique_id = str(uuid.uuid4())

    # Ensure the daily record exists
    await increment_daily_user_stat(unique_id, session)

    # Update the updated_at timestamp for today
    today = datetime.utcnow().date()
    stmt = (
        update(DailyUserStats)
        .where(DailyUserStats.date == today)
        .where(DailyUserStats.unique_id == unique_id)
        .values(updated_at=datetime.utcnow())
    )

    await session.execute(stmt)
    await session.commit()

    return {
        "status": "ok",
        "unique_id": unique_id,
        "last_active": datetime.utcnow().isoformat() + "Z",
    }
