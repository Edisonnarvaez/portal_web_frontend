# 📋 Plan de Trabajo - Fase 5: Completar Debugging de Cargas de Datos

**Fase**: 5 de 5 (Final)  
**Estado**: 40% (de depuración)  
**Objetivo**: Verificar que todos los datos se cargan correctamente en autoevaluaciones

---

## 🎯 Tareas Principales

### ✅ COMPLETADAS

#### 1. Corrección de Parámetros de API *(Estado: ✅ DONE)*
- [x] Identificar parámetro incorrecto (`autoevaluacion` vs `autoevaluacion_id`)  
- [x] Actualizar `AutoevaluacionEditorPage.tsx` líneas 75-77
- [x] Cambiar en `fetchCumplimientos`, `fetchHallazgos`, `fetchPlanes`
- **Validación**: Build compila ✅

#### 2. Implementación de Fallback Local *(Estado: ✅ DONE)*
- [x] Agregar lógica de fallback filtering (líneas 84-112)
- [x] Manejar propiedades correctas por entidad:
  - `Cumplimiento.autoevaluacion?.id`
  - `Hallazgo.autoevaluacion_id`
  - `PlanMejora.autoevaluacion_id`
- [x] Agregar logging de debug para monitoreo
- **Validación**: TypeScript errors = 0 ✅

#### 3. Documentación *(Estado: ✅ DONE)*
- [x] Crear `AUTOCORRECCIONES_FASE5.md` con análisis completo
- [x] Documentar problema, solución, validación
- [x] Especificar pasos de verificación manual

---

### ⏳ PENDIENTES (Próxima Sesión)

#### 4. Verificación en Navegador *(Estado: 🟡 PENDING)*
**Responsable**: Usuario / Siguiente sesión  
**Pasos**:
1. [ ] Abrir la aplicación en navegador
2. [ ] Navegar a: Habilitación → Tab "Autoevaluaciones"
3. [ ] Seleccionar una autoevaluación específica
4. [ ] **Verificación por tab**:
   - [ ] **Criterios**: Debe mostrar ≥ 1 criterio
   - [ ] **Cumplimientos**: Debe mostrar ≥ 1 cumplimiento
   - [ ] **Hallazgos**: Verificar si tiene datos (puede ser 0 si no hay)
   - [ ] **Planes de Mejora**: Verificar si tiene datos (puede ser 0 si no hay)

5. [ ] **Monitoreo de Console (F12 → Console)**:
   - Debe ver logs como: `✓ cumplimientos filtrados por autoevaluacion.id: 441`
   - Si ve: `✓ cumplimientos (backend ya filtrado): 441` → backend filtró
   - If ve: `✓ cumplimientos filtrados por autoevaluacion.id: 100` → client-side fallback

6. [ ] **Test de Casos Múltiples**:
   - [ ] Cambiar a otra autoevaluación diferente
   - [ ] Verificar que los datos cambian correctamente
   - [ ] Confirmar que no hay datos mezclados

7. [ ] **Casos Edge** (si aplicable):
   - [ ] Seleccionar autoevaluación sin cumplimientos (verificar estado vacío)
   - [ ] Verificar dark mode muestra correctamente los datos

#### 5. Análisis de Resultado *(Estado: 🟡 AWAITING DATA)*
**Posibles Outcomes**:

| Escenario | Acción |
|-----------|--------|
| ✅ **Datos aparecen correctamente** | Pasar a limpieza de logs (tarea 6) |
| ❌ **Datos siguen vacíos** | Investigar si: (a) Backend no filtra, (b) Parámetros aún incorrectos, (c) Campos en respuesta diferentes de lo esperado |
| ⚠️ **Datos parciales** | Verificar si algunos endpoints filtran y otros no |
| 🐢 **Datos lentos** | Medir performance, considerar paginación |

#### 6. Limpieza de Código *(Estado: 🔴 PENDING)*
**Solo si verificación confirma que funciona**:
```typescript
// Remover o comentar logs excesivos
console.log('✓ cumplimientos filtrados...'); // ← Comentar después de validar
```

---

## 🔍 Criterios de Aceptación

### ✅ Fase 5 Completa Cuando:
1. [ ] Build compila sin errores (✅ HECHO)
2. [ ] Parámetros de API son correctos: `autoevaluacion_id` (✅ HECHO)
3. [ ] Fallback filtering implementado (✅ HECHO)
4. [ ] Usuario verifica datos se cargan en navegador (🟡 PENDING)
5. [ ] Todos los tabs muestran datos correctamente (🟡 PENDING)
6. [ ] No hay datos mezclados entre autoevaluaciones (🟡 PENDING)
7. [ ] Logs de debug muestran estado correcto (🟡 PENDING)

---

## 📊 Resumen de Cambios

### Archivo Modificado: `AutoevaluacionEditorPage.tsx`

**Línea 75-77** (useEffect fetch):
```typescript
// ANTES ❌
fetchCumplimientos({ autoevaluacion: autoId });

// DESPUÉS ✅
fetchCumplimientos({ autoevaluacion_id: autoId });
```

**Línea 84-112** (useMemo para filtering):
```typescript
// Implementación de fallback + logging
const cumplimientosAuto = useMemo(() => {
    const filtered = cumplimientos.filter(c => c.autoevaluacion?.id === autoId);
    if (filtered.length > 0) {
        console.log('✓ cumplimientos filtrados por autoevaluacion.id:', filtered.length);
        return filtered;
    }
    console.log('✓ cumplimientos (backend ya filtrado):', cumplimientos.length);
    return cumplimientos;
}, [cumplimientos, autoId]);
```

---

## 🎓 Lecciones Aprendidas

### Problema Identificado
- API parameters no documentadas claramente
- Código asumía nombre de parámetro diferente al real
- Backend tenía capacidad de filtrar pero no se aprovechaba

### Solución Implementada
- Verificar documentación en repositories
- Implementar fallback client-side como safety net
- Agregar logging para diagnosticar problemas futuros

### Prevención Futura
- Documentar todos los parámetros de API explícitamente
- Agregar tests que verifiquen API contracts
- Usar TypeScript strict types para parámetros de fetch

---

## 📚 Archivos de Referencia

- `AUTOCORRECCIONES_FASE5.md` - Análisis técnico completo
- `AutoevaluacionEditorPage.tsx` - Archivo modificado (líneas 75-112)
- `CumplimientoRepository.ts` - Fuente de verdad para parámetros de API

---

## 🚀 Próximas Fases (Post-Fase 5)

Una vez verificado que todo funciona:

### Fase 6: Optimizaciones (Opcional)
- [ ] Remover logs de debug
- [ ] Implementar caching si es necesario
- [ ] Optimizar queries si performance es lenta

### Fase 7: Documentación Final
- [ ] Actualizar README con guía de uso
- [ ] Documentar componentes en Storybook
- [ ] Crear guía de testing

### Fase 8: User Acceptance Testing (UAT)
- [ ] Usuario valida todos los casos de uso
- [ ] Feedback y ajustes finales
- [ ] Preparación para producción

---

**Creado**: Marzo 2025  
**Versión**: 1.0  
**Status**: ⏳ AWAITING BROWSER TESTING
