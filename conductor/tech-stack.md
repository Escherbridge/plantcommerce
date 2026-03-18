# Aevani — Tech Stack

## Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| SvelteKit | 2.x | Full-stack web framework |
| Svelte | 5.x | UI component framework (runes) |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 4.x | Utility-first CSS |
| DaisyUI | 5.x | Component library |
| Storybook | 9.x | Component development & docs |

## Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| tRPC | 11.x | End-to-end typesafe APIs |
| Drizzle ORM | 0.40.x | Type-safe database operations |
| PostgreSQL | — | Relational database |
| Zod | 4.x | Runtime validation |
| Stripe | — | Payment processing |
| Google Cloud Storage | — | File/media storage |

## Auth & Security
| Technology | Purpose |
|-----------|---------|
| @node-rs/argon2 | Password hashing |
| @oslojs/crypto | Cryptographic operations |
| @oslojs/encoding | Encoding utilities |
| Custom session management | Cookie-based auth with role-based access |

## Development & Build
| Technology | Version | Purpose |
|-----------|---------|---------|
| Vite | 7.x | Build tool & dev server |
| Vitest | 3.x | Unit/integration testing |
| Prettier | 3.x | Code formatting |
| Docker | — | Local PostgreSQL |
| Drizzle Kit | 0.30.x | Database migrations |

## Deployment
| Target | Details |
|--------|---------|
| Railway | Application hosting & PostgreSQL |

## Project Structure
```
plantcommerce/
├── plantapp/              # Main SvelteKit application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/  # Reusable UI (forms, images, layout, nav, ui)
│   │   │   ├── server/      # Backend (api/, services/, db/)
│   │   │   ├── trpc/        # tRPC client
│   │   │   ├── loaders/     # Page data loaders
│   │   │   └── utils/       # Shared utilities
│   │   ├── routes/          # SvelteKit pages & API routes
│   │   └── stories/         # Storybook stories
│   ├── drizzle/             # DB migrations
│   └── static/              # Static assets
├── documentation/           # Project docs
└── market_research/         # Market analysis
```

## Key Architectural Patterns
- **tRPC routers** in `src/lib/server/api/` with Zod validation
- **Service layer** in `src/lib/server/services/` for business logic
- **Drizzle schema** in `src/lib/server/db/schema.ts` (single file)
- **Component library** organized by domain (forms, images, layout, navigation, ui)
- **Page loaders** in `src/lib/loaders/` for reusable data loading
