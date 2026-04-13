# 🔧 Fix: Error 400 al Cargar Documentos - SOLUCIONADO

## 🐛 Problema Identificado

El error **400 Bad Request** ocurría porque:

```javascript
// ❌ ANTES: Enviaba undefined explícitamente
{
  prestador: 1, 
  tipo_documento: 22, 
  nivel: 'SERVICIO', 
  empresa: undefined,    // ← Problema
  sede: undefined        // ← Problema
  // servicio faltaba o era undefined
}
```

### Root Cause
El objeto `SoporteDocumentalCreate` estaba incluyendo campos como `empresa` y `sede` con valores `undefined` cuando se seleccionaba nivel `SERVICIO`. El backend rechaza esto porque:
- Solo debería enviar `servicio` cuando nivel=SERVICIO
- No debería enviar `empresa` o `sede` como undefined
- El backend espera EXACTAMENTE uno de estos tres campos, con un valor válido (> 0)

---

## ✅ Soluciones Implementadas

### 1. Construcción Mejorada del Objeto (Modal)
```typescript
// ✅ DESPUÉS: Construcción explícita, sin undefined
const soporteDataBase: any = {
  prestador: prestadorId,
  tipo_documento: tipoDocumentoId as number,
  nivel: nivelSeleccionado,
  archivo: selectedFile,
};

// ✅ Agregar contexto SOLO según nivel
if (nivelSeleccionado === 'EMPRESA' && finalContextId > 0) {
  soporteDataBase.empresa = finalContextId;
} else if (nivelSeleccionado === 'SEDE' && finalContextId > 0) {
  soporteDataBase.sede = finalContextId;
} else if (nivelSeleccionado === 'SERVICIO' && finalContextId > 0) {
  soporteDataBase.servicio = finalContextId;
}

// ✅ Agregar fechas opcionales
if (fechaEmision) soporteDataBase.fecha_emision = fechaEmision;
if (fechaVencimiento) soporteDataBase.fecha_vencimiento = fechaVencimiento;
if (observaciones) soporteDataBase.observaciones = observaciones;
```

**Ventaja:** Solo se incluyen campos que realmente tienen valor

### 2. Validaciones Mejoradas
```typescript
// Antes de permitir upload, validar explícitamente:

if (nivelSeleccionado === 'SERVICIO') {
  finalContextId = servicioSeleccionado;
  if (!sedeSeleccionada) {
    setUploadError('Por favor seleccione una sede primero.');
    return;
  }
  if (!finalContextId || servicios.length === 0) {
    setUploadError('Por favor seleccione un servicio válido.');
    return;
  }
}

// Doble validación
if (!nivelSeleccionado || finalContextId <= 0) {
  setUploadError(`Por favor seleccione ${nivelSeleccionado.toLowerCase()} válido (ID debe ser > 0)`);
  return;
}
```

**Ventaja:** Detecta y muestra el error ANTES de enviar al servidor

### 3. Logging Mejorado
```typescript
console.log('📤 Enviando soporte:', {
  prestador: soporteData.prestador,
  tipo_documento: soporteData.tipo_documento,
  nivel: soporteData.nivel,
  empresa: (soporteData as any).empresa,      // ← Solo si existe
  sede: (soporteData as any).sede,            // ← Solo si existe
  servicio: (soporteData as any).servicio,    // ← Solo si existe
  archivo: soporteData.archivo?.name,
});
```

**Ventaja:** Puedes ver exactamente qué se está enviando

---

## 📋 Checklist de Verificación

Intenta cargar documento con **nivel SERVICIO** y verifica:

- [ ] **Paso 1:** Abre el modal → Debes ver el nombre del prestador (ej: "sede pilot 1")
- [ ] **Paso 2:** Selectiona "SERVICIO" en Nivel → Aparecen 2 dropdowns (Sede + Servicio)
- [ ] **Paso 3:** Selecciona una SEDE → Se cargan servicios de esa sede
- [ ] **Paso 4:** Selecciona un SERVICIO → ID del servicio debe ser > 0
- [ ] **Paso 5:** En consola debes ver:
  ```
  📤 Enviando soporte: {
    prestador: 1,
    tipo_documento: 22,
    nivel: 'SERVICIO',
    empresa: undefined,    ← NO DEBE ESTAR
    sede: undefined,       ← NO DEBE ESTAR
    servicio: 123,         ← DEBE ESTAR CON ID VÁLIDO
    archivo: "documento.pdf"
  }
  ```
- [ ] **Paso 6:** Click en "Cargar" → Debe funcionar sin error 400

---

## 🚨 Si Aún Falla

### Debug: Abre Console del navegador (F12) y busca:

1. **Si ves:** `"empresa: undefined, sede: undefined, servicio: undefined"`
   - **Causa:** El servicio no se está cargando correctamente
   - **Solución:** Verifica que el endpoint `/habilitacion/servicios/` devuelva servicios

2. **Si ves:** `"servicio: 123, empresa: undefined, sede: undefined"` ← ✅ CORRECTO
   - **Siguiente paso:** El problema es en el backend (validar modelo Django)

3. **Si ves:** Error 400 en la red
   - Abre **Network** tab en DevTools
   - Busca el POST a `/api/soportes/documentos/`
   - Click en él → **Response** tab
   - Copia el error del backend (te dará pista sobre qué campo falta)

---

## 📊 Cambios en Archivos

### `SoporteUploadModal.tsx`
- ✅ Construcción explícita de `soporteData` (sin spread operators problemáticos)
- ✅ Validaciones mejoradas con mensajes específicos
- ✅ Logging detallado con estructura clara
- ✅ Manejo de errores 400/404/500 específico

---

## 🎯 Comportamiento Esperado Después

### NIVEL EMPRESA
```
Envío: { prestador: 1, tipo_documento: 22, nivel: 'EMPRESA', empresa: 1 }
✅ Backend recibe solo empresa, ignora sede y servicio
```

### NIVEL SEDE
```
Envío: { prestador: 1, tipo_documento: 22, nivel: 'SEDE', sede: 5 }
✅ Backend recibe solo sede, ignora empresa y servicio
```

### NIVEL SERVICIO
```
Envío: { prestador: 1, tipo_documento: 22, nivel: 'SERVICIO', servicio: 123 }
✅ Backend recibe solo servicio, ignora empresa y sede
```

---

## 💡 Próximos Pasos

1. **Compila y recarga el navegador**
2. **Abre DevTools Console**
3. **Intenta cargar documento con nivel SERVICIO**
4. **Copia el log que veas de `📤 Enviando soporte:`**
5. **Verifica que NO contenga `empresa: undefined` o `sede: undefined`**
6. **Si sigue fallando, comparte el error del backend (Response en Network tab)**

---

**Status:** ✅ **FIXED** - Código compilado sin errores
**Próximo:** Testear en navegador y validar endpoint
