from database.connection import connect_db
from fastapi import HTTPException
import pymysql


def create_follow(following_id, follower_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        # Cannot follow yourself
        if follower_id == following_id:
            raise HTTPException(
                status_code=400,
                detail='Cannot send a follow request to yourself.'
            )

        # Check whether target user's profile is private
        cursor.execute(
            '''
            SELECT PRIVATE_PROFILE
            FROM user_profile
            WHERE user_id = %s
            ''',
            (following_id,)
        )

        is_private = cursor.fetchone()

        if not is_private:
            raise HTTPException(
                status_code=404,
                detail='Failed to find user.'
            )

        if is_private.get('PRIVATE_PROFILE') == 0:
            status = 'accepted'

        elif is_private.get('PRIVATE_PROFILE') == 1:
            status = 'pending'

        else:
            raise HTTPException(
                status_code=404,
                detail='User not available.'
            )

        # Check whether relationship already exists
        cursor.execute(
            '''
            SELECT follower_id, following_id
            FROM follows
            WHERE follower_id = %s
            AND following_id = %s
            ''',
            (follower_id, following_id)
        )

        is_exist = cursor.fetchone()

        if is_exist:
            raise HTTPException(
                status_code=400,
                detail='Relationship already present.'
            )

        # Create relationship
        cursor.execute(
            '''
            INSERT INTO follows(
                follower_id,
                following_id,
                status
            )
            VALUES(%s, %s, %s)
            ''',
            (follower_id, following_id, status)
        )

        connection.commit()

        return cursor.lastrowid

    except HTTPException:
        connection.rollback()
        raise

    except pymysql.IntegrityError as error:
        connection.rollback()

        # Handles duplicate relationship race condition
        if error.args and error.args[0] == 1062:
            raise HTTPException(
                status_code=400,
                detail='Relationship already present.'
            )

        raise HTTPException(
            status_code=500,
            detail='Database integrity error.'
        )

    except pymysql.MySQLError:
        connection.rollback()

        raise HTTPException(
            status_code=500,
            detail='Database error while creating follow relationship.'
        )

    finally:
        cursor.close()
        connection.close()


def create_unfollow(following_id, follower_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        # Check whether relationship exists
        cursor.execute(
            '''
            SELECT follower_id, following_id
            FROM follows
            WHERE follower_id = %s
            AND following_id = %s
            ''',
            (follower_id, following_id)
        )

        is_exist = cursor.fetchone()

        if not is_exist:
            raise HTTPException(
                status_code=404,
                detail='You are not following this person.'
            )

        # Delete relationship
        cursor.execute(
            '''
            DELETE FROM follows
            WHERE follower_id = %s
            AND following_id = %s
            ''',
            (follower_id, following_id)
        )

        connection.commit()

        return {
            'message': f'You have unfollowed user {following_id}.'
        }

    except HTTPException:
        connection.rollback()
        raise

    except pymysql.MySQLError:
        connection.rollback()

        raise HTTPException(
            status_code=500,
            detail='Database error while unfollowing user.'
        )

    finally:
        cursor.close()
        connection.close()


def get_follow_status(follower_id, following_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            '''
            SELECT status
            FROM follows
            WHERE follower_id = %s
            AND following_id = %s
            ''',
            (follower_id, following_id)
        )

        does_exist = cursor.fetchone()

        if not does_exist:
            return 'follow'

        if does_exist.get('status') == 'accepted':
            return 'following'

        elif does_exist.get('status') == 'pending':
            return 'requested'

        return 'follow'

    except pymysql.MySQLError:
        raise HTTPException(
            status_code=500,
            detail='Database error while checking follow status.'
        )

    finally:
        cursor.close()
        connection.close()


def get_followers(user_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            '''
            SELECT follower_id
            FROM follows
            WHERE following_id = %s
            AND status = 'accepted'
            ''',
            (user_id,)
        )

        return cursor.fetchall()

    except pymysql.MySQLError:
        raise HTTPException(
            status_code=500,
            detail='Database error while fetching followers.'
        )

    finally:
        cursor.close()
        connection.close()


def get_following(user_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            '''
            SELECT following_id
            FROM follows
            WHERE follower_id = %s
            AND (
                status = 'accepted'
                OR status = 'pending'
            )
            ''',
            (user_id,)
        )

        return cursor.fetchall()

    except pymysql.MySQLError:
        raise HTTPException(
            status_code=500,
            detail='Database error while fetching following users.'
        )

    finally:
        cursor.close()
        connection.close()


def follower_count(user_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            '''
            SELECT COUNT(follower_id) AS follower_count
            FROM follows
            WHERE following_id = %s
            AND status = 'accepted'
            ''',
            (user_id,)
        )

        count = cursor.fetchone()

        return count.get('follower_count')

    except pymysql.MySQLError:
        raise HTTPException(
            status_code=500,
            detail='Database error while counting followers.'
        )

    finally:
        cursor.close()
        connection.close()


def following_count(user_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            '''
            SELECT COUNT(following_id) AS following_count
            FROM follows
            WHERE follower_id = %s
            AND (
                status = 'accepted'
                OR status = 'pending'
            )
            ''',
            (user_id,)
        )

        count = cursor.fetchone()

        return count.get('following_count')

    except pymysql.MySQLError:
        raise HTTPException(
            status_code=500,
            detail='Database error while counting following users.'
        )

    finally:
        cursor.close()
        connection.close()


def get_pending_request(following_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            '''
            SELECT follower_id, follow_id
            FROM follows
            WHERE following_id = %s
            AND status = 'pending'
            ''',
            (following_id,)
        )

        return cursor.fetchall()

    except pymysql.MySQLError:
        raise HTTPException(
            status_code=500,
            detail='Database error while fetching pending requests.'
        )

    finally:
        cursor.close()
        connection.close()


def accept_follow_request(follow_id, current_user_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        # Find pending request
        cursor.execute(
            '''
            SELECT follow_id, following_id
            FROM follows
            WHERE follow_id = %s
            AND status = 'pending'
            ''',
            (follow_id,)
        )

        does_exist = cursor.fetchone()

        if not does_exist:
            raise HTTPException(
                status_code=404,
                detail='Follow request not found.'
            )

        # Only the user who received the request
        # can accept it
        if does_exist.get('following_id') != current_user_id:
            raise HTTPException(
                status_code=403,
                detail='You are not authorized to accept this follow request.'
            )

        # Accept request
        cursor.execute(
            '''
            UPDATE follows
            SET status = 'accepted'
            WHERE follow_id = %s
            AND status = 'pending'
            ''',
            (follow_id,)
        )

        connection.commit()

        return {
            'message': 'Request accepted.'
        }

    except HTTPException:
        connection.rollback()
        raise

    except pymysql.MySQLError:
        connection.rollback()

        raise HTTPException(
            status_code=500,
            detail='Database error while accepting follow request.'
        )

    finally:
        cursor.close()
        connection.close()


def reject_follow_request(follow_id, current_user_id):
    connection = connect_db()
    cursor = connection.cursor()

    try:
        # Find pending request
        cursor.execute(
            '''
            SELECT follow_id, following_id
            FROM follows
            WHERE follow_id = %s
            AND status = 'pending'
            ''',
            (follow_id,)
        )

        does_exist = cursor.fetchone()

        if not does_exist:
            raise HTTPException(
                status_code=404,
                detail='Follow request not found.'
            )

        # Only the user who received the request
        # can reject it
        if does_exist.get('following_id') != current_user_id:
            raise HTTPException(
                status_code=403,
                detail='You are not authorized to reject this follow request.'
            )

        # Delete pending request
        cursor.execute(
            '''
            DELETE FROM follows
            WHERE follow_id = %s
            AND status = 'pending'
            ''',
            (follow_id,)
        )

        connection.commit()

        return {
            'message': 'Request rejected.'
        }

    except HTTPException:
        connection.rollback()
        raise

    except pymysql.MySQLError:
        connection.rollback()

        raise HTTPException(
            status_code=500,
            detail='Database error while rejecting follow request.'
        )

    finally:
        cursor.close()
        connection.close()