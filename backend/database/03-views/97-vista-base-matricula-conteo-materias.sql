-- ============================================
-- VISTA BASE: vista_base_matricula_conteo_materias
-- Conteo de matriculas_materia activas por inscripción.
--
-- Dependencias: matriculas_materia
-- Consumida por: vista_base_matricula_resumen_inscripcion
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_matricula_conteo_materias;

CREATE VIEW vista_base_matricula_conteo_materias AS
SELECT
  inscripcion_id,
  COUNT(*) AS cantidad_materias
FROM matriculas_materia
WHERE activo = TRUE
  AND deleted_at IS NULL
  AND inscripcion_id IS NOT NULL
GROUP BY inscripcion_id;
