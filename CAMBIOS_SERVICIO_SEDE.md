# Ajustes al Modelo ServicioSede - Sincronización con Backend

**Fecha**: Marzo 11, 2026  
**Objetivo**: Sincronizar completamente el modelo `ServicioSede` del frontend con el modelo Django del backend

---

## 📋 Resumen de Cambios

### 1. **Actualización de Tipos - ServicioSede.ts**

**Archivo**: `src/apps/habilitacion/domain/entities/ServicioSede.ts`

**Cambios realizados**:
- ✅ Redefinidos los tipos `ModalidadServicio`, `ComplejidadServicio`, `EstadoHabilitacionServicio` directamente en el archivo
- ✅ Actualizado `ServicioSede` interface con exactamente los campos que devuelve el backend:
  - `id`: number
  - `prestador`: DatosPrestador (FK)
  - `codigo_servicio`: string
  - `nombre_servicio`: string
  - `descripcion`: string | null
  - `modalidad`: ModalidadServicio
  - `complejidad`: ComplejidadServicio
  - `estado_habilitacion`: EstadoHabilitacionServicio
  - `fecha_habilitacion`: string | null (ISO date)
  - `fecha_vencimiento`: string | null (ISO date)
  - `fecha_creacion`: string (ISO datetime)
  - `fecha_actualizacion`: string (ISO datetime)

- ✅ Actualizado `ServicioSedeCreate` DTO:
  - `prestador_id`: number (requerido)
  - Resto de campos opcionales excepto código y nombre

- ✅ Actualizado `ServicioSedeUpdate` DTO para actualizaciones parciales

- ✅ Agregada interfaz `ServicioSedeListResponse` para respuestas paginadas

**Valores válidos por campo**:
- **Modalidad**: `'INTRAMURAL' | 'AMBULATORIA' | 'TELEMEDICINA' | 'URGENCIAS' | 'AMBULANCIA'`
- **Complejidad**: `'BAJA' | 'MEDIA' | 'ALTA'`
- **Estado**: `'HABILITADO' | 'EN_PROCESO' | 'SUSPENDIDO' | 'NO_HABILITADO' | 'CANCELADO'`

---

### 2. **Verificación de Constantes - types/index.ts**

**Archivo**: `src/apps/habilitacion/domain/types/index.ts`

**Estado**: ✅ CORRECTO - Las constantes ya están alineadas con el backend:

```typescript
// Modalidades - Correctas
export const MODALIDADES_SERVICIO = [
  { value: 'INTRAMURAL', label: 'Intramural' },
  { value: 'AMBULATORIA', label: 'Ambulatoria' },
  { value: 'TELEMEDICINA', label: 'Telemedicina' },
  { value: 'URGENCIAS', label: 'Urgencias' },
  { value: 'AMBULANCIA', label: 'Ambulancia' },
];

// Complejidades - Correctas
export const COMPLEJIDADES_SERVICIO = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
];

// Estados de Servicios - Correctos
export const ESTADOS_HABILITACION_SERVICIO = [
  { value: 'HABILITADO', label: 'Habilitado' },
  { value: 'EN_PROCESO', label: 'En Proceso' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
  { value: 'NO_HABILITADO', label: 'No Habilitado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];
```

---

### 3. **Actualización del Repositorio - ServicioSedeRepository.ts**

**Archivo**: `src/apps/habilitacion/infrastructure/repositories/ServicioSedeRepository.ts`

**Cambios realizados**:
- ✅ Agregados typed responses genéricos (`<ServicioSedeListResponse>`)
- ✅ Actualizado método `getByHeadquarters()` → ahora es legado
- ✅ Agregado nuevo método `getByPrestador(prestadorId: number)` para obtener servicios por prestador
- ✅ Todos los métodos ahora tienen documentación JSDoc completa

**Métodos disponibles**:
```typescript
- getAll(filters?: Record<string, any>) → ServicioSede[]
- getById(id: number) → ServicioSede
- create(data: ServicioSedeCreate) → ServicioSede
- update(id: number, data: ServicioSedeUpdate) → ServicioSede
- delete(id: number) → void
- getByPrestador(prestadorId: number) → ServicioSede[]  // NEW
- getByHeadquarters(headquartersId: number) → ServicioSede[]  // LEGACY
- getProximosAVencer(dias?: number) → ServicioSede[]
- getCumplimientos(id: number) → Cumplimiento[]
- getPorComplejidad(complejidad: string) → ServicioSede[]
```

