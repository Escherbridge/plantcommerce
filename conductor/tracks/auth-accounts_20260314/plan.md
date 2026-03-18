# Implementation Plan: Auth & Accounts

## Overview

This plan is organized into 6 phases that build on each other. Since this is brownfield work, many phases involve modifying existing files rather than creating from scratch. Each task follows the TDD cycle (Red -> Green -> Refactor) and is scoped to 30min-2hr of work.

**Key files that will be modified:**
- `plantapp/src/lib/server/db/schema.ts` -- add `passwordResetToken` table
- `plantapp/src/lib/server/auth.ts` -- session duration, cookie security, password reset tokens
- `plantapp/src/lib/server/services/user.ts` -- integrate rate limiting, lockout checks
- `plantapp/src/lib/server/api/auth.ts` -- remember me, rate limiting, password reset procedures
- `plantapp/src/lib/server/api/users.ts` -- resend verification, email change re-verification
- `plantapp/src/hooks.server.ts` -- cookie security, route guards
- `plantapp/src/routes/login/+page.svelte` -- remember me checkbox
- `plantapp/src/routes/account/profile/+page.svelte` -- wire edit/save to tRPC

**Key files that will be created:**
- `plantapp/src/lib/server/services/rateLimit.ts`
- `plantapp/src/lib/server/services/accountLock.ts`
- `plantapp/src/lib/server/services/passwordReset.ts`
- `plantapp/src/routes/forgot-password/+page.svelte`
- `plantapp/src/routes/reset-password/+page.svelte` and `+page.server.ts`
- `plantapp/src/routes/unlock-account/+page.server.ts` and `+page.svelte`
- Test files for each new service

---

## Phase 1: Session Security & "Remember Me"

**Goal:** Harden session cookie handling and implement differentiated session durations. This is the foundation everything else depends on.

### Task 1.1: Secure Session Cookie Attributes

