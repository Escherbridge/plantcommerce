# PlantCommerce (Aevani) QA Test Plan

## How to Perform QA Testing

### Prerequisites
1. **Environment Setup**
   - Ensure the application is running locally or on a staging environment
   - Have access to the following test accounts:
     - Admin account (role: admin)
     - Customer account (role: customer)
     - Affiliate account (role: affiliate)
     - Guest user (no account)
   - Clear browser cache and cookies before starting a new test session
   - Have test data ready (valid/invalid emails, usernames, credit card test numbers)

2. **Testing Tools**
   - Modern web browser (Chrome, Firefox, Safari, Edge)
   - Browser DevTools for inspecting network requests and console errors
   - Screen capture tool for documenting bugs
   - Test data spreadsheet for tracking results

3. **Testing Approach**
   - **Functional Testing**: Verify each feature works as expected
   - **Negative Testing**: Test with invalid inputs and edge cases
   - **Cross-browser Testing**: Test on multiple browsers
   - **Responsive Testing**: Test on mobile, tablet, and desktop viewports
   - **Security Testing**: Verify authorization and data protection
   - **Performance Testing**: Check page load times and API response times

4. **Bug Reporting Guidelines**
   - **Title**: Clear, concise description of the issue
   - **Priority**: Critical, High, Medium, Low
   - **Steps to Reproduce**: Numbered list of actions taken
   - **Expected Result**: What should happen
   - **Actual Result**: What actually happened
   - **Environment**: Browser, OS, viewport size
   - **Screenshots/Videos**: Visual evidence of the issue
   - **Console Errors**: Any JavaScript errors from browser console

5. **Test Data Management**
   - Use consistent test data for reproducibility
   - Clean up test data after destructive tests
   - Avoid using production data in testing
   - Document any test data created during QA

---

## Feature Test Cases

### 1. User Authentication & Registration

#### 1.1 User Registration
**Priority**: Critical

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| REG-001 | Register with valid credentials | 1. Navigate to /register<br>2. Enter unique username<br>3. Enter valid email<br>4. Enter password (min 8 chars)<br>5. Optionally enter first/last name<br>6. Click "Register" | User account created, session started, redirected to homepage | username: "testuser123"<br>email: "test@example.com"<br>password: "SecurePass123" |
| REG-002 | Register with duplicate username | 1. Navigate to /register<br>2. Enter existing username<br>3. Fill other valid fields<br>4. Click "Register" | Error message: "Username already taken" | username: (existing) |
| REG-003 | Register with duplicate email | 1. Navigate to /register<br>2. Enter unique username<br>3. Enter existing email<br>4. Click "Register" | Error message: "Email already registered" | email: (existing) |
| REG-004 | Register with invalid email format | 1. Navigate to /register<br>2. Enter invalid email<br>3. Fill other fields<br>4. Click "Register" | Validation error: "Invalid email format" | email: "notanemail" |
| REG-005 | Register with weak password | 1. Navigate to /register<br>2. Enter password < 8 characters<br>3. Fill other fields<br>4. Click "Register" | Validation error: "Password must be at least 8 characters" | password: "weak" |
| REG-006 | Register with empty required fields | 1. Navigate to /register<br>2. Leave username empty<br>3. Click "Register" | Validation errors for empty fields | (empty fields) |
| REG-007 | Check username availability | 1. Navigate to /register<br>2. Type username in field<br>3. Blur/tab away | Real-time validation shows if username is available | username: "newuser" |
| REG-008 | Check email availability | 1. Navigate to /register<br>2. Type email in field<br>3. Blur/tab away | Real-time validation shows if email is available | email: "new@example.com" |
| REG-009 | Register and verify email token created | 1. Register new user<br>2. Check database/logs | Email verification token created with 2-day expiration | (valid registration) |

#### 1.2 User Login
**Priority**: Critical

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| LOGIN-001 | Login with valid username | 1. Navigate to /login<br>2. Enter username<br>3. Enter correct password<br>4. Click "Login" | Session created, user logged in, redirected to homepage | username: "testuser"<br>password: "correctpass" |
| LOGIN-002 | Login with valid email | 1. Navigate to /login<br>2. Enter email<br>3. Enter correct password<br>4. Click "Login" | Session created, user logged in | email: "test@example.com"<br>password: "correctpass" |
| LOGIN-003 | Login with incorrect password | 1. Navigate to /login<br>2. Enter valid username<br>3. Enter wrong password<br>4. Click "Login" | Error: "Invalid credentials" | password: "wrongpass" |
| LOGIN-004 | Login with non-existent username | 1. Navigate to /login<br>2. Enter non-existent username<br>3. Enter any password<br>4. Click "Login" | Error: "Invalid credentials" | username: "doesnotexist" |
| LOGIN-005 | Login with empty fields | 1. Navigate to /login<br>2. Leave fields empty<br>3. Click "Login" | Validation errors for empty fields | (empty) |
| LOGIN-006 | Session cookie created | 1. Login successfully<br>2. Check browser cookies | HTTP-only cookie with session token present | (valid login) |
| LOGIN-007 | Session persists across page reloads | 1. Login successfully<br>2. Reload page<br>3. Check user state | User remains logged in | (valid login) |
| LOGIN-008 | Guest cart transfers on login | 1. Add items to cart as guest<br>2. Login<br>3. Check cart | Guest cart items transferred to user account | (guest cart with items) |

#### 1.3 Session Management
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| SESS-001 | Session expires after 30 days | 1. Login<br>2. Set system time 31 days forward<br>3. Refresh page | Session invalid, user logged out | (valid session) |
| SESS-002 | Session auto-renews before expiration | 1. Login<br>2. Set system time 16 days forward<br>3. Make API call | Session renewed with new expiration | (valid session) |
| SESS-003 | Logout invalidates session | 1. Login<br>2. Click "Logout"<br>3. Try to access protected route | Session deleted, user logged out, redirected to login | (valid session) |
| SESS-004 | Multiple sessions per user | 1. Login on Browser A<br>2. Login on Browser B<br>3. Check both sessions | Both sessions active independently | (same user) |
| SESS-005 | Invalid session token rejected | 1. Login<br>2. Manually modify session cookie<br>3. Refresh page | User logged out, invalid session error | (modified token) |

