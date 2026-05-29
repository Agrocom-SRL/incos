-- ============================================
-- SEEDER: asignaciones_docentes - ADMINISTRACIÓN DE EMPRESAS SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de docentes a oferta_cursos - Gestión 2026 (VIGENTE)
-- ============================================
-- Gestión 2026: gestion_id = 1 (vigente)
-- Plan Administración de Empresas: gestion_plan_id = 2
-- Periodo: Segundo Año (periodo_id = 5)
-- Paralelos: SEGUNDO A (paralelo_id=8), SEGUNDO B (paralelo_id=9)
-- Oferta cursos: IDs 52-67 (2A: 52-59, 2B: 60-67)
-- ============================================
-- NOTA: Asignaciones basadas en el horario académico oficial 2026 (imágenes proporcionadas)
-- Docentes ADM-EMP: IDs 8-15
-- Docentes CON-GEN (comparten con ADM-EMP): IDs 16-25
--  8: Vladimir Marca
--  9: Elio Honor Barriga
--  10: Rafael Montero
--  11: René Roca
--  14: Jose Luiz Uribe
--  15: Paola Mariaca
--  22: José Luis Montenegro

-- Sprint 4 — Asignación docente (ejecutar ANTES de 40–48 asignacion_horarios)
-- Pre-requisitos: 28–30 seed-oferta-cursos-*, 26-seed-docentes

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- INSERTAR ASIGNACIONES - SEGUNDO A (TARDE)
-- Oferta cursos: IDs 52-59
-- ============================================

-- ORGANIZACIÓN DE LA ADMINISTRACIÓN (oferta_curso_id = 52, asignatura_plan_id = 31) - 2 horas/semana
-- Docente: Lic. Rafael Montero (docente_id = 10)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(52, 2, 52, 10, 2, TRUE, '2026-01-19', TRUE);

