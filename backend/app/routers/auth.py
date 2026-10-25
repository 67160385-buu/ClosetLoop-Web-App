from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import (
    RegisterIn,
    LoginIn,
    ChangePasswordIn,
    ForgotPasswordIn,
    ResetPasswordIn,
    TokenOut,
    UserOut
)
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    create_password_reset_token,
    verify_password_reset_token
)
from ..email_utils import send_reset_email

router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=TokenOut)
@router.post("/auth/register", response_model=TokenOut)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter((User.email == data.email.lower().strip()) | (User.username == data.username.strip())).first():
        raise HTTPException(400, "Email or username already exists")
    
    role = data.role.lower() if data.role in ["buyer", "seller", "admin"] else "buyer"
    is_admin = (role == "admin")
    
    user = User(
        username=data.username.strip(),
        email=data.email.lower().strip(),
        password_hash=hash_password(data.password),
        display_name=data.display_name.strip() or data.username.strip(),
        role=role,
        is_admin=is_admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token(user.id, role=user.role, is_admin=user.is_admin)
    return TokenOut(access_token=token, user=user)

@router.post("/login", response_model=TokenOut)
@router.post("/auth/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    ident = data.email.lower().strip()
    user = db.query(User).filter(
        (User.email == ident) | (User.username == data.email.strip())
    ).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email, username, or password")
    
    # Sync is_admin with role
    if user.role == "admin" and not user.is_admin:
        user.is_admin = True
        db.commit()
        
    token = create_access_token(user.id, role=user.role, is_admin=user.is_admin)
    return TokenOut(access_token=token, user=user)

@router.post("/logout")
@router.post("/auth/logout")
def logout():
    return {"message": "Logged out. Remove the bearer token on the client."}

@router.post("/change-password")
@router.post("/auth/change-password")
def change_password(
    data: ChangePasswordIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(400, "Current password is incorrect")
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

# --- API สำหรับลืมรหัสผ่าน (ส่งอีเมล + รหัส OTP 6 หลัก) ---
@router.post("/forgot-password")
@router.post("/auth/forgot-password")
def forgot_password(data: ForgotPasswordIn, db: Session = Depends(get_db)):
    """
    รับข้อมูลอีเมล ตรวจสอบว่ามีผู้ใช้นี้ในระบบหรือไม่
    หากมี ให้สร้างรหัส OTP 6 หลัก และ JWT Token (อายุ 15 นาที) พร้อมส่งอีเมล
    """
    import random
    from datetime import datetime, timedelta

    target_email = data.email.lower().strip()
    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ไม่พบบัญชีผู้ใช้ที่ลงทะเบียนด้วยอีเมลนี้"
        )
    
    # 1. สร้างรหัสยืนยัน OTP 6 หลัก และบันทึกเวลาหมดอายุ 15 นาที
    otp = f"{random.randint(100000, 999999)}"
    user.reset_otp = otp
    user.reset_otp_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    
    # 2. สร้าง Token สำหรับรีเซ็ตรหัสผ่าน (อายุ 15 นาที)
    reset_token = create_password_reset_token(email=user.email)
    
    # 3. ส่งอีเมลพร้อมรหัส OTP และลิงก์ไปยังผู้ใช้
    is_sent = send_reset_email(to_email=user.email, token_or_url=reset_token, otp=otp)
    if not is_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาด ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"
        )
        
    return {
        "message": "ระบบได้ส่งรหัสยืนยันและลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว",
        "otp": otp,
        "reset_token": reset_token,
        "email": user.email
    }

# --- API สำหรับตั้งรหัสผ่านใหม่ (รองรับทั้ง Token จากลิงก์ และรหัส OTP 6 หลัก) ---
@router.post("/reset-password")
@router.post("/auth/reset-password")
def reset_password(data: ResetPasswordIn, db: Session = Depends(get_db)):
    from datetime import datetime
    token_str = data.token.strip()
    user = None
    
    # ตรวจสอบว่าส่งมาเป็นรหัส OTP 6 หลัก หรือ JWT Token
    if len(token_str) == 6 and token_str.isdigit():
        user = db.query(User).filter(
            User.reset_otp == token_str,
            User.reset_otp_expires_at > datetime.utcnow()
        ).first()
    else:
        email = verify_password_reset_token(token_str)
        if email:
            user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="รหัสยืนยันหรือโทเค็นไม่ถูกต้อง หรือหมดอายุแล้ว กรุณาขอใหม่อีกครั้ง"
        )
        
    user.password_hash = hash_password(data.new_password)
    user.reset_otp = None
    user.reset_otp_expires_at = None
    db.commit()
    db.refresh(user)
    
    return {"message": "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที"}