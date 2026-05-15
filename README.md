# VELORA - Modern E-Commerce Platform

Full-stack e-commerce website built with **Express.js**, **MongoDB**, **Mongoose**, and vanilla **JavaScript** (SPA frontend).

## Features

- **Product Catalog** — Browse, search, filter by category/sort, paginated grid view
- **User Accounts** — Register, login, JWT auth, profile management
- **Shopping Cart** — Add/remove/update quantities, promo code validation
- **Checkout** — Multi-step (shipping → payment → review → confirmation), Stripe payment intent integration
- **Product Reviews** — Star rating, title/comment, auto-updates product rating aggregation
- **Wishlist** — Toggle heart icon, persisted per user or localStorage for guests
- **Order Management** — Order history, user cancellation (pending/confirmed only), admin status updates
- **Admin Dashboard** — Product CRUD (add/edit/delete), order management, promo codes, sales analytics with charts
- **Promo Codes** — Create/manage discount codes with usage limits, expiry dates, minimum order values
- **Password Reset** — Forgot/reset flow with token-based email links
- **Newsletter** — Subscribe endpoint
- **Image Upload** — Single/multiple via Multer + base64 preview
- **Responsive Design** — Dark/light theme, mobile hamburger menu
- **Stock Alerts** — Low stock (≤10) and out-of-stock badges in admin panel
- **Related Products** — Same-category suggestions in product modal

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### Installation

```bash
git clone https://github.com/abrehman217788-code/ecommerce-website.git
cd ecommerce-website
npm install
cp .env.example .env
```

Edit `.env` with your settings (at minimum `MONGODB_URI`).

### Seed Data

```bash
npm run seed
```

Creates 13 products, an admin user (`admin@velora.com` / `admin1234`), a customer user (`customer@velora.com` / `customer1234`), and a `SAVE20` promo code.

### Run

```bash
npm start
```

Open http://localhost:5000

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (optional, for live payments) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email config for password reset |
| `CLIENT_URL` | Frontend URL for reset link (default: http://localhost:5000) |

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | — | Get current user from token |
| POST | `/api/auth/forgot` | — | Request password reset |
| POST | `/api/auth/reset` | — | Reset password with token |
| GET | `/api/products` | — | List products (filter, sort, paginate) |
| GET | `/api/products/:id` | — | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/orders` | User | List user's orders |
| POST | `/api/orders` | User | Create order |
| POST | `/api/orders/:id/cancel` | User | Cancel own order (pending/confirmed only) |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/me` | User | Get profile |
| PUT | `/api/users/me` | User | Update profile |
| POST | `/api/users/wishlist` | User | Toggle wishlist item |
| PUT | `/api/users/:id/role` | Admin | Change user role |
| POST | `/api/upload` | Admin | Upload single image |
| POST | `/api/upload/multiple` | Admin | Upload multiple images |
| POST | `/api/payment/create-payment-intent` | User | Create Stripe payment intent |
| POST | `/api/payment/confirm` | User | Confirm order after payment |
| GET | `/api/reviews/product/:id` | — | Get product reviews |
| POST | `/api/reviews` | User | Submit review |
| DELETE | `/api/reviews/:id` | User/Admin | Delete review |
| GET | `/api/promo-codes` | Admin | List promo codes |
| POST | `/api/promo-codes` | Admin | Create promo code |
| POST | `/api/promo-codes/validate` | — | Validate promo code |
| PUT | `/api/promo-codes/:id` | Admin | Update promo code |
| DELETE | `/api/promo-codes/:id` | Admin | Delete promo code |
| POST | `/api/newsletter` | — | Subscribe email |

## Tech Stack

- **Backend:** Express 5, Mongoose, JWT, bcryptjs
- **Payments:** Stripe (optional, demo mode without key)
- **Email:** Nodemailer (optional)
- **Frontend:** Vanilla JS SPA, CSS custom properties, Canvas API charts
- **Database:** MongoDB
