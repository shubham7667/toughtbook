from app.database.feed import get_user_feed


posts = get_user_feed(6)

print("========== FEED FOR USER 6 ==========")

for post in posts:
    print(post)

print("======================================")