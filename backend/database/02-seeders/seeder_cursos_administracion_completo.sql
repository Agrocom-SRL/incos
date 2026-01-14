-- ============================================
-- SEEDER: cursos - ADMINISTRACIÓN DE EMPRESAS COMPLETO CON COLORES
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Cursos de ADMINISTRACIÓN DE EMPRESAS - TODOS LOS PARALELOS
-- ACTUALIZADO: Incluye campo color_hex para visualización en horarios
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
-- INSERTAR CURSOS - PRIMER AÑO CON COLORES
-- ============================================
-- Colores basados en análisis del archivo Excel HORARIOS__2025_21_FEBREROokultimo.xlsx
-- Mapeo de colores según la materia:
-- FUA-101 (Fundamentos): #B2A1C7
-- CGA-102 (Contabilidad General): #FFFF00
-- MAF-103 (Matemática Financiera): #00FF00
-- ESN-104 (Estadística): #00B0F0
-- PLT-105 (Práctica Laboral): #9FC5E8
-- IFE-106 (Informática Empresarial): #76923C
-- INT-107 (Inglés Técnico): #B2F0FC

-- PARALELO A - TARDE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
('ADM-1A-TARDE-FUA101', @paralelo_adm_1a_id, @asig_fua_101, 35, 10, '#B2A1C7'),
('ADM-1A-TARDE-CGA102', @paralelo_adm_1a_id, @asig_cga_102, 35, 10, '#FFFF00'),
('ADM-1A-TARDE-MAF103', @paralelo_adm_1a_id, @asig_maf_103, 35, 10, '#00FF00'),
('ADM-1A-TARDE-ESN104', @paralelo_adm_1a_id, @asig_esn_104, 35, 10, '#00B0F0'),
('ADM-1A-TARDE-PLT105', @paralelo_adm_1a_id, @asig_plt_105, 35, 10, '#9FC5E8'),
('ADM-1A-TARDE-IFE106', @paralelo_adm_1a_id, @asig_ife_106, 35, 10, '#76923C'),
('ADM-1A-TARDE-INT107', @paralelo_adm_1a_id, @asig_int_107, 35, 10, '#B2F0FC');

-- PARALELO B - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
('ADM-1B-NOCHE-FUA101', @paralelo_adm_1b_id, @asig_fua_101, 35, 10, '#B2A1C7'),
('ADM-1B-NOCHE-CGA102', @paralelo_adm_1b_id, @asig_cga_102, 35, 10, '#FFFF00'),
('ADM-1B-NOCHE-MAF103', @paralelo_adm_1b_id, @asig_maf_103, 35, 10, '#00FF00'),
('ADM-1B-NOCHE-ESN104', @paralelo_adm_1b_id, @asig_esn_104, 35, 10, '#00B0F0'),
('ADM-1B-NOCHE-PLT105', @paralelo_adm_1b_id, @asig_plt_105, 35, 10, '#9FC5E8'),
('ADM-1B-NOCHE-IFE106', @paralelo_adm_1b_id, @asig_ife_106, 35, 10, '#76923C'),
('ADM-1B-NOCHE-INT107', @paralelo_adm_1b_id, @asig_int_107, 35, 10, '#B2F0FC');

-- ============================================
-- INSERTAR CURSOS - SEGUNDO AÑO CON COLORES
-- ============================================
-- Mapeo de colores según la materia:
-- ORA-201 (Organización Administración): #B2A1C7
-- IEM-202 (Investigación Mercado): #46FB2D
-- ADO-203 (Administración Operaciones): #00B050
-- GTH-204 (Gestión Talento Humano): #DBE5F1
-- ADF-205 (Administración Financiera I): #548DD4
-- PEP-206 (Preparación Evaluación Proyectos): #CC66FF
-- ACP-207 (Administración Costos): #E36C09
-- EMP-208 (Economía Empresa): #FFE79B

-- PARALELO A - TARDE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
('ADM-2A-TARDE-ORA201', @paralelo_adm_2a_id, @asig_ora_201, 35, 10, '#B2A1C7'),
('ADM-2A-TARDE-IEM202', @paralelo_adm_2a_id, @asig_iem_202, 35, 10, '#46FB2D'),
('ADM-2A-TARDE-ADO203', @paralelo_adm_2a_id, @asig_ado_203, 35, 10, '#00B050'),
('ADM-2A-TARDE-GTH204', @paralelo_adm_2a_id, @asig_gth_204, 35, 10, '#DBE5F1'),
('ADM-2A-TARDE-ADF205', @paralelo_adm_2a_id, @asig_adf_205, 35, 10, '#548DD4'),
('ADM-2A-TARDE-PEP206', @paralelo_adm_2a_id, @asig_pep_206, 35, 10, '#CC66FF'),
('ADM-2A-TARDE-ACP207', @paralelo_adm_2a_id, @asig_acp_207, 35, 10, '#E36C09'),
('ADM-2A-TARDE-EMP208', @paralelo_adm_2a_id, @asig_emp_208, 35, 10, '#FFE79B');

