-- ============================================
-- VISTA BASE: vista_base_asignacion_docente_detalle
-- Detalle enriquecido de asignaciones_docentes (docente ↔ oferta).
--
-- Propósito (un solo grano: una fila por asignacion_docente no eliminada):
-- - Listado enriquecido de asignaciones (oferta, materia, paralelo, docente).
-- - Detalle de una asignación docente.
-- - Carga horaria del docente por gestión (detalle y resumen agregado).
--
-- Independiza del código Node la cadena de JOINs; el repositorio solo filtra
-- y agrega sobre esta vista (acoplamiento por columnas, no por SQL embebido).
--
-- Reutiliza joins sobre:
-- - oferta_cursos, paralelos_gestion, gestiones_planes
-- - asignaturas_plan, materias, paralelos, docentes
--
-- Modelo de negocio:
-- paralelos_gestion → oferta_cursos → asignaciones_docentes
-- (carga horaria efectiva = COALESCE(carga_horaria, horas_semanales del plan)).
--
-- Uso:
-- SELECT * FROM vista_base_asignacion_docente_detalle
-- WHERE docente_id = ? AND gestion_id = ? AND activo = TRUE AND vigente = TRUE;
--
-- 2026-08-06 (aditivo, Fase D frontend): se agregó asignatura_plan_id
-- (oc.asignatura_plan_id, ya estaba en el JOIN, solo faltaba seleccionarlo)
-- para que la vista 135 y la 185 (Nivelación) puedan matchear un evento de
-- historial_matricula ANCLADO a una materia arrastrada (sin matrícula) con
-- la columna correcta del pivote del paralelo actual.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_asignacion_docente_detalle;

CREATE VIEW vista_base_asignacion_docente_detalle AS
SELECT
  ad.id AS id,
  ad.gestion_plan_id AS gestion_plan_id,
  ad.oferta_curso_id AS oferta_curso_id,
  oc.asignatura_plan_id AS asignatura_plan_id,
  pg.id AS paralelo_gestion_id,
  gp.gestion_id AS gestion_id,
  ad.docente_id AS docente_id,
  ad.carga_horaria AS carga_horaria,
  ap.horas_semanales AS horas_semanales,
  COALESCE(ad.carga_horaria, ap.horas_semanales, 0) AS horas,
  ad.vigente AS vigente,
  ad.activo AS activo,
  ad.motivo AS motivo,
  ad.fecha_asignacion AS fecha_asignacion,
  ad.created_at AS created_at,
  ad.updated_at AS updated_at,
  ap.orden_visualizacion AS orden_visualizacion,
  m.sigla AS materia_sigla,
  m.nombre AS materia_nombre,
  p.nombre AS paralelo_nombre,
  doc.nombres AS docente_nombres,
  doc.apellido_paterno AS docente_apellido_paterno,
  doc.apellido_materno AS docente_apellido_materno,
  doc.color_hex AS color_hex,
  doc.max_horas_semana AS max_horas_semana
FROM asignaciones_docentes ad
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN gestiones_planes gp
  ON gp.id = ad.gestion_plan_id
  AND gp.deleted_at IS NULL
INNER JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL
INNER JOIN paralelos p
  ON p.id = pg.paralelo_id
  AND p.deleted_at IS NULL
LEFT JOIN docentes doc
  ON doc.id = ad.docente_id
  AND doc.deleted_at IS NULL
WHERE ad.deleted_at IS NULL;
