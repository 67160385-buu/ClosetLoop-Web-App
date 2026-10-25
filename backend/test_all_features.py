import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def request(method, path, body=None, token=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            return status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = {"raw": content}
        return e.code, parsed

def run_tests():
    print("=" * 60)
    print("🚀 เริ่มต้นการทดสอบระบบ Backend ClosetLoop แบบครบวงจร...")
    print("=" * 60)

    ts = int(time.time())
    buyer_user = f"buyer_{ts}"
    buyer_email = f"buyer_{ts}@test.com"
    seller_user = f"seller_{ts}"
    seller_email = f"seller_{ts}@test.com"
    pwd = "password123"

    # 1. ทดสอบลงทะเบียน Buyer
    status, res = request("POST", "/auth/register", {
        "username": buyer_user,
        "email": buyer_email,
        "password": pwd,
        "display_name": "Test Buyer",
        "role": "buyer"
    })
    assert status == 200, f"Register Buyer failed: {res}"
    buyer_token = res["access_token"]
    buyer_id = res["user"]["id"]
    assert res["user"]["role"] == "buyer"
    assert res["user"]["is_admin"] is False
    print("✅ 1. ลงทะเบียน Buyer สำเร็จ (role='buyer', is_admin=False)")

    # 2. ทดสอบลงทะเบียน Seller
    status, res = request("POST", "/auth/register", {
        "username": seller_user,
        "email": seller_email,
        "password": pwd,
        "display_name": "Test Seller",
        "role": "seller"
    })
    assert status == 200, f"Register Seller failed: {res}"
    seller_token = res["access_token"]
    seller_id = res["user"]["id"]
    assert res["user"]["role"] == "seller"
    print("✅ 2. ลงทะเบียน Seller สำเร็จ (role='seller')")

    # 3. ล็อกอินด้วย Admin (Ammy)
    # หา user admin ในฐานข้อมูล
    # เราจะลงทะเบียนหรืออัปเดตสิทธิ์ admin เพื่อทดสอบ
    # ทดสอบอัปเดตบทบาทของ user ผ่าน database หรือ login
    # ใช้ buyer ทดสอบเรียก Admin route -> ต้องติด 403 Forbidden
    status, res = request("GET", "/api/admin/stats", token=buyer_token)
    assert status == 403, f"Expected 403 for non-admin on /api/admin/stats, got {status}: {res}"
    print("✅ 3. RBAC Middleware บล็อกผู้ใช้ทั่วไป (Buyer) จาก Admin API สำเร็จ (HTTP 403 Forbidden)")

    # ปรับสิทธิ์ buyer ให้เป็น admin ชั่วคราวเพื่อทดสอบ Admin routes หรือสร้าง token admin
    from app.security import create_access_token
    from app.database import SessionLocal
    from app.models import User
    
    db = SessionLocal()
    admin_obj = db.query(User).filter(User.role == "admin").first()
    if not admin_obj:
        admin_obj = db.get(User, 1)
        if admin_obj:
            admin_obj.role = "admin"
            admin_obj.is_admin = True
            db.commit()
    admin_id = admin_obj.id if admin_obj else 1
    admin_token = create_access_token(admin_id, role="admin", is_admin=True)
    db.close()

    # 4. ทดสอบ Admin API: GET /api/admin/stats
    status, res = request("GET", "/api/admin/stats", token=admin_token)
    assert status == 200, f"Admin stats failed: {res}"
    assert "total_users" in res
    assert "total_sales" in res
    assert "total_products" in res
    print(f"✅ 4. Admin API: GET /api/admin/stats สำเร็จ -> {res}")

    # 5. ทดสอบ Admin API: GET /api/admin/users
    status, res = request("GET", "/api/admin/users", token=admin_token)
    assert status == 200, f"Admin list users failed: {res}"
    assert isinstance(res, list) and len(res) > 0
    print(f"✅ 5. Admin API: GET /api/admin/users สำเร็จ (พบผู้ใช้ทั้งหมด {len(res)} คน)")

    # 6. ทดสอบ Admin API: PATCH /api/admin/users/:id/role
    status, res = request("PATCH", f"/api/admin/users/{buyer_id}/role", {"role": "seller"}, token=admin_token)
    assert status == 200, f"Admin change role failed: {res}"
    assert res["role"] == "seller"
    print("✅ 6. Admin API: PATCH /api/admin/users/:id/role เปลี่ยนบทบาทผู้ใช้สำเร็จ")

    # เปลี่ยนกลับเป็น buyer
    request("PATCH", f"/api/admin/users/{buyer_id}/role", {"role": "buyer"}, token=admin_token)

    # 7. ทดสอบ Direct Selling API: Seller ลงขายสินค้ามือสอง
    status, res = request("POST", "/marketplace", {
        "title": f"Vintage Bomber Jacket {ts}",
        "description": "เสื้อแจ็คเก็ตวินเทจสภาพสวย 95%",
        "price": 1490.0,
        "listing_type": "sell",
        "category": "top",
        "condition": "สภาพดี 95%",
        "size": "L",
        "color": "Green Army",
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"
    }, token=seller_token)
    assert status == 200, f"Direct selling failed: {res}"
    product_id = res["id"]
    assert res["status"] == "available"
    print(f"✅ 7. Direct Selling API: Seller ลงขายสินค้าสำเร็จ (ID={product_id}, status='available')")

    # 8. ทดสอบ Marketplace API: ค้นหาและคัดกรองสินค้า
    status, res = request("GET", f"/marketplace?q=Vintage&category=top", token=buyer_token)
    assert status == 200, f"Marketplace search failed: {res}"
    assert isinstance(res, list)
    matching = [p for p in res if p["id"] == product_id]
    assert len(matching) > 0, "Product not found in marketplace search"
    print(f"✅ 8. Marketplace API: ค้นหาและคัดกรองสินค้าสำเร็จ (พบ {len(matching)} รายการตรง)")

    # 9. ทดสอบ Wishlist API
    status, res = request("POST", "/wishlist", {"product_id": product_id}, token=buyer_token)
    assert status == 200, f"Add to wishlist failed: {res}"
    status, res = request("GET", "/wishlist", token=buyer_token)
    assert status == 200 and any(w["product_id"] == product_id for w in res)
    print("✅ 9. Wishlist API: บันทึกและดึงรายการสินค้าที่ชอบสำเร็จ")

    # 10. ทดสอบ Saved Looks API
    status, res = request("POST", "/saved-looks", {
        "title": "Autumn Streetwear Look",
        "items": json.dumps([{"id": product_id, "name": "Bomber Jacket"}]),
        "tip": "แมตช์แจ็คเก็ตโทนเขียวกับกางเกงคาร์โก้สีดำ"
    }, token=buyer_token)
    assert status == 200, f"Save look failed: {res}"
    status, res = request("GET", "/saved-looks", token=buyer_token)
    assert status == 200 and len(res) > 0
    print("✅ 10. Saved Looks API: บันทึกและดึงลุคสไตล์ที่ชอบสำเร็จ")

    # 11. ทดสอบ Single-Item Inventory & Automated Closet Transfer:
    # ผู้ซื้อสั่งซื้อสินค้าชิ้นนี้ (quantity=1)
    status, res = request("POST", "/orders", {
        "product_id": product_id,
        "quantity": 1,
        "shipping_address": "123 ถ.สุขุมวิท กทม.",
        "payment_method": "promptpay"
    }, token=buyer_token)
    assert status == 200, f"Order creation failed: {res}"
    order_id = res["id"]
    assert res["status"] in ["paid", "pending"]
    assert res["quantity"] == 1
    print(f"✅ 11. Single-Item Inventory: สร้างคำสั่งซื้อสำเร็จ (Order ID={order_id}, quantity=1)")

    # 12. ตรวจสอบว่าสินค้าเปลี่ยนสถานะเป็น 'sold'
    status, res = request("GET", f"/marketplace/{product_id}")
    assert status == 200
    assert res["status"] == "sold", f"Expected product status to be 'sold', got {res['status']}"
    print("✅ 12. สถานะสินค้าเปลี่ยนเป็น 'sold' เรียบร้อย ไม่สามารถซื้อซ้ำได้")

    # 13. ทดสอบซื้อสินค้าชิ้นเดิมซ้ำ (ต้องถูกปฏิเสธ)
    status, res = request("POST", "/orders", {
        "product_id": product_id,
        "quantity": 1
    }, token=buyer_token)
    assert status == 400, f"Expected 400 for buying sold item, got {status}: {res}"
    print("✅ 13. ป้องกันการซื้อซ้ำสำเร็จ (ระบบปฏิเสธคำสั่งซื้อสินค้าที่สถานะ sold แล้ว)")

    # 14. ทดสอบ Automated Closet Transfer:
    # ตรวจสอบในตู้เสื้อผ้าดิจิทัล (/closet) ของ Buyer ว่ามีสินค้านี้ปรากฏแล้วหรือไม่
    status, res = request("GET", "/closet", token=buyer_token)
    assert status == 200
    buyer_closet_items = [i for i in res if f"Vintage Bomber Jacket {ts}" in i["name"]]
    assert len(buyer_closet_items) > 0, "Automated Closet Transfer failed: item not in buyer's closet!"
    print(f"✅ 14. Automated Closet Transfer สำเร็จ: สินค้าที่ซื้อโอนย้ายเข้าสู่ Digital Closet ของ Buyer อัตโนมัติ ({buyer_closet_items[0]['name']})")

    # 15. ทดสอบ Notification Bell API:
    # Buyer ได้รับแจ้งเตือนการโอนชุดเข้าตู้
    status, res = request("GET", "/notifications", token=buyer_token)
    assert status == 200 and len(res) > 0
    print(f"✅ 15. Notification Bell API: Buyer ได้รับการแจ้งเตือนคำสั่งซื้อและการโอนย้าย ({res[0]['title']})")

    # Seller ได้รับแจ้งเตือนว่าสินค้าขายได้
    status, res = request("GET", "/notifications", token=seller_token)
    assert status == 200 and len(res) > 0
    print(f"✅ 16. Notification Bell API: Seller ได้รับการแจ้งเตือนว่าสินค้าขายได้ ({res[0]['title']})")

    # 17. ทดสอบ Seller Orders & Update Status
    status, res = request("GET", "/seller/orders", token=seller_token)
    assert status == 200
    seller_matching_orders = [o for o in res if o["id"] == order_id]
    assert len(seller_matching_orders) > 0
    print(f"✅ 17. Seller Orders API: ผู้ขายสามารถดูรายการคำสั่งซื้อของสินค้าตนเองได้ (พบ Order #{order_id})")

    # Seller อัปเดตสถานะเป็น SHIPPED
    status, res = request("PATCH", f"/orders/{order_id}/status", {
        "status": "SHIPPED",
        "tracking_number": "TH-KRY-12345678",
        "carrier": "Kerry Express"
    }, token=seller_token)
    assert status == 200
    assert res["status"] == "SHIPPED"
    assert res["tracking_number"] == "TH-KRY-12345678"
    print("✅ 18. Seller อัปเดตสถานะคำสั่งซื้อเป็น 'SHIPPED' พร้อมระบุเลขพัสดุสำเร็จ")

    # 18. ทดสอบ Admin Items Pending & Approval API
    # Seller สร้างสินค้า status pending
    status, res = request("POST", "/marketplace", {
        "title": f"Luxury Trench Coat {ts}",
        "price": 3200.0,
        "listing_type": "sell",
        "category": "top"
    }, token=seller_token)
    pending_item_id = res["id"]
    # ปรับสถานะเป็น pending เพื่อทดสอบ
    from app.models import Product
    db = SessionLocal()
    p_obj = db.get(Product, pending_item_id)
    p_obj.status = "pending"
    db.commit()
    db.close()

    status, res = request("GET", "/api/admin/items/pending", token=admin_token)
    assert status == 200
    assert any(p["id"] == pending_item_id for p in res)
    print("✅ 19. Admin API: GET /api/admin/items/pending ดึงรายการสินค้ารออนุมัติสำเร็จ")

    status, res = request("PATCH", f"/api/admin/items/{pending_item_id}/status", {
        "status": "available"
    }, token=admin_token)
    assert status == 200
    assert res["status"] == "available"
    print("✅ 20. Admin API: PATCH /api/admin/items/:id/status อนุมัติสินค้าสำเร็จ")

    print("=" * 60)
    print("🎉 การทดสอบทุกข้อผ่านฉลุย 100% สมบูรณ์แบบทุกเงื่อนไข!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
