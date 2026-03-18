# TypeScript / SvelteKit Code Styleguide

## General Principles

- Use TypeScript strict mode for all `.ts` and `.svelte` files
- Prefer `const` over `let`; never use `var`
- Use Svelte 5 Runes API (`$state`, `$derived`, `$effect`, `$props`)
- Follow Prettier configuration (auto-formatted on save)

## File Organization

### SvelteKit Routes
- `+page.svelte` — Page component
- `+page.ts` — Client-side load function
- `+page.server.ts` — Server-side load/actions
- `+layout.server.ts` — Layout data loading

### Components
- Place reusable components in `src/lib/components/`
- Organize by domain: `forms/`, `images/`, `layout/`, `navigation/`, `ui/`
- Each domain folder has an `index.ts` barrel export
- Keep components small and composable

### tRPC API
- Routers in `src/lib/server/api/` (one file per domain)
- Root router in `src/lib/server/api/root.ts`
- Base procedures/context in `src/lib/server/api/trpc.ts`
- Client access via `src/lib/trpc/client.ts`
- All inputs validated with Zod schemas

### Service Layer
- Business logic in `src/lib/server/services/` (one file per domain)
- Services called by tRPC routers, not directly by routes
- Handle null cases gracefully: return empty result or throw tRPC error

### Data Loaders
- Reusable loaders in `src/lib/loaders/`
- `productCategory.ts` — Category page data
- `protected.ts` — Auth-gated page data

## Path Aliases

| Alias | Path | Usage |
|:---|:---|:---|
| `$lib` | `src/lib/` | General library code |

## Naming Conventions

- Files: `kebab-case.ts`, `PascalCase.svelte`
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE` for env-like values, `camelCase` for others
- Database columns: `snake_case` (Drizzle maps to camelCase in TS)

## Database & Drizzle

- Schema defined in `src/lib/server/db/schema.ts`
- Use Drizzle's type-safe query builder
- Migrations via `drizzle-kit generate` / `drizzle-kit migrate`
- Export inferred types: `type User = typeof user.$inferSelect`

## Error Handling

- Server: throw tRPC errors with appropriate codes (`NOT_FOUND`, `UNAUTHORIZED`, etc.)
- Client: handle tRPC errors with user-friendly messages
- Use `src/utils/errorHandler.ts` and `src/lib/utils/errorHandler.ts` for centralized handling

## CSS in Svelte Components

- Use DaisyUI semantic classes first (`btn-primary`, `card`, `alert`)
- Tailwind utility classes for spacing, layout, and custom styling
- Avoid `<style>` blocks unless absolutely necessary
