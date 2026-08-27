from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Product, InventoryTransaction, InventoryTransactionType
from app.services.notification_service import notify_admins

def record_inventory_transaction(
    db: Session,
    product: Product,
    tx_type: str,
    quantity_change: int,
    reference_type: str = None,
    reference_id: str = None
) -> InventoryTransaction:
    """
    Updates product stock and records an immutable inventory transaction.
    quantity_change: positive (adding stock) or negative (deducting stock)
    """
    new_quantity = product.quantity + quantity_change
    if new_quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested change: {quantity_change}"
        )
    
    product.quantity = new_quantity
    
    # Automatic availability management
    if product.quantity == 0:
        product.is_available = False
    elif product.quantity > 0 and not product.is_available:
        product.is_available = True

    # Low stock alert
    if product.quantity > 0 and product.quantity <= product.low_stock_threshold:
        notify_admins(
            db,
            title="Low Stock Alert",
            message=f"Product '{product.name}' is running low! Only {product.quantity} {product.unit}(s) left in stock.",
            notif_type="LOW_STOCK"
        )

    tx = InventoryTransaction(
        product_id=product.id,
        type=tx_type,
        quantity=quantity_change,
        reference_type=reference_type,
        reference_id=reference_id
    )
    db.add(tx)
    db.add(product)
    db.commit()
    db.refresh(product)
    db.refresh(tx)
    return tx
