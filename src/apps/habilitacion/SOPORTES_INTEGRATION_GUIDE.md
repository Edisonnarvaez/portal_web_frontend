# 🔗 Guía de Integración - SoportesPage

## 📋 Descripción General

El **SoportesPage** está completamente integrado en toda la aplicación de habilitación. Esto permite a los usuarios gestionar documentos de soporte para cada prestador desde múltiples puntos de acceso.

---

## 🚀 Puntos de Acceso a SoportesPage

### 1️⃣ **HabilitacionPage (Página Principal)**
- **Ubicación**: Tabla de Prestadores
- **Acción**: Botón "Soportes" en la columna "Acciones"
- **Ruta**: `/habilitacion/soportes/{prestadorId}`
- **Comportamiento**: Abre SoportesPage con el prestador seleccionado

```typescript
// En HabilitacionPage.tsx, línea ~273
onVerSoportes: (id) => navigate(`/habilitacion/soportes/${id}`),
```

---

### 2️⃣ **PrestadorDetailPage (Detalle del Prestador)**
- **Ubicación**: Botón superior junto a "Renovar", "Editar", "Eliminar"
- **Color**: Púrpura (#a855f7)
- **Icono**: HiOutlineDocumentText
- **Ruta**: `/habilitacion/soportes/{prestadorId}`
- **Comportamiento**: Navega a SoportesPage con el prestador actual

```typescript
// En PrestadorDetailPage.tsx, línea ~228
<button
  onClick={() => navigate(`/habilitacion/soportes/${prestador.id}`)}
  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
>
  <HiOutlineDocumentText className="h-4 w-4" /> Soportes
</button>
```

---

### 3️⃣ **DashboardHabilitacionPageEnhanced (Dashboard)**
- **Ubicación**: KPI Card en la primera fila (primer elemento)
- **Color**: Índigo
- **Icono**: HiOutlineDocumentText
- **Valor**: "Gestionar"
- **Ruta**: `/habilitacion/soportes` (sin ID - muestra pantalla de selección)
- **Comportamiento**: Muestra la pantalla "Selecciona un Prestador"

```typescript
// En DashboardHabilitacionPageEnhanced.tsx, línea ~323
<KPICard
  title="Soportes"
  value="Gestionar"
  icon={<HiOutlineDocumentText className="h-7 w-7" />}
  color="indigo"
  onClick={() => navigate('/habilitacion/soportes')}
/>
```

---

### 4️⃣ **AccionesContextuales (Componente de Contexto)**
- **Ubicación**: Menú de acciones dinámicas en tablas
- **Disponibilidad**: Siempre visible
- **Icono**: HiOutlineDocumentText
- **Label**: "Soportes" (compacto)
- **Ruta**: `/habilitacion/soportes/{prestadorId}`

```typescript
// En AccionesContextuales.tsx, línea ~60
onVerSoportes: (id) => navigate(`/habilitacion/soportes/${id}`),
```

---

## 🔄 Flujo de Navegación

```
┌─ HabilitacionPage (Prestadores tabla)
│  └─> [Botón Soportes] ─> /habilitacion/soportes/{id}
│
├─ PrestadorDetailPage
│  └─> [Botón Morado Soportes] ─> /habilitacion/soportes/{id}
│
├─ DashboardHabilitacionPageEnhanced
│  └─> [KPI Card Soportes] ─> /habilitacion/soportes
│      (sin ID, muestra pantalla de selección)
│
└─ SoportesPage
   ├─ Si tiene prestadorId: Carga datos del prestador
   └─ Si NO tiene ID: Muestra "Selecciona un Prestador"
```

---

## 📌 Rutas Disponibles

| Ruta | Comportamiento | Ejemplo |
|------|---|---|
| `/habilitacion/soportes/:prestadorId` | Abre SoportesPage con prestador específico | `/habilitacion/soportes/1` |
| `/habilitacion/soportes` | Muestra pantalla "Selecciona un Prestador" | Accesible desde Dashboard |

---

## 🎯 Integración en Otros Componentes

### Si necesitas agregar navegación a Soportes en otro lugar:

```typescript
import { useNavigate } from 'react-router-dom';

// Dentro del componente
const navigate = useNavigate();

// Para ir a Soportes de un prestador específico
const goToSoportes = (prestadorId: number) => {
  navigate(`/habilitacion/soportes/${prestadorId}`);
};

// Para ir a Soportes sin ID (pantalla de selección)
const goToSoportesDashboard = () => {
  navigate('/habilitacion/soportes');
};

// En el JSX
<button onClick={() => goToSoportes(prestador.id)}>
  Ver Soportes
</button>
```

---

## ✅ Funcionalidades de SoportesPage

Una vez dentro de SoportesPage, el usuario puede:

### 📤 Subir Documentos
- Seleccionar nivel: EMPRESA, SEDE, SERVICIO
- Subir archivos con validación
- Auto-versionado

### 👁️ Ver Documentos
- Listado en grid o tabla
- Ver detalles completos
- Historial de versiones

### ✏️ Editar Metadatos
- Cambiar fecha de vencimiento
- Agregar observaciones

### 🗑️ Eliminar Documentos
- Con confirmación
- Soft delete

### 🔍 Filtrar por Categoría
- Dinámico según categorías disponibles

---

## 🛠️ Archivos Modificados

En esta integración se lograron los siguientes cambios:

| Archivo | Cambios |
|---------|---------|
| `AccionesContextuales.tsx` | ➕ Agregadas acciones `onVerSoportes` + icon |
| `HabilitacionPage.tsx` | ➕ Agregado callback `onVerSoportes` en tabla |
| `PrestadorDetailPage.tsx` | ➕ Botón "Soportes" púrpura en header |
| `DashboardHabilitacionPageEnhanced.tsx` | ➕ KPI Card para Soportes en dashboard |

---

## 🧪 Testing & Verificación

Todos los cambios han sido verificados sin errores de compilación:

```
✅ AccionesContextuales.tsx - No errors
✅ HabilitacionPage.tsx - No errors
✅ PrestadorDetailPage.tsx - No errors
✅ DashboardHabilitacionPageEnhanced.tsx - No errors
```

---

## 📱 Responsividad

Todas las integraciones son totalmente responsivas:
- ✅ Mobile: Botones adaptados
- ✅ Tablet: Diseño flexible
- ✅ Desktop: Completo funcional

---

## 🔐 Notas de Seguridad

- Todas las rutas requieren autenticación (protegidas por authGuard)
- Los IDs de prestador se validan en el backend
- Los permisos se verifican en SoportesPage

---

## 📞 Referencias

- **Rutas**: `src/apps/habilitacion/routes.tsx`
- **SoportesPage**: `src/apps/habilitacion/presentation/pages/SoportesPage.tsx`
- **useSoporte Hook**: `src/apps/habilitacion/presentation/hooks/useSoporte.ts`

---

**Última actualización**: Abril 10, 2026
**Status**: ✅ Completado - Listo para producción
