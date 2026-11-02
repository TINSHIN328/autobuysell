# ⚡ ZYRO STORE

**Premium Minecraft Litecoin Marketplace**

A complete, production-ready Minecraft marketplace where customers purchase coins, items, and services using Litecoin (LTC). Features automated blockchain payment verification and instant delivery via a Minecraft bot.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ZYRO STORE                            │
├─────────────┬──────────────────┬────────────────────────┤
│   Frontend  │   Backend API    │   Minecraft Worker     │
│   (React)   │   (Express)      │   (Mineflayer)         │
│             │                  │                        │
│ • Landing   │ • Auth (Argon2)  │ • Bot Connection       │
│ • Store     │ • Products CRUD  │ • Queue Processing     │
│ • Dashboard │ • Order Creation │ • Delivery Execution   │
│ • Payment   │ • Payment Verify │ • Auto Reconnect       │
│ • Admin     │ • Admin Panel    │ • Delivery Logging     │
│ • Support   │ • Support Tickets│                        │
├─────────────┴──────────────────┴────────────────────────┤
│                    PostgreSQL Database                    │
│              (Prisma ORM + Migrations)                   │
├─────────────────────────────────────────────────────────┤
│              Litecoin Blockchain (RPC/API)               │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Litecoin Core (for production payments)
- Minecraft Java Edition server (for delivery bot)

### 1. Clone and Install

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install

# Minecraft Worker
cd ../minecraft-worker
npm install
```

### 2. Database Setup

```bash
# Set DATABASE_URL in server/.env
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed  # Creates default admin and products
```

### 3. Environment Configuration

Copy `.env.example` to `.env` in both `server/` and `minecraft-worker/` directories:

```bash
cp server/.env.example server/.env
cp minecraft-worker/.env.example minecraft-worker/.env
```

Edit each `.env` file with your actual credentials.

### 4. Start Development

```bash
# Terminal 1 - Frontend
cd client && npm run dev

# Terminal 2 - Backend
cd server && npm run dev

# Terminal 3 - Minecraft Worker
cd minecraft-worker && npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001

---

## 📁 Project Structure

```
zyro-store/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── App.tsx           # Main router
│   │   ├── index.css         # Global styles
│   │   ├── main.tsx          # Entry point
│   │   ├── types/            # TypeScript types
│   │   ├── store/            # State management (Context)
│   │   ├── components/       # Reusable components
│   │   └── pages/            # Page components
│   │       ├── Landing.tsx
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       ├── Dashboard.tsx
│   │       ├── Payment.tsx
│   │       ├── AdminPanel.tsx
│   │       └── dashboard/    # Dashboard sub-pages
│   └── index.html
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── index.ts          # Server entry
│   │   ├── routes/           # API routes
│   │   │   ├── auth.ts       # Authentication
│   │   │   ├── products.ts   # Product management
│   │   │   ├── orders.ts     # Order processing
│   │   │   ├── payments.ts   # Payment status
│   │   │   ├── admin.ts      # Admin operations
│   │   │   └── support.ts    # Support tickets
│   │   ├── middleware/        # Express middleware
│   │   │   └── auth.ts       # Auth & role checks
│   │   ├── payments/         # Payment verification
│   │   │   └── verifier.ts   # Blockchain polling
│   │   └── services/         # Business logic
│   │       └── email.ts      # Email sending
│   ├── .env.example
│   └── package.json
│
├── minecraft-worker/          # Minecraft Bot
│   ├── src/
│   │   └── index.ts          # Bot worker
│   └── package.json
│
├── prisma/                    # Database
│   └── schema.prisma         # Database schema
│
└── README.md
```

---

## 🔐 Security Features

### Authentication
- **Argon2id** password hashing (memory-hard, GPU-resistant)
- Secure session-based authentication with httpOnly cookies
- Rate limiting on login endpoints
- Email verification required
- Password reset via secure tokens

### Payment Security
- **Server-side only** blockchain verification
- Never trusts client-side payment claims
- Duplicate transaction prevention (replay attack protection)
- Idempotent payment processing
- Private wallet keys managed by Litecoin Core (never in app)
- Minimum confirmation requirements (configurable, default: 3)
- Payment expiration with automatic cleanup

### General
- Helmet.js security headers
- CORS configuration
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- XSS prevention
- CSRF protection via SameSite cookies
- Audit logging for all sensitive actions
- Role-based access control (RBAC)

---

## 💰 Litecoin Payment Flow

```
Customer selects product
        │
        ▼
Backend creates order + unique payment address
        │
        ▼
Customer sees: address, amount, QR code, timer
        │
        ▼
Customer sends LTC from their wallet
        │
        ▼
Payment Verifier polls blockchain (every 15s)
        │
        ▼
Transaction detected → check confirmations
        │
        ▼
3+ confirmations → Mark order PAID
        │
        ▼
Add to delivery queue
        │
        ▼
Minecraft bot executes delivery command
        │
        ▼
Order marked COMPLETED
```

