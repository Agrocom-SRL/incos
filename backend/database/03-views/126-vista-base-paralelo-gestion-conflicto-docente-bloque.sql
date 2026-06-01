-- ============================================
-- VISTA BASE: vista_base_paralelo_gestion_conflicto_docente_bloque
-- Pares de asignaciones del mismo docente en el mismo horario_id.
-- Al menos una oferta pertenece al paralelo_gestion de la fila.
--
-- Reutiliza lógica alineada a vista_base_docente_asignacion_conflicto_horario (65)
-- con alcance operativo por instancia paralelo_gestion.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_paralelo_gestion_conflicto_docente_bloque;

CREATE VIEW vista_base_paralelo_gestion_conflicto_docente_bloque AS
SELECT DISTINCT
  ah1.horario_id AS horarioId,
  ad1.id AS asignacionId1,
  ad2.id AS asignacionId2,
  ad1.docente_id AS docenteId,
  oc1.paralelo_gestion_id AS paraleloGestionId1,
  oc2.paralelo_gestion_id AS paraleloGestionId2,
  TRIM(CONCAT(
    COALESCE(d.nombres, ''),
    ' ',
    COALESCE(d.apellido_paterno, ''),
    ' ',
    COALESCE(d.apellido_materno, '')
  )) AS docenteNombre
FROM asignacion_horarios ah1
INNER JOIN asignaciones_docentes ad1
  ON ad1.id = ah1.asignacion_docente_id
  AND ad1.deleted_at IS NULL
  AND ad1.activo = TRUE
  AND ad1.vigente = TRUE
  AND ad1.docente_id IS NOT NULL
INNER JOIN oferta_cursos oc1
  ON oc1.id = ad1.oferta_curso_id
  AND oc1.deleted_at IS NULL
  AND oc1.activo = TRUE
INNER JOIN asignaciones_docentes ad2
  ON ad2.docente_id = ad1.docente_id
  AND ad2.id <> ad1.id
  AND ad2.deleted_at IS NULL
  AND ad2.activo = TRUE
  AND ad2.vigente = TRUE
  AND ad2.docente_id IS NOT NULL
INNER JOIN asignacion_horarios ah2
  ON ah2.asignacion_docente_id = ad2.id
  AND ah2.horario_id = ah1.horario_id
  AND ah2.deleted_at IS NULL
  AND ah2.activo = TRUE
INNER JOIN oferta_cursos oc2
  ON oc2.id = ad2.oferta_curso_id
  AND oc2.deleted_at IS NULL
  AND oc2.activo = TRUE
LEFT JOIN docentes d
  ON d.id = ad1.docente_id
  AND d.deleted_at IS NULL
WHERE ah1.deleted_at IS NULL
  AND ah1.activo = TRUE;
