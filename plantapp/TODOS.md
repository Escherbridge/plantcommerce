# Aevani TODO List

Based on code review analysis for scalability and maintainability improvements.

## High Priority

- [ ] Implement email verifications on user registration
- [x] Fix authentication race conditions in session management
- [x] Implement proper file upload validation (MIME types, signatures, virus scanning)
- [x] Add parameterized queries and input sanitization for database queries
- [x] Add missing database indexes for product search, affiliate clicks, orders, and files
- [x] Fix N+1 query problems by using joins or batch loading for product images

## Notes

- N+1 query problem for product images was not found during review. The code consistently uses `leftJoin` to fetch images, so this issue appears to have been resolved previously.
- [ ] Implement centralized error handling with proper logging (In Progress)
- [x] Implement CSP headers, request validation, and audit logging

## Medium Priority

- [ ] Refactor `checkUsernameAvailability` and `checkEmailAvailability` in `auth.ts` to use a specific method in `UserService`.
- [ ] Implement a proper logging service (e.g., Winston) to replace the `console.error` in `errorHandler.ts`.
- [ ] Integrate a real virus scanning service (e.g., ClamAV) in `fileValidation.ts`.
- [ ] Make the tax and shipping rates in `order.ts` configurable via environment variables.
- [ ] Implement CDN integration and image optimization for file storage
- [ ] Use streaming for large file uploads to improve memory management
- [ ] Add comprehensive type definitions for product dimensions, tags, and other any types
- [ ] Reduce code duplication in validation patterns and database queries
- [ ] Implement caching strategy with Redis for featured products and other data
- [ ] Implement rate limiting in hooks.server.ts
- [ ] Add database constraints and optimize queries with caching

## Low Priority

- [ ] Add more detailed audit logging for data changes (e.g., log the old and new values).
- [ ] Add event-driven architecture for domain events

## Notes

- Focus on security fixes first, then performance optimizations.
- Implement logging infrastructure as part of error handling for easy monitoring.
- Review and update this list as tasks are completed.