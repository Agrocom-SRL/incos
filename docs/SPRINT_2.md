# Sprint 2 — Schema V2: DDL nuevo, drop legacy

**Documento padre:** `PLAN_V2_MAESTRO.md`
**Duración estimada:** 3-5 días
**Pre-requisito:** Sprint 1 cerrado (catálogo Plan de Estudio operativo).

---

## 1. Objetivo

Reescribir el schema de horarios y oferta académica. Esto es un sprint **solo de base de datos**, sin endpoints ni UI, pero con scripts de migración y seeders actualizados.

Decisión confirmada: la base se vacía y se reconstruye. No hay migración de datos legacy.

## 2. Entregables

1. **Script DDL** que elimina las tablas obsoletas y crea las nuevas.
2. **Seeders actualizados** que ya no referencian `cursos`/`cursos_horarios`.
3. **Tests del schema** (foreign keys, índices, soft delete funcionando).
4. **Documentación inline** en los `.sql` con comentarios COMMENT.

## 3. Tablas eliminadas (DROP)

```sql
DROP TABLE IF EXISTS cursos_horarios;
DROP TABLE IF EXISTS cursos;
```

Si hay dependencias en `asignaciones_docentes.curso_id` o `matriculas_materia.asignacion_docente_id`, se manejan en la sección 5 (ALTER).

## 4. Tablas nuevas (CREATE)

### 4.1 `paralelos_gestion`

Instancia de un paralelo en una gestión específica con su aula base y turno efectivo.

```sql
CREATE TABLE paralelos_gestion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gestion_plan_id INT NULL COMMENT 'Plan habilitado en la gestión (gestiones_planes.id)',
    paralelo_id INT NULL COMMENT 'Paralelo maestro reutilizable',
    aula_id INT NULL COMMENT 'Aula base por defecto. Casi inmutable durante la gestión.',
    turno ENUM('MAÑANA','TARDE','NOCHE') NOT NULL COMMENT 'Turno efectivo. Si difiere del paralelo maestro, la app reasigna bloques.',
    
    estado ENUM('BORRADOR','OFERTADO','PUBLICADO','CERRADO') DEFAULT 'BORRADOR'
        COMMENT 'BORRADOR: en armado. OFERTADO: lista para matrícula. PUBLICADO: con horario completo. CERRADO: gestión finalizada.',
    cupo_maximo INT DEFAULT 35,
    cupo_minimo INT DEFAULT 10,
    observaciones TEXT,
    
    -- Auditoría estándar
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_by INT NULL,
    
    FOREIGN KEY (gestion_plan_id) REFERENCES gestiones_planes(id) ON DELETE SET NULL,
    FOREIGN KEY (paralelo_id) REFERENCES paralelos(id) ON DELETE SET NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL,
    
    INDEX idx_gestion_plan_id (gestion_plan_id),
    INDEX idx_paralelo_id (paralelo_id),
    INDEX idx_aula_id (aula_id),
    INDEX idx_estado (estado),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_gestion_paralelo (gestion_plan_id, paralelo_id, activo, deleted_at)
        COMMENT 'Búsqueda principal: paralelos de una gestión'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Instancia de un paralelo en una gestión específica. Padre de oferta_cursos.';
```

### 4.2 `oferta_cursos`

Reemplaza a `cursos`. Cada fila es una materia ofertada en un paralelo-gestión.

```sql
CREATE TABLE oferta_cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paralelo_gestion_id INT NULL COMMENT 'Paralelo en su gestión',
    asignatura_plan_id INT NULL COMMENT 'Asignatura del plan (define materia + periodo + horas_semanales)',
    
    estado ENUM('PROGRAMADA','ACTIVA','CERRADA','CANCELADA') DEFAULT 'PROGRAMADA',
    observaciones TEXT,
    
    -- Auditoría estándar
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_by INT NULL,
    
    FOREIGN KEY (paralelo_gestion_id) REFERENCES paralelos_gestion(id) ON DELETE SET NULL,
    FOREIGN KEY (asignatura_plan_id) REFERENCES asignaturas_plan(id) ON DELETE SET NULL,
    
    INDEX idx_paralelo_gestion_id (paralelo_gestion_id),
    INDEX idx_asignatura_plan_id (asignatura_plan_id),
    INDEX idx_estado (estado),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_paralelo_asignatura (paralelo_gestion_id, asignatura_plan_id, activo, deleted_at)
        COMMENT 'Búsqueda principal: oferta de un paralelo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Reemplaza cursos. Materia ofertada en un paralelo-gestión específico.';
```

