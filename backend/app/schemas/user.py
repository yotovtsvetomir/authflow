import re
from pydantic import BaseModel, EmailStr, validator, constr
from typing import Optional


# --- User Models ---


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    redirect_to: Optional[str] = None

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password needs to be at least 5 characters.")

        return v


class UserRead(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    profile_picture: Optional[str] = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    first_name: constr(min_length=1)
    last_name: constr(min_length=1)
    profile_picture: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

    @validator("new_password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("The password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("The password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("The password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("The password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("The password must contain at least one special character")
        return v
