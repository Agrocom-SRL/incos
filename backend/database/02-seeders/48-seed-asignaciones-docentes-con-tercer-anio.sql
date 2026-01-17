-- ============================================
-- SEEDER: asignaciones_docentes - CONTADURÍA GENERAL TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de docentes a cursos - Gestión 2026 (VIGENTE)
-- ============================================
-- Gestión 2026: gestion_id = 2
-- Plan Contaduría General: gestion_plan_id = 6
-- Periodo: Tercer Año (periodo_id = 9)
-- Paralelos: TERCERO A (paralelo_id=17), TERCERO B (paralelo_id=18)
-- Cursos: IDs 125-140 (3A: 125-132, 3B: 133-140)
-- ============================================
-- NOTA: Asignaciones basadas en el horario académico oficial 2026 (imágenes proporcionadas)
-- Docentes CON-GEN: IDs 16-30
--  17: Sebastián Vargas
--  19: Patricia Rodriguez Cuellar
--  20: Gonzalo Icuña
--  23: Franz Lujan
--  25: Dory Robles
--  27: Aurelio Hurtado
--  28: Elias Sarzuri
--  29: Teodora Paraguayo

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- INSERTAR ASIGNACIONES - TERCERO A (TARDE)
-- Cursos: IDs 125-132
-- ============================================

-- CONTABILIDAD AGROPECUARIA (curso_id = 125, asignatura_plan_id = 62) - 4 horas/semana
-- Docente: Lic. Gonzalo Icuña (docente_id = 20)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(125, 6, 125, 20, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE COSTOS II (curso_id = 126, asignatura_plan_id = 63) - 4 horas/semana
-- Docente: Lic. Dory Robles (docente_id = 25)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(126, 6, 126, 25, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD GUBERNAMENTAL (curso_id = 127, asignatura_plan_id = 64) - 4 horas/semana
-- Docente: Lic. Sebastián Vargas (docente_id = 17)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(127, 6, 127, 17, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL) (curso_id = 128, asignatura_plan_id = 65) - 4 horas/semana
-- Docente: Lic. Dory Robles (docente_id = 25)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(128, 6, 128, 25, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE) (curso_id = 129, asignatura_plan_id = 66) - 2 horas/semana
-- Docente: Lic. Franz Lujan (docente_id = 23)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(129, 6, 129, 23, 2, TRUE, '2026-01-19', TRUE);

-- GABINETE CONTABLE INFORMÁTICO (curso_id = 130, asignatura_plan_id = 67) - 4 horas/semana
-- Docente: Lic. Franz Lujan (docente_id = 23)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(130, 6, 130, 23, 4, TRUE, '2026-01-19', TRUE);

-- ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS (curso_id = 131, asignatura_plan_id = 68) - 4 horas/semana
-- Docente: TEC. Patricia Rodriguez Cuellar (docente_id = 19)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(131, 6, 131, 19, 4, TRUE, '2026-01-19', TRUE);

-- TALLER DE MODALIDAD DE GRADUACIÓN (curso_id = 132, asignatura_plan_id = 69) - 4 horas/semana
-- Docente: Lic. Patricia Rodriguez (docente_id = 19)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(132, 6, 132, 19, 4, TRUE, '2026-01-19', TRUE);

-- ============================================
-- INSERTAR ASIGNACIONES - TERCERO B (NOCHE)
-- Cursos: IDs 133-140
-- ============================================

-- CONTABILIDAD AGROPECUARIA (curso_id = 133, asignatura_plan_id = 62) - 4 horas/semana
-- Docente: Lic. Elias Sarzuri (docente_id = 28)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(133, 6, 133, 28, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE COSTOS II (curso_id = 134, asignatura_plan_id = 63) - 4 horas/semana
-- Docente: Lic. Sebastián Vargas (docente_id = 17)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(134, 6, 134, 17, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD GUBERNAMENTAL (curso_id = 135, asignatura_plan_id = 64) - 4 horas/semana
-- Docente: Lic. Sebastián Vargas (docente_id = 17)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(135, 6, 135, 17, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL) (curso_id = 136, asignatura_plan_id = 65) - 4 horas/semana
-- Docente: Lic. Teodora Paraguayo (docente_id = 29)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(136, 6, 136, 29, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE) (curso_id = 137, asignatura_plan_id = 66) - 2 horas/semana
-- Docente: Lic. Elias Sarzuri (docente_id = 28)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(137, 6, 137, 28, 2, TRUE, '2026-01-19', TRUE);

-- GABINETE CONTABLE INFORMÁTICO (curso_id = 138, asignatura_plan_id = 67) - 4 horas/semana
-- Docente: Lic. Elias Sarzuri (docente_id = 28)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(138, 6, 138, 28, 4, TRUE, '2026-01-19', TRUE);

-- ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS (curso_id = 139, asignatura_plan_id = 68) - 4 horas/semana
-- Docente: Lic. Aurelio Hurtado (docente_id = 27)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(139, 6, 139, 27, 4, TRUE, '2026-01-19', TRUE);

-- TALLER DE MODALIDAD DE GRADUACIÓN (curso_id = 140, asignatura_plan_id = 69) - 4 horas/semana
-- Docente: Lic. Patricia Rodriguez (docente_id = 19)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(140, 6, 140, 19, 4, TRUE, '2026-01-19', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE ASIGNACIONES
-- ============================================
-- PARALELO A (TERCERO A - TARDE): 8 asignaciones (IDs 125-132)
--   - Gonzalo Icuña (20): CONTABILIDAD AGROPECUARIA (1 curso, 4 horas)
--   - Dory Robles (25): CONTABILIDAD DE COSTOS II, CONTABILIDAD EXTRACTIVA (2 cursos, 8 horas total)
--   - Sebastián Vargas (17): CONTABILIDAD GUBERNAMENTAL (1 curso, 4 horas)
--   - Franz Lujan (23): CONTABILIDAD DE SERVICIOS, GABINETE CONTABLE INFORMÁTICO (2 cursos, 6 horas total)
--   - Patricia Rodriguez Cuellar (19): ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS, TALLER DE MODALIDAD DE GRADUACIÓN (2 cursos, 8 horas total)
--
-- PARALELO B (TERCERO B - NOCHE): 8 asignaciones (IDs 133-140)
--   - Elias Sarzuri (28): CONTABILIDAD AGROPECUARIA, CONTABILIDAD DE SERVICIOS, GABINETE CONTABLE INFORMÁTICO (3 cursos, 10 horas total)
--   - Sebastián Vargas (17): CONTABILIDAD DE COSTOS II, CONTABILIDAD GUBERNAMENTAL (2 cursos, 8 horas total)
--   - Teodora Paraguayo (29): CONTABILIDAD EXTRACTIVA (1 curso, 4 horas)
--   - Aurelio Hurtado (27): ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS (1 curso, 4 horas)
--   - Patricia Rodriguez (19): TALLER DE MODALIDAD DE GRADUACIÓN (1 curso, 4 horas)
--
-- TOTAL: 16 asignaciones (IDs 125-140)
-- Continuación desde el último ID del seeder de segundo año (124)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
