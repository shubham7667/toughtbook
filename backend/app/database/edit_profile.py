import json

from app.database.connection import connect_db


# =========================================================
# GET USER PROFILE BY USER ID
# =========================================================

def get_user_profile_by_user_id(user_id):

    user_id = int(user_id)

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                BIO,
                QUOTE,
                LOCATION,
                WEBSITE,
                TWITTER,
                INSTAGRAM,
                LANGUAGES,
                INTERESTS,
                PRIVATE_PROFILE,
                SHOW_ACTIVITY,
                NOTIFY_FOLLOWERS
            FROM user_profile
            WHERE USER_ID = %s
            """,
            (user_id,)
        )

        row = cursor.fetchone()

        if not row:
            return None

        languages = row.get("LANGUAGES")
        interests = row.get("INTERESTS")

        if isinstance(languages, str):
            languages = json.loads(languages)

        if isinstance(interests, str):
            interests = json.loads(interests)

        return {
            "bio": row.get("BIO") or "",
            "quote": row.get("QUOTE") or "",
            "location": row.get("LOCATION") or "",
            "website": row.get("WEBSITE") or "",
            "twitter": row.get("TWITTER") or "",
            "instagram": row.get("INSTAGRAM") or "",

            "languages": languages if languages is not None else [],
            "interests": interests if interests is not None else [],

            "private_profile": (
                bool(row["PRIVATE_PROFILE"])
                if row.get("PRIVATE_PROFILE") is not None
                else False
            ),

            "show_activity": (
                bool(row["SHOW_ACTIVITY"])
                if row.get("SHOW_ACTIVITY") is not None
                else True
            ),

            "notify_followers": (
                bool(row["NOTIFY_FOLLOWERS"])
                if row.get("NOTIFY_FOLLOWERS") is not None
                else True
            ),
        }

    finally:
        cursor.close()
        connection.close()


# =========================================================
# SAVE USER PROFILE
# =========================================================

def save_user_profile(
    user_id,
    bio,
    quote,
    location,
    website,
    twitter,
    instagram,
    languages,
    interests,
    private_profile,
    show_activity,
    notify_followers,
):

    user_id = int(user_id)

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT PROFILE_ID
            FROM user_profile
            WHERE USER_ID = %s
            """,
            (user_id,)
        )

        existing_profile = cursor.fetchone()

        if existing_profile:

            cursor.execute(
                """
                UPDATE user_profile
                SET
                    BIO = %s,
                    QUOTE = %s,
                    LOCATION = %s,
                    WEBSITE = %s,
                    TWITTER = %s,
                    INSTAGRAM = %s,
                    LANGUAGES = %s,
                    INTERESTS = %s,
                    PRIVATE_PROFILE = %s,
                    SHOW_ACTIVITY = %s,
                    NOTIFY_FOLLOWERS = %s
                WHERE USER_ID = %s
                """,
                (
                    bio,
                    quote,
                    location,
                    website,
                    twitter,
                    instagram,
                    languages,
                    interests,
                    private_profile,
                    show_activity,
                    notify_followers,
                    user_id,
                )
            )

        else:

            cursor.execute(
                """
                INSERT INTO user_profile (
                    USER_ID,
                    BIO,
                    QUOTE,
                    LOCATION,
                    WEBSITE,
                    TWITTER,
                    INSTAGRAM,
                    LANGUAGES,
                    INTERESTS,
                    PRIVATE_PROFILE,
                    SHOW_ACTIVITY,
                    NOTIFY_FOLLOWERS
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s
                )
                """,
                (
                    user_id,
                    bio,
                    quote,
                    location,
                    website,
                    twitter,
                    instagram,
                    languages,
                    interests,
                    private_profile,
                    show_activity,
                    notify_followers,
                )
            )

        connection.commit()

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


# =========================================================
# GET COMPLETE USER PROFILE
# =========================================================

def get_user_profile(user_id):

    user_id = int(user_id)

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                PROFILE_ID,
                USER_ID,
                BIO,
                QUOTE,
                LOCATION,
                WEBSITE,
                TWITTER,
                INSTAGRAM,
                LANGUAGES,
                INTERESTS,
                PRIVATE_PROFILE,
                SHOW_ACTIVITY,
                NOTIFY_FOLLOWERS
            FROM user_profile
            WHERE USER_ID = %s
            """,
            (user_id,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()