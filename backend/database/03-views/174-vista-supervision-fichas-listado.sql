-- ============================================
-- VISTA: vista_supervision_fichas_listado
-- Listado de fichas de seguimiento en la clase presencial (módulo DOC ·
-- supervisión docente, Fase 3).
--
-- Grano: una fila por ficha vigente (activo=1, sin soft delete). Vista final
-- delgada (patrón 87/160/167): base transaccional `fichas_seguimiento_clase`
-- + contexto académico REUTILIZADO de la vista 51
-- (vista_base_docente_asignaciones_curso: docente, asignatura, carrera,
-- paralelo/curso, gestión) + evaluador resuelto desde `usuarios` con la
-- referencia polimórfica (patrón vista 26). NO expone los TEXT de
-- observaciones (quedan en la ficha/detalle vía tabla raíz).
--
-- Resultado derivado (el schema 27 no tiene columna resultado):
--   - docs_presentados: COUNT de los 4 booleanos tiene_* en SI (0-4).
--   - docs_completos: el mismo conteo en formato «n/4».
--   - estudiantes_asistentes / estudiantes_en_planilla: asistencia observada.
--
-- Filtros del repositorio (NO son otras vistas):
--   - docente_id = ? → wrapper self «mis fichas» del docente (anti-IDOR,
--     resolveDocenteIdForUsuario en servidor).
--   - gestion_id / fecha_seguimiento BETWEEN ? AND ? / search → listado staff.
--
-- Consumidores:
--   - FichaSeguimientoListadoViewRepository (backend) →
--     GET /v1/supervision-docente, GET /v1/supervision-docente/mis-fichas.
--   - Pantalla Supervisión docente (modules/docentes/supervision/, iter. 2).
--
-- Uso:
--   SELECT * FROM vista_supervision_fichas_listado
--   WHERE gestion_id = ? ORDER BY fecha_seguimiento DESC;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_supervision_fichas_listado;

CREATE VIEW vista_supervision_fichas_listado AS
SELECT
  f.id                                      AS id,
  f.fecha_seguimiento                       AS fecha_seguimiento,
  f.clase_observada                         AS clase_observada,
  f.asignacion_docente_id                   AS asignacion_docente_id,
  vad.docente_id                            AS docente_id,
  NULLIF(TRIM(CONCAT_WS(' ', doc.apellido_paterno, doc.apellido_materno, doc.nombres)), '')
                                            AS docente_nombre,
  vad.materia_nombre                        AS asignatura_nombre,
  vad.materia_sigla                         AS asignatura_sigla,
  vad.carrera_id                            AS carrera_id,
  vad.carrera_codigo                        AS carrera_codigo,
  vad.carrera_nombre                        AS carrera_nombre,
  vad.paralelo_periodo_nombre               AS paralelo_periodo_nombre,
  vad.paralelo_nombre                       AS paralelo_nombre,
  vad.paralelo_turno                        AS paralelo_turno,
  vad.gestion_id                            AS gestion_id,
  vad.gestion_nombre                        AS gestion_nombre,
  vad.gestion_anio                          AS gestion_anio,
  f.supervisor_id                           AS supervisor_id,
  -- Evaluador (usuarios no guarda nombres: se resuelven por la referencia
  -- polimórfica tipo_referencia/referencia_id, patrón de la vista 26).
  -- Orden institucional APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
  COALESCE(
    NULLIF(TRIM(CONCAT_WS(' ', per.apellido_paterno, per.apellido_materno, per.nombres)), ''),
    NULLIF(TRIM(CONCAT_WS(' ', dev.apellido_paterno, dev.apellido_materno, dev.nombres)), ''),
    NULLIF(TRIM(CONCAT_WS(' ', pnr.apellido_paterno, pnr.apellido_materno, pnr.nombres)), ''),
    u.username
  )                                         AS evaluador_nombre,
  (COALESCE(f.tiene_cronograma_bimestral, 0)
   + COALESCE(f.tiene_plan_bimestral, 0)
   + COALESCE(f.tiene_registro_asistencia, 0)
   + COALESCE(f.tiene_registro_pedagogico, 0))
                                            AS docs_presentados,
  CONCAT(
    (COALESCE(f.tiene_cronograma_bimestral, 0)
     + COALESCE(f.tiene_plan_bimestral, 0)
     + COALESCE(f.tiene_registro_asistencia, 0)
     + COALESCE(f.tiene_registro_pedagogico, 0)),
    '/4'
  )                                         AS docs_completos,
  f.estudiantes_en_planilla                 AS estudiantes_en_planilla,
  f.estudiantes_asistentes                  AS estudiantes_asistentes,
  f.created_at                              AS created_at
FROM fichas_seguimiento_clase f
LEFT JOIN vista_base_docente_asignaciones_curso vad
  ON vad.asignacion_docente_id = f.asignacion_docente_id
LEFT JOIN docentes doc
  ON doc.id = vad.docente_id
  AND doc.deleted_at IS NULL
LEFT JOIN usuarios u
  ON u.id = f.supervisor_id
  AND u.deleted_at IS NULL
LEFT JOIN personal per
  ON u.tipo_referencia IN ('RECTOR', 'DIRECTOR', 'SECRETARIA')
  AND per.id = u.referencia_id
  AND per.deleted_at IS NULL
LEFT JOIN docentes dev
  ON u.tipo_referencia = 'DOCENTE'
  AND dev.id = u.referencia_id
  AND dev.deleted_at IS NULL
LEFT JOIN personal pnr
  ON u.tipo_referencia IS NULL
  AND u.referencia_id IS NOT NULL
  AND pnr.id = u.referencia_id
  AND pnr.deleted_at IS NULL
WHERE f.activo = TRUE
  AND f.deleted_at IS NULL;
