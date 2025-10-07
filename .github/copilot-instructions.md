# Copilot Instructions for Zentra (Next.js)

## Project Overview
- **Framework:** Next.js (App Router, TypeScript)
- **Frontend:** Pages and layouts in `src/app/`, UI components in `src/components/`
- **API Layer:** Server-side API routes in `src/app/api/*` proxy requests to a backend service (see `BACKEND_URL`)
- **Types:** Shared types in `src/types/`
- **State/Context:** React context in `src/context/`, custom hooks in `src/hooks/`

## Key Patterns & Conventions
- **Modular Structure:** Features (e.g., bills, events, reports) are organized as folders under `src/app/(appshell)/`
- **UI Components:** Use reusable components from `src/components/ui/` for forms, buttons, inputs, etc.
- **Modals:** Modal forms (e.g., `create-enquiry-modal-formik.tsx`) are used for entity creation/editing.
- **Type Safety:** All API and component props use TypeScript types from `src/types/`
- **API Proxy:** API routes (e.g., `src/app/api/enquiries/route.ts`) forward requests to the backend using the `BACKEND_URL` env variable.
- **Environment Config:** Set up `.env.local` with `BACKEND_URL` for local backend integration.

## Developer Workflows
- **Start Dev Server:** `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`)
- **Edit UI:** Change files in `src/app/` or `src/components/` and hot-reload at [http://localhost:3000](http://localhost:3000)
- **Backend Integration:** Ensure backend is running and `BACKEND_URL` is set in `.env.local`
- **Add Types:** Define new types in `src/types/` and import where needed

## Integration Points
- **Backend:** All data fetches go through API routes in `src/app/api/*`, not directly from frontend
- **Assets:** Static files (images, SVGs) are in `public/` and referenced in components
- **Global Styles:** Shared styles in `src/app/globals.css`

## Examples
- To add a new feature (e.g., invoices):
  1. Create a folder under `src/app/(appshell)/invoices/`
  2. Add a page (`page.tsx`) and connect to backend via API route
  3. Use UI components from `src/components/ui/`
  4. Define types in `src/types/invoice.ts`

- To add a new API route:
  1. Create a file in `src/app/api/[entity]/route.ts`
  2. Use `process.env.BACKEND_URL` to forward requests

## References
- See `README.md` for setup and deployment details
- See `DEPLOY.md` and `DEPLOY_SCRIPT.md` for deployment instructions

---
**Update this file if major architectural changes are made.**
