-- ============================================
-- SEEDER: asignaciones_docentes - ADMINISTRACIÓN DE EMPRESAS PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de docentes a oferta_cursos - Gestión 2026 (VIGENTE)
-- ============================================
-- Gestión 2026: gestion_id = 1 (vigente)
-- Plan Administración de Empresas: gestion_plan_id = 2
-- Periodo: Primer Año (periodo_id = 4)
-- Paralelos: PRIMERO A (paralelo_id=5), PRIMERO B (paralelo_id=6), PRIMERO C (paralelo_id=7)
-- Oferta cursos: IDs 31-51 (1A: 31-37, 1B: 38-44, 1C: 45-51)
-- ============================================
-- NOTA: Asignaciones basadas en el horario académico oficial 2026 (imágenes proporcionadas)
-- Docentes ADM-EMP: IDs 8-14
-- Docentes CON-GEN (comparten con ADM-EMP): IDs 15-24
--  8: Vladimir Marca
--  9: Elio Honor
--  10: Rafael Montero
--  11: René Roca
--  12: Georgina Moron
--  13: PUMA
--  14: Jose Luiz Uribe
--  15: Paola Mariaca
--  16: Hilda Barriga
--  18: Sonia Carrizales
--  20: Gonzalo Icuña
--  22: José Luis Montenegro
--  23: Franz Lujan (FRANZ ROLANDO LUJAN CHAMBI)

-- Sprint 4 — Asignación docente (ejecutar ANTES de 40–48 asignacion_horarios)
-- Pre-requisitos: 28–30 seed-oferta-cursos-*, 26-seed-docentes

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- INSERTAR ASIGNACIONES - PRIMERO A (TARDE)
-- Oferta cursos: IDs 31-37
-- ============================================

