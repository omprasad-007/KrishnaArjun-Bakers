from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Order, OrderStatus, User, UserRole
from app.schemas.schemas import (
    OrderCreate, OrderOut, OrderStatusUpdate, OrderModifyRequest
)
from app.utils.auth import get_current_user, require_admin
from app.services.order_service import (
    create_order, modify_order_quantities, update_order_status
)

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=List[OrderOut])
def list_orders(
    status: Optional[str] = None,
    order_date: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    
    # Customer can only view their own orders
    if current_user.role != UserRole.ADMIN.value:
        query = query.filter(Order.user_id == current_user.id)
    
    if status and status.strip() and status != "ALL":
        query = query.filter(Order.status == status.strip().upper())
    
    if order_date and order_date.strip():
        query = query.filter(Order.order_date == order_date.strip())

    if search and search.strip():
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Order.order_number.ilike(search_pattern)) |
            (Order.notes.ilike(search_pattern))
        )

    return query.order_by(Order.created_at.desc()).all()

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_order(db=db, user=current_user, order_in=order_in)

@router.get("/{order_id}", response_model=OrderOut)
def get_order_by_id(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    
    if current_user.role != UserRole.ADMIN.value and order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    
    return order

@router.patch("/{order_id}/status", response_model=OrderOut)
def update_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    
    return update_order_status(db=db, order=order, new_status=status_update.status, admin_notes=status_update.notes)

@router.patch("/{order_id}/items", response_model=OrderOut)
def modify_items(
    order_id: int,
    modify_req: OrderModifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return modify_order_quantities(db=db, order_id=order_id, user=current_user, modify_req=modify_req)

@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    
    if current_user.role != UserRole.ADMIN.value and order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if order.status not in [OrderStatus.PENDING.value, OrderStatus.ACCEPTED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order in '{order.status}' status."
        )

    return update_order_status(db=db, order=order, new_status=OrderStatus.CANCELLED.value)
