-- ============================================
-- VISTA BASE: vista_base_acompanamiento_sesion_fila
-- Sesiones de refuerzo enriquecidas (módulo TUT · acompañamiento).
--
-- Grano: una fila por sesión de refuerzo vigente.
--
-- Bases (reutiliza, no duplica joins):
--   - sesiones_refuerzo (schema 23)
--   - 130 vista_base_asignacion_docente_detalle → oferta/paralelo/gestión/
--     materia/docente de la asignación (columnas reales: materia_sigla,
--     materia_nombre, paralelo_nombre, docente_apellido_paterno/materno/
--     nombres; el nombre compuesto se arma aquí en orden institucional).
--   - aulas (catálogo)
--   - sesion_refuerzo_estudiantes (subconsulta de agregados)
--
-- Consumidores:
--   - AcompanamientoSesionViewRepository (backend) →
--     GET /acompanamiento/sesiones y GET /acompanamiento/sesiones/:id.
--   - Vista agregada 162 (resumen por gestión/carrera/mes).
--
-- Uso:
--   SELECT * FROM vista_base_acompanamiento_sesion_fila
--   WHERE gestion_id = ?
--   ORDER BY fecha DESC, hora_inicio DESC;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_acompanamiento_sesion_fila;

CREATE VIEW vista_base_acompanamiento_sesion_fila AS
SELECT
  s.id                     AS sesion_id,
  s.fecha                  AS fecha,
  s.hora_inicio            AS hora_inicio,
  s.hora_fin               AS hora_fin,
  s.modalidad              AS modalidad,
  s.aula_id                AS aula_id,
  au.nombre                AS aula_nombre,
  s.enlace_virtual         AS enlace_virtual,
  s.tema                   AS tema,
  s.estado                 AS estado,
  s.activo                 AS activo,
  vad.id                   AS asignacion_docente_id,
  vad.oferta_curso_id      AS oferta_curso_id,
  vad.paralelo_gestion_id  AS paralelo_gestion_id,
  vad.gestion_id           AS gestion_id,
  vad.docente_id           AS docente_id,
  NULLIF(TRIM(CONCAT_WS(' ', vad.docente_apellido_paterno, vad.docente_apellido_materno, vad.docente_nombres)), '') AS docente_nombre,
  vad.materia_sigla        AS materia_sigla,
  vad.materia_nombre       AS materia_nombre,
  vad.paralelo_nombre      AS paralelo_nombre,
  COALESCE(est.total_participantes, 0) AS total_participantes,
  COALESCE(est.asistieron, 0)          AS asistieron,
  COALESCE(est.mejorados, 0)           AS mejorados
FROM sesiones_refuerzo s
INNER JOIN vista_base_asignacion_docente_detalle vad
  ON vad.id = s.asignacion_docente_id
LEFT JOIN aulas au
  ON au.id = s.aula_id
  AND au.deleted_at IS NULL
LEFT JOIN (
  SELECT
    se.sesion_refuerzo_id,
    COUNT(*) AS total_participantes,
    SUM(CASE WHEN se.asistio = TRUE THEN 1 ELSE 0 END) AS asistieron,
    SUM(CASE WHEN se.progreso = 'MEJORADO' THEN 1 ELSE 0 END) AS mejorados
  FROM sesion_refuerzo_estudiantes se
  WHERE se.activo = TRUE
    AND se.deleted_at IS NULL
  GROUP BY se.sesion_refuerzo_id
) est ON est.sesion_refuerzo_id = s.id
WHERE s.activo = TRUE
  AND s.deleted_at IS NULL;
