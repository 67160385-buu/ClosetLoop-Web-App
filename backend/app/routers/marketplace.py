from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Product, ClosetItem, User
from ..schemas import ProductCreate, ProductUpdate, ProductOut
from ..security import get_current_user

router = APIRouter(tags=["Marketplace & Direct Selling"])

def _format_product(p: Product) -> dict:
    seller_name = p.seller.display_name if p.seller and p.seller.display_name else (p.seller.username if p.seller else "Seller")
    return {
        "id": p.id,
        "seller_id": p.seller_id,
        "closet_item_id": p.closet_item_id,
        "title": p.title,
        "description": p.description or "",
        "price": p.price,
        "listing_type": p.listing_type or "sell",
        "category": p.category or "top",
        "condition": p.condition or "สภาพดี 90%",
        "size": p.size or "M",
        "color": p.color or "neutral",
        "status": p.status or "available",
        "flag_reason": p.flag_reason,
        "image_url": p.image_url or "",
        "seller_name": seller_name,
        "created_at": p.created_at,
    }

# -------------------------------------------------------------
# 1. ค้นหาและดึงรายการสินค้าใน Marketplace
# -------------------------------------------------------------
@router.get("/marketplace")
@router.get("/products")
@router.get("/api/marketplace")
@router.get("/api/products")
def list_products(
    q: str = Query("", description="Search keywords"),
    listing_type: str | None = None,
    category: str | None = None,
    status_filter: str | None = "available",
    sort_by: str = "newest",  # "newest" | "price_asc" | "price_desc"
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    
    if status_filter:
        query = query.filter(Product.status == status_filter)
        
    if q:
        query = query.filter(
            (Product.title.ilike(f"%{q}%")) | (Product.description.ilike(f"%{q}%"))
        )
        
    if listing_type:
        query = query.filter(Product.listing_type == listing_type)
        
    if category:
        query = query.filter(Product.category == category)
        
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.created_at.desc())
        
    products = query.all()
    return [_format_product(p) for p in products]

# -------------------------------------------------------------
# 2. ดูสินค้าของ Seller ที่ตนเองลงขาย (Direct Selling / My Listings)
# -------------------------------------------------------------
@router.get("/seller/products")
@router.get("/api/seller/products")
def get_seller_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    products = (
        db.query(Product)
        .filter(Product.seller_id == current_user.id)
        .order_by(Product.created_at.desc())
        .all()
    )
    return [_format_product(p) for p in products]

# -------------------------------------------------------------
# 3. ดูรายละเอียดสินค้าตาม ID
# -------------------------------------------------------------
@router.get("/marketplace/{product_id}")
@router.get("/products/{product_id}")
@router.get("/api/marketplace/{product_id}")
@router.get("/api/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _format_product(product)

# -------------------------------------------------------------
# 4. ลงขายสินค้ามือสอง (Direct Selling API)
# -------------------------------------------------------------
@router.post("/marketplace")
@router.post("/products")
@router.post("/api/marketplace")
@router.post("/api/products")
def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    price = 0.0 if data.listing_type == "exchange" else float(data.price or 0)
    if price < 0:
        raise HTTPException(status_code=400, detail="Price cannot be negative")

    image_url = data.image_url
    category = data.category or "top"
    condition = data.condition or "สภาพดี 90%"
    size = data.size or "M"
    color = data.color or "neutral"

    # ถ้าเลือกลงขายจาก My Closet เดิม ให้ตรวจสอบความเป็นเจ้าของ
    if data.closet_item_id:
        item = db.get(ClosetItem, data.closet_item_id)
        if not item or item.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Closet item not found or not owned by you")
        if item.product and item.product.status == "available":
            raise HTTPException(status_code=400, detail="This closet item is already listed in the marketplace")
        if not image_url:
            image_url = item.image_url
        if not category:
            category = item.category
        if not size:
            size = item.size
        if not color:
            color = item.color

    product = Product(
        seller_id=current_user.id,
        closet_item_id=data.closet_item_id or None,
        title=data.title.strip(),
        description=data.description.strip() if data.description else "",
        price=price,
        listing_type=data.listing_type or "sell",
        category=category,
        condition=condition,
        size=size,
        color=color,
        status="available",
        image_url=image_url or ""
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return _format_product(product)

# -------------------------------------------------------------
# 5. แก้ไขข้อมูลสินค้า
# -------------------------------------------------------------
@router.put("/marketplace/{product_id}")
@router.put("/products/{product_id}")
@router.put("/api/marketplace/{product_id}")
@router.put("/api/products/{product_id}")
def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.get(Product, product_id)
    if not product or (product.seller_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=404, detail="Product not found or access denied")
        
    for key, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(product, key, value)
            
    db.commit()
    db.refresh(product)
    return _format_product(product)

# -------------------------------------------------------------
# 6. ลบ/ยกเลิกการลงขายสินค้า
# -------------------------------------------------------------
@router.delete("/marketplace/{product_id}")
@router.delete("/products/{product_id}")
@router.delete("/api/marketplace/{product_id}")
@router.delete("/api/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.get(Product, product_id)
    if not product or (product.seller_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=404, detail="Product not found or access denied")
        
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
