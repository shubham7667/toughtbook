from .connection import connect_db


def get_user_feed(current_user_id: int):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT
                t.post_id,
                t.user_id,
                t.thought,
                u.USER_NAME,
                u.USER_PROFILE_PIC
            FROM thought t

            JOIN user_log_details u
                ON u.USER_ID = t.user_id

            WHERE
                t.user_id = %s

                OR EXISTS (
                    SELECT 1
                    FROM follows f
                    WHERE f.follower_id = %s
                    AND f.following_id = t.user_id
                    AND f.status = 'accepted'
                )

            ORDER BY t.post_id DESC
            """,
            (
                current_user_id,
                current_user_id
            )
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()