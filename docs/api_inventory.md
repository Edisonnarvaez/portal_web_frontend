## API Inventory — Mapping backend OpenAPI -> frontend

This document is an initial inventory that maps high-priority backend endpoints (from `openapi_documentation.md` and `architecture_backend_API.md`) to existing frontend clients/services/hooks. It is a working snapshot used to plan implementation work.

Notes:
- Date: 2025-10-07
- Author: automated inventory (based on repository scan)

---

### Legend
- Status: implemented | partial | missing | mismatch
- "Frontend files" lists the primary files found that call the endpoint

---

## 1) Authentication (high priority)

- POST /token/ (OpenAPI)
  - Frontend files: `src/apps/auth/infrastructure/AuthService.ts`, `src/apps/auth/application/services/AuthService.ts`, `src/apps/auth/infrastructure/AuthService.ts`
  - Status: implemented
  - Notes: frontend posts to `/token/` and stores token(s). Interceptor in `src/core/infrastructure/http/axiosInstance.ts` expects `access_token`/`refresh_token` storage keys.

- POST /token/refresh/ (OpenAPI)
  - Frontend files: `src/core/infrastructure/http/axiosInstance.ts` (calls `/token/refresh/` in interceptor)
  - Status: implemented
  - Notes: refresh flow wired in axios instance.

- POST /users/login/ and /users/register/ and /users/verify-2fa/ and /users/profile/ (OpenAPI)
  - Frontend files: `src/apps/auth/infrastructure/repositories/AuthRepository.ts` (uses `/users/login/`, `/users/password-reset/`, `/users/me/`, `/users/2fa/toggle/`, `/users/verify-otp/`, etc.)
  - Status: partial / mismatch
  - Notes: frontend implements many user endpoints but with slightly different paths (`/users/me/` vs OpenAPI `/users/profile/`, `/users/verify-otp/` vs `/users/verify-2fa/`). Action: reconcile paths or update OpenAPI / backend to provide compatible endpoints.

---

## 2) Empresas / Procesos (medium priority)

- GET/POST /companies/companies/ and GET/PUT/DELETE /companies/companies/{id}/ (OpenAPI)
  - Frontend files: `src/apps/administracion/presentation/components/AreasEmpresa.tsx`, `InformacionEmpresa.tsx`, `Procesos.tsx` and many `src/apps/*/infrastructure/repositories/*` that call `/companies/companies/` and related endpoints
  - Status: implemented

- GET /companies/processes/, /companies/process_types/, /companies/departments/, /companies/headquarters/ etc.
  - Frontend files: `src/apps/administracion/presentation/components/Procesos.tsx`, `SedesEmpresa.tsx`, `TiposProceso.tsx`, `src/apps/procesos/infrastructure/repositories/ProcessRepository.ts`
  - Status: implemented

---

## 3) Gestión de Proveedores / Facturas (high priority)

- GET/POST /gestionProveedores/facturas/ (OpenAPI)
  - Frontend files: many components and repositories use `/gestionProveedores/factura/` (singular) such as `src/apps/proveedores/infrastructure/repositories/FacturaRepository.ts`, `src/apps/proveedores/presentation/pages/FacturasPage.tsx`, `CrearFacturaModal.tsx`, `EditarFacturaModal.tsx`
  - Status: partial / mismatch
  - Notes: OpenAPI uses `/facturas/` plural while frontend uses `/factura/` singular for list/create/get/update/delete. Confirm backend supports the singular path (it may be a different implementation). Action: align paths or add redirect/adapter.

- Stage-specific endpoints: `/gestionProveedores/etapa1-gestionar-fe/`, `/gestionProveedores/etapa2-pendiente-revision/`, ... (OpenAPI)
  - Frontend files: no direct references found in `src/` (grep returned no matches for etapa* endpoints)
  - Status: missing
  - Action: implement clients or adapt frontend to use existing list filters (`etapa` query param) if backend exposes them via `/gestionProveedores/facturas/?etapa=...`.

