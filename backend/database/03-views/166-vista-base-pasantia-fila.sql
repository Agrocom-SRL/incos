-- ============================================
-- VISTA BASE: vista_base_pasantia_fila
-- Práctica laboral / pasantías (módulo TUT · Titulación, Fase 2).
--
-- Grano: una fila por pasantía vigente (pasantias activa, no borrada) con su
-- identidad resuelta: estudiante, empresa, carrera, gestión y docente
-- supervisor. Incluye los campos propios del trámite (puesto, contrato,
-- responsable en la empresa) y el contacto de la empresa, para que las
-- vistas finales 167 (listado) y 168 (detalle) sean proyecciones delgadas
-- sin reescribir joins (patrón 159/160).
--
-- Bases:
--   - pasantias (raíz, 24-pasantias.sql; NO se duplica en otras vistas)
--   - pasantias_empresas / estudiantes / docentes / carreras / gestiones
--     (catálogos, LEFT JOIN: las FK de la raíz son NULLables ON DELETE SET NULL)
--
-- Nombres en orden institucional: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES
-- (mismo CONCAT_WS que la vista 159).
--
-- Consumidores:
--   - Vistas finales 167 (vista_pasantias_listado) y
--     168 (vista_pasantia_detalle). El backend consume las finales,
--     no esta base.
--
-- Uso:
--   SELECT * FROM vista_base_pasantia_fila WHERE pasantia_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_pasantia_fila;

CREATE VIEW vista_base_pasantia_fila AS
SELECT
  p.id                      AS pasantia_id,
  p.tipo                    AS tipo,
  p.estado                  AS estado,
  p.fecha_inicio            AS fecha_inicio,
  p.fecha_finalizacion      AS fecha_finalizacion,
  p.horas_requeridas        AS horas_requeridas,
  p.horas_cumplidas         AS horas_cumplidas,
  p.area_departamento       AS area_departamento,
  p.cargo_puesto            AS cargo_puesto,
  p.funciones               AS funciones,
  p.tipo_contrato           AS tipo_contrato,
  p.tipo_contrato_detalle   AS tipo_contrato_detalle,
  p.responsable_empresa     AS responsable_empresa,
  p.cargo_responsable       AS cargo_responsable,
  p.telefono_responsable    AS telefono_responsable,
  p.observaciones           AS observaciones,
  p.created_at              AS created_at,
  p.carrera_id              AS carrera_id,
  c.codigo                  AS carrera_codigo,
  c.nombre                  AS carrera_nombre,
  p.gestion_id              AS gestion_id,
  g.codigo                  AS gestion_codigo,
  g.nombre                  AS gestion_nombre,
  g.anio                    AS gestion_anio,
  p.estudiante_id           AS estudiante_id,
  est.codigo_estudiante     AS codigo_estudiante,
  est.ci                    AS estudiante_ci,
  est.expedicion            AS estudiante_expedicion,
  est.apellido_paterno      AS estudiante_apellido_paterno,
  est.apellido_materno      AS estudiante_apellido_materno,
  est.nombres               AS estudiante_nombres,
  NULLIF(TRIM(CONCAT_WS(' ', est.apellido_paterno, est.apellido_materno, est.nombres)), '') AS estudiante_nombre,
  est.celular               AS estudiante_celular,
  p.empresa_id              AS empresa_id,
  emp.nombre                AS empresa_nombre,
  emp.tipo_societario       AS empresa_tipo_societario,
  emp.nit                   AS empresa_nit,
  emp.en_funcionamiento     AS empresa_en_funcionamiento,
  emp.direccion             AS empresa_direccion,
  emp.telefono              AS empresa_telefono,
  emp.sector_actividad      AS empresa_sector_actividad,
  p.docente_supervisor_id   AS docente_supervisor_id,
  d.apellido_paterno        AS docente_supervisor_apellido_paterno,
  d.apellido_materno        AS docente_supervisor_apellido_materno,
  d.nombres                 AS docente_supervisor_nombres,
  NULLIF(TRIM(CONCAT_WS(' ', d.apellido_paterno, d.apellido_materno, d.nombres)), '') AS docente_supervisor_nombre
FROM pasantias p
LEFT JOIN estudiantes est
  ON est.id = p.estudiante_id
  AND est.deleted_at IS NULL
LEFT JOIN pasantias_empresas emp
  ON emp.id = p.empresa_id
  AND emp.deleted_at IS NULL
LEFT JOIN carreras c
  ON c.id = p.carrera_id
  AND c.deleted_at IS NULL
LEFT JOIN gestiones g
  ON g.id = p.gestion_id
  AND g.deleted_at IS NULL
LEFT JOIN docentes d
  ON d.id = p.docente_supervisor_id
  AND d.deleted_at IS NULL
WHERE p.activo = TRUE
  AND p.deleted_at IS NULL;
