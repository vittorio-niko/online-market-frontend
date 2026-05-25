# Frontend Requirements Specification

## For Regular Users

**Landing Page:** Request to `/user/items` for the store assortment section and an "About Us" section with simple text "online market with everything you want" and an image. In the corner there is a "Sign in" button.

Products are clickable, and browsing is available to all users without authentication. Filtering, sorting, and pagination are available. Clicking opens a modal window with product information. At the bottom there is a caption: "Sign in to order". When the user logs in (i.e., has a JWT), clicking on the product section shows product information along with a quantity selector and an "Add to Cart" button. Upon authentication, the "Sign in" button changes to a profile icon (user icon) for viewing the profile, and a cart button appears for viewing the cart (cart is stored in localStorage).

Clicking "Sign in" → login page (email and password). Below there is a link: "Just found us? Register!" that redirects to the registration form. After registration, the user is redirected back to the login page.

**Cart:** Inside the cart there are orderItems with a pre-calculated order total, a button to remove each item, and controls to change quantity (quantity cannot be decreased below 1 — use the remove button instead). When the user clicks the checkout button, the request is sent to the backend in the established format, and the cart is cleared. There are two types of orders: pay on delivery and pay immediately. The user must choose one.

**My Profile:** Clicking the user icon in the corner navigates to a page with three sections: Profile, Cards, and My Orders. In Profile, the user can edit personal information (within the constraints of the backend API), delete and add cards (maximum 5), and view orders. The user sees order statuses. If an order has payment status `INITIAL` or `FAILED`, the user can click a "Pay" button which should be available in that case.

For an order with `deliveryStatus = COMPLETED`, there should be a small button for soft delete.

## For Admin

For the admin, the landing page is the login page. When the admin enters admin credentials, they are taken to the assortment page, but now they also have options to add, update, and soft delete existing products. Each product section also has edit and delete buttons (via a three-dots dropdown menu), and clicking the product opens a modal with full product information. Additionally, there is an "Add Item" button at the top with a form and a confirm button.

The admin also has access to a **Users** section, where they can view user information (profiles, orders, and payments). First, the admin sees a list of users; then, clicking on a specific user shows detailed information and buttons to view all orders and payments for that user.

There is also an **Orders** section, where the admin can search for an order by order ID or by user ID, change the delivery status of an order, and trigger payment for unpaid orders at checkout. On this page, the frontend performs a GET request for the order by its ID every couple of seconds to check whether a new status has arrived from the Payment Service.

There is also a **Payments** section, where the admin can view all payments for a specific time period and for specific users. The admin can also make requests for the total sum of payments over a specific period.

---

## 1. Public Area (No Authentication Required)

### 1.1. Landing Page (`/`)

| Section | Description |
| :--- | :--- |
| **Header** | "Sign In" button (when not authenticated); profile icon + cart icon (when authenticated) |
| **Assortment** | Product list from `GET /user/items` with filtering, sorting, pagination |
| **About Us** | Text: "Online market with everything you want" + image |

### 1.2. Product Modal (Click on Product Card)

| User State | Behavior |
| :--- | :--- |
| **Not authenticated** | Product info + "Sign in to order" message |
| **Authenticated** | Product info + quantity selector + "Add to Cart" button |

**API:** `GET /user/items/{id}` (public)

---

## 2. Authentication & Registration

### 2.1. Login Page (`/login`)

| Element | Action |
| :--- | :--- |
| Form | Email + Password |
| "Sign In" button | `POST /auth/login` → receives JWT → stores in localStorage |
| "Just found us? Register!" link | Redirects to `/register` |

**API:** `POST /auth/login`

### 2.2. Registration Page (`/register`)

| Element | Action |
| :--- | :--- |
| Form | Name, Surname, Birth Date, Email, Password |
| "Register" button | `POST /auth/register` |
| On success | Redirect to `/login` |

**API:** `POST /auth/register`

---

## 3. Cart (Authenticated Users Only)

### 3.1. Storage & Structure

| Aspect | Description |
| :--- | :--- |
| Storage | `localStorage` (key: `cart`) |
| Structure | Array of `{ itemId, quantity }` |
| Display | Cart icon in header with badge (sum of all quantities) |

### 3.2. Cart Page (`/cart`)

| Element | Description |
| :--- | :--- |
| **Product list** | Fetch each item via `GET /user/items/{id}` |
| **Controls** | Quantity adjustment (min = 1), remove item |
| **Total sum** | Pre-calculated sum of `itemPrice × quantity` |
| **Order type selection** | Radio buttons: "Cash on delivery" / "Prepaid" |
| **"Checkout" button** | Submits order based on selected type |

### 3.3. Order Submission

