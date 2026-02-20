# Plan de Trabajo - Alineación Frontend Habilitación con API Backend

**Fecha**: 2026-02-20  
**Basado en**: documentos_v2.md v3.0  
**Archivos auditados**: 79 archivos en `src/apps/habilitacion/`

---

## Resumen Ejecutivo

Tras auditar los 79 archivos del módulo de habilitación contra la documentación de API (`documentos_v2.md`), se identificaron **42 ajustes específicos** organizados en **7 fases**. Los módulos de PlanMejora y Hallazgo (`/api/mejoras/`) están ✅ correctamente alineados. Los principales problemas están en las entidades originales de habilitación (`/api/habilitacion/`): DatosPrestador, ServicioSede, Autoevaluacion y Cumplimiento.

---

## Estado Actual por Entidad

| Entidad | Entidad ✓ | Repo ✓ | Service ✓ | Hook ✓ | Forms ✓ | Paginación ✓ |
|---------|-----------|--------|-----------|--------|---------|--------------|
| DatosPrestador | ❌ | ❌ | ⚠️ | ⚠️ | ❌ | ❌ |
| ServicioSede | ❌ | ❌ | ⚠️ | ⚠️ | ❌ | ❌ |
| Autoevaluacion | ❌ | ✅ | ⚠️ | ⚠️ | ✅ | ❌ |
| Cumplimiento | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Criterio | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ❌ |
| PlanMejora | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Hallazgo | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |

---

## FASE 1: Alineación de Entidades (Domain Layer)

**Archivos**: 5 archivos en `domain/entities/`  
**Riesgo**: Medio (cambios de tipos pueden causar errores en cascada)  
**Estimación**: 45 min

### 1.1 DatosPrestador.ts
- [ ] **Agregar campos de respuesta API faltantes** al interface `DatosPrestador`:
  - `company_name?: string` (campo plano del API, no objeto anidado)
  - `estado_display?: string` (texto legible del estado)
  - `proxima_vencer?: boolean` (propiedad computada)
  - `dias_vencimiento?: number` (propiedad computada)
  - `headquarters_id?: number` (FK devuelta en respuesta)
  - `usuario_responsable?: number` (FK del user)
- [ ] **Corregir `DatosPrestadorCreate`**: Reemplazar `company_id` y `sede_id` por `headquarters_id` (único FK requerido según API)
- [ ] **Hacer `estado_habilitacion` opcional** en Create (API dice default: EN_PROCESO)
- [ ] **Mantener objetos anidados** `company`, `user`, `sede` como opcionales (pueden venir en detalle) pero agregar campos planos también

### 1.2 ServicioSede.ts
- [ ] **Corregir `ServicioSedeCreate`**: Renombrar `headquarters_id` a `sede_id` (API espera `"sede_id": 1`)
- [ ] **Agregar campos de respuesta API**:
  - `estado_display?: string`
- [ ] **Hacer `modalidad` y `complejidad` opcionales** en Create si no son requeridos (API docs dicen Sí pero la UI los muestra como opcionales)

### 1.3 Autoevaluacion.ts
- [ ] **Agregar campos de respuesta API listado**:
  - `prestador_codigo?: string`
  - `estado_display?: string`
  - `porcentaje_cumplimiento?: number`
- [ ] **Agregar campos de respuesta API detalle**:
  - `datos_prestador_detail?: { id: number; codigo_reps: string; company_name: string }`
  - `vigente?: boolean`
  - `total_cumplimientos?: number`
  - `planes_mejora_count?: number`
  - `hallazgos_count?: number`
  - `mejoras_resumen?: MejorasResumen` (nuevo tipo)
  - `cumplimientos_data?: Cumplimiento[]`
- [ ] **Crear tipo `MejorasResumen`**:
  ```typescript
  interface MejorasResumen {
    total_planes: number;
    planes_pendientes: number;
    planes_en_curso: number;
    planes_completados: number;
    total_hallazgos: number;
    hallazgos_abiertos: number;
    hallazgos_cerrados: number;
  }
  ```

### 1.4 Cumplimiento.ts
- [ ] **Agregar campos de respuesta API listado**:
  - `criterio_codigo?: string`
  - `criterio_nombre?: string`
  - `servicio_nombre?: string`
  - `cumple_display?: string`
  - `tiene_plan_mejora?: boolean`
  - `planes_mejora_count?: number`
  - `hallazgos_count?: number`

### 1.5 entities/index.ts
- [ ] **Agregar export** de `PaginatedResponse`:
  ```typescript
  export * from './PaginatedResponse';
  ```

---

## FASE 2: Alineación de Repositorios (Infrastructure Layer)

**Archivos**: 4 archivos en `infrastructure/repositories/`  
**Riesgo**: Medio  
**Estimación**: 40 min

