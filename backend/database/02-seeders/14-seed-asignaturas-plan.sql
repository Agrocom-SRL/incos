-- ============================================
-- SEEDER: asignaturas_plan
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Asignación de materias a periodos según Plan de Estudios RM No. 0210/2023
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaturas_plan;

-- ============================================
-- OBTENER IDs DE PLANES DE ESTUDIO
-- ============================================
SET @plan_sis_id = (SELECT id FROM planes_estudios WHERE carrera_id = (SELECT id FROM carreras WHERE codigo = 'SIS-INF' LIMIT 1) LIMIT 1);
SET @plan_adm_id = (SELECT id FROM planes_estudios WHERE carrera_id = (SELECT id FROM carreras WHERE codigo = 'ADM-EMP' LIMIT 1) LIMIT 1);
SET @plan_con_id = (SELECT id FROM planes_estudios WHERE carrera_id = (SELECT id FROM carreras WHERE codigo = 'CON-GEN' LIMIT 1) LIMIT 1);

-- ============================================
-- OBTENER IDs DE PERIODOS
-- ============================================
-- Sistemas Informáticos
SET @periodo_sis_1_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_sis_id AND numero = 1 LIMIT 1);
SET @periodo_sis_2_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_sis_id AND numero = 2 LIMIT 1);
SET @periodo_sis_3_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_sis_id AND numero = 3 LIMIT 1);
-- Administración de Empresas
SET @periodo_adm_1_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_adm_id AND numero = 1 LIMIT 1);
SET @periodo_adm_2_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_adm_id AND numero = 2 LIMIT 1);
SET @periodo_adm_3_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_adm_id AND numero = 3 LIMIT 1);
-- Contaduría General
SET @periodo_con_1_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_con_id AND numero = 1 LIMIT 1);
SET @periodo_con_2_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_con_id AND numero = 2 LIMIT 1);
SET @periodo_con_3_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_con_id AND numero = 3 LIMIT 1);

-- ============================================
-- OBTENER IDs DE MATERIAS - CONTADURÍA GENERAL
-- ============================================
SET @materia_con_101_id = (SELECT id FROM materias WHERE sigla = 'CON-101' LIMIT 1);
SET @materia_maf_102_id = (SELECT id FROM materias WHERE sigla = 'MAF-102' LIMIT 1);
SET @materia_ico_103_id = (SELECT id FROM materias WHERE sigla = 'ICO-103' LIMIT 1);
SET @materia_adg_104_id = (SELECT id FROM materias WHERE sigla = 'ADG-104' LIMIT 1);
SET @materia_lsa_105_id = (SELECT id FROM materias WHERE sigla = 'LSA-105' LIMIT 1);
SET @materia_ega_106_id = (SELECT id FROM materias WHERE sigla = 'EGA-106' LIMIT 1);
SET @materia_dcm_107_id = (SELECT id FROM materias WHERE sigla = 'DCM-107' LIMIT 1);
SET @materia_esa_108_id = (SELECT id FROM materias WHERE sigla = 'ESA-108' LIMIT 1);
SET @materia_int_109_con_id = (SELECT id FROM materias WHERE sigla = 'INT-109' LIMIT 1);
SET @materia_con_201_id = (SELECT id FROM materias WHERE sigla = 'CON-201' LIMIT 1);
SET @materia_coc_202_id = (SELECT id FROM materias WHERE sigla = 'COC-202' LIMIT 1);
SET @materia_cos_203_id = (SELECT id FROM materias WHERE sigla = 'COS-203' LIMIT 1);
SET @materia_cds_204_id = (SELECT id FROM materias WHERE sigla = 'CDS-204' LIMIT 1);
SET @materia_cbc_205_id = (SELECT id FROM materias WHERE sigla = 'CBC-205' LIMIT 1);
SET @materia_emp_206_id = (SELECT id FROM materias WHERE sigla = 'EMP-206' LIMIT 1);
SET @materia_sit_207_id = (SELECT id FROM materias WHERE sigla = 'SIT-207' LIMIT 1);
SET @materia_coa_301_id = (SELECT id FROM materias WHERE sigla = 'COA-301' LIMIT 1);
SET @materia_coc_302_id = (SELECT id FROM materias WHERE sigla = 'COC-302' LIMIT 1);
SET @materia_cog_303_id = (SELECT id FROM materias WHERE sigla = 'COG-303' LIMIT 1);
SET @materia_cep_304_id = (SELECT id FROM materias WHERE sigla = 'CEP-304' LIMIT 1);
SET @materia_chs_305_id = (SELECT id FROM materias WHERE sigla = 'CHS-305' LIMIT 1);
SET @materia_gci_306_id = (SELECT id FROM materias WHERE sigla = 'GCI-306' LIMIT 1);
SET @materia_aef_307_id = (SELECT id FROM materias WHERE sigla = 'AEF-307' LIMIT 1);
SET @materia_tmg_308_con_id = (SELECT id FROM materias WHERE sigla = 'TMG-308' LIMIT 1);

