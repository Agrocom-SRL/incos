-- ============================================
-- VISTA BASE: vista_base_inscripciones_paralelos
-- Pieza modular: paralelos de inscripciones (usa vista_base_asignaciones_inscripciones + vista_base_cursos_paralelos + vista_base_paralelos_info)
--
-- Propósito: Vista que une inscripciones_materias (vía vista_base_asignaciones_inscripciones - 04) 
-- + cursos (vía vista_base_cursos_paralelos - 02) + paralelos (vía vista_base_paralelos_info - 01).
-- Expone información del paralelo y periodo en el que está inscrito el estudiante.
-- Se une por inscripcion_id al torso para construir la vista global.
--
-- Relaciones:
-- - vista_base_asignaciones_inscripciones.curso_id → vista_base_cursos_paralelos.curso_id
-- - vista_base_cursos_paralelos.paralelo_id → vista_base_paralelos_info.paralelo_id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_inscripciones_paralelos;

CREATE VIEW vista_base_inscripciones_paralelos AS
SELECT
  vai.inscripcion_id,
  vcp.paralelo_id,
  vpi.paralelo_nombre,
  vpi.paralelo_turno,
  vpi.paralelo_descripcion,
  vpi.carrera_id,
  vpi.carrera_nombre,
  vpi.carrera_codigo,
  vpi.periodo_id,
  vpi.periodo_numero,
  vpi.periodo_nombre
FROM vista_base_asignaciones_inscripciones vai
INNER JOIN vista_base_cursos_paralelos vcp ON vcp.curso_id = vai.curso_id
INNER JOIN vista_base_paralelos_info vpi ON vpi.paralelo_id = vcp.paralelo_id
GROUP BY
  vai.inscripcion_id,
  vcp.paralelo_id,
  vpi.paralelo_nombre,
  vpi.paralelo_turno,
  vpi.paralelo_descripcion,
  vpi.carrera_id,
  vpi.carrera_nombre,
  vpi.carrera_codigo,
  vpi.periodo_id,
  vpi.periodo_numero,
  vpi.periodo_nombre;