-- INVESTIGACIÓN Y ESTRATEGIA DE MERCADO (oferta_curso_id = 53, asignatura_plan_id = 32) - 4 horas/semana
-- Docente: Lic. René Roca (docente_id = 11)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(53, 2, 53, 11, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN DE OPERACIONES (oferta_curso_id = 54, asignatura_plan_id = 33) - 4 horas/semana
-- Docente: Lic. René Roca (docente_id = 11)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(54, 2, 54, 11, 4, TRUE, '2026-01-19', TRUE);

-- GESTIÓN DEL TALENTO HUMANO (oferta_curso_id = 55, asignatura_plan_id = 34) - 4 horas/semana
-- Docente: Lic. Paola Mariaca (docente_id = 15)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(55, 2, 55, 15, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN FINANCIERA I (oferta_curso_id = 56, asignatura_plan_id = 35) - 4 horas/semana
-- Docente: Lic. Jose Luiz Uribe (docente_id = 14)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(56, 2, 56, 14, 4, TRUE, '2026-01-19', TRUE);

-- PREPARACIÓN Y EVALUACIÓN DE PROYECTOS (oferta_curso_id = 57, asignatura_plan_id = 36) - 4 horas/semana
-- Docente: Lic. Vladimir Marca (docente_id = 8)
-- NOTA: Según horario, tiene 4 horas (periodos 3-6 del viernes), aunque asignatura_plan indica 4 horas
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(57, 2, 57, 8, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS (oferta_curso_id = 58, asignatura_plan_id = 37) - 4 horas/semana
-- Docente: Lic. Rafael Montero (docente_id = 10)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(58, 2, 58, 15, 4, TRUE, '2026-01-19', TRUE);

-- ECONOMÍA DE LA EMPRESA (oferta_curso_id = 59, asignatura_plan_id = 38) - 4 horas/semana
-- Docente: Lic. Elio Honor Barriga (docente_id = 9)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(59, 2, 59, 15, 4, TRUE, '2026-01-19', TRUE);

-- ============================================
-- INSERTAR ASIGNACIONES - SEGUNDO B (NOCHE)
-- Oferta cursos: IDs 60-67
-- ============================================

-- ORGANIZACIÓN DE LA ADMINISTRACIÓN (oferta_curso_id = 60, asignatura_plan_id = 31) - 2 horas/semana
-- Docente: Lic. Elio Honor Barriga (docente_id = 9)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(60, 2, 60, 9, 2, TRUE, '2026-01-19', TRUE);

-- INVESTIGACIÓN Y ESTRATEGIA DE MERCADO (oferta_curso_id = 61, asignatura_plan_id = 32) - 4 horas/semana
-- Docente: Lic. José Luis Montenegro (docente_id = 22)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(61, 2, 61, 22, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN DE OPERACIONES (oferta_curso_id = 62, asignatura_plan_id = 33) - 4 horas/semana
-- Docente: Lic. Paola Mariaca (docente_id = 15)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(62, 2, 62, 14, 4, TRUE, '2026-01-19', TRUE);

-- GESTIÓN DEL TALENTO HUMANO (oferta_curso_id = 63, asignatura_plan_id = 34) - 4 horas/semana
-- Docente: Lic. Paola Mariaca (docente_id = 15)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(63, 2, 63, 10, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN FINANCIERA I (oferta_curso_id = 64, asignatura_plan_id = 35) - 4 horas/semana
-- Docente: Lic. Jose Luiz Uribe (docente_id = 14)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(64, 2, 64, 13, 4, TRUE, '2026-01-19', TRUE);

-- PREPARACIÓN Y EVALUACIÓN DE PROYECTOS (oferta_curso_id = 65, asignatura_plan_id = 36) - 4 horas/semana
-- Docente: Lic. PUMA (docente_id = 13)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(65, 2, 65, 8, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS (oferta_curso_id = 66, asignatura_plan_id = 37) - 4 horas/semana
-- Docente: Lic. Rafael Montero (docente_id = 10)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(66, 2, 66, 13, 4, TRUE, '2026-01-19', TRUE);

-- ECONOMÍA DE LA EMPRESA (oferta_curso_id = 67, asignatura_plan_id = 38) - 4 horas/semana
-- Docente: Lic. Elio Honor Barriga (docente_id = 9)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(67, 2, 67, 9, 4, TRUE, '2026-01-19', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE ASIGNACIONES
-- ============================================
-- PARALELO A (SEGUNDO A - TARDE): 8 asignaciones (IDs 52-59)
--   - Rafael Montero (10): ORGANIZACIÓN DE LA ADMINISTRACIÓN, ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS (2 cursos)
--   - René Roca (11): INVESTIGACIÓN Y ESTRATEGIA DE MERCADO, ADMINISTRACIÓN DE OPERACIONES (2 cursos)
--   - Paola Mariaca (15): GESTIÓN DEL TALENTO HUMANO (1 curso)
--   - Jose Luiz Uribe (14): ADMINISTRACIÓN FINANCIERA I (1 curso)
--   - Vladimir Marca (8): PREPARACIÓN Y EVALUACIÓN DE PROYECTOS (1 curso)
--   - Elio Honor Barriga (9): ECONOMÍA DE LA EMPRESA (1 curso)
--
-- PARALELO B (SEGUNDO B - NOCHE): 8 asignaciones (IDs 60-67)
--   - Elio Honor Barriga (9): ORGANIZACIÓN DE LA ADMINISTRACIÓN, ECONOMÍA DE LA EMPRESA (2 cursos)
--   - José Luis Montenegro (22): INVESTIGACIÓN Y ESTRATEGIA DE MERCADO (1 curso)
--   - Paola Mariaca (15): ADMINISTRACIÓN DE OPERACIONES, GESTIÓN DEL TALENTO HUMANO (2 cursos)
--   - Jose Luiz Uribe (14): ADMINISTRACIÓN FINANCIERA I (1 curso)
--   - PUMA (13): PREPARACIÓN Y EVALUACIÓN DE PROYECTOS (1 curso)
--   - Rafael Montero (10): ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS (1 curso)
--
-- TOTAL: 16 asignaciones (IDs 52-67)
-- Continuación desde el último ID del seeder de Administración primer año (51)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
