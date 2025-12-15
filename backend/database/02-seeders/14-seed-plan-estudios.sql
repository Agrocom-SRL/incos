-- ============================================
-- SEEDER: plan_estudios
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Plan de estudios (relación carrera × periodo × materia)
-- Basado en Plan de Estudios oficial 2018
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE plan_estudios;

-- ============================================
-- OBTENER IDs DE CARRERAS
-- ============================================
SET @carrera_sis_id = (SELECT id FROM carreras WHERE codigo = 'SIS-INF' LIMIT 1);
SET @carrera_adm_id = (SELECT id FROM carreras WHERE codigo = 'ADM-EMP' LIMIT 1);
SET @carrera_con_id = (SELECT id FROM carreras WHERE codigo = 'CON-GEN' LIMIT 1);

-- ============================================
-- OBTENER IDs DE PERIODOS
-- ============================================
-- Sistemas Informáticos
SET @periodo_sis_1_id = (SELECT id FROM periodos WHERE carrera_id = @carrera_sis_id AND numero = 1 LIMIT 1);
SET @periodo_sis_2_id = (SELECT id FROM periodos WHERE carrera_id = @carrera_sis_id AND numero = 2 LIMIT 1);
SET @periodo_sis_3_id = (SELECT id FROM periodos WHERE carrera_id = @carrera_sis_id AND numero = 3 LIMIT 1);
-- Administración de Empresas
SET @periodo_adm_1_id = (SELECT id FROM periodos WHERE carrera_id = @carrera_adm_id AND numero = 1 LIMIT 1);
SET @periodo_adm_2_id = (SELECT id FROM periodos WHERE carrera_id = @carrera_adm_id AND numero = 2 LIMIT 1);
SET @periodo_adm_3_id = (SELECT id FROM periodos WHERE carrera_id = @carrera_adm_id AND numero = 3 LIMIT 1);
-- Contaduría General
SET @periodo_con_1_id = (SELECT id FROM periodos WHERE carrera_id = @carrera_con_id AND numero = 1 LIMIT 1);
SET @periodo_con_2_id = (SELECT id FROM periodos WHERE carrera_id = @carrera_con_id AND numero = 2 LIMIT 1);
SET @periodo_con_3_id = (SELECT id FROM periodos WHERE carrera_id = @carrera_con_id AND numero = 3 LIMIT 1);

-- ============================================
-- OBTENER IDs DE MATERIAS - CONTADURÍA GENERAL
-- ============================================
-- Primer Año
SET @materia_lsa_101_id = (SELECT id FROM materias WHERE codigo = 'LSA-101' LIMIT 1);
SET @materia_int_102_con_id = (SELECT id FROM materias WHERE codigo = 'INT-102' LIMIT 1);
SET @materia_con_103_id = (SELECT id FROM materias WHERE codigo = 'CON-103' LIMIT 1);
SET @materia_maf_104_con_id = (SELECT id FROM materias WHERE codigo = 'MAF-104' LIMIT 1);
SET @materia_ico_105_id = (SELECT id FROM materias WHERE codigo = 'ICO-105' LIMIT 1);
SET @materia_ega_106_id = (SELECT id FROM materias WHERE codigo = 'EGA-106' LIMIT 1);
SET @materia_dcm_107_id = (SELECT id FROM materias WHERE codigo = 'DCM-107' LIMIT 1);
SET @materia_esa_108_id = (SELECT id FROM materias WHERE codigo = 'ESA-108' LIMIT 1);
SET @materia_adg_109_id = (SELECT id FROM materias WHERE codigo = 'ADG-109' LIMIT 1);
-- Segundo Año
SET @materia_con_201_id = (SELECT id FROM materias WHERE codigo = 'CON-201' LIMIT 1);
SET @materia_coc_202_id = (SELECT id FROM materias WHERE codigo = 'COC-202' LIMIT 1);
SET @materia_cos_203_id = (SELECT id FROM materias WHERE codigo = 'COS-203' LIMIT 1);
SET @materia_cds_204_id = (SELECT id FROM materias WHERE codigo = 'CDS-204' LIMIT 1);
SET @materia_cbc_205_id = (SELECT id FROM materias WHERE codigo = 'CBC-205' LIMIT 1);
SET @materia_sit_206_id = (SELECT id FROM materias WHERE codigo = 'SIT-206' LIMIT 1);
SET @materia_iae_207_id = (SELECT id FROM materias WHERE codigo = 'IAE-207' LIMIT 1);
-- Tercer Año
SET @materia_coa_301_id = (SELECT id FROM materias WHERE codigo = 'COA-301' LIMIT 1);
SET @materia_coc_302_id = (SELECT id FROM materias WHERE codigo = 'COC-302' LIMIT 1);
SET @materia_cog_303_id = (SELECT id FROM materias WHERE codigo = 'COG-303' LIMIT 1);
SET @materia_cep_304_id = (SELECT id FROM materias WHERE codigo = 'CEP-304' LIMIT 1);
SET @materia_chs_305_id = (SELECT id FROM materias WHERE codigo = 'CHS-305' LIMIT 1);
SET @materia_gci_306_id = (SELECT id FROM materias WHERE codigo = 'GCI-306' LIMIT 1);
SET @materia_aef_307_id = (SELECT id FROM materias WHERE codigo = 'AEF-307' LIMIT 1);
SET @materia_tmg_308_con_id = (SELECT id FROM materias WHERE codigo = 'TMG-308' LIMIT 1);

