-- ============================================
-- VISTA: vista_pasantia_detalle
-- Ficha de una pasantía / convalidación (módulo TUT · Titulación, Fase 2).
--
-- Grano: una fila por pasantía vigente. Vista final delgada (patrón 160):
-- la base 166 completa (identidad + puesto + contrato + responsable +
-- contacto de la empresa) más dos subconsultas livianas de agregación sobre
-- los satélites, sin reescribir joins.
--
-- Bases:
--   - 166 vista_base_pasantia_fila (identidad + campos de ficha)
--   - pasantias_informes (total de informes elevados)
--   - pasantias_seguimientos (total, fecha y nivel de desempeño del último
--     seguimiento; el nivel usa el mismo SUBSTRING_INDEX(GROUP_CONCAT ...)
--     de la vista 160 — toma el último nivel NO nulo por fecha/id)
--
-- Las listas completas de informes y seguimientos de los tabs de la ficha
-- NO salen de esta vista: se consultan directo a sus tablas desde sus
-- propios repositorios/endpoints.
--
-- Consumidores:
--   - PasantiaViewRepository (backend) → GET /v1/pasantias/:id.
--   - Pantalla Pasantías ficha (modules/tutorias/pasantias/, tabs
--     informes/seguimientos).
--
-- Uso:
--   SELECT * FROM vista_pasantia_detalle WHERE pasantia_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_pasantia_detalle;

CREATE VIEW vista_pasantia_detalle AS
SELECT
  base.pasantia_id                          AS pasantia_id,
  base.tipo                                 AS tipo,
  base.estado                               AS estado,
  base.fecha_inicio                         AS fecha_inicio,
  base.fecha_finalizacion                   AS fecha_finalizacion,
  base.horas_requeridas                     AS horas_requeridas,
  base.horas_cumplidas                      AS horas_cumplidas,
  base.area_departamento                    AS area_departamento,
  base.cargo_puesto                         AS cargo_puesto,
  base.funciones                            AS funciones,
  base.tipo_contrato                        AS tipo_contrato,
  base.tipo_contrato_detalle                AS tipo_contrato_detalle,
  base.responsable_empresa                  AS responsable_empresa,
  base.cargo_responsable                    AS cargo_responsable,
  base.telefono_responsable                 AS telefono_responsable,
  base.observaciones                        AS observaciones,
  base.created_at                           AS created_at,
  base.carrera_id                           AS carrera_id,
  base.carrera_codigo                       AS carrera_codigo,
  base.carrera_nombre                       AS carrera_nombre,
  base.gestion_id                           AS gestion_id,
  base.gestion_codigo                       AS gestion_codigo,
  base.gestion_nombre                       AS gestion_nombre,
  base.gestion_anio                         AS gestion_anio,
  base.estudiante_id                        AS estudiante_id,
  base.codigo_estudiante                    AS codigo_estudiante,
  base.estudiante_ci                        AS estudiante_ci,
  base.estudiante_expedicion                AS estudiante_expedicion,
  base.estudiante_apellido_paterno          AS estudiante_apellido_paterno,
  base.estudiante_apellido_materno          AS estudiante_apellido_materno,
  base.estudiante_nombres                   AS estudiante_nombres,
  base.estudiante_nombre                    AS estudiante_nombre,
  base.estudiante_celular                   AS estudiante_celular,
  base.empresa_id                           AS empresa_id,
  base.empresa_nombre                       AS empresa_nombre,
  base.empresa_tipo_societario              AS empresa_tipo_societario,
  base.empresa_nit                          AS empresa_nit,
  base.empresa_en_funcionamiento            AS empresa_en_funcionamiento,
  base.empresa_direccion                    AS empresa_direccion,
  base.empresa_telefono                     AS empresa_telefono,
  base.empresa_sector_actividad             AS empresa_sector_actividad,
  base.docente_supervisor_id                AS docente_supervisor_id,
  base.docente_supervisor_apellido_paterno  AS docente_supervisor_apellido_paterno,
  base.docente_supervisor_apellido_materno  AS docente_supervisor_apellido_materno,
  base.docente_supervisor_nombres           AS docente_supervisor_nombres,
  base.docente_supervisor_nombre            AS docente_supervisor_nombre,
  COALESCE(inf.total_informes, 0)           AS total_informes,
  COALESCE(seg.total_seguimientos, 0)       AS total_seguimientos,
  seg.ultimo_seguimiento_fecha              AS ultimo_seguimiento_fecha,
  seg.ultimo_seguimiento_nivel_desempeno    AS ultimo_seguimiento_nivel_desempeno
FROM vista_base_pasantia_fila base
LEFT JOIN (
  SELECT
    i.pasantia_id,
    COUNT(*) AS total_informes
  FROM pasantias_informes i
  WHERE i.activo = TRUE
    AND i.deleted_at IS NULL
  GROUP BY i.pasantia_id
) inf ON inf.pasantia_id = base.pasantia_id
LEFT JOIN (
  SELECT
    s.pasantia_id,
    COUNT(*) AS total_seguimientos,
    MAX(s.fecha) AS ultimo_seguimiento_fecha,
    SUBSTRING_INDEX(GROUP_CONCAT(s.nivel_desempeno ORDER BY s.fecha DESC, s.id DESC), ',', 1) AS ultimo_seguimiento_nivel_desempeno
  FROM pasantias_seguimientos s
  WHERE s.activo = TRUE
    AND s.deleted_at IS NULL
  GROUP BY s.pasantia_id
) seg ON seg.pasantia_id = base.pasantia_id;
