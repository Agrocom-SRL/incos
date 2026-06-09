-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_docente_choque_horario
-- Paralelos_gestion con choque de horario del mismo docente (gestión vigente).
-- Consumidor: 87-vista-horarios-paralelo-estado.sql (estado de la grilla).
--
-- DERIVADA del primitivo 36 (vista_base_docente_conflicto_horario_par):
-- toma los paralelos_gestion del lado _a de cada par en choque y reaplica los
-- filtros propios de la grilla (gestión vigente y paralelo no CERRADO).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_docente_choque_horario;

CREATE VIEW vista_base_horarios_paralelo_docente_choque_horario AS
SELECT DISTINCT
  par.paralelo_gestion_id_a AS paralelo_gestion_id
FROM vista_base_docente_conflicto_horario_par par
INNER JOIN paralelos_gestion pg
  ON pg.id = par.paralelo_gestion_id_a
  AND pg.deleted_at IS NULL
  AND pg.estado <> 'CERRADO'
INNER JOIN gestiones_planes gp
  ON gp.id = pg.gestion_plan_id
  AND gp.deleted_at IS NULL
INNER JOIN gestiones g
  ON g.id = gp.gestion_id
  AND g.deleted_at IS NULL
  AND g.vigente = TRUE;