### 2.1 DatosPrestadorRepository.ts
- [ ] **Agregar endpoint faltante** `getServicios(id)`:
  ```typescript
  async getServicios(id: number): Promise<ServicioSede[]> {
    const response = await axiosInstance.get(`/habilitacion/prestadores/${id}/servicios/`);
    return response.data.results || response.data;
  }
  ```
- [ ] **Agregar endpoint faltante** `getAutoevaluaciones(id)`:
  ```typescript
  async getAutoevaluaciones(id: number): Promise<Autoevaluacion[]> {
    const response = await axiosInstance.get(`/habilitacion/prestadores/${id}/autoevaluaciones/`);
    return response.data.results || response.data;
  }
  ```
- [ ] **Agregar manejo de paginación** en `getAll()`:
  ```typescript
  return response.data.results || response.data;
  ```
- [ ] **Agregar paginación** en `getProximosAVencer()` y `getVencidos()`

### 2.2 ServicioSedeRepository.ts
- [ ] **Agregar endpoint faltante** `getCumplimientos(id)`:
  ```typescript
  async getCumplimientos(id: number): Promise<Cumplimiento[]> {
    const response = await axiosInstance.get(`/habilitacion/servicios/${id}/cumplimientos/`);
    return response.data.results || response.data;
  }
  ```
- [ ] **Agregar endpoint faltante** `getPorComplejidad(complejidad)`:
  ```typescript
  async getPorComplejidad(complejidad: string): Promise<ServicioSede[]> {
    const response = await axiosInstance.get('/habilitacion/servicios/por_complejidad/', {
      params: { complejidad }
    });
    return response.data.results || response.data;
  }
  ```
- [ ] **Agregar manejo de paginación** en `getAll()`, `getByHeadquarters()`, `getProximosAVencer()`

### 2.3 AutoevaluacionRepository.ts
- [ ] **Agregar manejo de paginación** en `getAll()` y `getPorCompletar()`

### 2.4 CumplimientoRepository.ts
- [ ] **Agregar manejo de paginación** en `getAll()`, `getSinCumplir()`, `getConPlanMejora()`, `getMejorasVencidas()`

### 2.5 domain/repositories/ (Interfaces)
- [ ] **Agregar** `getServicios(id)` y `getAutoevaluaciones(id)` a `IDatosPrestadorRepository`
- [ ] **Agregar** `getCumplimientos(id)` y `getPorComplejidad(complejidad)` a `IServicioSedeRepository`

---

## FASE 3: Actualización de Servicios (Application Layer)

**Archivos**: 2 archivos en `application/services/`  
**Riesgo**: Bajo  
**Estimación**: 20 min

### 3.1 DatosPrestadorService.ts
- [ ] **Agregar método** `getServicios(id)` delegando al repository
- [ ] **Agregar método** `getAutoevaluaciones(id)` delegando al repository

### 3.2 ServicioSedeService.ts
- [ ] **Agregar método** `getCumplimientos(id)` delegando al repository
- [ ] **Agregar método** `getPorComplejidad(complejidad)` delegando al repository

---

## FASE 4: Actualización de Hooks (Presentation Layer)

**Archivos**: 5 archivos en `presentation/hooks/`  
**Riesgo**: Bajo  
**Estimación**: 30 min

### 4.1 useDatosPrestador.ts
- [ ] **Agregar** `getVencidos()` como función expuesta (no solo via service)
- [ ] **Agregar** `getServicios(id)` como función expuesta
- [ ] **Agregar** `getAutoevaluaciones(id)` como función expuesta

### 4.2 useServicioSede.ts
- [ ] **Agregar** `getServiciosByHeadquarters()` como función expuesta
- [ ] **Agregar** `getCumplimientos(id)` como función expuesta
- [ ] **Agregar** `getPorComplejidad(complejidad)` como función expuesta

### 4.3 useAutoevaluacion.ts
- [ ] **Agregar** `getAutoevaluacionesPorCompletar()` como función expuesta

### 4.4 usePlanMejora.ts
- [ ] **Agregar** `getPlanDeMejora(id)` (getById) como función expuesta
- [ ] **Exponer** objeto `service` para acceso a helpers

### 4.5 useHallazgo.ts
- [ ] **Agregar** `getHallazgo(id)` (getById) como función expuesta
- [ ] **Exponer** objeto `service` para acceso a helpers (getSeveridadColor, getTipoColor)

---

## FASE 5: Corrección de Form Modals (Presentation Components)

**Archivos**: 2 archivos en `presentation/components/`  
**Riesgo**: Alto (afecta CRUD directamente)  
**Estimación**: 25 min

