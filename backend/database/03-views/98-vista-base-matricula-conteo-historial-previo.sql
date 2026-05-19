-- ============================================
-- VISTA BASE: vista_base_matricula_conteo_historial_previo
-- Conteo de historial_previo activo por inscripción.
--
-- Dependencias: historial_previo
-- Consumida por: vista_base_matricula_resumen_inscripcion
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_matricula_conteo_historial_previo;

CREATE VIEW vista_base_matricula_conteo_historial_previo AS
SELECT
  inscripcion_id,
  COUNT(*) AS cantidad_historial_previo
FROM historial_previo
WHERE activo = TRUE
  AND deleted_at IS NULL
  AND inscripcion_id IS NOT NULL
GROUP BY inscripcion_id;