#### 1.4 Email Verification
**Priority**: Medium

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| EMAIL-001 | Verify email with valid token | 1. Register new user<br>2. Navigate to /verify-email?token=<valid><br>3. Submit | Email verified, user account activated | (valid token) |
| EMAIL-002 | Verify email with expired token | 1. Register user<br>2. Wait 2+ days<br>3. Navigate to /verify-email?token=<expired><br>4. Submit | Error: "Token expired" | (expired token) |
| EMAIL-003 | Verify email with invalid token | 1. Navigate to /verify-email?token=invalid<br>2. Submit | Error: "Invalid token" | token: "invalid123" |
| EMAIL-004 | Re-send verification email | 1. Register user<br>2. Request new verification email<br>3. Check logs/database | New token generated, old token invalidated | (existing user) |

---

### 2. Product Catalog

#### 2.1 Product Listing
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| PROD-001 | View all products | 1. Navigate to /products | All active products displayed with images, titles, prices | N/A |
| PROD-002 | View products by category | 1. Navigate to /products/hydroponics | Only hydroponics products displayed | category: "hydroponics" |
| PROD-003 | Pagination works correctly | 1. Navigate to /products<br>2. Click "Next Page" | Next set of products loaded, page number increments | N/A |
| PROD-004 | Search products by title | 1. Navigate to /products<br>2. Enter search term<br>3. Submit search | Products matching search term displayed | query: "plant" |
| PROD-005 | Filter products by price range | 1. Navigate to /products<br>2. Set min/max price<br>3. Apply filter | Products within price range displayed | min: 10, max: 50 |
| PROD-006 | Sort products by price (low to high) | 1. Navigate to /products<br>2. Select sort: "Price: Low to High" | Products sorted by price ascending | N/A |
| PROD-007 | Sort products by price (high to low) | 1. Navigate to /products<br>2. Select sort: "Price: High to Low" | Products sorted by price descending | N/A |
| PROD-008 | View featured products | 1. Navigate to homepage or featured section | Featured products displayed prominently | N/A |
| PROD-009 | Out of stock products marked | 1. Navigate to /products<br>2. Find product with stock=0 | Product shows "Out of Stock" badge | (product with stock=0) |
| PROD-010 | Product images display correctly | 1. Navigate to /products<br>2. Check product images | Main image displayed, no broken images | N/A |

#### 2.2 Product Details
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| PROD-011 | View product detail page | 1. Navigate to /products<br>2. Click on a product | Product detail page shows title, description, price, stock, images | (any product) |
| PROD-012 | Product slug navigation works | 1. Navigate to /products/slug-name | Product loaded by slug | slug: "example-product" |
| PROD-013 | Product image carousel works | 1. Navigate to product detail<br>2. Click next/prev on carousel | Images cycle through, main image updates | (product with multiple images) |
| PROD-014 | Add to cart from product page | 1. Navigate to product detail<br>2. Select quantity<br>3. Click "Add to Cart" | Item added to cart, success message shown | quantity: 2 |
| PROD-015 | Cannot add more than available stock | 1. Navigate to product detail<br>2. Enter quantity > stock<br>3. Click "Add to Cart" | Error: "Not enough stock available" | quantity: (stock + 1) |
| PROD-016 | Product with no images shows placeholder | 1. Navigate to product with no images | Placeholder image displayed | (product without images) |
| PROD-017 | Related products displayed | 1. Navigate to product detail<br>2. Scroll to related products section | Related products from same category shown | (product with related items) |
| PROD-018 | Product tags displayed | 1. Navigate to product detail | Product tags visible and clickable | (product with tags) |
| PROD-019 | Product SEO metadata present | 1. Navigate to product detail<br>2. View page source | Meta title, description, OG tags present | (any product) |

#### 2.3 Product Categories
**Priority**: Medium

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| PROD-020 | View category listing | 1. Navigate to /products<br>2. View categories sidebar/menu | All categories displayed | N/A |
| PROD-021 | Navigate to parent category | 1. Click parent category (e.g., "Agriculture") | Products from all child categories shown | category: "agriculture" |
| PROD-022 | Navigate to child category | 1. Click child category (e.g., "Hydroponics") | Only hydroponics products shown | category: "hydroponics" |
| PROD-023 | Category breadcrumbs display | 1. Navigate to child category | Breadcrumb shows: Home > Parent > Child | (nested category) |
| PROD-024 | Empty category handling | 1. Navigate to category with no products | Message: "No products in this category" | (empty category) |

---

### 3. Shopping Cart

#### 3.1 Cart Management
**Priority**: Critical

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| CART-001 | Add product to cart (guest) | 1. As guest, navigate to product<br>2. Click "Add to Cart" | Item added to cart, cart count updates | (any product) |
| CART-002 | Add product to cart (authenticated) | 1. Login<br>2. Navigate to product<br>3. Click "Add to Cart" | Item added to user's cart in database | (any product) |
| CART-003 | View cart page | 1. Add items to cart<br>2. Navigate to /cart | All cart items displayed with images, prices, quantities | (cart with items) |
| CART-004 | Update cart item quantity | 1. Navigate to /cart<br>2. Change quantity for an item<br>3. Click "Update" | Quantity updated, subtotal recalculated | new quantity: 5 |
| CART-005 | Remove item from cart | 1. Navigate to /cart<br>2. Click "Remove" on an item | Item removed, cart total updated | (any cart item) |
| CART-006 | Clear entire cart | 1. Navigate to /cart<br>2. Click "Clear Cart" | All items removed, cart empty message shown | (cart with items) |
| CART-007 | Cart persists after login | 1. Add items as guest<br>2. Login | Guest cart merged with user cart | (guest cart) |
| CART-008 | Cart displays correct totals | 1. Add multiple items<br>2. Navigate to /cart | Subtotal, tax, shipping, total calculated correctly | (multiple items) |
| CART-009 | Cannot add out of stock items | 1. Navigate to out of stock product<br>2. Try to add to cart | Error: "Product out of stock" | (stock = 0) |
| CART-010 | Quantity exceeds stock limit | 1. Add item to cart<br>2. Try to update quantity > stock | Error: "Insufficient stock" | (quantity > stock) |
| CART-011 | Empty cart displays message | 1. Navigate to /cart with no items | Message: "Your cart is empty" | (empty cart) |
| CART-012 | Affiliate link tracked in cart | 1. Click affiliate link<br>2. Add product to cart<br>3. Check cart data | Affiliate link code stored with cart | (affiliate link) |
| CART-013 | Cart item count in header | 1. Add items to cart<br>2. Check header cart icon | Correct item count badge displayed | (cart with items) |

