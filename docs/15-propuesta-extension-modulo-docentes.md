# 15 - PROPUESTA DE EXTENSIÓN: MÓDULO DE GESTIÓN DE DOCENTES
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Propuesta para Aprobación  
**Tipo:** Extensión de Alcance v1.0

---

## 1. RESUMEN EJECUTIVO

Este documento presenta una **propuesta de extensión** del Módulo de Gestión de Docentes (MÓDULO 5) con funcionalidades adicionales que, aunque no están contempladas en el alcance inicial v1.0, son **necesarias para la operación completa** del sistema académico.

### 1.1 Funcionalidades Propuestas

Se identificaron **4 funcionalidades críticas** que complementan el módulo actual:

1. **🔴 ALTA PRIORIDAD:** Gestión de Licencias y Permisos de Docentes
2. **🟡 ALTA PRIORIDAD:** Solicitud de Cambios de Turnos y Horarios
3. **🟢 MEDIA PRIORIDAD:** Postulación de Docentes para Nuevas Materias
4. **🔴 ALTA PRIORIDAD:** Proceso de Baja/Desactivación de Docentes

### 1.2 Recomendación Principal

**Se recomienda implementar PRIMERO la funcionalidad de "Gestión de Licencias y Permisos de Docentes"** por ser:
- ✅ Proceso administrativo crítico y recurrente
- ✅ Impacto directo en la operación diaria del instituto
- ✅ Infraestructura similar ya existe (licencias estudiantiles)
- ✅ Necesario para cumplimiento normativo laboral
- ✅ Base para otras funcionalidades (cambios de horario, cobertura)

---

## 2. ANÁLISIS DETALLADO DE FUNCIONALIDADES

### 2.1 🔴 PROPUESTA 1: GESTIÓN DE LICENCIAS Y PERMISOS DE DOCENTES

#### 2.1.1 Descripción

Sistema para que los docentes soliciten licencias/permisos (enfermedad, personal, capacitación) y que la administración las apruebe/rechace, con impacto automático en asignaciones y cobertura de clases.

#### 2.1.2 Análisis de Prioridad e Importancia

| Criterio | Evaluación | Justificación |
|----------|------------|---------------|
| **Prioridad de Negocio** | 🔴 **ALTA** | Proceso administrativo crítico y recurrente |
| **Impacto Operacional** | 🔴 **ALTO** | Afecta asignaciones, horarios, cobertura de clases |
| **Impacto en Estudiantes** | 🟡 **MEDIO** | Puede afectar continuidad de clases si no se gestiona |
| **Cumplimiento Normativo** | 🔴 **ALTO** | Requerido por normativa laboral boliviana |
| **Frecuencia de Uso** | 🔴 **ALTA** | Proceso recurrente durante todo el año académico |
| **Complejidad Técnica** | 🟡 **MEDIA** | Similar a licencias estudiantiles (ya implementado) |
| **Dependencias** | 🟢 **BAJA** | Infraestructura base ya existe |
| **Valor de Negocio** | 🔴 **ALTO** | Trazabilidad, cumplimiento, gestión eficiente |

#### 2.1.3 Impacto en el Sistema

**Impacto Técnico:**
- ✅ **Nuevas Tablas:** `licencias_docentes`, `licencias_docentes_documentos`
- ✅ **Nuevos Endpoints:** ~8 endpoints (CRUD + aprobación/rechazo)
- ✅ **Nuevas Páginas Frontend:** 3-4 páginas (solicitar, listar, aprobar)
- ✅ **Integración:** Con módulo de asignaciones y horarios
- ✅ **Notificaciones:** Email a Director Académico y Secretaria

**Impacto Funcional:**
- ✅ **Workflow de Aprobación:** Similar a licencias estudiantiles
- ✅ **Impacto Automático:** Al aprobar licencia, sistema puede:
  - Marcar docente como "LICENCIA" en `estado_laboral`
  - Alertar sobre necesidad de reemplazo
  - Bloquear asignación a nuevos cursos durante licencia
- ✅ **Historial:** Trazabilidad completa de licencias por docente

