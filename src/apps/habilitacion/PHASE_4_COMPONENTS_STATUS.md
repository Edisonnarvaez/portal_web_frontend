# Phase 4 - Presentación Components: Soportes Module

**Fecha**: Abril 2026  
**Estado**: ✅ Fase Inicial Completada  
**Componentes Lista**: 2 / 5 (primeros 2 listos para uso, otros 3 pendientes de simplificación)

---

## 🎨 Componentes Creados (Listos)

### 1. **SoporteCard.tsx** ✅ 
**Ubicación**: `src/apps/habilitacion/presentation/components/SoporteCard.tsx`

**Propósito**: Muestra información de un documento soporte en forma de tarjeta  
**Props**:
```typescript
interface SoporteCardProps {
  soporte: SoporteDocumental;
  onEdit?: (soporte: SoporteDocumental) => void;
  onDelete?: (id: number) => void;
  onViewDetails?: (id: number) => void;
  isLoading?: boolean;
}
```

**Características**:
- ✅ Muestra tipo de documento, versión, estado de vigencia
- ✅ Indica contexto (Empresa/Sede/Servicio)
- ✅ Alertas visuales para vencimiento (verde=vigente, amarillo=próximo, rojo=vencido)
- ✅ Fecha de creación y vencimiento
- ✅ Íconos de acción (editar, eliminar, ver detalles)
- ✅ Responsive design con Tailwind

**Ejemplo de Uso**:
```tsx
import { SoporteCard } from '@/apps/habilitacion/presentation/components';

<SoporteCard 
  soporte={documento}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onViewDetails={handleDetails}
/>
```

**Estado**: 🟢 **SIN ERRORES** - Listo para usar

---

### 2. **SoporteUploadModal.tsx** ✅
**Ubicación**: `src/apps/habilitacion/presentation/components/SoporteUploadModal.tsx`

**Propósito**: Modal para cargar nuevos documentos soportes  
**Props**:
```typescript
interface SoporteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (soporte: any) => void;
  nivel: 'EMPRESA' | 'SEDE' | 'SERVICIO';
  contextId: number; // empresa_id, sede_id, or servicio_id
}
```

**Características**:
- ✅ Selector de tipo de documento (desde hook `tiposDocumento`)
- ✅ Drag & drop / click para seleccionar archivo (max 10MB)
- ✅ Validación de tipos (PDF, JPG, PNG, DOC)
- ✅ Barra de progreso de upload simulada
- ✅ Manejo de errores con mensajes claros
- ✅ Estados de carga y UI responsiva

**Ejemplo de Uso**:
```tsx
import { SoporteUploadModal } from '@/apps/habilitacion/presentation/components';
import { useState } from 'react';

export function MiComponente() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Cargar Documento</button>
      <SoporteUploadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUploadSuccess={(doc) => console.log('Subido:', doc)}
        nivel="SERVICIO"
        contextId={123}
      />
    </>
  );
}
```

**Estado**: 🟢 **SIN ERRORES** - Listo para usar

---

## 📋 Componentes Pendientes (Para Phase 4.2)

### 3. SoporteChecklist.tsx (⏳ En Progress)
**Función**: Mostrar lista de documentos cargados con estadísticas de vigencia  
**Status**: Requiere simplificación (depende de métodos específicos del hook)

### 4. SoporteExpiration.tsx (⏳ En Progress)
**Función**: Mostrar alertas de vencimiento por severidad (vencido, crítico, próximo)  
**Status**: Requiere simplificación (depende de métodos específicos del hook)

### 5. SoporteCategories.tsx (⏳ En Progress)
**Función**: Gestión y visualización de categorías de documentos  
**Status**: Requiere actualizar propiedades de entidad

---

## 🧬 Integración con Hook useSoporte

Los componentes utilizan `useSoporte()` hook directamente para:

**SoporteCard**: Acceso a entidad SoporteDocumental (solo lectura)

