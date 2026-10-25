from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(100), default="")
    avatar_url = Column(String(500), default="")
    role = Column(String(20), default="buyer", nullable=False)  # "buyer" | "seller" | "admin"
    is_admin = Column(Boolean, default=False, nullable=False)
    reset_otp = Column(String(10), nullable=True)
    reset_otp_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    closet_items = relationship("ClosetItem", back_populates="owner", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="seller", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="buyer", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    saved_looks = relationship("SavedLook", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class ClosetItem(Base):
    __tablename__ = "closet_items"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    color = Column(String(50), default="neutral")
    size = Column(String(20), default="M")
    style = Column(String(50), default="casual")
    condition = Column(String(50), default="good")
    image_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="closet_items")
    product = relationship("Product", back_populates="closet_item", uselist=False)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    closet_item_id = Column(Integer, ForeignKey("closet_items.id"), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, default="")
    price = Column(Float, nullable=False)
    listing_type = Column(String(20), default="sell")  # "sell" | "exchange"
    category = Column(String(50), default="top")
    condition = Column(String(100), default="สภาพดี 90%")
    size = Column(String(20), default="M")
    color = Column(String(50), default="neutral")
    status = Column(String(20), default="available")  # "available" | "sold" | "pending" | "rejected"
    flag_reason = Column(String(255), nullable=True)
    image_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    seller = relationship("User", back_populates="products")
    closet_item = relationship("ClosetItem", back_populates="product")
    orders = relationship("Order", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)  # Enforce quantity = 1 for single-item inventory
    total_price = Column(Float, nullable=False)
    status = Column(String(30), default="paid")  # "pending" | "paid" | "shipped" | "completed" | "cancelled"
    shipping_address = Column(Text, default="")
    payment_method = Column(String(50), default="promptpay")
    tracking_number = Column(String(100), default="")
    carrier = Column(String(100), default="")
    slip_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")

class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")

class SavedLook(Base):
    __tablename__ = "saved_looks"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), default="Saved Look")
    items = Column(Text, default="[]")  # JSON encoded list of items
    tip = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_looks")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, default="")
    type = Column(String(50), default="system")  # "order" | "sale" | "transfer" | "status" | "admin"
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")