---

### 4. Checkout & Orders

#### 4.1 Checkout Process
**Priority**: Critical

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| CHCK-001 | Guest checkout | 1. Add items to cart as guest<br>2. Navigate to /checkout<br>3. Fill shipping info<br>4. Fill billing info<br>5. Complete order | Order created, order confirmation shown | (valid address data) |
| CHCK-002 | Authenticated user checkout | 1. Login<br>2. Add items to cart<br>3. Navigate to /checkout<br>4. Fill/select addresses<br>5. Complete order | Order created with user association | (logged in user) |
| CHCK-003 | Validation on empty address fields | 1. Navigate to /checkout<br>2. Leave required fields empty<br>3. Click "Continue" | Validation errors for required fields | (empty fields) |
| CHCK-004 | Shipping address saved for user | 1. Login<br>2. Complete checkout with new address<br>3. Check user profile | Shipping address saved | (new address) |
| CHCK-005 | Billing address same as shipping | 1. Navigate to /checkout<br>2. Check "Same as shipping"<br>3. Complete order | Billing address auto-filled from shipping | (valid shipping) |
| CHCK-006 | Billing address different from shipping | 1. Navigate to /checkout<br>2. Uncheck "Same as shipping"<br>3. Fill different billing address<br>4. Complete order | Both addresses saved correctly | (two addresses) |
| CHCK-007 | Order total calculated correctly | 1. Navigate to /checkout<br>2. Review order summary | Subtotal + tax (8%) + shipping = total | (cart with items) |
| CHCK-008 | Stock validation during checkout | 1. Add item (last in stock)<br>2. Start checkout<br>3. Another user buys same item<br>4. Complete checkout | Error: "Item no longer available" | (low stock item) |
| CHCK-009 | Order number generated | 1. Complete checkout<br>2. Check order confirmation | Unique order number displayed | (completed order) |
| CHCK-010 | Cart cleared after order | 1. Complete checkout<br>2. Navigate to /cart | Cart is empty | (completed order) |
| CHCK-011 | Order confirmation page | 1. Complete checkout | Order details, shipping info, items displayed | (completed order) |
| CHCK-012 | Tax calculation correct | 1. Add items totaling $100<br>2. Navigate to checkout | Tax = $8 (8% rate) | subtotal: 100 |
| CHCK-013 | Affiliate commission tracked | 1. Use affiliate link<br>2. Complete purchase<br>3. Check affiliate stats | Commission recorded for affiliate | (affiliate order) |

#### 4.2 Order Management (Customer)
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| ORD-001 | View order history | 1. Login<br>2. Navigate to /account/orders | All user orders displayed with status | (user with orders) |
| ORD-002 | View order details | 1. Navigate to /account/orders<br>2. Click on an order | Order details, items, addresses, tracking shown | (any order) |
| ORD-003 | Order status displays correctly | 1. View order list | Status badge shows: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded | (orders with various statuses) |
| ORD-004 | Cancel pending order | 1. Navigate to order detail<br>2. Click "Cancel Order"<br>3. Confirm | Order status = "Cancelled", refund initiated | (pending order) |
| ORD-005 | Cannot cancel shipped order | 1. Navigate to shipped order<br>2. Try to cancel | Error or cancel button disabled | (shipped order) |
| ORD-006 | Order pagination | 1. Navigate to /account/orders<br>2. Click "Next Page" | Next page of orders loaded | (user with 10+ orders) |
| ORD-007 | Empty order history | 1. Login with new user<br>2. Navigate to /account/orders | Message: "No orders yet" | (user without orders) |
| ORD-008 | Order search by number | 1. Navigate to order history<br>2. Enter order number<br>3. Search | Matching order displayed | orderNumber: "ORD-12345" |

#### 4.3 Order Management (Admin)
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| ORD-009 | Admin views all orders | 1. Login as admin<br>2. Navigate to /admin/orders | All orders from all users displayed | (admin account) |
| ORD-010 | Filter orders by status | 1. Navigate to /admin/orders<br>2. Select status filter<br>3. Apply | Only orders with selected status shown | status: "pending" |
| ORD-011 | Update order status | 1. Navigate to /admin/orders<br>2. Click order<br>3. Change status to "Shipped"<br>4. Save | Order status updated, audit log created | (any order) |
| ORD-012 | View order full details (admin) | 1. Navigate to /admin/orders<br>2. Click order | Customer info, items, payment, affiliate data shown | (any order) |
| ORD-013 | Search orders by customer | 1. Navigate to /admin/orders<br>2. Search by customer name/email | Orders for that customer displayed | customer: "John Doe" |
| ORD-014 | Recent orders on dashboard | 1. Login as admin<br>2. Navigate to /admin | Last 7 days of orders shown | (admin account) |
| ORD-015 | Refund order | 1. Navigate to /admin/orders<br>2. Select order<br>3. Click "Refund"<br>4. Confirm | Order status = "Refunded", refund processed | (completed order) |

---

### 5. Affiliate Program

#### 5.1 Affiliate Account Management
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| AFF-001 | Create affiliate account | 1. Login as customer<br>2. Navigate to /affiliate/join<br>3. Fill affiliate form<br>4. Submit | Affiliate account created, unique code generated | (customer account) |
| AFF-002 | User already affiliate | 1. Login as affiliate<br>2. Navigate to /affiliate/join | Redirect to affiliate dashboard | (affiliate account) |
| AFF-003 | View affiliate dashboard | 1. Login as affiliate<br>2. Navigate to /affiliate | Dashboard shows stats, earnings, clicks | (affiliate account) |
| AFF-004 | Unique affiliate code generated | 1. Create affiliate account<br>2. Check affiliate data | Unique code assigned (e.g., "AFF-12345") | (new affiliate) |
| AFF-005 | Default commission rate assigned | 1. Create affiliate account<br>2. Check commission rate | Default 5% commission set | (new affiliate) |
| AFF-006 | Non-affiliate cannot access dashboard | 1. Login as customer (non-affiliate)<br>2. Navigate to /affiliate | Redirect to join page or error | (customer account) |

