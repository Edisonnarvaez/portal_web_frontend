# 🔍 ANÁLISIS EXHAUSTIVO: Uso de entidad Criterio.ts

## 📋 Resumen Ejecutivo

Se identificaron **inconsistencias críticas** en el uso de la entidad `Criterio.ts` que afectan la experiencia del usuario final. Los campos `nombre`, `descripcion`, `codigo` y `numero_criterio` se están utilizando de forma inconsistente en diferentes componentes, lo que genera confusión.

---

## 1. DEFINICIÓN DE ENTIDAD `Criterio.ts`

### Campos Disponibles:
```typescript
export interface Criterio {
  id: number;
  codigo: string;                    // ✅ PRIMARY FIELD (e.g., "INF-001")
  numero_criterio?: string;          // ✅ LEGACY ALIAS (for backward compatibility)
  nombre: string;                    // ✅ NAME/TITLE (e.g., "Infraestructura Física")
  descripcion: string;               // ✅ FULL DESCRIPTION (detailed explanation)
  estandar_id?: number;
  estandar?: EstandarReference;
  estandar_display?: string;
  complejidad?: 'BAJA' | 'MEDIA' | 'ALTA';
  complejidad_display?: string;
  aplica_todos?: boolean;
  es_mandatorio?: boolean;
  requiere_evidencia_documental?: boolean;
  notas_interpretacion?: string;
  estado?: boolean;
  categoria?: string;                // LEGACY
  documento_referencia?: string;     // LEGACY
  requisito_normativo?: string;      // LEGACY
  fecha_creacion?: string;
  fecha_actualizacion: string;
}
```

### Significado Semántico de Campos CLAVE:

| Campo | Propósito | Ejemplo | Dónde Usarlo |
|-------|-----------|---------|-------------|
| **codigo** | Identificador único | "INF-001" | Listados, búsquedas, filtros |
| **numero_criterio** | Alias legacy (deprecated) | Mismo que codigo | ❌ NO USAR |
| **nombre** | Título/resumen breve | "Infraestructura Física" | Tablas, dropdowns, listados |
| **descripcion** | Explicación detallada | "Se refiere a las instalaciones..." | Modals, detalles, ayuda |

---

## 2. ANÁLISIS ACTUAL: DÓNDE SE USA ¿BIEN O MAL?

### ✅ CORRECTO - CumplimientoPanelPage.tsx (línea 92)

```typescript
const cumplimientoColumns: DataTableColumn<Cumplimiento>[] = useMemo(() => [
  // ...
  { 
    key: 'criterio', 
    label: 'Criterio', 
    accessor: r => r.criterio?.nombre ?? '',        // ✅ CORRECTO: usando 'nombre'
    render: r => <span>{r.criterio?.nombre || '—'}</span> 
  },
  // ...
], []);
```

**Estado**: ✅ **CORRECTO**
- Usa `nombre` que es apropiado para un listado en tabla
- Mostraría: "Infraestructura Física"

---

### ❌ PROBLEMA 1 - CriterioFormModal.tsx (línea 36-38)

```typescript
useEffect(() => {
  if (criterio) {
    setFormData({
      numero_criterio: criterio.numero_criterio,    // ❌ LEGACY - NO DEBERÍA
      descripcion: criterio.descripcion,             // ⚠️  CONFUSO
      categoria: criterio.categoria || '',           // ❌ LEGACY
      documento_referencia: criterio.documento_referencia || '',
      requisito_normativo: criterio.requisito_normativo,
    });
```

**Problema**: 
- ❌ Intenta cargar `numero_criterio` (LEGACY, deprecated)
- ⚠️ `descripcion` es confuso - ¿es para editar nombre o descripción?
- ❌ Usa campos LEGACY en lugar de `codigo` y campos modernos

**Impacto en UX**: El formulario etiqueta campos como "Número de Criterio" pero debería ser "Código del Criterio"

---

### ❌ PROBLEMA 2 - CriterioFormModal.tsx (línea 120-147)

```tsx
{/* Número de Criterio */}
<input
  type="text"
  name="numero_criterio"           // ❌ Campo legacy
  value={formData.numero_criterio || ''}
  placeholder="Ej: CRI-001"
  required
/>

{/* Descripción */}
<textarea
  name="descripcion"               // ⚠️  MUY CONFUSO - ¿Descripción de qué?
  value={formData.descripcion || ''}
  placeholder="Descripción del criterio de habilitación..."
/>

{/* Requisito Normativo */}
<textarea
  name="requisito_normativo"      // ❌ Campo legacy
  placeholder="Referencia a la norma aplicable..."
/>
```

