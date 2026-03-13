# 🛠️ PLAN DE CORRECCIÓN: Criterio.ts UX/Usabilidad

## Cambios a Implementar

### FASE 1: Actualizar CriterioFormModal.tsx ✅ CRÍTICA

#### Paso 1.1: Actualizar estado del formulario
```typescript
// ANTES (Legacy Fields)
const [formData, setFormData] = useState<Partial<CriterioCreate>>({
  numero_criterio: '',
  descripcion: '',
  categoria: '',
  documento_referencia: '',
  requisito_normativo: '',
});

// DESPUÉS (Modern Fields)
const [formData, setFormData] = useState<Partial<CriterioCreate>>({
  codigo: '',
  nombre: '',
  descripcion: '',
  complejidad: 'MEDIA',
  es_mandatorio: false,
  requiere_evidencia_documental: false,
  notas_interpretacion: '',
  estandar_id: undefined,
});
```

#### Paso 1.2: Actualizar useEffect (cargar datos)
```typescript
// ANTES
if (criterio) {
  setFormData({
    numero_criterio: criterio.numero_criterio,
    descripcion: criterio.descripcion,
    categoria: criterio.categoria || '',
    documento_referencia: criterio.documento_referencia || '',
    requisito_normativo: criterio.requisito_normativo,
  });
}

// DESPUÉS
if (criterio) {
  setFormData({
    codigo: criterio.codigo,
    nombre: criterio.nombre,
    descripcion: criterio.descripcion,
    complejidad: criterio.complejidad || 'MEDIA',
    es_mandatorio: criterio.es_mandatorio || false,
    requiere_evidencia_documental: criterio.requiere_evidencia_documental || false,
    notas_interpretacion: criterio.notas_interpretacion || '',
    estandar_id: criterio.estandar_id,
  });
}
```

#### Paso 1.3: Actualizar validación
```typescript
// ANTES
if (!formData.numero_criterio || !formData.descripcion || !formData.requisito_normativo) {
  setError('Número de criterio, descripción y requisito normativo son obligatorios');
}

// DESPUÉS
if (!formData.codigo || !formData.nombre) {
  setError('Código y nombre del criterio son obligatorios');
}

if (formData.es_mandatorio && !formData.descripcion?.trim()) {
  setError('Los criterios mandatorios requieren una descripción');
}
```

#### Paso 1.4: Reorganizar form fields en la UI
```typescript
// DESPUÉS (Better UX grouping)
<form onSubmit={handleSubmit} className="p-6 space-y-6">
  
  {/* SECCIÓN 1: IDENTIFICACIÓN */}
  <div>
    <h3 className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 mb-4">
      Identificación del Criterio
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Código (read-only en edición, editable en creación) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Código <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="codigo"
          value={formData.codigo || ''}
          onChange={handleChange}
          placeholder="Ej: INF-001"
          disabled={isEdit}  // No editable si es edición
          className={`w-full px-3 py-2 border rounded-lg ${
            isEdit ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-700'
          } text-gray-900 dark:text-white`}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Ej: INF-001, TH-005, SA-002 | No se puede cambiar después de crear
        </p>
      </div>

      {/* Estándar (selector) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Estándar
        </label>
        <select
          name="estandar_id"
          value={formData.estandar_id || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Seleccionar estándar...</option>
          {/* Cargar desde useEstandar hook */}
        </select>
      </div>
    </div>
  </div>

  {/* SECCIÓN 2: CONTENIDO */}
  <div>
    <h3 className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 mb-4">
      Contenido del Criterio
    </h3>
    
    {/* Nombre/Título */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Nombre/Título <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="nombre"
        value={formData.nombre || ''}
        onChange={handleChange}
        placeholder="Ej: Infraestructura Física"
        required
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Breve descripción del criterio (máx 100 caracteres)
      </p>
    </div>

    {/* Descripción Detallada */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Descripción Detallada
      </label>
      <textarea
        name="descripcion"
        value={formData.descripcion || ''}
        onChange={handleChange}
        rows={4}
        placeholder="Explicación completa de qué trata este criterio, contexto y aplicabilidad..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Notas de Interpretación */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Notas de Interpretación (Opcional)
      </label>
      <textarea
        name="notas_interpretacion"
        value={formData.notas_interpretacion || ''}
        onChange={handleChange}
        rows={3}
        placeholder="Aclaraciones sobre cómo interpretar y aplicar este criterio..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>

  {/* SECCIÓN 3: PROPIEDADES */}
  <div>
    <h3 className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 mb-4">
      Propiedades
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Complejidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Complejidad
        </label>
        <select
          name="complejidad"
          value={formData.complejidad || 'MEDIA'}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="BAJA">Baja</option>
          <option value="MEDIA">Media</option>
          <option value="ALTA">Alta</option>
        </select>
      </div>
    </div>

    {/* Checkboxes */}
    <div className="space-y-3 mt-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="es_mandatorio"
          checked={formData.es_mandatorio || false}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            es_mandatorio: e.target.checked
          }))}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Criterio Mandatorio
          <span className="text-xs text-gray-500 ml-2">(Obligatorio para todas las IPS)</span>
        </span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="requiere_evidencia_documental"
          checked={formData.requiere_evidencia_documental || false}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            requiere_evidencia_documental: e.target.checked
          }))}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Requiere Evidencia Documental
          <span className="text-xs text-gray-500 ml-2">(Necesita documentación de respaldo)</span>
        </span>
      </label>
    </div>
  </div>

  {/* Footer */}
  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
    <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
      Cancelar
    </button>
    <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600">
      {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
    </button>
  </div>
</form>
```

