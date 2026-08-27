import datetime
import random
import string
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import (
    Order, OrderItem, OrderStatus, Product, Bill, 
    InventoryTransactionType, User
)
from app.schemas.schemas import OrderCreate, OrderModifyRequest
from app.services.inventory_service import record_inventory_transaction
from app.services.notification_service import create_notification, notify_admins
from app.services.websocket_manager import ws_manager
from app.config import settings

def generate_order_number() -> str:
    today_str = datetime.datetime.utcnow().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"KA-{today_str}-{random_str}"

def generate_bill_number() -> str:
    today_str = datetime.datetime.utcnow().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.digits, k=5))
    return f"INV-{today_str}-{random_str}"

def create_order(db: Session, user: User, order_in: OrderCreate) -> Order:
    # Validate order date (must not be in the past)
    try:
        req_date = datetime.datetime.strptime(order_in.order_date, "%Y-%m-%d").date()
        today = datetime.datetime.utcnow().date()
        if req_date < today:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order date cannot be in the past."
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD."
        )

    # Validate items and check stock availability
    order_items_data = []
    subtotal = 0.0

    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first() if db.bind.dialect.name != "sqlite" else db.query(Product).filter(Product.id == item.product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} was not found."
            )
        if not product.is_available or product.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.name}' is currently SOLD OUT."
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.quantity} unit(s) of '{product.name}' available. You requested {item.quantity}."
            )
        
        item_subtotal = round(product.price * item.quantity, 2)
        subtotal += item_subtotal
        order_items_data.append({
            "product": product,
            "product_id": product.id,
            "product_name_snapshot": product.name,
            "price_snapshot": product.price,
            "quantity": item.quantity,
            "subtotal": item_subtotal
        })

    order_num = generate_order_number()
    order = Order(
        order_number=order_num,
        user_id=user.id,
        order_date=order_in.order_date,
        status=OrderStatus.PENDING.value,
        subtotal=round(subtotal, 2),
        discount=0.0,
        total_amount=round(subtotal, 2),
        notes=order_in.notes
    )
    db.add(order)
    db.flush() # get order.id

    for item_info in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_info["product_id"],
            product_name_snapshot=item_info["product_name_snapshot"],
            price_snapshot=item_info["price_snapshot"],
            quantity=item_info["quantity"],
            subtotal=item_info["subtotal"]
        )
        db.add(order_item)
        
        # Deduct stock and record transaction
        record_inventory_transaction(
            db=db,
            product=item_info["product"],
            tx_type=InventoryTransactionType.ORDER_RESERVED.value,
            quantity_change=-item_info["quantity"],
            reference_type="ORDER",
            reference_id=order_num
        )

    db.commit()
    db.refresh(order)

    # Notifications
    create_notification(
        db=db,
        user_id=user.id,
        title="Order Placed Successfully",
        message=f"Your order #{order.order_number} for ₹{order.total_amount:.2f} has been placed.",
        notif_type="ORDER_STATUS"
    )
    notify_admins(
        db=db,
        title="New Order Received",
        message=f"New order #{order.order_number} placed by {user.name} for {order.order_date} (₹{order.total_amount:.2f}).",
        notif_type="NEW_ORDER"
    )

    return order