-- ============================================
-- OBTENER IDs DE MATERIAS - SISTEMAS INFORMÁTICOS
-- ============================================
SET @materia_mpi_101_id = (SELECT id FROM materias WHERE sigla = 'MPI-101' LIMIT 1);
SET @materia_prg_102_id = (SELECT id FROM materias WHERE sigla = 'PRG-102' LIMIT 1);
SET @materia_int_103_sis_id = (SELECT id FROM materias WHERE sigla = 'INT-103' LIMIT 1);
SET @materia_hdc_104_id = (SELECT id FROM materias WHERE sigla = 'HDC-104' LIMIT 1);
SET @materia_tso_105_id = (SELECT id FROM materias WHERE sigla = 'TSO-105' LIMIT 1);
SET @materia_otm_106_id = (SELECT id FROM materias WHERE sigla = 'OTM-106' LIMIT 1);
SET @materia_dpw_107_id = (SELECT id FROM materias WHERE sigla = 'DPW-107' LIMIT 1);
SET @materia_est_201_id = (SELECT id FROM materias WHERE sigla = 'EST-201' LIMIT 1);
SET @materia_prg_202_id = (SELECT id FROM materias WHERE sigla = 'PRG-202' LIMIT 1);
SET @materia_edd_203_id = (SELECT id FROM materias WHERE sigla = 'EDD-203' LIMIT 1);
SET @materia_rdc_204_id = (SELECT id FROM materias WHERE sigla = 'RDC-204' LIMIT 1);
SET @materia_pdm_205_id = (SELECT id FROM materias WHERE sigla = 'PDM-205' LIMIT 1);
SET @materia_ads_206_id = (SELECT id FROM materias WHERE sigla = 'ADS-206' LIMIT 1);
SET @materia_dpw_207_id = (SELECT id FROM materias WHERE sigla = 'DPW-207' LIMIT 1);
SET @materia_bdd_208_id = (SELECT id FROM materias WHERE sigla = 'BDD-208' LIMIT 1);
SET @materia_emp_301_id = (SELECT id FROM materias WHERE sigla = 'EMP-301' LIMIT 1);
SET @materia_dpw_302_id = (SELECT id FROM materias WHERE sigla = 'DPW-302' LIMIT 1);
SET @materia_gmc_303_id = (SELECT id FROM materias WHERE sigla = 'GMC-303' LIMIT 1);
SET @materia_rdc_304_id = (SELECT id FROM materias WHERE sigla = 'RDC-304' LIMIT 1);
SET @materia_tmg_305_id = (SELECT id FROM materias WHERE sigla = 'TMG-305' LIMIT 1);
SET @materia_ads_306_id = (SELECT id FROM materias WHERE sigla = 'ADS-306' LIMIT 1);
SET @materia_pdm_307_id = (SELECT id FROM materias WHERE sigla = 'PDM-307' LIMIT 1);
SET @materia_bdd_308_id = (SELECT id FROM materias WHERE sigla = 'BDD-308' LIMIT 1);

