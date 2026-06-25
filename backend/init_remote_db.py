import sys
import os

# Set environment variables for the remote database
os.environ['DATABASE_URL'] = 'mysql+pymysql://sql12831314:arGjNnigFb@sql12.freesqldatabase.com:3306/sql12831314'
os.environ['DB_HOST'] = 'sql12.freesqldatabase.com'
os.environ['DB_PORT'] = '3306'
os.environ['DB_USER'] = 'sql12831314'
os.environ['DB_PASSWORD'] = 'arGjNnigFb'
os.environ['DB_NAME'] = 'sql12831314'

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app_sqlalchemy_backup import db, app

print("[1/3] Creating database tables on remote MySQL...")
with app.app_context():
    db.create_all()
print("[OK] Tables created successfully!")

print("[2/3] Seeding base database (schemes, categories, default users)...")
try:
    import populate_db
    print("[OK] Base database seeded successfully!")
except Exception as e:
    print(f"[WARN] Base database seeding encountered an issue (possibly already seeded): {e}")

print("[3/3] Seeding high risk users...")
try:
    import seed_high_risk
    print("[OK] High-risk users seeded successfully!")
except Exception as e:
    print(f"[WARN] High-risk users seeding encountered an issue: {e}")

print("All initialization and seeding processes completed!")
