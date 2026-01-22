-- ============================================
-- VISTA BASE: vista_base_asignaciones_inscripciones
-- Relación entre asignaciones docentes e inscripciones de materias
-- 
-- Propósito: Vista base que une asignaciones_docentes + inscripciones_materias (2 tablas)
-- Reutilizable para construir vistas más complejas
-- 
-- Relaciones según schemas:
-- - inscripciones_materias.asignacion_docente_id → asignaciones_docentes.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_asignaciones_inscripciones;

CREATE VIEW vista_base_asignaciones_inscripciones AS
SELECT 
  ad.id AS asignacion_docente_id,
  ad.curso_id,
  ad.docente_id,
  ad.vigente AS asignacion_vigente,
  im.id AS inscripcion_materia_id,
  im.inscripcion_id,
  im.estado AS materia_estado
FROM asignaciones_docentes ad
INNER JOIN inscripciones_materias im ON im.asignacion_docente_id = ad.id
  AND im.activo = TRUE 
  AND im.deleted_at IS NULL
  AND im.estado NOT IN ('ABANDONO', 'RETIRADO')
WHERE ad.activo = TRUE 
  AND ad.vigente = TRUE
  AND ad.deleted_at IS NULL;