### 5.1 PrestadorFormModal.tsx
- [ ] **Corregir FK en formulario**: Cambiar de usar `company_id` + `sede_id` a `headquarters_id`
- [ ] **Cambiar tipo de estado** del form de `Partial<DatosPrestador>` a `Partial<DatosPrestadorCreate>` 
- [ ] **Eliminar cast `as any`** en update - usar tipado correcto
- [ ] **Usar hook** `useDatosPrestador()` en lugar de instanciar service directamente

### 5.2 ServicioFormModal.tsx
- [ ] **Corregir FK en formulario**: Cambiar de `headquarters_id` a `sede_id` (match API)
- [ ] **Verificar** que el prop `headquartersId` se mapee correctamente a `sede_id` en el formData

---

## FASE 6: Correcciones Menores y Limpieza

**Archivos**: 4+ archivos  
**Riesgo**: Bajo  
**Estimación**: 20 min

### 6.1 PrestadorCard.tsx
- [ ] **Corregir typo** en prop name: `numeroPolicza` → `numeroPoliza`

### 6.2 pages/index.ts
- [ ] **Agregar exports** de todas las páginas (Enhanced, Detail, Editor, Panel, etc.)

### 6.3 HabilitacionPageEnhanced.tsx
- [ ] **Evaluar**: Está importada pero NO usada en routes.tsx. Decidir si eliminar o agregar ruta

### 6.4 types/index.ts + PlanMejora.ts
- [ ] **Resolver duplicación** de `OrigenTipo` (definida en PlanMejora.ts) y `OrigenTipoValue` (en types/index.ts)

### 6.5 CriterioEvaluacion (Evaluar)
- [ ] **Investigar** si `/habilitacion/criterios-evaluacion/` existe en el backend
- [ ] Si NO existe: Marcar `CriterioEvaluacionRepository` como deprecado o remover
- [ ] Si SÍ existe: Documentar endpoint y mantener

---

## FASE 7: Consistencia de Paginación Global

**Archivos**: Todos los repositorios de habilitacion  
**Riesgo**: Medio (puede romper pantallas que esperan array directo)  
**Estimación**: 30 min

### Problema
La API de habilitación devuelve respuestas paginadas (`{count, next, previous, results}`) pero los repos de habilitación retornan `response.data` directamente, asumiendo array. Los repos de mejoras ya manejan esto correctamente con `response.data.results || response.data`.

### Solución
- [ ] **Crear helper** `extractResults<T>(data)` en infraestructura compartida
- [ ] **Aplicar** en todos los `getAll()`, `getProximosAVencer()`, `getVencidos()`, etc. de los 5 repos de habilitación
- [ ] **Verificar** que los hooks y pages funcionen con arrays (sin breaking changes)

---

## Orden de Ejecución

```
FASE 1 (Entidades) → FASE 2 (Repos) → FASE 3 (Services) → FASE 4 (Hooks) → FASE 5 (Forms) → FASE 6 (Limpieza) → FASE 7 (Paginación)
```

**Tiempo total estimado**: ~3.5 horas  
**Compilación TypeScript**: Verificar con `npx tsc --noEmit` después de cada fase

---

## Archivos NO Modificados (ya alineados ✅)

| Archivo | Estado |
|---------|--------|
| domain/entities/PlanMejora.ts | ✅ Completo |
| domain/entities/Hallazgo.ts | ✅ Completo |
| infrastructure/repositories/PlanMejoraRepository.ts | ✅ Completo |
| infrastructure/repositories/HallazgoRepository.ts | ✅ Completo |
| application/services/PlanMejoraService.ts | ✅ Completo |
| application/services/HallazgoService.ts | ✅ Completo |
| application/services/CumplimientoService.ts | ✅ Completo |
| presentation/components/PlanMejoraFormModal.tsx | ✅ Completo |
| presentation/components/HallazgoFormModal.tsx | ✅ Completo |
| presentation/components/AutoevaluacionFormModal.tsx | ✅ Completo |
| presentation/components/CumplimientoFormModal.tsx | ✅ Completo |
| presentation/components/CriterioFormModal.tsx | ✅ Completo |
| presentation/components/RenovacionWizard.tsx | ✅ Completo |
| presentation/components/DuplicarAutoevaluacionModal.tsx | ✅ Completo |
| presentation/components/ValidarAutoevaluacionModal.tsx | ✅ Completo |
| presentation/components/AlertasHabilitacionPanel.tsx | ✅ Completo |
| presentation/components/MejorasVencidasPanel.tsx | ✅ Completo |
| presentation/components/Breadcrumbs.tsx | ✅ Completo |
| presentation/components/DataTable.tsx | ✅ Completo |
| presentation/components/VencimientoBadge.tsx | ✅ Completo |
| presentation/components/AccionesContextuales.tsx | ✅ Completo |
| presentation/pages/*.tsx (todas) | ✅ Completo (usan hooks correctos) |
| routes.tsx | ✅ Completo |
| presentation/utils/formatters.ts | ✅ Completo |
