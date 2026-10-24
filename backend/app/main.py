from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from . import models
from .routers import auth, users, closet, marketplace, outfits, orders

Base.metadata.create_all(bind=engine)

# 1. สร้าง app ก่อน
app = FastAPI(
    title="ClosetLoop API",
    version="1.0.0",
    description="REST API for ClosetLoop: Virtual Closet, AI Outfit Matching and Marketplace"
)

import os

# 2. กำหนด รายชื่อ Origins ของ Frontend ที่อนุญาตให้เข้าถึง
cors_env = os.getenv("CORS_ORIGINS", "")
origins = [
    "http://localhost:5173",     # Port หลักของ Vite / React
    "http://127.0.0.1:5173",     # IP แบบ Local
    "http://localhost:3000",     # เผื่อกรณีใช้ Create React App
]
if cors_env:
    for o in cors_env.split(","):
        cleaned = o.strip()
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

# 3. ตั้งค่า CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.onrender\.com",  # อนุญาต Frontend ทุกโดเมนบน Render
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(closet.router)
app.include_router(outfits.router)
app.include_router(marketplace.router)
app.include_router(orders.router)

@app.get("/")
def root():
    return {"name": "ClosetLoop API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "OK"}