-- ============================================
-- OBTENER IDs DE MATERIAS - ADMINISTRACIÓN DE EMPRESAS
-- ============================================
SET @materia_fua_101_id = (SELECT id FROM materias WHERE sigla = 'FUA-101' LIMIT 1);
SET @materia_cga_102_id = (SELECT id FROM materias WHERE sigla = 'CGA-102' LIMIT 1);
SET @materia_maf_103_id = (SELECT id FROM materias WHERE sigla = 'MAF-103' LIMIT 1);
SET @materia_esn_104_id = (SELECT id FROM materias WHERE sigla = 'ESN-104' LIMIT 1);
SET @materia_plt_105_id = (SELECT id FROM materias WHERE sigla = 'PLT-105' LIMIT 1);
SET @materia_ife_106_id = (SELECT id FROM materias WHERE sigla = 'IFE-106' LIMIT 1);
SET @materia_int_107_adm_id = (SELECT id FROM materias WHERE sigla = 'INT-107' LIMIT 1);
SET @materia_ora_201_id = (SELECT id FROM materias WHERE sigla = 'ORA-201' LIMIT 1);
SET @materia_iem_202_id = (SELECT id FROM materias WHERE sigla = 'IEM-202' LIMIT 1);
SET @materia_ado_203_id = (SELECT id FROM materias WHERE sigla = 'ADO-203' LIMIT 1);
SET @materia_gth_204_id = (SELECT id FROM materias WHERE sigla = 'GTH-204' LIMIT 1);
SET @materia_adf_205_id = (SELECT id FROM materias WHERE sigla = 'ADF-205' LIMIT 1);
SET @materia_pep_206_id = (SELECT id FROM materias WHERE sigla = 'PEP-206' LIMIT 1);
SET @materia_acp_207_id = (SELECT id FROM materias WHERE sigla = 'ACP-207' LIMIT 1);
SET @materia_emp_208_id = (SELECT id FROM materias WHERE sigla = 'EMP-208' LIMIT 1);
SET @materia_amp_301_id = (SELECT id FROM materias WHERE sigla = 'AMP-301' LIMIT 1);
SET @materia_imn_302_id = (SELECT id FROM materias WHERE sigla = 'IMN-302' LIMIT 1);
SET @materia_adf_303_id = (SELECT id FROM materias WHERE sigla = 'ADF-303' LIMIT 1);
SET @materia_tmg_304_id = (SELECT id FROM materias WHERE sigla = 'TMG-304' LIMIT 1);
SET @materia_emp_305_id = (SELECT id FROM materias WHERE sigla = 'EMP-305' LIMIT 1);
SET @materia_cmi_306_id = (SELECT id FROM materias WHERE sigla = 'CMI-306' LIMIT 1);
SET @materia_gee_307_id = (SELECT id FROM materias WHERE sigla = 'GEE-307' LIMIT 1);

-- ============================================
-- INSERTAR ASIGNATURAS PLAN - CONTADURÍA GENERAL
-- ============================================