-- ============================================
-- OBTENER IDs DE MATERIAS - SISTEMAS INFORMÁTICOS
-- ============================================
-- Primer Año
SET @materia_hsa_101_id = (SELECT id FROM materias WHERE codigo = 'HSA-101' LIMIT 1);
SET @materia_int_102_sis_id = (SELECT id FROM materias WHERE codigo = 'INT-102' LIMIT 1);
SET @materia_mpi_103_id = (SELECT id FROM materias WHERE codigo = 'MPI-103' LIMIT 1);
SET @materia_prg_104_id = (SELECT id FROM materias WHERE codigo = 'PRG-104' LIMIT 1);
SET @materia_tso_105_id = (SELECT id FROM materias WHERE codigo = 'TSO-105' LIMIT 1);
SET @materia_otm_106_id = (SELECT id FROM materias WHERE codigo = 'OTM-106' LIMIT 1);
SET @materia_dpw_107_id = (SELECT id FROM materias WHERE codigo = 'DPW-107' LIMIT 1);
-- Segundo Año
SET @materia_est_201_id = (SELECT id FROM materias WHERE codigo = 'EST-201' LIMIT 1);
SET @materia_prg_202_id = (SELECT id FROM materias WHERE codigo = 'PRG-202' LIMIT 1);
SET @materia_rdc_203_id = (SELECT id FROM materias WHERE codigo = 'RDC-203' LIMIT 1);
SET @materia_pdm_204_id = (SELECT id FROM materias WHERE codigo = 'PDM-204' LIMIT 1);
SET @materia_ads_205_id = (SELECT id FROM materias WHERE codigo = 'ADS-205' LIMIT 1);
SET @materia_dpw_206_id = (SELECT id FROM materias WHERE codigo = 'DPW-206' LIMIT 1);
SET @materia_bdd_207_id = (SELECT id FROM materias WHERE codigo = 'BDD-207' LIMIT 1);
SET @materia_ele_208_id = (SELECT id FROM materias WHERE codigo = 'ELE-208' LIMIT 1);
-- Tercer Año
SET @materia_gmc_301_id = (SELECT id FROM materias WHERE codigo = 'GMC-301' LIMIT 1);
SET @materia_rdc_302_id = (SELECT id FROM materias WHERE codigo = 'RDC-302' LIMIT 1);
SET @materia_dpw_303_id = (SELECT id FROM materias WHERE codigo = 'DPW-303' LIMIT 1);
SET @materia_pdm_304_id = (SELECT id FROM materias WHERE codigo = 'PDM-304' LIMIT 1);
SET @materia_ads_305_id = (SELECT id FROM materias WHERE codigo = 'ADS-305' LIMIT 1);
SET @materia_bdd_306_id = (SELECT id FROM materias WHERE codigo = 'BDD-306' LIMIT 1);
SET @materia_pic_307_id = (SELECT id FROM materias WHERE codigo = 'PIC-307' LIMIT 1);
SET @materia_tmg_308_sis_id = (SELECT id FROM materias WHERE codigo = 'TMG-308' LIMIT 1);