-- PARALELO B - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
('ADM-2B-NOCHE-ORA201', @paralelo_adm_2b_id, @asig_ora_201, 35, 10, '#B2A1C7'),
('ADM-2B-NOCHE-IEM202', @paralelo_adm_2b_id, @asig_iem_202, 35, 10, '#46FB2D'),
('ADM-2B-NOCHE-ADO203', @paralelo_adm_2b_id, @asig_ado_203, 35, 10, '#00B050'),
('ADM-2B-NOCHE-GTH204', @paralelo_adm_2b_id, @asig_gth_204, 35, 10, '#DBE5F1'),
('ADM-2B-NOCHE-ADF205', @paralelo_adm_2b_id, @asig_adf_205, 35, 10, '#548DD4'),
('ADM-2B-NOCHE-PEP206', @paralelo_adm_2b_id, @asig_pep_206, 35, 10, '#CC66FF'),
('ADM-2B-NOCHE-ACP207', @paralelo_adm_2b_id, @asig_acp_207, 35, 10, '#E36C09'),
('ADM-2B-NOCHE-EMP208', @paralelo_adm_2b_id, @asig_emp_208, 35, 10, '#FFE79B');

-- ============================================
-- INSERTAR CURSOS - TERCER AÑO CON COLORES
-- ============================================
-- Mapeo de colores según la materia:
-- AMP-301 (Administración MIPYME): #B2A1C7
-- IMN-302 (Incubación Modelos Negocios): #FF99FF
-- ADF-303 (Administración Financiera II): #548DD4
-- TMG-304 (Taller Modalidad Graduación): #C2D69B
-- EMP-305 (Emprendimiento Productivo): #FFE79B
-- CMI-306 (Comercio Internacional): #00FFFF
-- GEE-307 (Gestión Estratégica): #FFC000

-- PARALELO A - NOCHE
INSERT INTO cursos (codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
('ADM-3A-NOCHE-AMP301', @paralelo_adm_3a_id, @asig_amp_301, 35, 10, '#B2A1C7'),
('ADM-3A-NOCHE-IMN302', @paralelo_adm_3a_id, @asig_imn_302, 35, 10, '#FF99FF'),
('ADM-3A-NOCHE-ADF303', @paralelo_adm_3a_id, @asig_adf_303, 35, 10, '#548DD4'),
('ADM-3A-NOCHE-TMG304', @paralelo_adm_3a_id, @asig_tmg_304, 35, 10, '#C2D69B'),
('ADM-3A-NOCHE-EMP305', @paralelo_adm_3a_id, @asig_emp_305, 35, 10, '#FFE79B'),
('ADM-3A-NOCHE-CMI306', @paralelo_adm_3a_id, @asig_cmi_306, 35, 10, '#00FFFF'),
('ADM-3A-NOCHE-GEE307', @paralelo_adm_3a_id, @asig_gee_307, 35, 10, '#FFC000');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE CURSOS CREADOS CON COLORES
-- ============================================
-- PRIMER AÑO:
--   Paralelo A (TARDE): 7 cursos con colores
--   Paralelo B (NOCHE): 7 cursos con colores
--   SUBTOTAL: 14 cursos
--
-- SEGUNDO AÑO:
--   Paralelo A (TARDE): 8 cursos con colores
--   Paralelo B (NOCHE): 8 cursos con colores
--   SUBTOTAL: 16 cursos
--
-- TERCER AÑO:
--   Paralelo A (NOCHE): 7 cursos con colores
--   SUBTOTAL: 7 cursos
--
-- TOTAL GENERAL: 37 cursos de Administración de Empresas
--
-- COLORES UTILIZADOS (26 únicos para Administración):
-- #00B050 - Verde oscuro (Administración de Operaciones, Inglés Técnico)
-- #00B0F0 - Azul claro (Estadística para los Negocios)
-- #00FF00 - Verde brillante (Matemática Financiera)
-- #00FFFF - Cyan (Comercio Internacional)
-- #46FB2D - Verde lima (Investigación de Mercado)
-- #548DD4 - Azul medio (Administración Financiera)
-- #76923C - Verde oliva (Informática Empresarial)
-- #9FC5E8 - Azul suave (Práctica Laboral y Tributaria)
-- #B2A1C7 - Púrpura suave (Fundamentos, Organización, Administración MIPYME)
-- #B2F0FC - Celeste claro (Inglés Técnico)
-- #C2D69B - Verde pastel (Taller de Modalidad de Graduación)
-- #CC66FF - Púrpura brillante (Preparación y Evaluación de Proyectos)
-- #DBE5F1 - Azul muy claro (Gestión del Talento Humano)
-- #E36C09 - Naranja (Administración de Costos y Presupuesto)
-- #FF99FF - Rosa (Incubación y Modelos de Negocios)
-- #FFC000 - Naranja dorado (Gestión Estratégica)
-- #FFE79B - Amarillo suave (Economía de la Empresa, Emprendimiento)
-- #FFFF00 - Amarillo brillante (Contabilidad General)
-- ============================================
-- FIN DEL SEEDER
-- ============================================