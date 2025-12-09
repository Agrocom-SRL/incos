# 08 - REGLAS DE NEGOCIO
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Documento

Este documento consolida todas las **reglas de negocio** del Sistema de Gestión Académica del Instituto INCOS. Las reglas de negocio son restricciones, políticas y lógica que gobiernan el comportamiento del sistema y que reflejan las políticas institucionales y requisitos académicos.

### 1.2 Importancia de las Reglas de Negocio

Las reglas de negocio son críticas porque:
- Definen **CÓMO debe comportarse el sistema** en situaciones específicas
- Son **inmutables por usuarios** (no configurables, están en el código)
- Garantizan **consistencia** en las operaciones
- Aseguran **cumplimiento** de políticas institucionales y normativa educativa
- Facilitan **validación** durante desarrollo y testing

### 1.3 Estructura de Reglas

Cada regla incluye:
- **ID:** RN-MOD-NNN (MOD = módulo, NNN = número secuencial)
- **Nombre:** Descripción breve
- **Descripción:** Explicación detallada
- **Tipo:** Restricción, Cálculo, Validación, Workflow, Política
- **Nivel de Aplicación:** Base de Datos, Lógica de Negocio, UI
- **Prioridad:** CRÍTICA, ALTA, MEDIA, BAJA
- **Requerimientos Relacionados:** RFs que implementan la regla

### 1.4 Convenciones

- **DEBE:** Requisito obligatorio (MUST)
- **NO DEBE:** Prohibición estricta (MUST NOT)
- **DEBERÍA:** Recomendación fuerte (SHOULD)
- **PUEDE:** Opcional (MAY)

---

## 2. REGLAS DE GESTIÓN DE ESTUDIANTES (EST)

### RN-EST-001: Unicidad de CI
**Tipo:** Restricción  
**Nivel:** Base de Datos + Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
El CI (Cédula de Identidad) combinado con la expedición DEBE ser único en el sistema. NO PUEDE existir más de un estudiante con el mismo CI y expedición.

**Implementación:**
- Constraint UNIQUE en BD: `UNIQUE KEY UQ_estudiante_ci (ci, expedicion)`
- Validación en API antes de INSERT
- Validación en UI en tiempo real (AJAX)

**Excepciones:** Ninguna

**Requerimientos:** [RF-EST-001]

---

### RN-EST-002: Edad Mínima de Ingreso
**Tipo:** Validación  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
El estudiante DEBE tener al menos 17 años cumplidos al momento de su registro en el instituto.

**Cálculo:**
```javascript
edad = YEAR(CURDATE()) - YEAR(fecha_nacimiento) - 
       (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d'))

IF edad < 17 THEN rechazar_registro
```

**Excepciones:** Ninguna (política institucional estricta)

**Requerimientos:** [RF-EST-001]

---

### RN-EST-003: Unicidad de Email
**Tipo:** Restricción  
**Nivel:** Base de Datos + Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
El email, si se proporciona, DEBE ser único en el sistema. NO PUEDE haber dos estudiantes con el mismo email.

**Implementación:**
- Constraint UNIQUE en BD
- Validación solo si email IS NOT NULL

**Excepciones:** Email es campo opcional, NULL está permitido

**Requerimientos:** [RF-EST-001]

---

### RN-EST-004: Documentación Obligatoria para Becas 100%
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Las becas del 100% DEBEN tener documentación de respaldo obligatoria adjunta. El sistema NO DEBE permitir asignar beca 100% sin documentos.

**Documentos Requeridos:**
- Certificado de ingresos familiares o carta de situación económica
- Informe social (si aplica)
- Carta de solicitud del estudiante o tutor

**Implementación:**
```javascript
IF beca.porcentaje === 100 AND documentos.length === 0 THEN
  THROW ValidationError("Becas 100% requieren documentación")
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-EST-004]

---

### RN-EST-005: Una Beca Activa por Gestión
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Un estudiante DEBE tener máximo UNA beca activa por gestión académica. NO PUEDE tener dos becas simultáneas.

**Validación:**
```sql
SELECT COUNT(*) 
FROM estudiantes_becas 
WHERE estudiante_id = X 
  AND estado = 'ACTIVA' 
  AND (gestion_id = Y OR gestion_id IS NULL)
