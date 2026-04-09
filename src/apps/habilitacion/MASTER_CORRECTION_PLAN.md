# 🎯 MASTER PLAN - CORRECCIÓN COMPLETA APP HABILITACIÓN

**Fecha Inicio**: April 9, 2026  
**Estado**: 🟢 READY TO START  
**Quality Baseline**: 9.2/10 (domain/types + entities ✅)  
**Target Quality**: 9.8/10  

---

## 📊 ESTADO ACTUAL

### ✅ YA COMPLETADO (Do not redo!)
- **Domain Layer** ✅ 
  - Entities: 11 files (9 core + SoporteDocumental with 4 models)
  - Types: 6 files (all with helpers + colors + icons)
  - Repositories: **Interfaces defined, need implementations**
  
- **Documentation** ✅
  - ENTITY_ALIGNMENT_ANALYSIS.md (15 pages)
  - IMPLEMENTATION_PLAN.md (7 pages)
  - QUICK_REFERENCE.md (8 pages)
  - COMPLETION_SUMMARY.md (8 pages)

### ❌ FALTA IMPLEMENTAR (This plan)
- **Application Layer**: 0/9 services created
- **Infrastructure Layer**: 0/3 repository implementations + HTTP services
- **Presentation Layer**: Hooks need completion + components need audit
- **Integration**: End-to-end validation missing

### 🏗️ ARCHITECTURE STACK
```
habilitacion/
├── domain/              ✅ COMPLETE
│   ├── entities/        ✅ 11 files
│   ├── types/           ✅ 6 files  
│   └── repositories/    ⏳ Interfaces only
├── application/         ❌ 0/9 services
├── infrastructure/      ⏳ 0/3 implementations
└── presentation/        ⏳ Partial (needs audit)
    ├── hooks/
    ├── components/
    ├── pages/
    └── utils/
```

---

## 🎯 PHASE 0: PRE-IMPLEMENTATION VALIDATION (⏱️ 1-2 hours)

**Goal**: Ensure all domain layer is production-ready

### 0.1 Audit Existing Repositories/Interfaces
**Location**: `src/apps/habilitacion/domain/repositories/`

**Files to audit/create**:
```typescript
// Interfaces that need implementations
IDatosPrestadorRepository.ts
IServicioSedeRepository.ts
IAutoevaluacionRepository.ts
ICumplimientoRepository.ts
ICriterioRepository.ts
IEstandarRepository.ts
IPlanMejoraRepository.ts
IHallazgoRepository.ts

// NEW for Soportes
ISoporteRepository.ts (covers all 4 models)
ITipoDocumentoSoporteRepository.ts
ISoporteRequeridoRepository.ts
```

**Checklist**:
- [ ] Each interface has CRUD methods (create, read, update, delete, list)
- [ ] Pagination support (limit, offset, total_count)
- [ ] Filtering support (relevant fields)
- [ ] Sorting support
- [ ] Include related entities (FK resolution)
- [ ] Error handling types

### 0.2 Update Domain Entity Files (Minor Additions)

**Entities needing final touches**:

1. **DatosPrestador.ts** - Add missing backend fields
   ```diff
   + sede_principal?: boolean;
   + aseguradora_pep?: string;
   + numero_poliza?: string;
   + vigencia_poliza?: string;
   + fecha_inscripcion?: string;
   + fecha_renovacion?: string;
   + usuario_responsable_id?: number;
   ```

2. **Cumplimiento.ts** - Add soporte/hallazgo tracking
   ```diff
   + soportes?: SoporteDocumental[];
   + documentos?: SoporteDocumental[];
   + hallazgo?: string;
   + plan_mejora?: string;
   + responsable_mejora_id?: number;
   + fecha_compromiso?: string;
   ```

3. **PlanMejora.ts** - Add full tracking fields
   ```diff
   + cumplimiento_id?: number;
   + autoevaluacion_id?: number;
   + criterio_id?: number;
   + estado_cumplimiento_actual?: string;
   + objetivo_mejorado?: string;
   + acciones_implementar?: string;
   + responsable_id?: number;
   + fecha_inicio?: string;
   + fecha_implementacion?: string;
   + evidencia?: string;
   ```

**Time**: 30-45 minutes

---

## 🔧 PHASE 1: APPLICATION LAYER - SERVICES (⏱️ 3-4 hours)

**Goal**: Create business logic & API integration layer

### 1.1 Create Base Service Class

**File**: `src/apps/habilitacion/application/services/BaseHabilitacionService.ts`

```typescript
export abstract class BaseHabilitacionService<T> {
  protected repository: IRepository<T>;
  
  // Common methods
  async getAll(filters?: any): Promise<PaginatedResponse<T>>;
  async getById(id: number): Promise<T>;
  async create(data: any): Promise<T>;
  async update(id: number, data: any): Promise<T>;
  async delete(id: number): Promise<void>;
  
  // Error handling
  protected handleError(error: any): never;
  protected validateInput(data: any): void;
}
```