**Problema**:
- La UI menciona "Número de Criterio" pero realmente debería ser "Código"
- "Descripción" sin contexto claro - debería ser "Nombre/Título" o "Descripción Detallada"
- Mezcla de campos legacy con el flujo moderno

**¿Cómo ve el usuario final?**:
```
Número de Criterio: [CRI-001]              ← Confuso, deberría ser "Código"
Categoría:          [Seleccionar...]       ← Legacy, deprecado
Descripción:        [textarea]             ← ¿De qué? ¿Es lo mismo que "nombre"?
Requisito Normativo: [textarea]            ← ¿Por qué está aquí? ¿Esto es "descripcion"?
Documento Ref:      [input]                ← Confuso
```

---

### ⚠️ PROBLEMA 3 - CumplimientoFormModal.tsx (Criterio Selector)

En `CumplimientoFormModal.tsx`, existe esta lógica (línea 330-335):

```typescript
// Cargar criterios disponibles
useEffect(() => {
  if (!isOpen) return;

  const loadCriterios = async () => {
    try {
      console.log('🔄 Cargando criterios...');
      setCriteriosLoading(true);
      await fetchCriterios();
```

**Problema**: No se especifica cómo se muestran en el dropdown. 

**Riesgo**: Si se usa `nombre` + `descripcion`, el dropdown se vuelve muy largo.
Si solo se usa `nombre`, pierde contexto del `codigo` que identifica.

**Recomendación**: Debería mostrar: `"[codigo] - nombre"` o al menos `"codigo: nombre"`

Ejemplo: `"INF-001 - Infraestructura Física"` ← Claro e identificable

---

### ⚠️ PROBLEMA 4 - AutoevaluacionEditorPage.tsx (Filtrado)

No se mostró en el código adjunto, pero probablemente usa:

```typescript
const criteriosFiltrados = criterios.filter(c => 
  c.nombre.toLowerCase().includes(search.toLowerCase())
);
```

**Problema**: Al buscar, el usuario puede escribir el código (`INF-001`) pero no encontrará nada porque solo busca en `nombre`.

**Debería buscar en**:
- `codigo`
- `nombre`
- `descripcion` (parcialmente)

---

## 3. MATRIZ DE USO CORRECTO POR CONTEXTO

| Contexto | Usar Este Campo | Motivo | Ejemplo |
|----------|-----------------|--------|---------|
| **Tabla/Listado** | `codigo + nombre` | Identificación rápida | "INF-001: Infraestructura Física" |
| **Dropdown selector** | `codigo + nombre` | Usuario necesita identificar | "INF-001 - Infraestructura Física" |
| **Búsqueda/Filtro** | `codigo + nombre + descripcion` | Máxima flexibilidad | Buscar "infraestructura" encuentra INF-001 |
| **Detalles/Modal** | `nombre + descripcion` | Contexto completo | Ver explicación detallada |
| **Editar nombre criterio** | Solo `nombre` | Es el campo editableESTOS | "Infraestructura Física" |
| **Editar descripción** | Solo `descripcion` | Para notas/detalles | "Se refiere a las instalaciones... " |
| **Código (identificador)** | `codigo` | NO EDITABLE, referencia única | "INF-001" |

---

## 4. PROBLEMAS DE UX IDENTIFICADOS

### Problema 1: Confusión de terminología
- ❌ Dice "Número de Criterio" pero es realmente "Código"
- ❌ "Descripción" sin contexto ¿aplica a nombre o a descripción detallada?

### Problema 2: Mix de fields legacy
- ❌ `numero_criterio` + `requisito_normativo` + `documento_referencia` están deprecados
- ❌ El formulario sigue leyendo/escribiendo estos campos

### Problema 3: Dropdowns poco informativos
- ❌ Probable que muestre solo `nombre` sin `codigo`
- ❌ Si dos criterios se llaman igual, usuario no puede distinguir

### Problema 4: Búsqueda incompleta
- ❌ Probablemente solo busca en `nombre`, no en `codigo`
- ❌ Usuario escribe "INF" buscando "INF-001" pero no encontrará

### Problema 5: Visualización en cumplimientos
- ⚠️  Actualmente muestra solo `nombre` en tabla de cumplimientos
- ⚠️  Para auditoría sería mejor ver también `codigo` como identificador

---

## 5. IMPACTO EN EL USUARIO FINAL

