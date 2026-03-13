# Análisis Comprehensive: Sync Backend ↔ Frontend

## 📋 ÍNDICE DE ANÁLISIS

### 1. DatosPrestador
### 2. ServicioSede  
### 3. Autoevaluacion
### 4. Cumplimiento
### 5. Criterio / Estandar

---

## 1️⃣ DatosPrestador

### 1.1 Backend Serializers

#### DatosPrestadorListSerializer Fields
```typescript
{
  id: number;
  codigo_reps: string;
  company_name: string;                          // ← COMPUTED from headquarters.company.name
  clase_prestador: string;
  estado_habilitacion: string;
  estado_display: string;                        // ← DISPLAY FIELD
  fecha_vencimiento_habilitacion: string|null;
  proxima_vencer: boolean;                       // ← COMPUTED: esta_proxima_a_vencer(90)
  dias_vencimiento: number|null;                 // ← COMPUTED: dias_para_vencimiento()
}
```

#### DatosPrestadorDetailSerializer Fields
```typescript
{
  // All List fields PLUS:
  headquarters_id: number;                       // WRITE_ONLY for creation
  company_detail: {
    id: number;
    name: string;
    nit: string|null;
  };
  headquarters_detail: {
    id: number;
    name: string;
    habilitationCode: string;
  };
  clase_prestador_display: string;               // ← DISPLAY FIELD
  nombre_prestador: string;
  sede_principal: boolean;
  fecha_inscripcion: string|null;
  fecha_renovacion: string|null;
  fecha_vencimiento_habilitacion: string|null;
  aseguradora_pep: string|null;
  numero_poliza: string|null;
  vigencia_poliza: string|null;
  autoevaluaciones_count: number;                // ← COMPUTED
  fecha_creacion: string;
  fecha_actualizacion: string;
  vencida: boolean;                              // ← COMPUTED: esta_vencida()
  proxima_vencer: boolean;                       // ← COMPUTED
  dias_vencimiento: number|null;                 // ← COMPUTED
}
```

### 1.2 Frontend Entity (DatosPrestador.ts)

```typescript
export interface DatosPrestador {
  id: number;
  codigo_reps: string;
  nombre_prestador?: string;
  company_name?: string;
  sede_principal?: boolean;
  company_detail?: CompanyDetail;
  headquarters_detail?: HeadquartersDetail;
  clase_prestador: ClasePrestador;
  clase_prestador_display?: string;
  estado_habilitacion: EstadoHabilitacionPrestador;
  estado_display?: string;
  fecha_inscripcion?: string;
  fecha_renovacion?: string;
  fecha_vencimiento_habilitacion?: string;
  dias_vencimiento?: number;
  proxima_vencer?: boolean;
  vencida?: boolean;
  aseguradora_pep?: string;
  numero_poliza?: string;
  vigencia_poliza?: string;
  autoevaluaciones_count?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  usuario_responsable?: number;  // ← MISMATCH: Backend no devuelve en list, solo en detail
}
```

### 1.3 Issues Found

| Issue | Backend | Frontend | Impact |
|-------|---------|----------|--------|
| ❌ Missing WRITE_ONLY | `headquarters_id` write_only | Entity no tiene field para write | CREATE será confuso |
| ❌ Type mismatch | `vencida: boolean` computed | Optional boolean | ✅ OK pero debería ser required en detail |
| ⚠️ Missing field | `usuario_responsable_detail` | solo ID in entity | Detail view no muestra usuario |
| ✅ OK | `dias_vencimiento` computed | Optional number | ✅ Correctamente typed |
| ⚠️ Missing | Test JSON sample | Not in entity type | Need sample response |

### 1.4 JSON Sample Responses

#### LIST Response
```json
[
  {
    "id": 1,
    "codigo_reps": "520010121300",
    "company_name": "Hospital San Rafael",
    "clase_prestador": "IPS",
    "estado_habilitacion": "HABILITADA",
    "estado_display": "Habilitada",
    "fecha_vencimiento_habilitacion": "2026-12-31",
    "proxima_vencer": true,
    "dias_vencimiento": 45
  }
]
```

