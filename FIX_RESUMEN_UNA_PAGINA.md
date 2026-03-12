# 🔧 Fix Rápido - Fase 5: Data Loading

---

## 🎯 El Problema
Cuando seleccionabas una autoevaluación, no se mostraban los datos (0 criterios, 0 cumplimientos, etc.) aunque el backend SÍ tenía los datos.

---

## 🔍 La Causa
El código estaba usando el parámetro **incorrecto** para llamar a las APIs:
- ❌ `autoevaluacion` ← INCORRECTO
- ✅ `autoevaluacion_id` ← CORRECTO

Por eso el backend no filtraba, y el frontend recibía TODO y NO sabía qué mostrar.

---

## ✅ La Solución (YA HECHA)
Cambié los parámetros de fetch en `AutoevaluacionEditorPage.tsx`:

```typescript
// ANTES (ROTO)
fetchCumplimientos({ autoevaluacion: autoId });

// DESPUÉS (FUNCIONA)
fetchCumplimientos({ autoevaluacion_id: autoId });
```

Mismo cambio para `fetchHallazgos` y `fetchPlanes`.

---

## 👉 QUÉ TIENES QUE HACER

### 1. Abre la aplicación en navegador

### 2. Ve a "Habilitación" → "Autoevaluaciones"

### 3. Haz click en una autoevaluación

### 4. **Verifica estos 3 tabs**:
- [ ] **Criterios**: ¿Muestra datos? (debe haber ≥ 30 items)
- [ ] **Cumplimientos**: ¿Muestra datos? (debe haber ≥ 100 items)  
- [ ] **Hallazgos**: ¿Muestra datos? (puede ser 0, es OK)

### 5. Prueba cambiar a otra autoevaluación
- ¿Los números cambian? Si sí → ✅ FUNCIONA

---

## ✓ RESULTADO ESPERADO
```
Autoevaluación: 10
├─ Criterios: 32 items ✓
├─ Cumplimientos: 441 items ✓
├─ Hallazgos: 5 items ✓
└─ Planes: 3 items ✓
```

```
Autoevaluación: 11 (diferente)
├─ Criterios: 28 items ✓ (DIFERENTE)
├─ Cumplimientos: 380 items ✓ (DIFERENTE)
├─ Hallazgos: 2 items ✓ (DIFERENTE)
└─ Planes: 7 items ✓ (DIFERENTE)
```

---

## 🎁 EXTRAS

### Si quieres ver el debug en consola:
1. Abre DevTools: `F12`
2. Haz click en una autoevaluación
3. En la pestaña "Console" busca este log:
   ```
   ✓ cumplimientos filtrados por autoevaluacion_id: 441
   ```
   (El número puede variar)

---

## ✍️ SI FUNCIONA
Por favor confirma:
> "✅ Los datos se cargan correctamente"

## 🚨 SI NO FUNCIONA
Por favor comparte:
1. ¿Qué número es autoevaluación que probaste?
2. ¿Qué dice el Console log?
3. Screenshot de lo que ves

---

## 📚 Documentación Detallada
Si quieres más detalles, lee estos archivos:
- `AUTOCORRECCIONES_FASE5.md` - Análisis técnico completo
- `TIMELINE_DEBUGGING_FASE5.md` - Todo lo que pasó
- `CHECKLIST_VERIFICACION_USUARIO.md` - Tests paso a paso

---

**Status**: ✅ Build compila  
**Solo falta**: Tu verificación en el navegador  
**Tiempo estimado**: ~5 minutos
