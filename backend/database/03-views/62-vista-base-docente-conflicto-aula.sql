-- ============================================
-- VISTA BASE: vista_base_docente_conflicto_aula
-- Cruces de aula efectiva + horario entre paralelos_gestion (por docente).
--
-- Aula: paralelos_gestion.aula_id.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_conflicto_aula;

CREATE VIEW vista_base_docente_conflicto_aula AS
SELECT
  ad.docente_id,
  COUNT(DISTINCT CONCAT(
    pg.aula_id, ':', ah.horario_id
  )) AS aula_conflictos
FROM asignaciones_docentes ad
INNER JOIN asignacion_horarios ah
  ON ah.asignacion_docente_id = ad.id
  AND ah.deleted_at IS NULL
  AND ah.activo = TRUE
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL
  AND oc.activo = TRUE
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN (
  SELECT DISTINCT
    base.aula_efectiva_id,
    base.horario_id
  FROM (
    SELECT
      pg2.aula_id AS aula_efectiva_id,
      ah2.horario_id,
      pg2.id AS paralelo_gestion_id
    FROM asignaciones_docentes ad2
    INNER JOIN asignacion_horarios ah2
      ON ah2.asignacion_docente_id = ad2.id
      AND ah2.deleted_at IS NULL
      AND ah2.activo = TRUE
    INNER JOIN oferta_cursos oc2
      ON oc2.id = ad2.oferta_curso_id
      AND oc2.deleted_at IS NULL
      AND oc2.activo = TRUE
    INNER JOIN paralelos_gestion pg2
      ON pg2.id = oc2.paralelo_gestion_id
      AND pg2.deleted_at IS NULL
    WHERE ad2.deleted_at IS NULL
      AND ad2.activo = TRUE
      AND ad2.vigente = TRUE
      AND ah2.horario_id IS NOT NULL
      AND pg2.aula_id IS NOT NULL
  ) base
  INNER JOIN (
    SELECT
      pg3.aula_id AS aula_efectiva_id,
      ah3.horario_id,
      pg3.id AS paralelo_gestion_id
    FROM asignaciones_docentes ad3
    INNER JOIN asignacion_horarios ah3
      ON ah3.asignacion_docente_id = ad3.id
      AND ah3.deleted_at IS NULL
      AND ah3.activo = TRUE
    INNER JOIN oferta_cursos oc3
      ON oc3.id = ad3.oferta_curso_id
      AND oc3.deleted_at IS NULL
      AND oc3.activo = TRUE
    INNER JOIN paralelos_gestion pg3
      ON pg3.id = oc3.paralelo_gestion_id
      AND pg3.deleted_at IS NULL
    WHERE ad3.deleted_at IS NULL
      AND ad3.activo = TRUE
      AND ad3.vigente = TRUE
      AND ah3.horario_id IS NOT NULL
      AND pg3.aula_id IS NOT NULL
  ) otro
    ON otro.aula_efectiva_id = base.aula_efectiva_id
    AND otro.horario_id = base.horario_id
    AND otro.paralelo_gestion_id <> base.paralelo_gestion_id
) g
  ON g.aula_efectiva_id = pg.aula_id
  AND g.horario_id = ah.horario_id
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
  AND ad.docente_id IS NOT NULL
  AND ah.horario_id IS NOT NULL
  AND pg.aula_id IS NOT NULL
GROUP BY ad.docente_id;
