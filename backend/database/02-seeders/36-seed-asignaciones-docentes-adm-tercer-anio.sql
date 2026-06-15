-- ============================================
-- SEEDER: asignaciones_docentes - ADMINISTRACIÓN DE EMPRESAS TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de docentes a oferta_cursos - Gestión 2026 (VIGENTE)
-- ============================================
-- Gestión 2026: gestion_id = 1 (vigente)
-- Plan Administración de Empresas: gestion_plan_id = 2
-- Periodo: Tercer Año (periodo_id = 6)
-- Paralelo: TERCERO A (paralelo_id=10)
-- Oferta cursos: IDs 68-74 (3A: 68-74)
-- ============================================
-- NOTA: Asignaciones basadas en el horario académico oficial 2026 (imagen proporcionada)
-- Docentes ADM-EMP: IDs 8-15
-- Docentes CON-GEN (comparten con ADM-EMP): IDs 16-25
--  8: Vladimir Marca
--  11: René Roca
--  13: PUMA
--  14: Jose Luiz Uribe
--  15: Paola Mariaca
--  18: Sonia Carrizales

-- Sprint 4 — Asignación docente (ejecutar ANTES de 40–48 asignacion_horarios)
-- Pre-requisitos: 28–30 seed-oferta-cursos-*, 26-seed-docentes

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- INSERTAR ASIGNACIONES - TERCERO A (NOCHE)
-- Oferta cursos: IDs 68-74
-- ============================================

-- ADMINISTRACIÓN DE LA MICRO, PEQUEÑA Y MEDIANA EMPRESA (oferta_curso_id = 68, asignatura_plan_id = 39) - 6 horas/semana
-- Docente: Lic. Paola Mariaca (docente_id = 15)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(68, 2, 68, 15, 6, TRUE, '2026-01-19', TRUE);

-- INCUBACIÓN Y MODELOS DE NEGOCIOS (oferta_curso_id = 69, asignatura_plan_id = 40) - 4 horas/semana
-- Docente: Lic. René Roca (docente_id = 11)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(69, 2, 69, 11, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN FINANCIERA II (oferta_curso_id = 70, asignatura_plan_id = 41) - 4 horas/semana
-- Docente: Lic. Jose Luiz Uribe (docente_id = 14)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(70, 2, 70, 14, 4, TRUE, '2026-01-19', TRUE);

-- TALLER DE MODALIDAD DE GRADUACIÓN (oferta_curso_id = 71, asignatura_plan_id = 42) - 4 horas/semana
-- Docente: Lic. PUMA (docente_id = 13)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(71, 2, 71, 13, 4, TRUE, '2026-01-19', TRUE);

-- EMPRENDIMIENTO PRODUCTIVO (oferta_curso_id = 72, asignatura_plan_id = 43) - 4 horas/semana
-- Docente: Lic. Vladimir Marca (docente_id = 8)
-- NOTA: La imagen muestra solo 2 horas asignadas (MARTES periodos 4-5), pero asignaturas_plan indica 4 horas
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(72, 2, 72, 8, 4, TRUE, '2026-01-19', TRUE);

-- COMERCIO INTERNACIONAL (oferta_curso_id = 73, asignatura_plan_id = 44) - 4 horas/semana
-- Docente: Lic. Vladimir Marca (docente_id = 8)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(73, 2, 73, 9, 4, TRUE, '2026-01-19', TRUE);

-- GESTIÓN ESTRATÉGICA (oferta_curso_id = 74, asignatura_plan_id = 45) - 4 horas/semana
-- Docente: Lic. Sonia Carrizales (docente_id = 18)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, oferta_curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(74, 2, 74, 18, 4, TRUE, '2026-01-19', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE ASIGNACIONES
-- ============================================
-- PARALELO A (TERCERO A - NOCHE): 7 asignaciones (IDs 68-74)
--   - Paola Mariaca (15): ADMINISTRACIÓN DE LA MICRO, PEQUEÑA Y MEDIANA EMPRESA (1 curso, 6 horas)
--   - René Roca (11): INCUBACIÓN Y MODELOS DE NEGOCIOS (1 curso, 4 horas)
--   - Jose Luiz Uribe (14): ADMINISTRACIÓN FINANCIERA II (1 curso, 4 horas)
--   - PUMA (13): TALLER DE MODALIDAD DE GRADUACIÓN (1 curso, 4 horas)
--   - Vladimir Marca (8): EMPRENDIMIENTO PRODUCTIVO, COMERCIO INTERNACIONAL (2 cursos, 8 horas total)
--   - Sonia Carrizales (18): GESTIÓN ESTRATÉGICA (1 curso, 4 horas)
--
-- TOTAL: 7 asignaciones (IDs 68-74)
-- Continuación desde el último ID del seeder de Administración segundo año (67)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
