# 🚀 PHASE 7 - UI COMPONENTS GENERATION PLAN

**Status**: Ready to Commence  
**Date**: 2026-04-09  
**Module**: Habilitación  

---

## 📋 PHASE 7 OBJECTIVES

Crear componentes de UI reutilizables para cada una de las 9 entidades del módulo Habilitación.

### Success Criteria

- [ ] 9+ componentes CRUD por entidad (Create, Read, Update, Delete)
- [ ] Integración con hooks existentes (useSoporte, useDatosPrestador, etc.)
- [ ] Validación de formularios en cliente
- [ ] Error handling y loading states
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] Tests para cada componente
- [ ] TypeScript sin errores
- [ ] Storybook documentation

---

## 📦 COMPONENT ARCHITECTURE

### Estándar por Entidad

```
src/apps/habilitacion/presentation/components/{Entity}/
├── {Entity}List.tsx           # Listado con tabla
├── {Entity}Card.tsx           # Tarjeta de vista previa
├── {Entity}Form.tsx           # Formulario reutilizable
├── {Entity}Modal.tsx          # Modal para crear/editar
├── {Entity}Detail.tsx         # Vista detallada
├── {Entity}Actions.tsx        # Acciones (delete, archive, etc)
├── {Entity}Filter.tsx         # Filtros avanzados
├── {Entity}Search.tsx         # Búsqueda
├── {Entity}Validation.ts      # Esquemas de validación (Zod/Yup)
├── index.ts                   # Exports
└── {Entity}.stories.tsx       # Storybook stories
```

### Componentes Globales Reutilizables

```
src/apps/habilitacion/presentation/components/common/
├── DataTable.tsx              # Tabla genérica
├── FormField.tsx              # Campo de formulario
├── Modal.tsx                  # Modal base
├── Card.tsx                   # Card base
├── Badge.tsx                  # Estados visibles
├── LoadingSpinner.tsx
├── EmptyState.tsx
├── ErrorBoundary.tsx
└── index.ts
```

---

## 🛠️ COMPONENT TEMPLATES

### Template 1: List Component

```typescript
// DatosPrestadorList.tsx
import React, { useEffect } from 'react';
import { useDatosPrestador } from '../../hooks';
import { DataTable } from '../common';
import { DatosPrestadorActions } from './DatosPrestadorActions';

interface DatosPrestadorListProps {
  onSelect?: (prestador: DatosPrestador) => void;
  filters?: DatosPrestadorFilters;
}

export const DatosPrestadorList: React.FC<DatosPrestadorListProps> = ({
  onSelect,
  filters,
}) => {
  const { data, loading, error, fetchDatosPrestadores } = useDatosPrestador();

  useEffect(() => {
    fetchDatosPrestadores(filters);
  }, [filters]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!data.length) return <EmptyState />;

  return (
    <div className="datos-prestador-list">
      <DataTable
        data={data}
        columns={[
          { key: 'razon_social', label: 'Razón Social' },
          { key: 'nit', label: 'NIT' },
          { key: 'estado', label: 'Estado' },
          { key: 'actions', label: '', render: (row) => 
            <DatosPrestadorActions 
              prestador={row} 
              onSelect={onSelect}
            />
          },
        ]}
      />
    </div>
  );
};
```

### Template 2: Form Component

```typescript
// DatosPrestadorForm.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatosPrestadorSchema } from './DatosPrestadorValidation';

interface DatosPrestadorFormProps {
  initialData?: DatosPrestador;
  onSubmit: (data: DatosPrestadorCreate) => Promise<void>;
  loading?: boolean;
}

export const DatosPrestadorForm: React.FC<DatosPrestadorFormProps> = ({
  initialData,
  onSubmit,
  loading,
}) => {
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(DatosPrestadorSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="datos-prestador-form">
      <Controller
        name="razon_social"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormField
            label="Razón Social"
            error={error?.message}
            {...field}
          />
        )}
      />
      
      {/* More fields... */}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
};
```

### Template 3: Modal Component