#### 5.2 Affiliate Links
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| AFF-007 | Create affiliate link | 1. Login as affiliate<br>2. Navigate to /affiliate/links<br>3. Select product<br>4. Create link | Unique affiliate link generated | (affiliate + product) |
| AFF-008 | View all affiliate links | 1. Login as affiliate<br>2. Navigate to /affiliate/links | All affiliate links displayed with stats | (affiliate account) |
| AFF-009 | Copy affiliate link | 1. Navigate to /affiliate/links<br>2. Click "Copy" on a link | Link copied to clipboard, confirmation shown | (any affiliate link) |
| AFF-010 | Deactivate affiliate link | 1. Navigate to /affiliate/links<br>2. Toggle link status to inactive<br>3. Save | Link deactivated, clicks not tracked | (active link) |
| AFF-011 | Reactivate affiliate link | 1. Navigate to /affiliate/links<br>2. Toggle inactive link to active<br>3. Save | Link reactivated, clicks tracked again | (inactive link) |
| AFF-012 | Delete affiliate link | 1. Navigate to /affiliate/links<br>2. Click "Delete" on a link<br>3. Confirm | Link deleted, no longer accessible | (any affiliate link) |
| AFF-013 | Custom link code | 1. Create affiliate link<br>2. Enter custom code<br>3. Save | Link uses custom code if unique | code: "SUMMER2024" |

#### 5.3 Affiliate Tracking
**Priority**: Critical

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| AFF-014 | Click tracking | 1. Click affiliate link<br>2. Check affiliate stats | Click recorded with IP, user agent, referrer | (affiliate link) |
| AFF-015 | Redirect to product | 1. Click affiliate link (e.g., /aff/CODE123) | Redirects to product page, tracking recorded | linkCode: "CODE123" |
| AFF-016 | Invalid affiliate link | 1. Navigate to /aff/INVALID | Error: "Invalid affiliate link" | linkCode: "INVALID" |
| AFF-017 | Inactive affiliate link | 1. Click inactive affiliate link | Redirect to product, but no tracking | (inactive link) |
| AFF-018 | Session tracking | 1. Click affiliate link<br>2. Add product to cart<br>3. Complete purchase | Affiliate code tracked through session | (affiliate link) |
| AFF-019 | Conversion tracking | 1. Click affiliate link<br>2. Complete purchase<br>3. Check affiliate stats | Conversion recorded, earnings calculated | (affiliate purchase) |
| AFF-020 | Commission calculation | 1. Complete $100 order via affiliate link<br>2. Check affiliate earnings | Earnings = $5 (5% of $100) | order: $100, rate: 5% |

#### 5.4 Affiliate Analytics
**Priority**: Medium

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| AFF-021 | View total earnings | 1. Login as affiliate<br>2. Navigate to /affiliate/earnings | Total earnings displayed | (affiliate with sales) |
| AFF-022 | View pending payouts | 1. Navigate to /affiliate/earnings | Pending payout amount shown | (affiliate with pending) |
| AFF-023 | View monthly earnings | 1. Navigate to /affiliate/earnings<br>2. Select month | Earnings for selected month shown | month: "January 2024" |
| AFF-024 | Recent clicks displayed | 1. Navigate to /affiliate | Last 10 clicks shown with timestamps | (affiliate with clicks) |
| AFF-025 | Earnings history | 1. Navigate to /affiliate/earnings | Historical earnings by month/year | (affiliate with history) |
| AFF-026 | Click-through rate | 1. Navigate to /affiliate | CTR = (conversions / clicks) * 100 | (affiliate with data) |
| AFF-027 | Top performing links | 1. Navigate to /affiliate/links | Links sorted by conversions/earnings | (affiliate with multiple links) |

#### 5.5 Affiliate Resources
**Priority**: Low

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| AFF-028 | View affiliate resources | 1. Login as affiliate<br>2. Navigate to /affiliate/materials | Marketing materials, guides displayed | (affiliate account) |
| AFF-029 | Download affiliate guide | 1. Navigate to /affiliate/materials<br>2. Click "Download Guide" | Guide PDF downloaded | (affiliate account) |
| AFF-030 | Access affiliate banners | 1. Navigate to /affiliate/materials | Banner images available for download | (affiliate account) |

---

### 6. Admin Dashboard

#### 6.1 Dashboard Analytics
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| ADM-001 | View dashboard | 1. Login as admin<br>2. Navigate to /admin | Dashboard displays key metrics | (admin account) |
| ADM-002 | Total revenue displayed | 1. View admin dashboard | Total revenue from all orders shown | (admin account) |
| ADM-003 | Total orders count | 1. View admin dashboard | Total number of orders displayed | (admin account) |
| ADM-004 | Total users count | 1. View admin dashboard | Total registered users shown | (admin account) |
| ADM-005 | Total products count | 1. View admin dashboard | Total products in catalog shown | (admin account) |
| ADM-006 | Recent orders (last 7 days) | 1. View admin dashboard | Orders from last 7 days listed | (admin account) |
| ADM-007 | Low stock alerts | 1. View admin dashboard | Products with stock < 10 flagged | (products with low stock) |
| ADM-008 | Analytics page | 1. Navigate to /admin/analytics | Detailed analytics and charts displayed | (admin account) |

#### 6.2 User Management
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| ADM-009 | View all users | 1. Login as admin<br>2. Navigate to /admin/users | All users displayed with roles | (admin account) |
| ADM-010 | Filter users by role | 1. Navigate to /admin/users<br>2. Filter by role: "Customer" | Only customers displayed | role: "customer" |
| ADM-011 | Search users | 1. Navigate to /admin/users<br>2. Search by username/email | Matching users displayed | query: "john" |
| ADM-012 | View user details | 1. Navigate to /admin/users<br>2. Click on a user | User profile, orders, activity shown | (any user) |
| ADM-013 | Deactivate user account | 1. Navigate to user detail<br>2. Toggle "Active" status to false<br>3. Save | User account deactivated, cannot login | (active user) |
| ADM-014 | Change user role | 1. Navigate to user detail<br>2. Change role to "Affiliate"<br>3. Save | User role updated | (customer to affiliate) |
| ADM-015 | User pagination | 1. Navigate to /admin/users | Users paginated, 20 per page | (many users) |

