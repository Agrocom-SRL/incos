-- ============================================
-- SEEDER: asignaciones_docentes - SISTEMAS INFORMÁTICOS SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de docentes a oferta_cursos - Gestión 2026 (VIGENTE)
-- ============================================
-- Gestión 2026: gestion_id = 1 (vigente)
-- Plan Sistemas Informáticos: gestion_plan_id = 1
-- Periodo: Segundo Año (periodo_id = 2)
-- Paralelo: SEGUNDO A (paralelo_id=3)
-- Oferta cursos: IDs 15-22 (2A: 15-22)
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

-- Sprint 4 — Asignación docente (ejecutar ANTES de 40–48 asignacion_horarios)
-- Pre-requisitos: 28–30 seed-oferta-cursos-*, 26-seed-docentes

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- INSERTAR ASIGNACIONES - SEGUNDO A (NOCHE)
-- Oferta cursos: IDs 15-22
-- ============================================

-- ESTADÍSTICA (oferta_curso_id = 15, asignatura_plan_id = 8)
-- Docente: Ing. Ybeth Camacho (docente_id = 1)
-- Nota: En la imagen aparece como "Ibeth Camacho", se asume que es Ybeth Camacho
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(15, 1, 15, 1, 2, TRUE, '2026-01-19', TRUE);

-- PROGRAMACIÓN II (oferta_curso_id = 16, asignatura_plan_id = 9)
-- Docente: Ing. Giovanna Fernandez (docente_id = 5)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(16, 1, 16, 5, 6, TRUE, '2026-01-19', TRUE);

-- ESTRUCTURA DE DATOS (oferta_curso_id = 17, asignatura_plan_id = 10)
-- Docente: Ing. Lily Arenas (docente_id = 6)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(17, 1, 17, 6, 2, TRUE, '2026-01-19', TRUE);

-- REDES DE COMPUTADORAS I (oferta_curso_id = 18, asignatura_plan_id = 11)
-- Docente: Ing. Roxana Justiniano (docente_id = 2)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(18, 1, 18, 2, 4, TRUE, '2026-01-19', TRUE);

-- PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES I (oferta_curso_id = 19, asignatura_plan_id = 12)
-- Docente: Ing. Yesmani Fernandez (docente_id = 7)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(19, 1, 19, 7, 4, TRUE, '2026-01-19', TRUE);

-- ANÁLISIS Y DISEÑO DE SISTEMAS I (oferta_curso_id = 20, asignatura_plan_id = 13)
-- Docente: Ing. Magali Ticlla (docente_id = 3)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(20, 1, 20, 3, 4, TRUE, '2026-01-19', TRUE);

-- DISEÑO Y PROGRAMACIÓN WEB II (oferta_curso_id = 21, asignatura_plan_id = 14)
-- Docente: Ing. Giovanna Fernandez (docente_id = 5)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(21, 1, 21, 5, 4, TRUE, '2026-01-19', TRUE);

-- BASE DE DATOS I (oferta_curso_id = 22, asignatura_plan_id = 15)
-- Docente: Ing. Ybeth Camacho (docente_id = 1)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(22, 1, 22, 4, 4, TRUE, '2026-01-19', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE ASIGNACIONES
-- ============================================
-- PARALELO A (SEGUNDO A - NOCHE): 8 asignaciones (IDs 15-22)
--   - Ybeth Camacho: EST-201, BDD-208 (2 cursos)
--   - Roxana Justiniano: RDC-204 (1 curso)
--   - Magali Ticlla: ADS-206 (1 curso)
--   - Giovanna Fernandez: PRG-202, DPW-207 (2 cursos)
--   - Lily Arenas: EDD-203 (1 curso)
--   - Yesmani Fernandez: PDM-205 (1 curso)
--
-- TOTAL: 8 asignaciones de docentes para Segundo Año - Sistemas Informáticos
-- Gestión: 2026 (VIGENTE)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
