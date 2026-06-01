-- ============================================
-- VISTA BASE: vista_base_paralelo_gestion_conflicto_paralelo_bloque
-- Dos o más ofertas del mismo paralelo_gestion en el mismo horario_id.
--
-- Nota: vista_base_horarios_paralelo_conflictos_solape_bloque (86) agrupa por
-- paralelo maestro para tablero; esta vista es detalle por instancia de gestión.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_paralelo_gestion_conflicto_paralelo_bloque;

CREATE VIEW vista_base_paralelo_gestion_conflicto_paralelo_bloque AS
SELECT
  oc.paralelo_gestion_id AS paraleloGestionId,
  ah.horario_id AS horarioId,
  GROUP_CONCAT(DISTINCT ad.id ORDER BY ad.id) AS asignacionIds
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
WHERE ah.deleted_at IS NULL
  AND ah.activo = TRUE
  AND ah.horario_id IS NOT NULL
GROUP BY oc.paralelo_gestion_id, ah.horario_id
HAVING COUNT(DISTINCT oc.id) > 1;
