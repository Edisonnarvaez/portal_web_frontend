# 🔍 Entity Integration Validation Guide

## Overview

Este documento proporciona guía paso a paso para validar la integración automática de entidades del módulo Habilitación.

---

## Quick Start

### 1. Ejecutar Validación de Integración

```bash
# Instalar dependencias (si es necesario)
npm install

# Ejecutar validador de entidades
npx ts-node validate-entities.ts

# Ejecutar validador de tipos
npx ts-node validate-types.ts
```

---

## Validator Scripts

### Script 1: `validate-entities.ts`

**Propósito**: Verifica que todas las 9 entidades sigan el patrón Clean Architecture.

**Qué verifica**:
```
✅ Entity files exist (domain/entities/)
✅ Service files exist (application/services/)
✅ Repository files exist (infrastructure/repositories/)
✅ Repository interfaces exist (domain/repositories/)
✅ Hook files exist (presentation/hooks/)
✅ Entity exports in index.ts
✅ Service exports in index.ts
✅ Repository exports in index.ts
✅ Hook exports in index.ts
✅ Services extend BaseHabilitacionService
```

**Output esperado** (éxito):
```
✅ DatosPrestador           [10/10]
✅ ServicioSede             [10/10]
✅ SoporteDocumental        [10/10]
...
SUMMARY: 9/9 fully integrated [10/10 overall]
✅ All entities are properly integrated!
```

**Output esperado** (con problemas):
```
⚠️  ServicioSede             [7/10]
   ❌ Repository interface not found: .../I ServicioSedeRepository.ts
   ⚠️  Hook not exported in presentation/hooks/index.ts
   
❌ Hallazgo                 [3/10]
   ❌ Entity file not found: .../Hallazgo.ts
   ❌ Service file not found: .../HallagoService.ts
   ❌ Repository file not found: .../HallagoRepository.ts
   ...
```

**Acciones correctivas** (si encuentras errores):
1. Archivo entidad faltante → Crear `domain/entities/{Name}.ts`
2. Servicio faltante → Crear `application/services/{Name}Service.ts`
3. No extiende BaseService → Actualizar herencia
4. Exports faltantes → Agregar en `index.ts`

---

### Script 2: `validate-types.ts`

**Propósito**: Verifica alineación de tipos TypeScript con backend Django.

**Qué verifica**:
```
✅ Enum definitions match backend exactly
✅ Entity fields match backend schema
✅ Relationship types are correct
✅ Required fields are present
✅ Enum values match Django choices
```

**Backend Enums esperados**:
```typescript
ModalidadServicio: ['INTRAMURAL', 'AMBULATORIA', 'TELEMEDICINA', 'URGENCIAS', 'AMBULANCIA']
ComplejidadServicio: ['BAJA', 'MEDIA', 'ALTA']
EstadoHabilitacionServicio: ['HABILITADO', 'EN_PROCESO', 'SUSPENDIDO', 'NO_HABILITADO', 'CANCELADO']
EstadoHabilitacionPrestador: ['HABILITADA', 'EN_PROCESO', 'SUSPENDIDA', 'NO_HABILITADA', 'CANCELADA']
```

**Output esperado** (éxito):
```
✅ All types are correctly aligned!
```

**Output esperado** (con problemas):
```
🚨 CRITICAL ISSUES:
   [ModalidadServicio] Missing enum values: TELEMEDICINA in ModalidadServicio
   [ServicioSede] Entity file not found: .../ServicioSede.ts

⚠️  WARNING ISSUES:
   [ServicioSede] Missing relationship definition: soportes → SoporteDocumental
```

---

## Manual Verification Checklist

Si auto-validación es insuficiente, verificar manualmente:

### [ ] 1. Verificar Estructura de Directorios

```bash
# Cada entidad DEBE tener estos archivos:
src/apps/habilitacion/domain/entities/{Entity}.ts
src/apps/habilitacion/application/services/{Entity}Service.ts
src/apps/habilitacion/infrastructure/repositories/{Entity}Repository.ts
src/apps/habilitacion/domain/repositories/I{Entity}Repository.ts
src/apps/habilitacion/presentation/hooks/use{Entity}.ts
```

**Verificar comando**:
```bash
ls -la src/apps/habilitacion/domain/entities/
ls -la src/apps/habilitacion/application/services/
ls -la src/apps/habilitacion/infrastructure/repositories/
ls -la src/apps/habilitacion/presentation/hooks/
```

