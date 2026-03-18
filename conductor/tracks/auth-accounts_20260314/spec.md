# Specification: Auth & Accounts

## Overview

Complete all authentication and account management flows for the Aevani e-commerce platform. This is a brownfield track -- significant foundational code already exists (DB schema, UserService, auth module, tRPC routers, UI pages). The work focuses on filling gaps: rate limiting, account lockout, password reset, "remember me", wiring existing UI to real backends, and adding role-based route protection.

## Background

Aevani is a sustainable agriculture e-commerce platform with role-based users (customer, affiliate, admin). The authentication system uses custom session management with Argon2 password hashing and Oslo crypto utilities. No third-party auth library is used.

### Existing Infrastructure

- **DB schema** (`schema.ts`): `user`, `session`, `emailVerificationToken`, `loginAttempts`, `accountLocks`, `socialAccounts` tables all defined
- **Auth module** (`auth.ts`): `createSession`, `validateSessionToken`, `invalidateSession`, `generateEmailVerificationToken`, `validateEmailVerificationToken`
- **UserService** (`services/user.ts`): `createUser`, `login`, `getUserById`, `updateProfile`, `changePassword`, admin CRUD
- **Auth tRPC router** (`api/auth.ts`): `register`, `login`, `logout`, `getSession`, `refreshSession`, availability checks
- **Users tRPC router** (`api/users.ts`): `getProfile`, `updateProfile`, `changePassword`, `getOrderHistory`, admin procedures
- **tRPC middleware** (`api/trpc.ts`): `publicProcedure`, `protectedProcedure`, `adminProcedure`, `affiliateProcedure`, `customerProcedure`
- **UI pages**: `/login`, `/register`, `/verify-email`, `/account/profile`, `/account/orders`, `/account/wishlist`
- **hooks.server.ts**: Session validation on every request
- **Protected loader** (`loaders/protected.ts`): `requireAuth`, `requireAdmin`, `requireAffiliate`, `getUser`

### What Is Missing

1. **Rate limiting service** -- `loginAttempts` table exists but no service code queries or updates it
2. **Account lockout service** -- `accountLocks` table exists but no service code
3. **Password reset flow** -- No `passwordResetToken` table, no service, no routes (`/forgot-password`, `/reset-password`)
4. **"Remember me" support** -- `session.rememberMe` column exists but login flow ignores it; cookie duration is always 30 days
5. **Profile page not wired** -- Edit/save buttons exist in UI but do not call tRPC; no avatar upload
6. **Session cookie security** -- Missing `httpOnly`, `secure`, `sameSite` attributes
7. **Guest checkout awareness** -- Cart/checkout must not force login; account creation is optional post-purchase
8. **Resend verification email** -- No endpoint or UI to re-send if token expires

---

## Functional Requirements

### FR-1: User Registration with Email Verification

**Description:** Users register with username, email, and password. Password is hashed with Argon2. A verification email is sent. The user is auto-logged-in after registration.

**Current state:** Fully implemented in `authRouter.register` and `UserService.createUser`. Email verification token generation and send are wired. The `/register` page and `/verify-email` page exist.

**Gaps to close:**
- Add a "resend verification email" tRPC procedure
- Add a resend button on a verification reminder banner (shown when `emailVerified === false`)
- Input validation: enforce complexity rules via Zod

**Acceptance Criteria:**
- AC-1.1: Registration creates user with `emailVerified: false` and sends verification email
- AC-1.2: Verification link sets `emailVerified: true` and deletes all tokens for that user
- AC-1.3: Expired tokens (>48h) return an error with option to resend
- AC-1.4: Logged-in unverified users see a banner with resend button
- AC-1.5: Password must be >= 8 chars; Zod schema enforces this server-side
- AC-1.6: Duplicate username or email returns specific error messages

**Priority:** High

---

### FR-2: Login with Session Creation and "Remember Me"

**Description:** Users log in with username/email + password. A session is created with configurable duration based on "remember me" preference.

**Current state:** Login works end-to-end. Session is always created with 30-day expiry. No "remember me" checkbox on login page.

