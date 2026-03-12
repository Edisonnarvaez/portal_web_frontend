# 🔍 ANÁLISIS DETALLADO DE PROBLEMAS - AUTOEVALUACIONES

**Fecha**: 12 de Marzo 2026
**Estado**: ANÁLISIS COMPLETO - LISTO PARA CORREGIR
**Severidad**: 4 problemas críticos + 3 mejoras

---

## 🚨 PROBLEMAS ENCONTRADOS

### 1️⃣ **CONTRASTE BOTONES EN DARK MODE** ⚠️ CRÍTICO
**Archivo**: [AutoevaluacionCard.tsx](AutoevaluacionCard.tsx)
**Líneas**: 115-150
**Severidad**: ALTA (UX)

**Problema**:
```tsx
// ❌ ACTUAL - Bajo contraste en dark mode
className="...bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300..."
// dark:bg-blue-900 + dark:text-blue-300 = MUY BAJO CONTRASTE
```

**Botones Afectados**:
- ✒️ Editar: `bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-300`
- ✅ Validar: `bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300`
- 📋 Resumen: `bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300`
- 📑 Duplicar: `bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300`
- 🗑️ Eliminar: `bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300`

**Impacto**: Los botones son ilegibles en modo dark mode. WCAG incumplido.

**Solución**:
```tsx
// ✅ PROPUESTO - Alto contraste en ambos modos
className="...bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100..."
// O usar colores más fuertes en dark mode:
// dark:bg-blue-600 dark:text-white
```

---

### 2️⃣ **CATEGORIAS_CRITERIO NO EXISTE** 🔴 CRÍTICO
**Archivo**: [AutoevaluacionEditorPage.tsx](AutoevaluacionEditorPage.tsx)
**Líneas**: 37, 273
**Severidad**: CRÍTICA (ERROR EN TIEMPO DE EJECUCIÓN)

**Problema**:
```tsx
// ❌ Línea 37 - Import de algo que no existe
import { CATEGORIAS_CRITERIO } from '../../domain/types';

// ❌ Línea 273 - Intento de mapear undefined
{CATEGORIAS_CRITERIO.map(c => (
  <option key={c.value} value={c.value}>{c.label}</option>
))}
// Error: Cannot read property 'map' of undefined
```

**Root Cause**:
- `CATEGORIAS_CRITERIO` no está definido en `/domain/types/index.ts`
- El campo `categoria` en `Criterio` es `string` libre, sin valores predefinidos
- No hay lista de categorías en backend

**Impacto**: El filtro de categorías genera error JavaScript. Página puede no cargar.

**Solución**:
1. Definir `CATEGORIAS_CRITERIO` en `/domain/types/index.ts`
2. O extraer categorías dinámicamente de los criterios cargados
3. O remover el filtro si no es necesario

---

### 3️⃣ **CRITERIOS NO APARECEN O SOLO APARECEN ALGUNOS** 🟠 MAYOR
**Archivo**: [AutoevaluacionEditorPage.tsx](AutoevaluacionEditorPage.tsx)
**Líneas**: 110-115, 280+
**Severidad**: ALTA (Funcionalidad Rota)

**Problema**:
```tsx
// Línea 110-115 - Criterios no se cargan correctamente
const { criterios, evaluaciones, loading: lcr, fetchCriterios, fetchEvaluaciones } = useCriterio();

useEffect(() => {
  fetchAutoevaluaciones();
  fetchCriterios();  // ⚠️ Carga TODOS los criterios sin filtrar por autoevaluación
  fetchEvaluaciones(autoId);
  // ...
}, [autoId]);

// Línea 280+ - Intenta filtrar por categoría pero no filtra por autoevaluación
const criteriosFiltrados = useMemo(() => {
  let list = criterios;  // ⚠️ AQUÍ: criterios globales, no de la autoevaluación
  if (filtroCategoria) list = list.filter(c => c.categoria === filtroCategoria);
  return list;
}, [criterios, filtroCategoria]);
```

**Root Cause**:
1. `fetchCriterios()` trae TODOS los criterios de la BD
2. Debería traer solo los criterios de esta autoevaluación
3. Mixtura de criterios globales + evaluaciones específicas de la autoevaluación
4. El filtro intenta usar `c.categoria === filtroCategoria` pero `CATEGORIAS_CRITERIO` no existe

**Impacto**: 
- Se ven criterios de otras autoevaluaciones
- O no aparecen porque están siendo filtrados incorrectamente
- La tabla de criterios es confusa

**Solución**:
1. Llamar `fetchCriterios()` SOLO UNA VEZ al cargar página (sin `autoId`)
2. Luego filtrar client-side: `criterios.filter(c => evaluaciones.some(e => e.criterio_id === c.id))`
3. Definir CATEGORIAS_CRITERIO o extraer dinámicamente

---

### 4️⃣ **MODALES FORMS NO FUNCIONAN BIEN** 🟠 MAYOR
**Archivos**: 
- [AutoevaluacionFormModal.tsx](AutoevaluacionFormModal.tsx)
- [CumplimientoFormModal.tsx](CumplimientoFormModal.tsx)
**Severidad**: MEDIA (UX/Funcionalidad)