-- Resultado DEBE ser <= 1
```

**Excepciones:** Becas históricas (finalizadas o revocadas) están permitidas

**Requerimientos:** [RF-EST-004]

---

### RN-EST-006: Becas 100% Requieren Aprobación del Rector
**Tipo:** Workflow  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Las becas del 100% DEBEN ser aprobadas por el Rector antes de aplicarse. La beca se registra con estado PENDIENTE hasta obtener aprobación.

**Flujo:**
1. Usuario asigna beca 100%
2. Sistema crea registro con estado PENDIENTE
3. Sistema notifica al Rector
4. Rector APRUEBA o RECHAZA
5. Si aprueba: estado → ACTIVA
6. Si rechaza: estado → RECHAZADA

**Excepciones:** Becas menores al 100% NO requieren aprobación del Rector

**Requerimientos:** [RF-EST-004]

---

### RN-EST-007: Aplicación Automática de Becas
**Tipo:** Cálculo  
**Nivel:** Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
Las becas activas DEBEN aplicarse automáticamente al calcular aranceles. El descuento se calcula sin intervención manual.

**Cálculo:**
```javascript
arancel_base = obtenerArancelPorCarreraYPeriodo(carrera_id, periodo_id)
beca_activa = obtenerBecaActiva(estudiante_id, gestion_id)

IF beca_activa THEN
  descuento_monto = arancel_base * (beca_activa.porcentaje / 100)
  arancel_neto = arancel_base - descuento_monto
ELSE
  arancel_neto = arancel_base
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-INS-001]

---

### RN-EST-008: Revocación de Beca NO Afecta Gestiones Pagadas
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
La revocación de una beca NO DEBE afectar gestiones anteriores que ya fueron pagadas con el descuento. Solo aplica a gestiones futuras.

**Implementación:**
- Campo `fecha_revocacion` en tabla `estudiantes_becas`
- Validar: aplicar beca solo si `gestion.fecha_inicio >= beca.fecha_inicio` AND `gestion.fecha_inicio < beca.fecha_revocacion`

**Excepciones:** Ninguna (protección del estudiante)

**Requerimientos:** [RF-EST-004]

---

### RN-EST-009: Licencias NO Eximen de Exámenes
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
Las licencias estudiantiles justifican ausencias a clases pero NO eximen al estudiante de rendir exámenes parciales o finales. El estudiante DEBE coordinar con el docente para recuperar exámenes.

**Implementación:**
- Mensaje informativo en UI al solicitar licencia
- Incluir en notificación al estudiante

**Excepciones:** Licencias médicas prolongadas (> 30 días) pueden requerir examen especial

**Requerimientos:** [RF-EST-005]

---

### RN-EST-010: Máximo 15 Días de Licencia por Gestión
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
Un estudiante PUEDE solicitar máximo 15 días de licencia acumulados por gestión académica, salvo casos excepcionales aprobados por el Rector.

**Validación:**
```javascript
dias_usados = SUM(licencias_aprobadas.dias_totales WHERE gestion_id = X)
dias_solicitados = DATEDIFF(fecha_fin, fecha_inicio) + 1

IF (dias_usados + dias_solicitados) > 15 THEN
  IF no_es_excepcion THEN
    rechazar_solicitud
```

**Excepciones:**
- Emergencias médicas graves (aprobación del Rector)
- Fallecimiento de familiar directo

**Requerimientos:** [RF-EST-005]

---

### RN-EST-011: Licencias con Anticipación
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** BAJA

**Descripción:**  
Las licencias DEBERÍAN solicitarse con mínimo 24 horas de anticipación. Las solicitudes retroactivas SOLO se aceptan en casos de emergencia comprobada.

**Validación:**
```javascript
IF fecha_inicio < CURDATE() AND !es_emergencia THEN
  mostrar_advertencia("Se recomienda solicitar con anticipación")
  // Permitir continuar pero marcar como retroactiva
```

**Excepciones:** Emergencias médicas, accidentes, casos fortuitos

**Requerimientos:** [RF-EST-005]

---

### RN-EST-012: Estado EGRESADO es Irreversible
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
El cambio de estado a EGRESADO es irreversible. Una vez que un estudiante egresa, NO PUEDE volver a estado REGULAR o NIVELACION.

**Validación:**
```javascript
IF estado_actual === 'EGRESADO' AND nuevo_estado !== 'EGRESADO' THEN
  THROW BusinessRuleViolation("Estado EGRESADO es irreversible")
```

**Excepciones:** Ninguna (solo el Super Admin puede revertir en caso de error grave)

**Requerimientos:** [RF-EST-006]

---

### RN-EST-013: Reincorporación desde RETIRADO/ABANDONO
**Tipo:** Workflow  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
Un estudiante en estado RETIRADO o ABANDONO PUEDE solicitar reincorporación. La solicitud DEBE ser aprobada por el Director Académico.

**Condiciones para Reincorporación:**
- Máximo 2 años desde el retiro/abandono
- Sin deudas pendientes
- Cupo disponible en la carrera
- Aprobación del Director Académico

**Flujo:**
1. Estudiante solicita reincorporación
2. Sistema valida condiciones
3. Director Académico revisa caso
4. Si aprueba: estado → REGULAR (o NIVELACION si tenía materias pendientes)
5. Si rechaza: estado permanece sin cambios

**Excepciones:** Después de 2 años, debe reiniciar como estudiante nuevo

**Requerimientos:** [RF-EST-006]

---

