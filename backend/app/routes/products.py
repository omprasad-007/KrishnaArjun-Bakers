from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Product, User, InventoryTransactionType
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductOut, ProductStockUpdate
from app.utils.auth import require_admin, get_current_user
from app.services.inventory_service import record_inventory_transaction

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = None,
    available_only: bool = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if available_only:
        query = query.filter(Product.is_available == True, Product.quantity > 0)
    if category and category.strip() and category != "All":
        query = query.filter(Product.category.ilike(f"%{category.strip()}%"))
    if search and search.strip():
        query = query.filter(Product.name.ilike(f"%{search.strip()}%"))
    
    return query.order_by(Product.category, Product.name).all()

@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Product.category).distinct().all()
    return [c[0] for c in categories if c[0]]

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    product = Product(
        name=product_in.name,
        category=product_in.category,
        description=product_in.description,
        price=product_in.price,
        unit=product_in.unit,
        quantity=0, # initialized to 0, then adjusted with transaction
        low_stock_threshold=product_in.low_stock_threshold,
        image_url=product_in.image_url,
        is_available=product_in.is_available if product_in.quantity > 0 else False,
        available_from=product_in.available_from,
        available_until=product_in.available_until
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # If initial quantity > 0, record transaction
    if product_in.quantity > 0:
        record_inventory_transaction(
            db=db,
            product=product,
            tx_type=InventoryTransactionType.OPENING_STOCK.value,
            quantity_change=product_in.quantity,
            reference_type="ADMIN_INITIAL",
            reference_id=f"PROD-{product.id}"
        )

    return product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    
    update_data = product_update.dict(exclude_unset=True)
    
    # If quantity is being directly altered, handle via transaction
    if "quantity" in update_data and update_data["quantity"] is not None:
        target_qty = update_data.pop("quantity")
        diff = target_qty - product.quantity
        if diff != 0:
            record_inventory_transaction(
                db=db,
                product=product,
                tx_type=InventoryTransactionType.MANUAL_ADJUSTMENT.value,
                quantity_change=diff,
                reference_type="ADMIN_OVERWRITE",
                reference_id=f"PROD-{product.id}"
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    # Ensure is_available consistency with stock
    if product.quantity <= 0:
        product.is_available = False

    db.commit()
    db.refresh(product)
    return product

@router.post("/{product_id}/stock", response_model=ProductOut)
def update_product_stock(
    product_id: int,
    stock_in: ProductStockUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    
    tx_type = InventoryTransactionType.STOCK_ADDED.value if stock_in.quantity_change > 0 else InventoryTransactionType.MANUAL_ADJUSTMENT.value
    record_inventory_transaction(
        db=db,
        product=product,
        tx_type=tx_type,
        quantity_change=stock_in.quantity_change,
        reference_type="ADMIN_RESTOCK",
        reference_id=f"PROD-{product.id}"
    )

    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    
    db.delete(product)
    db.commit()
    return None