**Problemas Específicos**:

#### A) AutoevaluacionFormModal - Validaciones confusas
```tsx
// ❌ Validación de duplicado ocurre pero mensajes no claros
setValidationWarnings([...]); // Muestra warnings
// Pero el submit se bloquea sin mensaje claro OF por qué

// ❌ Campo fecha_vencimiento auto-calculado (365 días)
//    Pero usuario puede editarlo y se calcula cada vez que cambia dependencia
```

#### B) CumplimientoFormModal - Servicios no cargan
```tsx
// ⚠️ useEffect para cargar servicios pero hay problemas:
useEffect(() => {
  if (!isOpen || !autoevaluacionId) {
    setServicios([]);
    return;
  }
  
  const loadServicios = async () => {
    try {
      setServiciosLoading(true);
      const serviciosData = await getServiciosDeAutoevaluacion(autoevaluacionId);
      setServicios(serviciosData || []);  // ⚠️ ¿serviciosData es array o objeto?
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setServicios([]);
    } finally {
      setServiciosLoading(false);
    }
  };
  
  loadServicios();
}, [isOpen, autoevaluacionId]);
```

**Problemas**:
- Servicios pueden no cargar si API retorna formato diferente
- No hay validación de que autoevaluacionId sea válido antes de llamar
- Modal puede mostrar dropdown vacío sin indicar porque

**Impacto**: Usuarios no pueden crear cumplimientos si servicios no cargan

---

### 5️⃣ **FILTROS EN AUTOEVALUACIÓN NO FUNCIONAN** 🟠 MAJOR
**Archivo**: [HabilitacionPage.tsx](HabilitacionPage.tsx)
**Líneas**: Filtros de prestador y período
**Severidad**: MEDIA (UX)

**Problema**:
```tsx
// ❌ Múltiples estados de filtro pero no interconectados correctamente
const [filtroAutoevaluacion, setFiltroAutoevaluacion] = useState('');
const [filtroPrestadorAutoevaluacion, setFiltroPrestadorAutoevaluacion] = useState('');

// ❌ Filtro aplicado incorrectamente
let autoList = autoevaluaciones;
if (filtroEstado) autoList = autoList.filter(a => a.estado === filtroEstado);
// ❌ No está filtrando por prestador ni por período correctamente
if (filtroPrestadorAutoevaluacion) {
  autoList = autoList.filter(a => a.datos_prestador?.id === Number(filtroPrestadorAutoevaluacion));
}
```

**Impacto**: Usuarios no pueden buscar autoevaluaciones por prestador o período

---

## 📊 MATRIZ DE PROBLEMAS

| # | Problema | Severidad | Impacto | Archivos |
|---|----------|-----------|---------|----------|
| 1 | Contraste dark mode | 🔴 CRÍTICA | UX rota | AutoevaluacionCard.tsx |
| 2 | CATEGORIAS_CRITERIO error | 🔴 CRÍTICA | Runtime error | AutoevaluacionEditorPage.tsx |
| 3 | Criterios no filtran correctamente | 🟠 MAJOR | Datos confusos | AutoevaluacionEditorPage.tsx |
| 4 | Forms/Modales con issues | 🟠 MAJOR | Workflow roto | Form modals |
| 5 | Filtros no funcionan | 🟠 MAJOR | Búsqueda rota | HabilitacionPage.tsx |

---

## 🔧 PLAN DE TRABAJO

### Fase 1: Errores Críticos (PRIORIDAD MÁXIMA)
- [ ] **Tarea 1.1**: Definir/Importar `CATEGORIAS_CRITERIO` correctamente
- [ ] **Tarea 1.2**: Corregir lógica de cargar criterios por autoevaluación
- [ ] **Tarea 1.3**: Validar y arreglar carga de servicios en CumplimientoFormModal

### Fase 2: Contraste Dark Mode (PRIORIDAD ALTA)
- [ ] **Tarea 2.1**: Actualizar colores de botones AutoevaluacionCard
- [ ] **Tarea 2.2**: Validar contraste WCAG en todos los botones
- [ ] **Tarea 2.3**: Revisar otros componentes con problemas de contraste

### Fase 3: Funcionalidad (PRIORIDAD MEDIA)
- [ ] **Tarea 3.1**: Mejorar validaciones en AutoevaluacionFormModal
- [ ] **Tarea 3.2**: Implementar filtros correctamente en HabilitacionPage
- [ ] **Tarea 3.3**: Mejorar manejo de errores en modals

### Fase 4: Testing (PRIORIDAD NORMAL)
- [ ] **Tarea 4.1**: Validar correcciones en browser dev tools
- [ ] **Tarea 4.2**: Pruebas de dark mode
- [ ] **Tarea 4.3**: Pruebas de filtros

---

## 📋 CHECKLIST PRE-EJECUCIÓN

- [x] Análisis completado
- [x] Problemas identificados
- [x] Archivos afectados mapeados
- [x] Plan de trabajo creado
- [ ] Listo para ejecutar correcciones

