## Spring Boot Backend Parity To-Do

- **Auth & users**: expose `/api/auth/me` (returns id, email, roles), include `id` in login/register responses, add refresh/logout endpoints, password reset/OTP, email verification, Google OAuth flow, and role-based admin guard.
- **Product catalog**: extend product model to include images, categories/tags, variants/sizes/colors, featured flag, pagination/filtering; add admin CRUD with file uploads (Multer/S3 equivalent) and category endpoints.
- **Cart**: align cart endpoints to accept product options (size/color), return cart item ids, and work off authenticated user context instead of path `userId`; add bulk update/clear endpoints parity with Node service.
- **Orders**: accept shipping address/payment method payload, support order creation from posted items (not only cart), add order history per user, invoice/analytics endpoints, and status transitions (pending/processing/shipped/completed/cancelled/refunded).
- **Payments**: integrate Stripe/PayPal or at least stub payment intent endpoints used by frontend; store payment results in orders.
- **Wishlist & notifications**: add wishlist CRUD per user and notification endpoints (list, unread count, mark read/archive/delete, broadcast).
- **Promotions**: implement coupons/discounts/unified discounts, banner/events/promotions APIs, and affiliate/loyalty/spin wheel features to match the Node backend.
- **Reviews/issues**: add product review CRUD with admin moderation and issue/return handling with refund hooks.
- **Misc services**: email service (welcome/OTP/reset/order confirmation), file upload handling (`/uploads` static), health/status endpoints, and configuration via environment variables (database, JWT secrets, SMTP, Stripe keys, CORS).
- **Frontend loyalty**: reintroduce loyalty program UI (dashboards, badges, spin wheel, promo sections) once backend support is available; currently removed/hidden.
- **Campaign Hub**: restore full campaign/event tooling; currently reduced to a simple banner + sitewide discount stub with no backend wiring.
- **Discount flow**: move discounts to a dedicated feature (UI + backend) instead of inline on product creation.
- **Product ratings**: add a proper rating system (storage, moderation, and UI) instead of manual entry on product creation.