-- ============================================
-- OBTENER IDs DE MATERIAS - ADMINISTRACIÓN DE EMPRESAS
-- ============================================
-- Primer Año
SET @materia_fua_101_id = (SELECT id FROM materias WHERE codigo = 'FUA-101' LIMIT 1);
SET @materia_ing_102_id = (SELECT id FROM materias WHERE codigo = 'ING-102' LIMIT 1);
SET @materia_cga_103_id = (SELECT id FROM materias WHERE codigo = 'CGA-103' LIMIT 1);
SET @materia_maf_104_adm_id = (SELECT id FROM materias WHERE codigo = 'MAF-104' LIMIT 1);
SET @materia_esn_105_id = (SELECT id FROM materias WHERE codigo = 'ESN-105' LIMIT 1);
SET @materia_plt_106_id = (SELECT id FROM materias WHERE codigo = 'PLT-106' LIMIT 1);
SET @materia_ife_107_id = (SELECT id FROM materias WHERE codigo = 'IFE-107' LIMIT 1);
SET @materia_emp_108_id = (SELECT id FROM materias WHERE codigo = 'EMP-108' LIMIT 1);
-- Segundo Año
SET @materia_ora_201_id = (SELECT id FROM materias WHERE codigo = 'ORA-201' LIMIT 1);
SET @materia_idm_202_id = (SELECT id FROM materias WHERE codigo = 'IDM-202' LIMIT 1);
SET @materia_ado_203_id = (SELECT id FROM materias WHERE codigo = 'ADO-203' LIMIT 1);
SET @materia_gth_204_id = (SELECT id FROM materias WHERE codigo = 'GTH-204' LIMIT 1);
SET @materia_adf_205_id = (SELECT id FROM materias WHERE codigo = 'ADF-205' LIMIT 1);
SET @materia_pep_206_id = (SELECT id FROM materias WHERE codigo = 'PEP-206' LIMIT 1);
SET @materia_acp_207_id = (SELECT id FROM materias WHERE codigo = 'ACP-207' LIMIT 1);
SET @materia_emp_208_id = (SELECT id FROM materias WHERE codigo = 'EMP-208' LIMIT 1);
-- Tercer Año
SET @materia_amp_301_id = (SELECT id FROM materias WHERE codigo = 'AMP-301' LIMIT 1);
SET @materia_inm_302_id = (SELECT id FROM materias WHERE codigo = 'INM-302' LIMIT 1);
SET @materia_esm_303_id = (SELECT id FROM materias WHERE codigo = 'ESM-303' LIMIT 1);
SET @materia_adf_304_id = (SELECT id FROM materias WHERE codigo = 'ADF-304' LIMIT 1);
SET @materia_cmi_305_id = (SELECT id FROM materias WHERE codigo = 'CMI-305' LIMIT 1);
SET @materia_gee_306_id = (SELECT id FROM materias WHERE codigo = 'GEE-306' LIMIT 1);
SET @materia_tmg_307_id = (SELECT id FROM materias WHERE codigo = 'TMG-307' LIMIT 1);

-- ============================================
-- INSERTAR PLAN DE ESTUDIOS
-- ============================================

