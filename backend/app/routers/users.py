from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserOut, UserUpdate
from ..security import get_current_user

router = APIRouter(tags=["User Management"])

@router.get("/me", response_model=UserOut)
@router.get("/users/me", response_model=UserOut)
@router.get("/api/me", response_model=UserOut)
@router.get("/api/users/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users/{user_id}", response_model=UserOut)
@router.get("/api/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users")
@router.get("/api/users")
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    total = db.query(User).count()
    items = db.query(User).offset((page - 1) * limit).limit(limit).all()
    return {"page": page, "limit": limit, "total": total, "items": [UserOut.model_validate(x) for x in items]}

@router.put("/users/{user_id}", response_model=UserOut)
@router.put("/api/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You can only edit your own profile")
        
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    values = data.model_dump(exclude_unset=True)
    if "username" in values and values["username"]:
        exists = db.query(User).filter(User.username == values["username"], User.id != user_id).first()
        if exists:
            raise HTTPException(status_code=400, detail="Username already exists")
            
    if "email" in values and values["email"]:
        exists = db.query(User).filter(User.email == values["email"].lower(), User.id != user_id).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already exists")
        values["email"] = values["email"].lower()
        
    # เฉพาะ Admin เท่านั้นที่สามารถเปลี่ยน Role ผ่าน update_user ได้
    if "role" in values and values["role"]:
        if current_user.is_admin:
            user.role = values["role"]
            user.is_admin = (values["role"] == "admin")
        values.pop("role", None)

    for key, value in values.items():
        if value is not None:
            setattr(user, key, value)
            
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
@router.delete("/api/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You can only delete your own account")
        
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/check-username/{name}")
@router.get("/api/check-username/{name}")
def check_username(name: str, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.username == name).first() is not None
    return {"username": name, "available": not exists}
