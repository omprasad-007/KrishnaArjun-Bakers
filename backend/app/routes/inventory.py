from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import InventoryTransaction, Product, User
from app.schemas.schemas import InventoryTransactionOut
from app.utils.auth import require_admin

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/transactions", response_model=List[InventoryTransactionOut])
def get_inventory_transactions(
    product_id: Optional[int] = None,
    limit: int = 100,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(InventoryTransaction)
    if product_id:
        query = query.filter(InventoryTransaction.product_id == product_id)
    
    return query.order_by(InventoryTransaction.created_at.desc()).limit(limit).all()

@router.get("/low-stock", response_model=List[dict])
def get_low_stock_summary(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    products = db.query(Product).filter(
        Product.quantity <= Product.low_stock_threshold
    ).order_by(Product.quantity.asc()).all()
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "quantity": p.quantity,
            "low_stock_threshold": p.low_stock_threshold,
            "unit": p.unit,
            "is_sold_out": p.quantity == 0
        }
        for p in products
    ]
