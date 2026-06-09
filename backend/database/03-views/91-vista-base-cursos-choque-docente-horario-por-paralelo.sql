-- ============================================
-- VISTA BASE: vista_base_cursos_choque_docente_horario_por_paralelo
-- Ofertas con choque de horario del docente asignado, por paralelo.
--
-- DERIVADA del primitivo 36 (vista_base_docente_conflicto_horario_par):
-- proyecta (paralelo, oferta) del lado _a de cada par en choque. El par es
-- simétrico, por lo que el lado _a cubre todas las ofertas participantes.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cursos_choque_docente_horario_por_paralelo;

CREATE VIEW vista_base_cursos_choque_docente_horario_por_paralelo AS
SELECT DISTINCT
  paralelo_id_a    AS paralelo_id,
  oferta_curso_id_a AS curso_id
FROM vista_base_docente_conflicto_horario_par
WHERE paralelo_id_a IS NOT NULL;