| Order Type | API Endpoint | Request Body |
| :--- | :--- | :--- |
| Cash on delivery | `POST /user/orders/cash-on-delivery` | `{ orderItemsDto: [{ itemId, quantity }] }` |
| Prepaid | `POST /user/orders/prepaid` | `{ paymentId, orderItemsDto: [...] }` |

**After successful order:** Clear cart (`localStorage`), redirect to orders page.

---

## 4. User Profile (`/profile`)

### 4.1. Navigation (Tabs / Sidebar)

| Section | Description |
| :--- | :--- |
| **Profile** | View and edit personal information |
| **My Cards** | List of payment cards (max 5), add, remove, activate/deactivate |
| **My Orders** | List of orders with details and payment option |

### 4.2. Profile Section

| Action | API Endpoint |
| :--- | :--- |
| View profile | `GET /users/me` |
| Update profile | `PUT /users/me` |

### 4.3. My Cards Section

| Action | API Endpoint |
| :--- | :--- |
| View all cards | `GET /users/my-cards` |
| View specific card | `GET /users/my-cards/{cardId}` |
| Add card | `POST /users/my-cards` |
| Activate card | `PUT /users/my-cards/{cardId}/activate` |
| Deactivate card | `PUT /users/my-cards/{cardId}/deactivate` |
| Delete card | `DELETE /users/my-cards/{cardId}` |

**Constraint:** Maximum 5 cards per user (backend returns `CARDS_COUNT_LIMIT_OVERFLOW`)

### 4.4. My Orders Section

| Action | Condition | API Endpoint |
| :--- | :--- | :--- |
| List orders (paginated) | Always | `GET /user/orders` |
| Order details with items | Always | `GET /user/orders/{id}` |
| Pay for order | `paymentStatus = PENDING` or `FAILED` | `POST /user/orders/{orderId}/pay` |
| Soft delete order | `deliveryStatus = COMPLETED` | `DELETE /user/orders/{id}` |
| Update order items | Before payment initiation | `PUT /user/orders/{id}/items` |

---

## 5. Admin Panel (`/admin`)

### 5.1. Admin Login

| Element | Action |
| :--- | :--- |
| Form | Email + Password |
| On success | Redirect to `/admin/dashboard` |

**API:** `POST /auth/login` (ADMIN role must be present in JWT)

### 5.2. Dashboard (`/admin/dashboard`) — Product Management

| Element | Description | API Endpoint |
| :--- | :--- | :--- |
| **Assortment** | Product list with filters, sorting, pagination | `GET /admin/items` |
| **Add item** | "Add Item" button → form → POST | `POST /admin/items` |
| **Edit item** | Three-dots menu → form → PUT | `PUT /admin/items/{id}` |
| **Delete item** | Three-dots menu → confirm → DELETE | `DELETE /admin/items/{id}` |
| **Item details** | Click on card → modal with full info | `GET /admin/items` (from list) |

### 5.3. Users Section (`/admin/users`)

| Action | Description | API Endpoint |
| :--- | :--- | :--- |
| **User list** | Table with pagination and filtering | `GET /admin/users` |
| **User details** | Click row → `/admin/users/{userId}` | `GET /admin/users/{id}` |
| **User cards** | On user details page | `GET /admin/users/{userId}/cards` |
| **User orders** | "View Orders" button → filtered by `userId` | `GET /admin/orders?userId={userId}` |
| **User payments** | "View Payments" button → filtered by `userId` | `GET /admin/payments/users/{userId}` |
| **Activate user** | Button on user details page | `PUT /admin/users/{id}/activate` |
| **Deactivate user** | Button on user details page | `PUT /admin/users/{id}/deactivate` |
| **Delete user** | Button on user details page | `DELETE /admin/users/{id}` |

### 5.4. Orders Section (`/admin/orders`)

| Action | Description | API Endpoint |
| :--- | :--- | :--- |
| **Search** | By order ID (direct) and/or by user ID (filter) | `GET /admin/orders?userId={userId}` + `GET /admin/orders/{id}` |
| **Order list** | Table with pagination, status filters | `GET /admin/orders` |
| **Order details** | Click row → `/admin/orders/{orderId}` | `GET /admin/orders/{id}` |
| **Update delivery status** | Dropdown + "Update" button | `PATCH /admin/orders/{id}/delivery-status?deliveryStatus=...` |
| **Trigger payment** | "Trigger Payment" button (for unpaid orders) | `POST /admin/orders/{orderId}/pay` |
| **Soft delete order** | "Delete" button | `DELETE /admin/orders/{id}` |
| **Polling status** | Every 2-3 seconds → refresh order details | `GET /admin/orders/{id}` |

### 5.5. Payments Section (`/admin/payments`)