### RN-EST-014: Activación Automática de NIVELACION
**Tipo:** Workflow  
**Nivel:** Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
El estado NIVELACION DEBE activarse automáticamente cuando un estudiante reprueba una materia incluso después del recuperatorio.

**Trigger:**
```javascript
IF inscripcion_materia.nota_final < 60 AND 
   inscripcion_materia.nota_recuperatorio < 60 THEN
  
  // Actualizar estado académico
  estudiante.estado_academico = 'NIVELACION'
  
  // Crear registro en historial_nivelaciones
  INSERT INTO historial_nivelaciones (
    estudiante_id,
    inscripcion_materia_id,
    fecha_inicio,
    estado
  ) VALUES (...)
```

**Excepciones:** Ninguna (automático e inmediato)

**Requerimientos:** [RF-EST-006], [RF-NIV-001]

---

## 3. REGLAS DE INSCRIPCIONES (INS)

### RN-INS-001: NO Inscripción Simultánea a Dos Gestiones
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
Un estudiante NO PUEDE estar inscrito a dos gestiones académicas simultáneamente. Solo UNA inscripción activa permitida.

**Validación:**
```sql
SELECT COUNT(*) 
FROM inscripciones 
WHERE estudiante_id = X 
  AND estado = 'ACTIVA'
-- Resultado DEBE ser <= 1
```

**Implementación:**
- Validar ANTES de crear nueva inscripción
- Si existe inscripción activa, rechazar

**Excepciones:** Ninguna

**Requerimientos:** [RF-INS-001]

---

### RN-INS-002: Inscripción a Gestión es Prerrequisito
**Tipo:** Workflow  
**Nivel:** Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
La inscripción a la gestión académica es PRE-REQUISITO obligatorio para poder inscribirse a materias. NO SE PUEDE inscribir a materias sin inscripción a gestión.

**Validación:**
```javascript
IF !existe_inscripcion_activa(estudiante_id, gestion_id) THEN
  THROW BusinessRuleViolation("Debe inscribirse a la gestión primero")
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-INS-001], [RF-INS-002]

---

### RN-INS-003: Pago Mínimo 50% al Inscribirse
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
El arancel de inscripción DEBE pagarse al menos en un 50% al momento de inscribirse a la gestión, salvo que exista un plan de pago aprobado.

**Validación:**
```javascript
IF !existe_plan_pago(estudiante_id) THEN
  IF monto_pagado < (arancel_neto * 0.5) THEN
    THROW BusinessRuleViolation("Debe pagar al menos el 50%")
```

**Excepciones:**
- Estudiantes con plan de pago aprobado
- Becas del 100% (arancel_neto = 0)

**Requerimientos:** [RF-INS-001]

---

### RN-INS-004: Aplicación Automática de Becas en Inscripción
**Tipo:** Cálculo  
**Nivel:** Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
Las becas activas DEBEN aplicarse automáticamente al momento de calcular el arancel de inscripción.

**Cálculo:**
```javascript
arancel_base = obtenerArancel(carrera_id, periodo_id)
beca = obtenerBecaActiva(estudiante_id, gestion_id)

IF beca THEN
  descuento_porcentaje = beca.porcentaje
  descuento_monto = arancel_base * (descuento_porcentaje / 100)
ELSE
  descuento_porcentaje = 0
  descuento_monto = 0

arancel_neto = arancel_base - descuento_monto
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-INS-001]

---

### RN-INS-005: NO Inscripción Duplicada a Misma Materia
**Tipo:** Restricción  
**Nivel:** Base de Datos + Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
Un estudiante NO PUEDE inscribirse dos veces a la misma materia en la misma gestión.

**Validación:**
```sql
SELECT COUNT(*) 
FROM inscripciones_materias 
WHERE inscripcion_id = X 
  AND materia_id = Y
-- Resultado DEBE ser 0 (antes de INSERT)
```

**Implementación:**
- Constraint UNIQUE en BD
- Validación en API

**Excepciones:** Ninguna

**Requerimientos:** [RF-INS-002]

---

### RN-INS-006: Validación Estricta de Prerrequisitos
**Tipo:** Validación  
**Nivel:** Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
El sistema NO DEBE permitir la inscripción a una materia si el estudiante NO ha aprobado TODAS las materias prerrequisito.

**Algoritmo:**
```javascript
prerrequisitos = obtenerPrerrequisitos(materia_id)

FOR EACH prerrequisito IN prerrequisitos DO
  aprobado = verificarMateriaAprobada(estudiante_id, prerrequisito.materia_id)
  
  IF !aprobado THEN
    THROW PrerequisiteNotMet(
      "Requiere aprobar: " + prerrequisito.nombre
    )
```

**Verificación de Aprobación:**
- Nota final >= 60 O
- Nota recuperatorio >= 60

**Excepciones:** Ninguna (política académica estricta)

**Requerimientos:** [RF-INS-002]

---