**Gaps to close:**
- Add `rememberMe` parameter to login tRPC procedure and UserService
- Standard session: 24 hours; "remember me" session: 30 days
- Set `rememberMe` flag on session record
- Add checkbox to login page UI
- Set session cookie with appropriate `maxAge` based on `rememberMe`

**Acceptance Criteria:**
- AC-2.1: Login with valid credentials creates session and sets auth cookie
- AC-2.2: Without "remember me", session expires in 24 hours
- AC-2.3: With "remember me", session expires in 30 days
- AC-2.4: Invalid credentials return generic "Invalid credentials" error (no user enumeration)
- AC-2.5: Login page has a "Remember me" checkbox
- AC-2.6: Session cookie is set with `httpOnly`, `secure` (in production), `sameSite: lax`, and `path: /`
- AC-2.7: Guest cart is transferred to user on login (already implemented)

**Priority:** High

---

### FR-3: Login Rate Limiting

**Description:** Brute-force protection using the `loginAttempts` table. Rate limiting is applied per IP address and per user identifier.

**Gaps to close:** Entire service layer and integration into login flow.

**Acceptance Criteria:**
- AC-3.1: After 5 failed attempts from same IP within 15 minutes, block that IP for 15 minutes
- AC-3.2: After 5 failed attempts for same user within 15 minutes, block that user for 15 minutes
- AC-3.3: Successful login resets the attempt counter for that identifier
- AC-3.4: Blocked login attempts return "Too many login attempts. Please try again later." with remaining lockout time
- AC-3.5: Rate limit records older than 24 hours are eligible for cleanup
- AC-3.6: Rate limiting does not leak whether a username/email exists

**Priority:** High

---

### FR-4: Account Lockout

**Description:** After repeated failed login attempts exceeding the rate limit threshold, the account is locked. Locked accounts require admin intervention or an unlock token sent via email.

**Gaps to close:** Entire service and integration.

**Acceptance Criteria:**
- AC-4.1: After 10 failed attempts for a user within 1 hour, the account is locked with reason `failed_attempts`
- AC-4.2: Locked accounts cannot log in; error message says "Account locked. Contact support or check your email."
- AC-4.3: An unlock token is generated and emailed to the user
- AC-4.4: Unlock token link unlocks the account and sets `unlockedAt`
- AC-4.5: Admin can manually unlock accounts via admin procedure
- AC-4.6: `isActive: false` users cannot log in (already enforced in UserService.login)

**Priority:** Medium

---

### FR-5: Password Reset Flow

**Description:** Users who forget their password can request a reset link via email. The link leads to a form where they set a new password.

**Gaps to close:** Password reset token table, service, tRPC procedures, and routes.

**Acceptance Criteria:**
- AC-5.1: `passwordResetToken` table added to schema with `id`, `userId`, `expiresAt`, `usedAt` columns
- AC-5.2: `/forgot-password` page accepts an email address
- AC-5.3: If email exists, a reset token is generated (expires in 1 hour) and emailed; if not, same success message shown (no user enumeration)
- AC-5.4: `/reset-password?token=<token>` page validates token and shows new password form
- AC-5.5: Submitting valid new password updates hash, marks token as used, invalidates all user sessions
- AC-5.6: Expired or already-used tokens show error with link back to forgot-password
- AC-5.7: Only one active reset token per user at a time (old tokens deleted on new request)

**Priority:** High

---

### FR-6: Account Profile Management

**Description:** Authenticated users can view and edit their profile information: name, email, username.

**Current state:** Profile page exists at `/account/profile` with edit toggle. Form fields exist but "Save" does not call tRPC. Password change form exists but is not wired.

**Gaps to close:**
- Wire "Save Changes" to `users.updateProfile` tRPC mutation
- Wire "Update Password" to `users.changePassword` tRPC mutation
- Show success/error feedback after mutations
- If email is changed, set `emailVerified: false` and send new verification email

