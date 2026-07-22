---
type: specification
title: Authentication journey contracts
status: planned
created: 2026-07-21
---

# Authentication journey contracts

Define the login, registration, logout, recovery, verification, redirect,
validation, throttle/lockout, session, and guest-cart-transfer journeys as
server-enforced contracts.

## Required outcomes

- Stable form names, labels, autocomplete hints, server validation, accessible
  errors, loading/disabled states, and safe retry behavior.
- Generic externally visible failure responses that preserve account-existence
  privacy and retain the existing throttling policy.
- Session cookies and capability tokens remain private; no raw bearer token is
  returned to application JavaScript.
- Guest-cart continuity is explicitly tested across sign in, registration, and
  checkout. Resource ownership is always enforced server-side.

## Release boundary

The auth capability flags remain disabled until the source-only migration
preflight, backup, and disposable rehearsal have been approved. UI polish does
not authorize a production capability change.
