# Enhanced Login Page Design Document

## Overview

This design document outlines the enhancement of the existing login page in the plant app to provide improved user experience, security, and modern authentication features. The design builds upon the current SvelteKit + TRPC + Drizzle ORM architecture while adding new capabilities like "Remember Me" functionality, rate limiting, social authentication, and enhanced accessibility.

## Architecture

### Current Architecture Analysis
- **Frontend**: SvelteKit with TypeScript, TailwindCSS, and DaisyUI components
- **Backend**: TRPC API with Zod validation
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom session-based auth with argon2 password hashing
- **State Management**: Svelte 5 runes for reactive state

### Enhanced Architecture Components
- **Rate Limiting Service**: In-memory store with Redis-like interface for production
- **Social Auth Integration**: OAuth 2.0 providers (Google initially)
- **Enhanced Session Management**: Extended session duration for "Remember Me"
- **Client-side Storage**: Local storage for username persistence
- **Accessibility Enhancements**: ARIA attributes and keyboard navigation

## Components and Interfaces

### 1. Enhanced Login Form Component

**Location**: `plantapp/src/routes/login/+page.svelte`

**New State Variables**:
```typescript
let rememberMe = $state(false);
let savedUsername = $state('');
let isRateLimited = $state(false);
let rateLimitTimeRemaining = $state(0);
let loginAttempts = $state(0);
```

**Enhanced Form Fields**:
- Remember Me checkbox
- Pre-populated username/email from local storage
- Rate limiting feedback display
- Enhanced error messaging with specific guidance

### 2. Rate Limiting Service

**Location**: `plantapp/src/lib/server/services/rateLimiting.ts`

**Interface**:
```typescript
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalHits: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs: number;
}

class RateLimitingService {
  static async checkLoginAttempt(identifier: string): Promise<RateLimitResult>
  static async recordFailedAttempt(identifier: string): Promise<void>
  static async resetAttempts(identifier: string): Promise<void>
  static async isAccountLocked(userId: string): Promise<boolean>
  static async lockAccount(userId: string): Promise<void>
}
```

**Rate Limiting Rules**:
- IP-based: 5 attempts per 15 minutes
- Account-based: 10 attempts per hour (triggers account lock)
- Progressive delays: 1s, 2s, 5s, 10s, 30s

### 3. Enhanced Authentication Router

**Location**: `plantapp/src/lib/server/api/auth.ts`

**New Endpoints**:
```typescript
enhancedLogin: publicProcedure
  .input(z.object({
    usernameOrEmail: z.string().min(1),
    password: z.string().min(1),
    rememberMe: z.boolean().optional(),
    guestSessionId: z.string().optional(),
    clientIP: z.string().optional()
  }))

socialLogin: publicProcedure
  .input(z.object({
    provider: z.enum(['google']),
    code: z.string(),
    state: z.string(),
    guestSessionId: z.string().optional()
  }))

unlockAccount: publicProcedure
  .input(z.object({
    token: z.string()
  }))
```

### 4. Social Authentication Service

**Location**: `plantapp/src/lib/server/services/socialAuth.ts`

**Interface**:
```typescript
interface SocialAuthProvider {
  getAuthUrl(state: string): string;
  exchangeCodeForTokens(code: string): Promise<TokenResponse>;
  getUserInfo(accessToken: string): Promise<SocialUserInfo>;
}

interface SocialUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

class GoogleAuthProvider implements SocialAuthProvider {
  // Implementation for Google OAuth 2.0
}
```

### 5. Enhanced Session Management

**Location**: `plantapp/src/lib/server/auth.ts`

**Enhanced Functions**:
```typescript
export async function createSession(
  token: string, 
  userId: string, 
  rememberMe: boolean = false
): Promise<Session>

export async function createExtendedSession(
  token: string, 
  userId: string
): Promise<Session> // 30-day expiration
```

## Data Models

### 1. Enhanced Session Schema

**Location**: `plantapp/src/lib/server/db/schema.ts`

```typescript
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  rememberMe: boolean('remember_me').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }).defaultNow()
});
```

### 2. Rate Limiting Schema