```typescript
// DatosPrestadorModal.tsx
import React, { useState } from 'react';
import { DatosPrestadorForm } from './DatosPrestadorForm';
import { useDatosPrestador } from '../../hooks';

interface DatosPrestadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  prestador?: DatosPrestador;
}

export const DatosPrestadorModal: React.FC<DatosPrestadorModalProps> = ({
  isOpen,
  onClose,
  prestador,
}) => {
  const { createDatosPrestador, updateDatosPrestador } = useDatosPrestador();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: DatosPrestadorCreate) => {
    setLoading(true);
    try {
      if (prestador?.id) {
        await updateDatosPrestador(prestador.id, data);
      } else {
        await createDatosPrestador(data);
      }
      onClose();
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        {prestador ? 'Editar' : 'Crear'} Prestador
      </Modal.Header>
      <Modal.Body>
        <DatosPrestadorForm
          initialData={prestador}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Modal.Body>
    </Modal>
  );
};
```

---

## 📊 DELIVERABLES BY ENTITY

### Entity: DatosPrestador

| Component | Type | Status | Tests | Priority |
|-----------|------|--------|-------|----------|
| DatosPrestadorList | List | ⏳ | ⏳ | 🔴 High |
| DatosPrestadorCard | Display | ⏳ | ⏳ | 🟡 Medium |
| DatosPrestadorForm | Form | ⏳ | ⏳ | 🔴 High |
| DatosPrestadorModal | Modal | ⏳ | ⏳ | 🔴 High |
| DatosPrestadorDetail | Detail | ⏳ | ⏳ | 🟡 Medium |
| DatosPrestadorValidation | Schema | ⏳ | ⏳ | 🟡 Medium |

### Entity: ServicioSede

| Component | Type | Status | Tests | Priority |
|-----------|------|--------|-------|----------|
| ServicioSedeList | List | ⏳ | ⏳ | 🔴 High |
| ServicioSedeCard | Display | ⏳ | ⏳ | 🟡 Medium |
| ServicioSedeForm | Form | ⏳ | ⏳ | 🔴 High |
| ServicioSedeModal | Modal | ⏳ | ⏳ | 🔴 High |
| ServicioSedeDetail | Detail | ⏳ | ⏳ | 🟡 Medium |
| ServicioSedeValidation | Schema | ⏳ | ⏳ | 🟡 Medium |

### Entity: SoporteDocumental

| Component | Type | Status | Tests | Priority |
|-----------|------|--------|-------|----------|
| SoporteCard | Display | ✅ DONE | ✅ | 🔴 |
| SoporteUploadModal | Modal | ✅ DONE | ✅ | 🔴 |
| SoporteChecklist | List | ✅ DONE | ✅ | 🔴 |
| SoporteExpiration | Alert | ✅ DONE | ✅ | 🔴 |
| SoporteCategories | Filter | ✅ DONE | ✅ | 🔴 |
| SoporteValidation | Schema | ✅ DONE | ✅ | 🔴 |

### Entities: Autoevaluacion, Cumplimiento, Criterio, Estandar, PlanMejora, Hallazgo

| Component | Type | Status | Tests | Priority |
|-----------|------|--------|-------|----------|
| {Entity}List | List | ⏳ | ⏳ | 🟡 Medium |
| {Entity}Card | Display | ⏳ | ⏳ | 🟡 Medium |
| {Entity}Form | Form | ⏳ | ⏳ | 🟡 Medium |
| {Entity}Modal | Modal | ⏳ | ⏳ | 🟡 Medium |
| {Entity}Validation | Schema | ⏳ | ⏳ | 🟡 Medium |

---

## ✅ CHECKLIST PARA CADA COMPONENTE

### Code Quality

- [ ] TypeScript: Sin errores `tsc`
- [ ] Linting: Pasa `eslint`
- [ ] Formatting: Cumple `prettier`
- [ ] No `any` types
- [ ] Proper typing for props

### Functionality

- [ ] Componente renderiza sin errores
- [ ] Props validadas correctamente
- [ ] Event handlers funcionan
- [ ] Integraciones de hooks correctas
- [ ] Error states manejados

### UI/UX

- [ ] Diseño sigue sistema de componentes
- [ ] Responsive: Mobile, Tablet, Desktop
- [ ] Loading states visibles
- [ ] Empty states definidos
- [ ] Error messages claros

### Accessibility

- [ ] ARIA labels presentes
- [ ] Keyboard navigation funciona
- [ ] Color contrast ≥ 4.5:1
- [ ] Focus indicators visibles
- [ ] Semantic HTML utilizado

### Testing

- [ ] Unit tests creadas
- [ ] Integration tests para hooks
- [ ] Snapshot tests (si aplica)
- [ ] Coverage ≥ 80%
- [ ] Casos edge cubiertos

### Documentation

