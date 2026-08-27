from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Bill, Order, User, UserRole
from app.schemas.schemas import BillOut
from app.utils.auth import get_current_user, require_admin

router = APIRouter(prefix="/bills", tags=["Bills"])

@router.get("", response_model=List[BillOut])
def list_bills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Bill).join(Order)
    if current_user.role != UserRole.ADMIN.value:
        query = query.filter(Order.user_id == current_user.id)
    
    return query.order_by(Bill.created_at.desc()).all()

@router.get("/{bill_id}", response_model=BillOut)
def get_bill(
    bill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found.")
    
    if current_user.role != UserRole.ADMIN.value and bill.order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    
    return bill

@router.get("/order/{order_id}", response_model=BillOut)
def get_bill_by_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(Bill.order_id == order_id).first()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not generated for this order yet.")
    
    if current_user.role != UserRole.ADMIN.value and bill.order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    
    return bill