**Impacto en Otros Módulos:**
- 🔗 **Asignaciones Docentes:** Bloqueo temporal de nuevas asignaciones
- 🔗 **Horarios:** Alertas sobre cobertura de clases
- 🔗 **Supervisión:** No programar supervisiones durante licencia
- 🔗 **Reportes:** Estadísticas de licencias por docente/gestión

#### 2.1.4 Requerimientos Funcionales Propuestos

**RF-DOC-003: Solicitud de Licencia de Docente**
- **Prioridad:** ALTA | **Complejidad:** MEDIA
- **Actores:** Docente, Director Académico, Secretaria Académica
- **Tipos:** ENFERMEDAD, PERSONAL, CAPACITACION, MATERNIDAD/PATERNIDAD, OTRO
- **Estados:** PENDIENTE, APROBADA, RECHAZADA, VENCIDA
- **Reglas:**
  - RN-DOC-007: Licencia > 7 días requiere documentación
  - RN-DOC-008: Licencia durante gestión activa requiere reemplazo
  - RN-DOC-009: Máximo 30 días acumulados por gestión (configurable)

**RF-DOC-004: Aprobación/Rechazo de Licencias**
- **Prioridad:** ALTA | **Complejidad:** BAJA
- **Actores:** Director Académico, Rector (para licencias > 15 días)
- **Flujo:** Notificación automática → Revisión → Aprobación/Rechazo → Notificación

**RF-DOC-005: Gestión de Cobertura durante Licencias**
- **Prioridad:** MEDIA | **Complejidad:** MEDIA
- **Funcionalidad:** Sistema sugiere docentes reemplazo basado en especialidad y disponibilidad

#### 2.1.5 Estimación de Esfuerzo

- **Backend:** 3-4 días (tablas, endpoints, validaciones)
- **Frontend:** 3-4 días (formularios, listados, aprobación)
- **Integración:** 1-2 días (con asignaciones y horarios)
- **Pruebas:** 2 días
- **Total:** ~10-12 días hábiles

#### 2.1.6 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Conflicto con asignaciones activas | Media | Alto | Validación previa, alertas tempranas |
| Falta de reemplazo disponible | Alta | Medio | Sugerencias automáticas, flexibilidad en aprobación |

---

### 2.2 🟡 PROPUESTA 2: SOLICITUD DE CAMBIOS DE TURNOS Y HORARIOS

#### 2.2.1 Descripción

Sistema para que docentes soliciten cambios de turno/horario en sus asignaciones y que la administración evalúe y apruebe considerando impacto en estudiantes y disponibilidad.

#### 2.2.2 Análisis de Prioridad e Importancia

| Criterio | Evaluación | Justificación |
|----------|------------|---------------|
| **Prioridad de Negocio** | 🟡 **ALTA** | Necesario para flexibilidad operativa |
| **Impacto Operacional** | 🔴 **ALTO** | Afecta planificación, estudiantes, aulas |
| **Impacto en Estudiantes** | 🔴 **ALTO** | Cambios pueden afectar horarios de estudiantes |
| **Cumplimiento Normativo** | 🟢 **BAJO** | No requerido, pero mejora gestión |
| **Frecuencia de Uso** | 🟡 **MEDIA** | Ocurre ocasionalmente, principalmente inicio de gestión |
| **Complejidad Técnica** | 🔴 **ALTA** | Validaciones complejas (conflictos, cupos, prerrequisitos) |
| **Dependencias** | 🟡 **MEDIA** | Requiere módulo de horarios completo |
| **Valor de Negocio** | 🟡 **MEDIO** | Mejora satisfacción docente, flexibilidad |

#### 2.2.3 Impacto en el Sistema

**Impacto Técnico:**
- ✅ **Nuevas Tablas:** `solicitudes_cambio_horario`, `solicitudes_cambio_horario_historial`
- ✅ **Nuevos Endpoints:** ~10 endpoints (solicitar, evaluar, aprobar, validar conflictos)
- ✅ **Nuevas Páginas Frontend:** 4-5 páginas (solicitar, listar, evaluar impacto, aprobar)
- ✅ **Validaciones Complejas:** 
  - Conflictos de horario docente
  - Impacto en estudiantes inscritos
  - Disponibilidad de aulas
  - Cupos disponibles en nuevo turno