-- CONTADURÍA GENERAL - Primer Año (Periodo 1)
INSERT INTO plan_estudios (carrera_id, periodo_id, materia_id, orden_visualizacion) VALUES
(@carrera_con_id, @periodo_con_1_id, @materia_lsa_101_id, 1),
(@carrera_con_id, @periodo_con_1_id, @materia_int_102_con_id, 2),
(@carrera_con_id, @periodo_con_1_id, @materia_con_103_id, 3),
(@carrera_con_id, @periodo_con_1_id, @materia_maf_104_con_id, 4),
(@carrera_con_id, @periodo_con_1_id, @materia_ico_105_id, 5),
(@carrera_con_id, @periodo_con_1_id, @materia_ega_106_id, 6),
(@carrera_con_id, @periodo_con_1_id, @materia_dcm_107_id, 7),
(@carrera_con_id, @periodo_con_1_id, @materia_esa_108_id, 8),
(@carrera_con_id, @periodo_con_1_id, @materia_adg_109_id, 9);

-- CONTADURÍA GENERAL - Segundo Año (Periodo 2)
INSERT INTO plan_estudios (carrera_id, periodo_id, materia_id, orden_visualizacion) VALUES
(@carrera_con_id, @periodo_con_2_id, @materia_con_201_id, 1),
(@carrera_con_id, @periodo_con_2_id, @materia_coc_202_id, 2),
(@carrera_con_id, @periodo_con_2_id, @materia_cos_203_id, 3),
(@carrera_con_id, @periodo_con_2_id, @materia_cds_204_id, 4),
(@carrera_con_id, @periodo_con_2_id, @materia_cbc_205_id, 5),
(@carrera_con_id, @periodo_con_2_id, @materia_sit_206_id, 6),
(@carrera_con_id, @periodo_con_2_id, @materia_iae_207_id, 7);

-- CONTADURÍA GENERAL - Tercer Año (Periodo 3)
INSERT INTO plan_estudios (carrera_id, periodo_id, materia_id, orden_visualizacion) VALUES
(@carrera_con_id, @periodo_con_3_id, @materia_coa_301_id, 1),
(@carrera_con_id, @periodo_con_3_id, @materia_coc_302_id, 2),
(@carrera_con_id, @periodo_con_3_id, @materia_cog_303_id, 3),
(@carrera_con_id, @periodo_con_3_id, @materia_cep_304_id, 4),
(@carrera_con_id, @periodo_con_3_id, @materia_chs_305_id, 5),
(@carrera_con_id, @periodo_con_3_id, @materia_gci_306_id, 6),
(@carrera_con_id, @periodo_con_3_id, @materia_aef_307_id, 7),
(@carrera_con_id, @periodo_con_3_id, @materia_tmg_308_con_id, 8);

-- SISTEMAS INFORMÁTICOS - Primer Año (Periodo 1)
INSERT INTO plan_estudios (carrera_id, periodo_id, materia_id, orden_visualizacion) VALUES
(@carrera_sis_id, @periodo_sis_1_id, @materia_hsa_101_id, 1),
(@carrera_sis_id, @periodo_sis_1_id, @materia_int_102_sis_id, 2),
(@carrera_sis_id, @periodo_sis_1_id, @materia_mpi_103_id, 3),
(@carrera_sis_id, @periodo_sis_1_id, @materia_prg_104_id, 4),
(@carrera_sis_id, @periodo_sis_1_id, @materia_tso_105_id, 5),
(@carrera_sis_id, @periodo_sis_1_id, @materia_otm_106_id, 6),
(@carrera_sis_id, @periodo_sis_1_id, @materia_dpw_107_id, 7);

-- SISTEMAS INFORMÁTICOS - Segundo Año (Periodo 2)
INSERT INTO plan_estudios (carrera_id, periodo_id, materia_id, orden_visualizacion) VALUES
(@carrera_sis_id, @periodo_sis_2_id, @materia_est_201_id, 1),
(@carrera_sis_id, @periodo_sis_2_id, @materia_prg_202_id, 2),
(@carrera_sis_id, @periodo_sis_2_id, @materia_rdc_203_id, 3),
(@carrera_sis_id, @periodo_sis_2_id, @materia_pdm_204_id, 4),
(@carrera_sis_id, @periodo_sis_2_id, @materia_ads_205_id, 5),
(@carrera_sis_id, @periodo_sis_2_id, @materia_dpw_206_id, 6),
(@carrera_sis_id, @periodo_sis_2_id, @materia_bdd_207_id, 7),
(@carrera_sis_id, @periodo_sis_2_id, @materia_ele_208_id, 8);

