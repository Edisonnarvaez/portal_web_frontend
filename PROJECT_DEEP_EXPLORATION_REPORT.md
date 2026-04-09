# 📊 EXPLORACIÓN PROFUNDA DEL PROYECTO - PORTAL WEB FRONTEND

**Fecha**: 9 de Abril de 2026  
**Status**: 🔄 Exploración en progreso  
**Objetivo**: Análisis detallado y plan de mejora integral

---

## 📋 TABLA DE CONTENIDOS

1. [Contexto General](#contexto-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Módulos Principales](#módulos-principales)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Patrones de Arquitectura](#patrones-de-arquitectura)
6. [Análisis de Fortalezas](#análisis-de-fortalezas)
7. [Hallazgos y Problemas](#hallazgos-y-problemas)
8. [Plan de Mejora](#plan-de-mejora-integral)

---

## 📖 CONTEXTO GENERAL

### Descripción del Proyecto

**Nombre**: Portal Web para Empresas de Control de Operaciones Comerciales y Administrativas  
**Sector**: Healthcare (Salud)  
**Propósito**: Sistema integral para gestión de:
- Habilitación de servicios sanitarios
- Documentación y procesos
- Indicadores de gestión (KPIs)
- Auditorías internas
- Administración general de la empresa

### Team Roles

Según `agents.md`:
- 👨‍💻 **Senior Backend Developer** - Django/DRF, APIs, databases
- 🎨 **Senior Frontend/UX Developer** - React, UI/UX, design systems
- 🏆 **Senior Project Manager** - Scrum, stakeholder management

### Fase Actual del Proyecto

- **Fases 0-5**: ✅ Completadas - Infraestructura base y 9 entidades de habilitación
- **Fase 6**: ✅ Completada - Módulo Soportes (documentos) con 5 componentes
- **Phase 6.1**: ✅ Completada - Auditoría de integración de entidades (10/10 score)
- **Fase 7**: 🚀 Siguiente - Generación de componentes UI (~50 componentes, ~13 días)

---

## 🏗️ ESTRUCTURA DEL PROYECTO

### Árbol de Carpetas Principal

```
src/
├── apps/                           # 🔴 Módulos de negocio (7 módulos)
│   ├── auth/                       # Autenticación y autorización
│   ├── menu/                       # Portal interno y comunicaciones
│   ├── indicadores/                # KPIs y gestión de indicadores
│   ├── procesos/                   # Documentación y gestión de procesos
│   ├── auditorias/                 # Seguimiento de auditorías
│   ├── administracion/             # Configuración del sistema
│   └── habilitacion/               # Habilitación de servicios sanitarios
│
├── core/                           # 🟢 Funcionalidades transversales
│   ├── config/                     # router.tsx, authGuard.tsx
│   ├── infrastructure/             # HTTP client (axiosInstance)
│   ├── domain/                     # Tipos globales
│   └── presentation/               # MainLayout, About page
│
└── shared/                         # 🟡 Componentes y utilidades compartidas
    ├── components/                 # Button, Input, Modal, etc.
    ├── hooks/                      # useDarkMode, useNotifications
    ├── utils/                      # dateUtils, passwordValidation, etc.
    └── types/                      # Tipos globales de TypeScript
```

### Patrón de Arquitectura por Módulo

Cada módulo implementa **Clean Architecture** con 4 capas:

```
apps/[modulo]/
├── domain/                         # 🔵 Capa de Dominio
│   ├── entities/                   # Definiciones de entidades
│   ├── repositories/               # Interfaces de repositorios
│   ├── types/                      # Tipos y enums específicos
│   ├── usecases/                   # (Algunos módulos: indicadores)
│   └── index.ts                    # Exports centralizados
│
├── application/                    # 🟣 Capa de Aplicación
│   ├── services/                   # Servicios y orquestación
│   └── index.ts                    # Exports centralizados
│
├── infrastructure/                 # 🟠 Capa de Infraestructura
│   ├── repositories/               # Implementaciones HTTP
│   ├── services/                   # API services
│   └── index.ts                    # Exports centralizados
│
├── presentation/                   # 🟡 Capa de Presentación
│   ├── components/                 # Componentes React
│   ├── hooks/                      # Custom hooks per entidad
│   ├── pages/                      # Páginas del módulo
│   ├── utils/                      # Utilities de UI
│   ├── constants/                  # Constantes del módulo
│   └── context/                    # React Context (auth usa)
│
└── routes.tsx                      # Definición de rutas
```

### Módulos del Proyecto

| Módulo | Ubicación | Descripción | Status |
|--------|-----------|-------------|--------|
| **Auth** | `src/apps/auth/` | Sistema de autenticación, JWT, 2FA | ✅ Completo |
| **Menu** | `src/apps/menu/` | Portal interno, noticias, eventos, org chart | ✅ Completo |
| **Indicadores** | `src/apps/indicadores/` | Gestión de KPIs, dashboards, resultados | ✅ Completo |
| **Procesos** | `src/apps/procesos/` | Gestión de documentos y procesos | ✅ Completo |
| **Auditorías** | `src/apps/auditorias/` | Seguimiento de auditorías | ✅ Básico |
| **Administración** | `src/apps/administracion/` | Configuración empresarial | ✅ Básico |
| **Habilitación** | `src/apps/habilitacion/` | Habilitación servicios sanitarios | 🚀 En expansión |

---

## 📚 MÓDULOS PRINCIPALES - ANÁLISIS DETALLADO

### 1️⃣ MÓDULO AUTH - Autenticación

**Status**: ✅ **PRODUCCIÓN**

**Componentes:**
- LoginPage - Formulario de login
- ProfilePage - Perfil de usuario
- AuthContext - Context global de autenticación
- AuthGuard - Guard para rutas protegidas

**Características:**
- ✅ JWT con refresh token
- ✅ Sistema de roles por aplicación
- ✅ 2FA (preparado en backend)
- ✅ localStorage para persistencia
- ✅ Axios interceptor para autorefresh

**Hallazgos:**
- 🟢 Implementación segura con JWT
- 🟢 Manejo de token refresh automático
- 🟡 2FA no totalmente integrado en UI

**Archivo clave**: `axiosInstance.ts` - Gestiona interceptores de request/response

---

### 2️⃣ MÓDULO MENU - Portal Interno

**Status**: ✅ **PRODUCCIÓN**

**Componentes principales:**
- MenuPage - Dashboard principal del portal
- NoticiasPage - Gestión de noticias
- EventosPage - Calendario de eventos
- FuncionariosPage - Directorio de empleados
- ReconocimientosPage - Reconocimientos y felicitaciones
- EstructuraOrganizacional - Organigramas visuales

**Entidades:**
- ContenidoInformativo (Noticias/Comunicados)
- Evento
- Funcionario
- Reconocimiento
- FelicitacionCumpleanios

**Patrones:**
```typescript
// Patrón consistente: Servicio → Repositorio → API
ReconocimientoCrudService
  └→ MenuRepository
      └→ MenuApiService
```

**Hallazgos:**
- 🟢 Componentes bien organizados
- 🟢 Manejo de estado con hooks personalizados
- 🟡 EstructuraOrganizacional muy complejo (254+ líneas)
- 🡃 Podría beneficiarse de refactoring

---

### 3️⃣ MÓDULO INDICADORES - KPIs y Dashboards

**Status**: ✅ **PRODUCCIÓN**

**Páginas:**
- DashboardPage - Dashboard visual con múltiples gráficos
- IndicadoresPage - CRUD de indicadores
- ResultadosPage - Registro de resultados
- DiagnosticoAPI - Validación de endpoints

**Componentes Dashboard:**
- IndicatorBarChart - Gráfico de barras
- TimeSeriesChart - Serie temporal
- CompliancePieChart - Gráfico pie de cumplimiento
- WorstIndicatorsChart - Indicadores peor desempeño
- IndicatorTable - Tabla con paginación
- SummaryCards - Tarjetas de resumen

**Stack Datos:**
- Recharts para visualizaciones
- Custom hooks: `useResultsData`, `useIndicatorsData`
- Pagination built-in

**Hallazgos:**
- 🟢 Excelente visualización de datos
- 🟢 Componentes reutilizables
- 🟡 DashboardPage algo monolítica (229+ líneas)
- 🡃 Paginación podría extraerse a componente

---

### 4️⃣ MÓDULO PROCESOS - Gestión Documental

**Status**: ✅ **PRODUCCIÓN**

**Características:**
- Gestión de documentos
- Control de versiones
- Permisos por rol
- PermissionService - Control granular de acceso

**Hallazgos:**
- 🟢 Sistema de permisos robusto
- 🟡 Documentación limitada
- 🡃 Necesita más componentes de UI

---

### 5️⃣ MÓDULO AUDITORÍAS

**Status**: 🟡 **BÁSICO**

**Hallazgos:**
- 🟡 Implementación mínima
- 🡃 Necesita expansión para Fase 7

---

### 6️⃣ MÓDULO ADMINISTRACIÓN

**Status**: 🟡 **BÁSICO**

**Componentes:**
- InformacionEmpresa - Datos de empresa
- SedesEmpresa - Gestión de sedes
- AreasEmpresa - Áreas organizacionales
- TiposProceso - Tipos de procesos
- Procesos - Procesos del sistema

**Hallazgs:**
- 🟡 Componentes básicos
- 🡃 Podría beneficiarse de Forms centralizados

---

### 7️⃣ MÓDULO HABILITACIÓN - Servicios Sanitarios

**Status**: 🚀 **EN EXPANSIÓN - FASE 7**

**Entidades** (9 implementadas):
1. DatosPrestador - Proveedor de salud
2. ServicioSede - Servicios en sedes
3. Autoevaluacion - Auto-evaluaciones
4. Cumplimiento - Cumplimiento de criterios
5. Criterio - Criterios de evaluación
6. Estandar - Estándares de calidad
7. PlanMejora - Planes de mejora
8. Hallazgo - Hallazgos de auditoría
9. SoporteDocumental - Documentos de soporte (Fase 6 ✅)

**Audit Status**: 10/10 - PRODUCTION READY ✅

**Próximas tareas**: Generar ~50 componentes UI

---

## 🛠️ STACK TECNOLÓGICO

### Frontend Stack

```json
{
  "core": {
    "React": "18.2.0",
    "TypeScript": "5.2.2",
    "React Router": "6.20.0",
    "Vite": "5.0.0"
  },
  "estado": {
    "Redux Toolkit": "2.8.2",
    "React Redux": "9.2.0"
  },
  "ui": {
    "Tailwind CSS": "3.3.5",
    "Headless UI": "2.2.4",
    "Lucide": "0.525.0",
    "React Icons": "4.12.0",
    "Framer Motion": "12.23.3"
  },
  "datos": {
    "Axios": "1.6.2",
    "Recharts": "3.1.0"
  },
  "utilidades": {
    "jsPDF": "3.0.1",
    "XLSX": "0.18.5",
    "React Toastify": "11.0.5",
    "QR Code": "4.2.0"
  }
}
```

### Configuración del Proyecto

**Vite Config** (`vite.config.ts`):
- Plugin React
- PostCSS para Tailwind

**TypeScript** (`tsconfig.json`):
- BaseURL: `src`
- Path Alias: `@/*` → `src/*`

**Tailwind** (`tailwind.config.js`):
- Dark mode: `class`
- Extensiones de colores personalizadas

---

## 🏛️ PATRONES DE ARQUITECTURA

### 1. Clean Architecture ✅

Cada módulo sigue 4 capas:
```
USER
  ↓
PRESENTATION (Components, Hooks, Pages)
  ↓
APPLICATION (Services, Use Cases)
  ↓
DOMAIN (Entities, Types, Interfaces)
  ↓
INFRASTRUCTURE (API Services, Repositories)
  ↓
BACKEND (Django API)
```

### 2. Dependency Injection ✅

```typescript
// Servicio inyecta repositorio
constructor(repository: EntityRepository) {
  this.repository = repository;
}

// Permite testing mockeado
```

### 3. Repository Pattern ✅

```
Domain
  ├── EntityRepository (Interface)
      ↓
Infrastructure  
  ├── ApiEntityRepository (Implementación HTTP)
      ↓
Application
  ├── EntityService (Usa repository)
      ↓
Presentation
  ├── useEntity Hook (Usa service)
```

### 4. Custom Hooks Pattern ✅

```typescript
// Encapsula estado y lógica de negocio
export const useEntity = () => {
  const [data, setData] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetch = useCallback(async () => {
    // Lógica de fetch
  }, []);
  
  return { data, loading, error, fetch };
};
```

### 5. Domain-Driven Design (DDD) ✅

```
Módulos independientes por dominio:
- auth/ (Autenticación)
- menu/ (Comunicaciones)
- indicadores/ (KPIs)
- procesos/ (Documentos)
- habilitacion/ (Servicios sanitarios)
```

---

## 💪 ANÁLISIS DE FORTALEZAS

### 1. ✅ Arquitectura Escalable

- Clean Architecture implementada
- Separación clara de responsabilidades
- Fácil de mantener y extender

### 2. ✅ Type Safety

- 100% TypeScript
- Interfaces bien definidas
- Previene errores en compile-time

### 3. ✅ Componentes Reutilizables

```typescript
shared/components/
├── Button.tsx
├── Input.tsx
├── Modal.tsx
├── LoadingScreen.tsx
├── Sidebar.tsx
├── Topbar.tsx
└── UserAvatar.tsx
```

### 4. ✅ API Integration Robusta

- Axios con interceptores
- JWT + Refresh Token automático
- Manejo centralizado de errores

### 5. ✅ UI/UX Profesional

- Tailwind CSS
- Dark mode support
- Responsive design
- Animaciones Framer Motion
- Iconografía consistente (Lucide + React Icons)

### 6. ✅ Estado Global Bien Manejado

- Redux Toolkit para complejo
- Context API para auth
- Custom hooks para por-módulo

### 7. ✅ Documentación Buena

- README.md completo
- architecture.md con diagramas
- Code comments claros
- agents.md con responsabilidades

---

## 🔴 HALLAZGOS Y PROBLEMAS IDENTIFICADOS

### CRÍTICOS 🔴

#### 1. TODO Comments Sin Completar

**Ubicación**: `src/apps/habilitacion/presentation/pages/SoportesPage.tsx`

```typescript
// TODO: Implement edit functionality (línea 49)
// TODO: Implement delete functionality (línea 54)
// TODO: Implement category creation via API (línea 59)
```

**Impacto**: Funcionalidad incompleta en Soportes Page

**Solución**: Completar implementación de estas características

---

#### 2. SoportesPage Incompleta

**Status**: Tiene UI pero acciones no funcionales

**Acciones requeridas**:
- Edit de documentos
- Delete de documentos
- Creación de categorías vía API

---

### MAYORES 🟠

#### 3. Componentes Monolíticos

**Ubicación**: 
- EstructuraOrganizacional.tsx (254 líneas)
- DashboardPage.tsx (229 líneas)
- HabilitacionPage.tsx (600+ líneas)

**Problema**: Difíciles de testear y mantener

**Solución**: Refactorizar en sub-componentes

---

#### 4. SortedByDate Inconsistencia

**Hallazgo**: Hay métodos duplicados en múltiples hooks

```typescript
// Repetido en varios hooks
const sortedByDate = (data) => {
  return [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};
```

**Solución**: Centralizar en `shared/utils/`

---

#### 5. Paginación No Centralizada

**Problema**: Lógica de paginación repetida en múltiples componentes

```typescript
// Repetido en IndicatorTable, MenuPage, etc.
const itemsPerPage = 10;
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
```

**Solución**: Crear `Pagination` component centralizado

---

### MENORES 🟡

#### 6. Error Handling Inconsidente

**Problema**: 
- Algunos componentes usan toast notifications
- Otros usan console.error
- Algunos nil-safe checks inconsistentes

**Solución**: Standardizar error handling

---

#### 7. Loading States No Siempre Presentes

**Problema**: Algunos componentes no muestran loading UI

**Solución**: Implementar LoadingScreen en todos

---

#### 8. Type Safety en API Responses

**Problema**: Algunos endpoints pueden devolver formatos distintos

```typescript
// A veces array, a veces paginated response
const response = await fetch(...);
```

**Solución**: Normalizar respuestas en API services

---

#### 9. Performance - Sin Memoization

**Problema**: Componentes se renderizan sin memoization

```typescript
// Puede causar renders innecesarios
<Component items={items} onSelect={handleSelect} />
```

**Solución**: Usar React.memo, useMemo, useCallback

---

#### 10. Testing Coverage Limitado

**Problema**: 
- No hay tests en `/src` principal
- Habilitación tiene tests pero mayormente en `/tests`
- Falta E2E testing

**Solución**: Implementar Jest + React Testing Library

---

### DEUDA TÉCNICA 📊

| Categoría | Severidad | Items | Esfuerzo |
|-----------|-----------|-------|----------|
| Refactoring | Media | 8 componentes | 3 días |
| Testing | Alta | Full coverage | 5 días |
| Performance | Media | Memoization | 2 días |
| Docs | Baja | Storybook | 2 días |
| **TOTAL** | | | **~12 días** |

---

## 📋 PLAN DE MEJORA INTEGRAL

### FASE 1: Correcciones Críticas (3-4 días)

#### 1.1 Completar SoportesPage

```typescript
// Implementar
- editSoporte() - PATCH /api/habilitacion/soportes/{id}/
- deleteSoporte() - DELETE /api/habilitacion/soportes/{id}/
- createCategory() - POST /api/habilitacion/soporte-categories/
```

**Archivos a modificar**:
- [ ] `src/apps/habilitacion/presentation/pages/SoportesPage.tsx`

**Timeline**: 0.5 días

---

#### 1.2 Standardizar Error Handling

```typescript
// Crear error handler centralizado
src/shared/utils/errorHandler.ts

export const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    // Mostrar toast
    toast.error(error.response?.data?.message || 'Error desconocido');
  } else {
    console.error(error);
  }
};
```

**Ubicación**: Crear `src/shared/utils/errorHandler.ts`

**Archivos a actualizar**: Todos los componentes con try-catch

**Timeline**: 1 día

---

#### 1.3 Normalizar API Responses

```typescript
// Crear normalizers para respuestas inconsistentes
src/shared/utils/apiNormalizers.ts

export const normalizePaginatedResponse = (data: any) => {
  if (Array.isArray(data)) {
    return { results: data, count: data.length, next: null, previous: null };
  }
  return data;
};
```

**Timeline**: 1 día

---

### FASE 2: Refactoring de Componentes (3-4 días)

#### 2.1 Refactorizar EstructuraOrganizacional

**Problema**: 254 líneas, estilos inline

**Plan**:
```
EstructuraOrganizacional.tsx (Main)
├── OrganizationalHeader.tsx
├── OrganizationalContent.tsx
├── OrganizationalControls.tsx
└── styles.ts (color schemes)
```

**Timeline**: 1 día

---

#### 2.2 Refactorizar DashboardPage

**Plan**:
```
DashboardPage.tsx (Main)
├── DashboardFilters.tsx
├── DashboardGrid.tsx
├── DashboardCharts.tsx (wrapper)
└── SummarySection.tsx
```

**Timeline**: 1 día

---

#### 2.3 Refactorizar HabilitacionPage

**Problema**: 600+ líneas

**Plan**: Dividir por sección funcional

```
HabilitacionPage.tsx (Main)
├── HabilitacionFilters.tsx
├── ServiciosList.tsx
├── PrestadorsList.tsx
├── HabilitacionModals.tsx
└── HabilitacionStats.tsx
```

**Timeline**: 2 días

---

#### 2.4 Centralizar Utility Functions

**Crear en `shared/utils/`**:

```typescript
// dataFormatting.ts
export const formatDate = (date: Date) => {...};
export const sortByDate = (items: any[]) => {...};
export const groupByCategory = (items: any[]) => {...};

// validation.ts
export const validateEmail = (email: string) => {...};
export const validatePhone = (phone: string) => {...};

// pagination.ts
export const createPaginationMetadata = (page: number, pageSize: number, total: number) => {...};
```

**Timeline**: 0.5 días

---

### FASE 3: Memoization y Performance (2-3 días)

#### 3.1 Aplicar React.memo

```typescript
// Para componentes de presentación pura
export default React.memo(IndicatorCard);
```

**Componentes a optimizar**:
- [ ] SummaryCards
- [ ] IndicatorCard (si existe)
- [ ] EventoCard
- [ ] NotiBadge
- [ ] [ ] +15 more

**Timeline**: 1.5 días

---

#### 3.2 Aplicar useMemo

```typescript
// Para datos derivados costosos
const processedData = useMemo(() => {
  return data.filter(...).sort(...).map(...);
}, [data]);
```

**Ubicaciones**:
- [ ] DashboardPage (filteredData)
- [ ] IndicatorTable (sorting)
- [ ] MenuPage (varios useMemo)

**Timeline**: 0.5 días

---

#### 3.3 Aplicar useCallback

```typescript
// Para event handlers
const handleSelect = useCallback((id: number) => {
  setSelected(id);
}, []);
```

**Ubicaciones**: Todos los event handlers

**Timeline**: 1 día

---

### FASE 4: Component Centralization (1-2 días)

#### 4.1 Crear Componentes Centralizados

**Paginación Centralizada**:
```typescript
// src/shared/components/Pagination.tsx
export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  // Lógica centralizada
};
```

**Ubicación**: `src/shared/components/`

**Componentes a crear**:
- [ ] Pagination
- [ ] FilterBar
- [ ] SortSelector
- [ ] FormField (wrapper)
- [ ] DataTableHeader
- [ ] StatusBadge

**Timeline**: 1.5 días

---

### FASE 5: Testing Infrastructure (5-7 días)

#### 5.1 Setup Infraestructura de Testing

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Archivos a crear**:
- `jest.config.ts`
- `setupTests.ts`
- `vitest.config.ts` (alternativa)

**Timeline**: 0.5 días

---

#### 5.2 Unit Tests para Shared Utils

```typescript
// src/shared/utils/__tests__/dateUtils.test.ts
describe('dateUtils', () => {
  it('should format date correctly', () => {
    expect(formatDate(new Date())).toBeDefined();
  });
});
```

**Target**: 80%+ coverage

**Timeline**: 2 días

---

#### 5.3 Component Tests

```typescript
// src/shared/components/__tests__/Button.test.tsx
describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

**Target**: 15+ componentes

**Timeline**: 2 días

---

#### 5.4 Hook Tests

```typescript
// src/apps/indicadores/presentation/hooks/__tests__/useIndicators.test.ts
describe('useIndicators', () => {
  it('should fetch indicators on mount', async () => {
    const { result } = renderHook(() => useIndicators());
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

**Timeline**: 2 días

---

### FASE 6: Documentation (2-3 días)

#### 6.1 Storybook Setup

```bash
npx storybook init --template react --builder vite
```

**Historias para crear**:
- [ ] shared/components/* (6 componentes)
- [ ] habilitacion/components/* (~20 componentes)
- [ ] indicadores/components/* (~10 componentes)

**Timeline**: 1.5 días

---

#### 6.2 API Integration Docs

```markdown
# API Integration Guide

## Indicadores Endpoint

### GET /api/indicators/

**Response**:
```json
{
  "count": 10,
  "results": [...]
}
```

**Frontend Implementation**:
```typescript
const { data, loading } = useIndicators();
```
```

**Timeline**: 1 día

---

#### 6.3 Component API Docs

```typescript
/**
 * Button component
 * @param {string} variant - 'primary' | 'secondary' | 'danger'
 * @param {boolean} loading - Show loading state
 * @param {() => void} onClick - Button click handler
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({ ... }) => {
  ...
};
```

**Timeline**: 0.5 días

---

### FASE 7: Feature Enhancements (Opcional)

#### 7.1 Search Y Filter Avanzado

```typescript
// src/shared/components/AdvancedFilter.tsx
// Multi-field search con debounce
// Predicados de filtro reutilizables
```

**Timeline**: 2 días

---

#### 7.2 Exportación de Reportes

```typescript
// src/shared/utils/exporters.ts
export const exportToCSV = (data: any[]) => {...};
export const exportToPDF = (data: any[]) => {...};
export const exportToXLSX = (data: any[]) => {...};
```

**Timeline**: 1-2 días

---

#### 7.3 Notificaciones en Tiempo Real

```typescript
// WebSocket o Server-Sent Events
src/shared/hooks/useNotifications.ts
```

**Timeline**: 2-3 días

---

### FASE 8: Security Improvements (1-2 días)

#### 8.1 Input Validation

```typescript
// src/shared/validators/index.ts
export const validators = {
  email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone: string) => /^\+?[\d\s-()]+$/.test(phone),
  password: (pwd: string) => pwd.length >= 8 && /[A-Z]/.test(pwd),
};
```

**Timeline**: 0.5 días

---

#### 8.2 CSRF Protection

```typescript
// Asegurar headers CSRF en axios interceptor
axiosInstance.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});
```

**Timeline**: 0.5 días

---

#### 8.3 XSS Prevention

```typescript
// Usar DOMPurify para content dinámico
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(html)}} />
```

**Timeline**: 0.5 días

---

## 📊 TIMELINE CONSOLIDADO

```
┌─────────────────────────────────────────────────────────────────┐
│ PLAN DE MEJORA - TIMELINE TOTAL                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ FASE 1: Correcciones Críticas              [███] 3-4 días      │
│ FASE 2: Refactoring Componentes            [████] 4-5 días     │
│ FASE 3: Performance & Memoization          [███] 2-3 días      │
│ FASE 4: Componentes Centralizados          [██] 1-2 días       │
│ FASE 5: Testing Infrastructure             [████] 5-7 días     │
│ FASE 6: Documentation & Storybook          [███] 2-3 días      │
│ FASE 7: Feature Enhancements (Opt)         [███] 4-7 días      │
│ FASE 8: Security Improvements              [██] 1-2 días       │
│                                                                 │
│ TOTAL (Crítico + Core):  ~20 días                               │
│ TOTAL (Con Enhancements):  ~30-35 días                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 PRIORIDADES RECOMENDADAS

### 🔴 CRÍTICO (Hacer ahora)
1. Completar SoportesPage TODOs
2. Standardizar error handling
3. Fix API response normalization

### 🟠 IMPORTANTE (Semana 1)
4. Refactorizar componentes monolíticos
5. Centralizar utility functions
6. Implementar React.memo/useMemo/useCallback

### 🟡 DESEABLE (Semana 2-3)
7. Setup testing infrastructure
8. Crear componentes centralizados
9. Documentación y Storybook

### 🟢 OPCIONAL (Cuando haya tiempo)
10. Feature enhancements (search, export, etc.)
11. Real-time notifications
12. Advanced security features

---

## 📝 PRÓXIMOS PASOS

### Inmediatos (Hoy)
- [ ] Revisar este plan con el equipo
- [ ] Asignar responsables por fase
- [ ] Crear issues en repositorio

### Este Sprint (Semana)
- [ ] FASE 1: Correcciones críticas
- [ ] FASE 2: Refactoring (inicio)
- [ ] FASE 3: Performance (inicio)

### Próximo Sprint
- [ ] Completar FASE 2 y 3
- [ ] FASE 4 y 5: Componentes y Testing
- [ ] FASE 6: Documentation

---

## 📚 DOCUMENTOS REFERENCIA

Los siguientes documentos fueron consultados:
- ✅ `README.md` - Descripción general
- ✅ `architecture.md` - Arquitectura del sistema
- ✅ `architecture_backend_API.md` - Backend API
- ✅ `agents.md` - Responsabilidades del equipo
- ✅ `package.json` - Stack tecnológico
- ✅ Audit reports en habilitacion/
- ✅ Código fuente de 7 módulos

---

**Documento generado**: 9 de Abril, 2026  
**Status**: ✅ Exploración completada  
**Siguiente**: Presentación del plan al equipo