- Related endpoints used by frontend and implemented:
  - `/gestionProveedores/centro_operaciones/` -> `src/apps/proveedores/infrastructure/repositories/CentroOperacionesRepository.ts` (implemented)
  - `/gestionProveedores/estado_facturas/` -> `EstadoFacturaRepository.ts` (implemented)
  - `/gestionProveedores/causales_devolucion/` -> `CausalDevolucionRepository.ts` (implemented)
  - `/gestionProveedores/facturas_detalles/` -> `FacturaDetalleRepository.ts` (implemented)
  - `/gestionProveedores/factura/{id}/download/` and `/preview/` -> used in `FacturaRepository.ts` (frontend expects these endpoints though they are not listed in OpenAPI). Status: potential backend mismatch — verify backend provides them.

---

## 4) Terceros (medium priority)

- GET/POST /terceros/terceros/ and lookup endpoints `/terceros/paises/`, `/terceros/departamentos/`, `/terceros/municipios/` (OpenAPI)
  - Frontend files: `src/apps/proveedores/infrastructure/repositories/TerceroRepository.ts` (implements getAll, getById, create, update, delete, getPaises, getDepartamentos, getMunicipios)
  - Status: implemented

---

## 5) Indicadores / Resultados (medium priority)

- GET/POST /indicators/indicators/ (OpenAPI)
  - Frontend files: `src/apps/indicadores/infrastructure/services/IndicadoresApiService.ts` (calls `/indicators/indicators/` via baseUrl + `/indicators/`)
  - Status: implemented

- GET/POST /indicators/results/ (OpenAPI)
  - Frontend files: `src/apps/indicadores/infrastructure/services/ResultsApiService.ts` (calls `/indicators/results/` and `/indicators/results/{id}/`)
  - Status: implemented (but frontend normalizes response shapes; see notes below)
  - Notes: Results service contains defensive code to handle either a flat array or paginated {results: []} response — verify backend response shape and simplify once agreed.

---

## Observations & Action Items (short)

1. Paths mismatch: there are several plural/singular mismatches and slightly different user endpoints. We must reconcile backend OpenAPI vs frontend expectations. Options:
   - Adjust frontend to use exact OpenAPI paths (recommended for long-term alignment).
   - Add adapter layer in frontend to map legacy paths to OpenAPI (short-term).

2. Missing endpoints on frontend to implement: stage-specific invoice endpoints (`etapa*`) — evaluate if backend supports filtering via query param `etapa` on `/gestionProveedores/facturas/` (OpenAPI includes `etapa` query param on `/gestionProveedores/facturas/` GET). Frontend currently queries singular `/factura/` without that query parameter in many places; implement list with query params or update to use `/facturas/`.

3. User endpoints: frontend uses `/users/me/` and `/users/verify-otp/` etc. Verify backend provides those endpoints or add mappings in OpenAPI.

4. Extra endpoints used by frontend but not present in OpenAPI: `/gestionProveedores/factura/{id}/download/` and `/preview/`. Confirm backend support or implement endpoints in backend.

---

## Next steps (I will proceed with these unless you tell me otherwise)

1. Produce a prioritized implementation plan for endpoints missing or mismatched. (Will do next: auth adjustments + factura stage mapping + verify download/preview endpoints.)
2. Start implementing missing API clients or adaptors in the frontend (create Axios wrappers and TypeScript types). I'll create small PR-like changes incrementally and run build/lint.

---

If you want, I can now:
- (A) Start by implementing the missing stage-filtered invoices client and update `FacturasPage` to use it.
- (B) First reconcile auth endpoints (`/users/profile/` vs `/users/me/`, `/users/verify-2fa/` vs `/users/verify-otp/`) so the login/2FA flow matches OpenAPI.

Tell me which of (A) or (B) you prefer to do first (I recommend (B) — fix auth flow first). 

---

## Detailed mapping & quick estimates (by priority you provided)

Note: estimates are rough (hours) and assume no backend changes. If backend changes required, add +50%.