-- SISTEMAS INFORMÁTICOS - Tercer Año (Periodo 3)
INSERT INTO plan_estudios (carrera_id, periodo_id, materia_id, orden_visualizacion) VALUES
(@carrera_sis_id, @periodo_sis_3_id, @materia_gmc_301_id, 1),
(@carrera_sis_id, @periodo_sis_3_id, @materia_rdc_302_id, 2),
(@carrera_sis_id, @periodo_sis_3_id, @materia_dpw_303_id, 3),
(@carrera_sis_id, @periodo_sis_3_id, @materia_pdm_304_id, 4),
(@carrera_sis_id, @periodo_sis_3_id, @materia_ads_305_id, 5),
(@carrera_sis_id, @periodo_sis_3_id, @materia_bdd_306_id, 6),
(@carrera_sis_id, @periodo_sis_3_id, @materia_pic_307_id, 7),
(@carrera_sis_id, @periodo_sis_3_id, @materia_tmg_308_sis_id, 8);

-- ADMINISTRACIÓN DE EMPRESAS - Primer Año (Periodo 1)
INSERT INTO plan_estudios (carrera_id, periodo_id, materia_id, orden_visualizacion) VALUES
(@carrera_adm_id, @periodo_adm_1_id, @materia_fua_101_id, 1),
(@carrera_adm_id, @periodo_adm_1_id, @materia_ing_102_id, 2),
(@carrera_adm_id, @periodo_adm_1_id, @materia_cga_103_id, 3),
(@carrera_adm_id, @periodo_adm_1_id, @materia_maf_104_adm_id, 4),
(@carrera_adm_id, @periodo_adm_1_id, @materia_esn_105_id, 5),
(@carrera_adm_id, @periodo_adm_1_id, @materia_plt_106_id, 6),
(@carrera_adm_id, @periodo_adm_1_id, @materia_ife_107_id, 7),
(@carrera_adm_id, @periodo_adm_1_id, @materia_emp_108_id, 8);

-- ADMINISTRACIÓN DE EMPRESAS - Segundo Año (Periodo 2)
INSERT INTO plan_estudios (carrera_id, periodo_id, materia_id, orden_visualizacion) VALUES
(@carrera_adm_id, @periodo_adm_2_id, @materia_ora_201_id, 1),
(@carrera_adm_id, @periodo_adm_2_id, @materia_idm_202_id, 2),
(@carrera_adm_id, @periodo_adm_2_id, @materia_ado_203_id, 3),
(@carrera_adm_id, @periodo_adm_2_id, @materia_gth_204_id, 4),
(@carrera_adm_id, @periodo_adm_2_id, @materia_adf_205_id, 5),
(@carrera_adm_id, @periodo_adm_2_id, @materia_pep_206_id, 6),
(@carrera_adm_id, @periodo_adm_2_id, @materia_acp_207_id, 7),
(@carrera_adm_id, @periodo_adm_2_id, @materia_emp_208_id, 8);

-- ADMINISTRACIÓN DE EMPRESAS - Tercer Año (Periodo 3)
INSERT INTO plan_estudios (carrera_id, periodo_id, materia_id, orden_visualizacion) VALUES
(@carrera_adm_id, @periodo_adm_3_id, @materia_amp_301_id, 1),
(@carrera_adm_id, @periodo_adm_3_id, @materia_inm_302_id, 2),
(@carrera_adm_id, @periodo_adm_3_id, @materia_esm_303_id, 3),
(@carrera_adm_id, @periodo_adm_3_id, @materia_adf_304_id, 4),
(@carrera_adm_id, @periodo_adm_3_id, @materia_cmi_305_id, 5),
(@carrera_adm_id, @periodo_adm_3_id, @materia_gee_306_id, 6),
(@carrera_adm_id, @periodo_adm_3_id, @materia_tmg_307_id, 7);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