**Impacto Funcional:**
- ✅ **Evaluación de Impacto:** Sistema calcula automáticamente:
  - Estudiantes afectados
  - Conflictos de horario para estudiantes
  - Disponibilidad de aula alternativa
  - Carga horaria del docente
- ✅ **Workflow de Aprobación:** Múltiples niveles (Secretaria → Director Académico)
- ✅ **Notificaciones:** A estudiantes afectados sobre cambios

**Impacto en Otros Módulos:**
- 🔗 **Inscripciones:** Validar que estudiantes puedan ajustar horarios
- 🔗 **Horarios:** Actualización automática de horarios
- 🔗 **Asignaciones:** Modificación de asignaciones existentes
- 🔗 **Aulas:** Verificación de disponibilidad

#### 2.2.4 Requerimientos Funcionales Propuestos

**RF-DOC-006: Solicitud de Cambio de Horario**
- **Prioridad:** ALTA | **Complejidad:** ALTA
- **Actores:** Docente, Secretaria Académica, Director Académico
- **Tipos:** CAMBIO_TURNO, CAMBIO_DIA, CAMBIO_HORA, INTERCAMBIO_DOCENTE
- **Estados:** PENDIENTE, EN_EVALUACION, APROBADA, RECHAZADA, CANCELADA
- **Reglas:**
  - RN-DOC-010: Cambio requiere evaluación de impacto en estudiantes
  - RN-DOC-011: Cambio NO permitido después de 2 semanas de iniciada gestión
  - RN-DOC-012: Intercambio requiere aprobación de ambos docentes

**RF-DOC-007: Evaluación de Impacto de Cambio**
- **Prioridad:** ALTA | **Complejidad:** ALTA
- **Funcionalidad:** Sistema calcula automáticamente impacto y presenta reporte

#### 2.2.5 Estimación de Esfuerzo

- **Backend:** 5-6 días (validaciones complejas, cálculos de impacto)
- **Frontend:** 4-5 días (formularios complejos, visualización de impacto)
- **Integración:** 2-3 días (con horarios, inscripciones, aulas)
- **Pruebas:** 3 días
- **Total:** ~14-17 días hábiles

#### 2.2.6 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Conflictos complejos no detectados | Media | Alto | Validaciones exhaustivas, pruebas de integración |
| Impacto negativo en estudiantes | Alta | Alto | Evaluación previa obligatoria, notificaciones |

---

### 2.3 🟢 PROPUESTA 3: POSTULACIÓN DE DOCENTES PARA NUEVAS MATERIAS

#### 2.3.1 Descripción

Sistema para que docentes postulen a materias disponibles (misma carrera o diferente) y que la administración evalúe postulaciones considerando especialidad, experiencia y carga horaria.

#### 2.3.2 Análisis de Prioridad e Importancia

| Criterio | Evaluación | Justificación |
|----------|------------|---------------|
| **Prioridad de Negocio** | 🟢 **MEDIA** | Mejora proceso, pero no crítico |
| **Impacto Operacional** | 🟡 **MEDIO** | Optimiza asignación de recursos humanos |
| **Impacto en Estudiantes** | 🟢 **BAJO** | Indirecto, mejora calidad docente |
| **Cumplimiento Normativo** | 🟢 **BAJO** | No requerido |
| **Frecuencia de Uso** | 🟡 **MEDIA** | Principalmente inicio de gestión |
| **Complejidad Técnica** | 🟡 **MEDIA** | Workflow de aprobación estándar |
| **Dependencias** | 🟢 **BAJA** | Módulos base ya existen |
| **Valor de Negocio** | 🟡 **MEDIO** | Mejora gestión de recursos, transparencia |

#### 2.3.3 Impacto en el Sistema

**Impacto Técnico:**
- ✅ **Nuevas Tablas:** `postulaciones_docentes`, `postulaciones_docentes_evaluacion`
- ✅ **Nuevos Endpoints:** ~8 endpoints (postular, listar, evaluar, asignar)
- ✅ **Nuevas Páginas Frontend:** 3-4 páginas (postular, listar postulaciones, evaluar)
- ✅ **Integración:** Con módulo de asignaciones y materias

