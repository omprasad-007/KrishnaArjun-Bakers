import datetime
import random
import string
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    BulkOrder, BulkOrderItem, BulkOrderStatus, Product, User, UserRole,
    Order, OrderItem, OrderStatus, InventoryTransactionType
)
from app.schemas.schemas import (
    BulkOrderCreate, BulkOrderOut, BulkOrderUpdate, OrderOut
)
from app.utils.auth import get_current_user, require_admin
from app.services.inventory_service import record_inventory_transaction
from app.services.notification_service import create_notification, notify_admins
from app.services.order_service import generate_order_number

router = APIRouter(prefix="/bulk-orders", tags=["Bulk & Festival Orders"])

def generate_bulk_request_number() -> str:
    today_str = datetime.datetime.utcnow().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"BLK-{today_str}-{random_str}"

@router.get("", response_model=List[BulkOrderOut])
def list_bulk_orders(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(BulkOrder)
    if current_user.role != UserRole.ADMIN.value:
        query = query.filter(BulkOrder.user_id == current_user.id)
    
    if status and status.strip() and status != "ALL":
        query = query.filter(BulkOrder.status == status.strip().upper())
        
    return query.order_by(BulkOrder.created_at.desc()).all()

@router.post("", response_model=BulkOrderOut, status_code=status.HTTP_201_CREATED)
def create_bulk_order(
    bulk_in: BulkOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req_num = generate_bulk_request_number()
    bulk_order = BulkOrder(
        request_number=req_num,
        user_id=current_user.id,
        event_name=bulk_in.event_name,
        required_date=bulk_in.required_date,
        required_time=bulk_in.required_time,
        status=BulkOrderStatus.PENDING.value,
        notes=bulk_in.notes
    )
    db.add(bulk_order)
    db.flush()

    for item in bulk_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found."
            )
        
        bulk_item = BulkOrderItem(
            bulk_order_id=bulk_order.id,
            product_id=product.id,
            product_name_snapshot=product.name,
            requested_quantity=item.requested_quantity,
            approved_quantity=item.requested_quantity, # default initial
            price_snapshot=product.price
        )
        db.add(bulk_item)

    db.commit()
    db.refresh(bulk_order)

    # Notifications
    create_notification(
        db=db,
        user_id=current_user.id,
        title="Festival/Bulk Request Submitted",
        message=f"Your bulk request #{bulk_order.request_number} for {bulk_order.event_name} on {bulk_order.required_date} has been submitted for bakery review.",
        notif_type="BULK_ORDER"
    )
    notify_admins(
        db=db,
        title="New Festival/Bulk Order Request",
        message=f"Bulk request #{bulk_order.request_number} received from {current_user.name} for {bulk_order.event_name} ({bulk_order.required_date}).",
        notif_type="BULK_ORDER"
    )

    return bulk_order

@router.get("/{bulk_id}", response_model=BulkOrderOut)
def get_bulk_order(
    bulk_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bulk_order = db.query(BulkOrder).filter(BulkOrder.id == bulk_id).first()
    if not bulk_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bulk order not found.")
    
    if current_user.role != UserRole.ADMIN.value and bulk_order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    
    return bulk_order

@router.patch("/{bulk_id}", response_model=BulkOrderOut)
def update_bulk_order(
    bulk_id: int,
    update_in: BulkOrderUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    bulk_order = db.query(BulkOrder).filter(BulkOrder.id == bulk_id).first()
    if not bulk_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bulk order not found.")
    
    if update_in.status:
        bulk_order.status = update_in.status
    if update_in.admin_notes is not None:
        bulk_order.admin_notes = update_in.admin_notes
    
    if update_in.items:
        for item_appr in update_in.items:
            item = db.query(BulkOrderItem).filter(
                BulkOrderItem.id == item_appr.item_id,
                BulkOrderItem.bulk_order_id == bulk_order.id
            ).first()
            if item:
                item.approved_quantity = item_appr.approved_quantity

    db.commit()
    db.refresh(bulk_order)

    # Notify Customer
    create_notification(
        db=db,
        user_id=bulk_order.user_id,
        title=f"Bulk Request #{bulk_order.request_number} Updated",
        message=f"Your bulk request status is now '{bulk_order.status}'. {bulk_order.admin_notes or ''}",
        notif_type="BULK_ORDER"
    )

    return bulk_order

@router.post("/{bulk_id}/convert-to-order", response_model=OrderOut)
def convert_bulk_to_active_order(
    bulk_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    bulk_order = db.query(BulkOrder).filter(BulkOrder.id == bulk_id).first()
    if not bulk_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bulk order not found.")
    
    # Check if stock exists for approved quantities
    subtotal = 0.0
    order_items_to_add = []
    
    for bulk_item in bulk_order.items:
        qty = bulk_item.approved_quantity if bulk_item.approved_quantity is not None else bulk_item.requested_quantity
        if qty <= 0:
            continue
        
        product = db.query(Product).filter(Product.id == bulk_item.product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product {bulk_item.product_name_snapshot} not found.")
        
        if product.quantity < qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory to convert bulk order. '{product.name}' has {product.quantity} units, need {qty}."
            )
        
        item_sub = round(bulk_item.price_snapshot * qty, 2)
        subtotal += item_sub
        order_items_to_add.append({
            "product": product,
            "product_name": bulk_item.product_name_snapshot,
            "price": bulk_item.price_snapshot,
            "quantity": qty,
            "subtotal": item_sub
        })

    order_num = generate_order_number()
    new_order = Order(
        order_number=order_num,
        user_id=bulk_order.user_id,
        order_date=bulk_order.required_date,
        status=OrderStatus.ACCEPTED.value,
        subtotal=round(subtotal, 2),
        discount=0.0,
        total_amount=round(subtotal, 2),
        notes=f"Converted from Bulk Order #{bulk_order.request_number} ({bulk_order.event_name})"
    )
    db.add(new_order)
    db.flush()

    for item_data in order_items_to_add:
        ord_item = OrderItem(
            order_id=new_order.id,
            product_id=item_data["product"].id,
            product_name_snapshot=item_data["product_name"],
            price_snapshot=item_data["price"],
            quantity=item_data["quantity"],
            subtotal=item_data["subtotal"]
        )
        db.add(ord_item)

        # Deduct stock
        record_inventory_transaction(
            db=db,
            product=item_data["product"],
            tx_type=InventoryTransactionType.ORDER_RESERVED.value,
            quantity_change=-item_data["quantity"],
            reference_type="BULK_CONVERT",
            reference_id=order_num
        )

    bulk_order.status = BulkOrderStatus.ACCEPTED.value
    db.commit()
    db.refresh(new_order)

    # Notify Customer
    create_notification(
        db=db,
        user_id=bulk_order.user_id,
        title="Bulk Order Confirmed & Converted",
        message=f"Bulk request #{bulk_order.request_number} has been converted into active Order #{new_order.order_number} for ₹{new_order.total_amount:.2f}.",
        notif_type="ORDER_STATUS"
    )

    return new_order
