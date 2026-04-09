# Backend API Endpoints Mapping
## Habilitación Module - Service to Endpoint Reference

### 📋 Document Structure
This document maps each service layer method to its corresponding backend API endpoint.
All endpoints are prefixed with `/api/` in the backend.

---

## 🏦 DatosPrestador (Provider/Company Data)

| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getAll(filters?)` | GET | `/habilitacion/prestadores/` | Supports filtering by estado, empresa_id |
| `getById(id)` | GET | `/habilitacion/prestadores/{id}/` | Get specific provider |
| `create(data)` | POST | `/habilitacion/prestadores/` | Create new provider data |
| `update(id, data)` | PATCH | `/habilitacion/prestadores/{id}/` | Update provider info |
| `delete(id)` | DELETE | `/habilitacion/prestadores/{id}/` | Delete provider (soft delete) |
| `getByEmpresa(empresaId)` | GET | `/habilitacion/prestadores/?empresa_id={id}` | Get provider by company |
| `getByEstado(estado)` | GET | `/habilitacion/prestadores/?estado={estado}` | Filter by state |
| `isPoliciaVigente(id)` | GET | `/habilitacion/prestadores/{id}/` | Check expiration (client-side validation) |
| `getDiasHastaVencimiento(id)` | GET | `/habilitacion/prestadores/{id}/` | Calculate days to expiry |
| `renovarPoliza(id, fecha)` | PATCH | `/habilitacion/prestadores/{id}/` | Update vigencia_poliza |
| `getProximosAVencer(dias)` | GET | `/habilitacion/prestadores/proximos_a_vencer/?dias={n}` | Get expiring soon |
| `asignarResponsable(id, userId)` | PATCH | `/habilitacion/prestadores/{id}/` | Update usuario_responsable |

---

## 🏥 ServicioSede (Health Services)

| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getServicios(filters?)` | GET | `/habilitacion/servicios/` | Get all services with filtering |
| `getServicio(id)` | GET | `/habilitacion/servicios/{id}/` | Get specific service |
| `createServicio(data)` | POST | `/habilitacion/servicios/` | Create new service |
| `updateServicio(id, data)` | PATCH | `/habilitacion/servicios/{id}/` | Update service |
| `deleteServicio(id)` | DELETE | `/habilitacion/servicios/{id}/` | Delete service |
| `getServiciosByPrestador(prestadorId)` | GET | `/habilitacion/servicios/?prestador_id={id}` | Get services by provider |
| `getServiciosByHeadquarters(sedeId)` | GET | `/habilitacion/servicios/?sede_id={id}` | Deprecated - use by prestador |
| `getProximosAVencer(dias)` | GET | `/habilitacion/servicios/proximos_a_vencer/?dias={n}` | Services expiring soon |
| `getVencidos()` | GET | `/habilitacion/servicios/vencidos/` | Get expired services |
| `getByModalidad(modalidad)` | GET | `/habilitacion/servicios/?modalidad={tipo}` | Filter by service type |
| `getByComplejidad(complejidad)` | GET | `/habilitacion/servicios/?complejidad={nivel}` | Filter by complexity |
| `getByEstado(estado)` | GET | `/habilitacion/servicios/?estado_habilitacion={estado}` | Filter by status |

---

## 📄 Soportes (Supporting Documents & Evidence)

### Categoría de Soporte (Document Categories)
| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getAllCategorias()` | GET | `/soportes/categorias/` | Get all categories |
| `getCategoria(id)` | GET | `/soportes/categorias/{id}/` | Get specific category |
| `createCategoria(data)` | POST | `/soportes/categorias/` | Create new category |
| `updateCategoria(id, data)` | PATCH | `/soportes/categorias/{id}/` | Update category |
| `deleteCategoria(id)` | DELETE | `/soportes/categorias/{id}/` | Delete category |

### Tipo de Documento Soporte (Document Types)
| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getAllTipos()` | GET | `/soportes/tipos-documento/` | Get all document types |
| `getTipo(id)` | GET | `/soportes/tipos-documento/{id}/` | Get specific type |
| `getTiposByCategoria(catId)` | GET | `/soportes/tipos-documento/?categoria_id={id}` | Filter by category |
| `getTiposByNivel(nivel)` | GET | `/soportes/tipos-documento/?nivel={EMPRESA\|SEDE\|SERVICIO}` | Filter by level |
| `getTiposObligatorios()` | GET | `/soportes/tipos-documento/?obligatorio=true` | Get required types |
| `createTipo(data)` | POST | `/soportes/tipos-documento/` | Create document type |
| `updateTipo(id, data)` | PATCH | `/soportes/tipos-documento/{id}/` | Update type |
| `deleteTipo(id)` | DELETE | `/soportes/tipos-documento/{id}/` | Delete type |

