# 🏥 Módulo de Habilitación - Documentación

> Documentación completa del módulo de Habilitación de la plataforma portal web para gestión de operaciones comerciales y administrativas.

## 📋 Contenido

1. [Introducción](#introducción)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Entidades Principales](#entidades-principales)
4. [Arquitectura](#arquitectura)
5. [Componentes](#componentes)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Flujos de Trabajo](#flujos-de-trabajo)
8. [Enums y Constantes](#enums-y-constantes)
9. [Testing](#testing)
10. [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🎯 Introducción

El módulo de **Habilitación** gestiona el ciclo de vida completo de acreditación y certificación de instituciones prestadoras de servicios de salud. Incluye:

- **DatosPrestador**: Información general de la institución y sus datos de habilitación
- **ServicioSede**: Servicios ofrecidos por cada institución
- **Criterio**: Estándares de evaluación que deben cumplir los servicios
- **Autoevaluación**: Proceso de autoevaluación contra criterios
- **Cumplimiento**: Resultados de evaluación por criterio
- **PlanMejora**: Planes de acción para corregir incumplimientos

---

## 📁 Estructura del Proyecto

```
src/apps/habilitacion/
├── domain/                          # Capa de dominio (lógica de negocio)
│   ├── entities/                    # Definiciones de entidades
│   │   ├── Criterio.ts              # Estándares de evaluación
│   │   ├── Cumplimiento.ts          # Resultados de evaluación
│   │   ├── Autoevaluacion.ts        # Procesos de autoevaluación
│   │   ├── ServicioSede.ts          # Servicios de la institución
│   │   ├── DatosPrestador.ts        # Datos generales de institución
│   │   ├── Estandar.ts              # Nueva: Estándares generales
│   │   └── ...
│   ├── repositories/                # Interfaces de repositorio
│   │   ├── index.ts
│   │   └── IEstandarRepository.ts  # Nueva: Interface para Estandar
│   ├── types/                       # Tipos y constantes globales
│   │   └── index.ts                 # ESTADOS_* y tipos globales
│   ├── enums/                       # 🆕 Enums TypeScript
│   │   ├── index.ts                 # ComplejidadCriterioEnum, etc.
│   │   └── __tests__/
│   └── usecases/                    # Casos de uso (si aplica)
│
├── application/                     # Capa de aplicación (servicios)
│   └── services/
│       ├── CriterioService.ts       # Lógica de criterios
│       ├── CumplimientoService.ts   # Lógica de cumplimientos
│       ├── EstandarService.ts       # 🆕 Nueva: Lógica de estándares
│       └── ...
│
├── infrastructure/                  # Capa de infraestructura (API)
│   ├── repositories/
│   │   ├── CriterioRepository.ts
│   │   ├── EstandarRepository.ts    # 🆕 Nueva: Acceso a datos
│   │   └── ...
│   ├── http/
│   │   └── api.ts                   # Configuración de axios
│   └── services/
│
├── presentation/                    # Capa de presentación (UI)
│   ├── components/
│   │   ├── CriterioFormModal.tsx    # 🔄 Modernizado: Nuevos campos
│   │   ├── CumplimientoFormModal.tsx# 🔄 Mejorado: Dropdown criterios
│   │   ├── CumplimientoPanelPage.tsx# 🔄 Mejorado: Tabla con código
│   │   └── __tests__/               # 🆕 Tests unitarios
│   ├── hooks/
│   │   ├── useCriterio.ts           # 🔄 Mejorado: Nuevos métodos
│   │   ├── useCumplimiento.ts       # 🔄 Mejorado: Categorización
│   │   ├── useAutoevaluacion.ts     # 🔄 Mejorado: mejor estructura
│   │   └── useEstandar.ts           # 🆕 Nueva: Hook para estándares
│   ├── constants/                   # 🆕 Constantes de formularios
│   │   ├── formConstants.ts         # Validaciones, hints, defaults
│   │   ├── index.ts
│   │   └── __tests__/
│   ├── pages/
│   │   ├── CumplimientoPanelPage.tsx
│   │   └── ...
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── routes.tsx
│
└── README.md                         # 👈 Este archivo
```

---

## 🔷 Entidades Principales

### Criterio

Estándares de evaluación que deben cumplir los servicios.

```typescript
interface Criterio {
  id: number;
  codigo: string;                      // Identificador único (INF-001)
  nombre: string;                      // Nombre corto del criterio
  descripcion: string;                 // Descripción detallada
  complejidad: 'BAJA' | 'MEDIA' | 'ALTA';
  es_mandatorio: boolean;              // ¿Deben cumplir todas las IPS?
  requiere_evidencia_documental: boolean;
  notas_interpretacion?: string;
  estandar_id?: number;                // Referencia a Estandar
}
```

**Cambios Recientes (FASE 3):**
- ✅ Actualizado para usar `codigo` como identificador primario
- ✅ Agregados campos `complejidad`, `es_mandatorio`, `requiere_evidencia_documental`
- ✅ CriterioCreate interface modernizada (legacy fields para backward compatibility)

### Cumplimiento

Resultados de evaluación de un servicio contra un criterio.

```typescript
interface Cumplimiento {
  id: number;
  autoevaluacion_id: number;
  servicio_sede_id: number;
  criterio_id: number;
  cumple: 'CUMPLE' | 'NO_CUMPLE' | 'PARCIALMENTE' | 'NO_APLICA';
  hallazgo?: string;
  plan_mejora?: string;
  fecha_compromiso?: string;
  criterio?: Criterio;                // Relación con criterio
  servicio_sede?: ServicioSede;       // Relación con servicio
}
```

**Cambios Recientes:**
- ✅ Updated criterio? property to include codigo, nombre, descripcion, es_mandatorio

### Autoevaluación

Proceso de evaluación de una institución contra estándares.

```typescript
interface Autoevaluacion {
  id: number;
  prestador_id: number;
  estado: 'BORRADOR' | 'EN_CURSO' | 'COMPLETADA' | 'VALIDADA';
  numero_autoevaluacion: string;
  periodo_anio: number;
  cumplimientos_data?: Cumplimiento[];
}
```

---

## 🏗️ Arquitectura

El módulo sigue **Clean Architecture** con separación clara de responsabilidades:

### Domain Layer (Lógica de Negocio)
- Define entidades, tipos, y reglas de negocio
- No tiene dependencias externas
- Incluye `Enums` y `Types` para type-safe code

### Application Layer (Servicios)
- Implementa casos de uso
- Coordina entre domain y infrastructure
- Ejemplo: `CriterioService.getCriteriosPorComplejidad()`

### Infrastructure Layer (Acceso a Datos)
- Comunica con APIs backend
- Implementa repositorios
- Ejemplo: `CriterioRepository.fetch(filters)`

### Presentation Layer (UI)
- Componentes React
- Hooks personalizados para state management
- Constantes y utilities de presentación

---

## 🎨 Componentes

### CriterioFormModal

Modal para crear/editar criterios con nueva estructura mejorada.

**Cambios FASE 3:**
- ✅ Tres secciones: Identificación, Contenido, Propiedades
- ✅ Campo `codigo` no editable en modo edición
- ✅ Checkboxes para `es_mandatorio` y `requiere_evidencia_documental`
- ✅ Validaciones mejoradas
- ✅ Mejor UX con hints descriptivos

```typescript
<CriterioFormModal
  isOpen={true}
  criterio={undefined}  // Para creación
  onClose={() => setShowModal(false)}
  onSuccess={() => loadCriterios()}
/>
```

### CumplimientoFormModal

Modal para crear/editar cumplimientos con dropdown mejorado.

**Cambios FASE 3:**
- ✅ Dropdown criterios ahora muestra: "codigo - nombre"
- ✅ Indicador visual ⚠️ para criterios mandatorios
- ✅ Búsqueda multi-campo: código, nombre, descripción

```typescript
<CumplimientoFormModal
  isOpen={true}
  autoevaluacionId={123}
  onSuccess={() => loadCumplimientos()}
  onClose={() => setShowModal(false)}
/>
```

### CumplimientoPanelPage

Página con tabla de cumplimientos y estadísticas.

**Cambios FASE 3:**
- ✅ Columna criterio mejorada: código en badge + nombre
- ✅ Búsqueda multi-campo: servicio, código, nombre, descripción
- ✅ Mejor visualización de estado

---

## 🪝 Hooks Personalizados

### useCriterio

Gestiona criterios con métodos de filtrado avanzado.

```typescript
const { 
  criterios, 
  loading, 
  fetchCriterios,
  getCriteriosPorComplejidad,      // 🆕
  getCriteriosMandatorios,         // 🆕
  getCriteriosConEvidencia,        // 🆕
  getCriteriosPorEstandar          // 🆕
} = useCriterio();
```

### useCumplimiento

Gestiona cumplimientos con estado categorizado.

```typescript
const {
  cumplimientos,
  sinCumplir,                      // 🆕
  conPlanMejora,                   // 🆕
  mejorasVencidas,                 // 🆕
  getCumplimientosSinCumplir(),    // 🆕
  getCumplimientosConPlanMejora(), // 🆕
  getMejorasVencidas()             // 🆕
} = useCumplimiento();
```

### useAutoevaluacion

Gestiona autoevaluaciones.

```typescript
const {
  autoevaluaciones,
  porCompletar,                    // 🆕
  getAutoevaluacionesPorCompletar(), // 🆕
  fetchAutoevaluaciones
} = useAutoevaluacion();
```

---

## 📊 Flujos de Trabajo

### Crear Nuevo Criterio

```
1. Usuario abre CriterioFormModal
2. Completa campos: codigo, nombre, descripcion, complejidad, propiedades
3. Click "Crear Criterio"
4. CriterioService.createCriterio() →  Backend API
5. Backend retorna Criterio con ID
6. Hook useCriterio actualiza estado
7. Modal cierra y tabla se refresca
```

### Crear Cumplimiento

```
1. Usuario abre CumplimientoFormModal
2. Selecciona Servicio del dropdown
3. Selecciona Criterio del dropdown (ahora: "codigo - nombre")
4. Selecciona Estado de cumplimiento
5. Si No Cumple → completa hallazgo + plan de mejora
6. Click "Registrar"
7. CumplimientoService.create() → Backend API
8. Hook useCumplimiento actualiza categorías (sinCumplir, conPlanMejora, etc.)
```

### Buscar Cumplimientos

```
1. Usuario escribe en search (ej: "INF")
2. Filtro busca en:
   - Código criterio (INF-001)
   - Nombre criterio (Infraestructura Física)
   - Descripción criterio
   - Nombre servicio
   - Hallazgo encontrado
3. Tabla se actualiza automáticamente
```

---

## 🎯 Enums y Constantes

### 🆕 ComplejidadCriterioEnum

```typescript
enum ComplejidadCriterioEnum {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

// Type-safe labels
complejidadCriterioLabels[ComplejidadCriterioEnum.BAJA] // 'Baja'

// Type guards
isValidComplejidadCriterio('BAJA') // true
```

### 🆕 Form Constants

```typescript
import { CRITERIO_VALIDATION, FORM_DEFAULTS, FORM_HINTS } from '@habilitacion/constants';

CRITERIO_VALIDATION.codigo.minLength      // 3
CRITERIO_VALIDATION.codigo.maxLength      // 20
CRITERIO_VALIDATION.codigo.pattern        // /^[A-Z0-9\-]+$/

FORM_DEFAULTS.criterio.complejidad        // 'MEDIA'
FORM_DEFAULTS.criterio.es_mandatorio      // false

FORM_HINTS.criterio.codigo                // "Código único que identifica..."
```

---

## ✅ Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests en watch mode
npm run test:watch
```

### Archivos de Test

- `CriterioFormModal.test.tsx` - Tests de componente
- `enums.test.ts` - Tests de enums
- `formConstants.test.ts` - Tests de constantes

### Ejemplo de Test

```typescript
describe('CriterioFormModal', () => {
  it('should disable codigo field in edit mode', async () => {
    render(
      <CriterioFormModal 
        isOpen={true} 
        criterio={{ id: 1, codigo: 'INF-001', ... }}
        onClose={() => {}}
        onSuccess={() => {}}
      />
    );
    
    const codigoInput = screen.getByDisplayValue('INF-001');
    expect(codigoInput).toBeDisabled();
  });
});
```

---

## 👨‍💻 Guía de Desarrollo

### Agregar Nuevo Criterio a Filtro

1. Agregarlo a `useCriterio.ts`:
```typescript
getCriteriosPorNuevaPropiedad(valor: string) {
  return this.criterios.filter(c => c.nuevaPropiedad === valor);
}
```

2. Usar en componente:
```typescript
const criteriosFiltrados = useCriterio().getCriteriosPorNuevaPropiedad('algo');
```

### Agregar Nuevo Campo a Formulario

1. Actualizar `Criterio.ts` interface
2. Actualizar `CriterioCreate.ts` interface
3. Agregar validación en `CRITERIO_VALIDATION`
4. Agregar hint en `FORM_HINTS.criterio`
5. Agregar input/select en `CriterioFormModal.tsx`
6. Agregar test en `CriterioFormModal.test.tsx`

### Agregar Nuevo Estado Filtrado

1. Actualizar `useCriterio()` con nueva propiedad computada:
```typescript
const [criterios, setCriterios] = useState<Criterio[]>([]);
const criterioBuscado = useMemo(() => 
  criterios.filter(c => c.esPor...),
  [criterios]
);
```

2. Retornar en hook:
```typescript
return { criterios, criterioBuscado, ... }
```

### Mejores Prácticas

✅ **Usar enums para estados:**
```typescript
// ✅ Bien
if (cumplimiento.cumple === EstadoCumplimientoEnum.CUMPLE) { }

// ❌ Evitar
if (cumplimiento.cumple === 'CUMPLE') { }
```

✅ **Constantizar valores mágicos:**
```typescript
// ✅ Bien
const maxCriterios = LIMITS.criterios_por_estandar;

// ❌ Evitar
const maxCriterios = 50;
```

✅ **Validar en frontend y backend:**
```typescript
// Frontend validation
if (!formData.codigo || formData.codigo.length < 3) { }

// Backend también valida
```

✅ **Usar type guards:**
```typescript
if (isValidComplejidadCriterio(value)) {
  const typed: ComplejidadCriterioEnum = value;
  // TypeScript now knows type safely
}
```

---

## 📚 Referencias

- [Stack Tracer - Clean Architecture](./STACK_TRACER.md)
- [API Documentation](./API.md)
- [Migration Log](./MIGRATION_LOG.md)

---

## 🤝 Contribuciones

Al contribuir al módulo:

1. Seguir la estructura de carpetas existente
2. Crear tests para nuevas features
3. Actualizar documentación
4. Usar tipos TypeScript estrictamente
5. Seguir el patrón de naming existente

---

**Última actualización:** 13 de Marzo, 2026
**Versión:** 3.0 (Post FASE 3-5)
