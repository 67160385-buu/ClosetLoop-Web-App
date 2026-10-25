from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, ConfigDict

# --- Auth & User Schemas ---
class RegisterIn(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: str = ""
    role: str = "buyer"  # "buyer" | "seller" | "admin"

class LoginIn(BaseModel):
    email: str  # Can be username or email
    password: str

class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordIn(BaseModel):
    email: EmailStr

class ResetPasswordIn(BaseModel):
    token: str
    new_password: str

class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    display_name: str | None = None
    avatar_url: str | None = None
    role: str | None = None

class UserRoleUpdate(BaseModel):
    role: str  # "buyer" | "seller" | "admin"

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
    display_name: str
    avatar_url: str
    role: str = "buyer"
    is_admin: bool = False
    created_at: datetime

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Closet Schemas ---
class ClosetItemBase(BaseModel):
    name: str
    category: str
    color: str = "neutral"
    size: str = "M"
    style: str = "casual"
    condition: str = "good"
    image_url: Optional[str] = ""

class ClosetItemCreate(ClosetItemBase):
    pass

class ClosetItemOut(ClosetItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    created_at: datetime

# --- Product (Marketplace / Single-Item Inventory) Schemas ---
class ProductCreate(BaseModel):
    closet_item_id: int | None = None
    title: str
    description: str = ""
    price: float = 0
    listing_type: str = "sell"  # "sell" | "exchange"
    category: str = "top"
    condition: str = "สภาพดี 90%"
    size: str = "M"
    color: str = "neutral"
    image_url: str = ""

class ProductUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    status: str | None = None
    category: str | None = None
    condition: str | None = None
    size: str | None = None
    color: str | None = None
    listing_type: str | None = None
    image_url: str | None = None

class ItemStatusUpdate(BaseModel):
    status: str  # "available" | "rejected" | "sold" | "pending"
    flag_reason: str | None = None

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    seller_id: int
    closet_item_id: int | None = None
    title: str
    description: str = ""
    price: float
    listing_type: str = "sell"
    category: str = "top"
    condition: str = "สภาพดี 90%"
    size: str = "M"
    color: str = "neutral"
    status: str = "available"
    flag_reason: str | None = None
    image_url: str = ""
    seller_name: str | None = None
    created_at: datetime

# --- Orders Schemas (Single-Item Quantity=1) ---
class OrderCreate(BaseModel):
    product_id: int
    quantity: int = 1  # ล็อก quantity = 1 เสมอ สำหรับสินค้ามือสอง
    shipping_address: Any | None = None
    payment_method: str = "promptpay"
    slip_url: str = ""

class OrderStatusUpdate(BaseModel):
    status: str  # "pending" | "paid" | "shipped" | "completed" | "cancelled"
    tracking_number: str | None = None
    carrier: str | None = None

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    buyer_id: int
    product_id: int
    quantity: int = 1
    total_price: float
    status: str
    shipping_address: str = ""
    payment_method: str = "promptpay"
    tracking_number: str = ""
    carrier: str = ""
    slip_url: str = ""
    created_at: datetime
    product: ProductOut | None = None

# --- Wishlist & Saved Looks Schemas ---
class WishlistCreate(BaseModel):
    product_id: int

class WishlistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    product: ProductOut | None = None

class SavedLookCreate(BaseModel):
    title: str = "Saved Look"
    items: Any = "[]"
    tip: str = ""

class SavedLookOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    title: str
    items: str
    tip: str
    created_at: datetime

# --- Notification Schemas ---
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

# --- Admin Stats Schema ---
class AdminStatsOut(BaseModel):
    total_users: int
    total_sales: float
    total_products: int
    total_orders: int
    pending_items: int