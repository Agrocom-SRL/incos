-- ============================================
-- SEEDER: prerrequisitos
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Prerrequisitos entre materias según Plan de Estudios 2018
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE prerrequisitos;

-- ============================================
-- INSERTAR PRERREQUISITOS
-- ============================================

-- Obtener IDs de materias
-- CONTADURÍA GENERAL
SET @materia_con_103_id = (SELECT id FROM materias WHERE codigo = 'CON-103' LIMIT 1);
SET @materia_con_201_id = (SELECT id FROM materias WHERE codigo = 'CON-201' LIMIT 1);
SET @materia_adg_109_id = (SELECT id FROM materias WHERE codigo = 'ADG-109' LIMIT 1);
SET @materia_iae_207_id = (SELECT id FROM materias WHERE codigo = 'IAE-207' LIMIT 1);
SET @materia_coc_202_id = (SELECT id FROM materias WHERE codigo = 'COC-202' LIMIT 1);
SET @materia_coc_302_id = (SELECT id FROM materias WHERE codigo = 'COC-302' LIMIT 1);
SET @materia_tmg_308_con_id = (SELECT id FROM materias WHERE codigo = 'TMG-308' LIMIT 1);

-- SISTEMAS INFORMÁTICOS
SET @materia_mpi_103_id = (SELECT id FROM materias WHERE codigo = 'MPI-103' LIMIT 1);
SET @materia_est_201_id = (SELECT id FROM materias WHERE codigo = 'EST-201' LIMIT 1);
SET @materia_prg_104_id = (SELECT id FROM materias WHERE codigo = 'PRG-104' LIMIT 1);
SET @materia_prg_202_id = (SELECT id FROM materias WHERE codigo = 'PRG-202' LIMIT 1);
SET @materia_dpw_107_id = (SELECT id FROM materias WHERE codigo = 'DPW-107' LIMIT 1);
SET @materia_dpw_206_id = (SELECT id FROM materias WHERE codigo = 'DPW-206' LIMIT 1);
SET @materia_dpw_303_id = (SELECT id FROM materias WHERE codigo = 'DPW-303' LIMIT 1);
SET @materia_rdc_203_id = (SELECT id FROM materias WHERE codigo = 'RDC-203' LIMIT 1);
SET @materia_rdc_302_id = (SELECT id FROM materias WHERE codigo = 'RDC-302' LIMIT 1);
SET @materia_pdm_204_id = (SELECT id FROM materias WHERE codigo = 'PDM-204' LIMIT 1);
SET @materia_pdm_304_id = (SELECT id FROM materias WHERE codigo = 'PDM-304' LIMIT 1);
SET @materia_ads_205_id = (SELECT id FROM materias WHERE codigo = 'ADS-205' LIMIT 1);
SET @materia_ads_305_id = (SELECT id FROM materias WHERE codigo = 'ADS-305' LIMIT 1);
SET @materia_bdd_207_id = (SELECT id FROM materias WHERE codigo = 'BDD-207' LIMIT 1);
SET @materia_bdd_306_id = (SELECT id FROM materias WHERE codigo = 'BDD-306' LIMIT 1);

-- ADMINISTRACIÓN DE EMPRESAS
SET @materia_fua_101_id = (SELECT id FROM materias WHERE codigo = 'FUA-101' LIMIT 1);
SET @materia_ora_201_id = (SELECT id FROM materias WHERE codigo = 'ORA-201' LIMIT 1);
SET @materia_maf_104_adm_id = (SELECT id FROM materias WHERE codigo = 'MAF-104' LIMIT 1);
SET @materia_adf_205_id = (SELECT id FROM materias WHERE codigo = 'ADF-205' LIMIT 1);
SET @materia_cga_103_id = (SELECT id FROM materias WHERE codigo = 'CGA-103' LIMIT 1);
SET @materia_acp_207_id = (SELECT id FROM materias WHERE codigo = 'ACP-207' LIMIT 1);
SET @materia_pep_206_id = (SELECT id FROM materias WHERE codigo = 'PEP-206' LIMIT 1);
SET @materia_inm_302_id = (SELECT id FROM materias WHERE codigo = 'INM-302' LIMIT 1);
SET @materia_idm_202_id = (SELECT id FROM materias WHERE codigo = 'IDM-202' LIMIT 1);
SET @materia_esm_303_id = (SELECT id FROM materias WHERE codigo = 'ESM-303' LIMIT 1);
SET @materia_adf_304_id = (SELECT id FROM materias WHERE codigo = 'ADF-304' LIMIT 1);

-- CONTADURÍA GENERAL
-- Contabilidad II requiere Contabilidad I
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_con_201_id, @materia_con_103_id);

-- Investigación Aplicada y Emprendimiento requiere Administración General
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_iae_207_id, @materia_adg_109_id);

-- Contabilidad de Costos II requiere Contabilidad de Costos I
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_coc_302_id, @materia_coc_202_id);

-- Taller de Modalidad de Graduación requiere Investigación Aplicada y Emprendimiento
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_tmg_308_con_id, @materia_iae_207_id);

-- SISTEMAS INFORMÁTICOS
-- Estadística requiere Matemática para la Informática
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_est_201_id, @materia_mpi_103_id);

-- Programación II requiere Programación I
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_prg_202_id, @materia_prg_104_id);

-- Diseño y Programación Web II requiere Diseño y Programación Web I
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_dpw_206_id, @materia_dpw_107_id);

-- Redes de Computadoras II requiere Redes de Computadoras I
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_rdc_302_id, @materia_rdc_203_id);

-- Diseño y Programación Web III requiere Diseño y Programación Web II
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_dpw_303_id, @materia_dpw_206_id);

-- Programación Móvil II requiere Programación Móvil I
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_pdm_304_id, @materia_pdm_204_id);

-- Análisis y Diseño de Sistemas II requiere Análisis y Diseño de Sistemas I
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_ads_305_id, @materia_ads_205_id);

-- Base de Datos II requiere Base de Datos I
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_bdd_306_id, @materia_bdd_207_id);

-- ADMINISTRACIÓN DE EMPRESAS
-- Organización de la Administración requiere Fundamentos de Administración
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_ora_201_id, @materia_fua_101_id);

-- Administración Financiera I requiere Matemática Financiera
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_adf_205_id, @materia_maf_104_adm_id);

-- Administración de Costos y Presupuestos requiere Contabilidad General para Administraciones
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_acp_207_id, @materia_cga_103_id);

-- Incubación y Modelos de Negocios requiere Preparación y Evaluación de Proyectos
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_inm_302_id, @materia_pep_206_id);

-- Estrategias de Mercadotecnia requiere Investigación de Mercado
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_esm_303_id, @materia_idm_202_id);

-- Administración Financiera II requiere Administración Financiera I
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(@materia_adf_304_id, @materia_adf_205_id);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
