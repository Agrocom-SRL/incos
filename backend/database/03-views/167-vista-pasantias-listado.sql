-- ============================================
-- VISTA: vista_pasantias_listado
-- Listado de pasantías / convalidaciones (módulo TUT · Titulación, Fase 2).
--
-- Grano: una fila por pasantía vigente. Vista final delgada (patrón 87/160):
-- proyección de la base 166 con solo las columnas del listado; los campos de
-- ficha (puesto, contrato, contacto de la empresa) quedan en la vista 168.
--
-- Bases:
--   - 166 vista_base_pasantia_fila (única base; identidad ya resuelta)
--
-- Filtros del repositorio (NO son otras vistas):
--   - carrera_id / gestion_id / estado / tipo → filtros del listado general.
--   - docente_supervisor_id = ? → wrapper docente "Mis pasantías supervisadas".
--   - estudiante_id = ? → wrapper estudiante "Mi pasantía".
--
-- Consumidores:
--   - PasantiaViewRepository (backend) → GET /v1/pasantias,
--     GET /v1/pasantias/mis-supervisadas, GET /v1/pasantias/mi-pasantia.
--   - Pantalla Pasantías listado (modules/tutorias/pasantias/).
--
-- Uso:
--   SELECT * FROM vista_pasantias_listado
--   WHERE gestion_id = ? AND carrera_id = ?
--   ORDER BY estudiante_nombre;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_pasantias_listado;

CREATE VIEW vista_pasantias_listado AS
SELECT
  base.pasantia_id                          AS pasantia_id,
  base.tipo                                 AS tipo,
  base.estado                               AS estado,
  base.fecha_inicio                         AS fecha_inicio,
  base.fecha_finalizacion                   AS fecha_finalizacion,
  base.horas_requeridas                     AS horas_requeridas,
  base.horas_cumplidas                      AS horas_cumplidas,
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
  base.empresa_id                           AS empresa_id,
  base.empresa_nombre                       AS empresa_nombre,
  base.docente_supervisor_id                AS docente_supervisor_id,
  base.docente_supervisor_apellido_paterno  AS docente_supervisor_apellido_paterno,
  base.docente_supervisor_apellido_materno  AS docente_supervisor_apellido_materno,
  base.docente_supervisor_nombres           AS docente_supervisor_nombres,
  base.docente_supervisor_nombre            AS docente_supervisor_nombre
FROM vista_base_pasantia_fila base;