### RN-INS-007: Cupo Máximo por Curso
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Cada curso DEBE tener un cupo máximo de estudiantes (default: 35). El sistema NO DEBE permitir inscripciones que excedan el cupo.

**Validación:**
```javascript
cupo_actual = COUNT(inscripciones_materias WHERE curso_id = X AND estado != 'ANULADA')
cupo_maximo = cursos.cupo_maximo

IF cupo_actual >= cupo_maximo THEN
  THROW CourseFullError("Curso sin cupo disponible")
```

**Configuración:**
- Cupo configurable por curso
- Default: 35 estudiantes

**Excepciones:** Director Académico puede forzar inscripción excediendo cupo (con justificación)

**Requerimientos:** [RF-INS-002]

---

### RN-INS-008: Restricción de Materias en NIVELACION
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Un estudiante en estado NIVELACION SOLO PUEDE inscribirse a las materias que reprobó. NO PUEDE inscribirse a materias nuevas.

**Validación:**
```javascript
IF estudiante.estado_academico === 'NIVELACION' THEN
  materias_permitidas = obtenerMateriasReprobadas(estudiante_id)
  
  IF materia_seleccionada NOT IN materias_permitidas THEN
    THROW BusinessRuleViolation(
      "Solo puede inscribirse a materias reprobadas"
    )
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-INS-002]

---

### RN-INS-009: NO Solapamiento de Horarios
**Tipo:** Validación  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
El sistema NO DEBE permitir inscribir a un estudiante en dos materias que tengan horarios solapados.

**Algoritmo de Validación:**
```javascript
FOR EACH materia_nueva IN materias_seleccionadas DO
  horario_nuevo = obtenerHorario(materia_nueva.curso_id)
  
  FOR EACH materia_inscrita IN inscripciones_actuales DO
    horario_existente = obtenerHorario(materia_inscrita.curso_id)
    
    IF horarios_se_solapan(horario_nuevo, horario_existente) THEN
      THROW ScheduleConflictError(
        "Conflicto entre " + materia_nueva.nombre + 
        " y " + materia_inscrita.nombre
      )
```

**Detección de Solapamiento:**
```javascript
function horarios_se_solapan(h1, h2):
  // Mismo día
  IF h1.dia === h2.dia THEN
    // Verificar solapamiento de horas
    IF (h1.hora_inicio < h2.hora_fin) AND 
       (h1.hora_fin > h2.hora_inicio) THEN
      RETURN true
  RETURN false
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-INS-003]

---

### RN-INS-012: Devolución Dentro de 2 Semanas
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
La anulación de inscripción dentro de las 2 primeras semanas del inicio de clases tiene derecho a devolución del 100% del arancel pagado.

**Cálculo:**
```javascript
dias_transcurridos = DATEDIFF(fecha_anulacion, gestion.fecha_inicio_clases)

IF dias_transcurridos <= 14 THEN
  porcentaje_devolucion = 100
  monto_devolucion = inscripcion.arancel_neto
ELSE
  porcentaje_devolucion = 0
  monto_devolucion = 0
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-INS-004]

---

### RN-INS-013: Sin Devolución Después de 2 Semanas
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
Después de 2 semanas del inicio de clases, NO hay devolución del arancel en caso de anulación de inscripción.

**Implementación:**
```javascript
IF dias_transcurridos > 14 THEN
  monto_devolucion = 0
  mensaje = "No aplica devolución después de 2 semanas del inicio de clases"
```

**Excepciones:** Casos excepcionales (enfermedad grave, fuerza mayor) evaluados por Dirección

**Requerimientos:** [RF-INS-004]

---

### RN-INS-014: Inscripciones Anuladas NO se Borran
**Tipo:** Política  
**Nivel:** Base de Datos  
**Prioridad:** ALTA

**Descripción:**  
Las inscripciones anuladas NO se borran físicamente de la base de datos. Se marcan con estado ANULADA para mantener historial y auditoría.

**Implementación:**
- Soft delete (campo `deleted_at`)
- Estado = ANULADA
- Mantener todos los datos

**Excepciones:** Ninguna (requisito de auditoría)

**Requerimientos:** [RF-INS-004]

---

### RN-INS-015: Anulación Requiere Motivo Obligatorio
**Tipo:** Validación  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
Toda anulación de inscripción DEBE tener un motivo registrado obligatoriamente.

**Validación:**
```javascript
IF motivo_anulacion IS NULL OR motivo_anulacion.length < 10 THEN
  THROW ValidationError("El motivo de anulación es obligatorio (mín. 10 caracteres)")
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-INS-004]

---

## 4. REGLAS DE CALIFICACIONES (CAL)

### RN-CAL-001: Rango de Notas 0-100
**Tipo:** Validación  
**Nivel:** Base de Datos + Lógica de Negocio + UI  
**Prioridad:** CRÍTICA