**SoporteUploadModal**: 
- `uploadSoporte(data)` - Para cargar archivo
- `tiposDocumento` - Para selector de tipos

**Métodos disponibles en el hook**:
```typescript
const {
  // Arrays de estado
  categorias,
  tiposDocumento,        // ← Usado en SoporteUploadModal
  soportes,
  soportesVencidos,
  
  // Métodos CRUD
  fetchSoportes,
  getSoportesByEmpresa,
  getSoportesBySede,
  getSoportesByServicio,
  uploadSoporte,         // ← Usado en SoporteUploadModal
  getSoportesVencidos,
  getSoportesProximosAVencer,
  
  // Estados
  loading,
  error,
  clearError,
} = useSoporte();
```

---

## 📊 Tipos de Datos Utilizados

### SoporteDocumental
```typescript
interface SoporteDocumental {
  id: number;
  tipo_documento_id: number;
  tipo_documento?: TipoDocumentoSoporte;
  
  nivel: 'EMPRESA' | 'SEDE' | 'SERVICIO';
  empresa_id?: number;
  sede_id?: number;
  servicio_id?: number;
  
  archivo: string; // URL
  nombre_archivo?: string;
  fecha_vencimiento?: string | null;
  vencido?: boolean;
  dias_vencimiento?: number | null;
  
  version: number;
  es_vigente: boolean;
  
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### SoporteDocumentalCreate
```typescript
interface SoporteDocumentalCreate {
  tipo_documento_id: number;
  nivel: NivelSoporte;
  empresa_id?: number;
  sede_id?: number;
  servicio_id?: number;
  archivo: File;
  fecha_vencimiento?: string;
}
```

---

## 🚀 Cómo Usar en tu Aplicación

### Importar componentes
```typescript
import { 
  SoporteCard, 
  SoporteUploadModal 
} from '@/apps/habilitacion/presentation/components';
```

### En un Feature Module
```tsx
import { useState } from 'react';
import { SoporteCard, SoporteUploadModal } from '@/apps/habilitacion/presentation/components';
import { useSoporte } from '@/apps/habilitacion/presentation/hooks';

export function SoportesView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { soportes, loading } = useSoporte();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documentos Soportes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Cargar Documento
        </button>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {soportes.map((soporte) => (
          <SoporteCard
            key={soporte.id}
            soporte={soporte}
            onEdit={(s) => console.log('Editar:', s)}
            onDelete={(id) => console.log('Eliminar:', id)}
          />
        ))}
      </div>

      {/* Modal de carga */}
      <SoporteUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nivel="SERVICIO"
        contextId={123}
        onUploadSuccess={(doc) => {
          console.log('Documento cargado:', doc);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
```

---

## 🔧 Próximos Pasos

### Inmediatos (Phase 4.2)
1. ✏️ Simplificar `SoporteChecklist.tsx` para usar solo `soportes` y `loading`
2. ✏️ Simplificar `SoporteExpiration.tsx` para usar `soportesVencidos` y `getSoportesProximosAVencer`
3. ✏️ Actualizar `SoporteCategories.tsx` para remover validaciones de `código`
4. ✅ Verificar que los 5 componentes compilen sin errores

### Phase 5
1. Crear página dashboard para módulo de soportes
2. Integrar componentes en rutas de habilitación
3. Agregar lógica de filtros y búsqueda

### Phase 6
1. Unit tests para componentes
2. Integration tests con hooks
3. E2E tests en Cypress

---

## 📝 Notas de Técnicas

- **Versioning**: Los `SoporteDocumental` usan `version` y `es_vigente` para mantener histórico
- **Niveles**: Un documento pertenece a uno de 3 niveles: EMPRESA, SEDE, o SERVICIO
- **Vencimiento**: Calculado automáticamente pero puede ser `null`
- **Drag & Drop**: Modal soporta tanto click como drag-drop para archivos

---

**Última actualización**: 9 Abril 2026  
**Versión**: 1.0-alpha  
**Autor**: GitHub Copilot
