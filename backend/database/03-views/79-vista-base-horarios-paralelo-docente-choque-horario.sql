-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_docente_choque_horario
-- Paralelos que tienen al menos un curso cuyo docente (asignación vigente) comparte
-- la misma franja horaria_id con otro curso distinto del mismo docente.
--
-- Propósito:
-- - Alinear con la detección de “choque” en asignación docente (misma hora, dos materias).
-- - Reutilizable en vista_horarios_paralelo_estado.
--
-- Tablas: cursos, asignaciones_docentes, cursos_horarios
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_docente_choque_horario;

CREATE VIEW vista_base_horarios_paralelo_docente_choque_horario AS
SELECT DISTINCT
    c1.paralelo_id
FROM cursos c1
INNER JOIN asignaciones_docentes ad1
    ON ad1.curso_id = c1.id
    AND ad1.deleted_at IS NULL
    AND ad1.activo = TRUE
    AND ad1.vigente = TRUE
    AND ad1.docente_id IS NOT NULL
INNER JOIN cursos_horarios ch1
    ON ch1.curso_id = c1.id
    AND ch1.deleted_at IS NULL
    AND ch1.activo = TRUE
    AND ch1.horario_id IS NOT NULL
INNER JOIN asignaciones_docentes ad2
    ON ad2.docente_id = ad1.docente_id
    AND ad2.id <> ad1.id
    AND ad2.deleted_at IS NULL
    AND ad2.activo = TRUE
    AND ad2.vigente = TRUE
    AND ad2.docente_id IS NOT NULL
INNER JOIN cursos_horarios ch2
    ON ch2.curso_id = ad2.curso_id
    AND ch2.horario_id = ch1.horario_id
    AND ch2.deleted_at IS NULL
    AND ch2.activo = TRUE
WHERE c1.deleted_at IS NULL
  AND c1.activo = TRUE;