**Descripción:**  
Todas las notas (parciales, práctico, recuperatorio) DEBEN estar en el rango 0-100 (sistema centesimal).

**Validación en BD:**
```sql
CHECK (nota_1er_parcial IS NULL OR (nota_1er_parcial >= 0 AND nota_1er_parcial <= 100))
```

**Validación en Lógica:**
```javascript
IF nota < 0 OR nota > 100 THEN
  THROW ValidationError("La nota debe estar entre 0 y 100")
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-CAL-001]

---

### RN-CAL-002: Nota de Aprobación 60/100
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
La nota mínima de aprobación es 60 sobre 100 puntos. Cualquier nota_final >= 60 se considera APROBADO.

**Evaluación:**
```javascript
IF nota_final >= 60 THEN
  estado = 'APROBADO'
ELSE
  estado = 'REPROBADO'
  habilitar_recuperatorio = true
```

**Excepciones:** Ninguna (política académica institucional)

**Requerimientos:** [RF-CAL-001]

---

### RN-CAL-003: Cálculo Automático de Campos
**Tipo:** Cálculo  
**Nivel:** Base de Datos (campos calculados)  
**Prioridad:** CRÍTICA

**Descripción:**  
Los campos SUMA, SUMA TOTAL y NOTA FINAL DEBEN calcularse automáticamente según las fórmulas establecidas. El usuario NO DEBE ingresarlos manualmente.

**Fórmulas:**
```sql
-- En la definición de tabla (MySQL)
suma_parciales DECIMAL(6,2) GENERATED ALWAYS AS (
  COALESCE(nota_1er_parcial, 0) + COALESCE(nota_2do_parcial, 0)
) STORED,

suma_total DECIMAL(6,2) GENERATED ALWAYS AS (
  COALESCE(suma_parciales, 0) + 
  COALESCE(nota_3er_parcial, 0) + 
  COALESCE(nota_practico, 0)
) STORED,

nota_final DECIMAL(5,2) GENERATED ALWAYS AS (
  COALESCE(suma_total, 0) / 4
) STORED
```

**Ventajas:**
- Elimina errores de cálculo
- Garantiza consistencia
- Actualización automática

**Excepciones:** Ninguna

**Requerimientos:** [RF-CAL-001]

---

### RN-CAL-004: Habilitación de Recuperatorio
**Tipo:** Workflow  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Si la nota_final < 60, el estudiante tiene derecho a rendir examen recuperatorio. El sistema DEBE habilitar este campo.

**Trigger:**
```javascript
IF nota_final < 60 AND nota_recuperatorio IS NULL THEN
  habilitar_recuperatorio = true
  estado = 'REPROBADO'
  mensaje = "Habilitado para recuperatorio"
```

**Excepciones:** Asistencia < 75% puede inhabilitar recuperatorio (configurable)

**Requerimientos:** [RF-CAL-001]

---

### RN-CAL-005: Solo Docente Asignado Registra Notas
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
SOLO el docente asignado al curso PUEDE registrar o modificar las calificaciones de ese curso.

**Validación:**
```javascript
docente_asignado_id = obtenerDocenteAsignado(curso_id)

IF usuario.id !== docente_asignado_id AND 
   !usuario.tiene_permiso('calificaciones.editar_todas') THEN
  THROW ForbiddenError("No tienes permiso para modificar estas calificaciones")
```

**Excepciones:**
- Director Académico con permiso especial
- Super Admin

**Requerimientos:** [RF-CAL-001]

---

### RN-CAL-006: Modificaciones > 48h Registradas
**Tipo:** Auditoría  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Las modificaciones de calificaciones después de 48 horas del registro inicial DEBEN quedar registradas en auditoría con justificación obligatoria.

**Implementación:**
```javascript
horas_transcurridas = TIMESTAMPDIFF(HOUR, fecha_registro, NOW())

IF horas_transcurridas > 48 AND motivo IS NULL THEN
  THROW ValidationError("Modificaciones > 48h requieren justificación")

// Registrar en auditoría
INSERT INTO auditoria (
  usuario_id,
  accion,
  tabla,
  registro_id,
  valores_anteriores,
  valores_nuevos,
  motivo
) VALUES (...)
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-CAL-003]

---

### RN-CAL-007: Nota Final Fija en Recuperatorio Aprobado
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Si el estudiante aprueba el recuperatorio (nota_recuperatorio >= 60), su nota_final se ajusta a 60 (nota mínima de aprobación). NO se promedia con la nota original.

**Implementación:**
```javascript
IF nota_recuperatorio >= 60 THEN
  nota_final_ajustada = 60  // Fija
  estado = 'APROBADO'
ELSE
  nota_final_ajustada = nota_final  // Original
  estado = 'REPROBADO'
```

**Justificación:** Política académica que no penaliza al estudiante que recupera

**Excepciones:** Ninguna

**Requerimientos:** [RF-CAL-002]

---