- [ ] Write test: Verify `setSessionTokenCookie` sets `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, and `secure: true` when `NODE_ENV === 'production'`
- [ ] Implement: Update `setSessionTokenCookie` in `plantapp/src/lib/server/auth.ts` to include all security attributes. Use `event.url.protocol === 'https:'` or env check for the `secure` flag.
- [ ] Refactor: Extract cookie config into a constant object for reuse

### Task 1.2: Session Duration Based on "Remember Me"

- [ ] Write test: `createSession` with `rememberMe: false` creates session expiring in 24 hours; with `rememberMe: true` creates session expiring in 30 days. Verify `rememberMe` flag is stored on the session record.
- [ ] Implement: Add `rememberMe` parameter to `createSession` in `plantapp/src/lib/server/auth.ts`. Update session insert to include `rememberMe` field and calculate `expiresAt` accordingly.
- [ ] Refactor: Define `SESSION_DURATION_STANDARD = 24 * 60 * 60 * 1000` and `SESSION_DURATION_REMEMBER = 30 * 24 * 60 * 60 * 1000` constants

### Task 1.3: Session Auto-Refresh Respects Session Type

- [ ] Write test: `validateSessionToken` refreshes a standard session (24h) when 50% elapsed; refreshes a remember-me session (30d) when 50% elapsed. Each refreshes by the original duration, not a fixed 30 days.
- [ ] Implement: Update `validateSessionToken` in `plantapp/src/lib/server/auth.ts` to read `session.rememberMe` and use the appropriate duration for renewal threshold and new expiry.
- [ ] Refactor: Consolidate duration logic into a helper `getSessionDuration(rememberMe: boolean)`

### Task 1.4: Update Login Flow for "Remember Me"

- [ ] Write test: `UserService.login` accepts `rememberMe` param and passes it to `createSession`. Verify the returned session has the correct `expiresAt`.
- [ ] Implement: Update `LoginParams` interface and `UserService.login` in `plantapp/src/lib/server/services/user.ts`. Update `authRouter.login` in `plantapp/src/lib/server/api/auth.ts` to accept and forward `rememberMe`. Update `authRouter.register` to default `rememberMe: false`.
- [ ] Refactor: Ensure consistent parameter passing through the call chain

### Task 1.5: Login Page "Remember Me" Checkbox

- [ ] Write test: Component test -- login form includes a "Remember me" checkbox and its value is sent with the login mutation
- [ ] Implement: Add checkbox to `plantapp/src/routes/login/+page.svelte`. Add `rememberMe` state variable, bind to checkbox, include in `trpc.auth.login.mutate()` call.
- [ ] Refactor: Verify styling consistency with DaisyUI form patterns

### Task 1.6: Verification -- Session Security

- [ ] Verify: Log in with and without "Remember me". Inspect cookies in browser dev tools to confirm `httpOnly`, `sameSite`, `secure` (if HTTPS), and correct `maxAge`/`expires` values. Confirm session renewal works by waiting or manually adjusting time. [checkpoint marker]

---

## Phase 2: Rate Limiting & Account Lockout

**Goal:** Protect login endpoint from brute-force attacks using the existing `loginAttempts` and `accountLocks` tables.

### Task 2.1: Rate Limiting Service -- Core Logic

- [ ] Write test: `RateLimitService.checkRateLimit(identifier, type)` returns `{ blocked: false }` when under threshold. Returns `{ blocked: true, retryAfter: Date }` when at/over threshold. `recordFailedAttempt` increments counter. `resetAttempts` clears counter.
- [ ] Implement: Create `plantapp/src/lib/server/services/rateLimit.ts` with `RateLimitService` class. Methods: `checkRateLimit`, `recordFailedAttempt`, `resetAttempts`, `cleanupOldAttempts`. Use the existing `loginAttempts` table. Threshold: 5 attempts in 15 minutes, block for 15 minutes.
- [ ] Refactor: Make thresholds configurable via constants at top of file

### Task 2.2: Rate Limiting Service -- Edge Cases

- [ ] Write test: Attempts older than the window (15 min) do not count toward threshold. Concurrent `recordFailedAttempt` calls do not lose counts (use upsert). `cleanupOldAttempts` removes records older than 24 hours.
- [ ] Implement: Use Drizzle's `onConflictDoUpdate` or transaction-based upsert for atomic increment. Add `where` clause filtering by time window in `checkRateLimit`.
- [ ] Refactor: Ensure all queries use the existing indexes on `loginAttempts`

### Task 2.3: Account Lockout Service

- [ ] Write test: `AccountLockService.isAccountLocked(userId)` returns false for unlocked users. Returns true when active lock exists (no `unlockedAt`). `lockAccount(userId, reason)` creates lock record and generates unlock token. `unlockAccount(token)` sets `unlockedAt`.
- [ ] Implement: Create `plantapp/src/lib/server/services/accountLock.ts` with `AccountLockService` class. Methods: `isAccountLocked`, `lockAccount`, `unlockAccount`, `adminUnlockAccount(userId)`.
- [ ] Refactor: Add `sendAccountLockedEmail` method to `EmailService` with unlock link

### Task 2.4: Integrate Rate Limiting into Login Flow

- [ ] Write test: Login with rate-limited IP returns TRPCError with `TOO_MANY_REQUESTS` code. Login with locked account returns `FORBIDDEN`. Successful login resets rate limit counters. Failed login increments counters for both IP and user.
- [ ] Implement: Update `authRouter.login` in `plantapp/src/lib/server/api/auth.ts` to call `RateLimitService.checkRateLimit` before authentication. On failure, call `recordFailedAttempt` for IP and user. On success, call `resetAttempts`. After 10 user failures in 1 hour, call `AccountLockService.lockAccount`.
- [ ] Refactor: Extract IP address retrieval into a utility function

### Task 2.5: Account Unlock Route

- [ ] Write test: GET `/unlock-account?token=<valid>` unlocks account. Invalid/expired token shows error. Already-unlocked token shows appropriate message.
- [ ] Implement: Create `plantapp/src/routes/unlock-account/+page.server.ts` (load function validates token) and `+page.svelte` (success/error UI).
- [ ] Refactor: Reuse pattern from existing `/verify-email` route

### Task 2.6: Admin Unlock Procedure

- [ ] Write test: `users.adminUnlockAccount` with admin role unlocks account. Non-admin role returns FORBIDDEN.
- [ ] Implement: Add `adminUnlockAccount` procedure to `plantapp/src/lib/server/api/users.ts` using `adminProcedure`.
- [ ] Refactor: Ensure audit log entry is created on unlock

### Task 2.7: Verification -- Rate Limiting

- [ ] Verify: Attempt login 6 times with wrong password from same context. Confirm 6th attempt is blocked with appropriate error message. Verify the user's account is not yet locked (only rate-limited). Wait 15 minutes (or adjust thresholds for test) and confirm access is restored. Test account lockout at 10 failures. [checkpoint marker]

---

## Phase 3: Password Reset Flow

**Goal:** Complete forgot-password -> email -> reset form -> new password flow.

### Task 3.1: Password Reset Token Schema

- [ ] Write test: `passwordResetToken` table insert and select work correctly. `expiresAt` and `usedAt` fields function as expected.
- [ ] Implement: Add `passwordResetToken` table to `plantapp/src/lib/server/db/schema.ts` with columns: `id` (text PK), `userId` (text FK to user), `expiresAt` (timestamp), `usedAt` (timestamp, nullable), `createdAt` (timestamp). Run `npm run db:generate` and `npm run db:push` to apply migration.
- [ ] Refactor: Add exported type `PasswordResetToken` and add relation to user

### Task 3.2: Password Reset Service

- [ ] Write test: `PasswordResetService.createToken(userId)` generates token, deletes old tokens for user, stores new token with 1-hour expiry. `validateToken(tokenId)` returns userId for valid unexpired unused token, returns null for expired/used/missing tokens. `markTokenUsed(tokenId)` sets `usedAt`.
- [ ] Implement: Create `plantapp/src/lib/server/services/passwordReset.ts`. Use `@oslojs/encoding` for token generation (same pattern as `generateEmailVerificationToken`).
- [ ] Refactor: Extract token generation into shared utility if pattern repeats

### Task 3.3: Password Reset tRPC Procedures

- [ ] Write test: `auth.requestPasswordReset` with existing email creates token and returns success. With non-existing email also returns success (no enumeration). `auth.resetPassword` with valid token and new password updates hash, marks token used, invalidates all user sessions. With invalid token returns error.
- [ ] Implement: Add `requestPasswordReset` and `resetPassword` procedures to `plantapp/src/lib/server/api/auth.ts`. Add `sendPasswordResetEmail` to `EmailService`.
- [ ] Refactor: Ensure audit log entries for both request and completion

### Task 3.4: Forgot Password Page

- [ ] Write test: Component renders email input and submit button. Submitting calls `auth.requestPasswordReset`. Success state shows "Check your email" message regardless of whether email exists.
- [ ] Implement: Create `plantapp/src/routes/forgot-password/+page.svelte` with email form, loading state, success message, and link back to login.
- [ ] Refactor: Match styling with existing login/register pages

### Task 3.5: Reset Password Page

- [ ] Write test: Page validates token on server load. Valid token shows password form. Invalid/expired token shows error with link to forgot-password. Submitting new password calls `auth.resetPassword` and redirects to login on success.
- [ ] Implement: Create `plantapp/src/routes/reset-password/+page.server.ts` (token validation in load) and `+page.svelte` (new password form with confirm field).
- [ ] Refactor: Add password strength indicator matching register page pattern

### Task 3.6: Verification -- Password Reset Flow

- [ ] Verify: Request password reset with valid email, check console for reset link. Follow link, enter new password, confirm redirect to login. Log in with new password. Verify old password no longer works. Test with expired token. Test with already-used token. Test with non-existent email (should show same success message). [checkpoint marker]

---

## Phase 4: Email Verification Improvements & Profile Wiring

**Goal:** Add resend verification, wire profile edit/save to backend, handle email change re-verification.

### Task 4.1: Resend Verification Email Procedure

- [ ] Write test: `auth.resendVerificationEmail` (protected) generates new token, sends email, returns success. Calling when already verified returns error. Rate limited to 1 per minute.
- [ ] Implement: Add `resendVerificationEmail` procedure to `plantapp/src/lib/server/api/auth.ts`. Delete old tokens before generating new one.
- [ ] Refactor: Extract email verification token logic into reusable helper

### Task 4.2: Email Verification Banner Component

- [ ] Write test: Banner renders when user `emailVerified === false`. Not rendered when `emailVerified === true`. Resend button calls `auth.resendVerificationEmail`. Success/error states displayed.
- [ ] Implement: Create `plantapp/src/lib/components/ui/EmailVerificationBanner.svelte`. Include in account layout or relevant pages. Use tRPC client to call resend.
- [ ] Refactor: Use DaisyUI alert component with dismissible pattern

### Task 4.3: Wire Profile Edit to tRPC

- [ ] Write test: Profile save button calls `users.updateProfile` with form data. Success shows toast/alert. Error shows inline message. Form resets to saved values after cancel.
- [ ] Implement: Update `plantapp/src/routes/account/profile/+page.svelte` to call `trpc.users.updateProfile.mutate()` on save. Add loading, success, and error states.
- [ ] Refactor: Extract form validation into Zod schema matching server-side validation

### Task 4.4: Wire Password Change to tRPC

- [ ] Write test: Password change form calls `users.changePassword` with current and new password. Success clears form and shows confirmation. Wrong current password shows error.
- [ ] Implement: Update the password change section in `plantapp/src/routes/account/profile/+page.svelte`. Bind inputs to state, add submit handler calling `trpc.users.changePassword.mutate()`.
- [ ] Refactor: Add confirm-password field validation before submit

### Task 4.5: Email Change Triggers Re-Verification

- [ ] Write test: When `updateProfile` changes email, `emailVerified` is set to `false` and a new verification email is sent. When email is unchanged, `emailVerified` is not modified.
- [ ] Implement: Update `UserService.updateProfile` in `plantapp/src/lib/server/services/user.ts` to detect email change, set `emailVerified: false`, and generate + send verification token. Update `users.updateProfile` tRPC procedure if needed.
- [ ] Refactor: Return `emailVerified` status in profile update response so UI can react

### Task 4.6: Verification -- Profile Management

- [ ] Verify: Edit profile fields and save -- confirm data persists on page reload. Change email -- confirm verification banner appears. Click resend -- confirm console shows new verification email. Change password -- confirm old password rejected and new password accepted. [checkpoint marker]

---

## Phase 5: Route Guards & Role-Based Access

**Goal:** Add server-side route protection in hooks.server.ts so protected routes are guarded before page code runs.

### Task 5.1: Route Guard Middleware in hooks.server.ts

- [ ] Write test: Unauthenticated request to `/account/profile` returns 303 redirect to `/login?redirect=/account/profile`. Authenticated customer request to `/admin/dashboard` returns 403. Authenticated admin request to `/admin/dashboard` proceeds normally.
- [ ] Implement: Update `plantapp/src/hooks.server.ts` to add route matching after session validation. Define route rules: `/account/*` requires auth, `/admin/*` requires admin role, `/affiliate/*` (except `/affiliate/join`) requires affiliate or admin role.
- [ ] Refactor: Extract route rules into a configuration object for maintainability

### Task 5.2: Redirect Preservation on Login

- [ ] Write test: Login page reads `redirect` query param. After successful login, user is redirected to the preserved URL instead of default `/account`.
- [ ] Implement: Update `plantapp/src/routes/login/+page.svelte` to read `redirect` from `$page.url.searchParams` and use it in the post-login redirect. Validate redirect is a relative path (prevent open redirect).
- [ ] Refactor: Add redirect param to register page as well

### Task 5.3: Guest Checkout Route Guard Exception

- [ ] Write test: Unauthenticated request to `/checkout` does NOT redirect to login. Unauthenticated request to `/checkout/confirmation` does NOT redirect to login.
- [ ] Implement: Ensure `/checkout` and `/checkout/*` paths are excluded from auth requirements in the route guard configuration.
- [ ] Refactor: Document the route guard rules in code comments

### Task 5.4: Verification -- Route Guards

- [ ] Verify: As guest, navigate to `/account/profile` -- redirected to login. Log in -- redirected back to profile. As customer, navigate to `/admin/dashboard` -- see 403 page. As guest, navigate to `/checkout` -- allowed through. [checkpoint marker]

---

## Phase 6: Order History & Guest Checkout Polish

**Goal:** Wire order history to real data and ensure guest checkout flow is complete.

### Task 6.1: Order History Data Shape

- [ ] Write test: `OrderService.getUserOrders` returns orders with items array. Each item includes `productName`, `productSku`, `quantity`, `unitPrice`, `totalPrice`. Orders are sorted by `createdAt` descending. Status filter works.
- [ ] Implement: Verify or update `plantapp/src/lib/server/services/order.ts` `getUserOrders` method to join `orderItem` and return the shape expected by the orders page. Update `users.getOrderHistory` tRPC procedure if needed.
- [ ] Refactor: Ensure consistent decimal-to-number formatting for prices

### Task 6.2: Order Detail Page Wiring

- [ ] Write test: `/account/orders/[orderNumber]` load function fetches order by orderNumber. Returns 404 for non-existent order. Returns 403 if order belongs to different user.
- [ ] Implement: Update `plantapp/src/routes/account/orders/[orderNumber]/+page.server.ts` to load order data via tRPC or direct service call. Update `+page.svelte` to display full order details.
- [ ] Refactor: Show shipping address, billing address, item details, and order timeline

### Task 6.3: Guest-to-User Order Linking

- [ ] Write test: When a user registers with email matching existing guest orders (`userId IS NULL` and `customerEmail` matches), those orders are linked to the new user.
- [ ] Implement: Add `linkGuestOrders(userId, email)` method to `OrderService`. Call it from `authRouter.register` after user creation.
- [ ] Refactor: Use a transaction to ensure atomicity

### Task 6.4: Post-Checkout Account Creation Prompt

- [ ] Write test: Order confirmation page for guest (no auth session) shows "Create account" prompt with email pre-filled. For authenticated users, the prompt is not shown.
- [ ] Implement: Update the order confirmation page to check auth state. If guest, show a registration form/link with `email` pre-filled and `guestSessionId` included.
- [ ] Refactor: Style consistent with site design using DaisyUI card component

### Task 6.5: Verification -- Full Auth Flows End-to-End

- [ ] Verify: Complete registration flow: register -> verify email -> login with remember me -> view profile -> edit profile -> change password -> view orders -> logout. Complete guest flow: add to cart -> checkout as guest -> see account creation prompt -> create account -> verify previous order appears in order history. Complete password reset: logout -> forgot password -> reset -> login with new password. Test rate limiting: 6 rapid failed logins -> blocked -> wait -> unblocked. Test route guards: try accessing /admin as customer -> blocked. [checkpoint marker]

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 6 | Session security, cookie hardening, "remember me" |
| 2 | 7 | Rate limiting service, account lockout, brute-force protection |
| 3 | 6 | Password reset flow end-to-end |
| 4 | 6 | Email verification improvements, profile page wiring |
| 5 | 4 | Route guards, role-based access, redirect preservation |
| 6 | 5 | Order history wiring, guest checkout polish |
| **Total** | **34** | |

**Estimated effort:** ~40-60 hours across all phases

**Dependencies between phases:**
- Phase 1 must complete before Phase 2 (rate limiting integrates with updated login flow)
- Phase 3 can run in parallel with Phase 2 after Phase 1
- Phase 4 depends on Phase 1 (session/cookie changes)
- Phase 5 depends on Phase 1 (auth state in hooks)
- Phase 6 depends on Phase 5 (route guards) and can start once Phase 4 is in progress
