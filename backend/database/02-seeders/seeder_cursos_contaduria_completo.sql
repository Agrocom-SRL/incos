-- ============================================
-- SEEDER: cursos - CONTADURÍA GENERAL COMPLETO
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Cursos de CONTADURÍA GENERAL - TODOS LOS PARALELOS
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE REFERENCIA - CONTADURÍA GENERAL
-- ============================================

-- Carrera y plan
SET @carrera_con_id = (SELECT id FROM carreras WHERE codigo = 'CON-GEN' LIMIT 1);
SET @plan_con_id = (SELECT id FROM planes_estudios WHERE carrera_id = @carrera_con_id LIMIT 1);

-- ============================================
-- OBTENER IDs DE PARALELOS
-- ============================================

-- PRIMER AÑO
SET @paralelo_con_1a_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_con_id AND nombre = 'PRIMERO A' AND turno = 'TARDE' LIMIT 1);
SET @paralelo_con_1b_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_con_id AND nombre = 'PRIMERO B' AND turno = 'TARDE' LIMIT 1);
SET @paralelo_con_1c_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_con_id AND nombre = 'PRIMERO C' AND turno = 'NOCHE' LIMIT 1);
SET @paralelo_con_1d_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_con_id AND nombre = 'PRIMERO D' AND turno = 'NOCHE' LIMIT 1);

-- SEGUNDO AÑO
SET @paralelo_con_2a_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_con_id AND nombre = 'SEGUNDO A' AND turno = 'TARDE' LIMIT 1);
SET @paralelo_con_2b_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_con_id AND nombre = 'SEGUNDO B' AND turno = 'NOCHE' LIMIT 1);

-- TERCER AÑO
SET @paralelo_con_3a_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_con_id AND nombre = 'TERCERO A' AND turno = 'TARDE' LIMIT 1);
SET @paralelo_con_3b_id = (SELECT id FROM paralelos WHERE carrera_id = @carrera_con_id AND nombre = 'TERCERO B' AND turno = 'TARDE' LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS - PRIMER AÑO
-- ============================================

SET @asig_con_101 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'CON-101' LIMIT 1);

SET @asig_maf_102 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'MAF-102' LIMIT 1);

SET @asig_ico_103 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'ICO-103' LIMIT 1);

SET @asig_adg_104 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'ADG-104' LIMIT 1);

SET @asig_lsa_105 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'LSA-105' LIMIT 1);

SET @asig_ega_106 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'EGA-106' LIMIT 1);

SET @asig_dcm_107 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'DCM-107' LIMIT 1);

SET @asig_esa_108 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'ESA-108' LIMIT 1);

SET @asig_int_109 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'INT-109' LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS - SEGUNDO AÑO
-- ============================================

SET @asig_con_201 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'CON-201' LIMIT 1);

SET @asig_coc_202 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'COC-202' LIMIT 1);

SET @asig_cos_203 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'COS-203' LIMIT 1);

SET @asig_cds_204 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'CDS-204' LIMIT 1);

SET @asig_cbc_205 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'CBC-205' LIMIT 1);

SET @asig_emp_206 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'EMP-206' LIMIT 1);

SET @asig_sit_207 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'SIT-207' LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS - TERCER AÑO
-- ============================================

SET @asig_coa_301 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'COA-301' LIMIT 1);

SET @asig_coc_302 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'COC-302' LIMIT 1);

SET @asig_cog_303 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'COG-303' LIMIT 1);

SET @asig_cep_304 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'CEP-304' LIMIT 1);

SET @asig_chs_305 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'CHS-305' LIMIT 1);

SET @asig_gci_306 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'GCI-306' LIMIT 1);

SET @asig_aef_307 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'AEF-307' LIMIT 1);

SET @asig_tmg_308 = (SELECT ap.id FROM asignaturas_plan ap 
    INNER JOIN materias m ON ap.materia_id = m.id 
    WHERE ap.plan_estudio_id = @plan_con_id AND m.sigla = 'TMG-308' LIMIT 1);

-- ============================================
-- INSERTAR CURSOS - PRIMER AÑO
-- ============================================