### 1.2 Create Core Services (9 files)

| Service | Methods | Priority |
|---------|---------|----------|
| **DatosPrestadorService** | CRUD + getByCompany + getExpiring | 🔴 CRITICAL |
| **ServicioSedeService** | CRUD + getByPrestador + getProximosAVencer | 🔴 CRITICAL |
| **AutoevaluacionService** | CRUD + getByPrestador + getByPeriodo | 🟡 HIGH |
| **CumplimientoService** | CRUD + getCriteriosStatus + getUnmet | 🟡 HIGH |
| **CriterioService** | getByEstandar + search + filter | 🟡 HIGH |
| **EstandarService** | getAll + getWithCriterios | 🟢 MEDIUM |
| **PlanMejoraService** | CRUD + getByOrigen + getEstadoCumplimiento | 🟢 MEDIUM |
| **HallazgoService** | CRUD + getBySeveridad + getByEstado | 🟢 MEDIUM |
| **🆕 SoporteService** | CRUD (all 4 models) + getByNivel + search | 🔴 CRITICAL |

### 1.3 Service Implementation Pattern

```typescript
export class DatosPrestadorService extends BaseHabilitacionService<DatosPrestador> {
  private repository: IDatosPrestadorRepository;
  
  // Constructor
  constructor() {
    this.repository = new DatosPrestadorRepository();
  }
  
  // Specific methods
  async getExpiring(days: number = 90): Promise<DatosPrestador[]>;
  async getByCompany(companyId: number): Promise<PaginatedResponse<DatosPrestador>>;
  async validateRenovacion(id: number): Promise<boolean>;
  async calculateDaysToExpire(fechaVencimiento: string): Promise<number>;
}
```

**Time per service**: 20-30 minutes
**Total time**: 3-4 hours

---

## 🪝 PHASE 2: PRESENTATION LAYER - HOOKS (⏱️ 2-3 hours)

**Goal**: State management & async data handling

### 2.1 Hook Architecture Pattern

```typescript
export const useEntity = () => {
  // State
  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  
  // Effects
  useEffect(() => { fetchAll(); }, []);
  
  // CRUD operations
  const fetchAll = async (filters?) => { /* ... */ };
  const fetchById = async (id: number) => { /* ... */ };
  const create = async (data: any) => { /* ... */ };
  const update = async (id: number, data: any) => { /* ... */ };
  const delete = async (id: number) => { /* ... */ };
  
  // Computed
  const hasError = !!error;
  const isEmpty = items.length === 0;
  
  return { items, loading, error, pagination, fetchAll, fetchById, create, update, delete };
};
```

### 2.2 Hooks to Create (9 files)

| Hook | Features | Priority |
|------|----------|----------|
| **useDatosPrestador** | CRUD + expiring filter + company link | 🔴 CRITICAL |
| **useServicioSede** | CRUD + prestador link + renewal tracking | 🔴 CRITICAL |
| **useAutoevaluacion** | CRUD + period tracking + version mgmt | 🟡 HIGH |
| **useCumplimiento** | CRUD + criteria tracking + evidencia link | 🟡 HIGH |
| **useCriterio** | Search + filter + estandar link | 🟢 MEDIUM |
| **useEstandar** | List + filter + criteria expand | 🟢 MEDIUM |
| **usePlanMejora** | CRUD + status tracking + timeline | 🟢 MEDIUM |
| **useHallazgo** | CRUD + severity filter + estado tracking | 🟢 MEDIUM |
| **🆕 useSoportes** | Upload + versioning + multi-level + checklist | 🔴 CRITICAL |

**Time per hook**: 15-20 minutes
**Total time**: 2-3 hours

---

## 🎨 PHASE 3: PRESENTATION LAYER - COMPONENTS (⏱️ 4-6 hours)

**Goal**: UI components for data display & interaction

### 3.1 Component Inventory

#### 3.1.1 Pages (Location: `presentation/pages/`)

| Page | Status | Components Used | Priority |
|------|--------|-----------------|----------|
| **PrestadoresPage** | ⏳ Create | Table + Form Modal + Filter | 🔴 |
| **ServiciosPage** | ⏳ Create | Table + Form Modal + Filter | 🔴 |
| **AutoevaluacionPage** | ⏳ Create | Timeline + Form + Status | 🟡 |
| **CumplimientoPage** | ⏳ Create | Matrix Grid + Status + Evidence | 🟡 |
| **PlanesPage** | ⏳ Create | Kanban/List + Timeline + Progress | 🟡 |
| **HallazgosPage** | ⏳ Create | List + Filter + Severity Badge | 🟢 |
| **🆕 SoportesPage** | ⏳ Create | Uploader + Checklist + Versions | 🔴 |

