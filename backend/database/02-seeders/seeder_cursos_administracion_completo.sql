-- ============================================
-- SEEDER: cursos - ADMINISTRACIÓN DE EMPRESAS COMPLETO
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Cursos de ADMINISTRACIÓN DE EMPRESAS - TODOS LOS PARALELOS
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE REFERENCIA - ADMINISTRACIÓN DE EMPRESAS
-- ============================================

-- Carrera y plan
SET @carrera_adm_id = (SELECT id FROM carreras WHERE codigo = 'ADM-EMP' LIMIT 1);
SET @plan_adm_id = (SELECT id FROM planes_estudios WHERE carrera_id = @carrera_adm_id LIMIT 1);

-- ============================================
-- OBTENER IDs DE PARALELOS
-- ============================================

-- PRIMER AÑO
SET @paralelo_adm_1a_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_adm_id AND nombre = 'PRIMERO A' AND turno = 'TARDE' LIMIT 1);
SET @paralelo_adm_1b_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_adm_id AND nombre = 'PRIMERO B' AND turno = 'NOCHE' LIMIT 1);

-- SEGUNDO AÑO
SET @paralelo_adm_2a_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_adm_id AND nombre = 'SEGUNDO A' AND turno = 'TARDE' LIMIT 1);
SET @paralelo_adm_2b_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_adm_id AND nombre = 'SEGUNDO B' AND turno = 'NOCHE' LIMIT 1);

-- TERCER AÑO
SET @paralelo_adm_3a_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_adm_id AND nombre = 'TERCERO A' AND turno = 'NOCHE' LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS - PRIMER AÑO
-- ============================================

SET @asig_fua_101 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'FUA-101' LIMIT 1);

SET @asig_cga_102 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'CGA-102' LIMIT 1);

SET @asig_maf_103 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'MAF-103' LIMIT 1);

SET @asig_esn_104 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'ESN-104' LIMIT 1);

SET @asig_plt_105 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'PLT-105' LIMIT 1);

SET @asig_ife_106 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'IFE-106' LIMIT 1);

SET @asig_int_107 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'INT-107' LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS - SEGUNDO AÑO
-- ============================================

SET @asig_ora_201 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'ORA-201' LIMIT 1);

SET @asig_iem_202 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'IEM-202' LIMIT 1);

SET @asig_ado_203 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'ADO-203' LIMIT 1);

SET @asig_gth_204 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'GTH-204' LIMIT 1);

SET @asig_adf_205 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'ADF-205' LIMIT 1);

SET @asig_pep_206 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'PEP-206' LIMIT 1);

SET @asig_acp_207 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'ACP-207' LIMIT 1);

SET @asig_emp_208 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'EMP-208' LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS - TERCER AÑO
-- ============================================

SET @asig_amp_301 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'AMP-301' LIMIT 1);

SET @asig_imn_302 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'IMN-302' LIMIT 1);

SET @asig_adf_303 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'ADF-303' LIMIT 1);

SET @asig_tmg_304 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'TMG-304' LIMIT 1);

SET @asig_emp_305 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'EMP-305' LIMIT 1);

SET @asig_cmi_306 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'CMI-306' LIMIT 1);

SET @asig_gee_307 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_adm_id AND m.sigla = 'GEE-307' LIMIT 1);

-- ============================================
-- INSERTAR CURSOS - PRIMER AÑO
-- ============================================

-- PARALELO A - TARDE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('ADM-1A-TARDE-FUA101', @paralelo_adm_1a_id, @asig_fua_101, 35, 10),
('ADM-1A-TARDE-CGA102', @paralelo_adm_1a_id, @asig_cga_102, 35, 10),
('ADM-1A-TARDE-MAF103', @paralelo_adm_1a_id, @asig_maf_103, 35, 10),
('ADM-1A-TARDE-ESN104', @paralelo_adm_1a_id, @asig_esn_104, 35, 10),
('ADM-1A-TARDE-PLT105', @paralelo_adm_1a_id, @asig_plt_105, 35, 10),
('ADM-1A-TARDE-IFE106', @paralelo_adm_1a_id, @asig_ife_106, 35, 10),
('ADM-1A-TARDE-INT107', @paralelo_adm_1a_id, @asig_int_107, 35, 10);