#### 6.3 Product Management (Admin)
**Priority**: Critical

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| ADM-016 | Create new product | 1. Login as admin<br>2. Navigate to /admin/products<br>3. Click "New Product"<br>4. Fill form<br>5. Save | Product created, visible in catalog | (valid product data) |
| ADM-017 | Edit existing product | 1. Navigate to /admin/products<br>2. Click "Edit" on product<br>3. Modify fields<br>4. Save | Product updated | (existing product) |
| ADM-018 | Delete product | 1. Navigate to /admin/products<br>2. Click "Delete" on product<br>3. Confirm | Product deleted, no longer in catalog | (any product) |
| ADM-019 | Add product category | 1. Navigate to /admin/products<br>2. Go to categories<br>3. Click "New Category"<br>4. Fill form<br>5. Save | Category created, available for products | name: "New Category" |
| ADM-020 | Create nested category | 1. Create category<br>2. Select parent category<br>3. Save | Child category created under parent | parent: "Agriculture" |
| ADM-021 | Upload product image | 1. Edit product<br>2. Click "Add Image"<br>3. Upload file<br>4. Save | Image uploaded to GCS, linked to product | (image file) |
| ADM-022 | Set main product image | 1. Edit product<br>2. Select image<br>3. Click "Set as Main"<br>4. Save | Main image flag set, displays first | (product with images) |
| ADM-023 | Delete product image | 1. Edit product<br>2. Click "Delete" on image<br>3. Confirm | Image removed from product and storage | (product image) |
| ADM-024 | Reorder product images | 1. Edit product<br>2. Drag images to reorder<br>3. Save | Image sort order updated | (product with multiple images) |
| ADM-025 | Update product stock | 1. Edit product<br>2. Change stock quantity<br>3. Save | Stock updated, low stock alert if < 10 | stock: 5 |
| ADM-026 | Set product as featured | 1. Edit product<br>2. Check "Featured"<br>3. Save | Product marked as featured, shows in featured section | (any product) |
| ADM-027 | Add product tags | 1. Edit product<br>2. Add tags<br>3. Save | Tags associated with product | tags: "organic, indoor" |
| ADM-028 | Update product SEO | 1. Edit product<br>2. Fill SEO title, description<br>3. Save | SEO metadata saved | (SEO data) |
| ADM-029 | Product validation errors | 1. Create product<br>2. Leave required fields empty<br>3. Try to save | Validation errors displayed | (empty required fields) |
| ADM-030 | Bulk product import | 1. Navigate to /admin/products<br>2. Upload CSV<br>3. Import | Multiple products created from CSV | (product CSV file) |

#### 6.4 Content Management (Admin)
**Priority**: Medium

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| ADM-031 | Create new content page | 1. Login as admin<br>2. Navigate to /admin/content<br>3. Click "New Page"<br>4. Fill form<br>5. Save | Content page created | (page content) |
| ADM-032 | Edit content page | 1. Navigate to /admin/content<br>2. Click "Edit" on page<br>3. Modify content<br>4. Save | Content updated | (existing page) |
| ADM-033 | Delete content page | 1. Navigate to /admin/content<br>2. Click "Delete"<br>3. Confirm | Page deleted | (any page) |
| ADM-034 | Publish draft content | 1. Create page as draft<br>2. Change status to "Published"<br>3. Save | Page published, visible to public | (draft page) |
| ADM-035 | Archive content | 1. Edit published page<br>2. Change status to "Archived"<br>3. Save | Page archived, not visible to public | (published page) |
| ADM-036 | Add featured image to content | 1. Edit content page<br>2. Upload featured image<br>3. Save | Featured image associated with page | (image file) |
| ADM-037 | Add tags to content | 1. Edit content page<br>2. Add tags<br>3. Save | Tags saved, used for filtering | tags: "tutorial, beginner" |
| ADM-038 | Content search | 1. Navigate to /admin/content<br>2. Search by title | Matching content displayed | query: "guide" |
| ADM-039 | Filter content by type | 1. Navigate to /admin/content<br>2. Filter by "Blog" | Only blog posts shown | type: "blog" |
| ADM-040 | Filter content by status | 1. Navigate to /admin/content<br>2. Filter by "Draft" | Only draft content shown | status: "draft" |

#### 6.5 File Management (Admin)
**Priority**: Medium

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| ADM-041 | View all files | 1. Login as admin<br>2. Navigate to /admin/files (or files section) | All uploaded files displayed | (admin account) |
| ADM-042 | File statistics | 1. Navigate to file management<br>2. View statistics | Total files, storage used, file types shown | (admin account) |
| ADM-043 | Delete file | 1. Navigate to files<br>2. Click "Delete" on file<br>3. Confirm | File removed from GCS and database | (any file) |
| ADM-044 | Filter files by type | 1. Navigate to files<br>2. Filter by "Images" | Only image files shown | type: "image" |
| ADM-045 | Filter files by entity | 1. Navigate to files<br>2. Filter by "Products" | Only product-related files shown | entity: "product" |
| ADM-046 | View file details | 1. Click on a file | File metadata, upload date, size, URL shown | (any file) |
| ADM-047 | Generate signed URL | 1. Navigate to private file<br>2. Click "Get Link" | Temporary signed URL generated | (private file) |

---

### 7. Content Pages (Public)

#### 7.1 Blog & Guides
**Priority**: Medium

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| CONT-001 | View blog listing | 1. Navigate to /blog | Published blog posts displayed | N/A |
| CONT-002 | View single blog post | 1. Navigate to /blog<br>2. Click on a post | Full blog post content displayed | (any blog post) |
| CONT-003 | Blog post SEO | 1. Navigate to blog post<br>2. View page source | Meta tags, OG tags present | (any blog post) |
| CONT-004 | View guides listing | 1. Navigate to /guides | Published guides displayed | N/A |
| CONT-005 | View single guide | 1. Navigate to /guides<br>2. Click on a guide | Full guide content displayed | (any guide) |
| CONT-006 | Search blog posts | 1. Navigate to /blog<br>2. Search by keyword | Matching posts displayed | query: "hydroponics" |
| CONT-007 | Filter blog by tags | 1. Navigate to /blog<br>2. Click on a tag | Posts with that tag displayed | tag: "tutorial" |
| CONT-008 | Featured image displays | 1. View blog post | Featured image shown at top | (post with featured image) |