#### 3.1.2 Reusable Components (Location: `presentation/components/`)

| Component | Purpose | Status |
|-----------|---------|--------|
| **Cards** | Display entity summary | ⏳ Audit/Create |
| PrestadorCard | Prestador info with actions | ⏳ |
| ServicioCard | Service with expiry indicator | ⏳ |
| PlanMejoraCard | Plan status tracker | ⏳ |
| HallazgoCard | Finding with severity badge | ⏳ |
| **Tables** | Data list display | ⏳ |
| EntityTable | Generic table with sort/filter | ⏳ |
| PaginationControls | Page navigation | ⏳ |
| **Modals** | Create/Edit dialogs | ⏳ |
| EntityFormModal | Generic create/edit modal | ⏳ |
| CumplimientoModal | Detailed form for cumplimiento | ⏳ |
| SoporteUploadModal | Document upload wizard | ⏳ |
| **Shared** | Common UI patterns | ⏳ |
| StatusBadge | State display with color | ⏳ |
| EstadoBadge | Status specific badge | ⏳ |
| DateRangeFilter | Date range selector | ⏳ |
| MultiSelect | Advanced filtering | ⏳ |
| **Soportes** | Document management | ⏳ |
| SoporteCard | Document display | ⏳ |
| SoporteUploader | File upload with progress | ⏳ |
| SoporteVersionHistory | Version management | ⏳ |
| SoporteRequeridoChecklist | Required docs tracker | ⏳ |

### 3.2 Component Creation Priority

**Wave 1 (Critical)** - 2 hours
1. StatusBadge + EstadoBadge (reusable styling)
2. EntityFormModal (generic pattern)
3. PrestadorCard + ServicioCard (quick wins)

**Wave 2 (High)** - 2 hours
4. PrestadoresPage + ServiciosPage (CRUD pages)
5. EntityTable + PaginationControls (data display)

**Wave 3 (Medium)** - 2 hours
6. Soportes components (upload, checklist, versions)
7. PlanesPage + CumplimientoPage (complex UX)

**Time**: 4-6 hours total

---

## 🧪 PHASE 4: INFRASTRUCTURE LAYER & INTEGRATION (⏱️ 2-3 hours)

**Goal**: API integration & end-to-end connectivity

### 4.1 API Repository Implementations

**Location**: `src/apps/habilitacion/infrastructure/repositories/`

```typescript
// Create implementations for each interface
DatosPrestadorRepository implements IDatosPrestadorRepository
ServicioSedeRepository implements IServicioSedeRepository
AutoevaluacionRepository implements IAutoevaluacionRepository
CumplimientoRepository implements ICumplimientoRepository
CriterioRepository implements ICriterioRepository
EstandarRepository implements IEstandarRepository
PlanMejoraRepository implements IPlanMejoraRepository
HallazgoRepository implements IHallazgoRepository
SoporteRepository implements ISoporteRepository
```

### 4.2 HTTP Service Methods

**Pattern**:
```typescript
export class HabilitacionApiService {
  private baseUrl = '/api/habilitacion';
  
  // DatosPrestador
  async getDatosPrestadores(filters?: any): Promise<PaginatedResponse<DatosPrestador>>;
  async getDatosPrestador(id: number): Promise<DatosPrestador>;
  async createDatosPrestador(data: any): Promise<DatosPrestador>;
  async updateDatosPrestador(id: number, data: any): Promise<DatosPrestador>;
  async deleteDatosPrestador(id: number): Promise<void>;
  
  // Advanced queries
  async getDatosExpiring(days: number): Promise<DatosPrestador[]>;
  async getDatosByCompany(companyId: number): Promise<DatosPrestador[]>;
  
  // ... etc for other entities
}
```

### 4.3 Integration Checklist

- [ ] API endpoints exist and respond correctly
- [ ] Field mappings (snake_case ↔ camelCase) work
- [ ] Pagination works (limit, offset, total)
- [ ] Filtering works per entity
- [ ] Sorting works (if required)
- [ ] Error responses handled
- [ ] Loading states display correctly
- [ ] Computed fields calculated properly
- [ ] Foreign key relationships resolve
- [ ] File uploads work (for soportes)
- [ ] Auto-versioning works (for soportes)
- [ ] Multi-level validation works (for soportes)

**Time**: 2-3 hours

---

## 🧪 PHASE 5: TESTING & VALIDATION (⏱️ 2-3 hours)

**Goal**: Ensure everything works end-to-end

### 5.1 Unit Tests

**Coverage target**: 85%+

