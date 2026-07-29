-- ============================================
-- VISTA BASE: vista_base_tutoria_proyecto_integrante_fila
-- Proyectos de grado × integrantes (módulo TUT · titulación).
--
-- Grano: una fila por integrante vigente (integrantes_proyecto activo, no
-- borrado) de cada proyecto de grado activo. Los proyectos legacy
-- individuales también entran: su titular vive en integrantes_proyecto
-- (CreateProyectoGradoUseCase siempre crea el TITULAR).
--
-- Bases:
--   - proyectos_grado (raíz, 22-modalidades-grado.sql; NO se duplica)
--   - integrantes_proyecto (satélite, schema 23)
--   - estudiantes / modalidades_grado / carreras / docentes (catálogos)
--
-- Nombres en orden institucional: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
--
-- Consumidores:
--   - Vista final 160 (vista_tutoria_proyectos_listado).
--   - ProyectoGradoListadoViewRepository (backend) → tab Integrantes de
--     GET /proyectos-grado/:id y GET /proyectos-grado/mi-proyecto.
--
-- Uso:
--   SELECT * FROM vista_base_tutoria_proyecto_integrante_fila
--   WHERE proyecto_grado_id = ?
--   ORDER BY integrante_rol, estudiante_nombre;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_tutoria_proyecto_integrante_fila;

CREATE VIEW vista_base_tutoria_proyecto_integrante_fila AS
SELECT
  p.id                      AS proyecto_grado_id,
  p.titulo                  AS titulo,
  p.estado                  AS proyecto_estado,
  p.gestion_id              AS gestion_id,
  c.id                      AS carrera_id,
  c.codigo                  AS carrera_codigo,
  c.nombre                  AS carrera_nombre,
  mg.id                     AS modalidad_id,
  mg.codigo                 AS modalidad_codigo,
  mg.nombre                 AS modalidad_nombre,
  p.tutor_id                AS tutor_id,
  NULLIF(TRIM(CONCAT_WS(' ', d.apellido_paterno, d.apellido_materno, d.nombres)), '') AS tutor_nombre,
  ti.id                     AS integrante_proyecto_id,
  ti.rol                    AS integrante_rol,
  ti.estado                 AS integrante_estado,
  ti.fecha_incorporacion    AS fecha_incorporacion,
  ti.observaciones          AS integrante_observaciones,
  est.id                    AS estudiante_id,
  est.codigo_estudiante     AS codigo_estudiante,
  est.ci                    AS estudiante_ci,
  NULLIF(TRIM(CONCAT_WS(' ', est.apellido_paterno, est.apellido_materno, est.nombres)), '') AS estudiante_nombre
FROM proyectos_grado p
INNER JOIN integrantes_proyecto ti
  ON ti.proyecto_grado_id = p.id
  AND ti.activo = TRUE
  AND ti.deleted_at IS NULL
INNER JOIN estudiantes est
  ON est.id = ti.estudiante_id
  AND est.deleted_at IS NULL
LEFT JOIN modalidades_grado mg
  ON mg.id = p.modalidad_id
  AND mg.deleted_at IS NULL
LEFT JOIN carreras c
  ON c.id = p.carrera_id
  AND c.deleted_at IS NULL
LEFT JOIN docentes d
  ON d.id = p.tutor_id
  AND d.deleted_at IS NULL
WHERE p.activo = TRUE
  AND p.deleted_at IS NULL;
