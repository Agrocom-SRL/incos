# Documento 1 — Schema de datos
## Sistema de Gestión Académica · Instituto INCOS
**Versión:** 2.0 (refactorización del módulo de seguridad)
**Fecha:** 2026-04-08

---

## 1. Resumen de cambios al schema existente

Este documento describe los cambios al modelo de base de datos derivados de la refactorización del módulo de seguridad. La premisa central es que el schema base (`roles`, `permisos`, `roles_permisos`, `usuarios_permisos`, `sesiones`) **no se reemplaza** — se extiende con cambios mínimos y quirúrgicos.

---

## 2. Cambio 1 — ENUM de acciones (el más importante)

Afecta a tres tablas: `permiso_acciones`, `roles_permisos`, `usuarios_permisos`.

### Antes

```sql
ENUM('VER','CREAR','EDITAR','ELIMINAR','APROBAR','EXPORTAR')
```

### Después

```sql
ENUM('LISTAR','DETALLE','CREAR','EDITAR','ELIMINAR','ACTIVAR','APROBAR','EXPORTAR','GENERAR_PDF')
```

### Semántica de cada acción

| Acción | Qué controla | Mapeado a |
|---|---|---|
| `LISTAR` | Ítem visible en sidebar + URL de listado accesible | `GET /recurso` (colección) |
| `DETALLE` | Botón "ver" en fila de tabla + URL `/:id` accesible | `GET /recurso/:id` |
| `CREAR` | Botón "nuevo" en header + URL `/registrar` + acceso rápido en sidebar si aplica | `POST /recurso` |
| `EDITAR` | Botón "editar" en fila + URL `/:id/editar` | `PUT /recurso/:id` |
| `ELIMINAR` | Botón "eliminar" en fila + confirmación | `DELETE /recurso/:id` |
| `ACTIVAR` | Toggle estado en fila (activo/bloqueado) | `PATCH /recurso/:id/estado` |
| `APROBAR` | Botón de aprobación en flujos de workflow | endpoint de aprobación |
| `EXPORTAR` | Botón exportar Excel/CSV | `GET /recurso/export` |
| `GENERAR_PDF` | Botón generar documento PDF | `POST /recurso/:id/documentos/:tipo` |

### SQL de migración

```sql
-- permiso_acciones
ALTER TABLE permiso_acciones
  MODIFY accion ENUM(
    'LISTAR','DETALLE','CREAR','EDITAR','ELIMINAR',
    'ACTIVAR','APROBAR','EXPORTAR','GENERAR_PDF'
  ) NOT NULL;

-- roles_permisos
ALTER TABLE roles_permisos
  MODIFY accion ENUM(
    'LISTAR','DETALLE','CREAR','EDITAR','ELIMINAR',
    'ACTIVAR','APROBAR','EXPORTAR','GENERAR_PDF'
  ) NOT NULL;

-- usuarios_permisos
ALTER TABLE usuarios_permisos
  MODIFY accion ENUM(
    'LISTAR','DETALLE','CREAR','EDITAR','ELIMINAR',
    'ACTIVAR','APROBAR','EXPORTAR','GENERAR_PDF'
  ) NOT NULL;
```

> **Nota de migración:** Los registros existentes con `accion = 'VER'` deben actualizarse a `'LISTAR'` antes de ejecutar el ALTER TABLE. Ver sección 6 (script de migración de datos).

---

## 3. Cambio 2 — Campos nuevos en tabla `permisos`

Se agregan dos campos para soportar la grilla del panel de seguridad y la estructura del sidebar.

```sql
ALTER TABLE permisos
  ADD COLUMN grupo_ui VARCHAR(100) NULL
    COMMENT 'Agrupa permisos relacionados en una sola fila en la grilla del panel de seguridad.
             Ejemplo: "mat_admision" agrupa matricula.admision.ver + .crear + .editar',

  ADD COLUMN ruta_sidebar VARCHAR(150) NULL
    COMMENT 'Path del sidebar que controla este permiso.
             Ejemplo: /estudiantes/listar · Se muestra en el separador de sección de la grilla.',

  ADD INDEX idx_grupo_ui (grupo_ui);
```

### Valores de `grupo_ui` para los permisos existentes (seed de actualización)