-- PARALELO A - TARDE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('CON-1A-TARDE-CON101', @paralelo_con_1a_id, @asig_con_101, 35, 10),
('CON-1A-TARDE-MAF102', @paralelo_con_1a_id, @asig_maf_102, 35, 10),
('CON-1A-TARDE-ICO103', @paralelo_con_1a_id, @asig_ico_103, 35, 10),
('CON-1A-TARDE-ADG104', @paralelo_con_1a_id, @asig_adg_104, 35, 10),
('CON-1A-TARDE-LSA105', @paralelo_con_1a_id, @asig_lsa_105, 35, 10),
('CON-1A-TARDE-EGA106', @paralelo_con_1a_id, @asig_ega_106, 35, 10),
('CON-1A-TARDE-DCM107', @paralelo_con_1a_id, @asig_dcm_107, 35, 10),
('CON-1A-TARDE-ESA108', @paralelo_con_1a_id, @asig_esa_108, 35, 10),
('CON-1A-TARDE-INT109', @paralelo_con_1a_id, @asig_int_109, 35, 10);

-- PARALELO B - TARDE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('CON-1B-TARDE-CON101', @paralelo_con_1b_id, @asig_con_101, 35, 10),
('CON-1B-TARDE-MAF102', @paralelo_con_1b_id, @asig_maf_102, 35, 10),
('CON-1B-TARDE-ICO103', @paralelo_con_1b_id, @asig_ico_103, 35, 10),
('CON-1B-TARDE-ADG104', @paralelo_con_1b_id, @asig_adg_104, 35, 10),
('CON-1B-TARDE-LSA105', @paralelo_con_1b_id, @asig_lsa_105, 35, 10),
('CON-1B-TARDE-EGA106', @paralelo_con_1b_id, @asig_ega_106, 35, 10),
('CON-1B-TARDE-DCM107', @paralelo_con_1b_id, @asig_dcm_107, 35, 10),
('CON-1B-TARDE-ESA108', @paralelo_con_1b_id, @asig_esa_108, 35, 10),
('CON-1B-TARDE-INT109', @paralelo_con_1b_id, @asig_int_109, 35, 10);

-- PARALELO C - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('CON-1C-NOCHE-CON101', @paralelo_con_1c_id, @asig_con_101, 35, 10),
('CON-1C-NOCHE-MAF102', @paralelo_con_1c_id, @asig_maf_102, 35, 10),
('CON-1C-NOCHE-ICO103', @paralelo_con_1c_id, @asig_ico_103, 35, 10),
('CON-1C-NOCHE-ADG104', @paralelo_con_1c_id, @asig_adg_104, 35, 10),
('CON-1C-NOCHE-LSA105', @paralelo_con_1c_id, @asig_lsa_105, 35, 10),
('CON-1C-NOCHE-EGA106', @paralelo_con_1c_id, @asig_ega_106, 35, 10),
('CON-1C-NOCHE-DCM107', @paralelo_con_1c_id, @asig_dcm_107, 35, 10),
('CON-1C-NOCHE-ESA108', @paralelo_con_1c_id, @asig_esa_108, 35, 10),
('CON-1C-NOCHE-INT109', @paralelo_con_1c_id, @asig_int_109, 35, 10);

-- PARALELO D - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('CON-1D-NOCHE-CON101', @paralelo_con_1d_id, @asig_con_101, 35, 10),
('CON-1D-NOCHE-MAF102', @paralelo_con_1d_id, @asig_maf_102, 35, 10),
('CON-1D-NOCHE-ICO103', @paralelo_con_1d_id, @asig_ico_103, 35, 10),
('CON-1D-NOCHE-ADG104', @paralelo_con_1d_id, @asig_adg_104, 35, 10),
('CON-1D-NOCHE-LSA105', @paralelo_con_1d_id, @asig_lsa_105, 35, 10),
('CON-1D-NOCHE-EGA106', @paralelo_con_1d_id, @asig_ega_106, 35, 10),
('CON-1D-NOCHE-DCM107', @paralelo_con_1d_id, @asig_dcm_107, 35, 10),
('CON-1D-NOCHE-ESA108', @paralelo_con_1d_id, @asig_esa_108, 35, 10),
('CON-1D-NOCHE-INT109', @paralelo_con_1d_id, @asig_int_109, 35, 10);

-- ============================================
-- INSERTAR CURSOS - SEGUNDO AÑO
-- ============================================

