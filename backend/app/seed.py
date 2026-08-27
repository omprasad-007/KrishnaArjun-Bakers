from app.database import SessionLocal, engine, Base
from app.models.models import User, Product, InventoryTransaction, UserRole, InventoryTransactionType
from app.utils.auth import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Admin Account
        admin = db.query(User).filter(User.phone == "9876543210").first()
        if not admin:
            admin = User(
                name="Arjun Shinde (Bakery Owner)",
                phone="9876543210",
                email="admin@krishnaarjunbakers.com",
                password_hash=get_password_hash("admin123"),
                role=UserRole.ADMIN.value,
                address="Main Market Road, Near ST Stand",
                village="Sangola",
                taluka="Sangola",
                district="Solapur",
                state="Maharashtra"
            )
            db.add(admin)
            db.commit()
            print("Admin user created: Phone 9876543210 / Password admin123")
        else:
            print("Admin user already exists.")

        # 2. Seed Initial Products
        products_data = [
            {
                "name": "Fresh Ladi Pav (Pack of 6)",
                "category": "Bread & Pav",
                "description": "Soft, fluffy, freshly baked daily morning ladi pav. Perfect for Misal and Vada Pav.",
                "price": 30.0,
                "unit": "packet",
                "quantity": 120,
                "low_stock_threshold": 25,
                "image_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
                "is_available": True,
                "available_from": "06:00 AM",
                "available_until": "09:00 PM"
            },
            {
                "name": "Chakote Premium Milk Bread",
                "category": "Bread & Pav",
                "description": "Enriched nutritious milk bread from Chakote. Soft slice texture with golden crust.",
                "price": 45.0,
                "unit": "packet",
                "quantity": 75,
                "low_stock_threshold": 15,
                "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
                "is_available": True,
                "available_from": "06:00 AM",
                "available_until": "09:00 PM"
            },
            {
                "name": "Chakote Crispy Elaichi Toast",
                "category": "Toast & Khari",
                "description": "Crispy, aromatic cardamom flavored golden toasted rusk. Best companion for morning chai.",
                "price": 50.0,
                "unit": "packet",
                "quantity": 90,
                "low_stock_threshold": 20,
                "image_url": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80",
                "is_available": True,
                "available_from": "06:00 AM",
                "available_until": "09:30 PM"
            },
            {
                "name": "Layered Butter Khari Biscuit",
                "category": "Toast & Khari",
                "description": "Melt-in-mouth flaky and crispy layered butter khari made with pure ingredients.",
                "price": 55.0,
                "unit": "packet",
                "quantity": 60,
                "low_stock_threshold": 15,
                "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80",
                "is_available": True,
                "available_from": "06:00 AM",
                "available_until": "09:30 PM"
            },
            {
                "name": "Chakote Sweet Cream Roll (Pack of 4)",
                "category": "Snacks & Rolls",
                "description": "Crispy wafer cones filled with rich vanilla cream. Loved by kids and adults.",
                "price": 30.0,
                "unit": "packet",
                "quantity": 80,
                "low_stock_threshold": 20,
                "image_url": "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=80",
                "is_available": True,
                "available_from": "07:00 AM",
                "available_until": "09:30 PM"
            },
            {
                "name": "Dutch Chocolate Truffle Cake (500g)",
                "category": "Cakes & Pastries",
                "description": "Rich dark chocolate sponge layered with smooth chocolate ganache and chocolate curls.",
                "price": 380.0,
                "unit": "piece",
                "quantity": 15,
                "low_stock_threshold": 5,
                "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
                "is_available": True,
                "available_from": "08:00 AM",
                "available_until": "10:00 PM"
            },
            {
                "name": "Fresh Pineapple Glaze Cake (500g)",
                "category": "Cakes & Pastries",
                "description": "Moist vanilla sponge topped with real pineapple compote and whipped cream.",
                "price": 320.0,
                "unit": "piece",
                "quantity": 12,
                "low_stock_threshold": 4,
                "image_url": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80",
                "is_available": True,
                "available_from": "08:00 AM",
                "available_until": "10:00 PM"
            },
            {
                "name": "Sangola Special Jeera Butter Cookies (250g)",
                "category": "Cookies & Biscuits",
                "description": "Savory, salted crunchy butter cookies baked with roasted cumin seeds.",
                "price": 65.0,
                "unit": "box",
                "quantity": 45,
                "low_stock_threshold": 10,
                "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80",
                "is_available": True,
                "available_from": "07:00 AM",
                "available_until": "09:30 PM"
            }
        ]

        for p_info in products_data:
            existing = db.query(Product).filter(Product.name == p_info["name"]).first()
            if not existing:
                prod = Product(
                    name=p_info["name"],
                    category=p_info["category"],
                    description=p_info["description"],
                    price=p_info["price"],
                    unit=p_info["unit"],
                    quantity=p_info["quantity"],
                    low_stock_threshold=p_info["low_stock_threshold"],
                    image_url=p_info["image_url"],
                    is_available=p_info["is_available"],
                    available_from=p_info["available_from"],
                    available_until=p_info["available_until"]
                )
                db.add(prod)
                db.commit()
                db.refresh(prod)

                # Record opening stock transaction
                tx = InventoryTransaction(
                    product_id=prod.id,
                    type=InventoryTransactionType.OPENING_STOCK.value,
                    quantity=prod.quantity,
                    reference_type="INITIAL_SEED",
                    reference_id=f"INIT-{prod.id}"
                )
                db.add(tx)
                db.commit()
                print(f"Seeded product: {prod.name} (Stock: {prod.quantity})")

        print("Database seeded successfully with KrishnaArjun Bakers inventory and Admin credentials.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