---

### FASE 2: Actualizar CumplimientoFormModal.tsx ✅ ALTA

#### Paso 2.1: Mejorar dropdown de criterios
```typescript
// En la sección donde se renderiza el select de criterios:

<select
  name="criterio_id"
  value={formData.criterio_id || 0}
  onChange={handleChange}
  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
  required
>
  <option value={0}>Seleccionar criterio...</option>
  {criteriosDelHook.map((c) => (
    <option key={c.id} value={c.id}>
      {c.codigo && c.nombre 
        ? `${c.codigo} - ${c.nombre}` 
        : c.nombre || c.codigo
      }
      {c.es_mandatorio && ' ⚠️'}
    </option>
  ))}
</select>
<p className="text-xs text-gray-500 mt-1">
  {criteriosDelHook.find(c => c.id === formData.criterio_id)?.descripcion || 'Selecciona cualquier criterio'}
</p>
```

---

### FASE 3: Actualizar CumplimientoPanelPage.tsx ✅ MEDIA

#### Paso 3.1: Mejorar columna de criterio en tabla
```typescript
const cumplimientoColumns: DataTableColumn<Cumplimiento>[] = useMemo(() => [
  // ...
  { 
    key: 'criterio', 
    label: 'Criterio', 
    accessor: r => r.criterio?.codigo ?? '', 
    render: r => (
      <div className="flex flex-col">
        <span className="font-mono text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 px-2 py-1 rounded w-fit mb-1">
          {r.criterio?.codigo || '—'}
        </span>
        <span className="text-sm text-gray-900 dark:text-white">
          {r.criterio?.nombre || '—'}
        </span>
      </div>
    )
  },
  // ...
], []);
```

---

### FASE 4: Mejorar búsqueda en filtros ✅ MEDIA