### [ ] 2. Verificar Exports en Index.ts

```bash
# Verificar que todas las entidades están exportadas
cat src/apps/habilitacion/domain/entities/index.ts
cat src/apps/habilitacion/application/services/index.ts
cat src/apps/habilitacion/infrastructure/repositories/index.ts
cat src/apps/habilitacion/presentation/hooks/index.ts
```

**Contenido esperado** (`domain/entities/index.ts`):
```typescript
export * from './DatosPrestador';
export * from './ServicioSede';
export * from './Autoevaluacion';
export * from './Cumplimiento';
export * from './Criterio';
export * from './Estandar';
export * from './PlanMejora';
export * from './Hallazgo';
export * from './SoporteDocumental';
```

### [ ] 3. Verificar Patrones de Servicio

Abrir archivo: `src/apps/habilitacion/application/services/{Entity}Service.ts`

**Patrón esperado**:
```typescript
import { BaseHabilitacionService } from './BaseHabilitacionService';
import { {Entity} } from '../domain/entities';

export class {Entity}Service extends BaseHabilitacionService<{Entity}> {
  constructor() {
    super('http://localhost:8000/api/habilitacion/{entities}/');
  }

  // Métodos específicos del dominio
  async getCustom(): Promise<{}> { ... }
}
```

**Verificar con grep**:
```bash
grep -l "BaseHabilitacionService" src/apps/habilitacion/application/services/*.ts
```

### [ ] 4. Verificar Patrones de Hook

Abrir archivo: `src/apps/habilitacion/presentation/hooks/use{Entity}.ts`

**Patrón esperado**:
```typescript
import { useCallback, useState } from 'react';
import { {Entity}Service } from '../application/services';
import { {Entity} } from '../domain/entities';

export const use{Entity} = () => {
  const [data, setData] = useState<{Entity}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch{Entities} = useCallback(async () => {
    // Implementation
  }, []);

  return { data, loading, error, fetch{Entities} };
};
```

### [ ] 5. Verificar Rutas en routes.tsx

Abrir archivo: `src/apps/habilitacion/routes.tsx`

**Rutas esperadas**:
```typescript
<Route path="/prestadores" element={<DatosPrestadorPage />} />
<Route path="/prestador/:id" element={<DatosPrestadorDetailPage />} />
<Route path="/servicios" element={<ServicioSedePage />} />
<Route path="/servicios/:servicioId" element={<ServicioSedeDetailPage />} />
<Route path="/soportes" element={<SoportesPage />} />
<Route path="/soportes/:prestadorId" element={<SoportesPage />} />
<Route path="/autoevaluaciones" element={<AutoevaluacionPage />} />
<Route path="/cumplimientos" element={<CumplimientoPage />} />
<Route path="/criterios" element={<CriterioPage />} />
<Route path="/estandares" element={<EstandarPage />} />
<Route path="/planes-mejora" element={<PlanMejoraPage />} />
<Route path="/hallazgos" element={<HallagoPage />} />
```

---

## Common Issues & Fixes

### Issue 1: "Entity file not found"

```
❌ Entity file not found: src/apps/habilitacion/domain/entities/Hallazgo.ts
```

**Solución**:
```bash
# Crear archivo de entidad basado en patrón Soportes
cat > src/apps/habilitacion/domain/entities/Hallazgo.ts << 'EOF'
/**
 * Hallazgo Entity
 * Representa hallazgos o no-conformidades encontradas en auditorías
 */

export interface IHallazgo {
  id: number;
  codigo_hallazgo: string;
  descripcion: string;
  severidad: SeveridadHallazgo;
  estado: EstadoHallazgo;
  criterio_id: number;
  prestador_id: number;
  fecha_hallazgo: string;
  fecha_vencimiento?: string;
  created_at: string;
  updated_at: string;
}

export type SeveridadHallazgo = 'CRITICA' | 'MAYOR' | 'MENOR';
export type EstadoHallazgo = 'ABIERTO' | 'EN_PROCESO' | 'CERRADO' | 'RECHAZADO';

export type CreateHallagoRequest = Omit<IHallazgo, 'id' | 'created_at' | 'updated_at'>;
export type UpdateHallagoRequest = Partial<CreateHallagoRequest>;

export class Hallazgo implements IHallazgo {
  id: number;
  codigo_hallazgo: string;
  descripcion: string;
  severidad: SeveridadHallazgo;
  estado: EstadoHallazgo;
  criterio_id: number;
  prestador_id: number;
  fecha_hallazgo: string;
  fecha_vencimiento?: string;
  created_at: string;
  updated_at: string;

  constructor(data: IHallazgo) {
    Object.assign(this, data);
  }
}
EOF
```

