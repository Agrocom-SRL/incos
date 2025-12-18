# PROPUESTA: SEPARACIÓN DE INSCRIPCIONES E HISTORIAL ACADÉMICO

## 📋 PROBLEMA ACTUAL

Actualmente, `inscripciones_materias` mezcla dos conceptos diferentes:

1. **INSCRIPCIÓN** (proceso administrativo):
   - Qué materias se inscribió el estudiante
   - En qué curso/paralelo
   - Con qué docente
   - Qué horario
   - Estado de inscripción (INSCRITO, CURSANDO, ABANDONO, RETIRADO)

2. **HISTORIAL ACADÉMICO** (resultado permanente):
   - Notas obtenidas
   - Aprobado/Reprobado
   - Gestión en que se cursó
   - Resultado final

## ✅ SOLUCIÓN PROPUESTA

### 1. INSCRIPCIONES (Proceso Administrativo)

**`inscripciones`** (MAESTRO):
- Estudiante + Gestión + Carrera
- Es la "boleta de inscripción" de esa gestión
- Temporal, específico de una gestión

**`inscripciones_materias`** (DETALLE):
- Materia inscrita
- Curso/paralelo elegido
- Docente asignado
- Horario (viene del curso)
- Estado de inscripción: `INSCRITO`, `CURSANDO`, `ABANDONO`, `RETIRADO`
- **NO tiene notas aquí** (solo información de inscripción)

### 2. HISTORIAL ACADÉMICO (Resultado Permanente)

**`calificaciones`** o **`historial_academico`**:
- Referencia a `inscripcion_materia_id` (de dónde viene)
- Materia cursada
- Gestión en que se cursó
- Docente que evaluó
- **Notas** (parciales, práctico, recuperatorio)
- Nota definitiva
- Estado final: `APROBADO`, `REPROBADO`, `NIVELACION`, etc.
- Asistencia final
- Es **permanente**, acumulativo
- Es lo que va en los **libros de registro** (folios)

## 📊 ESTRUCTURA PROPUESTA

```
inscripciones (MAESTRO)
  └── inscripciones_materias (DETALLE - solo inscripción)
        └── calificaciones (RESULTADO - notas y aprobado/reprobado)
```

## 🔄 FLUJO

1. **INSCRIPCIÓN**:
   - Estudiante se inscribe a materias → `inscripciones` + `inscripciones_materias`
   - Estado: `INSCRITO` o `CURSANDO`
   - No hay notas aún

2. **CURSADO**:
   - Estudiante cursa las materias
   - Se registran notas en `calificaciones`
   - Se actualiza estado en `inscripciones_materias` si abandona/retira

3. **CIERRE DE GESTIÓN**:
   - Se cierran las notas en `calificaciones`
   - Se determina APROBADO/REPROBADO
   - Se registra en historial académico permanente
   - Se puede registrar en libros de registro (folios)

## ✅ VENTAJAS

1. **Separación clara**: Inscripción vs. Resultado académico
2. **Boleta de inscripción**: Fácil de generar (inscripciones + inscripciones_materias)
3. **Historial académico**: Fácil de consultar (calificaciones)
4. **Flexibilidad**: Un estudiante puede inscribirse pero no cursar (no hay calificación)
5. **Trazabilidad**: Se puede rastrear de dónde viene cada calificación

## 📝 CAMBIOS NECESARIOS

1. **Simplificar `inscripciones_materias`**:
   - Eliminar campos de notas
   - Mantener solo: materia, curso, docente, estado de inscripción

2. **Crear `calificaciones`**:
   - Referencia a `inscripcion_materia_id`
   - Todas las notas
   - Resultado final (APROBADO/REPROBADO)
   - Gestión en que se cursó

3. **Actualizar `historial_nivelaciones`**:
   - Referencia a `calificacion_id` (no a `inscripcion_materia_id`)
