from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import ClosetItem, User
from ..schemas import ClosetItemCreate, ClosetItemOut
from ..security import get_current_user

router = APIRouter(tags=["My Closet"])

@router.get("/closet", response_model=List[ClosetItemOut])
@router.get("/api/closet", response_model=List[ClosetItemOut])
def get_closet(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # ดึงเสื้อผ้าเฉพาะในตู้ดิจิทัลของตนเอง
    return (
        db.query(ClosetItem)
        .filter(ClosetItem.user_id == current_user.id)
        .order_by(ClosetItem.created_at.desc())
        .all()
    )

@router.post("/closet", response_model=ClosetItemOut)
@router.post("/api/closet", response_model=ClosetItemOut)
def add_piece(data: ClosetItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = ClosetItem(**data.model_dump(), user_id=current_user.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/closet/{item_id}")
@router.delete("/api/closet/{item_id}")
def delete_piece(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(ClosetItem).filter(ClosetItem.id == item_id, ClosetItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบเสื้อผ้าชิ้นนี้")
    db.delete(item)
    db.commit()
    return {"message": "ลบเสื้อผ้าเรียบร้อยแล้ว"}