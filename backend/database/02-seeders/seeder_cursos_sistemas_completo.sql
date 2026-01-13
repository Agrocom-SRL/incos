-- ============================================
-- SEEDER: cursos - SISTEMAS INFORMÁTICOS COMPLETO
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Cursos de SISTEMAS INFORMÁTICOS - TODOS LOS PARALELOS
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE REFERENCIA - SISTEMAS INFORMÁTICOS
-- ============================================

-- Carrera y plan
SET @carrera_sis_id = (SELECT id FROM carreras WHERE codigo = 'SIS-INF' LIMIT 1);
SET @plan_sis_id = (SELECT id FROM planes_estudios WHERE carrera_id = @carrera_sis_id LIMIT 1);

-- ============================================
-- OBTENER IDs DE PARALELOS
-- ============================================

-- PRIMER AÑO
SET @paralelo_sis_1a_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_sis_id AND nombre = 'PRIMERO A' AND turno = 'NOCHE' LIMIT 1);
SET @paralelo_sis_1b_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_sis_id AND nombre = 'PRIMERO B' AND turno = 'NOCHE' LIMIT 1);

-- SEGUNDO AÑO
SET @paralelo_sis_2a_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_sis_id AND nombre = 'SEGUNDO A' AND turno = 'NOCHE' LIMIT 1);

-- TERCER AÑO
SET @paralelo_sis_3a_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_sis_id AND nombre = 'TERCERO A' AND turno = 'NOCHE' LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS - PRIMER AÑO
-- ============================================

SET @asig_mpi_101 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'MPI-101' LIMIT 1);

SET @asig_prg_102 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'PRG-102' LIMIT 1);

SET @asig_int_103 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'INT-103' LIMIT 1);

SET @asig_hdc_104 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'HDC-104' LIMIT 1);

SET @asig_tso_105 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'TSO-105' LIMIT 1);

SET @asig_otm_106 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'OTM-106' LIMIT 1);

SET @asig_dpw_107 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'DPW-107' LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS - SEGUNDO AÑO
-- ============================================

SET @asig_est_201 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'EST-201' LIMIT 1);

SET @asig_prg_202 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'PRG-202' LIMIT 1);

SET @asig_edd_203 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'EDD-203' LIMIT 1);

SET @asig_rdc_204 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'RDC-204' LIMIT 1);

SET @asig_pdm_205 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'PDM-205' LIMIT 1);

SET @asig_ads_206 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'ADS-206' LIMIT 1);

SET @asig_dpw_207 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'DPW-207' LIMIT 1);

SET @asig_bdd_208 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'BDD-208' LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS - TERCER AÑO
-- ============================================

SET @asig_emp_301 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'EMP-301' LIMIT 1);

SET @asig_dpw_302 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'DPW-302' LIMIT 1);

SET @asig_gmc_303 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'GMC-303' LIMIT 1);

SET @asig_rdc_304 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'RDC-304' LIMIT 1);

SET @asig_tmg_305 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'TMG-305' LIMIT 1);

SET @asig_ads_306 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'ADS-306' LIMIT 1);

SET @asig_pdm_307 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'PDM-307' LIMIT 1);

SET @asig_bdd_308 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_sis_id AND m.sigla = 'BDD-308' LIMIT 1);

-- ============================================
-- INSERTAR CURSOS - PRIMER AÑO
-- ============================================

-- PARALELO A - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('SIS-1A-NOCHE-MPI101', @paralelo_sis_1a_id, @asig_mpi_101, 35, 10),
('SIS-1A-NOCHE-PRG102', @paralelo_sis_1a_id, @asig_prg_102, 35, 10),
('SIS-1A-NOCHE-INT103', @paralelo_sis_1a_id, @asig_int_103, 35, 10),
('SIS-1A-NOCHE-HDC104', @paralelo_sis_1a_id, @asig_hdc_104, 35, 10),
('SIS-1A-NOCHE-TSO105', @paralelo_sis_1a_id, @asig_tso_105, 35, 10),
('SIS-1A-NOCHE-OTM106', @paralelo_sis_1a_id, @asig_otm_106, 35, 10),
('SIS-1A-NOCHE-DPW107', @paralelo_sis_1a_id, @asig_dpw_107, 35, 10);

