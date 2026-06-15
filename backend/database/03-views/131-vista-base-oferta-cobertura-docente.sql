-- ============================================
-- VISTA BASE: vista_base_oferta_cobertura_docente
-- Cobertura docente de la oferta de cursos (¿cada oferta tiene docente vigente?).
--
-- Propósito (un grano: una fila por oferta_curso activa no eliminada):
-- - Cobertura docente de un paralelo_gestion (ofertas con/sin docente).
-- - Totales de cobertura por gestión.
--
-- Independiza del código Node la subconsulta EXISTS de asignación docente
-- vigente; el repositorio solo filtra y agrega sobre esta vista.
--
-- Reutiliza joins sobre:
-- - paralelos_gestion, gestiones_planes, asignaturas_plan, materias
-- - asignaciones_docentes (EXISTS de docente vigente)
--
-- Modelo de negocio:
-- paralelos_gestion → oferta_cursos → asignaciones_docentes
-- (tiene_docente = existe asignación vigente con docente).
--
-- Uso:
-- SELECT * FROM vista_base_oferta_cobertura_docente WHERE paralelo_gestion_id = ?;
-- SELECT COUNT(*) , SUM(tiene_docente) FROM vista_base_oferta_cobertura_docente WHERE gestion_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_oferta_cobertura_docente;

CREATE VIEW vista_base_oferta_cobertura_docente AS
SELECT
  oc.id AS oferta_curso_id,
  oc.paralelo_gestion_id AS paralelo_gestion_id,
  gp.gestion_id AS gestion_id,
  ap.orden_visualizacion AS orden_visualizacion,
  m.sigla AS asignatura,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM asignaciones_docentes ad
      WHERE ad.oferta_curso_id = oc.id
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
        AND ad.vigente = TRUE
        AND ad.docente_id IS NOT NULL
    ) THEN 1
    ELSE 0
  END AS tiene_docente
FROM oferta_cursos oc
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
  AND pg.activo = TRUE
INNER JOIN gestiones_planes gp
  ON gp.id = pg.gestion_plan_id
  AND gp.deleted_at IS NULL
  AND gp.activo = TRUE
INNER JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL
  AND ap.activo = TRUE
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL
WHERE oc.deleted_at IS NULL
  AND oc.activo = TRUE;
