import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import WishlistItem, SavedLook, Product, User
from ..schemas import (
    WishlistCreate,
    WishlistOut,
    SavedLookCreate,
    SavedLookOut
)
from ..security import get_current_user
from .marketplace import _format_product

router = APIRouter(tags=["Wishlist & Saved Looks"])

# -------------------------------------------------------------
# 1. Wishlist (รายการสินค้าที่ชอบ)
# -------------------------------------------------------------
@router.get("/wishlist")
@router.get("/api/wishlist")
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )
    result = []
    for item in items:
        result.append({
            "id": item.id,
            "user_id": item.user_id,
            "product_id": item.product_id,
            "created_at": item.created_at,
            "product": _format_product(item.product) if item.product else None
        })
    return result

@router.post("/wishlist")
@router.post("/api/wishlist")
def add_to_wishlist(
    data: WishlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.get(Product, data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    existing = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id, WishlistItem.product_id == data.product_id)
        .first()
    )
    if existing:
        return {
            "id": existing.id,
            "user_id": existing.user_id,
            "product_id": existing.product_id,
            "created_at": existing.created_at,
            "product": _format_product(existing.product)
        }
        
    item = WishlistItem(user_id=current_user.id, product_id=data.product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {
        "id": item.id,
        "user_id": item.user_id,
        "product_id": item.product_id,
        "created_at": item.created_at,
        "product": _format_product(product)
    }

@router.delete("/wishlist/{product_id}")
@router.delete("/api/wishlist/{product_id}")
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id, WishlistItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
        
    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist successfully"}

# -------------------------------------------------------------
# 2. Saved Looks (ลุคการแต่งตัวที่บันทึกไว้)
# -------------------------------------------------------------
@router.get("/saved-looks", response_model=list[SavedLookOut])
@router.get("/api/saved-looks", response_model=list[SavedLookOut])
def get_saved_looks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    looks = (
        db.query(SavedLook)
        .filter(SavedLook.user_id == current_user.id)
        .order_by(SavedLook.created_at.desc())
        .all()
    )
    return [SavedLookOut.model_validate(l) for l in looks]

@router.post("/saved-looks", response_model=SavedLookOut)
@router.post("/api/saved-looks", response_model=SavedLookOut)
def save_look(
    data: SavedLookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items_str = data.items if isinstance(data.items, str) else json.dumps(data.items, ensure_ascii=False)
    look = SavedLook(
        user_id=current_user.id,
        title=data.title or "Saved Look",
        items=items_str,
        tip=data.tip or ""
    )
    db.add(look)
    db.commit()
    db.refresh(look)
    return SavedLookOut.model_validate(look)

@router.delete("/saved-looks/{look_id}")
@router.delete("/api/saved-looks/{look_id}")
def delete_saved_look(
    look_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    look = (
        db.query(SavedLook)
        .filter(SavedLook.id == look_id, SavedLook.user_id == current_user.id)
        .first()
    )
    if not look:
        raise HTTPException(status_code=404, detail="Saved look not found")
        
    db.delete(look)
    db.commit()
    return {"message": "Saved look deleted successfully"}