#### Paso 4.1: CumplimientoPanelPage - Búsqueda multi-campo
```typescript
const filtered = useMemo(() => {
  return cumplimientos.filter(c => {
    const matchEstado = !filtroEstado || c.cumple === filtroEstado;
    const matchAuto = !filtroAutoeval || c.autoevaluacion?.id === Number(filtroAutoeval);
    
    // ANTES
    // const matchSearch = !search ||
    //   c.servicio_sede?.nombre_servicio?.toLowerCase().includes(search.toLowerCase()) ||
    //   c.criterio?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    //   c.hallazgo?.toLowerCase().includes(search.toLowerCase());

    // DESPUÉS (incluir código de criterio)
    const searchLower = search.toLowerCase();
    const matchSearch = !search || (
      c.servicio_sede?.nombre_servicio?.toLowerCase().includes(searchLower) ||
      c.criterio?.codigo?.toLowerCase().includes(searchLower) ||        // ← NUEVO
      c.criterio?.nombre?.toLowerCase().includes(searchLower) ||
      c.criterio?.descripcion?.toLowerCase().includes(searchLower) ||   // ← NUEVO
      c.hallazgo?.toLowerCase().includes(searchLower)
    );
    
    return matchEstado && matchAuto && matchSearch;
  });
}, [cumplimientos, filtroEstado, filtroAutoeval, search]);
```

---

### FASE 5: Actualizar tipos si es necesario ✅ CHECK

#### Paso 5.1: Verificar CriterioCreate interface
```typescript
export interface CriterioCreate {
  // ANTES (Legacy)
  // numero_criterio: string;
  // categoria?: string;
  // documento_referencia?: string;
  // requisito_normativo: string;

  // DESPUÉS (Modern)
  codigo: string;
  nombre: string;
  descripcion: string;
  complejidad?: 'BAJA' | 'MEDIA' | 'ALTA';
  es_mandatorio?: boolean;
  requiere_evidencia_documental?: boolean;
  notas_interpretacion?: string;
  estandar_id?: number;
}
```

---

## Checklist de Implementación

```
FASE 1: CriterioFormModal.tsx
  [ ] Actualizar estado formData (usar campos modernos)
  [ ] Actualizar useEffect de carga de datos
  [ ] Actualizar validación
  [ ] Reorganizar UI en 3 secciones (Identificación, Contenido, Propiedades)
  [ ] Agregar etiquetas descriptivas para cada campo
  [ ] Desactivar campo "código" en modo edición
  [ ] Agregar checkboxes para propiedades booleanas
  [ ] Verificar que CriterioCreate interface sea compatible

FASE 2: CumplimientoFormModal.tsx
  [ ] Mejorar dropdown de criterios para mostrar "codigo - nombre"
  [ ] Agregar indicador visual para criterios mandatorios

FASE 3: CumplimientoPanelPage.tsx
  [ ] Actualizar columna de criterio en tabla
  [ ] Mostrar código en color diferente (indigo/badge style)
  [ ] Mostrar nombre debajo del código

FASE 4: Búsqueda
  [ ] Actualizar lógica de filtrado en CumplimientoPanelPage
  [ ] Incluir búsqueda por código de criterio
  [ ] Incluir búsqueda por descripción de criterio

FASE 5: Verificación
  [ ] Compilar project (npm run build)
  [ ] No hay errores de TypeScript
  [ ] Interfaces coinciden entre frontend y backend
  [ ] Prueba manual de crear/editar criterio
  [ ] Prueba manual de crear/editar cumplimiento
  [ ] Prueba búsqueda por código (ej: buscar "INF" encuentra "INF-001")
```

---

## Orden de Priorización

1. **🔴 URGENTE** (Esta semana):
   - FASE 1: CriterioFormModal modernización
   - FASE 2: Dropdown de criterios en cumplimientos

2. **🟡 IMPORTANTE** (Próxima semana):
   - FASE 3: Tabla de cumplimientos mejorada
   - FASE 4: Búsqueda multi-campo

3. **🟢 MEJORA** (Luego):
   - Migrations de código legacy en otras vistas
   - Documentación de patrones de uso

---

## Notas Adicionales

### Para el Backend
- Confirmar que API devuelve todos los campos modernos (complejidad, es_mandatorio, etc.)
- Si API no devuelve, actualizar serializers

### Compatibilidad
- Mantener backward compatibility inicialmente
- Legacy fields pueden seguir siendo opcionales en CriterioCreate

### Testing
- Después de cambios, probar:
  - Crear criterio nuevo
  - Editar criterio existente
  - Crear cumplimiento (seleccionar criterio)
  - Buscar cumplimientos por código de criterio
  - Buscar cumplimientos por nombre de criterio