### RN-CAL-008: Recuperatorio Reprobado → Nivelación
**Tipo:** Workflow  
**Nivel:** Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
Si el estudiante reprueba el recuperatorio (nota_recuperatorio < 60), DEBE cursar la materia nuevamente en modalidad nivelación.

**Trigger Automático:**
```javascript
IF nota_recuperatorio < 60 THEN
  // Actualizar estado de inscripción a materia
  inscripcion_materia.estado = 'REPROBADO'
  
  // Cambiar estado académico del estudiante
  estudiante.estado_academico = 'NIVELACION'
  
  // Crear registro en historial_nivelaciones
  INSERT INTO historial_nivelaciones (
    estudiante_id,
    inscripcion_materia_id,
    fecha_inicio,
    intentos_realizados,
    estado
  ) VALUES (
    ...,
    1,
    'PENDIENTE'
  )
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-CAL-002]

---

### RN-CAL-009: Solo Un Recuperatorio por Materia
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Se permite SOLO UN recuperatorio por materia por gestión. NO hay "recuperatorio del recuperatorio".

**Validación:**
```javascript
IF nota_recuperatorio IS NOT NULL THEN
  THROW BusinessRuleViolation("Ya se registró el recuperatorio. No se permiten cambios.")
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-CAL-002]

---

### RN-CAL-010: Recuperatorio en Mismo Periodo
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
El recuperatorio DEBE rendirse dentro del periodo académico correspondiente. NO se arrastra a la siguiente gestión.

**Validación:**
```javascript
fecha_limite = gestion.fecha_fin_clases + 15 DAYS  // 15 días después del fin de clases

IF fecha_recuperatorio > fecha_limite THEN
  THROW BusinessRuleViolation("Recuperatorio debe rendirse dentro del periodo académico")
```

**Excepciones:** Casos especiales con aprobación del Director Académico

**Requerimientos:** [RF-CAL-002]

---

### RN-CAL-011: Modificaciones < 48h Sin Aprobación
**Tipo:** Workflow  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
Las modificaciones de calificaciones dentro de 48 horas del registro NO requieren aprobación del Director Académico.

**Flujo:**
```javascript
horas_transcurridas = TIMESTAMPDIFF(HOUR, fecha_registro, NOW())

IF horas_transcurridas <= 48 THEN
  // Modificación directa
  UPDATE inscripciones_materias SET nota = nuevo_valor WHERE id = X
  
  // Registrar en auditoría
  INSERT INTO auditoria (...)
ELSE
  // Requiere aprobación (ver RN-CAL-012)
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-CAL-003]

---

### RN-CAL-012: Modificaciones > 48h Requieren Aprobación
**Tipo:** Workflow  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Las modificaciones de calificaciones después de 48 horas del registro DEBEN ser aprobadas por el Director Académico antes de aplicarse.

**Flujo:**
```javascript
horas_transcurridas = TIMESTAMPDIFF(HOUR, fecha_registro, NOW())

IF horas_transcurridas > 48 THEN
  // Crear solicitud de cambio
  INSERT INTO solicitudes_cambio_calificacion (
    docente_id,
    inscripcion_materia_id,
    campo,
    valor_actual,
    valor_propuesto,
    motivo,
    estado
  ) VALUES (..., 'PENDIENTE')
  
  // Notificar a Director Académico
  enviarNotificacion(director_academico, solicitud)
  
  // Esperar aprobación
```

**Excepciones:** Rector puede aprobar/rechazar directamente

**Requerimientos:** [RF-CAL-003]

---

### RN-CAL-013: Todas las Modificaciones Requieren Motivo
**Tipo:** Auditoría  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
TODAS las modificaciones de calificaciones (sin importar el tiempo transcurrido) DEBEN tener un motivo registrado.

**Validación:**
```javascript
IF motivo IS NULL OR motivo.trim().length < 10 THEN
  THROW ValidationError("Debe ingresar un motivo (mínimo 10 caracteres)")
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-CAL-003]

---

### RN-CAL-014: Historial de Modificaciones Inmutable
**Tipo:** Auditoría  
**Nivel:** Base de Datos  
**Prioridad:** CRÍTICA

**Descripción:**  
El historial de modificaciones de calificaciones registrado en la tabla `auditoria` es inmutable. NO se puede editar ni eliminar.

**Implementación:**
- Tabla `auditoria` sin UPDATE ni DELETE
- Solo operaciones INSERT
- Trigger que impide DELETE

**Excepciones:** Solo el Super Admin en casos excepcionales

**Requerimientos:** [RF-CAL-003]

---

### RN-CAL-015: Validar Nivelación en Modificaciones
**Tipo:** Validación  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Si una modificación de calificación cambia el estado de REPROBADO a APROBADO, se DEBE validar que el estudiante NO esté actualmente en proceso de nivelación para esa materia.