#### DETAIL Response
```json
{
  "id": 1,
  "codigo_reps": "520010121300",
  "nombre_prestador": "Hospital San Rafael",
  "company_name": "Hospital San Rafael",
  "class_prestador": "IPS",
  "clase_prestador_display": "Institución Prestadora de Servicios",
  "estado_habilitacion": "HABILITADA",
  "estado_display": "Habilitada",
  "company_detail": {
    "id": 1,
    "name": "Hospital San Rafael S.A.",
    "nit": "800154321-0"
  },
  "headquarters_detail": {
    "id": 5,
    "name": "Sede Bogotá",
    "habilitationCode": "HQ001"
  },
  "sede_principal": true,
  "fecha_inscripcion": "2020-01-15",
  "fecha_renovacion": "2024-01-15",
  "fecha_vencimiento_habilitacion": "2026-12-31",
  "dias_vencimiento": 45,
  "proxima_vencer": true,
  "vencida": false,
  "aseguradora_pep": "AXA Colombia",
  "numero_poliza": "POL-2024-001",
  "vigencia_poliza": "2025-12-31",
  "autoevaluaciones_count": 3,
  "fecha_creacion": "2020-01-15T10:30:00Z",
  "fecha_actualizacion": "2024-06-01T14:45:00Z"
}
```

---

## 2️⃣ ServicioSede

### 2.1 Backend Serializers

#### ServicioSedeListSerializer Fields
```typescript
{
  id: number;
  codigo_servicio: string;
  nombre_servicio: string;
  prestador_codigo: string;                      // ← FROM prestador.codigo_reps
  prestador_headquarters: string;                // ← FROM prestador.headquarters.name
  modalidad: string;
  modalidad_display: string;                     // ← DISPLAY FIELD
  complejidad: string;
  complejidad_display: string;                   // ← DISPLAY FIELD
  estado_habilitacion: string;
  estado_display: string;                        // ← DISPLAY FIELD
  fecha_vencimiento: string|null;
  vencido: boolean;                              // ← COMPUTED: esta_vencido()
}
```

