-- ============================================
-- VISTA BASE: vista_base_paralelo_gestion_conflicto_aula_bloque
-- Misma franja y misma aula efectiva (bloque o aula base del paralelo_gestion).
--
-- Nota: vista_base_horarios_paralelo_conflictos_aula (72) solo considera aula_id
-- explícito en el bloque y agrupa por paralelo maestro; usar esta vista para grilla.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_paralelo_gestion_conflicto_aula_bloque;

CREATE VIEW vista_base_paralelo_gestion_conflicto_aula_bloque AS
SELECT
  bloques.paralelo_gestion_id AS paraleloGestionId,
  bloques.horario_id AS horarioId,
  bloques.aula_efectiva_id AS aulaId,
  GROUP_CONCAT(DISTINCT bloques.asignacion_docente_id ORDER BY bloques.asignacion_docente_id) AS asignacionIds
FROM (
  SELECT
    oc.paralelo_gestion_id,
    ah.horario_id,
    ad.id AS asignacion_docente_id,
    COALESCE(ah.aula_id, pg.aula_id) AS aula_efectiva_id
  FROM asignacion_horarios ah
  INNER JOIN asignaciones_docentes ad
    ON ad.id = ah.asignacion_docente_id
    AND ad.deleted_at IS NULL
    AND ad.activo = TRUE
    AND ad.vigente = TRUE
  INNER JOIN oferta_cursos oc
    ON oc.id = ad.oferta_curso_id
    AND oc.deleted_at IS NULL
    AND oc.activo = TRUE
  INNER JOIN paralelos_gestion pg
    ON pg.id = oc.paralelo_gestion_id
    AND pg.deleted_at IS NULL
  WHERE ah.deleted_at IS NULL
    AND ah.activo = TRUE
    AND ah.horario_id IS NOT NULL
    AND COALESCE(ah.aula_id, pg.aula_id) IS NOT NULL
) bloques
GROUP BY bloques.paralelo_gestion_id, bloques.horario_id, bloques.aula_efectiva_id
HAVING COUNT(DISTINCT bloques.asignacion_docente_id) > 1;
