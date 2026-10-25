from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Product, Order, Notification
from ..schemas import (
    UserOut,
    UserRoleUpdate,
    ProductOut,
    ItemStatusUpdate,
    AdminStatsOut
)
from ..security import require_admin
from .marketplace import _format_product

router = APIRouter(tags=["Admin Oversight & Management"])

# -------------------------------------------------------------
# 1. GET /api/admin/stats – ดึงภาพรวมระบบ (ยอดผู้ใช้, ยอดขายรวม, จำนวนสินค้า)
# -------------------------------------------------------------
@router.get("/admin/stats", response_model=AdminStatsOut)
@router.get("/api/admin/stats", response_model=AdminStatsOut)
def get_admin_stats(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    pending_items = db.query(Product).filter(Product.status == "pending").count()
    
    # คำนวณยอดขายรวมของคำสั่งซื้อที่ชำระเงินแล้ว
    sales_sum = (
        db.query(func.sum(Order.total_price))
        .filter(Order.status.in_(["paid", "shipped", "completed"]))
        .scalar()
    )
    total_sales = float(sales_sum) if sales_sum else 0.0

    return AdminStatsOut(
        total_users=total_users,
        total_sales=total_sales,
        total_products=total_products,
        total_orders=total_orders,
        pending_items=pending_items
    )

# -------------------------------------------------------------
# 2. GET /api/admin/users – ดึงรายชื่อผู้ใช้ทั้งหมด
# -------------------------------------------------------------
@router.get("/admin/users", response_model=list[UserOut])
@router.get("/api/admin/users", response_model=list[UserOut])
def get_all_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.id.asc()).all()
    return [UserOut.model_validate(u) for u in users]

# -------------------------------------------------------------
# 3. PATCH /api/admin/users/:id/role – ปรับเปลี่ยนบทบาทผู้ใช้
# -------------------------------------------------------------
@router.patch("/admin/users/{user_id}/role", response_model=UserOut)
@router.patch("/api/admin/users/{user_id}/role", response_model=UserOut)
def change_user_role(
    user_id: int,
    data: UserRoleUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_role = data.role.lower().strip()
    if new_role not in ["buyer", "seller", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Must be 'buyer', 'seller', or 'admin'"
        )
        
    user.role = new_role
    user.is_admin = (new_role == "admin")
    
    # ส่งข้อความแจ้งเตือนผู้ใช้ถึงการเปลี่ยนสิทธิ์
    notif = Notification(
        user_id=user.id,
        title="สิทธิ์ผู้ใช้งานของคุณได้รับการอัปเดต 🛡️",
        message=f"ผู้ดูแลระบบได้ปรับบทบาทบัญชีของคุณเป็น '{new_role.upper()}'",
        type="admin"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)

# -------------------------------------------------------------
# 4. GET /api/admin/items/pending – ดึงรายการสินค้าที่รออนุมัติ
# -------------------------------------------------------------
@router.get("/admin/items/pending")
@router.get("/api/admin/items/pending")
def get_pending_items(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    pending_items = (
        db.query(Product)
        .filter(Product.status == "pending")
        .order_by(Product.created_at.desc())
        .all()
    )
    return [_format_product(p) for p in pending_items]

# -------------------------------------------------------------
# 5. PATCH /api/admin/items/:id/status – อนุมัติหรือปฏิเสธสินค้ามือสอง
# -------------------------------------------------------------
@router.patch("/admin/items/{product_id}/status")
@router.patch("/api/admin/items/{product_id}/status")
def update_item_status(
    product_id: int,
    data: ItemStatusUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    valid_statuses = ["available", "rejected", "pending", "sold"]
    target_status = data.status.lower().strip()
    if target_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
        
    product.status = target_status
    if data.flag_reason:
        product.flag_reason = data.flag_reason
        
    # ส่งการแจ้งเตือนหา Seller ผู้ลงขาย
    action_text = "ได้รับการอนุมัติให้วางขายแล้ว ✨" if target_status == "available" else f"ไม่ผ่านการอนุมัติ ({data.flag_reason or 'ผิดนโยบายการลงขาย'})"
    notif = Notification(
        user_id=product.seller_id,
        title=f"สถานะการตรวจสอบสินค้า: {product.title}",
        message=f"สินค้าของคุณ{action_text}",
        type="admin"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(product)
    return _format_product(product)
