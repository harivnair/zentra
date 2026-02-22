# Copilot Instructions for Zentra (Next.js)

## Project Overview
- **Goal:** Primary interface (UI) for the Zentra system.
- **Backend:** Connects to a single backend service (`zentra-backend`). No other microservices.
- **Framework:** Next.js 16 (App Router), React 19, TypeScript

## AI Agent Model

- **Model to use:** Enable GPT-5 mini for all clients and agents working with this repository. Agents should default to `GPT-5 mini` when asked about or selecting a model for code generation, inspection, or edits in this project.
- **Why:** Alignment with internal tooling and response consistency across CI/code-review automation.
- **Styling:** Tailwind CSS 4, Shadcn/ui (in `src/components/ui/`)
- **Icons:** Lucide React
- **Forms:** Formik + Yup validation
- **Date Handling:** Moment.js, React Datepicker
- **State Management:** React Context (`src/context/`), Custom Hooks (`src/hooks/`)

## Architecture & Data Flow
- **Frontend (Client):**
  - Pages located in `src/app/(appshell)/` are protected routes wrapped in the app shell layout.
  - Data fetching uses `apiRequest` from `src/lib/api-client.ts`.
  - **Auth Flow:** `apiRequest` retrieves the token from secure storage and sends it as `X-Auth-Token` to the Next.js API layer.
- **API Layer (Next.js Server):**
  - Routes in `src/app/api/*` act as a proxy to the backend service.
  - **Proxy LogSingle external service (`zentra-backend`) configured via `BACKEND_URL` in `.env.local`.

## Key Conventions
- **API Endpoints:** All frontend API calls are defined in `src/lib/endpoint.ts`. Use `API_ENDPOINTS` object.ernal service configured via `BACKEND_URL` in `.env.local`.

## Key Conventions
- **Component Location:**
  - Reusable UI components: `src/components/ui/` (Shadcn/ui).
  - Feature-specific components: `src/components/` (e.g., `create-enquiry-modal.tsx`).
  - Page components: `src/app/(appshell)/[feature]/page.tsx`.
- **Type Safety:**
  - Shared types in `src/types/` (e.g., `client.ts`, `enquiry.ts`).
  - Always define interfaces for API responses and component props.
- **Modals:**
  - Used extensively for "Create" and "Edit" actions.
  - Pattern: `[Action][Entity]Modal` (e.g., `CreateEnquiryModal`).
  - Controlled via state in the parent page (`isModalOpen`, `modalMode`).

## Developer Workflows
- **Running Locally:** `npm run dev` (starts Next.js with Turbopack).
- **Linting:** `npm run lint` (ESLint).
- **Adding a New Feature:**
  1.  Define types in `src/types/`.
  2.  Create API route proxy in `src/app/api/[feature]/route.ts`.
  3.  Create UI components in `src/components/` (forms, modals).
  4.  Create page in `src/app/(appshell)/[feature]/page.tsx`.
- **Environment:** Ensure `BACKEND_URL` is set in `.env.local`.

## Code Patterns & Examples

### API Request (Frontend)
```typescript
import { apiRequest } from '@/lib/api-client'

// Fetching data
const response = await apiRequest('/api/clients')
if (!response.ok) throw new Error('Failed')
const data = await response.json()
```

### API Route Proxy (Server)
```typescript
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const upstream = process.env.BACKEND_URL
    const authToken = request.headers.get('X-Auth-Token')
    
    const headers: HeadersInit = {}
    if (authToken) headers['Authorization'] = authToken

    const res = await fetch(`${upstream}/endpoint`, { headers })
    // ... handle response
}
```

### Form Component (Formik)
```tsx
import { useFormik } from 'formik'
import * as Yup from 'yup'

// Use Shadcn UI components controlled by Formik
<Input 
  id="name" 
  {...formik.getFieldProps('name')} 
/>
```

## Referencendpoint.ts`: Centralized list of all API endpoints.
- `src/lib/es
- `src/lib/api-client.ts`: Authentication and request wrapper.
- `src/context/auth.tsx`: User session management.
- `package.json`: Dependencies (Next 16, React 19, Tailwind 4).

