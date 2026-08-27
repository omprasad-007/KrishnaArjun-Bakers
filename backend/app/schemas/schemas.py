from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- AUTH & USERS ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = None
    password: str = Field(..., min_length=6)
    address: Optional[str] = None
    village: Optional[str] = "Sangola"
    taluka: Optional[str] = "Sangola"
    district: Optional[str] = "Solapur"
    state: Optional[str] = "Maharashtra"

class UserLogin(BaseModel):
    phone: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str] = None
    role: str
    address: Optional[str] = None
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

# --- PRODUCTS ---
class ProductBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    unit: str = "packet"
    quantity: int = Field(0, ge=0)
    low_stock_threshold: int = Field(10, ge=0)
    image_url: Optional[str] = None
    is_available: bool = True
    available_from: Optional[str] = None
    available_until: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    available_from: Optional[str] = None
    available_until: Optional[str] = None

class ProductStockUpdate(BaseModel):
    quantity_change: int
    reason: Optional[str] = "Manual stock update"

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- ORDERS ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    order_date: str # YYYY-MM-DD
    items: List[OrderItemCreate] = Field(..., min_items=1)
    notes: Optional[str] = None

class OrderItemOut(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name_snapshot: str
    price_snapshot: float
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    order_number: str
    user_id: int
    order_date: str
    status: str
    subtotal: float
    discount: float
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class OrderItemQuantityModify(BaseModel):
    item_id: int
    new_quantity: int = Field(..., ge=0) # 0 means remove item

class OrderModifyRequest(BaseModel):
    items: List[OrderItemQuantityModify]

# --- BULK / FESTIVAL ORDERS ---
class BulkOrderItemCreate(BaseModel):
    product_id: int
    requested_quantity: int = Field(..., gt=0)

class BulkOrderCreate(BaseModel):
    event_name: str
    required_date: str # YYYY-MM-DD
    required_time: Optional[str] = "10:00 AM"
    items: List[BulkOrderItemCreate] = Field(..., min_items=1)
    notes: Optional[str] = None

class BulkOrderItemOut(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name_snapshot: str
    requested_quantity: int
    approved_quantity: Optional[int] = None
    price_snapshot: float

    class Config:
        from_attributes = True

class BulkOrderOut(BaseModel):
    id: int
    request_number: str
    user_id: int
    event_name: str
    required_date: str
    required_time: Optional[str] = None
    status: str
    notes: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[BulkOrderItemOut] = []
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class BulkOrderItemApproval(BaseModel):
    item_id: int
    approved_quantity: int = Field(..., ge=0)

class BulkOrderUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None
    items: Optional[List[BulkOrderItemApproval]] = None

# --- BILLS ---
class BillOut(BaseModel):
    id: int
    bill_number: str
    order_id: int
    subtotal: float
    discount: float
    total: float
    status: str
    created_at: datetime
    order: Optional[OrderOut] = None

    class Config:
        from_attributes = True

# --- NOTIFICATIONS ---
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- INVENTORY TRANSACTIONS ---
class InventoryTransactionOut(BaseModel):
    id: int
    product_id: int
    type: str
    quantity: int
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    created_at: datetime
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True

# --- MESSAGES & CHAT ---
class MessageCreate(BaseModel):
    receiver_id: Optional[int] = None
    order_id: Optional[int] = None
    message: str = Field(..., min_length=1)
    message_type: str = "TEXT"

class MessageOut(BaseModel):
    id: int
    conversation_id: str
    sender_id: int
    receiver_id: Optional[int] = None
    order_id: Optional[int] = None
    message: str
    message_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationSummary(BaseModel):
    conversation_id: str
    customer_id: int
    customer_name: str
    customer_phone: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0
    latest_order_id: Optional[int] = None
    latest_order_number: Optional[str] = None

# --- CALENDAR & DASHBOARD & REPORTS ---
class DailyProductRequirement(BaseModel):
    product_id: int
    product_name: str
    category: str
    unit: str
    regular_order_qty: int
    bulk_order_qty: int
    total_required_qty: int
    current_in_stock: int

class CalendarSummaryOut(BaseModel):
    date: str # YYYY-MM-DD
    total_orders: int
    total_bulk_orders: int
    products_required: List[DailyProductRequirement]

class DashboardStats(BaseModel):
    today_orders_count: int
    pending_orders_count: int
    preparing_orders_count: int
    completed_orders_count: int
    today_sales: float
    total_sales: float
    available_products_count: int
    low_stock_products_count: int
    tomorrow_orders_count: int
    pending_bulk_orders_count: int

class SalesReportItem(BaseModel):
    period: str
    sales: float
    order_count: int

class TopSellingProduct(BaseModel):
    product_id: int
    product_name: str
    category: str
    total_quantity_sold: int
    total_revenue: float
