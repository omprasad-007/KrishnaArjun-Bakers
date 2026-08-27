# 🥖 KrishnaArjun Bakers Management Suite
> **Authorized Chakote Brand Dealer • Sangola, Solapur, Maharashtra, India**

A full-stack, production-ready bakery customer ordering, live inventory ledger, advance-order, festival/bulk-order, digital billing, real-time messaging, and production planning management platform built on **React 19 + Tailwind CSS + Firebase (Auth, Cloud Firestore, Cloud Functions, Firestore Security Rules)**.

---

## 🌟 Key Features

### 🛒 Customer Ordering & Experience (Mobile-First)
- **Artisanal Warmth UI**: Soft-organic shape language, golden crust color palette (`#8B4513`, `#FEA619`, `#FFFBF5`), and typography (Plus Jakarta Sans + Inter).
- **Fresh Daily Catalog**: Real-time catalog with dynamic inventory checks (In Stock / Low Stock / SOLD OUT).
- **Advance & Same-Day Ordering**: Flexible date selector (*Today's Batch*, *Tomorrow Morning*, *Custom Advance Date*).
- **Live Status & Dough Progress Bar**: Real-time baking pipeline (`PENDING` → `ACCEPTED` → `PREPARING` → `READY` → `COMPLETED`).
- **Pre-Bake Quantity Modification**: Modify items and quantities before kitchen cutoff time with live inventory stock validation.
- **Festival & Bulk Orders**: Dedicated workflow for Ganesh Chaturthi, Diwali Faral, weddings, and community catering.
- **Official Digital Bills**: Printable & downloadable formatted tax invoices with dealer information and breakdown.
- **Live Baker Chat**: Direct real-time Firestore native messaging linked to specific orders.

### 👑 Admin Management Suite (Desktop & Tablet)
- **Executive Operations Dashboard**: Real-time metrics for Today's Sales, In-Oven batches, Pending approvals, Low-stock alerts, and Tomorrow's pre-orders.
- **Product Management**: Full CRUD, categories, prices, units, low-stock limits, and availability schedules.
- **Inventory Ledger**: Stock control with immutable transaction logs (`OPENING_STOCK`, `STOCK_ADDED`, `ORDER_RESERVED`, `ORDER_CANCELLED`, etc.) and negative stock prevention.
- **Daily Baking Production Calendar**: Automatic aggregation of total product quantities required across regular and bulk orders for any selected date.
- **Bulk Order Review Desk**: Review festival requests, approve or modify quantities, add admin notes, and convert to active orders.
- **Multi-Customer Live Chat Desk**: Real-time chat inbox with unread counts and linked order cards.
- **Sales Analytics & Reports**: Revenue trends (7/14/30 days), top-selling products, and order frequency statistics.

---

## 🏗️ Firebase Architecture

```
KrishnaArjun Bakers
├── firestore.rules           # Security rules enforcing Customer & Admin permissions
├── firebase.json             # Firebase Hosting, Firestore & Emulators configuration
├── functions/                # Firebase Cloud Functions (Atomic Business Logic)
│   ├── index.js              # placeOrder (atomic runTransaction), modifyOrderItems, updateOrderStatus
│   └── package.json
│
└── frontend/                 # React 19 + Vite 8 + Tailwind CSS + Firebase SDK
    ├── src/
    │   ├── firebase/
    │   │   ├── config.js     # Firebase App, Auth, Firestore, Functions initialization
    │   │   └── seedFirestore.js
    │   ├── services/
    │   │   ├── firebaseService.js # Firestore onSnapshot listeners & atomic transactions
    │   │   └── api.js        # Unified bridge client
    │   ├── components/       # DoughProgressBar, Navbar, Sidebar, BottomNav, Modals
    │   ├── context/          # AuthContext, CartContext, ToastContext
    │   ├── pages/            # Customer & Admin pages
    │   └── App.jsx           # React Router & Role-based ProtectedRoute
    └── tailwind.config.js    # Stitch design tokens
```

---

## 🚀 Quick Start & Running Locally

### 1. Frontend Setup
```bash
cd frontend

# Install Node packages
npm install

# Start Vite Development Server
npm run dev -- --host 127.0.0.1 --port 5174
```
Access the application in your browser at: `http://127.0.0.1:5174/`

### 2. Firebase Emulators / Deployment
```bash
# Start Firebase Local Emulators (Auth, Firestore, Functions)
firebase emulators:start

# Deploy to Live Firebase Project
firebase deploy
```

---

## 🔑 Default Credentials

- **Admin Account**:
  - **Phone**: `9876543210`
  - **Password**: `admin123`
  - **Access**: Full Admin Console (`/admin`)

- **Customer Registration**:
  - Customers can register directly on the storefront (`/register`) with name, phone, address, and password.
# KrishnaArjun-Bakers