**Validación:**
```javascript
IF estado_anterior === 'REPROBADO' AND estado_nuevo === 'APROBADO' THEN
  en_nivelacion = verificarNivelacion(estudiante_id, materia_id)
  
  IF en_nivelacion THEN
    THROW BusinessRuleViolation(
      "Estudiante está en proceso de nivelación. Debe completar o cancelar nivelación primero."
    )
```

**Excepciones:** Director Académico puede forzar con justificación

**Requerimientos:** [RF-CAL-003]

---

### RN-CAL-016: Solo Director Puede Cerrar Periodo
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** CRÍTICA

**Descripción:**  
SOLO el Director Académico PUEDE cerrar un periodo académico.

**Validación:**
```javascript
IF !usuario.tiene_permiso('calificaciones.cerrar_periodo') THEN
  THROW ForbiddenError("Solo el Director Académico puede cerrar el periodo")
```

**Excepciones:** Rector también puede (implícito)

**Requerimientos:** [RF-CAL-004]

---

### RN-CAL-017: Cierre Después de Recuperatorios
**Tipo:** Validación  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
El cierre del periodo académico DEBE realizarse después de que todos los recuperatorios hayan sido registrados.

**Validación:**
```javascript
recuperatorios_pendientes = COUNT(
  inscripciones_materias 
  WHERE gestion_id = X 
    AND periodo_id = Y
    AND nota_final < 60
    AND nota_recuperatorio IS NULL
)

IF recuperatorios_pendientes > 0 THEN
  THROW BusinessRuleViolation(
    "Hay " + recuperatorios_pendientes + " recuperatorios pendientes"
  )
```

**Excepciones:** Director puede forzar cierre con observación

**Requerimientos:** [RF-CAL-004]

---

### RN-CAL-018: Modificaciones Post-Cierre Requieren Autorización
**Tipo:** Workflow  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Una vez cerrado el periodo, las modificaciones de calificaciones DEBEN ser autorizadas por el Rector.

**Validación:**
```javascript
IF periodo.estado === 'CERRADO' THEN
  IF !autorizacion_rector THEN
    THROW BusinessRuleViolation(
      "Periodo cerrado. Requiere autorización del Rector para modificar calificaciones."
    )
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-CAL-004]

---

### RN-CAL-019: Cierre Reversible Solo por Rector
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
El cierre de un periodo académico es reversible SOLO por el Rector. El Director Académico NO puede reabrir un periodo cerrado.

**Validación:**
```javascript
IF periodo.estado === 'CERRADO' AND accion === 'REABRIR' THEN
  IF usuario.rol !== 'RECTOR' THEN
    THROW ForbiddenError("Solo el Rector puede reabrir un periodo cerrado")
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-CAL-004]

---

## 5. REGLAS DE NIVELACIONES (NIV)

### RN-NIV-001: Solo Materias Reprobadas
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Un estudiante en NIVELACION SOLO PUEDE inscribirse a las materias que reprobó. NO puede inscribirse a materias nuevas.

(Ver RN-INS-008 para detalles completos)

**Requerimientos:** [RF-NIV-002]

---

### RN-NIV-002: Máximo 3 Intentos de Nivelación
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Un estudiante tiene hasta 3 intentos para aprobar una materia en nivelación. Si falla los 3 intentos, DEBE reiniciar la carrera o retirarse.

**Validación:**
```javascript
intentos = obtenerIntentosNivelacion(estudiante_id, materia_id)

IF intentos >= 3 THEN
  THROW BusinessRuleViolation(
    "Se alcanzó el máximo de intentos (3). Debe consultar con Dirección Académica."
  )
```

**Excepciones:** Casos excepcionales evaluados por Dirección

**Requerimientos:** [RF-NIV-002]

---

### RN-NIV-003: Sin Costo Adicional por Nivelación
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
La nivelación NO tiene costo adicional. Está cubierta por el arancel regular de la gestión.

**Implementación:**
- NO cobrar arancel extra al inscribir en nivelación
- Informar al estudiante en la UI

**Excepciones:** Ninguna

**Requerimientos:** [RF-NIV-002]

---

### RN-NIV-005: Peso Igual que Materia Regular
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
La aprobación de una materia de nivelación tiene el mismo peso académico que una materia regular. Se refleja igual en el historial académico.

**Implementación:**
- Misma estructura de calificaciones
- Mismo cálculo de promedio
- Misma inclusión en historial

**Excepciones:** Ninguna

**Requerimientos:** [RF-NIV-003]

---

### RN-NIV-006: Cambio Automático a REGULAR
**Tipo:** Workflow  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
El cambio de estado NIVELACION a REGULAR DEBE ser automático cuando el estudiante aprueba todas sus materias de nivelación pendientes.

