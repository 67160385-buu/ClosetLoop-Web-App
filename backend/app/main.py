from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, ensure_schema_compatibility
from . import models
from .routers import (
    auth,
    users,
    closet,
    marketplace,
    outfits,
    orders,
    admin,
    wishlist,
    notifications
)

# 1. ตรวจสอบและสร้าง/อัปเกรด Schema ใน PostgreSQL ให้พร้อมใช้งานทันที (รองรับทั้ง Local Docker & Render)
try:
    ensure_schema_compatibility()
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[Database Init Warning] {e}")

# 2. เริ่มต้น FastAPI App
app = FastAPI(
    title="ClosetLoop API",
    version="1.1.0",
    description="REST API for ClosetLoop: Virtual Closet, AI Outfit Matching, Marketplace, Multi-Role RBAC, and Single-Item Inventory"
)

# 3. กำหนดค่า CORS ให้รองรับการเชื่อมต่อจาก Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. ลงทะเบียน Routers ทั้งหมด
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(closet.router)
app.include_router(outfits.router)
app.include_router(marketplace.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(wishlist.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {
        "name": "ClosetLoop API",
        "version": "1.1.0",
        "status": "running",
        "features": [
            "Single-Item Inventory (quantity=1, AVAILABLE/SOLD)",
            "Automated Closet Transfer",
            "Multi-Role RBAC (Buyer, Seller, Admin)",
            "Marketplace & Direct Selling APIs",
            "Wishlist & Saved Looks APIs",
            "Notification Bell API",
            "Admin Oversight Endpoints"
        ]
    }

@app.get("/health")
def health():
    return {"status": "OK"}