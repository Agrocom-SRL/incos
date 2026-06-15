-- ============================================
-- VISTA BASE: vista_base_docente_asignacion_conflicto_aula
-- Asignaciones del docente con cruce de aula+horario contra otro paralelo_gestion.
--
-- DERIVADA del primitivo 62 (vista_base_docente_conflicto_aula_slot).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_asignacion_conflicto_aula;

CREATE VIEW vista_base_docente_asignacion_conflicto_aula AS
SELECT DISTINCT
  asignacion_docente_id,
  docente_id
FROM vista_base_docente_conflicto_aula_slot;