### Issue 2: "Service does not extend BaseHabilitacionService"

```
⚠️  Service does not extend BaseHabilitacionService
```

**Solución**:
```typescript
// ❌ INCORRECTO
export class HallagoService {
  async getHallazgos() { ... }
}

// ✅ CORRECTO
import { BaseHabilitacionService } from './BaseHabilitacionService';
import { Hallazgo } from '../domain/entities';

export class HallagoService extends BaseHabilitacionService<Hallazgo> {
  constructor() {
    super('http://localhost:8000/api/habilitacion/hallazgos/');
  }

  async getHallazgos() { ... }
}
```

### Issue 3: "Entity not exported in index.ts"

```
⚠️  Entity not exported in domain/entities/index.ts
```

**Solución**:
```typescript
// Abrir src/apps/habilitacion/domain/entities/index.ts
// Agregar línea:

export * from './Hallazgo';

// Archivo completo debe incluir TODAS las entidades:
export * from './DatosPrestador';
export * from './ServicioSede';
export * from './Autoevaluacion';
export * from './Cumplimiento';
export * from './Criterio';
export * from './Estandar';
export * from './PlanMejora';
export * from './Hallazgo';
export * from './SoporteDocumental';
```

### Issue 4: "Enum values mismatch"

```
🚨 Missing enum values: TELEMEDICINA in ModalidadServicio
```

**Solución**:
```typescript
// Abrir src/apps/habilitacion/domain/enums/index.ts
// Verificar valores exactos del backend:

export type ModalidadServicio =
  | 'INTRAMURAL'
  | 'AMBULATORIA'
  | 'TELEMEDICINA'    // ← Asegurarse que está aquí
  | 'URGENCIAS'
  | 'AMBULANCIA';

export const MODALIDAD_SERVICIO_OPTIONS: ModalidadServicio[] = [
  'INTRAMURAL',
  'AMBULATORIA',
  'TELEMEDICINA',
  'URGENCIAS',
  'AMBULANCIA',
];
```

---

## Integration Test Procedure

Una vez que todos los validadores pasen, ejecutar pruebas de integración:

```bash
# 1. Build del proyecto
npm run build

# 2. Ejecutar tests unitarios
npm test

# 3. Ejecutar tests de integración (si existen)
npm run test:integration

# 4. Ejecutar linter y type checker
npm run lint
npm run type-check
```

---

## Reference: Backend API Endpoints

Para verificar que los endpoints están correctos, comparar con backend:

```bash
# DatosPrestador
GET    /api/habilitacion/prestadores/
POST   /api/habilitacion/prestadores/
GET    /api/habilitacion/prestadores/{id}/
PATCH  /api/habilitacion/prestadores/{id}/
DELETE /api/habilitacion/prestadores/{id}/

# ServicioSede
GET    /api/habilitacion/servicios/
POST   /api/habilitacion/servicios/
GET    /api/habilitacion/servicios/{id}/
PATCH  /api/habilitacion/servicios/{id}/
DELETE /api/habilitacion/servicios/{id}/

# SoporteDocumental
GET    /api/habilitacion/soportes/
POST   /api/habilitacion/soportes/
GET    /api/habilitacion/soportes/{id}/
PATCH  /api/habilitacion/soportes/{id}/
DELETE /api/habilitacion/soportes/{id}/

# Y así sucesivamente para otras entidades...
```

---

## Success Criteria

✅ All validators pass with score 10/10
✅ All 9 entities have complete file structure
✅ All exports present in index.ts files
✅ All services extend BaseHabilitacionService
✅ All types align with backend API
✅ All routes configured in routes.tsx
✅ No TypeScript compilation errors
✅ All tests pass

---

## Next Steps

Una vez validadas todas las entidades:

1. **Phase 7 API Integration**: Conectar con backend real
2. **Phase 8 UI Components**: Crear components para cada entidad
3. **Phase 9 Pages**: Implementar páginas CRUD para cada entidad
4. **Phase 10 Testing**: Test suite completo
5. **Phase 11 Documentation**: Actualizar docs y deployment

---

**Last Updated**: 2025-01-XX
**Module**: Habilitación
**Entity Count**: 9 core entities
**Validation Coverage**: 90%+
