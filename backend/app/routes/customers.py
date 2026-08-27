from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import User, UserRole, Order, OrderStatus
from app.utils.auth import require_admin

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[dict])
def list_customers(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    customers = db.query(User).filter(User.role == UserRole.CUSTOMER.value).all()
    result = []
    
    for c in customers:
        orders = db.query(Order).filter(
            Order.user_id == c.id,
            Order.status.notin_([OrderStatus.CANCELLED.value, OrderStatus.REJECTED.value])
        ).all()
        
        last_order = db.query(Order).filter(Order.user_id == c.id).order_by(Order.created_at.desc()).first()
        total_spent = sum(o.total_amount for o in orders)
        
        result.append({
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
            "email": c.email,
            "address": c.address,
            "village": c.village,
            "taluka": c.taluka,
            "district": c.district,
            "state": c.state,
            "total_orders": len(orders),
            "total_spending": round(total_spent, 2),
            "last_order_date": last_order.order_date if last_order else None,
            "created_at": c.created_at
        })
        
    return result
