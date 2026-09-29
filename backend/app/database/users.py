from app.database.connection import connect_db


# =========================================================
# GOOGLE / GLOBAL USER
# =========================================================

def get_google_user_by_email(email: str):

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
                USER_COVER_PIC
            FROM user_log_details
            WHERE USER_EMAIL_ID = %s
            """,
            (email,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


def create_google_user(
    user_name: str,
    user_profile: str,
    user_email: str
):

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO user_log_details(
                USER_NAME,
                USER_PROFILE_PIC,
                USER_EMAIL_ID
            )
            VALUES (%s, %s, %s)
            """,
            (
                user_name,
                user_profile,
                user_email
            )
        )

        connection.commit()

        return cursor.lastrowid

    finally:
        cursor.close()
        connection.close()


# =========================================================
# GLOBAL USER BY USER ID
# =========================================================

def get_global_user_by_id(user_id: int):

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                USER_ID,
                USER_NAME,
                USER_PROFILE_PIC,
                USER_COVER_PIC,
                USER_EMAIL_ID
            FROM user_log_details
            WHERE USER_ID = %s
            """,
            (user_id,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# MANUAL LOGIN USER
# =========================================================

def get_manual_user_by_email(email: str):

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                USER_ID,
                USER_NAME,
                USER_PROFILE_PIC,
                USER_COVER_PIC,
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


def get_manual_user_by_mobile(mobile: str):

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                USER_ID,
                USER_NAME,
                USER_PROFILE_PIC,
                USER_COVER_PIC,
                USER_EMAIL_ID,
                USER_MOBILE_NUMBER,
                USER_PASSWORD
            FROM manual_login
            WHERE USER_MOBILE_NUMBER = %s
            """,
            (mobile,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()

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
                USER_ID,
                USER_NAME,
                USER_PROFILE_PIC,
                USER_EMAIL_ID
            FROM user_log_details
            WHERE USER_ID != %s
              AND (
                  USER_NAME LIKE %s
                  OR USER_EMAIL_ID LIKE %s
              )
            ORDER BY USER_NAME ASC
            LIMIT 20
            """,
            (
                int(current_user_id),
                search_pattern,
                search_pattern,
            ),
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# CREATE MANUAL USER
# =========================================================

def create_manual_user(
    user_name: str,
    user_email: str,
    user_mobile: str,
    user_password: str
):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        # ---------------------------------------------
        # STEP 1
        # Create the global user identity
        # ---------------------------------------------

        cursor.execute(
            """
            INSERT INTO user_log_details(
                USER_NAME,
                USER_PROFILE_PIC,
                USER_EMAIL_ID
            )
            VALUES (%s, %s, %s)
            """,
            (
                user_name,
                None,
                user_email
            )
        )

        global_user_id = cursor.lastrowid

        # ---------------------------------------------
        # STEP 2
        # Store manual login credentials
        # using the SAME USER_ID
        # ---------------------------------------------

        cursor.execute(
            """
            INSERT INTO manual_login(
                USER_ID,
                USER_NAME,
                USER_PROFILE_PIC,
                USER_EMAIL_ID,
                USER_MOBILE_NUMBER,
                USER_PASSWORD
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                global_user_id,
                user_name,
                None,
                user_email,
                user_mobile,
                user_password
            )
        )

        # ---------------------------------------------
        # STEP 3
        # Commit both operations together
        # ---------------------------------------------

        connection.commit()

        return global_user_id

    except Exception:

        # If either insert fails,
        # don't leave half-created user data.
        connection.rollback()

        raise

    finally:
        cursor.close()
        connection.close()