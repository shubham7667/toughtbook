from app.database.connection import connect_db


# =========================================================
# GET USER BY EMAIL
# =========================================================

def get_user_by_email(email: str):

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                user_id,
                user_name,
                user_email_id,
                user_password,
                user_mobile_number,
                user_profile_pic,
                user_cover_pic,
                auth_provider
            FROM users
            WHERE user_email_id = %s
            """,
            (email,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()

# GET USER BY USER ID

def get_user_by_id(user_id: int):

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                user_id,
                user_name,
                user_email_id,
                user_password,
                user_mobile_number,
                user_profile_pic,
                user_cover_pic,
                auth_provider
            FROM users
            WHERE user_id = %s
            """,
            (user_id,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# GET USER BY MOBILE NUMBER
# =========================================================

def get_user_by_mobile(mobile: str):

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                user_id,
                user_name,
                user_email_id,
                user_password,
                user_mobile_number,
                user_profile_pic,
                user_cover_pic,
                auth_provider
            FROM users
            WHERE user_mobile_number = %s
            """,
            (mobile,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# CREATE USER
# =========================================================

def create_user(
    user_name: str,
    user_email: str,
    user_password: str | None = None,
    user_mobile: str | None = None,
    user_profile_pic: str | None = None,
    user_cover_pic: str | None = None,
    auth_provider: str = "email"
):

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO users (
                user_name,
                user_email_id,
                user_password,
                user_mobile_number,
                user_profile_pic,
                user_cover_pic,
                auth_provider
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_name,
                user_email,
                user_password,
                user_mobile,
                user_profile_pic,
                user_cover_pic,
                auth_provider
            )
        )

        connection.commit()

        return cursor.lastrowid

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


# =========================================================
# SEARCH USERS
# =========================================================

def search_users(search_text: str, current_user_id: int):

    search_text = search_text.strip()

    if not search_text:
        return []

    connection = connect_db()
    cursor = connection.cursor()

    try:
        search_pattern = f"%{search_text}%"

        cursor.execute(
            """
            SELECT
                user_id,
                user_name,
                user_profile_pic,
                user_email_id
            FROM users
            WHERE user_id != %s
              AND (
                  user_name LIKE %s
                  OR user_email_id LIKE %s
              )
            ORDER BY user_name ASC
            LIMIT 20
            """,
            (
                int(current_user_id),
                search_pattern,
                search_pattern
            )
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()