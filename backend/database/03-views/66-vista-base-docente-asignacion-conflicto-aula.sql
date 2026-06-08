-- ============================================
-- VISTA BASE: vista_base_docente_asignacion_conflicto_aula
-- Cruce de aula efectiva + horario entre paralelos_gestion distintos.
--
-- Aula efectiva = COALESCE(asignacion_horarios.aula_id, paralelos_gestion.aula_id).
-- Solape intra-paralelo: vista_base_horarios_paralelo_conflictos_solape_bloque (86).
-- Alineado con vista_base_horarios_paralelo_conflictos_aula (72).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_asignacion_conflicto_aula;

CREATE VIEW vista_base_docente_asignacion_conflicto_aula AS
SELECT DISTINCT
  ad2.id AS asignacion_docente_id,
  ad2.docente_id
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
INNER JOIN asignaciones_docentes ad3
  ON ad3.id <> ad2.id
  AND ad3.deleted_at IS NULL
  AND ad3.activo = TRUE
  AND ad3.vigente = TRUE
INNER JOIN asignacion_horarios ah3
  ON ah3.asignacion_docente_id = ad3.id
  AND ah3.deleted_at IS NULL
  AND ah3.activo = TRUE
  AND ah3.horario_id = ah2.horario_id
INNER JOIN oferta_cursos oc3
  ON oc3.id = ad3.oferta_curso_id
  AND oc3.deleted_at IS NULL
  AND oc3.activo = TRUE
INNER JOIN paralelos_gestion pg3
  ON pg3.id = oc3.paralelo_gestion_id
  AND pg3.deleted_at IS NULL
  AND pg3.id <> pg2.id
WHERE ad2.deleted_at IS NULL
  AND ad2.activo = TRUE
  AND ad2.vigente = TRUE
  AND ad2.docente_id IS NOT NULL
  AND ah2.horario_id IS NOT NULL
  AND COALESCE(ah2.aula_id, pg2.aula_id) IS NOT NULL
  AND COALESCE(ah3.aula_id, pg3.aula_id) = COALESCE(ah2.aula_id, pg2.aula_id);