### Configuration

In `server/.env`:
```env
LTC_RPC_HOST=127.0.0.1
LTC_RPC_PORT=9332
LTC_RPC_USER=your-rpc-username
LTC_RPC_PASSWORD=your-rpc-password
LTC_REQUIRED_CONFIRMATIONS=3
LTC_PAYMENT_TIMEOUT_MINUTES=30
```

### Litecoin Core Setup

```bash
# In your litecoin.conf:
server=1
rpcuser=your-rpc-username
rpcpassword=your-secure-password
rpcallowip=127.0.0.1
```

---

## 🎮 Minecraft Bot Configuration

The delivery worker connects to your Minecraft server and executes commands for paid orders.

### Setup

1. Ensure your Minecraft server allows the bot account as an operator
2. Configure delivery commands per product category
3. The bot auto-reconnects on disconnection

### Configuration

```env
MC_SERVER_HOST=mc.yourserver.com
MC_SERVER_PORT=25565
MC_BOT_USERNAME=ZyroDeliveryBot
MC_DELIVERY_COMMAND=/give {player} {item} {amount}
```

### Delivery Commands

The bot uses configurable command templates:
- `{player}` → Customer's Minecraft username
- `{item}` → Product delivery identifier
- `{amount}` → Quantity

For coin deliveries, the system automatically calculates emerald amounts.

---

## 📊 Database Schema

Key tables:
- `users` - Customer and admin accounts
- `sessions` - Active user sessions
- `products` - Store catalog
- `orders` - Purchase records with full lifecycle
- `payments` - Blockchain payment records
- `delivery_queue` - Pending deliveries
- `delivery_logs` - Complete audit trail
- `support_tickets` - Customer support
- `audit_logs` - Security audit trail
- `settings` - Application configuration

All tables have proper indexes, foreign keys, and constraints.

---

## 🛠️ API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| POST | `/api/auth/forgot-password` | Request reset |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List user orders |
| GET | `/api/orders/:id` | Get order details |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/status/:orderId` | Check payment |
| POST | `/api/payments/verify/:orderId` | Manual verify (admin) |

### Admin (requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | List users |
| PATCH | `/api/admin/users/:id/ban` | Ban/unban user |
| GET | `/api/admin/orders` | All orders |
| POST | `/api/admin/orders/:id/retry-delivery` | Retry delivery |
| POST | `/api/admin/products` | Create product |
| PATCH | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/settings` | Get settings |
| PUT | `/api/admin/settings` | Update settings |

### Support
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/support/tickets` | List tickets |
| POST | `/api/support/tickets` | Create ticket |
| POST | `/api/support/tickets/:id/messages` | Add message |
| PATCH | `/api/support/tickets/:id/close` | Close ticket |

---

## 🚢 Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy dist/ folder
```

### Backend (VPS/Docker)
```bash
cd server
npm run build
NODE_ENV=production node dist/index.js
```

### Minecraft Worker (Systemd)
```ini
[Unit]
Description=ZYRO STORE Minecraft Worker
After=network.target

[Service]
Type=simple
User=zyrostore
WorkingDirectory=/opt/zyro-store/minecraft-worker
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Docker Compose (Optional)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: zyro_store
      POSTGRES_USER: zyro
      POSTGRES_PASSWORD: secure-password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  server:
    build: ./server
    environment:
      DATABASE_URL: postgresql://zyro:secure-password@postgres:5432/zyro_store
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  worker:
    build: ./minecraft-worker
    environment:
      DATABASE_URL: postgresql://zyro:secure-password@postgres:5432/zyro_store
    depends_on:
      - postgres

volumes:
  pgdata:
```

---

## 🧪 Demo Mode

The frontend includes a fully functional demo mode:

1. Visit the site and register or login
2. **Demo credentials:**
   - Customer: `player1@example.com` (any password)
   - Admin: `admin@zyrostore.com` (any password)
3. Browse products and make purchases
4. On the payment page, click "Simulate LTC Payment" to test the full flow
5. Access admin panel via the sidebar (when logged in as admin)

---

## 📝 Order Statuses

| Status | Description |
|--------|-------------|
| `PENDING_PAYMENT` | Awaiting customer payment |
| `AWAITING_CONFIRMATIONS` | Transaction found, waiting for confirmations |
| `PAID` | Payment confirmed on blockchain |
| `QUEUED` | Added to delivery queue |
| `DELIVERING` | Bot is executing delivery |
| `COMPLETED` | Successfully delivered |
| `DELIVERY_FAILED` | Bot failed to deliver |
| `EXPIRED` | Payment window expired |
| `CANCELLED` | Order cancelled |

---

## 📄 License

MIT License - See LICENSE file for details.

---

## ⚠️ Disclaimer

This project is not affiliated with Mojang Studios or Microsoft. Minecraft is a trademark of Mojang Studios. Litecoin is a cryptocurrency - use at your own risk. Always comply with local regulations regarding cryptocurrency transactions.
