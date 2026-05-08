-- ============================================
-- VISTA BASE: vista_base_aulas_activas
-- Catálogo de aulas/laboratorios vigentes
--
-- Propósito: pieza base reutilizable para grillas de ocupación y asignación.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_aulas_activas;

CREATE VIEW vista_base_aulas_activas AS
SELECT
  a.id AS aula_id,
  a.codigo AS aula_codigo,
  a.nombre AS aula_nombre,
  a.categoria AS aula_categoria,
  a.capacidad AS aula_capacidad,
  a.observaciones AS aula_observaciones
FROM aulas a
WHERE a.deleted_at IS NULL
  AND a.activo = TRUE;
