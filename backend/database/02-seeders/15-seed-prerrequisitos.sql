-- ============================================
-- SEEDER: prerrequisitos
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Prerrequisitos entre asignaturas según Plan de Estudios RM No. 0210/2023
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE prerrequisitos;

-- ============================================
-- OBTENER IDs DE PLANES DE ESTUDIO
-- ============================================
SET @plan_sis_id = (SELECT id FROM planes_estudios WHERE carrera_id = (SELECT id FROM carreras WHERE codigo = 'SIS-INF' LIMIT 1) LIMIT 1);
SET @plan_adm_id = (SELECT id FROM planes_estudios WHERE carrera_id = (SELECT id FROM carreras WHERE codigo = 'ADM-EMP' LIMIT 1) LIMIT 1);
SET @plan_con_id = (SELECT id FROM planes_estudios WHERE carrera_id = (SELECT id FROM carreras WHERE codigo = 'CON-GEN' LIMIT 1) LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS PLAN - CONTADURÍA GENERAL
-- ============================================
SET @asig_con_101_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_con_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'CON-101' LIMIT 1) LIMIT 1);
SET @asig_con_201_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_con_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'CON-201' LIMIT 1) LIMIT 1);
SET @asig_coc_202_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_con_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'COC-202' LIMIT 1) LIMIT 1);
SET @asig_coc_302_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_con_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'COC-302' LIMIT 1) LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS PLAN - SISTEMAS INFORMÁTICOS
-- ============================================
SET @asig_prg_102_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'PRG-102' LIMIT 1) LIMIT 1);
SET @asig_prg_202_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'PRG-202' LIMIT 1) LIMIT 1);
SET @asig_dpw_107_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'DPW-107' LIMIT 1) LIMIT 1);
SET @asig_dpw_207_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'DPW-207' LIMIT 1) LIMIT 1);
SET @asig_dpw_302_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'DPW-302' LIMIT 1) LIMIT 1);
SET @asig_rdc_204_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'RDC-204' LIMIT 1) LIMIT 1);
SET @asig_rdc_304_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'RDC-304' LIMIT 1) LIMIT 1);
SET @asig_pdm_205_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'PDM-205' LIMIT 1) LIMIT 1);
SET @asig_pdm_307_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'PDM-307' LIMIT 1) LIMIT 1);
SET @asig_ads_206_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'ADS-206' LIMIT 1) LIMIT 1);
SET @asig_ads_306_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'ADS-306' LIMIT 1) LIMIT 1);
SET @asig_bdd_208_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'BDD-208' LIMIT 1) LIMIT 1);
SET @asig_bdd_308_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_sis_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'BDD-308' LIMIT 1) LIMIT 1);

-- ============================================
-- OBTENER IDs DE ASIGNATURAS PLAN - ADMINISTRACIÓN DE EMPRESAS
-- ============================================
SET @asig_fua_101_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_adm_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'FUA-101' LIMIT 1) LIMIT 1);
SET @asig_ora_201_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_adm_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'ORA-201' LIMIT 1) LIMIT 1);
SET @asig_maf_103_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_adm_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'MAF-103' LIMIT 1) LIMIT 1);
SET @asig_adf_205_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_adm_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'ADF-205' LIMIT 1) LIMIT 1);
SET @asig_adf_303_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_adm_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'ADF-303' LIMIT 1) LIMIT 1);
SET @asig_cga_102_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_adm_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'CGA-102' LIMIT 1) LIMIT 1);
SET @asig_acp_207_id = (SELECT id FROM asignaturas_plan WHERE plan_estudio_id = @plan_adm_id AND materia_id = (SELECT id FROM materias WHERE sigla = 'ACP-207' LIMIT 1) LIMIT 1);

-- ============================================
-- INSERTAR PRERREQUISITOS
-- ============================================

-- CONTADURÍA GENERAL
-- Contabilidad II requiere Contabilidad I
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_con_id, @asig_con_201_id, @asig_con_101_id);

-- Contabilidad de Costos II requiere Contabilidad de Costos I
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_con_id, @asig_coc_302_id, @asig_coc_202_id);

-- SISTEMAS INFORMÁTICOS
-- Programación II requiere Programación I
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_sis_id, @asig_prg_202_id, @asig_prg_102_id);

-- Diseño y Programación Web II requiere Diseño y Programación Web I
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_sis_id, @asig_dpw_207_id, @asig_dpw_107_id);

-- Diseño y Programación Web III requiere Diseño y Programación Web II
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_sis_id, @asig_dpw_302_id, @asig_dpw_207_id);

-- Redes de Computadoras II requiere Redes de Computadoras I
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_sis_id, @asig_rdc_304_id, @asig_rdc_204_id);

-- Programación para Dispositivos Móviles II requiere Programación para Dispositivos Móviles I
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_sis_id, @asig_pdm_307_id, @asig_pdm_205_id);

-- Análisis y Diseño de Sistemas II requiere Análisis y Diseño de Sistemas I
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_sis_id, @asig_ads_306_id, @asig_ads_206_id);

-- Base de Datos II requiere Base de Datos I
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_sis_id, @asig_bdd_308_id, @asig_bdd_208_id);

-- ADMINISTRACIÓN DE EMPRESAS
-- Administración Financiera I requiere Matemática Financiera
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_adm_id, @asig_adf_205_id, @asig_maf_103_id);

-- Administración de Costos y Presupuestos requiere Contabilidad General para Administraciones
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_adm_id, @asig_acp_207_id, @asig_cga_102_id);

-- Administración Financiera II requiere Administración Financiera I
INSERT INTO prerrequisitos (plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(@plan_adm_id, @asig_adf_303_id, @asig_adf_205_id);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