### Soporte Documental (Actual Documents)
| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getAllSoportes()` | GET | `/soportes/documentos/` | Get all documents |
| `getSoporte(id)` | GET | `/soportes/documentos/{id}/` | Get specific document |
| `getSoportesByEmpresa(empId)` | GET | `/soportes/documentos/?empresa_id={id}&nivel=EMPRESA` | EMPRESA level docs |
| `getSoportesBySede(sedeId)` | GET | `/soportes/documentos/?sede_id={id}&nivel=SEDE` | SEDE level docs |
| `getSoportesByServicio(servId)` | GET | `/soportes/documentos/?servicio_id={id}&nivel=SERVICIO` | SERVICE level docs |
| `getSoportesByNivel(nivel)` | GET | `/soportes/documentos/?nivel={nivel}` | Filter by level |
| `uploadSoporte(data)` | POST | `/soportes/documentos/` | Upload new document (auto-version) |
| `updateSoporte(id, data)` | PATCH | `/soportes/documentos/{id}/` | Update document metadata |
| `deleteSoporte(id)` | DELETE | `/habilitacion/soportes/documentos/{id}/` | Delete document |
| `getSoporteVersions(tipoId)` | GET | `/habilitacion/soportes/documentos/versions/?tipo_documento_id={id}` | Get all versions |
| `getSoporteLatestVersion(tipoId)` | GET | `/habilitacion/soportes/documentos/latest/{tipo_id}/` | Get latest version only |
| `getSoportesVencidos()` | GET | `/habilitacion/soportes/documentos/vencidos/` | Get expired documents |
| `getSoportesProximosAVencer(dias)` | GET | `/habilitacion/soportes/documentos/proximos_a_vencer/?dias={n}` | Expiring soon |
| `searchSoportes(criteria)` | GET | `/habilitacion/soportes/documentos/buscar/?{query_params}` | Advanced search |

### Soporte Requerido (Required Document Checklist)
| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getAllRequeridos()` | GET | `/habilitacion/soportes/requeridos/` | Get all required docs |
| `getRequerido(id)` | GET | `/habilitacion/soportes/requeridos/{id}/` | Get specific requirement |
| `getRequeridosByNivel(nivel)` | GET | `/habilitacion/soportes/requeridos/?nivel={nivel}` | Filter by level |
| `getRequeridosPendientes(nivel)` | GET | `/habilitacion/soportes/requeridos/pendientes/?nivel={nivel}` | Not yet uploaded |
| `getRequeridosCargados(nivel)` | GET | `/habilitacion/soportes/requeridos/cargados/?nivel={nivel}` | Already uploaded |
| `getRequeridosVencidos(nivel)` | GET | `/habilitacion/soportes/requeridos/vencidos/?nivel={nivel}` | Expired requirements |
| `createRequerido(data)` | POST | `/habilitacion/soportes/requeridos/` | Create requirement |
| `updateRequerido(id, data)` | PATCH | `/habilitacion/soportes/requeridos/{id}/` | Update requirement status |
| `deleteRequerido(id)` | DELETE | `/habilitacion/soportes/requeridos/{id}/` | Delete requirement |
| `generarChecklistAutomatico(nivel)` | POST | `/habilitacion/soportes/requeridos/generar_checklist/` | Auto-generate from config |
| `getEstadisticas(nivel?)` | GET | `/habilitacion/soportes/estadisticas/?nivel={nivel}` | Get summary stats |

---

## 📊 Autoevaluación (Self-Assessment)

| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getAutoevaluaciones(filters?)` | GET | `/habilitacion/autoevaluaciones/` | Get all assessments |
| `getAutoevaluacion(id)` | GET | `/habilitacion/autoevaluaciones/{id}/` | Get specific assessment |
| `createAutoevaluacion(data)` | POST | `/habilitacion/autoevaluaciones/` | Create new assessment |
| `updateAutoevaluacion(id, data)` | PATCH | `/habilitacion/autoevaluaciones/{id}/` | Update assessment |
| `deleteAutoevaluacion(id)` | DELETE | `/habilitacion/autoevaluaciones/{id}/` | Delete assessment |
| `getByPrestador(prestadorId)` | GET | `/habilitacion/autoevaluaciones/?prestador_id={id}` | Get by provider |
| `getProximasAVencer(dias)` | GET | `/habilitacion/autoevaluaciones/proximos_a_vencer/?dias={n}` | Expiring soon |

---

## ✅ Cumplimiento (Compliance/Evidence of Fulfillment)

| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getCumplimientos(filters?)` | GET | `/habilitacion/cumplimientos/` | Get all compliance records |
| `getCumplimiento(id)` | GET | `/habilitacion/cumplimientos/{id}/` | Get specific record |
| `createCumplimiento(data)` | POST | `/habilitacion/cumplimientos/` | Create compliance evidence |
| `updateCumplimiento(id, data)` | PATCH | `/habilitacion/cumplimientos/{id}/` | Update evidence |
| `deleteCumplimiento(id)` | DELETE | `/habilitacion/cumplimientos/{id}/` | Delete record |
| `getByCriterio(criterioId)` | GET | `/habilitacion/cumplimientos/?criterio_id={id}` | Get by criterion |
| `getByEstado(estado)` | GET | `/habilitacion/cumplimientos/?estado={estado}` | Filter by status |

