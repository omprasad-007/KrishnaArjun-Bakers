from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from app.config import settings
from app.database import engine, Base
from app.routes import (
    auth, products, orders, bulk_orders, inventory, bills,
    notifications, chat, calendar, reports, customers
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("krishnaarjun_bakers")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack Bakery Customer Ordering, Inventory, Advance-Order, Festival-Order, Billing and Communication Suite for KrishnaArjun Bakers (Chakote Brand Dealer, Sangola)",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to configured domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(products.router, prefix=api_prefix)
app.include_router(orders.router, prefix=api_prefix)
app.include_router(bulk_orders.router, prefix=api_prefix)
app.include_router(inventory.router, prefix=api_prefix)
app.include_router(bills.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(chat.router, prefix=api_prefix)
app.include_router(calendar.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(customers.router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.BAKERY_NAME} API",
        "tagline": settings.BAKERY_TAGLINE,
        "location": settings.BAKERY_LOCATION,
        "status": "Online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal bakery server error occurred. Please try again or contact support."}
    )