**Endpoints invocados**:
- `GET /api/habilitacion/servicios/` - Listar con filtros
- `GET /api/habilitacion/servicios/{id}/` - Detalle
- `POST /api/habilitacion/servicios/` - Crear
- `PATCH /api/habilitacion/servicios/{id}/` - Actualizar
- `DELETE /api/habilitacion/servicios/{id}/` - Eliminar
- `GET /api/habilitacion/servicios/proximos_a_vencer/` - Próximos a vencer
- `GET /api/habilitacion/servicios/por_complejidad/` - Por complejidad
- `GET /api/habilitacion/servicios/{id}/cumplimientos/` - Cumplimientos

---

### 4. **Actualización del Servicio - ServicioSedeService.ts**

**Archivo**: `src/apps/habilitacion/application/services/ServicioSedeService.ts`

**Cambios realizados**:
- ✅ Reestructurado con secciones claramente definidas (CRUD, Queries, Utilities)
- ✅ Agregado método `getServiciosByPrestador()` como equivalente a `getByHeadquarters()`
- ✅ Agregados métodos utilitarios de color: `getEstadoHabilitacionColor()`, `getModalidadColor()`
- ✅ Mejorado método `diasParaVencimiento()` con ajuste de horas para comparación fiable
- ✅ Agregado método `validarDatos()` para validación de entrada
- ✅ Toda la clase tiene documentación JSDoc completa

**Métodos públicos**:
```typescript
// CRUD
- getServicios(filters?)
- getServicio(id)
- createServicio(data)
- updateServicio(id, data)
- deleteServicio(id)

// Specialized Queries
- getServiciosByPrestador(prestadorId)
- getProximosAVencer(dias?)
- getCumplimientos(id)
- getPorComplejidad(complejidad)

// Utilities
- diasParaVencimiento(fechaVencimiento?): number | null
- estaProximoAVencer(fechaVencimiento?, dias?): boolean
- estaVencido(fechaVencimiento?): boolean
- getComplejidadColor(complejidad): string
- getEstadoHabilitacionColor(estado): string
- getModalidadColor(modalidad): string
- validarDatos(data): { valido: boolean; errores: string[] }
```

---

### 5. **Actualización del Hook - useServicioSede.ts**

**Archivo**: `src/apps/habilitacion/presentation/hooks/useServicioSede.ts`

**Cambios realizados**:
- ✅ Reestructurado con secciones claramente definidas (Queries, Mutations, Utilities)
- ✅ Agregado mejor manejo de errores con `setError(null)` after success
- ✅ Todos los callbacks ahora son explícitamente tipados
- ✅ Agregado retorno de datos en las funciones query
- ✅ Documentación JSDoc para cada callback

**Hook expone**:
```typescript
{
  // State
  servicios, loading, error,
  
  // Queries
  fetchServicios,
  getServiciosByPrestador,  // NEW
  getServiciosByHeadquarters,  // LEGACY
  getProximosAVencer,
  getCumplimientos,
  getPorComplejidad,
  
  // Mutations
  create, update, delete,
  
  // Utilities
  diasParaVencimiento,
  estaProximoAVencer,
  estaVencido,
  getComplejidadColor,
  getEstadoHabilitacionColor,  // NEW
  getModalidadColor,  // NEW
  validarDatos,  // NEW
  
  // Service
  service
}
```

---

## 🔄 Flujo de Sincronización Backend ↔ Frontend