#### 7.2 Static Pages
**Priority**: Low

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| CONT-009 | View About page | 1. Navigate to /about | About page content displayed | N/A |
| CONT-010 | View Contact page | 1. Navigate to /contact | Contact form/info displayed | N/A |
| CONT-011 | View Privacy Policy | 1. Navigate to /privacy | Privacy policy content displayed | N/A |
| CONT-012 | View Terms of Service | 1. Navigate to /terms | Terms content displayed | N/A |
| CONT-013 | View FAQ page | 1. Navigate to /faq | Published FAQs displayed | N/A |
| CONT-014 | FAQ accordion interaction | 1. Navigate to /faq<br>2. Click on question | Answer expands/collapses | (any FAQ) |
| CONT-015 | View Careers page | 1. Navigate to /careers | Careers info displayed | N/A |
| CONT-016 | View Help page | 1. Navigate to /help | Help resources displayed | N/A |

---

### 8. File Upload & Management

#### 8.1 File Upload
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| FILE-001 | Upload image (admin) | 1. Login as admin<br>2. Navigate to upload<br>3. Select image file<br>4. Upload | Image uploaded to GCS, URL returned | (image file < 5MB) |
| FILE-002 | Upload large file | 1. Upload file > 10MB | Error: "File too large" or progress indicator | (large file) |
| FILE-003 | Upload invalid file type | 1. Upload .exe file | Error: "Invalid file type" | (executable file) |
| FILE-004 | Multiple file upload | 1. Select multiple files<br>2. Upload all | All files uploaded successfully | (3 image files) |
| FILE-005 | File upload progress | 1. Upload large file<br>2. Watch progress | Progress bar shows upload status | (large file) |
| FILE-006 | Upload avatar image | 1. Navigate to profile<br>2. Upload avatar<br>3. Save | Avatar image uploaded, displayed in profile | (avatar image) |
| FILE-007 | Upload product image | 1. Admin edits product<br>2. Upload image<br>3. Save | Image uploaded, associated with product | (product image) |
| FILE-008 | Unique filename generation | 1. Upload file with duplicate name | New unique filename generated | (duplicate filename) |

#### 8.2 File Access & Security
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| FILE-009 | Access public file | 1. Navigate to public file URL | File accessible without auth | (public file URL) |
| FILE-010 | Access private file (unauthorized) | 1. Navigate to private file URL | Error: "Unauthorized" or file not accessible | (private file) |
| FILE-011 | Generate signed URL for private file | 1. Admin generates signed URL<br>2. Access URL | File accessible via signed URL | (private file) |
| FILE-012 | Signed URL expires | 1. Generate signed URL<br>2. Wait for expiration<br>3. Access URL | Error: "URL expired" | (expired signed URL) |
| FILE-013 | User can only access own files | 1. Login as User A<br>2. Try to access User B's file | Error: "Unauthorized" | (other user's file) |

---

### 9. User Profile & Account

#### 9.1 Profile Management
**Priority**: Medium

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| PROF-001 | View profile | 1. Login<br>2. Navigate to /account/profile | User profile displayed with name, email, username | (any user) |
| PROF-002 | Update first name | 1. Navigate to /account/profile<br>2. Change first name<br>3. Save | First name updated | firstName: "John" |
| PROF-003 | Update last name | 1. Navigate to /account/profile<br>2. Change last name<br>3. Save | Last name updated | lastName: "Doe" |
| PROF-004 | Update email | 1. Navigate to /account/profile<br>2. Change email<br>3. Save | Email updated, verification required | email: "new@example.com" |
| PROF-005 | Update avatar | 1. Navigate to /account/profile<br>2. Upload new avatar<br>3. Save | Avatar image updated | (image file) |
| PROF-006 | Cannot update to existing email | 1. Try to change email to existing one<br>2. Save | Error: "Email already in use" | (existing email) |
| PROF-007 | Cannot update to existing username | 1. Try to change username to existing one<br>2. Save | Error: "Username already taken" | (existing username) |
| PROF-008 | Profile validation errors | 1. Enter invalid data<br>2. Try to save | Validation errors displayed | (invalid data) |

#### 9.2 Account Settings
**Priority**: Low

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| PROF-009 | Change password | 1. Navigate to account settings<br>2. Enter current password<br>3. Enter new password<br>4. Confirm new password<br>5. Save | Password updated, can login with new password | (valid passwords) |
| PROF-010 | Change password - incorrect current | 1. Enter wrong current password<br>2. Try to save | Error: "Current password incorrect" | (wrong password) |
| PROF-011 | Change password - mismatch confirm | 1. Enter new password<br>2. Enter different confirmation<br>3. Try to save | Error: "Passwords don't match" | (mismatched passwords) |
| PROF-012 | View account status | 1. Navigate to account settings | Account status (active/inactive) displayed | (any user) |

---

### 10. Authorization & Security

#### 10.1 Role-Based Access Control
**Priority**: Critical

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| AUTH-001 | Customer cannot access admin routes | 1. Login as customer<br>2. Navigate to /admin | Redirect to home or error: "Unauthorized" | (customer account) |
| AUTH-002 | Affiliate can access affiliate dashboard | 1. Login as affiliate<br>2. Navigate to /affiliate | Affiliate dashboard accessible | (affiliate account) |
| AUTH-003 | Customer cannot access affiliate dashboard | 1. Login as customer (non-affiliate)<br>2. Navigate to /affiliate | Redirect to join page | (customer account) |
| AUTH-004 | Admin can access all routes | 1. Login as admin<br>2. Navigate to /admin, /affiliate, /account | All routes accessible | (admin account) |
| AUTH-005 | Guest redirected from protected routes | 1. As guest, navigate to /account/profile | Redirect to /login | (guest user) |
| AUTH-006 | Public routes accessible to all | 1. As guest, navigate to /products, /blog, /about | Pages accessible without auth | (guest user) |
| AUTH-007 | API endpoints respect authorization | 1. Call protected API without token | Error: "Unauthorized" | (no auth token) |
| AUTH-008 | Admin-only API endpoints | 1. As customer, call admin API | Error: "Forbidden" | (customer account) |

