from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel
from passlib.context import CryptContext

from app.auth.jwt import generate_admin_jwt
from app.database.connection import connect_db

router = APIRouter(
    prefix="/admin/auth",
    tags=["Admin Authentication"],
)

password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


class AdminLoginSchema(BaseModel):
    login_id: str
    password: str


@router.post("/login")
def admin_login(data: AdminLoginSchema, response: Response):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT ADMIN_ID, LOGIN_ID, DISPLAY_NAME, PASSWORD_HASH, STATUS
            FROM admin_accounts
            WHERE LOGIN_ID = %s
            """,
            (data.login_id.strip(),),
        )

        admin = cursor.fetchone()

    finally:
        cursor.close()
        connection.close()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login ID or password.",
        )

    if admin["STATUS"] != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This administrator account is suspended.",
        )

    if not password_context.verify(data.password, admin["PASSWORD_HASH"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login ID or password.",
        )

    admin_token = generate_admin_jwt(admin["ADMIN_ID"])

    response.set_cookie(
        key="admin_access_token",
        value=admin_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24,
    )

    return {
        "message": "Admin login successful.",
        "admin": {
            "admin_id": admin["ADMIN_ID"],
            "login_id": admin["LOGIN_ID"],
            "display_name": admin["DISPLAY_NAME"],
        },
    }


@router.post("/logout")
def admin_logout(response: Response):
    response.delete_cookie("admin_access_token")

    return {
        "message": "Admin logged out successfully.",
    }