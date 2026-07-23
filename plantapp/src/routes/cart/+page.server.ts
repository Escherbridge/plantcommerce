// The cart page loads through the universal `+page.ts` loader and performs every
// mutation client-side: quantity/remove via the tRPC cart router, and checkout via
// the existing `POST /api/checkout` endpoint. No server form actions are required.
export {};