---

## 🎯 Criterio (Compliance Criteria)

| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getCriterios(filters?)` | GET | `/habilitacion/criterios/` | Get all criteria |
| `getCriterio(id)` | GET | `/habilitacion/criterios/{id}/` | Get specific criterion |
| `createCriterio(data)` | POST | `/habilitacion/criterios/` | Create criterion |
| `updateCriterio(id, data)` | PATCH | `/habilitacion/criterios/{id}/` | Update criterion |
| `deleteCriterio(id)` | DELETE | `/habilitacion/criterios/{id}/` | Delete criterion |
| `getByEstandar(estandarId)` | GET | `/habilitacion/criterios/?estandar_id={id}` | Get by standard |

---

## 📐 Estandar (Standards/Requirements)

| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getEstandares(filters?)` | GET | `/habilitacion/estandares/` | Get all standards |
| `getEstandar(id)` | GET | `/habilitacion/estandares/{id}/` | Get specific standard |
| `createEstandar(data)` | POST | `/habilitacion/estandares/` | Create standard |
| `updateEstandar(id, data)` | PATCH | `/habilitacion/estandares/{id}/` | Update standard |
| `deleteEstandar(id)` | DELETE | `/habilitacion/estandares/{id}/` | Delete standard |
| `getByCategoria(categoria)` | GET | `/habilitacion/estandares/?categoria={cat}` | Filter by category |

---

## 🔧 Plan de Mejora (Improvement Plans)

| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getPlanesmejora(filters?)` | GET | `/habilitacion/planes_mejora/` | Get all plans |
| `getPlanmejora(id)` | GET | `/habilitacion/planes_mejora/{id}/` | Get specific plan |
| `createPlanmejora(data)` | POST | `/habilitacion/planes_mejora/` | Create plan |
| `updatePlanmejora(id, data)` | PATCH | `/habilitacion/planes_mejora/{id}/` | Update plan |
| `deletePlanmejora(id)` | DELETE | `/habilitacion/planes_mejora/{id}/` | Delete plan |
| `getByCumplimiento(cumplimientoId)` | GET | `/habilitacion/planes_mejora/?cumplimiento_id={id}` | Get by compliance |
| `getProximasAImplementar(dias)` | GET | `/habilitacion/planes_mejora/proximas/?dias={n}` | Upcoming implementations |

---

## 🚨 Hallazgo (Findings/Issues)

| Service Method | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `getHallazgos(filters?)` | GET | `/habilitacion/hallazgos/` | Get all findings |
| `getHallazgo(id)` | GET | `/habilitacion/hallazgos/{id}/` | Get specific finding |
| `createHallazgo(data)` | POST | `/habilitacion/hallazgos/` | Create finding |
| `updateHallazgo(id, data)` | PATCH | `/habilitacion/hallazgos/{id}/` | Update finding |
| `deleteHallazgo(id)` | DELETE | `/habilitacion/hallazgos/{id}/` | Delete finding |
| `getByCriterio(criterioId)` | GET | `/habilitacion/hallazgos/?criterio_id={id}` | Get by criterion |
| `getBySeveridad(severidad)` | GET | `/habilitacion/hallazgos/?severidad={nivel}` | Filter by severity |

---

## 📌 Query Parameter Formats

### Filters Example
```
GET /habilitacion/servicios/?prestador_id=5&modalidad=AMBULATORIA&estado_habilitacion=EN_PROCESO
```

### Pagination Example
```
GET /habilitacion/servicios/?page=2&limit=20
```

### Date Filters
```
GET /habilitacion/prestadores/proximos_a_vencer/?dias=90&fecha_desde=2025-01-01&fecha_hasta=2025-12-31
```

### Search Example
```
GET /habilitacion/soportes/documentos/buscar/?q=termino&tipo_documento_id=3&nivel=SERVICIO
```

---

## 🔐 Authentication & Headers

All endpoints require:
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 📝 Response Format

### List Response (Paginated)
```json
{
  "count": 42,
  "next": "http://api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

### Single Object Response
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2",
  ...
}
```

### Error Response
```json
{
  "detail": "Error message"
}
```

---

**Last Updated**: Phase 1 Implementation
**Version**: 1.0