def modify_order_quantities(db: Session, order_id: int, user: User, modify_req: OrderModifyRequest) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    
    # Verify permission: only the order owner or admin
    if user.role != "ADMIN" and order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this order.")

    # Status check: only editable when PENDING or ACCEPTED
    if order.status not in [OrderStatus.PENDING.value, OrderStatus.ACCEPTED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order cannot be modified in '{order.status}' status."
        )

    # Check cutoff time if user is customer
    if user.role != "ADMIN":
        try:
            req_date = datetime.datetime.strptime(order.order_date, "%Y-%m-%d").date()
            today = datetime.datetime.utcnow().date()
            if req_date < today:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cutoff time has passed for this delivery date."
                )
        except ValueError:
            pass

    # Process modifications
    new_subtotal = 0.0
    modifications_made = []

    for mod_item in modify_req.items:
        existing_item = db.query(OrderItem).filter(
            OrderItem.id == mod_item.item_id,
            OrderItem.order_id == order.id
        ).first()

        if not existing_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order item with ID {mod_item.item_id} not found in this order."
            )

        product = db.query(Product).filter(Product.id == existing_item.product_id).first()
        old_qty = existing_item.quantity
        new_qty = mod_item.new_quantity
        qty_diff = new_qty - old_qty

        if qty_diff > 0:
            # Customer wants more
            if not product or product.quantity < qty_diff:
                avail = product.quantity if product else 0
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Only {avail} additional units of '{existing_item.product_name_snapshot}' are available."
                )
            record_inventory_transaction(
                db=db,
                product=product,
                tx_type=InventoryTransactionType.QUANTITY_INCREASED.value,
                quantity_change=-qty_diff,
                reference_type="ORDER_MOD",
                reference_id=order.order_number
            )
        elif qty_diff < 0:
            # Customer wants less
            return_qty = abs(qty_diff)
            if product:
                record_inventory_transaction(
                    db=db,
                    product=product,
                    tx_type=InventoryTransactionType.QUANTITY_DECREASED.value,
                    quantity_change=return_qty,
                    reference_type="ORDER_MOD",
                    reference_id=order.order_number
                )

        if new_qty == 0:
            db.delete(existing_item)
            modifications_made.append(f"{existing_item.product_name_snapshot} removed")
        else:
            existing_item.quantity = new_qty
            existing_item.subtotal = round(existing_item.price_snapshot * new_qty, 2)
            db.add(existing_item)
            modifications_made.append(f"{existing_item.product_name_snapshot}: {old_qty} → {new_qty}")

    db.flush()

    # Recalculate order total from remaining items
    remaining_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    if not remaining_items:
        # All items removed -> cancel order
        order.status = OrderStatus.CANCELLED.value
        order.subtotal = 0.0
        order.total_amount = 0.0
    else:
        calculated_total = sum(i.subtotal for i in remaining_items)
        order.subtotal = round(calculated_total, 2)
        order.total_amount = round(calculated_total - order.discount, 2)

    db.commit()
    db.refresh(order)

    # Notify
    change_summary = ", ".join(modifications_made)
    create_notification(
        db=db,
        user_id=order.user_id,
        title="Order Quantity Updated",
        message=f"Your order #{order.order_number} has been updated ({change_summary}). New Total: ₹{order.total_amount:.2f}",
        notif_type="ORDER_MODIFIED"
    )
    notify_admins(
        db=db,
        title="Order Modified by Customer",
        message=f"Order #{order.order_number} items modified: {change_summary}. New Total: ₹{order.total_amount:.2f}",
        notif_type="ORDER_MODIFIED"
    )

    return order

def update_order_status(db: Session, order: Order, new_status: str, admin_notes: str = None) -> Order:
    old_status = order.status
    order.status = new_status
    if admin_notes:
        order.notes = (order.notes or "") + f" [Admin: {admin_notes}]"

    # Stock rollback on Cancellation or Rejection
    if new_status in [OrderStatus.CANCELLED.value, OrderStatus.REJECTED.value] and old_status not in [OrderStatus.CANCELLED.value, OrderStatus.REJECTED.value]:
        for item in order.items:
            if item.product:
                record_inventory_transaction(
                    db=db,
                    product=item.product,
                    tx_type=InventoryTransactionType.ORDER_CANCELLED.value,
                    quantity_change=item.quantity,
                    reference_type="ORDER_CANCEL",
                    reference_id=order.order_number
                )

    # Generate Digital Bill on READY, RECEIVED, or COMPLETED if not exists
    if new_status in [OrderStatus.READY.value, OrderStatus.RECEIVED.value, OrderStatus.COMPLETED.value]:
        existing_bill = db.query(Bill).filter(Bill.order_id == order.id).first()
        if not existing_bill:
            bill = Bill(
                bill_number=generate_bill_number(),
                order_id=order.id,
                subtotal=order.subtotal,
                discount=order.discount,
                total=order.total_amount,
                status="PAID" if new_status == OrderStatus.COMPLETED.value else "PENDING"
            )
            db.add(bill)
            create_notification(
                db=db,
                user_id=order.user_id,
                title="Bill Generated",
                message=f"Bill #{bill.bill_number} generated for Order #{order.order_number}.",
                notif_type="BILL"
            )

    db.commit()
    db.refresh(order)

    # Notify Customer
    status_messages = {
        OrderStatus.ACCEPTED.value: "Your order has been accepted by KrishnaArjun Bakers.",
        OrderStatus.PREPARING.value: "Your order is now being freshly baked & prepared in the kitchen!",
        OrderStatus.READY.value: "Your order is READY for pickup / delivery!",
        OrderStatus.RECEIVED.value: "Order received confirmed.",
        OrderStatus.COMPLETED.value: "Your order is completed. Thank you for choosing KrishnaArjun Bakers!",
        OrderStatus.CANCELLED.value: "Your order has been cancelled.",
        OrderStatus.REJECTED.value: "Your order could not be accepted. Any reserved stock was released."
    }
    
    msg = status_messages.get(new_status, f"Order status updated to {new_status}.")
    create_notification(
        db=db,
        user_id=order.user_id,
        title=f"Order #{order.order_number} {new_status}",
        message=msg,
        notif_type="ORDER_STATUS"
    )

    return order
