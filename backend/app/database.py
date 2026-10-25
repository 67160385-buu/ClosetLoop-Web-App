import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://closetloop:closetloop123@localhost:5432/closetloop"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_schema_compatibility():
    """
    ตรวจความพร้อมของ PostgreSQL Schema (เข้ากันได้ทั้ง Local Docker และ Render Database)
    เพิ่มคอลัมน์ใหม่ในตารางที่มีอยู่แล้วแบบ Idempotent ป้องกัน Error ตอนรัน migrations
    """
    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'buyer';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(10);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expires_at TIMESTAMP;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'top';",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS condition VARCHAR(100) DEFAULT 'สภาพดี 90%';",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS size VARCHAR(20) DEFAULT 'M';",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(50) DEFAULT 'neutral';",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS flag_reason VARCHAR(255);",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT DEFAULT '';",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'promptpay';",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100) DEFAULT '';",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier VARCHAR(100) DEFAULT '';",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS slip_url VARCHAR(500) DEFAULT '';",
    ]
    try:
        with engine.begin() as conn:
            for stmt in statements:
                conn.execute(text(stmt))
    except Exception as e:
        print(f"[Schema Check Warning] {e}")
