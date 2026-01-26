-- ============================================
-- VISTA BASE: vista_base_asignaturas_materias
-- Pieza modular: asignaturas_plan + materias (2 tablas)
--
-- Propósito: Vista que une asignaturas_plan + materias.
-- Expone materia_id, periodo_id, y datos completos de la materia (sigla, nombre, objetivos, clasificación, tipo).
-- Reutilizable para construir vistas más complejas.
--
-- Relaciones:
-- - asignaturas_plan.materia_id → materias.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_asignaturas_materias;

CREATE VIEW vista_base_asignaturas_materias AS
SELECT
  ap.materia_id,
  ap.periodo_id,
  ap.horas_semanales,
  ap.creditos,
  ap.modalidad AS materia_modalidad,
  ap.orden_visualizacion AS materia_orden,
  m.sigla AS materia_sigla,
  m.nombre AS materia_nombre,
  m.objetivos AS materia_objetivos,
  m.clasificacion AS materia_clasificacion,
  m.tipo AS materia_tipo
FROM asignaturas_plan ap
INNER JOIN materias m ON m.id = ap.materia_id
  AND m.activo = TRUE
  AND m.deleted_at IS NULL
WHERE ap.activo = TRUE
  AND ap.deleted_at IS NULL;