#### 10.2 Security Testing
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| SEC-001 | XSS protection in product description | 1. Admin creates product<br>2. Enter `<script>alert('XSS')</script>` in description<br>3. View product | Script not executed, escaped or stripped | (XSS payload) |
| SEC-002 | SQL injection protection | 1. Enter SQL injection in search: `' OR '1'='1`<br>2. Search | No database error, search handled safely | (SQL injection) |
| SEC-003 | Password not visible in network requests | 1. Login<br>2. Check network tab | Password sent securely, not visible | (any login) |
| SEC-004 | Session token in HTTP-only cookie | 1. Login<br>2. Check cookies | Session token has httpOnly flag | (any login) |
| SEC-005 | CSRF protection | 1. Submit form from external site | Request rejected or CSRF token required | (CSRF attempt) |
| SEC-006 | File upload security | 1. Upload file with double extension (.jpg.php) | File rejected or extension sanitized | (malicious file) |
| SEC-007 | Rate limiting on login | 1. Attempt login 10+ times with wrong password | Rate limit error or temporary lockout | (multiple failed logins) |
| SEC-008 | Sensitive data in URLs | 1. Browse application<br>2. Check URLs | No passwords, tokens in URL parameters | (all pages) |
| SEC-009 | Private files not directly accessible | 1. Try to access private file URL | Access denied without signed URL | (private file) |

---

### 11. Responsive Design & UI

#### 11.1 Responsive Layout
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| RESP-001 | Mobile viewport (375px) | 1. Resize browser to 375px width<br>2. Navigate through pages | Layout adapts, no horizontal scroll, readable text | (mobile viewport) |
| RESP-002 | Tablet viewport (768px) | 1. Resize to 768px width<br>2. Navigate through pages | Layout adapts, elements reflow properly | (tablet viewport) |
| RESP-003 | Desktop viewport (1920px) | 1. Resize to 1920px width<br>2. Navigate through pages | Layout uses full width appropriately | (desktop viewport) |
| RESP-004 | Mobile navigation menu | 1. View on mobile<br>2. Click hamburger menu | Menu opens/closes, links accessible | (mobile viewport) |
| RESP-005 | Product images responsive | 1. Resize browser<br>2. View product pages | Images scale appropriately, no distortion | (various viewports) |
| RESP-006 | Forms on mobile | 1. View forms on mobile<br>2. Fill and submit | Forms usable, inputs properly sized | (mobile viewport) |
| RESP-007 | Cart on mobile | 1. View cart on mobile | Cart items displayed properly, actions accessible | (mobile viewport) |
| RESP-008 | Admin dashboard on mobile | 1. Login as admin on mobile<br>2. View dashboard | Dashboard readable, charts/tables scroll | (mobile viewport) |

#### 11.2 UI Components
**Priority**: Medium

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| UI-001 | Buttons have hover states | 1. Hover over buttons | Visual feedback on hover | (any button) |
| UI-002 | Links have focus states | 1. Tab to links<br>2. Check focus | Focus outline visible | (any link) |
| UI-003 | Form inputs have focus states | 1. Click/tab into form inputs | Input border/outline changes | (any form) |
| UI-004 | Loading indicators | 1. Trigger long operation<br>2. Observe UI | Loading spinner or skeleton shown | (slow API call) |
| UI-005 | Error messages styled correctly | 1. Trigger validation error | Error text in red, clearly visible | (invalid form) |
| UI-006 | Success messages styled correctly | 1. Complete successful action | Success message in green, clearly visible | (successful action) |
| UI-007 | Modal dialogs | 1. Open modal (e.g., delete confirmation) | Modal centered, backdrop visible | (any modal) |
| UI-008 | Modal close functionality | 1. Open modal<br>2. Click close or outside | Modal closes | (any modal) |
| UI-009 | Tooltips display | 1. Hover over elements with tooltips | Tooltip appears with info | (any tooltip) |
| UI-010 | Breadcrumbs navigation | 1. Navigate to nested page<br>2. Check breadcrumbs | Breadcrumb trail shows current location | (nested page) |

---

### 12. Performance & Load Testing

#### 12.1 Performance
**Priority**: Medium

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| PERF-001 | Homepage load time | 1. Navigate to homepage<br>2. Measure load time | Page loads in < 3 seconds | N/A |
| PERF-002 | Product listing load time | 1. Navigate to /products<br>2. Measure load time | Page loads in < 3 seconds | N/A |
| PERF-003 | Product detail page load time | 1. Navigate to product detail<br>2. Measure load time | Page loads in < 2 seconds | N/A |
| PERF-004 | Search performance | 1. Enter search query<br>2. Submit<br>3. Measure response time | Results display in < 1 second | query: "plant" |
| PERF-005 | Image optimization | 1. View product pages<br>2. Check image sizes | Images optimized, < 500KB each | (product images) |
| PERF-006 | Lazy loading images | 1. Scroll down product list | Images load as they enter viewport | (long product list) |
| PERF-007 | API response times | 1. Monitor API calls<br>2. Check response times | Most APIs respond in < 500ms | (various API calls) |
| PERF-008 | Cart updates | 1. Add/update items in cart<br>2. Measure response | Cart updates in < 500ms | (cart operations) |

#### 12.2 Load Testing
**Priority**: Low

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| LOAD-001 | Concurrent users (10) | 1. Simulate 10 users browsing | Application responsive, no errors | (load test) |
| LOAD-002 | Concurrent users (100) | 1. Simulate 100 users browsing | Application handles load, possible slowdown | (load test) |
| LOAD-003 | Concurrent checkouts | 1. Multiple users checkout simultaneously | Orders process correctly, no stock errors | (load test) |
| LOAD-004 | Database connection pooling | 1. High traffic scenario<br>2. Monitor database connections | Connections pooled efficiently | (load test) |

---

### 13. Cross-Browser Compatibility

#### 13.1 Browser Testing
**Priority**: High