```sql
-- MATRÍCULA
UPDATE permisos SET grupo_ui = 'mat_admision'
  WHERE codigo IN ('matricula.admision.ver','matricula.admision.crear','matricula.admision.editar');

UPDATE permisos SET grupo_ui = 'mat_inscripcion'
  WHERE codigo IN ('matricula.inscribir','matricula.inscripcion.editar');

UPDATE permisos SET grupo_ui = 'mat_aportes'
  WHERE codigo = 'matricula.pago.aporte.ver';

UPDATE permisos SET grupo_ui = 'mat_becas'
  WHERE codigo IN ('matricula.beca.ver','matricula.beca.asignar','matricula.beca.aprobar');

UPDATE permisos SET grupo_ui = 'mat_pasantias'
  WHERE codigo LIKE 'matricula.pasantia%';   -- permisos nuevos, ver sección 4

UPDATE permisos SET grupo_ui = 'mat_documentos'
  WHERE codigo = 'matricula.documento.ver';

-- ACADÉMICO
UPDATE permisos SET grupo_ui = 'aca_calificaciones'
  WHERE codigo LIKE 'academico.calificacion%';

UPDATE permisos SET grupo_ui = 'aca_nivelaciones'
  WHERE codigo LIKE 'academico.nivelacion%';

UPDATE permisos SET grupo_ui = 'aca_traspasos'
  WHERE codigo LIKE 'academico.trazabilidad.traspaso%';

UPDATE permisos SET grupo_ui = 'aca_transitabilidad'
  WHERE codigo LIKE 'academico.trazabilidad.transitabilidad%';

UPDATE permisos SET grupo_ui = 'aca_historial'
  WHERE codigo LIKE 'academico.historial%';

UPDATE permisos SET grupo_ui = 'aca_licencias_est'
  WHERE codigo LIKE 'academico.licencia%';

UPDATE permisos SET grupo_ui = 'aca_avance'
  WHERE codigo = 'academico.avance';   -- permiso nuevo, ver sección 4
```

---

## 4. Cambio 3 — Nuevos permisos (INSERTs en tabla `permisos`)

Permisos que no existían en el seed original y deben agregarse.

```sql
INSERT INTO permisos (codigo, nombre, dominio, modulo, grupo_ui, ruta_sidebar, activo) VALUES

-- Avance académico (vista de progreso del estudiante en su carrera)
('academico.avance', 'Ver avance académico del estudiante', 'ACADEMICO', 'ACA',
 'aca_avance', '/academico/avance', TRUE),

-- Pasantías estudiantiles (reubicadas desde DOC, sujeto = estudiante)
('matricula.pasantia.ver',      'Ver pasantías estudiantiles',      'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/listar', TRUE),
('matricula.pasantia.solicitar','Solicitar pasantía (estudiante)',   'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/solicitar', TRUE),
('matricula.pasantia.aprobar',  'Aprobar pasantía estudiantil',      'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/aprobar', TRUE),
('matricula.pasantia.evaluar',  'Evaluar pasantía estudiantil',      'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/evaluar', TRUE),

-- Empresas/convenios (catálogo compartido, vive en CFG)
('cfg.convenios.ver',    'Ver empresas y convenios',    'CONFIGURACION', 'CFG', 'cfg_convenios', '/configuracion/convenios', TRUE),
('cfg.convenios.crear',  'Registrar empresa/convenio',  'CONFIGURACION', 'CFG', 'cfg_convenios', '/configuracion/convenios', TRUE),
('cfg.convenios.editar', 'Editar empresa/convenio',     'CONFIGURACION', 'CFG', 'cfg_convenios', '/configuracion/convenios', TRUE);
```

---

## 5. Cambio 4 — Nuevo dominio CFG en tabla `permisos`

Los permisos que estaban bajo `INSTITUCIONAL` y corresponden a configuraciones del sistema se reclasifican al dominio `CONFIGURACION` con módulo `CFG`.

```sql
-- Reclasificar permisos de configuración académica
UPDATE permisos SET dominio = 'CONFIGURACION', modulo = 'CFG'
  WHERE codigo LIKE 'institucional.config.academico%'
     OR codigo LIKE 'institucional.config.documentacion%'
     OR codigo LIKE 'institucional.config.complementario%'
     OR codigo = 'institucional.config.gestionar'
     OR codigo = 'institucional.config.historial_actividades';
```

---

## 6. Script de migración de datos (VER → LISTAR)

Ejecutar **antes** del ALTER TABLE del ENUM.

