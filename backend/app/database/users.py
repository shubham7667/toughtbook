from app.database.connection import connect_db


# =========================================================
# GET USER BY EMAIL
# =========================================================

def get_user_by_id(user_id: str):

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
                USER_MOBILE_NUMBER,
                USER_PASSWORD
            FROM manual_login
            WHERE USER_EMAIL_ID = %s
            """,
            (user_id,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# GET USER BY USER ID
# =========================================================

def get_user_by_user_id(user_id: str):

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
                USER_MOBILE_NUMBER,
                USER_PASSWORD
            FROM manual_login
            WHERE USER_ID = %s
            """,
            (user_id,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# CHECK EMAIL
# =========================================================

def get_user_by_email(email: str):

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
                USER_MOBILE_NUMBER,
                USER_PASSWORD
            FROM manual_login
            WHERE USER_EMAIL_ID = %s
            """,
            (email,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# CHECK MOBILE
# =========================================================

def get_user_by_mobile(mobile: str):

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
                USER_MOBILE_NUMBER
            FROM manual_login
            WHERE USER_MOBILE_NUMBER = %s
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
    user_profile: str,
    user_email: str,
    user_mobile: str = None,
    user_password: str = None
):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO manual_login(
                USER_NAME,
                USER_PROFILE_PIC,
                USER_EMAIL_ID,
                USER_MOBILE_NUMBER,
                USER_PASSWORD
            )
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                user_name,
                user_profile,
                user_email,
                user_mobile,
                user_password
            )
        )

        connection.commit()

        return cursor.lastrowid

    finally:
        cursor.close()
        connection.close()