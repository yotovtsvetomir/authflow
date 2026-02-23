from fastapi import Depends, HTTPException, status, Cookie
from app.services.auth import get_session


async def is_authenticated(session_id: str | None = Cookie(None)):
    if not session_id:
        raise HTTPException(status_code=401, detail="Access denied")

    session_data = await get_session(session_id)
    if not session_data:
        raise HTTPException(status_code=401, detail="Access denied")

    email = session_data.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Access denied")

    session_data["session_id"] = session_id
    return session_data


async def is_admin_authenticated(admin_session_id: str | None = Cookie(None)):
    if not admin_session_id:
        raise HTTPException(status_code=401, detail="Access denied")

    session_data = await get_session(admin_session_id)
    if not session_data or session_data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    session_data["session_id"] = admin_session_id
    return session_data


def require_role(required_role: str, session_dep=is_authenticated):
    async def role_checker(current=Depends(session_dep)):
        if current.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        return current

    return role_checker
