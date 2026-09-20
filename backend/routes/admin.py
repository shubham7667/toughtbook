from fastapi import APIRouter, HTTPException, Request, status

from app.auth.jwt import decode_jwt
from app.database.connection import connect_db

router = APIRouter(
    prefix="/admin",
    tags=["Admin Dashboard"],
)


def require_admin(request: Request):
    token = request.cookies.get("admin_access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin login required.",
        )

    payload = decode_jwt(token)

    if not payload or payload.get("type") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return payload


@router.get("/summary")
def admin_summary(request: Request):
    require_admin(request)

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute("SELECT COUNT(*) AS total_users FROM user_log_details")
        total_users = cursor.fetchone()["total_users"]

        cursor.execute("SELECT COUNT(*) AS total_thoughts FROM thought")
        total_thoughts = cursor.fetchone()["total_thoughts"]

        return {
            "total_users": total_users,
            "active_users": total_users,
            "total_thoughts": total_thoughts,
            "hidden_thoughts": 0,
        }

    finally:
        cursor.close()
        connection.close()


@router.get("/users")
def get_all_users(request: Request):
    require_admin(request)

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                USER_ID,
                USER_NAME,
                USER_PROFILE_PIC,
                USER_EMAIL_ID,
                'member' AS ROLE,
                'active' AS STATUS,
                NULL AS CREATED_AT
            FROM user_log_details
            ORDER BY USER_ID DESC
            """
        )

        users = cursor.fetchall()

        return {
            "users": users,
        }

    finally:
        cursor.close()
        connection.close()


@router.get("/thoughts")
def get_all_thoughts(request: Request):
    require_admin(request)

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                ROW_NUMBER() OVER (ORDER BY t.user_id DESC) AS THOUGHT_ID,
                t.thought,
                NULL AS CREATED_AT,
                0 AS IS_HIDDEN,
                u.USER_NAME,
                u.USER_EMAIL_ID
            FROM thought t
            INNER JOIN user_log_details u
            ON u.USER_ID = t.user_id
            ORDER BY t.user_id DESC
            """
        )

        thoughts = cursor.fetchall()

        return {
            "thoughts": thoughts,
        }

    finally:
        cursor.close()
        connection.close()