```sql
-- Paso 1: actualizar roles_permisos
UPDATE roles_permisos SET accion = 'LISTAR' WHERE accion = 'VER';

-- Paso 2: actualizar usuarios_permisos
UPDATE usuarios_permisos SET accion = 'LISTAR' WHERE accion = 'VER';

-- Paso 3: actualizar permiso_acciones
UPDATE permiso_acciones SET accion = 'LISTAR' WHERE accion = 'VER';

-- Paso 4: verificar que no queden registros con VER antes del ALTER
SELECT COUNT(*) AS pendientes FROM roles_permisos    WHERE accion = 'VER';
SELECT COUNT(*) AS pendientes FROM usuarios_permisos WHERE accion = 'VER';
SELECT COUNT(*) AS pendientes FROM permiso_acciones  WHERE accion = 'VER';
-- Los tres deben devolver 0 antes de continuar

-- Paso 5: ejecutar los ALTER TABLE del ENUM (ver sección 2)
```

---

## 7. Cambio 5 — `permiso_acciones`: acciones válidas actualizadas

Con el nuevo ENUM, el catálogo de acciones válidas por permiso debe actualizarse. Los permisos que antes tenían `VER` ahora tienen `LISTAR`. Además se agregan `DETALLE` donde corresponde.

### Regla general por tipo de permiso

| Tipo de funcionalidad | Acciones válidas |
|---|---|
| Grupo de datos con tabla | `LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR` |
| Grupo de datos con activación de estado | agrega `ACTIVAR` |
| Documento/PDF | agrega `GENERAR_PDF` |
| Exportación | agrega `EXPORTAR` |
| Flujo de aprobación | agrega `APROBAR` |
| Solo lectura (reportes, historial) | `LISTAR, EXPORTAR` |
| Catálogos de configuración | `LISTAR, CREAR, EDITAR, ELIMINAR` |

### Ejemplo para `matricula.admision.*`

```sql
-- Eliminar las filas VER del grupo y reemplazar con LISTAR + DETALLE
DELETE FROM permiso_acciones
  WHERE permiso_id IN (
    SELECT id FROM permisos WHERE codigo IN (
      'matricula.admision.ver','matricula.admision.crear','matricula.admision.editar'
    )
  );

-- Reinsertar con el nuevo vocabulario
-- permiso_id 1 = matricula.admision.ver (permiso base del grupo)
INSERT INTO permiso_acciones (permiso_id, accion, activo) VALUES
  (1, 'LISTAR',      TRUE),
  (1, 'DETALLE',     TRUE),
  (1, 'EXPORTAR',    TRUE),
  (2, 'CREAR',       TRUE),   -- matricula.admision.crear
  (3, 'EDITAR',      TRUE),   -- matricula.admision.editar
  (3, 'ELIMINAR',    TRUE),
  (3, 'ACTIVAR',     TRUE);
```

---

## 8. Tabla resumen: estructura final de la BD de seguridad

| Tabla | Estado | Cambios |
|---|---|---|
| `roles` | Sin cambios | Agregar rol futuro `EGRESADO` cuando se implemente titulación |
| `permisos` | Extendida | +2 campos: `grupo_ui`, `ruta_sidebar`. Nuevos registros para avance, pasantías EST, convenios |
| `permiso_acciones` | Modificada | ENUM ampliado. Registros actualizados VER→LISTAR, DETALLE agregado |
| `roles_permisos` | Modificada | ENUM ampliado. Datos migrados VER→LISTAR |
| `usuarios_permisos` | Modificada | ENUM ampliado. Datos migrados VER→LISTAR |
| `sesiones` | Sin cambios | — |
| `usuarios` | Sin cambios | `tipo_referencia ENUM` ya incluye todos los roles necesarios |

---

## 9. Nota sobre titulación (fase futura)

Cuando se implemente el módulo de titulación, la extensión al schema será:

```sql
-- Nuevos permisos (sin cambio estructural)
INSERT INTO permisos (codigo, nombre, dominio, modulo, grupo_ui) VALUES
  ('matricula.titulacion.solicitar', 'Solicitar titulación',    'MATRICULA', 'MAT', 'mat_titulacion'),
  ('matricula.titulacion.validar',   'Validar requisitos',       'MATRICULA', 'MAT', 'mat_titulacion'),
  ('matricula.titulacion.emitir',    'Emitir título/diploma',    'MATRICULA', 'MAT', 'mat_titulacion');

-- Asignación a roles correspondientes en roles_permisos
-- No requiere cambios estructurales en ninguna tabla
```

El sistema de roles y permisos ya soporta esta extensión sin modificaciones.