| Action | Description | API Endpoint |
| :--- | :--- | :--- |
| **Filters** | By user (`userId`), date range (`startDate`, `endDate`), pagination | `GET /admin/payments/users/{userId}` + `GET /admin/payments/daily-sum/range` |
| **User payments list** | Table with amount, status, date | `GET /admin/payments/users/{userId}?startDate&endDate&page&size` |
| **User total sum (range)** | Card/widget with total | `GET /admin/payments/users/{userId}/payment-sum/range?startDate&endDate` |
| **Daily sums (system)** | Table with aggregated daily amounts | `GET /admin/payments/daily-sum/range?startDate&endDate&page&size` |
| **System total sum (range)** | Card/widget with total | `GET /admin/payments/daily-sum/range/total?startDate&endDate` |
| **Payment details** | Click row → modal | `GET /admin/payments/{paymentId}` |

---

## 6. Role-Based Access Matrix

| Page / Feature | User (USER) | Admin (ADMIN) | Public (No Auth) |
| :--- | :--- | :--- | :--- |
| Landing page (`/`) | ✅ | ✅ | ✅ |
| Product modal | ✅ | ✅ | ✅ (no Add to Cart) |
| Login page (`/login`) | ✅ | ✅ | ✅ |
| Registration page (`/register`) | ✅ | ✅ | ✅ |
| Cart page (`/cart`) | ✅ | ✅ | ❌ (redirect to `/login`) |
| User profile (`/profile`) | ✅ | ✅ (own data only) | ❌ |
| Admin panel (`/admin/*`) | ❌ (redirect) | ✅ | ❌ |

---

## 7. Additional Technical Requirements

| Aspect | Requirement |
| :--- | :--- |
| **Authentication** | JWT stored in `localStorage` or `httpOnly cookie` |
| **Error handling** | All API errors must be displayed to user (toast/alert/inline) |
| **Loading states** | Skeleton / Spinner during data fetching |
| **Polling** | Admin order page: every 2-3 seconds → `GET /admin/orders/{id}` |
| **Form validation** | Client-side validation (mirrors backend, improves UX) |
| **Responsive design** | Desktop + mobile versions |
| **TypeScript** | Strict typing for all components and hooks (generated by Orval) |

---

## 8. API Endpoints Reference

### Public / User Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/user/items` | List products (filtering, sorting, pagination) |
| GET | `/user/items/{id}` | Product details |
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |

### Authenticated User Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/users/me` | Get own profile |
| PUT | `/users/me` | Update own profile |
| GET | `/users/my-cards` | Get own payment cards |
| POST | `/users/my-cards` | Add payment card |
| PUT | `/users/my-cards/{cardId}/activate` | Activate card |
| PUT | `/users/my-cards/{cardId}/deactivate` | Deactivate card |
| DELETE | `/users/my-cards/{cardId}` | Delete card |
| GET | `/user/orders` | Get own orders |
| GET | `/user/orders/{id}` | Get order details |
| POST | `/user/orders/cash-on-delivery` | Create COD order |
| POST | `/user/orders/prepaid` | Create prepaid order |
| POST | `/user/orders/{orderId}/pay` | Pay for order |
| PUT | `/user/orders/{id}/items` | Update order items |
| DELETE | `/user/orders/{id}` | Soft delete order |

### Admin Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/admin/items` | List all products |
| POST | `/admin/items` | Create product |
| PUT | `/admin/items/{id}` | Update product |
| DELETE | `/admin/items/{id}` | Soft delete product |
| GET | `/admin/users` | List users |
| GET | `/admin/users/{id}` | Get user details |
| PUT | `/admin/users/{id}/activate` | Activate user |
| PUT | `/admin/users/{id}/deactivate` | Deactivate user |
| DELETE | `/admin/users/{id}` | Delete user |
| GET | `/admin/users/{userId}/cards` | Get user's cards |
| GET | `/admin/orders` | List orders |
| GET | `/admin/orders/{id}` | Get order details |
| PATCH | `/admin/orders/{id}/delivery-status` | Update delivery status |
| POST | `/admin/orders/{orderId}/pay` | Trigger payment |
| DELETE | `/admin/orders/{id}` | Soft delete order |
| GET | `/admin/payments/{paymentId}` | Get payment details |
| GET | `/admin/payments/users/{userId}` | Get user payments |
| GET | `/admin/payments/users/{userId}/payment-sum` | Get user payment sum (date) |
| GET | `/admin/payments/users/{userId}/payment-sum/range` | Get user payment sum (range) |
| GET | `/admin/payments/daily-sum` | Get daily sum |
| GET | `/admin/payments/daily-sum/range` | Get daily sums (range) |
| GET | `/admin/payments/daily-sum/range/total` | Get total sum (range) |