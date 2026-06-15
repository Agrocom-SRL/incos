-- ============================================
-- VISTA BASE: vista_base_docente_bloque_conflicto_horario
-- Bloques (asignacion_horarios.id) del docente que participan en un par de choque.
-- Reemplaza el marcado a nivel asignación (65) para flags por bloque en vista 52.
--
-- Depende de: 36-vista-base-docente-conflicto-horario.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_bloque_conflicto_horario;

CREATE VIEW vista_base_docente_bloque_conflicto_horario AS
SELECT DISTINCT
  docente_id,
  gestion_id,
  bloque_a_id AS asignacion_horario_id,
  horario_id,
  paralelo_gestion_id_a AS paralelo_gestion_id
FROM vista_base_docente_conflicto_horario_par
UNION
SELECT DISTINCT
  docente_id,
  gestion_id,
  bloque_b_id,
  horario_id,
  paralelo_gestion_id_b
FROM vista_base_docente_conflicto_horario_par;