-- PARALELO B - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('SIS-1B-NOCHE-MPI101', @paralelo_sis_1b_id, @asig_mpi_101, 35, 10),
('SIS-1B-NOCHE-PRG102', @paralelo_sis_1b_id, @asig_prg_102, 35, 10),
('SIS-1B-NOCHE-INT103', @paralelo_sis_1b_id, @asig_int_103, 35, 10),
('SIS-1B-NOCHE-HDC104', @paralelo_sis_1b_id, @asig_hdc_104, 35, 10),
('SIS-1B-NOCHE-TSO105', @paralelo_sis_1b_id, @asig_tso_105, 35, 10),
('SIS-1B-NOCHE-OTM106', @paralelo_sis_1b_id, @asig_otm_106, 35, 10),
('SIS-1B-NOCHE-DPW107', @paralelo_sis_1b_id, @asig_dpw_107, 35, 10);

-- ============================================
-- INSERTAR CURSOS - SEGUNDO AÑO
-- ============================================

-- PARALELO A - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('SIS-2A-NOCHE-EST201', @paralelo_sis_2a_id, @asig_est_201, 35, 10),
('SIS-2A-NOCHE-PRG202', @paralelo_sis_2a_id, @asig_prg_202, 35, 10),
('SIS-2A-NOCHE-EDD203', @paralelo_sis_2a_id, @asig_edd_203, 35, 10),
('SIS-2A-NOCHE-RDC204', @paralelo_sis_2a_id, @asig_rdc_204, 35, 10),
('SIS-2A-NOCHE-PDM205', @paralelo_sis_2a_id, @asig_pdm_205, 35, 10),
('SIS-2A-NOCHE-ADS206', @paralelo_sis_2a_id, @asig_ads_206, 35, 10),
('SIS-2A-NOCHE-DPW207', @paralelo_sis_2a_id, @asig_dpw_207, 35, 10),
('SIS-2A-NOCHE-BDD208', @paralelo_sis_2a_id, @asig_bdd_208, 35, 10);

-- ============================================
-- INSERTAR CURSOS - TERCER AÑO
-- ============================================

-- PARALELO A - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('SIS-3A-NOCHE-EMP301', @paralelo_sis_3a_id, @asig_emp_301, 35, 10),
('SIS-3A-NOCHE-DPW302', @paralelo_sis_3a_id, @asig_dpw_302, 35, 10),
('SIS-3A-NOCHE-GMC303', @paralelo_sis_3a_id, @asig_gmc_303, 35, 10),
('SIS-3A-NOCHE-RDC304', @paralelo_sis_3a_id, @asig_rdc_304, 35, 10),
('SIS-3A-NOCHE-TMG305', @paralelo_sis_3a_id, @asig_tmg_305, 35, 10),
('SIS-3A-NOCHE-ADS306', @paralelo_sis_3a_id, @asig_ads_306, 35, 10),
('SIS-3A-NOCHE-PDM307', @paralelo_sis_3a_id, @asig_pdm_307, 35, 10),
('SIS-3A-NOCHE-BDD308', @paralelo_sis_3a_id, @asig_bdd_308, 35, 10);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE CURSOS CREADOS
-- ============================================
-- PRIMER AÑO:
--   Paralelo A (NOCHE): 7 cursos
--   Paralelo B (NOCHE): 7 cursos
--   SUBTOTAL: 14 cursos
--
-- SEGUNDO AÑO:
--   Paralelo A (NOCHE): 8 cursos
--   SUBTOTAL: 8 cursos
--
-- TERCER AÑO:
--   Paralelo A (NOCHE): 8 cursos
--   SUBTOTAL: 8 cursos
--
-- TOTAL GENERAL: 30 cursos de Sistemas Informáticos
-- ============================================
-- FIN DEL SEEDER
-- ============================================
