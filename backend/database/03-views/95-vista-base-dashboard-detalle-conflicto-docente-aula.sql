-- ============================================
-- VISTA BASE: vista_base_dashboard_detalle_conflicto_docente_aula
-- Detalle de cruce de aula entre paralelos (panel lateral docentes).
--
-- Aula efectiva = paralelos_gestion.aula_id. Solo franjas con otro
-- paralelo_gestion en la misma aula+horario.
--
-- DERIVADA del primitivo 62 (vista_base_docente_conflicto_aula_slot), que ya
-- expone el bloque exacto en cruce (asignación, horario, aula, paralelo_gestion,
-- oferta). Antes reescribía el doble subquery de slots inline.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_detalle_conflicto_docente_aula;

CREATE VIEW vista_base_dashboard_detalle_conflicto_docente_aula AS
SELECT DISTINCT
  slot.docente_id AS docente_id,
  TRIM(CONCAT(
    COALESCE(d.apellido_paterno, ''), ' ',
    COALESCE(d.apellido_materno, ''), ' ',
    COALESCE(d.nombres, '')
  )) AS docente_nombre,
  slot.paralelo_gestion_id AS paralelo_gestion_id,
  slot.oferta_curso_id AS oferta_curso_id,
  'aula' AS tipo_conflicto,
  CONCAT(
    COALESCE(NULLIF(TRIM(m.sigla), ''), m.nombre, CONCAT('OC-', oc.id), '—'),
    ' · ',
    UPPER(COALESCE(h.dia, '')),
    ' ',
    LEFT(COALESCE(TIME_FORMAT(h.hora_inicio, '%H:%i'), ''), 5),
    '-',
    LEFT(COALESCE(TIME_FORMAT(h.hora_fin, '%H:%i'), ''), 5),
    ' · Aula ',
    COALESCE(NULLIF(TRIM(au.codigo), ''), au.nombre, 'sin código')
  ) AS detalle_linea
FROM vista_base_docente_conflicto_aula_slot slot
INNER JOIN docentes d
  ON d.id = slot.docente_id
  AND d.deleted_at IS NULL AND d.activo = TRUE
INNER JOIN oferta_cursos oc
  ON oc.id = slot.oferta_curso_id
  AND oc.deleted_at IS NULL AND oc.activo = TRUE
INNER JOIN horarios h
  ON h.id = slot.horario_id
  AND h.deleted_at IS NULL AND h.activo = TRUE
INNER JOIN aulas au
  ON au.id = slot.aula_id
  AND au.deleted_at IS NULL AND au.activo = TRUE
LEFT JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL AND ap.activo = TRUE
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL AND m.activo = TRUE;
