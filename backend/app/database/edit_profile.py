import json

from app.database.connection import connect_db


def get_user_profile_by_user_id(user_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        for table_name in ("user_profile", "user_profile_details", "user_details", "user_detail"):
            try:
                cursor.execute(
                    f"""
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
                    FROM {table_name}
                    WHERE USER_ID = %s
                    """,
                    (user_id,),
                )

                row = cursor.fetchone()
                if row:
                    languages_value = row.get("LANGUAGES") or row.get("languages") or "[]"
                    interests_value = row.get("INTERESTS") or row.get("interests") or "[]"

                    return {
                        "bio": row.get("BIO") or row.get("bio") or "",
                        "quote": row.get("QUOTE") or row.get("quote") or "",
                        "location": row.get("LOCATION") or row.get("location") or "",
                        "website": row.get("WEBSITE") or row.get("website") or "",
                        "twitter": row.get("TWITTER") or row.get("twitter") or "",
                        "instagram": row.get("INSTAGRAM") or row.get("instagram") or "",
                        "languages": json.loads(languages_value) if isinstance(languages_value, str) else (languages_value or []),
                        "interests": json.loads(interests_value) if isinstance(interests_value, str) else (interests_value or []),
                        "private_profile": bool(row.get("PRIVATE_PROFILE") or row.get("private_profile")),
                        "show_activity": bool(row.get("SHOW_ACTIVITY") or row.get("show_activity")),
                        "notify_followers": bool(row.get("NOTIFY_FOLLOWERS") or row.get("notify_followers")),
                    }
            except Exception:
                continue

        return None

    finally:
        cursor.close()
        connection.close()


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
    notify_followers
):
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
                    user_id
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
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                    notify_followers
                )
            )

        connection.commit()

    finally:
        cursor.close()
        connection.close()
        
        
def get_user_profile(user_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        for table_name in ("user_profile", "user_profile_details"):
            try:
                cursor.execute(
                    f"""
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
                    FROM {table_name}
                    WHERE USER_ID = %s
                    """,
                    (user_id,)
                )

                row = cursor.fetchone()
                if row:
                    return row
            except Exception:
                continue

        return None

    finally:
        cursor.close()
        connection.close()