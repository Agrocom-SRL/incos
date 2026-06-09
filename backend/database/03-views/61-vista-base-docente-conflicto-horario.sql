-- ============================================
-- VISTA BASE: vista_base_docente_conflicto_horario
-- Conteo de bloques horario en choque por docente.
--
-- DERIVADA del primitivo 36 (vista_base_docente_conflicto_horario_par):
-- cuenta los horario_id distintos en los que el docente tiene 2 asignaciones
-- ocupando la misma franja. Alinea su semántica con la del flag por asignación
-- (65) y el detalle de dashboard (93): "2 asignaciones distintas en el mismo
-- horario_id" (antes contaba "ofertas distintas en el mismo horario", criterio
-- que divergía de 65).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_conflicto_horario;

CREATE VIEW vista_base_docente_conflicto_horario AS
SELECT
  docente_id,
  COUNT(DISTINCT horario_id) AS horario_conflictos
FROM vista_base_docente_conflicto_horario_par
GROUP BY docente_id;
