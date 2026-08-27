import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import (
    Order, OrderItem, BulkOrder, Product, User, UserRole,
    OrderStatus, BulkOrderStatus
)
from app.schemas.schemas import DashboardStats, SalesReportItem, TopSellingProduct
from app.utils.auth import require_admin

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    today_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    tomorrow_str = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")

    today_orders = db.query(Order).filter(Order.order_date == today_str).all()
    today_orders_count = len(today_orders)
    
    # Exclude cancelled/rejected orders from revenue calculation
    valid_today_orders = [o for o in today_orders if o.status not in [OrderStatus.CANCELLED.value, OrderStatus.REJECTED.value]]
    today_sales = sum(o.total_amount for o in valid_today_orders)

    pending_orders_count = db.query(Order).filter(Order.status == OrderStatus.PENDING.value).count()
    preparing_orders_count = db.query(Order).filter(Order.status == OrderStatus.PREPARING.value).count()
    completed_orders_count = db.query(Order).filter(Order.status == OrderStatus.COMPLETED.value).count()

    all_completed = db.query(Order).filter(
        Order.status.in_([OrderStatus.COMPLETED.value, OrderStatus.RECEIVED.value, OrderStatus.READY.value])
    ).all()
    total_sales = sum(o.total_amount for o in all_completed)

    available_products_count = db.query(Product).filter(Product.is_available == True, Product.quantity > 0).count()
    low_stock_products_count = db.query(Product).filter(
        Product.quantity <= Product.low_stock_threshold
    ).count()

    tomorrow_orders_count = db.query(Order).filter(
        Order.order_date == tomorrow_str,
        Order.status.notin_([OrderStatus.CANCELLED.value, OrderStatus.REJECTED.value])
    ).count()

    pending_bulk_orders_count = db.query(BulkOrder).filter(
        BulkOrder.status.in_([BulkOrderStatus.PENDING.value, BulkOrderStatus.REVIEWING.value])
    ).count()

    return DashboardStats(
        today_orders_count=today_orders_count,
        pending_orders_count=pending_orders_count,
        preparing_orders_count=preparing_orders_count,
        completed_orders_count=completed_orders_count,
        today_sales=round(today_sales, 2),
        total_sales=round(total_sales, 2),
        available_products_count=available_products_count,
        low_stock_products_count=low_stock_products_count,
        tomorrow_orders_count=tomorrow_orders_count,
        pending_bulk_orders_count=pending_bulk_orders_count
    )

@router.get("/sales-trend", response_model=List[SalesReportItem])
def get_sales_trend(
    days: int = 7,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    trend = []
    base_date = datetime.datetime.utcnow().date()
    for i in range(days - 1, -1, -1):
        d = base_date - datetime.timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        orders = db.query(Order).filter(
            Order.order_date == d_str,
            Order.status.notin_([OrderStatus.CANCELLED.value, OrderStatus.REJECTED.value])
        ).all()
        day_sales = sum(o.total_amount for o in orders)
        trend.append(SalesReportItem(
            period=d.strftime("%d %b"),
            sales=round(day_sales, 2),
            order_count=len(orders)
        ))
    return trend

@router.get("/top-products", response_model=List[TopSellingProduct])
def get_top_selling_products(
    limit: int = 5,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    items = db.query(
        OrderItem.product_id,
        OrderItem.product_name_snapshot,
        func.sum(OrderItem.quantity).label("total_qty"),
        func.sum(OrderItem.subtotal).label("total_rev")
    ).join(Order).filter(
        Order.status.notin_([OrderStatus.CANCELLED.value, OrderStatus.REJECTED.value])
    ).group_by(OrderItem.product_id, OrderItem.product_name_snapshot).order_by(func.sum(OrderItem.quantity).desc()).limit(limit).all()

    results = []
    for row in items:
        p_id = row[0]
        prod = db.query(Product).filter(Product.id == p_id).first() if p_id else None
        results.append(TopSellingProduct(
            product_id=p_id or 0,
            product_name=row[1],
            category=prod.category if prod else "Bakery",
            total_quantity_sold=int(row[2] or 0),
            total_revenue=round(float(row[3] or 0.0), 2)
        ))
    return results