**Impacto Funcional:**
- ✅ **Workflow de Postulación:** Docente postula → Evaluación → Asignación
- ✅ **Criterios de Evaluación:** Especialidad, experiencia, carga horaria disponible
- ✅ **Ranking:** Sistema puede sugerir ranking de postulantes

**Impacto en Otros Módulos:**
- 🔗 **Asignaciones:** Integración directa (postulación → asignación)
- 🔗 **Materias:** Visualización de materias disponibles para postulación

#### 2.3.4 Requerimientos Funcionales Propuestos

**RF-DOC-008: Postulación a Materia**
- **Prioridad:** MEDIA | **Complejidad:** MEDIA
- **Actores:** Docente, Director Académico
- **Datos:** Materia, carrera, justificación, disponibilidad horaria
- **Estados:** PENDIENTE, EN_EVALUACION, APROBADA, RECHAZADA, ASIGNADA
- **Reglas:**
  - RN-DOC-013: Postulación requiere especialidad compatible
  - RN-DOC-014: Múltiples postulaciones permitidas
  - RN-DOC-015: Postulación NO garantiza asignación

**RF-DOC-009: Evaluación de Postulaciones**
- **Prioridad:** MEDIA | **Complejidad:** MEDIA
- **Funcionalidad:** Director Académico evalúa y asigna basado en criterios

#### 2.3.5 Estimación de Esfuerzo

- **Backend:** 3-4 días (tablas, endpoints, validaciones)
- **Frontend:** 3-4 días (formularios, listados, evaluación)
- **Integración:** 1 día (con asignaciones)
- **Pruebas:** 2 días
- **Total:** ~9-11 días hábiles

#### 2.3.6 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Múltiples postulaciones para misma materia | Alta | Bajo | Sistema de ranking, criterios claros |

---

### 2.4 🔴 PROPUESTA 4: PROCESO DE BAJA/DESACTIVACIÓN DE DOCENTES

#### 2.4.1 Descripción

Sistema formalizado para dar de baja/desactivar docentes con validaciones, impacto en asignaciones activas, y reasignación de materias.

#### 2.4.2 Análisis de Prioridad e Importancia

| Criterio | Evaluación | Justificación |
|----------|------------|---------------|
| **Prioridad de Negocio** | 🔴 **ALTA** | Proceso administrativo crítico |
| **Impacto Operacional** | 🔴 **ALTO** | Afecta asignaciones, estudiantes, continuidad |
| **Impacto en Estudiantes** | 🔴 **ALTO** | Puede afectar continuidad académica |
| **Cumplimiento Normativo** | 🟡 **MEDIO** | Requerido para gestión de personal |
| **Frecuencia de Uso** | 🟢 **BAJA** | Ocurre ocasionalmente |
| **Complejidad Técnica** | 🟡 **MEDIA** | Validaciones y reasignaciones |
| **Dependencias** | 🟡 **MEDIA** | Requiere módulo de asignaciones |
| **Valor de Negocio** | 🔴 **ALTO** | Trazabilidad, gestión de personal, continuidad |

#### 2.4.3 Impacto en el Sistema

**Impacto Técnico:**
- ✅ **Modificaciones:** Extender proceso de baja existente (soft delete)
- ✅ **Nuevos Endpoints:** ~5 endpoints (solicitar baja, aprobar, validar impacto, ejecutar)
- ✅ **Nuevas Páginas Frontend:** 2-3 páginas (solicitar baja, listar, ejecutar)
- ✅ **Validaciones:** 
  - Asignaciones activas
  - Estudiantes afectados
  - Necesidad de reasignación

**Impacto Funcional:**
- ✅ **Workflow de Baja:** Solicitud → Evaluación → Aprobación → Ejecución
- ✅ **Validación de Impacto:** Sistema alerta sobre:
  - Asignaciones activas
  - Estudiantes afectados
  - Necesidad de reasignación urgente
- ✅ **Reasignación Automática:** Sugerencias de docentes reemplazo

**Impacto en Otros Módulos:**
- 🔗 **Asignaciones:** Cancelación/reasignación automática
- 🔗 **Horarios:** Actualización de horarios
- 🔗 **Estudiantes:** Notificación de cambio de docente
- 🔗 **Supervisión:** Cancelación de supervisiones programadas