### 4.3 `asignacion_horarios`

Reemplaza a `cursos_horarios`. Bloques que cuelgan de la asignación docente.

```sql
CREATE TABLE asignacion_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_docente_id INT NULL COMMENT 'Asignación docente (= docente + oferta_curso)',
    horario_id INT NULL COMMENT 'Bloque del calendario semanal',
    aula_id INT NULL COMMENT 'Aula del bloque. NULL = usa aula base del paralelo_gestion.',
    orden_secuencia INT NOT NULL DEFAULT 1 COMMENT 'Orden cronológico durante la semana',
    
    -- Auditoría estándar
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_by INT NULL,
    
    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL,
    
    INDEX idx_asignacion_docente_id (asignacion_docente_id),
    INDEX idx_horario_id (horario_id),
    INDEX idx_aula_id (aula_id),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_horario_aula (horario_id, aula_id, activo, deleted_at)
        COMMENT 'Detección conflicto aula (mismo horario + misma aula)',
    INDEX idx_asignacion_orden (asignacion_docente_id, orden_secuencia, activo, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Reemplaza cursos_horarios. Bloques que cuelgan de la asignación docente.';
```

## 5. ALTER de tablas existentes

### 5.1 `docentes` — agregar color y máximos de carga

```sql
ALTER TABLE docentes
    ADD COLUMN color_hex VARCHAR(7) NULL 
        COMMENT 'Color exclusivo del docente para visualización en horarios.'
        AFTER observaciones,
    ADD COLUMN max_horas_semana INT NULL DEFAULT 20
        COMMENT 'Carga máxima semanal según contrato. Default 20 (basado en data real 2026).'
        AFTER color_hex,
    ADD COLUMN max_horas_mes INT NULL DEFAULT 80
        COMMENT 'Carga máxima mensual según contrato. Default 80.'
        AFTER max_horas_semana;
```

### 5.2 `asignaciones_docentes` — apuntar a oferta_curso

```sql
ALTER TABLE asignaciones_docentes
    ADD COLUMN oferta_curso_id INT NULL 
        COMMENT 'Oferta de curso a la que se asigna el docente. Reemplaza curso_id de V1.'
        AFTER gestion_plan_id,
    ADD FOREIGN KEY (oferta_curso_id) REFERENCES oferta_cursos(id) ON DELETE SET NULL,
    ADD INDEX idx_oferta_curso_id (oferta_curso_id),
    DROP FOREIGN KEY asignaciones_docentes_ibfk_2,
    DROP COLUMN curso_id;
```

*Nota: el nombre exacto de la FK (`_ibfk_2`) puede variar; ajustar tras inspeccionar `SHOW CREATE TABLE asignaciones_docentes`.*

### 5.3 `matriculas_materia` — apuntar a oferta_curso

```sql
ALTER TABLE matriculas_materia
    ADD COLUMN oferta_curso_id INT NULL
        COMMENT 'Oferta de curso que cursa el estudiante. Estable durante la gestión.'
        AFTER inscripcion_id,
    ADD FOREIGN KEY (oferta_curso_id) REFERENCES oferta_cursos(id) ON DELETE SET NULL,
    ADD INDEX idx_oferta_curso_id (oferta_curso_id),
    DROP FOREIGN KEY matriculas_materia_ibfk_2,
    DROP COLUMN asignacion_docente_id;
```

`asignatura_plan_id` se conserva como redundancia controlada (ya documentada en el schema actual). Sirve para que las evaluaciones, historial y nivelaciones sigan funcionando sin tocar nada.

## 6. Orden de ejecución del script

```sql
SET FOREIGN_KEY_CHECKS = 0;

-- 1) Drop legacy
DROP TABLE IF EXISTS cursos_horarios;
DROP TABLE IF EXISTS cursos;

-- 2) Alter docentes
ALTER TABLE docentes ...;

-- 3) Crear tablas nuevas en orden de dependencia
CREATE TABLE paralelos_gestion ...;
CREATE TABLE oferta_cursos ...;
CREATE TABLE asignacion_horarios ...;

-- 4) Alter tablas que dependen de oferta_cursos
ALTER TABLE asignaciones_docentes ...;
ALTER TABLE matriculas_materia ...;

SET FOREIGN_KEY_CHECKS = 1;
```

