# 🔍 Revisión de Modelos Backend - Soportes

## ❌ PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **FALTA RELACIÓN A DatosPrestador**
**Severidad:** 🔴 CRÍTICA

**Problema:**
- El frontend usa `prestadorId` para filtrar soportes
- El backend NO tiene referencia a `DatosPrestador` en `SoporteDocumental`
- `SoporteDocumental` solo referencia: `Company`, `Headquarters`, `ServicioSede`
- Los soportes no pueden identificar a qué "prestador" pertenecen

**Modelo Actual:**
```python
class SoporteDocumental(models.Model):
    empresa = ForeignKey('companies.Company', ...)
    sede = ForeignKey('companies.Headquarters', ...)
    servicio = ForeignKey('habilitacion.ServicioSede', ...)
    # ❌ NO TIENE: prestador = ForeignKey('habilitacion.DatosPrestador', ...)
```

**Impacto Frontend:**
- Endpoint: `GET /api/habilitacion/prestadores/1` (ID de prestador)
- Frontend envía: `prestadorId = 1`
- Backend no sabe qué es ese ID (no existe en SoporteDocumental)

**Solución Recomendada:**
```python
class SoporteDocumental(models.Model):
    # 🔥 AGREGAR ESTA LINEA
    prestador = models.ForeignKey(
        'habilitacion.DatosPrestador',
        on_delete=models.CASCADE,
        related_name='soportes_documentales',
        help_text='Prestador propietario de este documento soporte'
    )
    
    # Campos existentes...
    empresa = ForeignKey('companies.Company', null=True, blank=True, ...)
    sede = ForeignKey('companies.Headquarters', null=True, blank=True, ...)
    servicio = ForeignKey('habilitacion.ServicioSede', null=True, blank=True, ...)
```

---

### 2. **nivel_aplica NULLABLE en TipoDocumentoSoporte**
**Severidad:** 🟠 ALTA

**Problema:**
```python
# Backend (ACTUAL - INCORRECTO)
nivel_aplica = models.CharField(
    max_length=10,
    choices=NIVEL_CHOICES,
    null=True,      # 🔥 TEMPORAL - DEBERÍA SER FALSE
    blank=True      # 🔥 TEMPORAL - DEBERÍA SER FALSE
)
```

**Impacto:**
- Puedes crear `TipoDocumentoSoporte` sin especificar `nivel_aplica`
- La validación en `SoporteDocumental.clean()` falla si `nivel_aplica` es None:
  ```python
  # Admin va a dar error cuando valide
  if self.tipo_documento.nivel_aplica != self.nivel:  # None != 'EMPRESA' siempre es True
      raise ValidationError(...)
  ```

**Solución:**
```python
# Backend (CORRECTO)
nivel_aplica = models.CharField(
    max_length=10,
    choices=NIVEL_CHOICES,
    null=False,  # ✅ NO NULLABLE
    blank=False  # ✅ REQUERIDO
)

# Frontend (ACTUAL - CORRECTO pero debería validar)
export interface TipoDocumentoSoporte {
    nivel_aplica?: NivelAplica;  // Debería ser: nivel_aplica: NivelAplica (sin ?)
}
```

---

### 3. **VALIDACIÓN CONTRADICTORIA EN SoporteDocumental**
**Severidad:** 🟠 ALTA

**Problema:**
```python
def clean(self):
    # Validación 1: Exactamente una relación
    relaciones = [self.empresa_id, self.sede_id, self.servicio_id]
    relaciones_set = sum(1 for rel in relaciones if rel)
    
    if relaciones_set != 1:
        raise ValidationError('Debe asociar exactamente una relación...')
    
    # Validación 2: Pero también debe tener prestador
    # ❌ NO ESTÁ AQUÍ - FALTA VALIDAR prestador_id
```

**Impacto:**
- Los soportes se crean sin validar que pertenecen a un prestador
- No hay consistencia en la jerarquía: Prestador → (Empresa/Sede/Servicio)

**Solución:**
```python
def clean(self):
    super().clean()
    
    # ✅ NUEVA VALIDACIÓN: Debe tener prestador
    if not self.prestador_id:
        raise ValidationError({'prestador': 'Debe seleccionar prestador.'})
    
    # Validación existente de relaciones multinivel...
    relaciones = [self.empresa_id, self.sede_id, self.servicio_id, self.prestador_id]
    relaciones_set = sum(1 for rel in relaciones if rel)
    
    if relaciones_set != 2:  # prestador + uno de (empresa/sede/servicio)
        raise ValidationError(
            'Debe tener prestador + exactamente una relación (empresa/sede/servicio).'
        )
```

---

### 4. **SoporteRequerido NO VINCULADO A DatosPrestador**
**Severidad:** 🟠 ALTA

**Problema:**
```python
class SoporteRequerido(models.Model):
    empresa = ForeignKey('companies.Company', null=True, blank=True, ...)
    sede = ForeignKey('companies.Headquarters', null=True, blank=True, ...)
    servicio = ForeignKey('habilitacion.ServicioSede', null=True, blank=True, ...)
    # ❌ FALTA prestador = ForeignKey('habilitacion.DatosPrestador', ...)
```

**Impacto:**
- El checklist de documentos requeridos no sabe a qué prestador pertenece
- No hay trazabilidad clara