```typescript
// Services
DatosPrestadorService.test.ts     // CRUD + filters
ServicioSedeService.test.ts       // CRUD + relationships
// ... etc

// Hooks
useDatosPrestador.test.ts         // State + async
useServicioSede.test.ts           // State + filters
// ... etc

// Utils
dataHelpers.test.ts               // Transformations
validations.test.ts               // Input validation
```

### 5.2 Integration Tests

```typescript
// End-to-end flows
habilitacion-flow.e2e.ts
- Create prestador
- Add service (FK)
- Start autoevaluacion
- Fill cumplimiento with evidence
- Create plan mejora if needed
- Upload soportes
- Verify everything persists
```

### 5.3 Manual QA Checklist

- [ ] Create new DatosPrestador
- [ ] Add multiple ServiciosSede
- [ ] Start Autoevaluacion
- [ ] Fill Criterios in Cumplimiento
- [ ] Upload Soportes (test versioning)
- [ ] Create PlanMejora from hallazgo
- [ ] Verify dates/calculations
- [ ] Test filters & searches
- [ ] Test pagination
- [ ] Test error states

**Time**: 2-3 hours

---

## 📅 TIMELINE & PRIORITIES

### IMMEDIATE (This week)
```
Phase 0: Pre-implementation (1-2h) - START THIS NOW
Phase 1: Services (3-4h)
├── Critical services first (DatosPrestador, ServicioSede, Soportes)
└── Then remaining services

Phase 2: Hooks (2-3h)
└── Parallel with Phase 1 after services ready
```

### SHORT TERM (Next week)
```
Phase 3: Components (4-6h)
├── Wave 1: Cards + Modals (2h)
├── Wave 2: Pages (2h)
└── Wave 3: Soportes components (2h)

Phase 4: Integration (2-3h)
└── After all components ready
```

### MEDIUM TERM (Following week)
```
Phase 5: Testing (2-3h)
└── Final validation

Quality improvements:
9.2 → 9.5 (phase 0-1)
9.5 → 9.7 (phase 2-3)
9.7 → 9.8+ (phase 4-5)
```

---

## 🎁 DELIVERABLES BY PHASE

### Phase 0 ✅
- [ ] All repository interfaces updated
- [ ] All entity files with final fields
- [ ] README con instrucciones

### Phase 1 ✅
- [ ] 9 service files created
- [ ] All CRUD operations working
- [ ] Complex filters implemented
- [ ] API integration complete

### Phase 2 ✅
- [ ] 9 custom hooks created
- [ ] State management working
- [ ] Error handling in place
- [ ] Loading states working

### Phase 3 ✅
- [ ] 7 pages created
- [ ] ~15 reusable components created
- [ ] All CRUD UIs working
- [ ] Responsive design

### Phase 4 ✅
- [ ] All repositories implemented
- [ ] HTTP services complete
- [ ] End-to-end integration working

### Phase 5 ✅
- [ ] Test suite with 85%+ coverage
- [ ] E2E flows validated
- [ ] QA checklist passed
- [ ] Production ready

---

## 🚀 NEXT IMMEDIATE STEPS

### ✅ DO THIS NOW (Phase 0)

1. **Audit current repository interfaces**
   ```bash
   ls src/apps/habilitacion/domain/repositories/
   ```

2. **Update entity files with final fields**
   - DatosPrestador.ts (+7 fields)
   - Cumplimiento.ts (+5 fields)
   - PlanMejora.ts (+8 fields)

3. **Create repository interfaces for Soportes**
   - ISoporteRepository.ts
   - ITipoDocumentoSoporteRepository.ts
   - ISoporteRequeridoRepository.ts

4. **Document endpoints needed**
   - Map each service method to backend endpoint
   - Verify endpoints exist in backend

---

## 📊 SUCCESS METRICS

| Metric | Target | Status |
|--------|--------|--------|
| Code Coverage | 85%+ | ⏳ |
| Type Safety | 100% | ⏳ |
| Services Created | 9/9 | 0/9 |
| Hooks Created | 9/9 | 0/9 |
| Components Created | 15/15 | 0/15 |
| End-to-end flows | 100% working | ⏳ |
| Performance | <200ms queries | ⏳ |
| Uptime | 99.9%+ | ⏳ |

---

## 📞 DECISION POINTS

1. **Mock data during development?**
   - ✅ Yes (Phase 1-2) → Switch to real API Phase 3+
   
2. **Monolithic or feature-based folder structure for components?**
   - ✅ Feature-based: `components/DatosPrestador/`, `components/Soportes/`, etc.

3. **Global state (Redux) or context API?**
   - ✅ Hooks + Context (keep it light)

4. **API error handling strategy?**
   - ✅ Try-catch + custom error types + user-friendly messages

---

**Ready to start? Let's begin with Phase 0!**
