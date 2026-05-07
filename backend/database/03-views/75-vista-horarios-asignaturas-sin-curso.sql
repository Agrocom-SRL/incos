-- ============================================
-- VISTA FINAL: vista_horarios_asignaturas_sin_curso
-- Asignaturas del plan sin curso creado, con paralelos activos en el periodo.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_horarios_asignaturas_sin_curso;

CREATE VIEW vista_horarios_asignaturas_sin_curso AS
SELECT
    carrera_id,
    carrera_nombre,
    periodo_id,
    periodo_nombre,
    materia_nombre,
    materia_sigla,
    horas_semanales
FROM vista_base_horarios_asignaturas_cobertura
WHERE cursos_creados = 0
  AND paralelos_del_periodo > 0;
