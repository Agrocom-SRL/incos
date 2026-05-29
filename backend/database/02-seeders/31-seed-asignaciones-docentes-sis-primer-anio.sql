-- ============================================
-- SEEDER: asignaciones_docentes - SISTEMAS INFORMÁTICOS PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de docentes a oferta_cursos (V2) - Gestión 2026 (VIGENTE)
-- ============================================
-- Gestión 2026: gestion_id = 1 (vigente)
-- Plan Sistemas Informáticos: gestion_plan_id = 1
-- Periodo: Primer Año (periodo_id = 1)
-- Paralelos: PRIMERO A (paralelo_id=1), PRIMERO B (paralelo_id=2)
-- Oferta cursos: IDs 1-14 (1A: 1-7, 1B: 8-14)
-- ============================================
-- NOTA: Asignaciones basadas en el horario académico oficial 2026
-- Docentes SIS-INF: IDs 1-7
--  1: Ybeth Camacho
--  2: Roxana Justiniano
--  3: Magali Ticlla
--  4: Waly Vargas
--  5: Giovanna Fernandez
--  6: Lily Arenas
--  7: Yesmani Fernandez

-- Sprint 4 — Asignación docente (antes de asignacion_horarios)
-- Pre-requisitos: 28–30 seed-oferta-cursos-*, 26-seed-docentes
-- Siguiente: 40–48 seed-asignacion-horarios-* (Sprint 5, bloques por docente)

-- Sprint 4 — Asignación docente (ejecutar ANTES de 40–48 asignacion_horarios)
-- Pre-requisitos: 28–30 seed-oferta-cursos-*, 26-seed-docentes

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- INSERTAR ASIGNACIONES - PRIMERO A (NOCHE)
-- Oferta cursos: IDs 1-7
-- ============================================

-- MATEMÁTICA PARA LA INFORMÁTICA (oferta_curso_id = 1, asignatura_plan_id = 1)
-- Docente: Ing. Magali Ticlla (docente_id = 3)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(1, 1, 1, 3, 4, TRUE, '2026-01-19', TRUE);

-- PROGRAMACIÓN I (oferta_curso_id = 2, asignatura_plan_id = 2)
-- Docente: Ing. Roxana Justiniano (docente_id = 2)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(2, 1, 2, 2, 8, TRUE, '2026-01-19', TRUE);

-- INGLÉS TÉCNICO (oferta_curso_id = 3, asignatura_plan_id = 3)
-- Docente: Ing. Waly Vargas (docente_id = 4)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(3, 1, 3, 4, 2, TRUE, '2026-01-19', TRUE);

-- HARDWARE DE COMPUTADORAS (oferta_curso_id = 4, asignatura_plan_id = 4)
-- Docente: Ing. Ybeth Camacho (docente_id = 1)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(4, 1, 4, 1, 4, TRUE, '2026-01-19', TRUE);

-- TALLER DE SISTEMAS OPERATIVOS (oferta_curso_id = 5, asignatura_plan_id = 5)
-- Docente: Ing. Ybeth Camacho (docente_id = 1)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(5, 1, 5, 1, 4, TRUE, '2026-01-19', TRUE);

-- OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA (oferta_curso_id = 6, asignatura_plan_id = 6)
-- Docente: Ing. Waly Vargas (docente_id = 4)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(6, 1, 6, 4, 4, TRUE, '2026-01-19', TRUE);

-- DISEÑO Y PROGRAMACIÓN WEB I (oferta_curso_id = 7, asignatura_plan_id = 7)
-- Docente: Ing. Giovanna Fernandez (docente_id = 5)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(7, 1, 7, 5, 4, TRUE, '2026-01-19', TRUE);

-- ============================================
-- INSERTAR ASIGNACIONES - PRIMERO B (NOCHE)
-- Oferta cursos: IDs 8-14
-- ============================================

-- MATEMÁTICA PARA LA INFORMÁTICA (oferta_curso_id = 8, asignatura_plan_id = 1)
-- Docente: Ing. Magali Ticlla (docente_id = 3)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(8, 1, 8, 3, 4, TRUE, '2026-01-19', TRUE);

-- PROGRAMACIÓN I (oferta_curso_id = 9, asignatura_plan_id = 2)
-- Docente: Ing. Lily Arenas (docente_id = 6)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(9, 1, 9, 6, 8, TRUE, '2026-01-19', TRUE);

-- INGLÉS TÉCNICO (oferta_curso_id = 10, asignatura_plan_id = 3)
-- Docente: Ing. Waly Vargas (docente_id = 4)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(10, 1, 10, 4, 2, TRUE, '2026-01-19', TRUE);

-- HARDWARE DE COMPUTADORAS (oferta_curso_id = 11, asignatura_plan_id = 4)
-- Docente: Ing. Lily Arenas (docente_id = 6)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(11, 1, 11, 6, 4, TRUE, '2026-01-19', TRUE);

-- TALLER DE SISTEMAS OPERATIVOS (oferta_curso_id = 12, asignatura_plan_id = 5)
-- Docente: Ing. Yesmani Fernandez (docente_id = 7)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(12, 1, 12, 7, 4, TRUE, '2026-01-19', TRUE);

-- OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA (oferta_curso_id = 13, asignatura_plan_id = 6)
-- Docente: Ing. Magali Ticlla (docente_id = 3)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(13, 1, 13, 3, 4, TRUE, '2026-01-19', TRUE);

-- DISEÑO Y PROGRAMACIÓN WEB I (oferta_curso_id = 14, asignatura_plan_id = 7)
-- Docente: Ing. Giovanna Fernandez (docente_id = 5)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(14, 1, 14, 5, 4, TRUE, '2026-01-19', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE ASIGNACIONES
-- ============================================
-- PARALELO A (PRIMERO A - NOCHE): 7 asignaciones (IDs 1-7)
--   - Ybeth Camacho: HDC-104, TSO-105 (2 cursos)
--   - Roxana Justiniano: PRG-102 (1 curso)
--   - Magali Ticlla: MPI-101 (1 curso)
--   - Waly Vargas: INT-103, OTM-106 (2 cursos)
--   - Giovanna Fernandez: DPW-107 (1 curso)
--
-- PARALELO B (PRIMERO B - NOCHE): 7 asignaciones (IDs 8-14)
--   - Lily Arenas: PRG-102, HDC-104 (2 cursos)
--   - Magali Ticlla: MPI-101, OTM-106 (2 cursos)
--   - Waly Vargas: INT-103 (1 curso)
--   - Giovanna Fernandez: DPW-107 (1 curso)
--   - Yesmani Fernandez: TSO-105 (1 curso)
--
-- TOTAL: 14 asignaciones de docentes para Primer Año - Sistemas Informáticos
-- Gestión: 2026 (VIGENTE)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