#### ServicioSedeDetailSerializer Fields
```typescript
{
  // All List fields PLUS:
  id: number;
  codigo_servicio: string;
  nombre_servicio: string;
  descripcion: string|null;
  prestador_id: number;                          // WRITE_ONLY
  prestador_detail: {
    id: number;
    codigo_reps: string;
    nombre_prestador: string;
    headquarters: string;
    estado_habilitacion: string;
  };
  modalidad: string;
  modalidad_display: string;
  complejidad: string;
  complejidad_display: string;
  estado_habilitacion: string;
  estado_display: string;
  fecha_habilitacion: string|null;
  fecha_vencimiento: string|null;
  vencido: boolean;                              // ← COMPUTED
  dias_vencimiento: number|null;                 // ← COMPUTED
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### 2.2 Frontend Entity (ServicioSede.ts)

```typescript
export interface ServicioSede {
  id: number;
  prestador_codigo?: string;
  prestador_detail?: PrestadorDetailReducido | DatosPrestador;
  prestador_id?: number;
  codigo_servicio: string;
  nombre_servicio: string;
  descripcion?: string | null;
  prestador_headquarters?: string;
  modalidad: ModalidadServicio;
  complejidad: ComplejidadServicio;
  estado_habilitacion: EstadoHabilitacionServicio;
  fecha_habilitacion?: string | null;
  fecha_vencimiento?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### 2.3 Issues Found

| Issue | Backend | Frontend | Impact |
|-------|---------|----------|--------|
| ❌ Missing computed | `modalidad_display` | Entity no tiene | UI must compute manually |
| ❌ Missing computed | `complejidad_display` | Entity no tiene | UI must compute manually  |
| ❌ Missing computed | `estado_display` | Entity no tiene | UI must compute manually |
| ❌ Missing computed | `vencido` | Entity no tiene | UI must compute: fecha_vencimiento < today |
| ❌ Missing computed | `dias_vencimiento` | Entity no tiene | UI must compute |
| ⚠️ Type mismatch | `PrestadorDetailReducido` | Could be full DatosPrestador | Type union is OK but confusing |

### 2.4 JSON Sample

```json
{
  "id": 5,
  "codigo_servicio": "MD00012",
  "nombre_servicio": "Medicina General",
  "descripcion": "Servicio de medicina general ambulatorio",
  "prestador_codigo": "520010121300",
  "prestador_headquarters": "Sede Bogotá",
  "modal idad": "AMBULATORIA",
  "modalidad_display": "Ambulatoria",
  "complejidad": "MEDIA",
  "complejidad_display": "Media",
  "estado_habilitacion": "HABILITADO",
  "estado_display": "Habilitado",
  "fecha_habilitacion": "2023-01-15",
  "fecha_vencimiento": "2026-01-15",
  "vencido": false,
  "dias_vencimiento": 320,
  "fecha_creacion": "2023-01-15T10:00:00Z",
  "fecha_actualizacion": "2024-06-01T10:00:00Z",
  "prestador_detail": {
    "id": 1,
    "codigo_reps": "520010121300",
    "nombre_prestador": "Hospital San Rafael",
    "headquarters": "Sede Bogotá",
    "estado_habilitacion": "Habilitada"
  }
}
```

---

## 3️⃣ Autoevaluacion

### 3.1 Backend Serializers

#### AutoevaluacionListSerializer Fields
```typescript
{
  id: number;
  numero_autoevaluacion: string;
  prestador_codigo: string;                      // ← FROM datos_prestador.codigo_reps
  periodo: number;
  version: number;
  estado: string;
  estado_display: string;                        // ← DISPLAY FIELD
  fecha_inicio: string;
  fecha_completacion: string|null;
  porcentaje_cumplimiento: number;               // ← COMPUTED: obj.porcentaje_cumplimiento()
}
```

#### AutoevaluacionDetailSerializer Fields
```typescript
{
  // All List fields PLUS:
  id: number;
  numero_autoevaluacion: string;
  datos_prestador_id: number;                    // WRITE_ONLY
  datos_prestador_detail: {
    id: number;
    nombre_prestador: string;
    codigo_reps: string;
    company_name: string;
  };
  periodo: number;
  version: number;
  estado: string;
  estado_display: string;
  fecha_inicio: string;
  fecha_completacion: string|null;
  fecha_vencimiento: string;
  vigente: boolean;                              // ← COMPUTED: esta_vigente()
  usuario_responsable_detail: {
    id: number;
    username: string;
    email: string;
  } | null;
  observaciones: string|null;
  porcentaje_cumplimiento: number;               // ← COMPUTED
  total_cumplimientos: number;                   // ← COMPUTED: count()
  cumplimientos_data: {                          // ← COMPUTED: breakdown by state
    total: number;
    cumple: number;
    no_cumple: number;
    parcialmente: number;
    no_aplica: number;
  };
  planes_mejora_count: number;                   // ← FROM app mejoras (FK)
  hallazgos_count: number;                       // ← FROM app mejoras (FK)
  mejoras_resumen: {                             // ← COMPUTED: complex aggregation
    total_planes: number;
    planes_pendientes: number;
    planes_en_curso: number;
    planes_completados: number;
    total_hallazgos: number;
    hallazgos_abiertos: number;
    hallazgos_cerrados: number;
  };
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### 3.2 Frontend Entity (Autoevaluacion.ts)

```typescript
export interface Autoevaluacion {
  id: number;
  numero_autoevaluacion: string;
  prestador_codigo?: string;
  datos_prestador?: { id: number; codigo_reps: string };
  datos_prestador_detail?: { id: number; codigo_reps: string; company_name: string };
  periodo: number;
  version: number;
  estado: EstadoAutoevaluacion;
  estado_display?: string;
  fecha_inicio: string;
  fecha_completacion?: string;
  fecha_vencimiento: string;
  porcentaje_cumplimiento?: number;
  vigente?: boolean;
  total_cumplimientos?: number;
  planes_mejora_count?: number;
  hallazgos_count?: number;
  cumplimientos_data?: Cumplimiento[];
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_responsable_detail?: {
    id: number;
    username: string;
    email: string;
  };
  user?: {
    id: number;
    username: string;
  };
  mejoras_resumen?: MejorasResumen;
}

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

### 3.3 Issues Found

| Issue | Backend | Frontend | Impact |
|-------|---------|----------|--------|
| ❌ MISMATCH | `cumplimientos_data` is object breakdown | Entity expects `Cumplimiento[]` array | Type mismatch! |
| ❌ Missing | `usuario_responsable` field | Entity has field | Backend doesn't return in list |
| ⚠️ OK | `mejoras_resumen` structure | Matches MejorasResumen | ✅ Good alignment |
| ✅ OK | `vigente` computed | Entity optional | ✅ Correct |
| ✅ OK | `porcentaje_cumplimiento` computed | Entity optional | ✅ Correct |

### 3.4 JSON Sample

```json
{
  "id": 10,
  "numero_autoevaluacion": "AUT-520010121300-2026",
  "datos_prestador_id": 1,
  "datos_prestador_detail": {
    "id": 1,
    "nombre_prestador": "Hospital San Rafael",
    "codigo_reps": "520010121300",
    "company_name": "Hospital San Rafael S.A."
  },
  "periodo": 2026,
  "version": 1,
  "estado": "EN_CURSO",
  "estado_display": "En Curso",
  "fecha_inicio": "2026-01-01",
  "fecha_completacion": null,
  "fecha_vencimiento": "2026-12-31",
  "vigente": true,
  "usuario_responsable_detail": {
    "id": 15,
    "username": "evaluador1",
    "email": "evaluador1@hospital.com"
  },
  "observaciones": "Evaluación del 2026",
  "porcentaje_cumplimiento": 78.5,
  "total_cumplimientos": 32,
  "cumplimientos_data": {
    "total": 32,
    "cumple": 18,
    "no_cumple": 8,
    "parcialmente": 5,
    "no_aplica": 1
  },
  "planes_mejora_count": 12,
  "hallazgos_count": 8,
  "mejoras_resumen": {
    "total_planes": 12,
    "planes_pendientes": 3,
    "planes_en_curso": 6,
    "planes_completados": 3,
    "total_hallazgos": 8,
    "hallazgos_abiertos": 5,
    "hallazgos_cerrados": 3
  },
  "fecha_creacion": "2026-01-01T10:00:00Z",
  "fecha_actualizacion": "2026-03-12T15:30:00Z"
}
```

---

## 4️⃣ Cumplimiento

### 4.1 Backend Serializers

#### CumplimientoListSerializer Fields
```typescript
{
  id: number;
  criterio_codigo: string;                       // ← FROM criterio.codigo
  criterio_nombre: string;                       // ← FROM criterio.nombre
  servicio_nombre: string;                       // ← FROM servicio_sede.nombre_servicio
  autoevaluacion_id: number;
  servicio_sede_id: number;
  criterio_id: number;
  cumple: string;
  cumple_display: string;                        // ← DISPLAY FIELD
  tiene_plan_mejora: boolean;                    // ← COMPUTED/METHOD
  planes_mejora_count: number;                   // ← FROM app mejoras
  hallazgos_count: number;                       // ← FROM app mejoras (query)
  fecha_compromiso: string|null;
}
```

#### CumplimientoDetailSerializer Fields
```typescript
{
  id: number;
  autoevaluacion_id: number;                     // WRITE_ONLY
  autoevaluacion_detail: {
    id: number;
    numero: string;
    periodo: number;
  };
  servicio_sede_id: number;                      // WRITE_ONLY
  servicio_sede_detail: {
    id: number;
    codigo: string;
    nombre: string;
  };
  servicios_disponibles: [                       // ← COMPUTED: servicios para autoevaluación
    {
      id: number;
      codigo: string;
      nombre: string;
      modalidad: string;
      complejidad: string;
      estado: string;
    }
  ];
  criterio_id: number;                           // WRITE_ONLY
  criterio_detail: {
    id: number;
    codigo: string;
    nombre: string;
    complejidad: string;
  };
  cumple: string;
  cumple_display: string;                        // ← DISPLAY FIELD
  hallazgo: string|null;
  plan_mejora: string|null;
  responsable_mejora_detail: {                   // ← NESTED or null
    id: number;
    username: string;
    email: string;
  } | null;
  fecha_compromiso: string|null;
  tiene_plan_mejora: boolean;                    // ← COMPUTED
  mejora_vencida: boolean;                       // ← COMPUTED: mejora_vencida()
  planes_mejora_vinculados: [                    // ← FROM app mejoras
    {
      id: number;
      numero_plan: string;
      estado: string;
      porcentaje_avance: number;
      fecha_vencimiento: string;
      esta_vencido: boolean;
    }
  ];
  hallazgos_vinculados: [                        // ← FROM app mejoras (query)
    {
      id: number;
      numero_hallazgo: string;
      tipo: string;
      severidad: string;
      estado: string;
      tiene_plan: boolean;
    }
  ];
  documentos_evidencia_list: [
    {
      id: number;
      titulo: string;
      tipo: string;
      archivo: string|null;
    }
  ];
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### 4.2 Frontend Entity (Cumplimiento.ts)

```typescript
export interface Cumplimiento {
  id: number;
  cumple: EstadoCumplimiento;
  cumple_display?: string;
  criterio_codigo?: string;
  criterio_nombre?: string;
  servicio_nombre?: string;
  autoevaluacion_id?: number;
  servicio_sede_id?: number;
  criterio_id?: number;
  tiene_plan_mejora?: boolean;
  planes_mejora_count?: number;
  hallazgos_count?: number;
  hallazgo?: string;
  plan_mejora?: string;
  responsable_mejora?: {
    id: number;
    username: string;
  };
  responsable_mejora_detail?: {
    id: number;
    username: string;
  } | null;
  fecha_compromiso?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  documentos_evidencia?: Array<{...}>;
  documentos_evidencia_list?: Array<{...}>;
  autoevaluacion?: {
    id: number;
    numero_autoevaluacion: string;
  };
  servicio_sede?: {
    id: number;
    nombre_servicio: string;
  };
  criterio?: {
    id: number;
    nombre: string;
  };
  autoevaluacion_detail?: {
    id: number;
    numero: string;
    periodo: number;
  };
  servicio_sede_detail?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  criterio_detail?: {
    id: number;
    codigo: string;
    nombre: string;
    complejidad?: string;
  };
  servicios_disponibles?: Array<{
    id: number;
    codigo: string;
    nombre: string;
    modalidad?: string;
    complejidad?: string;
    estado?: string;
  }>;
  mejora_vencida?: boolean;
  planes_mejora_vinculados?: any[];
  hallazgos_vinculados?: any[];
}
```

### 4.3 Issues Found

| Issue | Backend | Frontend | Impact |
|-------|---------|----------|--------|
| ⚠️ MISSING computed | `cumple_display` in list | Entity has field | ✅ Frontend has it |
| ❌ MISSING computed | `servicios_disponibles` in list | Only in detail | ✅ Correct, detail-only |
| ⚠️ Type mismatch | `documentos_evidencia_list` array | Entity has both names | ✅ Both supported |
| ✅ OK | Deep nesting support | All *_detail fields | ✅ Good |
| ✅ OK | Integration fields | `planes_mejora_vinculados` | ✅ Correct |

### 4.4 JSON Samples

#### LIST Response
```json
{
  "id": 444,
  "criterio_codigo": "3.2",
  "criterio_nombre": "Control y almacenamiento",
  "servicio_nombre": "Medicina General",
  "autoevaluacion_id": 10,
  "servicio_sede_id": 23,
  "criterio_id": 8,
  "cumple": "NO_CUMPLE",
  "cumple_display": "No Cumple",
  "tiene_plan_mejora": true,
  "planes_mejora_count": 1,
  "hallazgos_count": 2,
  "fecha_compromiso": "2026-03-19"
}
```

#### DETAIL Response
```json
{
  "id": 444,
  "autoevaluacion_id": 10,
  "autoevaluacion_detail": {
    "id": 10,
    "numero": "AUT-520010121300-2026",
    "periodo": 2026
  },
  "servicio_sede_id": 23,
  "servicio_sede_detail": {
    "id": 23,
    "codigo": "MD00012",
    "nombre": "Medicina General"
  },
  "servicios_disponibles": [
    {
      "id": 23,
      "codigo": "MD00012",
      "nombre": "Medicina General",
      "modalidad": "Ambulatoria",
      "complejidad": "Media",
      "estado": "Habilitado"
    },
    {
      "id": 26,
      "codigo": "MD00015",
      "nombre": "Medicina Especializada",
      "modalidad": "Ambulatoria",
      "complejidad": "Alta",
      "estado": "Habilitado"
    }
  ],
  "criterio_id": 8,
  "criterio_detail": {
    "id": 8,
    "codigo": "3.2",
    "nombre": "Control y almacenamiento",
    "complejidad": "ALTA"
  },
  "cumple": "NO_CUMPLE",
  "cumple_display": "No Cumple",
  "hallazgo": "ejemplo descripcion",
  "plan_mejora": "ejemplo plan de mejora",
  "responsable_mejora_detail": {
    "id": 5,
    "username": "responsable1",
    "email": "resp1@hospital.com"
  },
  "fecha_compromiso": "2026-03-19",
  "tiene_plan_mejora": true,
  "mejora_vencida": false,
  "planes_mejora_vinculados": [
    {
      "id": 15,
      "numero_plan": "PM-001",
      "estado": "EN_CURSO",
      "porcentaje_avance": 65,
      "fecha_vencimiento": "2026-03-19",
      "esta_vencido": false
    }
  ],
  "hallazgos_vinculados": [
    {
      "id": 8,
      "numero_hallazgo": "H-001",
      "tipo": "NO_CONFORMIDAD",
      "severidad": "ALTA",
      "estado": "ABIERTO",
      "tiene_plan": true
    }
  ],
  "documentos_evidencia_list": [
    {
      "id": 42,
      "titulo": "Protocolo de Almacenamiento",
      "tipo": "PROCEDIMIENTO",
      "archivo": "/media/documentos/protocolo_almacenamiento.pdf"
    }
  ],
  "fecha_creacion": "2026-03-12T14:56:54.218818-05:00",
  "fecha_actualizacion": "2026-03-12T15:41:49.860504-05:00"
}
```

---

## 5️⃣ Criterio / Estandar

### 5.1 Backend Serializers

#### CriterioSerializer Fields
```typescript
{
  id: number;
  estandar: number;
  estandar_display: string;                      // ← FROM estandar.get_codigo_display()
  codigo: string;
  nombre: string;
  descripcion: string;
  complejidad: string;
  complejidad_display: string;                   // ← DISPLAY FIELD
  aplica_todos: boolean;
  es_mandatorio: boolean;
  requiere_evidencia_documental: boolean;
  notas_interpretacion: string|null;
  estado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

#### EstandarSerializer Fields
```typescript
{
  id: number;
  codigo: string;
  codigo_display: string;                        // ← DISPLAY FIELD
  nombre: string;
  descripcion: string|null;
  estado: boolean;
  version_resolucion: string;
  criterios: CriterioSerializer[];               // ← NESTED array
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

#### EstandarListSerializer Fields
```typescript
{
  id: number;
  codigo: string;
  codigo_display: string;                        // ← DISPLAY FIELD
  nombre: string;
  estado: boolean;
  criterios_count: number;                       // ← COMPUTED
}
```

### 5.2 Frontend Entities (Criterio.ts)

```typescript
export interface Criterio {
  id: number;
  numero_criterio: string;                       // ← MISMATCH: Backend uses "codigo"
  descripcion: string;
  categoria?: string;
  documento_referencia?: string;
  requisito_normativo: string;
  fecha_actualizacion: string;
}

export interface CriterioEvaluacion {
  // ... evaluation-specific fields
}
```

### 5.3 Issues Found

| Issue | Backend | Frontend | Impact |
|-------|---------|----------|--------|
| ❌ CRITICAL | Backend: `codigo`, Frontend: `numero_criterio` | Naming mismatch | Will break API integration |
| ❌ MISSING | Backend has `estandar` FK | Frontend has `categoria` | Categories missing |
| ❌ MISSING | Backend has `complejidad_display` | Frontend no tiene | UI must compute |
| ❌ MISSING | Backend has `aplica_todos`, `es_mandatorio` | Entity doesn't have | Loss of info |
| ❌ MISSING | Backend has `requiere_evidencia_documental` | Entity doesn't have | Loss of info |
| ❌ MISSING | Backend has `notas_interpretacion` | Entity doesn't have | Loss of info |
| ⚠️ MISSING | No Estandar entity | Backend has full Estandar model | Can't fetch standards |

### 5.4 JSON Samples

#### Criterio Detail
```json
{
  "id": 8,
  "estandar": 2,
  "estandar_display": "Infraestructura Física",
  "codigo": "3.2",
  "nombre": "Control y almacenamiento",
  "descripcion": "La IPS debe contar con sistemas de...",
  "complejidad": "ALTA",
  "complejidad_display": "Alta",
  "aplica_todos": true,
  "es_mandatorio": true,
  "requiere_evidencia_documental": true,
  "notas_interpretacion": "Debe incluir temperatura...",
  "estado": true,
  "fecha_creacion": "2024-01-01T00:00:00Z",
  "fecha_actualizacion": "2024-01-01T00:00:00Z"
}
```

#### Estandar Detail with Criterios
```json
{
  "id": 2,
  "codigo": "INF",
  "codigo_display": "Infraestructura Física",
  "nombre": "Infraestructura de la Institución",
  "descripcion": "Establece...",
  "estado": true,
  "version_resolucion": "3100/2019",
  "criterios": [
    {
      "id": 7,
      "estandar": 2,
      "codigo": "3.1",
      "nombre": "Ubicación y funcionalidad",
      ...
    },
    {
      "id": 8,
      "estandar": 2,
      "codigo": "3.2",
      "nombre": "Control y almacenamiento",
      ...
    }
  ],
  "fecha_creacion": "2024-01-01T00:00:00Z",
  "fecha_actualizacion": "2024-01-01T00:00:00Z"
}
```

---

## 📋 PLAN DE TRABAJO DETALLADO

### FASE 1: Correcciones Críticas (Bloqueantes)

#### Task 1.1: Fix Criterio Entity
- [ ] Renombrar `numero_criterio` → `codigo` (o agregar ambos)
- [ ] Agregar fields: `estandar_id`, `complejidad`, `complejidad_display`
- [ ] Agregar fields: `aplica_todos`, `es_mandatorio`, `requiere_evidencia_documental`
- [ ] Agregar fields: `notas_interpretacion`, `estado`

#### Task 1.2: Create Estandar Entity
- [ ] Nuevo archivo `Estandar.ts`
- [ ] Fields: `id`, `codigo`, `codigo_display`, `nombre`, `descripcion`, `estado`, `version_resolucion`
- [ ] Nested `criterios?: Criterio[]`

#### Task 1.3: Fix Autoevaluacion `cumplimientos_data` Type
- [ ] Backend devuelve object breakdown, no array Cumplimiento
- [ ] Agregar nuevo tipo: `CumplimientoResumen`
- [ ] Update Autoevaluacion.cumplimientos_data?

#### Task 1.4: Add computed fields to Entities
- [ ] ServicioSede: `vencido`, `dias_vencimiento`, `modalidad_display`, `complejidad_display`
- [ ] Cumplimiento: `mejora_vencida` (ya existe)

### FASE 2: Hooks de Integración (Data Fetching)

#### Task 2.1: useCriterio Hook
- [ ] Implementar: `fetchCriterios()` 
- [ ] Implementar: `fetchEstandares()`
- [ ] Implementar: `getCriterioById(id)`
- [ ] Add state: `criterios`, `estandares`, `loading`, `error`

#### Task 2.2: useDatosPrestador Hook  
- [ ] Implementar: `fetchPrestadores()`
- [ ] Implementar: `getPrestador(id)` 
- [ ] Implementar: `getPrestadoresProximosAVencer()`
- [ ] Implementar: `getPrestadoresVencidos()`

#### Task 2.3: useServicioSede Hook
- [ ] Implementar: `fetchServicios()`
- [ ] Implementar: `getServicio(id)`
- [ ] Implementar: `getServiciosProximosAVencer()`
- [ ] Implementar: `getServiciosPorComplejidad(complejidad)`
- [ ] Add: `servicios`, `loading`, `error` state

#### Task 2.4: useAutoevaluacion Hook (Review + Enhance)
- [ ] Verify: `fetchAutoevaluaciones()` works
- [ ] Implement: `getAutoevaluacionPorCompletar()`
- [ ] Implement: `getResumenAutoevaluacion(id)`
- [ ] Implement: `validarAutoevaluacion(id)` (POST)
- [ ] Implement: `duplicarAutoevaluacion(id)` (POST)

#### Task 2.5: useCumplimiento Hook (Review + Enhance)
- [ ] Verify: `create()`, `update()` work with fixed types
- [ ] Implement: `getCumplimientosSinCumplir()`
- [ ] Implement: `getCumplimientosConPlanMejora()`
- [ ] Implement: `getMejorasVencidas()`
- [ ] Verify: `servicios_disponibles` loads correctly

### FASE 3: UI Components Updates

#### Task 3.1: CriterioSelector Component
- [ ] Add grouped view by Estandar
- [ ] Show `complejidad_display`, `aplica_todos`, `es_mandatorio`
- [ ] Add filter by `complejidad`, `es_mandatorio`

#### Task 3.2: CumplimientoFormModal (Already in progress)
- [ ] ✅ Fix hallazgo/plan_mejora loading (from previous work)
- [ ] Add `responsable_mejora` field with user selector
- [ ] Show `servicios_disponibles` correctly
- [ ] Add `documentos_evidencia` upload

#### Task 3.3: Dashboard Views
- [ ] Show `mejoras_resumen` stats for each Autoevaluacion
- [ ] Show `planes_mejora_vinculados` from Cumplimiento detail
- [ ] Show `hallazgos_vinculados` from Cumplimiento detail

### FASE 4: Type Safety & Validation

#### Task 4.1: Const & Enums
- [ ] Define all choice fields as enums
- [ ] Verify display mappings in frontend

#### Task 4.2: Serialization Tests
- [ ] Mock all JSON responses
- [ ] Verify entity type matches
- [ ] Test computed fields

### FASE 5: Documentation  

#### Task 5.1: API Integration Guide
- [ ] Document all endpoints used
- [ ] List required query params
- [ ] List computed fields

---

## 🎯 Prioridades

1. **CRITICAL** (Bloqueantes):
   - Task 1.1: Fix Criterio
   - Task 1.2: Create Estandar
   - Task 1.3: Fix cumplimientos_data type

2. **HIGH** (Funcionales):
   - All Task 2.x: Hooks
   - Task 3.1: CriterioSelector

3. **MEDIUM** (Mejoras):
   - Task 3.2, 3.3: UI Components
   - Task 4.x: Type Safety

---

## 📊 Summary Table

| Component | Status | Issues | Priority |
|-----------|--------|--------|----------|
| DatosPrestador | ✅ OK | 1 mismatch | LOW |
| ServicioSede | ⚠️ Partial | 5 missing computed | MEDIUM |
| Autoevaluacion | ⚠️ Partial | 1 type mismatch | HIGH |
| Cumplimiento | ✅ Good | 0 critical | MEDIUM |
| Criterio | ❌ BROKEN | 6 mismatches | CRITICAL |
| Estandar | ❌ MISSING | No entity | CRITICAL |