**Acceptance Criteria:**
- AC-6.1: Users can update firstName, lastName, username from profile page
- AC-6.2: Users can update email; doing so sets `emailVerified: false` and sends verification email to new address
- AC-6.3: Users can change password by providing current + new password
- AC-6.4: Validation errors (duplicate email/username, wrong current password) shown inline
- AC-6.5: Success feedback is shown after each mutation

**Priority:** High

---

### FR-7: Order History Page

**Description:** Authenticated users can view their past orders with status, totals, and items.

**Current state:** `/account/orders` page exists with UI and calls `orders.getMyOrders` tRPC procedure. The page data structure references `order.items` with `item.product`.

**Gaps to close:**
- Ensure `OrderService.getUserOrders` returns data matching the page's expected shape (with items and product info)
- Order detail page at `/account/orders/[orderNumber]` needs to be wired to real data

**Acceptance Criteria:**
- AC-7.1: Orders page lists all user orders with status badge, date, and total
- AC-7.2: Each order shows its line items with product name, quantity, and price
- AC-7.3: Orders can be filtered by status (processing, shipped, delivered, cancelled)
- AC-7.4: Order detail page shows full order information including addresses and tracking
- AC-7.5: Empty state shown when user has no orders

**Priority:** Medium

---

### FR-8: Guest Checkout Support

**Description:** Users can complete checkout without creating an account. After checkout, they are optionally prompted to create an account using the email from their order.

**Current state:** Cart schema supports `sessionId` for guest carts. `authRouter.register` and `authRouter.login` accept `guestSessionId` to transfer carts. Order schema has nullable `userId`.

**Gaps to close:**
- Ensure checkout flow does not redirect to login
- After guest order confirmation, show "Create account to track your orders" prompt
- If guest creates account with same email as order, link the order to the new user

**Acceptance Criteria:**
- AC-8.1: Checkout does not require authentication
- AC-8.2: Guest checkout collects email for order confirmation
- AC-8.3: After successful guest checkout, optional account creation prompt is shown
- AC-8.4: If guest creates account with matching email, their past orders are linked to the new account
- AC-8.5: Guest users cannot access `/account/*` routes (redirected to login)

**Priority:** Medium

---

### FR-9: Session Management

**Description:** Secure session handling with auto-refresh, proper cookie attributes, and logout.

**Current state:** `hooks.server.ts` validates session on each request and renews if within 15 days of expiry. Cookie is set but without explicit security attributes.

**Gaps to close:**
- Add `httpOnly`, `secure`, `sameSite` to session cookie
- Differentiate session duration for "remember me" vs standard sessions
- Implement session auto-refresh that respects the original session type
- Ensure logout clears cookie and invalidates session server-side

**Acceptance Criteria:**
- AC-9.1: Session cookie has `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`
- AC-9.2: In production, session cookie has `secure: true`
- AC-9.3: Standard sessions auto-refresh when 50% of duration has elapsed
- AC-9.4: Remember-me sessions auto-refresh when 50% of duration has elapsed
- AC-9.5: Logout invalidates server session and deletes cookie
- AC-9.6: Expired sessions are cleaned up and return null user

**Priority:** High

---

### FR-10: Role-Based Access Control

**Description:** Route-level and procedure-level access control for customer, affiliate, and admin roles.

**Current state:** tRPC middleware exists for all roles. `requireAuth`, `requireAdmin`, `requireAffiliate` loaders exist. No SvelteKit route-level guards in `hooks.server.ts`.

**Gaps to close:**
- Add route-level guards in `hooks.server.ts` for `/account/*`, `/admin/*`, `/affiliate/*` paths
- Return 403 for unauthorized role access at route level (not just tRPC level)

**Acceptance Criteria:**
- AC-10.1: Unauthenticated users accessing `/account/*` are redirected to `/login`
- AC-10.2: Non-admin users accessing `/admin/*` receive 403 or redirect to home
- AC-10.3: Non-affiliate users accessing `/affiliate/*` (except `/affiliate/join`) are redirected
- AC-10.4: tRPC procedures enforce role checks (already implemented)
- AC-10.5: Route guards work for both page loads and API requests

