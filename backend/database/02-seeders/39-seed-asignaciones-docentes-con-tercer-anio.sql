-- ============================================
-- SEEDER: asignaciones_docentes - CONTADURÍA GENERAL TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de docentes a oferta_cursos (V2) - Gestión 2026 (VIGENTE)
-- ============================================
-- Gestión 2026: gestion_id = 1 (vigente)
-- Plan Contaduría General: gestion_plan_id = 3
-- Periodo: Tercer Año (periodo_id = 9)
-- Paralelos: TERCERO A (paralelo_id=17), TERCERO B (paralelo_id=18)
-- Oferta cursos: IDs 125-140 (3A: 125-132, 3B: 133-140)
-- ============================================
-- NOTA: Asignaciones basadas en el horario académico oficial 2026 (imágenes proporcionadas)
-- Docentes CON-GEN: IDs 16-31
--  17: Sebastián Vargas
--  19: Patricia Rodriguez Cuellar
--  20: Gonzalo Icuña
--  23: Franz Lujan
--  25: Dory Robles
--  27: Aurelio Hurtado
--  28: Elias Sarzuri
--  29: Teodora Paraguayo
--  31: Yessica (Excel 2026; apellido pendiente)

-- Sprint 4 — Asignación docente (ejecutar ANTES de 40–48 asignacion_horarios)
-- Pre-requisitos: 28–30 seed-oferta-cursos-*, 26-seed-docentes

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- INSERTAR ASIGNACIONES - TERCERO A (TARDE)
-- Oferta cursos: IDs 125-132
-- ============================================

-- CONTABILIDAD AGROPECUARIA (oferta_curso_id = 125, asignatura_plan_id = 62) - 4 horas/semana
-- Docente: Lic. Gonzalo Icuña (docente_id = 20)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(125, 3, 125, 20, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE COSTOS II (oferta_curso_id = 126, asignatura_plan_id = 63) - 4 horas/semana
-- Docente: Lic. Dory Robles (docente_id = 25)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(126, 3, 126, 25, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD GUBERNAMENTAL (oferta_curso_id = 127, asignatura_plan_id = 64) - 4 horas/semana
-- Docente: Lic. Sebastián Vargas (docente_id = 17)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(127, 3, 127, 19, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL) (oferta_curso_id = 128, asignatura_plan_id = 65) - 4 horas/semana
-- Docente: Lic. Dory Robles (docente_id = 25)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(128, 3, 128, 29, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE) (oferta_curso_id = 129, asignatura_plan_id = 66) - 2 horas/semana
-- Docente: Lic. Franz Lujan (docente_id = 23)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(129, 3, 129, 23, 2, TRUE, '2026-01-19', TRUE);

-- GABINETE CONTABLE INFORMÁTICO (oferta_curso_id = 130, asignatura_plan_id = 67) - 4 horas/semana
-- Docente: Lic. Franz Lujan (docente_id = 23)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(130, 3, 130, 23, 4, TRUE, '2026-01-19', TRUE);

-- ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS (oferta_curso_id = 131, asignatura_plan_id = 68) - 4 horas/semana
-- Docente: TEC. Patricia Rodriguez Cuellar (docente_id = 19)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(131, 3, 131, 29, 4, TRUE, '2026-01-19', TRUE);

-- TALLER DE MODALIDAD DE GRADUACIÓN (oferta_curso_id = 132, asignatura_plan_id = 69) - 4 horas/semana
-- Docente: Lic. Patricia Rodriguez (docente_id = 19)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(132, 3, 132, 19, 4, TRUE, '2026-01-19', TRUE);

-- ============================================
-- INSERTAR ASIGNACIONES - TERCERO B (NOCHE)
-- Oferta cursos: IDs 133-140
-- ============================================

-- CONTABILIDAD AGROPECUARIA (oferta_curso_id = 133, asignatura_plan_id = 62) - 4 horas/semana
-- Docente: Lic. Elias Sarzuri (docente_id = 28)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(133, 3, 133, 28, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE COSTOS II (oferta_curso_id = 134, asignatura_plan_id = 63) - 4 horas/semana
-- Docente: Lic. Sebastián Vargas (docente_id = 17)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(134, 3, 134, 17, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD GUBERNAMENTAL (oferta_curso_id = 135, asignatura_plan_id = 64) - 4 horas/semana
-- Docente: Lic. Sebastián Vargas (docente_id = 17)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(135, 3, 135, 17, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL) (oferta_curso_id = 136, asignatura_plan_id = 65) - 4 horas/semana
-- Docente: Lic. Sebastián Vargas (docente_id = 17) — Excel 2026 3°B
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(136, 3, 136, 17, 4, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE) (oferta_curso_id = 137, asignatura_plan_id = 66) - 2 horas/semana
-- Docente: Lic. Elias Sarzuri (docente_id = 28)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(137, 3, 137, 28, 2, TRUE, '2026-01-19', TRUE);

-- GABINETE CONTABLE INFORMÁTICO (oferta_curso_id = 138, asignatura_plan_id = 67) - 4 horas/semana
-- Docente: Lic. Elias Sarzuri (docente_id = 28)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(138, 3, 138, 28, 4, TRUE, '2026-01-19', TRUE);

-- ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS (oferta_curso_id = 139, asignatura_plan_id = 68) - 4 horas/semana
-- Docente: Lic. Yessica (docente_id = 31) — Excel 2026 CON 3°B
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(139, 3, 139, 31, 4, TRUE, '2026-01-19', TRUE);

-- TALLER DE MODALIDAD DE GRADUACIÓN (oferta_curso_id = 140, asignatura_plan_id = 69) - 4 horas/semana
-- Docente: Lic. Patricia Rodriguez (docente_id = 19)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(140, 3, 140, 19, 4, TRUE, '2026-01-19', TRUE);

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
--   - Sebastián Vargas (17): CONTABILIDAD DE COSTOS II, CONTABILIDAD GUBERNAMENTAL, CONTABILIDAD EXTRACTIVA (3 cursos)
--   - Teodora Paraguayo (29): (sin cursos en 3°B Excel 2026)
--   - Yessica (31): ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS (1 curso, 4 horas)
--   - Patricia Rodriguez (19): TALLER DE MODALIDAD DE GRADUACIÓN (1 curso, 4 horas)
--
-- TOTAL: 16 asignaciones (IDs 125-140)
-- Continuación desde el último ID del seeder de segundo año (124)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
