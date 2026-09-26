from app.database.connection import connect_db

# retrieving a user by their user_id
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

# retrieving a user by their email
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

# retrieving a user by their mobile number
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

# creating a new user in the database
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