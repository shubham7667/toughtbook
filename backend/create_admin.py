import sys
from getpass import getpass

from passlib.context import CryptContext

from app.database.connection import connect_db

password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def create_admin(login_id, display_name):
    password = getpass("Create password: ")
    confirm_password = getpass("Confirm password: ")

    if password != confirm_password:
        print("Passwords do not match.")
        return

    if len(password) < 8:
        print("Password must contain at least 8 characters.")
        return

    password_hash = password_context.hash(password)

    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO admin_accounts
            (LOGIN_ID, DISPLAY_NAME, PASSWORD_HASH)
            VALUES (%s, %s, %s)
            """,
            (login_id, display_name, password_hash),
        )

        connection.commit()

        print(f"Admin '{login_id}' created successfully.")

    except Exception as error:
        print("Could not create admin:", error)

    finally:
        cursor.close()
        connection.close()


if len(sys.argv) < 3:
    print('Use: python create_admin.py LOGIN_ID "DISPLAY NAME"')
    raise SystemExit(1)

create_admin(
    login_id=sys.argv[1],
    display_name=sys.argv[2],
)