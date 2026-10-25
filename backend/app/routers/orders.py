import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Order, Product, ClosetItem, User, Notification
from ..schemas import OrderCreate, OrderOut, OrderStatusUpdate
from ..security import get_current_user

router = APIRouter(tags=["Orders"])

def _format_order(order: Order) -> dict:
    product = order.product
    prod_dict = None
    if product:
        seller_name = product.seller.display_name if product.seller else "Seller"
        prod_dict = {
            "id": product.id,
            "seller_id": product.seller_id,
            "closet_item_id": product.closet_item_id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "listing_type": product.listing_type,
            "category": product.category,
            "condition": product.condition,
            "size": product.size,
            "color": product.color,
            "status": product.status,
            "flag_reason": product.flag_reason,
            "image_url": product.image_url,
            "seller_name": seller_name,
            "created_at": product.created_at,
        }
    return {
        "id": order.id,
        "buyer_id": order.buyer_id,
        "product_id": order.product_id,
        "quantity": order.quantity,
        "total_price": order.total_price,
        "status": order.status,
        "shipping_address": str(order.shipping_address or ""),
        "payment_method": order.payment_method or "promptpay",
        "tracking_number": order.tracking_number or "",
        "carrier": order.carrier or "",
        "slip_url": order.slip_url or "",
        "created_at": order.created_at,
        "product": prod_dict,
    }

# -------------------------------------------------------------
# 1. สร้างคำสั่งซื้อ (Single-Item Inventory + Automated Closet Transfer)
# -------------------------------------------------------------
@router.post("/orders")
@router.post("/api/orders")
def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.get(Product, data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="ไม่พบสินค้าที่ต้องการสั่งซื้อ")
    
    # ตรวจสอบสถานะสินค้า (AVAILABLE / SOLD)
    if product.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="สินค้าชิ้นนี้ถูกจำหน่ายไปแล้ว หรือไม่พร้อมจำหน่าย (Single-item already sold)"
        )
    
    if product.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="ไม่สามารถซื้อสินค้าที่คุณลงขายเองได้")
    
    # ล็อกจำนวนสินค้าให้ quantity = 1 เสมอ สำหรับสินค้ามือสอง
    order_quantity = 1
    
    shipping_addr_str = ""
    if data.shipping_address:
        if isinstance(data.shipping_address, str):
            shipping_addr_str = data.shipping_address
        else:
            try:
                shipping_addr_str = json.dumps(data.shipping_address, ensure_ascii=False)
            except Exception:
                shipping_addr_str = str(data.shipping_address)

    # สร้าง Order
    order = Order(
        buyer_id=current_user.id,
        product_id=product.id,
        quantity=order_quantity,
        total_price=product.price * order_quantity,
        status="paid" if data.payment_method != "cod" else "pending",
        shipping_address=shipping_addr_str,
        payment_method=data.payment_method,
        slip_url=data.slip_url or ""
    )
    
    # ปรับสถานะสินค้าเป็น SOLD ทันที
    product.status = "sold"
    
    # ---------------------------------------------------------
    # Automated Closet Transfer:
    # โอนย้าย Ownership ของสินค้า เข้าไปอยู่ใน Digital Closet ของผู้ซื้อทันที
    # ---------------------------------------------------------
    if product.closet_item_id and product.closet_item:
        # หากสินค้านี้เคยผูกกับ ClosetItem ให้โอน Ownership (user_id) ไปให้ผู้ซื้อ
        product.closet_item.user_id = current_user.id
    else:
        # หากเป็นการลงขายตรง (Direct Selling) ให้สร้าง Digital Closet Item ชิ้นใหม่ให้ผู้ซื้อโดยอัตโนมัติ
        new_closet_item = ClosetItem(
            user_id=current_user.id,
            name=product.title,
            category=product.category or "top",
            color=product.color or "neutral",
            size=product.size or "M",
            style="casual",
            condition=product.condition or "good",
            image_url=product.image_url or "",
        )
        db.add(new_closet_item)
        db.flush()
        product.closet_item_id = new_closet_item.id

    # ส่งการแจ้งเตือน (Notifications) ให้ผู้ซื้อและผู้ขาย
    buyer_notif = Notification(
        user_id=current_user.id,
        title="สั่งซื้อสำเร็จและเพิ่มเข้า My Closet แล้ว! ✨",
        message=f"คำสั่งซื้อสินค้า '{product.title}' สำเร็จ และระบบได้โอนย้ายชุดเข้าสู่ตู้เสื้อผ้าดิจิทัลของคุณแล้ว",
        type="transfer"
    )
    seller_notif = Notification(
        user_id=product.seller_id,
        title="สินค้าของคุณขายได้แล้ว! 🎉",
        message=f"มีคำสั่งซื้อสินค้า '{product.title}' จากคุณ {current_user.display_name or current_user.username}",
        type="sale"
    )
    db.add(buyer_notif)
    db.add(seller_notif)
    
    db.add(order)
    db.commit()
    db.refresh(order)
    
    return _format_order(order)

# -------------------------------------------------------------
# 2. ดูประวัติคำสั่งซื้อของผู้ซื้อ (Buyer Orders)
# -------------------------------------------------------------
@router.get("/orders")
@router.get("/api/orders")
def list_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).all()
    return [_format_order(o) for o in orders]

# -------------------------------------------------------------
# 3. ดูคำสั่งซื้อฝั่ง Seller (Seller Orders)
# -------------------------------------------------------------
@router.get("/seller/orders")
@router.get("/api/seller/orders")
def list_seller_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .join(Product, Order.product_id == Product.id)
        .filter(Product.seller_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_format_order(o) for o in orders]

# -------------------------------------------------------------
# 4. ดูคำสั่งซื้อตาม ID
# -------------------------------------------------------------
@router.get("/orders/{order_id}")
@router.get("/api/orders/{order_id}")
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    
    # อนุญาตเฉพาะผู้ซื้อ, ผู้ขายสินค้านั้น หรือ Admin
    is_seller = order.product and order.product.seller_id == current_user.id
    if order.buyer_id != current_user.id and not is_seller and not current_user.is_admin:
        raise HTTPException(403, "Access denied")
        
    return _format_order(order)

# -------------------------------------------------------------
# 5. อัปเดตสถานะคำสั่งซื้อ (เช่น ผู้ขายแจ้งเลขพัสดุ SHIPPED หรือ COMPLETED)
# -------------------------------------------------------------
@router.patch("/orders/{order_id}/status")
@router.patch("/api/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
        
    is_seller = order.product and order.product.seller_id == current_user.id
    if not is_seller and not current_user.is_admin:
        raise HTTPException(403, "Only the seller or admin can update order status")
        
    order.status = data.status
    if data.tracking_number is not None:
        order.tracking_number = data.tracking_number
    if data.carrier is not None:
        order.carrier = data.carrier
        
    # แจ้งเตือนผู้ซื้อเมื่อสถานะเปลี่ยน
    buyer_msg = f"คำสั่งซื้อ #{order.id} ได้รับการอัปเดตสถานะเป็น '{data.status}'"
    if order.tracking_number:
        buyer_msg += f" (เลขพัสดุ: {order.tracking_number} ขนส่ง: {order.carrier})"
        
    notif = Notification(
        user_id=order.buyer_id,
        title="อัปเดตสถานะคำสั่งซื้อ 🚚",
        message=buyer_msg,
        type="status"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(order)
    return _format_order(order)