#### 2.4.4 Requerimientos Funcionales Propuestos

**RF-DOC-010: Solicitud de Baja de Docente**
- **Prioridad:** ALTA | **Complejidad:** MEDIA
- **Actores:** Director Administrativo, Rector, Director Académico
- **Tipos:** RENUNCIA, RETIRO, DESPIDO, FIN_CONTRATO
- **Estados:** PENDIENTE, EN_EVALUACION, APROBADA, RECHAZADA, EJECUTADA
- **Reglas:**
  - RN-DOC-016: Baja requiere evaluación de impacto en asignaciones activas
  - RN-DOC-017: Baja durante gestión activa requiere reasignación urgente
  - RN-DOC-018: Solo Rector puede aprobar baja definitiva

**RF-DOC-011: Evaluación de Impacto de Baja**
- **Prioridad:** ALTA | **Complejidad:** MEDIA
- **Funcionalidad:** Sistema calcula impacto y presenta reporte detallado

**RF-DOC-012: Reasignación por Baja**
- **Prioridad:** ALTA | **Complejidad:** MEDIA
- **Funcionalidad:** Sistema sugiere reasignaciones y facilita proceso

#### 2.4.5 Estimación de Esfuerzo

- **Backend:** 4-5 días (validaciones, cálculos de impacto, reasignaciones)
- **Frontend:** 3-4 días (formularios, reportes de impacto)
- **Integración:** 2 días (con asignaciones, horarios, estudiantes)
- **Pruebas:** 2 días
- **Total:** ~11-13 días hábiles

#### 2.4.6 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Baja sin reasignación | Media | Crítico | Validación obligatoria, alertas |
| Impacto en estudiantes | Alta | Alto | Notificaciones, reasignación rápida |

---

## 3. COMPARATIVA Y PRIORIZACIÓN

### 3.1 Matriz de Priorización

| Funcionalidad | Prioridad Negocio | Impacto Operacional | Complejidad | Esfuerzo (días) | ROI | Recomendación |
|---------------|-------------------|---------------------|------------|-----------------|-----|---------------|
| **1. Licencias Docentes** | 🔴 ALTA | 🔴 ALTO | 🟡 MEDIA | 10-12 | ⭐⭐⭐⭐⭐ | **🔴 IMPLEMENTAR PRIMERO** |
| **2. Cambios Horarios** | 🟡 ALTA | 🔴 ALTO | 🔴 ALTA | 14-17 | ⭐⭐⭐⭐ | 🟡 Segunda Fase |
| **3. Postulaciones** | 🟢 MEDIA | 🟡 MEDIO | 🟡 MEDIA | 9-11 | ⭐⭐⭐ | 🟢 Tercera Fase |
| **4. Baja Docentes** | 🔴 ALTA | 🔴 ALTO | 🟡 MEDIA | 11-13 | ⭐⭐⭐⭐ | 🟡 Segunda Fase |

### 3.2 Recomendación de Implementación por Fases

#### **FASE 1: Funcionalidad Crítica (Recomendada para v1.0 o v1.1)**
✅ **Gestión de Licencias y Permisos de Docentes**
- **Justificación:** Proceso crítico, recurrente, infraestructura similar existe
- **Esfuerzo:** 10-12 días
- **Impacto:** Alto en operación diaria

#### **FASE 2: Funcionalidades de Gestión (v1.2)**
🟡 **Cambios de Turnos y Horarios** + **Baja/Desactivación de Docentes**
- **Justificación:** Procesos importantes pero menos frecuentes
- **Esfuerzo Total:** 25-30 días
- **Impacto:** Alto en planificación y gestión de personal

#### **FASE 3: Optimización (v1.3 o v2.0)**
🟢 **Postulación de Docentes para Nuevas Materias**
- **Justificación:** Mejora proceso pero no crítico
- **Esfuerzo:** 9-11 días
- **Impacto:** Medio en optimización de recursos

---

## 4. IMPACTO GLOBAL EN EL SISTEMA

### 4.1 Impacto en Arquitectura

