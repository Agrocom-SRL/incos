# Sprint 2 — Schema V2: DDL nuevo, drop legacy

**Documento padre:** `PLAN_V2_MAESTRO.md`
**Duración estimada:** 3-5 días
**Pre-requisito:** Sprint 1 cerrado (catálogo Plan de Estudio operativo).

---

## 1. Objetivo

Reescribir el schema de horarios y oferta académica. Este es un sprint **solo de base de datos**, sin endpoints ni UI.

Decisión confirmada: la base se vacía y se reconstruye aplicando manualmente los `.sql` de `backend/database/01-schemas/` y los seeders de `02-seeders/`. No hay migración de datos legacy ni scripts automáticos en servidor.

## 2. Entregables

1. **Schemas en `01-schemas/`** — tablas V2 integradas en los archivos existentes (no un script suelto en `05-migrations/`).
2. **Seeders actualizados** (`27`–`48`) que ya no referencian `cursos`/`cursos_horarios`.
3. **Documentación inline** en los `.sql` con comentarios COMMENT.

**Fuera de alcance:** scripts `backend/scripts/`, tests Jest de integración, `npm run db:reset`. El DBA aplica SQL manualmente.

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

## 6. Dónde vive el DDL (no usar `05-migrations/`)

Los cambios V2 están **integrados en los schemas base**, no en un archivo de migración incremental:

| Archivo | Contenido |
|---|---|
| `06-estructura-academica-parte2.sql` | docentes (+ color, máx. carga), paralelos, aulas, horarios |
| `07-estructura-academica-parte3.sql` | gestiones, gestiones_planes, actividades, periodos, calendario |
| `08-estructura-academica-oferta.sql` | `paralelos_gestion` + `oferta_cursos` |
| `09-estructura-academica-horarios.sql` | `asignaciones_docentes` + `asignacion_horarios` |
| `13-inscripciones.sql` | `matriculas_materia.oferta_curso_id` (requiere `08`) |
| `22-supervision-libros.sql` | `supervisiones_programadas.oferta_curso_id` |

**Orden de aplicación manual** (BD vacía o reconstruida):

1. Schemas `01-schemas/` en orden numérico: `01` … `07` → `08` (oferta) → `09` (horarios) → `10` … `24`.
2. Seeders `02-seeders/` en orden numérico (ver §7).
3. Vistas `03-views/` al final.

Los archivos en `05-migrations/` (`01`–`03`) quedan en **segundo plano**: solo para migrar datos reales legacy cuando el schema V2 ya esté aplicado.

## 7. Seeders — orden alineado a Sprints 3 → 4 → 5

| Archivo | Sprint | Tabla |
|---|---|---|
| `27-seed-paralelos-gestion.sql` | 3 | Todos los `paralelos_gestion` (18 filas) |
| `28-seed-oferta-cursos-sistemas.sql` | 3 | `oferta_cursos` SIS (1–30) |
| `29-seed-oferta-cursos-administracion.sql` | 3 | `oferta_cursos` ADM (31–74) |
| `30-seed-oferta-cursos-contaduria.sql` | 3 | `oferta_cursos` CON (75–140) |
| `31`–`39` seed-asignaciones-docentes-* | 4 | `asignaciones_docentes` (docente → oferta) |
| `40`–`48` seed-asignacion-horarios-* | 5 | `asignacion_horarios` (bloques por asignación docente) |

Los bloques horarios **dependen** de `asignacion_docente_id`; por eso asignaciones (31–39) van **antes** que horarios (40–48).

IDs numéricos de oferta (1–140) y asignaciones se conservan para compatibilidad con datos institucionales 2026.

## 8. Validación manual (checklist al aplicar SQL)

Tras ejecutar schemas + seeders en tu cliente MySQL:

1. `SHOW TABLES` no incluye `cursos` ni `cursos_horarios`.
2. Existen `paralelos_gestion`, `oferta_cursos`, `asignacion_horarios`.
3. `DESCRIBE asignaciones_docentes` → `oferta_curso_id` (sin `curso_id`).
4. `DESCRIBE matriculas_materia` → `oferta_curso_id` (sin `asignacion_docente_id`).
5. `DESCRIBE docentes` → `color_hex`, `max_horas_semana`, `max_horas_mes`.
6. Conteos: 140 filas en `oferta_cursos`; 18 en `paralelos_gestion` (SIS 4 + ADM 6 + CON 8).

## 9. Definition of Done

- [x] Schemas `06`, `07`, `12`, `20` actualizados con DDL V2.
- [x] Seeders `27`–`48` reestructurados (sin `.legacy`, sin renombrar a archivo muerto).
- [x] Sin scripts automáticos en `backend/scripts/` ni tests de integración de schema.
- [ ] Aplicación manual en servidor verificada por el DBA (checklist §8).
- [ ] Vistas `03-views/` que referencian `cursos` — migración por grupos en Sprints 3–5 (`MIGRACION_CODIGO_V2.md` §3.3).

---

## 10. Prompt para agente IA

```
Contexto: Sistema académico INCOS. Sprint 2 del plan V2 — solo schema MySQL.
La BD se reconstruye limpia. El usuario aplica SQL MANUALMENTE; no crear scripts
automáticos ni tests de integración.

Modificar directamente backend/database/01-schemas/:
  - 06, 07, 08 (oferta: paralelos_gestion + oferta_cursos)
  - 09 (horarios: asignaciones_docentes + asignacion_horarios)
  - 13-inscripciones.sql, 22-supervision-libros.sql

Reestructurar seeders 27-48 (orden = Sprint 3 → 4 → 5):
  - 27: paralelos_gestion (único archivo)
  - 28-30: oferta_cursos por carrera
  - 31-39: asignaciones_docentes (ANTES de horarios)
  - 40-48: asignacion_horarios (bloques por asignacion_docente_id)

NO crear 40-migration-v2-horarios.sql en 05-migrations/.
NO crear backend/scripts/ ni tests schema-v2.

Reglas: FKs NULL + ON DELETE SET NULL, auditoría estándar, COMMENT en tablas/columnas.
```
