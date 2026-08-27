import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    CUSTOMER = "CUSTOMER"

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    PREPARING = "PREPARING"
    READY = "READY"
    RECEIVED = "RECEIVED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class BulkOrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    REVIEWING = "REVIEWING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    PREPARING = "PREPARING"
    READY = "READY"
    COMPLETED = "COMPLETED"

class InventoryTransactionType(str, enum.Enum):
    OPENING_STOCK = "OPENING_STOCK"
    STOCK_ADDED = "STOCK_ADDED"
    ORDER_RESERVED = "ORDER_RESERVED"
    ORDER_CANCELLED = "ORDER_CANCELLED"
    QUANTITY_INCREASED = "QUANTITY_INCREASED"
    QUANTITY_DECREASED = "QUANTITY_DECREASED"
    ORDER_COMPLETED = "ORDER_COMPLETED"
    MANUAL_ADJUSTMENT = "MANUAL_ADJUSTMENT"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.CUSTOMER.value, nullable=False)
    address = Column(Text, nullable=True)
    village = Column(String(100), default="Sangola", nullable=True)
    taluka = Column(String(100), default="Sangola", nullable=True)
    district = Column(String(100), default="Solapur", nullable=True)
    state = Column(String(100), default="Maharashtra", nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    bulk_orders = relationship("BulkOrder", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    unit = Column(String(50), default="packet", nullable=False) # packet, kg, piece, box, etc.
    quantity = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=10, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    available_from = Column(String(50), nullable=True) # e.g. "06:00 AM"
    available_until = Column(String(50), nullable=True) # e.g. "09:00 PM"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    inventory_transactions = relationship("InventoryTransaction", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    bulk_order_items = relationship("BulkOrderItem", back_populates="product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_date = Column(String(20), nullable=False, index=True) # YYYY-MM-DD format
    status = Column(String(30), default=OrderStatus.PENDING.value, nullable=False, index=True)
    subtotal = Column(Float, default=0.0, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    bill = relationship("Bill", back_populates="order", uselist=False, cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name_snapshot = Column(String(255), nullable=False)
    price_snapshot = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class BulkOrder(Base):
    __tablename__ = "bulk_orders"

    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_name = Column(String(255), nullable=False) # e.g. Ganesh Chaturthi, Wedding, etc.
    required_date = Column(String(20), nullable=False, index=True) # YYYY-MM-DD
    required_time = Column(String(20), nullable=True) # e.g. "10:00 AM"
    status = Column(String(30), default=BulkOrderStatus.PENDING.value, nullable=False)
    notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="bulk_orders")
    items = relationship("BulkOrderItem", back_populates="bulk_order", cascade="all, delete-orphan")

class BulkOrderItem(Base):
    __tablename__ = "bulk_order_items"

    id = Column(Integer, primary_key=True, index=True)
    bulk_order_id = Column(Integer, ForeignKey("bulk_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name_snapshot = Column(String(255), nullable=False)
    requested_quantity = Column(Integer, nullable=False)
    approved_quantity = Column(Integer, nullable=True)
    price_snapshot = Column(Float, default=0.0, nullable=False)

    bulk_order = relationship("BulkOrder", back_populates="items")
    product = relationship("Product", back_populates="bulk_order_items")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(100), index=True, nullable=False) # e.g. "conv_{user_id}" or "conv_{user_id}_{admin_id}"
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    message = Column(Text, nullable=False)
    message_type = Column(String(20), default="TEXT", nullable=False) # TEXT, SYSTEM, IMAGE
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="messages")

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    subtotal = Column(Float, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String(20), default="PAID", nullable=False) # PAID, PENDING
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="bill")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="GENERAL", nullable=False) # ORDER_STATUS, BULK_ORDER, LOW_STOCK, CHAT, BILL
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    type = Column(String(50), nullable=False) # InventoryTransactionType
    quantity = Column(Integer, nullable=False) # positive for additions, negative for deductions
    reference_type = Column(String(50), nullable=True) # ORDER, BULK_ORDER, ADMIN_MANUAL, INITIAL_STOCK
    reference_id = Column(String(50), nullable=True) # order_number, etc.
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="inventory_transactions")