| Test Case ID | Description | Steps | Expected Result | Browsers to Test |
|--------------|-------------|-------|-----------------|------------------|
| BROW-001 | Chrome compatibility | 1. Open application in Chrome<br>2. Test core features | All features work correctly | Chrome (latest) |
| BROW-002 | Firefox compatibility | 1. Open application in Firefox<br>2. Test core features | All features work correctly | Firefox (latest) |
| BROW-003 | Safari compatibility | 1. Open application in Safari<br>2. Test core features | All features work correctly | Safari (latest) |
| BROW-004 | Edge compatibility | 1. Open application in Edge<br>2. Test core features | All features work correctly | Edge (latest) |
| BROW-005 | Mobile Safari | 1. Open on iPhone/iPad<br>2. Test core features | All features work correctly | iOS Safari |
| BROW-006 | Chrome Android | 1. Open on Android device<br>2. Test core features | All features work correctly | Chrome Android |

---

### 14. Accessibility (WCAG Compliance)

#### 14.1 Accessibility Testing
**Priority**: Medium

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| A11Y-001 | Keyboard navigation | 1. Navigate site using only keyboard (Tab, Enter, Space) | All interactive elements accessible | N/A |
| A11Y-002 | Screen reader compatibility | 1. Use screen reader (NVDA, JAWS)<br>2. Navigate site | Content read correctly, images have alt text | (screen reader) |
| A11Y-003 | Alt text on images | 1. View product images<br>2. Check alt attributes | All images have descriptive alt text | N/A |
| A11Y-004 | Form labels | 1. View forms<br>2. Check label associations | All inputs have associated labels | (any form) |
| A11Y-005 | Color contrast | 1. Check text/background contrast<br>2. Use contrast checker tool | Contrast ratio meets WCAG AA (4.5:1) | N/A |
| A11Y-006 | Focus indicators | 1. Tab through interactive elements | Visible focus indicator on all elements | N/A |
| A11Y-007 | ARIA labels | 1. Inspect interactive components<br>2. Check ARIA attributes | Proper ARIA labels on complex components | N/A |
| A11Y-008 | Heading hierarchy | 1. View page structure<br>2. Check heading levels | Headings follow logical hierarchy (H1 > H2 > H3) | N/A |
| A11Y-009 | Skip navigation link | 1. Tab on page load | "Skip to content" link appears | N/A |

---

### 15. Audit Logging

#### 15.1 Audit Trail
**Priority**: Low

| Test Case ID | Description | Steps | Expected Result | Test Data |
|--------------|-------------|-------|-----------------|-----------|
| AUDIT-001 | User registration logged | 1. Register new user<br>2. Check audit logs | Registration action recorded with timestamp | (new user) |
| AUDIT-002 | Login logged | 1. Login<br>2. Check audit logs | Login action recorded | (any user) |
| AUDIT-003 | Logout logged | 1. Logout<br>2. Check audit logs | Logout action recorded | (any user) |
| AUDIT-004 | Product creation logged | 1. Admin creates product<br>2. Check audit logs | Create action recorded with product ID | (new product) |
| AUDIT-005 | Product update logged | 1. Admin updates product<br>2. Check audit logs | Update action recorded with changes | (existing product) |
| AUDIT-006 | Product deletion logged | 1. Admin deletes product<br>2. Check audit logs | Delete action recorded | (deleted product) |
| AUDIT-007 | Order status change logged | 1. Admin updates order status<br>2. Check audit logs | Status change recorded | (order update) |
| AUDIT-008 | Audit log includes user details | 1. Perform action<br>2. Check audit log entry | User ID, username recorded | (any action) |
| AUDIT-009 | Audit log includes action details | 1. Perform action<br>2. Check audit log entry | Action type, entity ID, details recorded | (any action) |

---

## Test Coverage Summary

| Feature Category | Total Test Cases | Priority Critical | Priority High | Priority Medium | Priority Low |
|------------------|------------------|-------------------|---------------|-----------------|--------------|
| Authentication & Registration | 21 | 16 | 4 | 1 | 0 |
| Product Catalog | 29 | 0 | 19 | 10 | 0 |
| Shopping Cart | 13 | 13 | 0 | 0 | 0 |
| Checkout & Orders | 23 | 13 | 10 | 0 | 0 |
| Affiliate Program | 24 | 7 | 13 | 3 | 1 |
| Admin Dashboard | 40 | 15 | 15 | 10 | 0 |
| Content Pages | 16 | 0 | 0 | 8 | 8 |
| File Management | 13 | 0 | 8 | 5 | 0 |
| User Profile | 12 | 0 | 0 | 8 | 4 |
| Authorization & Security | 17 | 8 | 9 | 0 | 0 |
| Responsive Design & UI | 18 | 8 | 0 | 10 | 0 |
| Performance & Load | 12 | 0 | 0 | 8 | 4 |
| Cross-Browser | 6 | 0 | 6 | 0 | 0 |
| Accessibility | 9 | 0 | 0 | 9 | 0 |
| Audit Logging | 9 | 0 | 0 | 0 | 9 |
| **TOTAL** | **262** | **80** | **84** | **72** | **26** |

---

## Test Execution Guidelines

### Test Phases

1. **Phase 1: Critical Path Testing (Day 1-2)**
   - All Critical priority test cases
   - Focus: Authentication, Cart, Checkout, Authorization

2. **Phase 2: Core Functionality (Day 3-4)**
   - All High priority test cases
   - Focus: Products, Orders, Affiliate, Admin features

3. **Phase 3: Extended Testing (Day 5-6)**
   - All Medium priority test cases
   - Focus: Content, UI, Performance, Accessibility

4. **Phase 4: Nice-to-Have Testing (Day 7)**
   - All Low priority test cases
   - Focus: Audit logs, Content pages, Load testing

### Exit Criteria

- All Critical and High priority tests passed
- No Critical or High severity bugs open
- < 5 Medium severity bugs open
- All core user flows functional
- Application stable across main browsers (Chrome, Firefox, Safari)
- Mobile responsiveness verified

---

## Appendix

### Test Environments

- **Local Development**: http://localhost:5173
- **Staging**: (TBD)
- **Production**: (TBD)

### Test Accounts

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Admin | admin | admin@aevani.com | (provided) |
| Customer | customer1 | customer@example.com | (provided) |
| Affiliate | affiliate1 | affiliate@example.com | (provided) |

### Common Test Data

- **Valid Email**: test{timestamp}@example.com
- **Valid Username**: testuser{timestamp}
- **Valid Password**: TestPass123!
- **Product IDs**: (to be populated)
- **Category IDs**: (to be populated)

---

*Document Version: 1.0*
*Last Updated: 2026-01-09*
*Total Test Cases: 262*