-- FUNDAMENTOS DE LA ADMINISTRACIÓN (oferta_curso_id = 31, asignatura_plan_id = 24) - 6 horas/semana
-- Docente: Lic. Rafael Montero (docente_id = 10)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(31, 2, 31, 10, 6, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD GENERAL PARA ADMINISTRADORES (oferta_curso_id = 32, asignatura_plan_id = 25) - 6 horas/semana
-- Docente: Lic. Hilda Barriga (docente_id = 16)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(32, 2, 32, 16, 6, TRUE, '2026-01-19', TRUE);

-- MATEMÁTICA FINANCIERA (oferta_curso_id = 33, asignatura_plan_id = 26) - 4 horas/semana
-- Docente: Lic. Elio Honor (docente_id = 9)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(33, 2, 33, 9, 4, TRUE, '2026-01-19', TRUE);

-- ESTADÍSTICA PARA LOS NEGOCIOS (oferta_curso_id = 34, asignatura_plan_id = 27) - 4 horas/semana
-- Docente: Lic. José Luis Montenegro (docente_id = 22)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(34, 2, 34, 22, 4, TRUE, '2026-01-19', TRUE);

-- PRÁCTICA LABORAL Y TRIBUTARIA (oferta_curso_id = 35, asignatura_plan_id = 28) - 4 horas/semana
-- Docente: Lic. Sonia Carrizales (docente_id = 18)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(35, 2, 35, 18, 4, TRUE, '2026-01-19', TRUE);

-- INFORMÁTICA EMPRESARIAL (oferta_curso_id = 36, asignatura_plan_id = 29) - 2 horas/semana
-- Docente: Lic. Elio Honor (docente_id = 9)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(36, 2, 36, 9, 2, TRUE, '2026-01-19', TRUE);

-- INGLÉS TÉCNICO (oferta_curso_id = 37, asignatura_plan_id = 30) - 4 horas/semana
-- Docente: Lic. Rafael Montero (docente_id = 10)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(37, 2, 37, 10, 4, TRUE, '2026-01-19', TRUE);

-- ============================================
-- INSERTAR ASIGNACIONES - PRIMERO B (TARDE)
-- Oferta cursos: IDs 38-44
-- ============================================

-- FUNDAMENTOS DE LA ADMINISTRACIÓN (oferta_curso_id = 38, asignatura_plan_id = 24) - 6 horas/semana
-- Docente: Lic. Sonia Carrizales (docente_id = 18)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(38, 2, 38, 18, 6, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD GENERAL PARA ADMINISTRADORES (oferta_curso_id = 39, asignatura_plan_id = 25) - 6 horas/semana
-- Docente: Lic. René Roca (docente_id = 11)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(39, 2, 39, 11, 6, TRUE, '2026-01-19', TRUE);

-- MATEMÁTICA FINANCIERA (oferta_curso_id = 40, asignatura_plan_id = 26) - 4 horas/semana
-- Docente: Lic. Georgina Moron (docente_id = 12)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(40, 2, 40, 12, 4, TRUE, '2026-01-19', TRUE);

-- ESTADÍSTICA PARA LOS NEGOCIOS (oferta_curso_id = 41, asignatura_plan_id = 27) - 4 horas/semana
-- Docente: Lic. José Luis Montenegro (docente_id = 22)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(41, 2, 41, 22, 4, TRUE, '2026-01-19', TRUE);

-- PRÁCTICA LABORAL Y TRIBUTARIA (oferta_curso_id = 42, asignatura_plan_id = 28) - 4 horas/semana
-- Docente: Lic. Gonzalo Icuña (docente_id = 20)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(42, 2, 42, 20, 4, TRUE, '2026-01-19', TRUE);

-- INFORMÁTICA EMPRESARIAL (oferta_curso_id = 43, asignatura_plan_id = 29) - 2 horas/semana
-- Docente: FRANZ ROLANDO LUJAN CHAMBI (docente_id = 23)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(43, 2, 43, 23, 2, TRUE, '2026-01-19', TRUE);

-- INGLÉS TÉCNICO (oferta_curso_id = 44, asignatura_plan_id = 30) - 4 horas/semana
-- Docente: Lic. Rafael Montero (docente_id = 10) — Excel 2026 1°B
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(44, 2, 44, 10, 4, TRUE, '2026-01-19', TRUE);

-- ============================================
-- INSERTAR ASIGNACIONES - PRIMERO C (NOCHE)
-- Oferta cursos: IDs 45-51
-- ============================================

-- FUNDAMENTOS DE LA ADMINISTRACIÓN (oferta_curso_id = 45, asignatura_plan_id = 24) - 6 horas/semana
-- Docente: Lic. Vladimir Marca (docente_id = 8)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(45, 2, 45, 8, 6, TRUE, '2026-01-19', TRUE);

-- CONTABILIDAD GENERAL PARA ADMINISTRADORES (oferta_curso_id = 46, asignatura_plan_id = 25) - 6 horas/semana
-- Docente: Lic. Jose Luiz Uribe (docente_id = 14)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(46, 2, 46, 14, 6, TRUE, '2026-01-19', TRUE);

-- MATEMÁTICA FINANCIERA (oferta_curso_id = 47, asignatura_plan_id = 26) - 4 horas/semana
-- Docente: Lic. PUMA (docente_id = 13)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(47, 2, 47, 13, 4, TRUE, '2026-01-19', TRUE);

-- ESTADÍSTICA PARA LOS NEGOCIOS (oferta_curso_id = 48, asignatura_plan_id = 27) - 4 horas/semana
-- Docente: Lic. José Luis Montenegro (docente_id = 22)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(48, 2, 48, 22, 4, TRUE, '2026-01-19', TRUE);

-- PRÁCTICA LABORAL Y TRIBUTARIA (oferta_curso_id = 49, asignatura_plan_id = 28) - 4 horas/semana
-- Docente: Lic. Franz Lujan (docente_id = 23)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(49, 2, 49, 23, 4, TRUE, '2026-01-19', TRUE);

-- INFORMÁTICA EMPRESARIAL (oferta_curso_id = 50, asignatura_plan_id = 29) - 2 horas/semana
-- Docente: Lic. Elio Honor (docente_id = 9)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(50, 2, 50, 9, 2, TRUE, '2026-01-19', TRUE);

-- INGLÉS TÉCNICO (oferta_curso_id = 51, asignatura_plan_id = 30) - 4 horas/semana
-- Docente: Ing. Giovanna Fernandez (docente_id = 5) — Excel 2026 ADM 1°C (compartido SIS-INF)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(51, 2, 51, 5, 4, TRUE, '2026-01-19', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE ASIGNACIONES
-- ============================================
-- PARALELO A (PRIMERO A - TARDE): 7 asignaciones (IDs 31-37)
--   - Rafael Montero (10): FUA-101, INT-107 (2 cursos)
--   - Hilda Barriga (16): CGA-102 (1 curso)
--   - Elio Honor (9): MAF-103, IFE-106 (2 cursos)
--   - José Luis Montenegro (22): ESN-104 (1 curso)
--   - Sonia Carrizales (18): PLT-105 (1 curso)
--
-- PARALELO B (PRIMERO B - TARDE): 7 asignaciones (IDs 38-44)
--   - Sonia Carrizales (18): FUA-101 (1 curso)
--   - René Roca (11): CGA-102 (1 curso)
--   - Georgina Moron (12): MAF-103 (1 curso)
--   - José Luis Montenegro (22): ESN-104 (1 curso)
--   - Gonzalo Icuña (20): PLT-105 (1 curso)
--   - Franz Lujan (23): IFE-106 (1 curso)
--   - Rafael Montero (10): INT-107 (1 curso)
--
-- PARALELO C (PRIMERO C - NOCHE): 7 asignaciones (IDs 45-51)
--   - Vladimir Marca (8): FUA-101 (1 curso)
--   - Jose Luiz Uribe (14): CGA-102 (1 curso)
--   - PUMA (13): MAF-103 (1 curso)
--   - José Luis Montenegro (22): ESN-104 (1 curso)
--   - Franz Lujan (23): PLT-105 (1 curso)
--   - Elio Honor (9): IFE-106 (1 curso)
--   - Giovanna Fernandez (5): INT-107 (1 curso) — Compartido SIS-INF
--
-- TOTAL: 21 asignaciones de docentes para Primer Año - Administración de Empresas
-- Gestión: 2026 (VIGENTE)
-- TODAS las asignaciones tienen docente asignado correctamente
-- ============================================
-- FIN DEL SEEDER
-- ============================================