-- PARALELO A - TARDE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('CON-2A-TARDE-CON201', @paralelo_con_2a_id, @asig_con_201, 35, 10),
('CON-2A-TARDE-COC202', @paralelo_con_2a_id, @asig_coc_202, 35, 10),
('CON-2A-TARDE-COS203', @paralelo_con_2a_id, @asig_cos_203, 35, 10),
('CON-2A-TARDE-CDS204', @paralelo_con_2a_id, @asig_cds_204, 35, 10),
('CON-2A-TARDE-CBC205', @paralelo_con_2a_id, @asig_cbc_205, 35, 10),
('CON-2A-TARDE-EMP206', @paralelo_con_2a_id, @asig_emp_206, 35, 10),
('CON-2A-TARDE-SIT207', @paralelo_con_2a_id, @asig_sit_207, 35, 10);

-- PARALELO B - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('CON-2B-NOCHE-CON201', @paralelo_con_2b_id, @asig_con_201, 35, 10),
('CON-2B-NOCHE-COC202', @paralelo_con_2b_id, @asig_coc_202, 35, 10),
('CON-2B-NOCHE-COS203', @paralelo_con_2b_id, @asig_cos_203, 35, 10),
('CON-2B-NOCHE-CDS204', @paralelo_con_2b_id, @asig_cds_204, 35, 10),
('CON-2B-NOCHE-CBC205', @paralelo_con_2b_id, @asig_cbc_205, 35, 10),
('CON-2B-NOCHE-EMP206', @paralelo_con_2b_id, @asig_emp_206, 35, 10),
('CON-2B-NOCHE-SIT207', @paralelo_con_2b_id, @asig_sit_207, 35, 10);

-- ============================================
-- INSERTAR CURSOS - TERCER AÑO
-- ============================================

-- PARALELO A - TARDE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('CON-3A-TARDE-COA301', @paralelo_con_3a_id, @asig_coa_301, 35, 10),
('CON-3A-TARDE-COC302', @paralelo_con_3a_id, @asig_coc_302, 35, 10),
('CON-3A-TARDE-COG303', @paralelo_con_3a_id, @asig_cog_303, 35, 10),
('CON-3A-TARDE-CEP304', @paralelo_con_3a_id, @asig_cep_304, 35, 10),
('CON-3A-TARDE-CHS305', @paralelo_con_3a_id, @asig_chs_305, 35, 10),
('CON-3A-TARDE-GCI306', @paralelo_con_3a_id, @asig_gci_306, 35, 10),
('CON-3A-TARDE-AEF307', @paralelo_con_3a_id, @asig_aef_307, 35, 10),
('CON-3A-TARDE-TMG308', @paralelo_con_3a_id, @asig_tmg_308, 35, 10);

-- PARALELO B - TARDE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo) VALUES
('CON-3B-TARDE-COA301', @paralelo_con_3b_id, @asig_coa_301, 35, 10),
('CON-3B-TARDE-COC302', @paralelo_con_3b_id, @asig_coc_302, 35, 10),
('CON-3B-TARDE-COG303', @paralelo_con_3b_id, @asig_cog_303, 35, 10),
('CON-3B-TARDE-CEP304', @paralelo_con_3b_id, @asig_cep_304, 35, 10),
('CON-3B-TARDE-CHS305', @paralelo_con_3b_id, @asig_chs_305, 35, 10),
('CON-3B-TARDE-GCI306', @paralelo_con_3b_id, @asig_gci_306, 35, 10),
('CON-3B-TARDE-AEF307', @paralelo_con_3b_id, @asig_aef_307, 35, 10),
('CON-3B-TARDE-TMG308', @paralelo_con_3b_id, @asig_tmg_308, 35, 10);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE CURSOS CREADOS
-- ============================================
-- PRIMER AÑO:
--   Paralelo A (TARDE): 9 cursos
--   Paralelo B (TARDE): 9 cursos
--   Paralelo C (NOCHE): 9 cursos
--   Paralelo D (NOCHE): 9 cursos
--   SUBTOTAL: 36 cursos
--
-- SEGUNDO AÑO:
--   Paralelo A (TARDE): 7 cursos
--   Paralelo B (NOCHE): 7 cursos
--   SUBTOTAL: 14 cursos
--
-- TERCER AÑO:
--   Paralelo A (TARDE): 8 cursos
--   Paralelo B (TARDE): 8 cursos
--   SUBTOTAL: 16 cursos
--
-- TOTAL GENERAL: 66 cursos de Contaduría General
-- ============================================
-- FIN DEL SEEDER
-- ============================================