**Solución:**
```python
class SoporteRequerido(models.Model):
    # ✅ AGREGAR prestador como FK
    prestador = models.ForeignKey(
        'habilitacion.DatosPrestador',
        on_delete=models.CASCADE,
        related_name='soportes_requeridos',
        null=False  # ✅ REQUERIDO
    )
    
    empresa = ForeignKey('companies.Company', null=True, blank=True, ...)
    sede = ForeignKey('companies.Headquarters', null=True, blank=True, ...)
    servicio = ForeignKey('habilitacion.ServicioSede', null=True, blank=True, ...)
    tipo_documento = ForeignKey(TipoDocumentoSoporte, ...)
```

---

### 5. **CONSULTA: "scope_filter" SIN PRESTADOR**
**Severidad:** 🟠 ALTA

**Problema:**
```python
def _scope_filter(self):
    if self.nivel == 'EMPRESA':
        return Q(nivel='EMPRESA', empresa_id=self.empresa_id)
    # ... pero NO FILTRA POR prestador_id
```

**Impacto:**
- Dos prestadores podrían tener documentos del mismo tipo_documento para la misma empresa
- No hay aislamiento de datos por prestador

**Solución:**
```python
def _scope_filter(self):
    base_q = Q(prestador_id=self.prestador_id)  # ✅ SIEMPRE filtrar por prestador
    
    if self.nivel == 'EMPRESA':
        return base_q & Q(nivel='EMPRESA', empresa_id=self.empresa_id)
    
    if self.nivel == 'SEDE':
        return base_q & Q(nivel='SEDE', sede_id=self.sede_id)
    
    return base_q & Q(nivel='SERVICIO', servicio_id=self.servicio_id)
```

---

## 🔧 CAMBIOS RECOMENDADOS (ORDEN EJECUCIÓN)

### **PASO 1: Migration - Agregar prestador a SoporteDocumental**
```python
# En soportes/models.py
class SoporteDocumental(models.Model):
    prestador = models.ForeignKey(
        'habilitacion.DatosPrestador',
        on_delete=models.CASCADE,
        related_name='soportes_documentales',
        default=None,  # Temporal para la migración
        null=True,
        blank=True
    )
    # ... resto de campos
    
# Luego hacer makemigrations y crear data migration para poblar prestadores existentes
```

### **PASO 2: Migration - Agregar prestador a SoporteRequerido**
```python
class SoporteRequerido(models.Model):
    prestador = models.ForeignKey(
        'habilitacion.DatosPrestador',
        on_delete=models.CASCADE,
        related_name='soportes_requeridos',
        default=None,  # Temporal para la migración
        null=True,
        blank=True
    )
```

### **PASO 3: Fix - Hacer nivel_aplica NO NULLABLE**
```python
class TipoDocumentoSoporte(models.Model):
    nivel_aplica = models.CharField(
        max_length=10,
        choices=NIVEL_CHOICES,
        null=False,  # ✅ CAMBIAR DE True a False
        blank=False  # ✅ CAMBIAR DE True a False
    )
```

### **PASO 4: Update - Validaciones en clean()**
```python
# SoporteDocumental.clean()
def clean(self):
    super().clean()
    
    # Validar prestador
    if not self.prestador_id:
        raise ValidationError({'prestador': 'Debe seleccionar prestador.'})
    
    # Validar nivel
    if not self.nivel:
        raise ValidationError({'nivel': 'Debe seleccionar nivel.'})
    
    # Resto de validaciones... actualizar scope_filter
```

### **PASO 5: Update - Unique Together Constraints**
```python
class SoporteRequerido(models.Model):
    # Antes
    unique_together = ('empresa', 'sede', 'servicio', 'tipo_documento')
    
    # Después
    unique_together = ('prestador', 'empresa', 'sede', 'servicio', 'tipo_documento')
```

---

## ✅ DESPUÉS DE LOS CAMBIOS

### Estructura Mejorada:
```
DatosPrestador
├── soportes_documentales (FK)
│   ├── SoporteDocumental 1
│   ├── SoporteDocumental 2
│   └── ...
└── soportes_requeridos (FK)
    ├── SoporteRequerido 1
    ├── SoporteRequerido 2
    └── ...
```

### Frontend Funcionará Así:
```typescript
// Usuario accede a: /habilitacion/soportes/1
// Frontend hace: GET /api/habilitacion/soportes/?prestador_id=1
// Backend retorna SOLO los documentos de ese prestador ✅
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear migration: `python manage.py makemigrations soportes`
- [ ] Data migration para poblar prestadores existentes
- [ ] Actualizar SoporteDocumentalSerializer con prestador
- [ ] Actualizar SoporteRequeridoSerializer con prestador
- [ ] Agregar filtro por prestador en viewsets
- [ ] Actualizar frontend para enviar prestador_id en crear/actualizar
- [ ] Tests: Validar que no hay documents huérfanos
- [ ] Tests: Validar aislamiento por prestador

---

## 🎯 IMPACTO EN ENDPOINTS

```http
# ANTERIOR (Incorrecto)
GET /api/habilitacion/soportes/
# Buscaba soportes sin asociación clara a prestador

# NUEVO (Correcto)
GET /api/habilitacion/soportes/?prestador_id=1
# Solo retorna documentos del prestador 1
```