**Priority:** High

---

## Non-Functional Requirements

### NFR-1: Security

- Passwords hashed with Argon2 (memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1) -- already configured
- Session tokens generated with cryptographically secure random bytes
- No user enumeration through login, registration, or password reset error messages
- CSRF protection via SvelteKit's built-in form handling and `sameSite` cookies
- Rate limiting on all auth endpoints

### NFR-2: Performance

- Login response time < 500ms (excluding Argon2 hashing, which is intentionally slow at ~200ms)
- Session validation in hooks.server.ts adds < 50ms overhead per request
- Rate limiting checks add < 10ms per login attempt (indexed queries)

### NFR-3: Test Coverage

- 70% coverage target on all new and modified auth service code
- Unit tests for: rate limiting logic, account lockout logic, password reset token lifecycle, session duration logic
- Integration tests for: tRPC auth procedures, session cookie behavior

---

## User Stories

### US-1: New User Registration
**As** a new visitor, **I want** to create an account with my email and password **so that** I can track orders and manage my profile.

**Given** I am on the registration page
**When** I fill in valid username, email, password, and optional name fields
**Then** my account is created, I am logged in, and a verification email is sent

### US-2: Returning User Login
**As** a registered user, **I want** to log in with my credentials **so that** I can access my account.

**Given** I am on the login page
**When** I enter valid credentials and optionally check "Remember me"
**Then** I am logged in with the appropriate session duration

### US-3: Forgotten Password
**As** a user who forgot my password, **I want** to reset it via email **so that** I can regain access to my account.

**Given** I am on the forgot-password page
**When** I enter my email address
**Then** I receive a reset link (if the email exists) and can set a new password

### US-4: Profile Management
**As** a logged-in user, **I want** to update my name, email, and password **so that** my account information stays current.

**Given** I am on the profile page in edit mode
**When** I modify fields and click Save
**Then** my profile is updated and I see a success message

### US-5: Order History
**As** a customer, **I want** to view my past orders **so that** I can track deliveries and reorder products.

**Given** I am on the orders page
**When** the page loads
**Then** I see my orders with status, date, items, and totals

### US-6: Guest Checkout
**As** a guest shopper, **I want** to complete a purchase without creating an account **so that** I can buy quickly.

**Given** I have items in my cart and am not logged in
**When** I proceed to checkout
**Then** I can complete the purchase with just my email and shipping info

---

## Technical Considerations

1. **Password reset token table** needs a new Drizzle migration -- add `passwordResetToken` to `schema.ts`
2. **Session duration logic** must be updated in `auth.ts` -- `createSession` needs a `rememberMe` parameter
3. **Rate limiting service** should use upsert patterns to avoid race conditions under concurrent requests
4. **Email service** is currently console-log only -- the password reset and account unlock emails will use the same stub; this is acceptable for now
5. **Cookie security attributes** in `setSessionTokenCookie` must be updated carefully to avoid breaking dev environment (`secure` only in production)
6. **Guest-to-user order linking** should be a background process triggered by account creation, matching on `customerEmail`

---

## Out of Scope

- Social/OAuth login (Google, Facebook) -- socialAccounts table exists for future use
- Avatar upload -- file storage integration is a separate track
- Two-factor authentication (2FA)
- Account deletion flow (UI exists but not wired)
- Email provider integration (SendGrid, AWS SES) -- using console.log stub
- Notification preferences
- Address book management
- Payment method management

---

## Open Questions

1. **Rate limit thresholds** -- Are 5 attempts / 15 minutes (rate limit) and 10 attempts / 1 hour (account lock) the right thresholds? These are configurable.
2. **Email change flow** -- Should changing email require re-verification before the new email is active, or is it immediate with a verification email sent?
3. **Session invalidation on password change** -- Should changing password invalidate all other sessions (force re-login on other devices)?
4. **Account lock auto-unlock** -- Should locked accounts auto-unlock after a time period (e.g., 24 hours), or require manual/email unlock only?