## 7. Seeders a actualizar

- **Eliminar:** cualquier seeder que poblaba `cursos` o `cursos_horarios` (probablemente archivos como `25-cursos.sql`, `26-cursos-horarios.sql` si existen).
- **Mantener:** seeders de catálogo (`18-carreras.sql`, `19-materias.sql`, `20-planes-estudios.sql`, etc.).
- **No agregar todavía** seeders para `paralelos_gestion`, `oferta_cursos`, `asignacion_horarios`. Esas tablas se poblarán dinámicamente desde la UI de los Sprints 3-5.

## 8. Tests del schema

Crear test mínimo que valide:

1. Las tablas nuevas existen y tienen las columnas esperadas.
2. Las FKs apuntan correctamente y permiten NULL.
3. Los índices nuevos están presentes.
4. `cursos` y `cursos_horarios` ya NO existen.
5. `asignaciones_docentes` ya NO tiene `curso_id`.
6. `matriculas_materia` ya NO tiene `asignacion_docente_id`.
7. `docentes.color_hex`, `max_horas_semana`, `max_horas_mes` existen con sus defaults.
8. Soft delete: insertar fila, marcar `deleted_at`, consulta filtrada por `deleted_at IS NULL` no la trae.

## 9. Definition of Done

- [ ] Script `migration_v2.sql` ejecuta sin errores en BD vacía.
- [ ] Script `migration_v2.sql` ejecuta sin errores en BD con seeders 1-21 cargados.
- [ ] `SHOW TABLES` no muestra `cursos` ni `cursos_horarios`.
- [ ] `DESCRIBE asignaciones_docentes` muestra `oferta_curso_id` y NO `curso_id`.
- [ ] `DESCRIBE matriculas_materia` muestra `oferta_curso_id` y NO `asignacion_docente_id`.
- [ ] `DESCRIBE docentes` muestra `color_hex`, `max_horas_semana`, `max_horas_mes`.
- [ ] Tests automatizados de la sección 8 pasando.
- [ ] Seeders 1-21 + DDL V2 se ejecutan en orden y dejan la BD lista para Sprint 3.

---

## 10. Prompt para agente IA

```
Contexto: Sistema académico INCOS. Estamos en Sprint 2 del plan V2. Aquí solo tocamos el
schema MySQL. La BD se vacía y reconstruye limpia (decisión confirmada del usuario).

Necesito que generes:

1) Un archivo SQL único `40-migration-v2-horarios.sql` que en una sola transacción:
   - DROP TABLE cursos_horarios, cursos.
   - ALTER docentes para agregar color_hex (VARCHAR 7 NULL), max_horas_semana (INT NULL
     DEFAULT 20), max_horas_mes (INT NULL DEFAULT 80).
   - CREATE TABLE paralelos_gestion según SPRINT_2.md sección 4.1.
   - CREATE TABLE oferta_cursos según SPRINT_2.md sección 4.2.
   - CREATE TABLE asignacion_horarios según SPRINT_2.md sección 4.3.
   - ALTER asignaciones_docentes: agregar oferta_curso_id FK a oferta_cursos, eliminar
     curso_id (la FK actual se debe inspeccionar y dropear primero por nombre real).
   - ALTER matriculas_materia: agregar oferta_curso_id FK a oferta_cursos, eliminar
     asignacion_docente_id.

   Reglas del proyecto:
   - Todas las FKs nuevas: NULL permitido, ON DELETE SET NULL.
   - Sin UNIQUE, sin CHECK.
   - Auditoría estándar completa en cada tabla nueva (activo, created_at, updated_at,
     deleted_at, created_by, updated_by, deleted_by).
   - Índices según los listados en cada CREATE TABLE.
   - COMMENT documentando propósito en cada tabla y columna importante.

2) Eliminar (o renombrar a .legacy) los archivos de seeder que poblaban cursos o
   cursos_horarios. Lista los archivos afectados antes de eliminar.

3) Tests del schema en Jest/Mocha (según lo que use el backend) que validen los 8
   puntos de la sección 8 de SPRINT_2.md.

4) Un script `reset-db.sh` que en orden ejecuta: schema base completo + seeders 1-21 +
   40-migration-v2-horarios.sql, dejando la BD lista para Sprint 3.

No generes endpoints ni código de aplicación. Solo schema y tests.

Empieza por el SQL.
```