```
Backend (Django)
├── DatosPrestador (OneToOne con Headquarters)
└── ServicioSede (ForeignKey a DatosPrestador)
    ├── codigo_servicio
    ├── nombre_servicio
    ├── modalidad (INTRAMURAL, AMBULATORIA, TELEMEDICINA, URGENCIAS, AMBULANCIA)
    ├── complejidad (BAJA, MEDIA, ALTA)
    ├── estado_habilitacion (HABILITADO, EN_PROCESO, SUSPENDIDO, NO_HABILITADO, CANCELADO)
    └── fechas (habilitacion, vencimiento, creacion, actualizacion)

                    ↓↓↓ HTTP API ↓↓↓

Frontend (React/TypeScript)
├── Types: ServicioSede, ServicioSedeCreate, ServicioSedeUpdate
├── Constants: MODALIDADES_SERVICIO, COMPLEJIDADES_SERVICIO, ESTADOS_HABILITACION_SERVICIO
├── Service: ServicioSedeService (lógica de negocio)
├── Repository: ServicioSedeRepository (HTTP calls)
├── Hook: useServicioSede (React state management)
└── Components: ServicioFormModal, ServicioCard
```

---

## ✅ Checklist de Verificación

### Tipos y Constantes
- [x] `ServicioSede.ts` contiene tipos correctamente definidos
- [x] `types/index.ts` tiene constantes sincronizadas
- [x] Modalidades: 5 valores soportados
- [x] Complejidades: 3 valores soportados
- [x] Estados: 5 valores soportados
- [x] Todos los tipos son type-safe

### Repositorio
- [x] Todos los endpoints mapeados correctamente
- [x] Request/response types bien tipados
- [x] Métodos legacy preserve backwards compatibility
- [x] Manejo de paginación (results array)

### Servicio
- [x] Métodos CRUD delegados al repositorio
- [x] Métodos especializados implementados
- [x] Utilidades de cálculo y color
- [x] Validación de datos

### Hook
- [x] State management completo
- [x] Manejo de loading y error states
- [x] Mutations actualizan estado local
- [x] Utilities disponibles y documentadas

### Componentes (Existentes)
- [x] `ServicioFormModal.tsx` - Usa tipos correctos ✓
- [x] `ServicioCard.tsx` - Muestra datos correctamente ✓
- [x] `PrestadorDetailPage.tsx` - Carga servicios por prestador ✓

---

## 🚀 Cómo Usar

### Crear un Servicio
```typescript
const { create } = useServicioSede();

await create({
  prestador_id: 42,
  codigo_servicio: "001-001",
  nombre_servicio: "Hospitalización Pediátrica",
  descripcion: "Servicio de hospitalización para menores",
  modalidad: 'INTRAMURAL',
  complejidad: 'ALTA',
  estado_habilitacion: 'EN_PROCESO',
  fecha_habilitacion: '2024-01-15',
  fecha_vencimiento: '2025-01-15',
});
```

### Filtrar Servicios
```typescript
const { fetchServicios } = useServicioSede();

// Por prestador
await fetchServicios({ prestador: 42, estado_habilitacion: 'HABILITADO' });

// Por complejidad
const { getPorComplejidad } = useServicioSede();
await getPorComplejidad('ALTA');
```

### Verificar Vencimiento
```typescript
const { diasParaVencimiento, estaProximoAVencer, estaVencido } = useServicioSede();

const dias = diasParaVencimiento('2024-12-31');
const proximo = estaProximoAVencer('2024-12-31', 90);
const vencido = estaVencido('2024-12-31');
```

---

## 📝 Notas Importantes

1. **Prestador es obligatorio**: El campo `prestador_id` es requerido al crear un servicio
2. **Estados diferenciados**: `DatosPrestador` usa HABILITADA/EN_PROCESO/etc., pero `ServicioSede` usa HABILITADO/EN_PROCESO/etc.
3. **Método legacy**: `getByHeadquarters()` se mantiene por compatibilidad, pero usar `getByPrestador()`
4. **Fechas en ISO**: Todos los campos de fecha deben ser strings en formato ISO (YYYY-MM-DD)
5. **Cálculo de vencimiento**: Ajusta las horas a las 00:00:00 para comparación consistente

---

## 🔍 Próximos Pasos (Recomendados)

1. **Testing**: Crear tests unitarios para `ServicioSedeService.ts`
2. **Integration Tests**: Verificar flujos completos con la API real
3. **UI Polish**: Revisar componentes para optimización UX
4. **Documentation**: Crear guía de uso para desarrolladores

---

**Status**: ✅ COMPLETADO  
**Última revisión**: Marzo 11, 2026