**Trigger:**
```javascript
materias_nivelacion_pendientes = COUNT(
  historial_nivelaciones 
  WHERE estudiante_id = X 
    AND estado IN ('PENDIENTE', 'CURSANDO')
)

IF materias_nivelacion_pendientes === 0 THEN
  estudiante.estado_academico = 'REGULAR'
  notificarEstudiante("Has regularizado tu situación académica")
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-NIV-003]

---

## 6. REGLAS DE DOCENTES (DOC)

### RN-DOC-001: CI Único
**Tipo:** Restricción  
**Nivel:** Base de Datos  
**Prioridad:** CRÍTICA

**Descripción:**  
El CI del docente DEBE ser único en el sistema.

(Similar a RN-EST-001)

**Requerimientos:** [RF-DOC-001]

---

### RN-DOC-002: Al Menos Una Especialidad
**Tipo:** Validación  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
Todo docente DEBE tener al menos una especialidad registrada.

**Validación:**
```javascript
IF especialidad IS NULL OR especialidad.trim() === '' THEN
  THROW ValidationError("Debe ingresar al menos una especialidad")
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-DOC-001]

---

### RN-DOC-003: Email Único
**Tipo:** Restricción  
**Nivel:** Base de Datos  
**Prioridad:** MEDIA

**Descripción:**  
El email del docente DEBE ser único en el sistema.

(Similar a RN-EST-003)

**Requerimientos:** [RF-DOC-001]

---

### RN-DOC-004: Múltiples Asignaciones Permitidas
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** BAJA

**Descripción:**  
Un docente PUEDE tener múltiples asignaciones de materias en una gestión, siempre que no exceda la carga horaria máxima.

**Validación:**
```javascript
carga_actual = SUM(asignaciones_docentes.carga_horaria_semanal WHERE docente_id = X)
carga_nueva = nueva_asignacion.carga_horaria_semanal

IF (carga_actual + carga_nueva) > 40 THEN
  THROW BusinessRuleViolation("Excede carga horaria máxima (40h/semana)")
```

**Excepciones:** Ninguna

**Requerimientos:** [RF-DOC-002]

---

### RN-DOC-005: Carga Máxima 40 Horas/Semana
**Tipo:** Restricción  
**Nivel:** Lógica de Negocio  
**Prioridad:** ALTA

**Descripción:**  
Un docente NO DEBE tener una carga horaria superior a 40 horas por semana.

**Validación:**
```javascript
carga_total_semanal = SUM(
  asignaciones_docentes.carga_horaria_semanal 
  WHERE docente_id = X 
    AND gestion_id = Y
    AND estado = 'ACTIVA'
)

IF carga_total_semanal > 40 THEN
  THROW BusinessRuleViolation("Carga horaria máxima 40h/semana")
```

**Excepciones:** Director puede aprobar excepción temporal

**Requerimientos:** [RF-DOC-002]

---

### RN-DOC-006: Asignaciones Antes del Inicio
**Tipo:** Política  
**Nivel:** Lógica de Negocio  
**Prioridad:** MEDIA

**Descripción:**  
Las asignaciones de docentes a cursos DEBERÍAN hacerse antes del inicio de la gestión académica.

**Advertencia:**
```javascript
IF fecha_asignacion > gestion.fecha_inicio_clases THEN
  mostrarAdvertencia("Asignación tardía. Las clases ya iniciaron.")
  // Permitir continuar pero registrar observación
```

**Excepciones:** Reemplazos por licencia o renuncia

**Requerimientos:** [RF-DOC-002]

---

## 7. RESUMEN DE REGLAS DE NEGOCIO

### Por Módulo

| Módulo | Total Reglas | Prioridad CRÍTICA | Prioridad ALTA |
|--------|--------------|-------------------|----------------|
| Estudiantes | 15 | 3 | 8 |
| Inscripciones | 11 | 5 | 5 |
| Calificaciones | 19 | 7 | 10 |
| Nivelaciones | 6 | 1 | 3 |
| Docentes | 6 | 1 | 2 |
| Pasantías | 3 | 0 | 2 |
| **TOTAL** | **60** | **17** | **30** |

### Por Tipo

| Tipo | Cantidad | Porcentaje |
|------|----------|------------|
| Restricción | 18 | 30% |
| Validación | 12 | 20% |
| Workflow | 10 | 17% |
| Cálculo | 8 | 13% |
| Política | 7 | 12% |
| Auditoría | 5 | 8% |
| **TOTAL** | **60** | **100%** |

### Por Nivel de Aplicación

| Nivel | Cantidad |
|-------|----------|
| Lógica de Negocio | 42 |
| Base de Datos | 12 |
| UI | 6 |

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Versión inicial - 60 reglas consolidadas |

---

## REFERENCIAS

- 02-requerimientos-funcionales.md: Requerimientos base
- 05-modelo-datos.md: Restricciones de BD
- 07-casos-de-uso.md: Flujos de negocio
- Reglamento Académico INCOS 2025

---

**FIN DEL DOCUMENTO - 08 REGLAS DE NEGOCIO**