```typescript
export const loginAttempts = pgTable('login_attempts', {
  id: serial('id').primaryKey(),
  identifier: text('identifier').notNull(), // IP or user ID
  identifierType: text('identifier_type').notNull(), // 'ip' or 'user'
  attempts: integer('attempts').default(1),
  lastAttempt: timestamp('last_attempt', { withTimezone: true }).defaultNow(),
  blockedUntil: timestamp('blocked_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
```

### 3. Social Authentication Schema

```typescript
export const socialAccounts = pgTable('social_accounts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  provider: text('provider').notNull(), // 'google', 'facebook', etc.
  providerUserId: text('provider_user_id').notNull(),
  email: text('email'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
```

### 4. Account Lock Schema

```typescript
export const accountLocks = pgTable('account_locks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  reason: text('reason').notNull(), // 'failed_attempts', 'suspicious_activity'
  lockedAt: timestamp('locked_at', { withTimezone: true }).defaultNow(),
  unlockToken: text('unlock_token'),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true })
});
```

## Error Handling

### 1. Rate Limiting Errors

```typescript
class RateLimitError extends Error {
  constructor(
    public remaining: number,
    public resetTime: Date,
    public type: 'ip' | 'account'
  ) {
    super(`Rate limit exceeded. Try again in ${Math.ceil((resetTime.getTime() - Date.now()) / 1000)} seconds`);
  }
}
```

### 2. Account Lock Errors

```typescript
class AccountLockedError extends Error {
  constructor(public unlockEmailSent: boolean = false) {
    super('Account temporarily locked due to suspicious activity. Check your email for unlock instructions.');
  }
}
```

### 3. Social Auth Errors

```typescript
class SocialAuthError extends Error {
  constructor(
    public provider: string,
    public code: 'invalid_code' | 'user_denied' | 'email_conflict'
  ) {
    super(`Social authentication failed: ${code}`);
  }
}
```

### 4. Enhanced Error Display

**Client-side Error Handling**:
- Specific error messages for different failure types
- Countdown timers for rate limiting
- Clear instructions for account unlock
- Fallback to generic messages for security

## Testing Strategy

### 1. Unit Tests

**Rate Limiting Service Tests**:
- Test IP-based rate limiting
- Test account-based rate limiting
- Test rate limit reset functionality
- Test progressive delay calculations

**Social Auth Tests**:
- Mock OAuth provider responses
- Test token exchange flow
- Test user info retrieval
- Test account linking scenarios

**Enhanced Session Tests**:
- Test remember me functionality
- Test extended session duration
- Test session cleanup

### 2. Integration Tests

**Login Flow Tests**:
- Test complete login with remember me
- Test rate limiting integration
- Test social login flow
- Test account unlock flow

**Security Tests**:
- Test brute force protection
- Test session hijacking prevention
- Test CSRF protection
- Test input validation

### 3. Accessibility Tests

**A11y Testing**:
- Screen reader compatibility
- Keyboard navigation
- Focus management
- ARIA label validation
- Color contrast compliance

### 4. Performance Tests

**Load Testing**:
- Rate limiting under high load
- Session creation performance
- Database query optimization
- Social auth response times

## Security Considerations

### 1. Rate Limiting Security

- Use both IP and account-based limiting
- Implement progressive delays
- Store rate limit data securely
- Clear rate limits on successful login

### 2. Social Authentication Security

- Validate OAuth state parameter
- Verify token signatures
- Secure token storage
- Handle provider-specific security requirements

### 3. Session Security

- Secure cookie settings (httpOnly, secure, sameSite)
- Session token rotation
- Proper session cleanup
- Extended session monitoring

### 4. Data Protection

- Hash sensitive identifiers
- Encrypt stored tokens
- Secure local storage usage
- GDPR compliance for stored data

## Implementation Phases

### Phase 1: Core Enhancements
- Remember me functionality
- Enhanced error handling
- Username persistence
- Accessibility improvements

### Phase 2: Security Features
- Rate limiting implementation
- Account locking mechanism
- Enhanced session management
- Security monitoring

### Phase 3: Social Authentication
- Google OAuth integration
- Account linking functionality
- Social auth error handling
- Provider management

### Phase 4: Advanced Features
- Progressive delays
- Advanced security monitoring
- Performance optimizations
- Analytics integration