Priority: Proveedores / Facturas (alta)
- Files confirmed calling invoice endpoints:
  - `src/apps/proveedores/infrastructure/repositories/FacturaRepository.ts` (getAll, create, update (patch), delete, download, preview)
  - `src/apps/proveedores/infrastructure/repositories/FacturaDetalleRepository.ts` (facturas_detalles endpoints)
  - `src/apps/proveedores/presentation/components/CrearFacturaModal.tsx`, `EditarFacturaModal.tsx`, `TablaFacturas.tsx`, `FacturaRow.tsx`, `FacturasPage.tsx`, `VerRegistroFacturaModal.tsx`
- OpenAPI vs frontend:
  - OpenAPI: `/gestionProveedores/facturas/` (plural) with query param `etapa` for filtering.
  - Frontend: many calls use `/gestionProveedores/factura/` (singular) and custom endpoints (`download`, `preview`).
- Actions & estimate:
  1. Verify backend supports both plural and singular endpoints or provide redirect. (0.5h)
  2. Implement a small adapter in frontend `src/apps/proveedores/infrastructure/repositories/FacturaRepository.ts` to call `/gestionProveedores/facturas/` with query params for etapa when needed, leaving existing API intact (non-breaking). (1.5h)
  3. Add typed wrappers for download/preview and ensure correct responseType blob handling (already partially implemented). (1h)
  4. Update `useFacturaCRUD` and `FacturasPage` to expose filtering by etapa and integrate with stage endpoints or with `?etapa=` filter. (2h)
  - Total estimate: ~5h

Priority: Terceros (media-alta)
- Files:
  - `src/apps/proveedores/infrastructure/repositories/TerceroRepository.ts` (getAll, getById, create, update, delete, getPaises, getDepartamentos, getMunicipios)
  - Presentation: `TercerosPage.tsx`, `TerceroForm.tsx`, `TerceroTable.tsx`, `TerceroView.tsx`
- Actions & estimate:
  1. Confirm endpoints match OpenAPI (`/terceros/terceros/` vs baseUrl `/terceros/` used in repo). (0.5h)
  2. Add missing validation handling to show server errors in forms (improve UX). (1h)
  - Total estimate: ~1.5h

Priority: Indicadores y Resultados (media)
- Files:
  - `src/apps/indicadores/infrastructure/services/IndicadoresApiService.ts`
  - `src/apps/indicadores/infrastructure/services/ResultsApiService.ts`
  - Hooks/pages: `src/apps/indicadores/presentation/hooks/useResultsData.ts`, `DashboardPage.tsx`, `ResultadosPage.tsx`, `IndicadoresPage.tsx`
- Actions & estimate:
  1. Reconcile response shape for results: backend returns paginated object (`PaginatedResultList`) — update `ResultsApiService` to always return normalized {results, count, next, previous} shape and update hooks/pages accordingly. (2h)
  2. Ensure create/update/delete flows use the OpenAPI paths (`/indicators/results/` and `/indicators/indicators/`). (1h)
  - Total estimate: ~3h

Priority: Empresas y Procesos (media-baja)
- Files already implemented: many components in `src/apps/administracion` and `src/apps/procesos` call `/companies/*` endpoints.
- Actions & estimate:
  1. Quick audit to ensure all list endpoints use pagination params correctly and error handling is consistent (1.5h)
  2. Minor fixes as discovered (0.5-1h)
  - Total estimate: ~2.5h (audit + fixes)

---

I'll proceed with the work in this order (per your priorities):
1. Proveedores / Facturas (adapter for plural endpoint, filter by etapa, confirm download/preview) — start now.
2. Terceros adjustments and UX errors.
3. Indicadores/Resultados normalization.
4. Final audit for Empresas/Procesos.

I'll open a small PR-like set of changes focusing first on `FacturaRepository` and `useFacturaCRUD` to add compatibility with `/gestionProveedores/facturas/` and `?etapa=` filtering, then run a TypeScript build. If that sounds good I will implement step 1 now.

