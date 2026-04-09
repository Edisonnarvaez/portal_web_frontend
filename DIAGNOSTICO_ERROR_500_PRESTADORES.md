# 🔴 Diagnóstico: Error 500 en `/api/habilitacion/prestadores/1/`

## Error Reportado
```
GET http://127.0.0.1:8000/api/habilitacion/prestadores/1/ 500 (Internal Server Error)
```

**Stack Trace del Frontend:**
```
DatosPrestadorRepository.ts:16 → getById()
DatosPrestadorService.ts:18 → getDatosPrestador()
PrestadorDetailPage.tsx:72 → loadPrestador via useEffect
```

---

## 📋 Diagnóstico del Problema

### ❌ Que NO es el problema:
- ✅ El endpoint URL es correcto: `/api/habilitacion/prestadores/1/`
- ✅ El método es correcto: `GET`
- ✅ La autenticación parece estar correcta (no es 401 Unauthorized)
- ✅ El ID (1) parece ser correcto (no es 404 Not Found)

### 🔍 Que SÍ es el problema:
**El backend está retornando 500 Internal Server Error**

Esto significa que hay un error no manejado en la lógica del servidor Django.

---

## 🛠️ Cómo Diagnosticar en el Backend

### 1. **Verificar logs del servidor Django**
```bash
# Si ejecutas Django en desarrollo:
python manage.py runserver

# Deberías ver un error detallado en la consola tipo:
# 
# Traceback (most recent call last):
#   File "...", line XXX, in get
#     prestador = DatosPrestador.objects.get(id=id)
#   ...
# AttributeError: 'DatosPrestador' has no attribute 'X'
```

### 2. **Verificar el endpoint en Django**
```python
# En tu views.py de habilitacion/views.py, busca:
@api_view(['GET', 'PATCH', 'DELETE'])
def prestador_detail(request, id):
    # El error probablemente ocurre aquí
    prestador = DatosPrestador.objects.get(id=id)
    # ...
```

### 3. **Posibles causas del 500:**

| Causa | Síntoma | Solución |
|-------|---------|----------|
| **Campo faltante en serializer** | `AttributeError: has no attribute` | Revisar que el serializer tenga todos los campos de DatosPrestador |
| **Relación mal configurada** | `RelatedObjectDoesNotExist` | Verificar FK/OneToOne en modelo |
| **Query mal formada** | `ValueError` en la DB query | Revisar los queryset del view |
| **Permisos insuficientes** | `PermissionDenied` no manejado | Asegurarse de que el usuario tiene permisos |
| **Base de datos incongruente** | `IntegrityError` o `ProgrammingError` | Verificar migraciones pendientes: `python manage.py migrate` |

---

## ✅ Acciones de Corrección (Frontend - Ya Completadas)

### ✔️ Mejora de Logging
Se agregó logging detallado en `PrestadorDetailPage.tsx` línea 72:
```typescript
console.error('❌ Error cargando prestador:', {
    prestadorId,
    error: errorMsg,
    rawError: err,
    endpoint: `/api/habilitacion/prestadores/${prestadorId}/`
});
```

Ahora cuando falle, verás en la consola del navegador:
```
❌ Error cargando prestador: {
  prestadorId: 1,
  error: "Internal Server Error", // Si el backend devuelve esto
  rawError: [...],
  endpoint: "/api/habilitacion/prestadores/1/"
}
```

### ✔️ Icono actualizado para Soportes
El icono en el Sidebar ahora es `HiDocumentStack` (más apropiado)

### ✔️ Responsividad mejorada en SoportesPage
- Layout responsive en mobile
- Grid adaptativo: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Sticky sidebar solo en pantallas grandes (lg)
- Buttons responsive: full-width en mobile, auto en desktop

---

## 🚀 Pasos Recomendados

### **Opción 1: Revisar Backend (RECOMENDADO)**
1. Abre terminal en proyecto Django
2. Ejecuta: `python manage.py runserver 8000`
3. Intenta acceder: `http://127.0.0.1:8000/api/habilitacion/prestadores/1/`
4. Lee el error detallado en la consola
5. Corrige el error en el backend
6. Reinicia el servidor

### **Opción 2: Verificar Datos**
```bash
# En Django shell
python manage.py shell

>>> from habilitacion.models import DatosPrestador
>>> DatosPrestador.objects.all()  # ¿Existe algun registro?
>>> DatosPrestador.objects.get(id=1)  # ¿Existe el ID 1?
>>> # Si no existe, crea test data
```

### **Opción 3: Verificar Migraciones**
```bash
# Asegúrate de que todas las migraciones están aplicadas
python manage.py migrate habilitacion
```

---

## 📝 Notas Técnicas

### Endpoint Afectado
```
GET /api/habilitacion/prestadores/{id}/
Usado por: PrestadorDetailPage cuando carga los detalles del prestador
```

### Métodos Relacionados
```typescript
// Frontend
DatosPrestadorRepository.getById(id)
    ↓
DatosPrestadorService.getDatosPrestador(id)
    ↓
PrestadorDetailPage.loadPrestador()
```

### Variables de Entorno Relevantes
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 📞 Próximas acciones si persiste el error

1. ✅ **Verificar logs del backend** (más importante)
2. ✅ **Confirmar que DatosPrestador.id=1 existe**
3. ⏳ **Si el error es de serializer**: verifica que `DatosPrestadorSerializer` tiene todos los campos necesarios
4. ⏳ **Si el error es de relación**: verifica las FK en el modelo

---

**Actualizado**: Abril 9, 2026  
**Estado**: 🔍 Esperando diagnóstico del backend
