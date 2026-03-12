# ✅ Checklist de Verificación - Fase 5

**Versión**: 1.0  
**Propósito**: Verificación rápida de que la carga de datos funcionasuma correctamente

---

## 🚀 Pasos Pre-Test

- [ ] Haber ejecutado `npm run build` exitosamente (sin errores)
- [ ] Tener la aplicación corriendo (`npm run dev`)
- [ ] Abrir DevTools (Presionar `F12`)
- [ ] Ir a tab `Console` en DevTools
- [ ] Estar en página: **Habilitación → Autoevaluaciones**

---

## ✅ Test Principal: Cargar Datos de Autoevaluación

### Paso 1: Seleccionar Autoevaluación
- [ ] Hacer click en el botón de una autoevaluación de la lista
- [ ] La página debe cambiar al editor de autoevaluación (AutoevaluacionEditorPage)
- [ ] Ver URL: `http://localhost:5173/...#/autoevaluaciones/10` (el número puede variar)

### Paso 2: Verificar Tab "Criterios"
- [ ] Tab debe estar activo y visible
- [ ] Debe mostrar una tabla con datos
- [ ] **COUNT ESPERADO**: ≥ 1 criterio (típicamente 30-40)
- [ ] **¿Qué debería ver?**: Tabla con columnas: Código, Nombre, etc.

**✓ PASS**: Si hay datos en la tabla  
**✗ FAIL**: Si dice "No hay criterios disponibles" (error anterior)

### Paso 3: Verificar Tab "Cumplimientos"
- [ ] Hacer click en el tab "Cumplimientos"
- [ ] Debe mostrar tabla con cumplimientos
- [ ] **COUNT ESPERADO**: ≥ 1 cumplimiento (típicamente 100-500)
- [ ] **¿Qué debería ver?**: Tabla con criterio, estado (CUMPLE/NO_CUMPLE/PARCIAL), etc.

**✓ PASS**: Si hay datos > 0  
**✗ FAIL**: Si dice "No hay cumplimientos" o muestra 0 items

### Paso 4: Verificar Console Logs
- [ ] Abrir **DevTools → Console**
- [ ] Buscar este log: `✓ cumplimientos filtrados por autoevaluacion.id: XXX`
- [ ] **¿Qué significa?**: Backend filtró correctamente
- **O alternativa**: `✓ cumplimientos (backend ya filtrado): XXX`
- [ ] **¿Qué significa?**: Frontend hizo fallback, datos son correctos

**✓ PASS**: Si ves uno de estos logs  
**✗ FAIL**: Si no ves ningún log de "✓ cumplimientos"

---

## 🔄 Test Secundario: Cambiar Entre Autoevaluaciones

### Paso 5: Verificar Cambio de Datos
- [ ] Seleccionar otra autoevaluación diferente (ej: ID 11 en lugar de 10)
- [ ] Esperar a que cargue (ver spinning loader)
- [ ] Verificar que los **números cambian**
  - Ej: Antes había 100 cumplimientos → Ahora hay 150
  - Ej: Antes había 30 criterios → Ahora hay 35
- [ ] **¿Qué debería ver?**: Datos DIFERENTES para cada autoevaluación

**✓ PASS**: Si los números son diferentes  
**✗ FAIL**: Si ves exactamente los mismos datos (indica data stale/no filtrada)

### Paso 6: Verificar Volver a Anterior
- [ ] Seleccionar la primera autoevaluación de nuevo
- [ ] Esperar a que cargue
- [ ] **¿Qué debería ver?**: Los mismos datos que Step 5 (los de la primera)

**✓ PASS**: Si ves los datos originales  
**✗ FAIL**: Si ves datos mezclados

---

## 🎨 Test Terciario: Dark Mode (Opcional)

### Paso 7: Verificar Dark Mode
- [ ] Activar dark mode (botón en header o global setting)
- [ ] Los datos deben ser visibles y legibles
- [ ] Los botones deben tener contraste suficiente
- [ ] Los tabs debe verse claramente

**✓ PASS**: Todo visible y legible en dark mode  
**✗ FAIL**: Textos desaparecen o botones sin contraste

---

## 🚨 Test Edge Case (Si aplica)

### Paso 8: Autoevaluación Sin (o Con Pocos) Datos
- [ ] Intentar encontrar una autoevaluación que NO tenga cumplimientos
- [ ] Hacer click para abrirla
- [ ] **¿Qué debería ver?**: Mensaje "No hay cumplimientos" (correcto estado vacío)
- [ ] **¿Qué NO debería ver?**: Un error o crash

**✓ PASS**: Mensaje limpio de estado vacío  
**✗ FAIL**: Error, crash, o datos incoherentes

---

## 📊 Resultado Final

### Si TODOS los tests pasan: ✅ ¡FASE 5 COMPLETADA!
- La carga de datos funciona correctamente
- El fix del parámetro `autoevaluacion_id` es exitoso
- Puedes usar el módulo de autoevaluaciones normalmente

### Si ALGÚN test falla: ⚠️ NECESITA DEBUGGING
- Abrir issue con:
  - [ ] Screenshot de la falla
  - [ ] Console logs (DevTools)
  - [ ] ¿Qué número de autoevaluación (ID) usaste?
  - [ ] Cuál test exacto falló (paso 1-8)

---

## 🔧 Troubleshooting Rápido

### Síntoma: "No hay datos"
- [ ] ¿Completaste paso 1? (Verificar que abrió editor)
- [ ] ¿DevTools muestra algún error en red? (tab Network)
- [ ] ¿Backend está corriendo? (¿verifica que las APIs responden)

### Síntoma: "Datos están lentos"
- [ ] Normal si hay muchos datos (>1000 items)
- [ ] Abre DevTools → Network → calcula tiempo de respuesta
- [ ] Si > 5 segundos → problemas de performance (reportar)

### Síntoma: "Datos iguales en ambas autoevaluaciones"
- [ ] Esto significa que `autoevaluacion_id` NO está siendo usado
- [ ] Verificar console.log: debe decir "filtrados", no "backend ya filtrado"
- [ ] Si dice "backend ya filtrado": el fallback funcionó, debería estar bien

### Síntoma: "Textos en negrita no se ven en dark mode"
- [ ] Problema conocido, será arreglado en optimizaciones posteriores
- [ ] Cambiar a light mode temporalmente o ajustar dark mode settings

---

## 🎯 Tiempo Estimado
- Test 1-4: **~2 minutos**
- Test 5-6: **~1 minuto**
- Test 7-8: **~2 minutos** (si aplica)
- **Total**: ~5 minutos

---

## ✉️ Reportar Resultado

**Por favor responde** uno de estos:

```
✅ EXITOSO: "Todos los tests pasan. Datos se cargan correctamente!"
❌ FALLA: "[Especificar cuál paso falla y copiar error de console]"
⚠️ PARCIAL: "[Describir qué funciona y qué no]"
```

---

**Documento creado**: Marzo 2025  
**Versión**: 1.0  
**Última actualización**: Fase 5 - Debugeo completado  

🎯 **Estado**: ⏳ AWAITING USER TESTING RESULTS
