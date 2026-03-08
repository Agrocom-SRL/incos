-- ============================================
-- SEEDER: asignaciones_docentes - CONTADURÍA GENERAL SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de docentes a cursos - Gestión 2026 (VIGENTE)
-- ============================================
-- Gestión 2026: gestion_id = 1 (vigente)
-- Plan Contaduría General: gestion_plan_id = 3
-- Periodo: Segundo Año (periodo_id = 8)
-- Paralelos: SEGUNDO A (paralelo_id=15), SEGUNDO B (paralelo_id=16)
-- Cursos: IDs 111-124 (2A: 111-117, 2B: 118-124)
-- ============================================
-- NOTA: Asignaciones basadas en el horario académico oficial 2026 (imágenes proporcionadas)
-- Docentes CON-GEN: IDs 16-30
--  16: Hilda Barriga
--  20: Gonzalo Icuña
--  21: Miguel Padilla
--  25: Dory Robles
--  26: Willma Fernandez
--  27: Aurelio Hurtado
--  28: Elias Sarzuri
--  29: Teodora Paraguayo
--  30: José Antonio Vara

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- INSERTAR ASIGNACIONES - SEGUNDO A (TARDE)
-- Cursos: IDs 111-117
-- ============================================

-- SISTEMA TRIBUTARIO (curso_id = 111, asignatura_plan_id = 61) - 4 horas/semana
-- Docente: Lic. Dory Robles (docente_id = 25)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(111, 3, 111, 25, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE COSTOS I (curso_id = 112, asignatura_plan_id = 56) - 6 horas/semana
-- Docente: Lic. Dory Robles (docente_id = 25)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(112, 3, 112, 25, 6, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE SEGUROS (curso_id = 113, asignatura_plan_id = 58) - 2 horas/semana
-- Docente: Lic. Willma Fernandez (docente_id = 26)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(113, 3, 113, 26, 2, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE SOCIEDADES (curso_id = 114, asignatura_plan_id = 57) - 4 horas/semana
-- Docente: Lic. Teodora Paraguayo (docente_id = 29)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(114, 3, 114, 29, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD BANCARIA Y COOPERATIVA (curso_id = 115, asignatura_plan_id = 59) - 4 horas/semana
-- Docente: Lic. Hilda Barriga (docente_id = 16)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(115, 3, 115, 16, 4, TRUE, '2026-01-19', TRUE);

-- EMPRENDIMIENTO PRODUCTIVO (curso_id = 116, asignatura_plan_id = 60) - 4 horas/semana
-- Docente: Lic. Miguel Padilla (docente_id = 21)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(116, 3, 116, 21, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD II (curso_id = 117, asignatura_plan_id = 55) - 6 horas/semana
-- Docente: Lic. José Antonio Vara (docente_id = 30)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(117, 3, 117, 30, 6, TRUE, '2026-01-19', TRUE);

-- ============================================
-- INSERTAR ASIGNACIONES - SEGUNDO B (NOCHE)
-- Cursos: IDs 118-124
-- ============================================

-- CONTABILIDAD II (curso_id = 118, asignatura_plan_id = 55) - 6 horas/semana
-- Docente: Lic. José Antonio Vara (docente_id = 30)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(118, 3, 118, 30, 6, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE COSTOS I (curso_id = 119, asignatura_plan_id = 56) - 6 horas/semana
-- Docente: Lic. Miguel Padilla (docente_id = 21)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(119, 3, 119, 21, 6, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE SOCIEDADES (curso_id = 120, asignatura_plan_id = 57) - 4 horas/semana
-- Docente: Lic. Gonzalo Icuña (docente_id = 20)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(120, 3, 120, 20, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE SEGUROS (curso_id = 121, asignatura_plan_id = 58) - 2 horas/semana
-- Docente: Lic. Aurelio Hurtado (docente_id = 27)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(121, 3, 121, 27, 2, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD BANCARIA Y COOPERATIVA (curso_id = 122, asignatura_plan_id = 59) - 4 horas/semana
-- Docente: Lic. Willma Fernandez (docente_id = 26)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(122, 3, 122, 26, 4, TRUE, '2026-01-19', TRUE);

-- EMPRENDIMIENTO PRODUCTIVO (curso_id = 123, asignatura_plan_id = 60) - 4 horas/semana
-- Docente: Lic. Miguel Padilla (docente_id = 21)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(123, 3, 123, 21, 4, TRUE, '2026-01-19', TRUE);

-- SISTEMA TRIBUTARIO (curso_id = 124, asignatura_plan_id = 61) - 4 horas/semana
-- Docente: Lic. Elias Sarzuri (docente_id = 28)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(124, 3, 124, 28, 4, TRUE, '2026-01-19', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE ASIGNACIONES
-- ============================================
-- PARALELO A (SEGUNDO A - TARDE): 7 asignaciones (IDs 111-117)
--   - Dory Robles (25): SISTEMA TRIBUTARIO, CONTABILIDAD DE COSTOS I (2 cursos, 10 horas total)
--   - Willma Fernandez (26): CONTABILIDAD DE SEGUROS (1 curso, 2 horas)
--   - Teodora Paraguayo (29): CONTABILIDAD DE SOCIEDADES (1 curso, 4 horas)
--   - Hilda Barriga (16): CONTABILIDAD BANCARIA Y COOPERATIVA (1 curso, 4 horas)
--   - Miguel Padilla (21): EMPRENDIMIENTO PRODUCTIVO (1 curso, 4 horas)
--   - José Antonio Vara (30): CONTABILIDAD II (1 curso, 6 horas)
--
-- PARALELO B (SEGUNDO B - NOCHE): 7 asignaciones (IDs 118-124)
--   - José Antonio Vara (30): CONTABILIDAD II (1 curso, 6 horas)
--   - Miguel Padilla (21): CONTABILIDAD DE COSTOS I, EMPRENDIMIENTO PRODUCTIVO (2 cursos, 10 horas total)
--   - Gonzalo Icuña (20): CONTABILIDAD DE SOCIEDADES (1 curso, 4 horas)
--   - Aurelio Hurtado (27): CONTABILIDAD DE SEGUROS (1 curso, 2 horas)
--   - Willma Fernandez (26): CONTABILIDAD BANCARIA Y COOPERATIVA (1 curso, 4 horas)
--   - Elias Sarzuri (28): SISTEMA TRIBUTARIO (1 curso, 4 horas)
--
-- TOTAL: 14 asignaciones (IDs 111-124)
-- Continuación desde el último ID del seeder de primer año (110)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
