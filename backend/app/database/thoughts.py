from .connection import connect_db

# Creating Thought
def insert_thoughtPost(user_id: int, thought: str):

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO thought(
                user_id,
                thought
            )
            VALUES (%s, %s)
            """,
            (
                user_id,
                thought
            )
        )

        connection.commit()

        return cursor.lastrowid

    finally:
        cursor.close()
        connection.close()

# Getting the posts by user_id
def get_post_by_userId(user_id):

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                post_id,
                user_id,
                thought
            FROM thought
            WHERE user_id = %s
            ORDER BY post_id DESC
            """,
            (user_id,)
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()

# Storing the LIKE
def like_thought(thought_id: int, user_id: int):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO thought_likes(
                thought_id,
                user_id
            )
            VALUES (%s, %s)
            """,
            (
                thought_id,
                user_id
            )
        )

        connection.commit()

    finally:
        cursor.close()
        connection.close()

# Removing the LIKE 
def unlike_thought(thought_id: int, user_id: int):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            DELETE FROM thought_likes
            WHERE thought_id = %s
            AND user_id = %s
            """,
            (
                thought_id,
                user_id
            )
        )

        connection.commit()

    finally:
        cursor.close()
        connection.close()

# checking if the user has liked the thought or not
def has_user_liked(
    thought_id: int,
    user_id: int
):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT id
            FROM thought_likes
            WHERE thought_id = %s
            AND user_id = %s
            LIMIT 1
            """,
            (
                thought_id,
                user_id
            )
        )

        return cursor.fetchone() is not None

    finally:
        cursor.close()
        connection.close()


# LIKE count for a specific thought
def get_like_count(thought_id: int):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT COUNT(*) AS like_count
            FROM thought_likes
            WHERE thought_id = %s
            """,
            (thought_id,)
        )

        result = cursor.fetchone()

        return result["like_count"]

    finally:
        cursor.close()
        connection.close()

# Adding a comment to a thought
def add_comment(
    thought_id: int,
    user_id: int,
    comment: str
):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO thought_comments(
                thought_id,
                user_id,
                comment
            )
            VALUES (%s, %s, %s)
            """,
            (
                thought_id,
                user_id,
                comment
            )
        )

        connection.commit()

        return cursor.lastrowid

    finally:
        cursor.close()
        connection.close()

# Retrieving comments for a specific thought
def get_comments(thought_id: int):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT
                c.id AS comment_id,
                c.thought_id,
                c.user_id,
                c.comment,
                c.created_at,
                u.USER_NAME,
                u.USER_PROFILE_PIC
            FROM thought_comments c
            INNER JOIN manual_login u
                ON c.user_id = u.USER_ID
            WHERE c.thought_id = %s
            ORDER BY c.created_at ASC
            """,
            (thought_id,)
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()

# removing a comment from a thought
def delete_comment(
    comment_id: int,
    user_id: int
):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            DELETE FROM thought_comments
            WHERE id = %s
            AND user_id = %s
            """,
            (
                comment_id,
                user_id
            )
        )

        connection.commit()

        return cursor.rowcount > 0

    finally:
        cursor.close()
        connection.close()

# Checking if a thought exists
def thought_exists(thought_id: int):

    connection = connect_db()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT post_id
            FROM thought
            WHERE post_id = %s
            LIMIT 1
            """,
            (thought_id,)
        )

        return cursor.fetchone() is not None

    finally:

        cursor.close()
        connection.close()