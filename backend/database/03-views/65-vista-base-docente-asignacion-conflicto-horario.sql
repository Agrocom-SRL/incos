-- ============================================
-- VISTA BASE: vista_base_docente_asignacion_conflicto_horario
-- Conflicto por bloque horario repetido (nivel asignación).
--
-- DERIVADA del primitivo 36 (vista_base_docente_conflicto_horario_par):
-- expone las asignaciones que participan en un par de choque. Como el par es
-- simétrico (a↔b), el lado _a cubre todas las asignaciones participantes.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_asignacion_conflicto_horario;

CREATE VIEW vista_base_docente_asignacion_conflicto_horario AS
SELECT DISTINCT
  asignacion_docente_id_a AS asignacion_docente_id,
  docente_id
FROM vista_base_docente_conflicto_horario_par;
