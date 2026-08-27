import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.models.models import User, Product, Order, UserRole, OrderStatus
from app.utils.auth import get_password_hash

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_bakery.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create test admin
    admin = User(
        name="Admin Arjun",
        phone="9999999999",
        email="admin@test.com",
        password_hash=get_password_hash("admin123"),
        role=UserRole.ADMIN.value,
        village="Sangola"
    )
    # Create test customer
    customer = User(
        name="Customer Ramesh",
        phone="8888888888",
        email="ramesh@test.com",
        password_hash=get_password_hash("cust123"),
        role=UserRole.CUSTOMER.value,
        village="Sangola"
    )
    # Create test product
    product = Product(
        name="Test Milk Bread",
        category="Bread & Pav",
        price=40.0,
        unit="packet",
        quantity=50,
        low_stock_threshold=10,
        is_available=True
    )
    db.add_all([admin, customer, product])
    db.commit()
    db.close()
    yield

def get_tokens():
    admin_login = client.post("/api/auth/login", json={"phone": "9999999999", "password": "admin123"})
    admin_token = admin_login.json()["access_token"]
    
    cust_login = client.post("/api/auth/login", json={"phone": "8888888888", "password": "cust123"})
    cust_token = cust_login.json()["access_token"]
    return admin_token, cust_token

def test_auth_login():
    res = client.post("/api/auth/login", json={"phone": "9999999999", "password": "admin123"})
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert res.json()["user"]["role"] == "ADMIN"

def test_customer_cannot_access_admin_endpoints():
    admin_token, cust_token = get_tokens()
    
    # Customer attempts to add a product -> 403 Forbidden
    res = client.post(
        "/api/products",
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "name": "Unauthorized Cake",
            "category": "Cakes",
            "price": 300.0,
            "quantity": 10
        }
    )
    assert res.status_code == 403
    assert "Admin privileges required" in res.json()["detail"]

def test_product_stock_and_negative_stock_prevention():
    admin_token, cust_token = get_tokens()
    
    # Restock product
    res = client.post(
        "/api/products/1/stock",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"quantity_change": 20, "reason": "Fresh morning batch"}
    )
    assert res.status_code == 200
    assert res.json()["quantity"] == 70

    # Attempt to deduct more stock than available -> 400 Bad Request
    res = client.post(
        "/api/products/1/stock",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"quantity_change": -100, "reason": "Excess deduction"}
    )
    assert res.status_code == 400
    assert "Insufficient stock" in res.json()["detail"]

def test_order_creation_and_stock_deduction():
    admin_token, cust_token = get_tokens()
    
    # Place order for 20 items (starts with 50 in stock)
    order_res = client.post(
        "/api/orders",
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "order_date": "2026-10-15",
            "items": [{"product_id": 1, "quantity": 20}],
            "notes": "Please pack fresh"
        }
    )
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["total_amount"] == 800.0
    assert order_data["status"] == "PENDING"
    
    # Verify product stock deducted: 50 - 20 = 30
    prod_res = client.get("/api/products/1")
    assert prod_res.json()["quantity"] == 30

def test_order_quantity_modification():
    admin_token, cust_token = get_tokens()
    
    # Place order for 10 units (stock becomes 40)
    order_res = client.post(
        "/api/orders",
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "order_date": "2026-10-15",
            "items": [{"product_id": 1, "quantity": 10}]
        }
    )
    order_id = order_res.json()["id"]
    item_id = order_res.json()["items"][0]["id"]
    
    # Modify quantity from 10 -> 25 (requires 15 more, available: 40)
    mod_res = client.patch(
        f"/api/orders/{order_id}/items",
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "items": [{"item_id": item_id, "new_quantity": 25}]
        }
    )
    assert mod_res.status_code == 200
    assert mod_res.json()["total_amount"] == 1000.0 # 25 * 40
    
    # Check product stock (50 - 25 = 25)
    prod_res = client.get("/api/products/1")
    assert prod_res.json()["quantity"] == 25

    # Modify quantity to exceed available stock (25 + 50 = 75, only 25 available)
    mod_fail = client.patch(
        f"/api/orders/{order_id}/items",
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "items": [{"item_id": item_id, "new_quantity": 80}]
        }
    )
    assert mod_fail.status_code == 400
    assert "available" in mod_fail.json()["detail"]

def test_order_cancellation_stock_rollback():
    admin_token, cust_token = get_tokens()
    
    # Place order for 15 units (stock becomes 35)
    order_res = client.post(
        "/api/orders",
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "order_date": "2026-10-15",
            "items": [{"product_id": 1, "quantity": 15}]
        }
    )
    order_id = order_res.json()["id"]
    
    # Cancel order
    cancel_res = client.post(
        f"/api/orders/{order_id}/cancel",
        headers={"Authorization": f"Bearer {cust_token}"}
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "CANCELLED"
    
    # Product stock should be restored back to 50
    prod_res = client.get("/api/products/1")
    assert prod_res.json()["quantity"] == 50

def test_bulk_order_workflow():
    admin_token, cust_token = get_tokens()
    
    # Customer submits bulk request for Ganesh Chaturthi
    bulk_res = client.post(
        "/api/bulk-orders",
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "event_name": "Ganesh Chaturthi Festival",
            "required_date": "2026-09-07",
            "required_time": "08:00 AM",
            "items": [{"product_id": 1, "requested_quantity": 30}],
            "notes": "Fresh early morning delivery needed"
        }
    )
    assert bulk_res.status_code == 201
    bulk_id = bulk_res.json()["id"]
    item_id = bulk_res.json()["items"][0]["id"]
    
    # Admin reviews and modifies approved quantity to 25
    admin_update = client.patch(
        f"/api/bulk-orders/{bulk_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "status": "ACCEPTED",
            "admin_notes": "Approved for 25 units at morning batch",
            "items": [{"item_id": item_id, "approved_quantity": 25}]
        }
    )
    assert admin_update.status_code == 200
    assert admin_update.json()["status"] == "ACCEPTED"
    assert admin_update.json()["items"][0]["approved_quantity"] == 25

    # Admin converts bulk order to active confirmed order
    convert_res = client.post(
        f"/api/bulk-orders/{bulk_id}/convert-to-order",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert convert_res.status_code == 200
    assert convert_res.json()["total_amount"] == 1000.0 # 25 * 40
