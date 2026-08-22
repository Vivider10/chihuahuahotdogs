# Kindred POS

## Project Overview

Kindred POS is a single-screen point-of-sale application for small counter-service businesses. Staff can add preset or custom items, adjust quantities, apply a 10% first responder discount, review totals, and complete a sale.

## Architecture

- **Framework:** TanStack Start with React 19 and file-based routing
- **Language:** TypeScript in strict mode
- **Styling:** Tailwind CSS import plus custom global CSS
- **Icons:** Lucide React
- **Deployment:** Netlify through the TanStack Start Netlify adapter
- **State:** Local React state; orders are intentionally session-only and are not persisted

## Key Directories

- `src/routes/` contains TanStack Router route files and the document shell.
- `src/components/` contains feature-level React components.
- `src/styles.css` contains the complete visual system, responsive layouts, and motion.
- `public/` contains static assets served directly.
- `.netlify/` contains Netlify runner context and generated task results.

## Main Flow

`src/routes/index.tsx` renders `PointOfSale`. The component owns the menu catalog, active cart, quantity changes, custom-item form, discount state, total calculations, and completion notice. No server endpoint is required because the requested checkout is a local calculator rather than a payment processor or order ledger.

## Conventions

- Use PascalCase for components and camelCase for functions and state.
- Keep money calculations numeric and format display values with `Intl.NumberFormat`.
- Keep accessible names on icon-only buttons and preserve visible focus states.
- Extend the existing CSS variables and visual language instead of introducing a second design system.
- Keep layouts touch-friendly and verify both the desktop split view and mobile stacked view.
- Do not add persistence unless the product requirements call for saved products, receipts, or sales history; persistent data must use Netlify Database.

## Commands

- `pnpm dev` starts the local development server.
- `pnpm build` creates a production build.
