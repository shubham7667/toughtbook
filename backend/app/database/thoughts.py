from .connection import connect_db


def insert_thoughtPost(user_id: int, thought: str):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            '''
            INSERT INTO thought(user_id, thought)
            VALUES(%s, %s)
            ''',
            (user_id, thought)
        )

        connection.commit()
        return cursor.lastrowid

    finally:
        cursor.close()
        connection.close()


def get_post_by_userId(user_id: int):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            '''
            SELECT post_id, user_id, thought
            FROM thought
            WHERE user_id = %s
            ''',
            (user_id,)
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()


def delete_post_by_post_id(post_id: int, user_id: int):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            '''
            DELETE FROM thought
            WHERE post_id = %s AND user_id = %s
            ''',
            (post_id, user_id)
        )

        connection.commit()

        return cursor.rowcount

    finally:
        cursor.close()
        connection.close()