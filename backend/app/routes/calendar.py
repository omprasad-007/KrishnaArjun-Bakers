import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import (
    Order, OrderItem, BulkOrder, BulkOrderItem, Product, User,
    OrderStatus, BulkOrderStatus
)
from app.schemas.schemas import CalendarSummaryOut, DailyProductRequirement
from app.utils.auth import require_admin, get_current_user

router = APIRouter(prefix="/calendar", tags=["Calendar & Production Planning"])

@router.get("/summary", response_model=CalendarSummaryOut)
def get_daily_production_summary(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Regular active orders on this date (exclude CANCELLED and REJECTED)
    active_statuses = [
        OrderStatus.PENDING.value, OrderStatus.ACCEPTED.value,
        OrderStatus.PREPARING.value, OrderStatus.READY.value,
        OrderStatus.RECEIVED.value, OrderStatus.COMPLETED.value
    ]
    orders = db.query(Order).filter(
        Order.order_date == date,
        Order.status.in_(active_statuses)
    ).all()

    # Bulk active orders on this date
    bulk_statuses = [
        BulkOrderStatus.PENDING.value, BulkOrderStatus.REVIEWING.value,
        BulkOrderStatus.ACCEPTED.value, BulkOrderStatus.PREPARING.value,
        BulkOrderStatus.READY.value, BulkOrderStatus.COMPLETED.value
    ]
    bulk_orders = db.query(BulkOrder).filter(
        BulkOrder.required_date == date,
        BulkOrder.status.in_(bulk_statuses)
    ).all()

    # Aggregate quantities per product
    product_map: Dict[int, Dict[str, Any]] = {}

    # All products in catalog
    all_products = db.query(Product).all()
    for p in all_products:
        product_map[p.id] = {
            "product_id": p.id,
            "product_name": p.name,
            "category": p.category,
            "unit": p.unit,
            "regular_order_qty": 0,
            "bulk_order_qty": 0,
            "total_required_qty": 0,
            "current_in_stock": p.quantity
        }

    # Sum regular orders
    for ord in orders:
        for item in ord.items:
            p_id = item.product_id
            if p_id in product_map:
                product_map[p_id]["regular_order_qty"] += item.quantity
                product_map[p_id]["total_required_qty"] += item.quantity

    # Sum bulk orders
    for b_ord in bulk_orders:
        for b_item in b_ord.items:
            p_id = b_item.product_id
            qty = b_item.approved_quantity if b_item.approved_quantity is not None else b_item.requested_quantity
            if p_id in product_map:
                product_map[p_id]["bulk_order_qty"] += qty
                product_map[p_id]["total_required_qty"] += qty

    # Filter only products that have demands or all products if requested
    req_list = [
        DailyProductRequirement(**p_data)
        for p_data in product_map.values()
        if p_data["total_required_qty"] > 0 or p_data["current_in_stock"] > 0
    ]
    req_list.sort(key=lambda x: x.total_required_qty, reverse=True)

    return CalendarSummaryOut(
        date=date,
        total_orders=len(orders),
        total_bulk_orders=len(bulk_orders),
        products_required=req_list
    )

@router.get("/month-overview")
def get_month_overview(
    year: int = Query(...),
    month: int = Query(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Returns order count breakdown per day for a month"""
    prefix = f"{year:04d}-{month:02d}-"
    orders = db.query(Order.order_date, func.count(Order.id)).filter(
        Order.order_date.like(f"{prefix}%"),
        Order.status != OrderStatus.CANCELLED.value,
        Order.status != OrderStatus.REJECTED.value
    ).group_by(Order.order_date).all()

    bulk_orders = db.query(BulkOrder.required_date, func.count(BulkOrder.id)).filter(
        BulkOrder.required_date.like(f"{prefix}%"),
        BulkOrder.status != BulkOrderStatus.REJECTED.value
    ).group_by(BulkOrder.required_date).all()

    day_data = {}
    for dt, count in orders:
        if dt not in day_data:
            day_data[dt] = {"orders": 0, "bulk": 0}
        day_data[dt]["orders"] = count

    for dt, count in bulk_orders:
        if dt not in day_data:
            day_data[dt] = {"orders": 0, "bulk": 0}
        day_data[dt]["bulk"] = count

    return day_data