**Nuevas Tablas Requeridas:**
- `licencias_docentes` (solicitudes de licencia)
- `licencias_docentes_documentos` (documentos adjuntos)
- `solicitudes_cambio_horario` (cambios de horario)
- `postulaciones_docentes` (postulaciones a materias)
- `solicitudes_baja_docentes` (proceso de baja)

**Modificaciones a Tablas Existentes:**
- `docentes.estado_laboral` (ya existe, solo usar valores)
- `asignaciones_docentes` (agregar campos de estado/proceso)

### 4.2 Impacto en Módulos Existentes

| Módulo | Impacto | Descripción |
|--------|---------|-------------|
| **Asignaciones Docentes** | 🔴 ALTO | Validaciones, bloqueos, reasignaciones |
| **Gestión de Horarios** | 🔴 ALTO | Actualizaciones, validaciones de conflicto |
| **Inscripciones** | 🟡 MEDIO | Validación de cambios que afectan estudiantes |
| **Supervisión Docente** | 🟡 MEDIO | Bloqueo durante licencias |
| **Reportes** | 🟢 BAJO | Nuevas estadísticas y reportes |

### 4.3 Nuevos Permisos Requeridos

```
- docentes.licencias.solicitar
- docentes.licencias.aprobar
- docentes.licencias.ver
- docentes.cambios_horario.solicitar
- docentes.cambios_horario.aprobar
- docentes.postulaciones.crear
- docentes.postulaciones.evaluar
- docentes.baja.solicitar
- docentes.baja.aprobar
```

---

## 5. PROPUESTA DE DECISIÓN

### 5.1 Opción Recomendada: Implementación Fase 1

**Implementar SOLO "Gestión de Licencias y Permisos de Docentes"** en esta etapa:

✅ **Ventajas:**
- Proceso crítico y recurrente
- Infraestructura similar ya existe (licencias estudiantiles)
- Esfuerzo moderado (10-12 días)
- Alto impacto en operación diaria
- Base para futuras funcionalidades

❌ **Desventajas:**
- No cubre todas las necesidades identificadas
- Requiere fases adicionales para completar módulo

### 5.2 Opción Alternativa: Implementación Completa

**Implementar las 4 funcionalidades en fases:**

✅ **Ventajas:**
- Módulo completo y robusto
- Cubre todas las necesidades identificadas
- Mejor experiencia de usuario

❌ **Desventajas:**
- Esfuerzo total: ~44-53 días hábiles
- Puede retrasar otras funcionalidades críticas
- Mayor complejidad de pruebas e integración

### 5.3 Opción Conservadora: Postergar

**No implementar en v1.0, dejar para v1.1+:**

✅ **Ventajas:**
- Mantiene alcance original
- No retrasa lanzamiento

❌ **Desventajas:**
- Procesos manuales continuarán
- Falta de trazabilidad
- Menor eficiencia operativa

---

## 6. PRÓXIMOS PASOS

### 6.1 Si se Aprueba Fase 1 (Licencias)

1. ✅ Actualizar documento de requerimientos funcionales
2. ✅ Crear esquema de base de datos
3. ✅ Desarrollar backend (endpoints, validaciones)
4. ✅ Desarrollar frontend (páginas, formularios)
5. ✅ Integrar con módulos existentes
6. ✅ Pruebas y validación
7. ✅ Documentación de usuario

### 6.2 Si se Aprueban Todas las Fases

1. ✅ Priorizar fases según recomendación
2. ✅ Planificar sprints de desarrollo
3. ✅ Asignar recursos
4. ✅ Seguir proceso de cada fase

---

## 7. APROBACIONES

| Rol | Nombre | Decisión | Firma | Fecha |
|-----|--------|----------|-------|-------|
| Rector (Sponsor) | Victor Hugo Bejarano Rendón | | | |
| Directora Académica | Lidia Ordoñez Cuenca | | | |
| Directora Administrativa | Mirian Fernández Colque | | | |
| Líder Técnico | [Equipo de Desarrollo] | | | |

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Propuesta inicial - 4 funcionalidades analizadas |

---

**FIN DEL DOCUMENTO - 15 PROPUESTA DE EXTENSIÓN: MÓDULO DE GESTIÓN DE DOCENTES**
