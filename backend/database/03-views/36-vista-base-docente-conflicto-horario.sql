-- ============================================
-- VISTA BASE: vista_base_docente_conflicto_horario_par
-- Pares de bloques (asignacion_horarios) del mismo docente en el mismo horario_id,
-- dentro de una gestión académica. Consumidor: grilla de resolución de conflictos.
--
-- PRIMITIVO CANÓNICO del choque de horario del mismo docente. Define UNA sola vez
-- el self-join (mismo docente · mismo horario_id · 2 asignaciones distintas). Las
-- vistas derivadas reutilizan este primitivo en lugar de reescribir el predicado:
--   - 52  vista_base_docente_bloque_conflicto_horario   (bloques en par)
--   - 61  vista_base_docente_conflicto_horario          (conteo por docente)
--   - 65  vista_base_docente_asignacion_conflicto_horario (flag por asignación)
--   - 79  vista_base_horarios_paralelo_docente_choque_horario (paralelo_gestion)
--   - 91  vista_base_cursos_choque_docente_horario_por_paralelo
--   - 93  vista_base_dashboard_detalle_conflicto_docente_horario (detalle)
-- Por eso expone también ids _a/_b de asignación, oferta y paralelo.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_conflicto_horario_par;

CREATE VIEW vista_base_docente_conflicto_horario_par AS
SELECT DISTINCT
  ad2.docente_id AS docente_id,
  gp2.gestion_id AS gestion_id,
  ad2.id AS asignacion_docente_id_a,
  ad3.id AS asignacion_docente_id_b,
  oc2.id AS oferta_curso_id_a,
  oc3.id AS oferta_curso_id_b,
  pg2.paralelo_id AS paralelo_id_a,
  pg3.paralelo_id AS paralelo_id_b,
  ah2.id AS bloque_a_id,
  ah3.id AS bloque_b_id,
  h.id AS horario_id,
  h.dia AS dia,
  h.hora_inicio AS hora_inicio,
  h.hora_fin AS hora_fin,
  COALESCE(NULLIF(TRIM(m2.sigla), ''), m2.nombre, CONCAT('OC-', oc2.id)) AS sigla_a,
  COALESCE(NULLIF(TRIM(m3.sigla), ''), m3.nombre, CONCAT('OC-', oc3.id)) AS sigla_b,
  p2.nombre AS paralelo_a,
  p3.nombre AS paralelo_b,
  pg2.id AS paralelo_gestion_id_a,
  pg3.id AS paralelo_gestion_id_b
FROM asignaciones_docentes ad2
INNER JOIN gestiones_planes gp2
  ON gp2.id = ad2.gestion_plan_id
  AND gp2.deleted_at IS NULL
INNER JOIN asignacion_horarios ah2
  ON ah2.asignacion_docente_id = ad2.id
  AND ah2.deleted_at IS NULL
  AND ah2.activo = TRUE
INNER JOIN horarios h
  ON h.id = ah2.horario_id
  AND h.deleted_at IS NULL
INNER JOIN asignaciones_docentes ad3
  ON ad3.docente_id = ad2.docente_id
  AND ad3.id <> ad2.id
  AND ad3.deleted_at IS NULL
  AND ad3.activo = TRUE
  AND ad3.vigente = TRUE
INNER JOIN gestiones_planes gp3
  ON gp3.id = ad3.gestion_plan_id
  AND gp3.gestion_id = gp2.gestion_id
  AND gp3.deleted_at IS NULL
INNER JOIN asignacion_horarios ah3
  ON ah3.asignacion_docente_id = ad3.id
  AND ah3.deleted_at IS NULL
  AND ah3.activo = TRUE
  AND ah3.horario_id = ah2.horario_id
INNER JOIN oferta_cursos oc2 ON oc2.id = ad2.oferta_curso_id AND oc2.deleted_at IS NULL
INNER JOIN oferta_cursos oc3 ON oc3.id = ad3.oferta_curso_id AND oc3.deleted_at IS NULL
LEFT JOIN asignaturas_plan ap2 ON ap2.id = oc2.asignatura_plan_id AND ap2.deleted_at IS NULL
LEFT JOIN asignaturas_plan ap3 ON ap3.id = oc3.asignatura_plan_id AND ap3.deleted_at IS NULL
LEFT JOIN materias m2 ON m2.id = ap2.materia_id AND m2.deleted_at IS NULL
LEFT JOIN materias m3 ON m3.id = ap3.materia_id AND m3.deleted_at IS NULL
LEFT JOIN paralelos_gestion pg2 ON pg2.id = oc2.paralelo_gestion_id AND pg2.deleted_at IS NULL
LEFT JOIN paralelos_gestion pg3 ON pg3.id = oc3.paralelo_gestion_id AND pg3.deleted_at IS NULL
LEFT JOIN paralelos p2 ON p2.id = pg2.paralelo_id AND p2.deleted_at IS NULL
LEFT JOIN paralelos p3 ON p3.id = pg3.paralelo_id AND p3.deleted_at IS NULL
WHERE ad2.deleted_at IS NULL
  AND ad2.activo = TRUE
  AND ad2.vigente = TRUE;