-- Primer Año
INSERT INTO asignaturas_plan (plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(@plan_con_id, @periodo_con_1_id, @materia_con_101_id, 8, 1),
(@plan_con_id, @periodo_con_1_id, @materia_maf_102_id, 4, 2),
(@plan_con_id, @periodo_con_1_id, @materia_ico_103_id, 4, 3),
(@plan_con_id, @periodo_con_1_id, @materia_adg_104_id, 4, 4),
(@plan_con_id, @periodo_con_1_id, @materia_lsa_105_id, 2, 5),
(@plan_con_id, @periodo_con_1_id, @materia_ega_106_id, 2, 6),
(@plan_con_id, @periodo_con_1_id, @materia_dcm_107_id, 2, 7),
(@plan_con_id, @periodo_con_1_id, @materia_esa_108_id, 2, 8),
(@plan_con_id, @periodo_con_1_id, @materia_int_109_con_id, 2, 9);

-- Segundo Año
INSERT INTO asignaturas_plan (plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(@plan_con_id, @periodo_con_2_id, @materia_con_201_id, 6, 1),
(@plan_con_id, @periodo_con_2_id, @materia_coc_202_id, 6, 2),
(@plan_con_id, @periodo_con_2_id, @materia_cos_203_id, 4, 3),
(@plan_con_id, @periodo_con_2_id, @materia_cds_204_id, 2, 4),
(@plan_con_id, @periodo_con_2_id, @materia_cbc_205_id, 4, 5),
(@plan_con_id, @periodo_con_2_id, @materia_emp_206_id, 4, 6),
(@plan_con_id, @periodo_con_2_id, @materia_sit_207_id, 4, 7);

-- Tercer Año
INSERT INTO asignaturas_plan (plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(@plan_con_id, @periodo_con_3_id, @materia_coa_301_id, 4, 1),
(@plan_con_id, @periodo_con_3_id, @materia_coc_302_id, 4, 2),
(@plan_con_id, @periodo_con_3_id, @materia_cog_303_id, 4, 3),
(@plan_con_id, @periodo_con_3_id, @materia_cep_304_id, 4, 4),
(@plan_con_id, @periodo_con_3_id, @materia_chs_305_id, 2, 5),
(@plan_con_id, @periodo_con_3_id, @materia_gci_306_id, 4, 6),
(@plan_con_id, @periodo_con_3_id, @materia_aef_307_id, 4, 7),
(@plan_con_id, @periodo_con_3_id, @materia_tmg_308_con_id, 4, 8);

-- ============================================
-- INSERTAR ASIGNATURAS PLAN - SISTEMAS INFORMÁTICOS
-- ============================================

-- Primer Año
INSERT INTO asignaturas_plan (plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(@plan_sis_id, @periodo_sis_1_id, @materia_mpi_101_id, 4, 1),
(@plan_sis_id, @periodo_sis_1_id, @materia_prg_102_id, 8, 2),
(@plan_sis_id, @periodo_sis_1_id, @materia_int_103_sis_id, 2, 3),
(@plan_sis_id, @periodo_sis_1_id, @materia_hdc_104_id, 4, 4),
(@plan_sis_id, @periodo_sis_1_id, @materia_tso_105_id, 4, 5),
(@plan_sis_id, @periodo_sis_1_id, @materia_otm_106_id, 4, 6),
(@plan_sis_id, @periodo_sis_1_id, @materia_dpw_107_id, 4, 7);

-- Segundo Año
INSERT INTO asignaturas_plan (plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(@plan_sis_id, @periodo_sis_2_id, @materia_est_201_id, 2, 1),
(@plan_sis_id, @periodo_sis_2_id, @materia_prg_202_id, 6, 2),
(@plan_sis_id, @periodo_sis_2_id, @materia_edd_203_id, 2, 3),
(@plan_sis_id, @periodo_sis_2_id, @materia_rdc_204_id, 4, 4),
(@plan_sis_id, @periodo_sis_2_id, @materia_pdm_205_id, 4, 5),
(@plan_sis_id, @periodo_sis_2_id, @materia_ads_206_id, 4, 6),
(@plan_sis_id, @periodo_sis_2_id, @materia_dpw_207_id, 4, 7),
(@plan_sis_id, @periodo_sis_2_id, @materia_bdd_208_id, 4, 8);

-- Tercer Año
INSERT INTO asignaturas_plan (plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(@plan_sis_id, @periodo_sis_3_id, @materia_emp_301_id, 4, 1),
(@plan_sis_id, @periodo_sis_3_id, @materia_dpw_302_id, 4, 2),
(@plan_sis_id, @periodo_sis_3_id, @materia_gmc_303_id, 2, 3),
(@plan_sis_id, @periodo_sis_3_id, @materia_rdc_304_id, 4, 4),
(@plan_sis_id, @periodo_sis_3_id, @materia_tmg_305_id, 4, 5),
(@plan_sis_id, @periodo_sis_3_id, @materia_ads_306_id, 4, 6),
(@plan_sis_id, @periodo_sis_3_id, @materia_pdm_307_id, 4, 7),
(@plan_sis_id, @periodo_sis_3_id, @materia_bdd_308_id, 4, 8);

-- ============================================
-- INSERTAR ASIGNATURAS PLAN - ADMINISTRACIÓN DE EMPRESAS
-- ============================================

-- Primer Año
INSERT INTO asignaturas_plan (plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(@plan_adm_id, @periodo_adm_1_id, @materia_fua_101_id, 6, 1),
(@plan_adm_id, @periodo_adm_1_id, @materia_cga_102_id, 6, 2),
(@plan_adm_id, @periodo_adm_1_id, @materia_maf_103_id, 4, 3),
(@plan_adm_id, @periodo_adm_1_id, @materia_esn_104_id, 4, 4),
(@plan_adm_id, @periodo_adm_1_id, @materia_plt_105_id, 4, 5),
(@plan_adm_id, @periodo_adm_1_id, @materia_ife_106_id, 2, 6),
(@plan_adm_id, @periodo_adm_1_id, @materia_int_107_adm_id, 4, 7);

-- Segundo Año
INSERT INTO asignaturas_plan (plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(@plan_adm_id, @periodo_adm_2_id, @materia_ora_201_id, 2, 1),
(@plan_adm_id, @periodo_adm_2_id, @materia_iem_202_id, 4, 2),
(@plan_adm_id, @periodo_adm_2_id, @materia_ado_203_id, 4, 3),
(@plan_adm_id, @periodo_adm_2_id, @materia_gth_204_id, 4, 4),
(@plan_adm_id, @periodo_adm_2_id, @materia_adf_205_id, 4, 5),
(@plan_adm_id, @periodo_adm_2_id, @materia_pep_206_id, 4, 6),
(@plan_adm_id, @periodo_adm_2_id, @materia_acp_207_id, 4, 7),
(@plan_adm_id, @periodo_adm_2_id, @materia_emp_208_id, 4, 8);

-- Tercer Año
INSERT INTO asignaturas_plan (plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(@plan_adm_id, @periodo_adm_3_id, @materia_amp_301_id, 6, 1),
(@plan_adm_id, @periodo_adm_3_id, @materia_imn_302_id, 4, 2),
(@plan_adm_id, @periodo_adm_3_id, @materia_adf_303_id, 4, 3),
(@plan_adm_id, @periodo_adm_3_id, @materia_tmg_304_id, 4, 4),
(@plan_adm_id, @periodo_adm_3_id, @materia_emp_305_id, 4, 5),
(@plan_adm_id, @periodo_adm_3_id, @materia_cmi_306_id, 4, 6),
(@plan_adm_id, @periodo_adm_3_id, @materia_gee_307_id, 4, 7);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