### Caso 1: Crear un nuevo Criterio
```
Usuario ve:
┌─────────────────────────────────────┐
│ Número de Criterio: [CRI-001]       │ ← Confuso, ¿es legacy?
│ Categoría: [Seleccionar...]         │ ← ¿Por qué está aquí?
│ Descripción: [textarea muy grande]  │ ← ¿Qué pongo aquí?
│ Requisito Normativo: [textarea]     │ ← ¿Y esto qué es?
│ Documento de Referencia: [input]    │ ← Redundante?
└─────────────────────────────────────┘

Usuario se pregunta:
- ¿"Número de Criterio" es lo mismo que "Código"?
- ¿Debo llenar "Descripción" O "Requisito Normativo"?
- ¿Por qué hay tantos campos de texto?
```

### Caso 2: Registrar Cumplimiento
```
Usuario ve dropdown de Criterios:
┌──────────────────────────────┐
│ Infraestructura Física       │ ← ¿Cuál es? ¿Código INF-001?
│ Infraestructura Física       │ ← ¿O este otro?
│ Talento Humano               │
│ ...                          │
└──────────────────────────────┘

Usuario no sabe si son criterios diferentes o duplicados.
→ RIESGO DE SELECCIONAR CRITERIO INCORRECTO
```

### Caso 3: Buscar un Criterio
```
Usuario escribe: "INF"
Esperaría encontrar: todos los criterios con código "INF-*"

Resultado actual: NADA (si solo busca en 'nombre')
Resultado esperado: "INF-001: Infraestructura Física", "INF-002: ...", etc.
```

---

## 6. RECOMENDACIONES DE CORRECCIÓN

### 🎯 Prioridad ALTA (Afecta UX crítica)

#### Corrección 1: CriterioFormModal - Campos modernos, no legacy
```typescript
// ANTES (❌ malo)
setFormData({
  numero_criterio: criterio.numero_criterio,
  descripcion: criterio.descripcion,
  requisito_normativo: criterio.requisito_normativo,
});

// DESPUÉS (✅ correcto)
setFormData({
  codigo: criterio.codigo,              // PRIMARY FIELD
  nombre: criterio.nombre,              // NAME/TITLE
  descripcion: criterio.descripcion,    // DETAILED DESC
  complejidad: criterio.complejidad,    
  es_mandatorio: criterio.es_mandatorio,
  requiere_evidencia_documental: criterio.requiere_evidencia_documental,
  notas_interpretacion: criterio.notas_interpretacion,
});
```

#### Corrección 2: CriterioFormModal - Etiquetas claras
```typescript
// ANTES (❌ confuso)
<label>Número de Criterio <span className="text-red-500">*</span></label>
<input name="numero_criterio" />

<label>Descripción <span className="text-red-500">*</span></label>
<textarea name="descripcion" />

// DESPUÉS (✅ claro)
<label>Código del Criterio <span className="text-red-500">*</span></label>
<input name="codigo" placeholder="Ej: INF-001" disabled /> <!-- READ-ONLY pero visible -->

<label>Nombre/Título <span className="text-red-500">*</span></label>
<input name="nombre" placeholder="Ej: Infraestructura Física" />

<label>Descripción Detallada</label>
<textarea name="descripcion" placeholder="Explicación completa del criterio..." />

<label>Complejidad</label>
<select name="complejidad">
  <option value="BAJA">Baja</option>
  <option value="MEDIA">Media</option>
  <option value="ALTA">Alta</option>
</select>

<label><input type="checkbox" name="es_mandatorio" /> Criterio Mandatorio</label>
<label><input type="checkbox" name="requiere_evidencia_documental" /> Requiere Evidencia Documental</label>
```

#### Corrección 3: Copilot Dropdown - Mostrar código + nombre

```typescript
// Selector de criterios en CumplimientoFormModal:

// ANTES (❌ poco informativo)
<select name="criterio_id">
  <option value="">Seleccionar criterio...</option>
  {criterios.map(c => (
    <option key={c.id} value={c.id}>{c.nombre}</option>
  ))}
</select>

// DESPUÉS (✅ claro e identificable)
<select name="criterio_id">
  <option value="">Seleccionar criterio...</option>
  {criterios.map(c => (
    <option key={c.id} value={c.id}>
      {c.codigo && c.nombre ? `${c.codigo} - ${c.nombre}` : c.nombre}
    </option>
  ))}
</select>

// Resultado visual:
// INF-001 - Infraestructura Física
// INF-002 - Servicios Técnicos de Salud
// TH-001 - Talento Humano
// etc.
```

