import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from pwdlib import PasswordHash
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .models import User

SECRET = os.getenv("JWT_SECRET", "closetloop-development-secret-change-me")
ALGORITHM = "HS256"
password_hash = PasswordHash.recommended()
bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return password_hash.verify(password, hashed)

def create_access_token(user_id: int, role: str = "buyer", is_admin: bool = False) -> str:
    """
    สร้าง JWT Token แนบข้อมูล role และ is_admin เข้าไปใน Payload
    เพื่อให้ Frontend สามารถตรวจสอบสิทธิ์การใช้งาน (RBAC) ได้ทันที
    """
    payload = {
        "sub": str(user_id),
        "role": role,
        "is_admin": is_admin or (role == "admin"),
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        payload = jwt.decode(credentials.credentials, SECRET, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# -------------------------------------------------------------------------
# RBAC Middleware / Dependencies (ระบบจัดการสิทธิ์ผู้ใช้งาน 3 บทบาท)
# -------------------------------------------------------------------------
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Auth Middleware ตรวจสอบสิทธิ์ Admin:
    บล็อกไม่ให้ผู้ใช้ทั่วไป (Buyer, Seller) เข้าถึง Route ฝั่ง Admin ได้
    """
    if current_user.role != "admin" and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required (สงวนสิทธิ์เฉพาะผู้ดูแลระบบเท่านั้น)"
        )
    return current_user

def require_seller(current_user: User = Depends(get_current_user)) -> User:
    """
    Auth Middleware ตรวจสอบสิทธิ์ Seller หรือ Admin
    """
    if current_user.role not in ["seller", "admin"] and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller access required (สงวนสิทธิ์สำหรับ Seller หรือ Admin เท่านั้น)"
        )
    return current_user

def require_role(*roles: str):
    """
    Middleware Factory สำหรับกำหนดสิทธิ์ Role แบบยืดหยุ่น เช่น require_role('seller', 'admin')
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(roles)}"
            )
        return current_user
    return role_checker

def create_password_reset_token(email: str, expires_delta: timedelta | None = None) -> str:
    """
    สร้าง JWT Token สำหรับรีเซ็ตรหัสผ่าน โดยกำหนดอายุตามที่ระบุ (ค่าเริ่มต้น 15 นาที)
    และกำหนด type="reset_password" เพื่อป้องกันการนำ Token อื่นมาสวมรอย
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=15)
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {
        "sub": email,
        "type": "reset_password",
        "exp": expire
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)

def verify_password_reset_token(token: str) -> str | None:
    """
    ตรวจสอบความถูกต้องและวันหมดอายุของ Reset Token
    คืนค่า email (str) หาก Token ถูกต้องและยังไม่หมดอายุ
    คืนค่า None หาก Token ไม่ถูกต้อง หมดอายุ หรือไม่ใช่ Reset Token
    """
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        token_type = payload.get("type")
        email = payload.get("sub")
        if token_type != "reset_password" or not email:
            return None
        return str(email)
    except (JWTError, TypeError, ValueError):
        return None