-- PARALELO B - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('ADM-1B-NOCHE-FUA101', @paralelo_adm_1b_id, @asig_fua_101, 35, 10),
('ADM-1B-NOCHE-CGA102', @paralelo_adm_1b_id, @asig_cga_102, 35, 10),
('ADM-1B-NOCHE-MAF103', @paralelo_adm_1b_id, @asig_maf_103, 35, 10),
('ADM-1B-NOCHE-ESN104', @paralelo_adm_1b_id, @asig_esn_104, 35, 10),
('ADM-1B-NOCHE-PLT105', @paralelo_adm_1b_id, @asig_plt_105, 35, 10),
('ADM-1B-NOCHE-IFE106', @paralelo_adm_1b_id, @asig_ife_106, 35, 10),
('ADM-1B-NOCHE-INT107', @paralelo_adm_1b_id, @asig_int_107, 35, 10);

-- ============================================
-- INSERTAR CURSOS - SEGUNDO AÑO
-- ============================================

-- PARALELO A - TARDE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('ADM-2A-TARDE-ORA201', @paralelo_adm_2a_id, @asig_ora_201, 35, 10),
('ADM-2A-TARDE-IEM202', @paralelo_adm_2a_id, @asig_iem_202, 35, 10),
('ADM-2A-TARDE-ADO203', @paralelo_adm_2a_id, @asig_ado_203, 35, 10),
('ADM-2A-TARDE-GTH204', @paralelo_adm_2a_id, @asig_gth_204, 35, 10),
('ADM-2A-TARDE-ADF205', @paralelo_adm_2a_id, @asig_adf_205, 35, 10),
('ADM-2A-TARDE-PEP206', @paralelo_adm_2a_id, @asig_pep_206, 35, 10),
('ADM-2A-TARDE-ACP207', @paralelo_adm_2a_id, @asig_acp_207, 35, 10),
('ADM-2A-TARDE-EMP208', @paralelo_adm_2a_id, @asig_emp_208, 35, 10);

-- PARALELO B - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('ADM-2B-NOCHE-ORA201', @paralelo_adm_2b_id, @asig_ora_201, 35, 10),
('ADM-2B-NOCHE-IEM202', @paralelo_adm_2b_id, @asig_iem_202, 35, 10),
('ADM-2B-NOCHE-ADO203', @paralelo_adm_2b_id, @asig_ado_203, 35, 10),
('ADM-2B-NOCHE-GTH204', @paralelo_adm_2b_id, @asig_gth_204, 35, 10),
('ADM-2B-NOCHE-ADF205', @paralelo_adm_2b_id, @asig_adf_205, 35, 10),
('ADM-2B-NOCHE-PEP206', @paralelo_adm_2b_id, @asig_pep_206, 35, 10),
('ADM-2B-NOCHE-ACP207', @paralelo_adm_2b_id, @asig_acp_207, 35, 10),
('ADM-2B-NOCHE-EMP208', @paralelo_adm_2b_id, @asig_emp_208, 35, 10);

-- ============================================
-- INSERTAR CURSOS - TERCER AÑO
-- ============================================

-- PARALELO A - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('ADM-3A-NOCHE-AMP301', @paralelo_adm_3a_id, @asig_amp_301, 35, 10),
('ADM-3A-NOCHE-IMN302', @paralelo_adm_3a_id, @asig_imn_302, 35, 10),
('ADM-3A-NOCHE-ADF303', @paralelo_adm_3a_id, @asig_adf_303, 35, 10),
('ADM-3A-NOCHE-TMG304', @paralelo_adm_3a_id, @asig_tmg_304, 35, 10),
('ADM-3A-NOCHE-EMP305', @paralelo_adm_3a_id, @asig_emp_305, 35, 10),
('ADM-3A-NOCHE-CMI306', @paralelo_adm_3a_id, @asig_cmi_306, 35, 10),
('ADM-3A-NOCHE-GEE307', @paralelo_adm_3a_id, @asig_gee_307, 35, 10);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE CURSOS CREADOS
-- ============================================
-- PRIMER AÑO:
--   Paralelo A (TARDE): 7 cursos
--   Paralelo B (NOCHE): 7 cursos
--   SUBTOTAL: 14 cursos
--
-- SEGUNDO AÑO:
--   Paralelo A (TARDE): 8 cursos
--   Paralelo B (NOCHE): 8 cursos
--   SUBTOTAL: 16 cursos
--
-- TERCER AÑO:
--   Paralelo A (NOCHE): 7 cursos
--   SUBTOTAL: 7 cursos
--
-- TOTAL GENERAL: 37 cursos de Administración de Empresas
-- ============================================
-- FIN DEL SEEDER
-- ============================================