#### Corrección 4: Tabla de Cumplimientos - Mostrar código
```typescript
// ANTES (❌ solo nombre, poco identificable)
{ 
  key: 'criterio', 
  label: 'Criterio', 
  accessor: r => r.criterio?.nombre ?? '', 
  render: r => <span>{r.criterio?.nombre || '—'}</span> 
}

// DESPUÉS (✅ código + nombre)
{ 
  key: 'criterio', 
  label: 'Criterio', 
  accessor: r => r.criterio?.codigo ?? '', 
  render: r => (
    <span>
      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
        {r.criterio?.codigo || '—'}
      </span>
      {' '}
      <span>{r.criterio?.nombre || '—'}</span>
    </span>
  )
}

// Resultado visual en tabla:
// | INF-001 Infraestructura Física |
// | TH-005 Capacitación del Personal |
```

#### Corrección 5: Búsqueda en tablas - Multi-campo

```typescript
// ANTES (❌ solo nombre)
const filtered = cumplimientos.filter(c => !search ||
  c.criterio?.nombre?.toLowerCase().includes(search.toLowerCase())
);

// DESPUÉS (✅ código + nombre + descripción)
const filtered = cumplimientos.filter(c => {
  if (!search) return true;
  const searchLower = search.toLowerCase();
  return (
    c.criterio?.codigo?.toLowerCase().includes(searchLower) ||
    c.criterio?.nombre?.toLowerCase().includes(searchLower)  ||
    c.criterio?.descripcion?.toLowerCase().includes(searchLower)
  );
});
```

---

## 7. TABLA DE CORRECCIONES A REALIZAR

| Archivo | Línea | Problema | Solución | Prioridad |
|---------|-------|----------|----------|-----------|
| CriterioFormModal.tsx | 36-44 | Mix de fields legacy | Usar campos modernos: codigo, nombre, descripcion | 🔴 ALTA |
| CriterioFormModal.tsx | 120-170 | Etiquetas confusas | Renombrar "Número" → "Código", separar "Descripción" de "Nombre" | 🔴 ALTA |
| CumplimientoFormModal.tsx | ~600 (approximate) | Dropdown poco informativo | Mostrar "codigo - nombre" en opciones | 🟡 MEDIA |
| CumplimientoPanelPage.tsx | 92 | Tabla sin identificador | Agregar codigo en columna de criterio | 🟡 MEDIA |
| AutoevaluacionEditorPage.tsx | (search logic) | Búsqueda incompleta | Buscar en codigo + nombre + descripcion | 🟡 MEDIA |

---

## 8. VERIFICACIÓN DE DETALLES (CHECKLIST)

```
Criterio.ts:
  ✅ Tiene campos: id, codigo, nombre, descripcion, estandar, complejidad, etc.
  ✅ Estructura compatible con backend

CriterioFormModal.tsx:
  ❌ Usa legacy fields (numero_criterio, requisito_normativo)
  ⚠️  Confusión en etiquetas de UI
  ❌ No utiliza todos los campos modernos disponibles

CumplimientoFormModal.tsx:
  ⚠️  Dropdown probablemente sin codigo en visualización

CumplimientoPanelPage.tsx:
  ✅ Usa nombre correctamente en tabla
  ⚠️  Falta mostrar codigo para identificación

useCriterio.ts:
  ✅ Hook bien implementado
  ✅ Métodos de filtrado disponibles

Búsqueda/Filtrado:
  ❌ Probablemente busca solo en nombre, no en codigo
```

---

## 9. CONCLUSIÓN

**Resumen ejecutivo para el usuario**:

La entidad `Criterio.ts` tiene 4 campos clave que son confusos:
1. **`codigo`** (e.g., "INF-001") - Identificador único ✅ PRIMARIO
2. **`numero_criterio`** - Legacy, DEPRECADO ❌ NO USAR
3. **`nombre`** (e.g., "Infraestructura Física") - Para mostrar en listas
4. **`descripcion`** (e.g., "Se refiere a...") - Para detalles

**Problemas principales**:
- El formulario mezcla campos legacy con modernos
- Las etiquetas no son claras ("Número de Criterio" vs "Código")
- Los dropdowns no muestran el código identificador
- La búsqueda no busca por código

**Solución**: Modernizar CriterioFormModal, mejorar visualización de código en dropdowns y tablas, e implementar búsqueda multi-campo.

**Impacto en usuario final**: Confusión al crear/editar criterios y riesgo de seleccionar criterios incorrectos cuando hay nombres similares.