- [ ] JSDoc comments
- [ ] Props documentadas
- [ ] Examples incluidos
- [ ] Storybook stories
- [ ] README actualizado

---

## 🎨 DESIGN SYSTEM INTEGRATION

### Colores
```typescript
const colors = {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  estado_habilitado: '#10B981',
  estado_en_proceso: '#F59E0B',
  estado_suspendido: '#EF4444',
};
```

### Componentes Base Requeridos

```typescript
// Button variations
<Button variant="primary">Crear</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="danger">Eliminar</Button>

// Input variations
<Input type="text" placeholder="Buscar..." />
<Input.Password />
<Input.Select options={options} />

// Badge for estados
<Badge status="habilitado">Habilitado</Badge>
<Badge status="en_proceso">En Proceso</Badge>
```

---

## 📱 RESPONSIVE BREAKPOINTS

```scss
// Mobile-first approach
$screen-xs: 320px;    // min
$screen-sm: 640px;    // tablet
$screen-md: 1024px;   // desktop
$screen-lg: 1280px;   // large desktop
$screen-xl: 1920px;   // very large
```

---

## 🧪 TESTING STRATEGY

### Unit Tests (Jest + React Testing Library)

```bash
npm run test:watch
```

### Integration Tests

```bash
npm run test:integration
```

### Visual Regression (Chromatic)

```bash
npm run chromatic
```

### E2E Tests (Cypress)

```bash
npm run cypress:open
```

---

## 📚 STORYBOOK SETUP

```bash
# Generate Storybook documentation
npm run storybook

# Build Storybook static site
npm run build-storybook
```

### Story Template

```typescript
// DatosPrestador.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DatosPrestadorList } from './DatosPrestadorList';

const meta = {
  title: 'Habilitación/DatosPrestador/List',
  component: DatosPrestadorList,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof DatosPrestadorList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prestadores: mockPrestadores,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    prestadores: [],
  },
};

export const WithError: Story = {
  args: {
    error: 'Error al cargar prestadores',
  },
};
```

---

## 🔄 WORKFLOW

### Step 1: Create Components Directory
```bash
mkdir -p src/apps/habilitacion/presentation/components/{Entity}
```

### Step 2: Generate Files from Template
```bash
# For each entity, create:
# - {Entity}List.tsx
# - {Entity}Card.tsx
# - {Entity}Form.tsx
# - {Entity}Modal.tsx
# - {Entity}Validation.ts
# - {Entity}.stories.tsx
```

### Step 3: Implement Components
- Start with List component (foundation)
- Add Card component (display)
- Create Form component (input)
- Build Modal wrapper (user interaction)
- Link to hooks

### Step 4: Validation Schemas
- Use `zod` for schema validation
- Define create/update schemas
- Type safety in forms

### Step 5: Tests
- Write unit tests for each component
- Mock hooks
- Test user interactions

### Step 6: Storybook
- Create stories for each component
- Test all variations
- Document usage

### Step 7: Integration
- Connect to pages
- Test with real hooks
- E2E testing

---

## 📅 TIMELINE ESTIMATE

| Phase | Duration | Components |
|-------|----------|-----------|
| DatosPrestador | 2 days | 6 |
| ServicioSede | 2 days | 6 |
| Autoevaluacion | 1.5 days | 5 |
| Cumplimiento | 1.5 days | 5 |
| Criterio | 1 day | 5 |
| Estandar | 1 day | 5 |
| PlanMejora | 1.5 days | 5 |
| Hallazgo | 1.5 days | 5 |
| SoporteDocumental | ✅ Done | 6 (Completed Phase 6) |
| **TOTAL** | **~13 days** | **~50+ components** |

---

## 🎯 SUCCESS METRICS

- ✅ All 8 entities have 6+ components each
- ✅ Components integrate with hooks
- ✅ 80%+ test coverage
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors
- ✅ Accessibility: 95+ score
- ✅ Performance: LCP < 2.5s
- ✅ Storybook: 50+ stories

---

## 🚀 NEXT STEPS

1. **Create Component Directory Structure** (30 min)
2. **Generate Shared Components** (3 days)
3. **Generate Entity Components** (13 days)
4. **Write Tests** (5 days)
5. **Storybook Documentation** (2 days)
6. **Integration with Pages** (3 days)
7. **E2E Testing** (2 days)

---

**Phase 7 Start Date**: After Phase 6.1 Audit Complete ✅  
**Estimated Completion**: ~28 days from start  
**Status**: Ready to Commence 🚀
