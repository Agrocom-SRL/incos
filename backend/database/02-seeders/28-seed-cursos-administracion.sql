-- ============================================
-- SEEDER: cursos - ADMINISTRACIÓN DE EMPRESAS
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Cursos de ADMINISTRACIÓN DE EMPRESAS - TODOS LOS PARALELOS
-- ============================================
-- Orden: Carrera 2 (ADM-EMP) → Plan 2 → Periodos 1-3 → Asignaturas → Paralelos
-- IDs fijos: 31-67 (ADM-EMP)
-- Paralelos: 5 (1A), 6 (1B), 7 (2A), 8 (2B), 9 (3A)
-- Asignaturas_plan: Periodo 1 (24-30), Periodo 2 (31-38), Periodo 3 (39-45)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos;

-- ============================================
-- INSERTAR CURSOS - PRIMER AÑO (Periodo 1)
-- Asignaturas_plan: 24-30
-- ============================================

-- PARALELO A (paralelo_id = 5) - TARDE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(31, 'ADM-1A-TARDE-FUA101', 5, 24, 35, 10, '#B2A1C7'),  -- FUA-101: FUNDAMENTO DE LA ADMINISTRACIÓN
(32, 'ADM-1A-TARDE-CGA102', 5, 25, 35, 10, '#FFFF00'),  -- CGA-102: CONTABILIDAD GENERAL PARA ADMINISTRACIÓNES
(33, 'ADM-1A-TARDE-MAF103', 5, 26, 35, 10, '#00FF00'),  -- MAF-103: MATEMÁTICA FINANCIERA
(34, 'ADM-1A-TARDE-ESN104', 5, 27, 35, 10, '#00B0F0'),  -- ESN-104: ESTADÍSTICA PARA LOS NEGOCIOS
(35, 'ADM-1A-TARDE-PLT105', 5, 28, 35, 10, '#9FC5E8'),  -- PLT-105: PRÁCTICA LABORAL Y TRIBUTARIA
(36, 'ADM-1A-TARDE-IFE106', 5, 29, 35, 10, '#76923C'),  -- IFE-106: INFORMÁTICA EMPRESARIAL
(37, 'ADM-1A-TARDE-INT107', 5, 30, 35, 10, '#B2F0FC');  -- INT-107: INGLÉS TÉCNICO

-- PARALELO B (paralelo_id = 6) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(38, 'ADM-1B-NOCHE-FUA101', 6, 24, 35, 10, '#B2A1C7'),  -- FUA-101: FUNDAMENTO DE LA ADMINISTRACIÓN
(39, 'ADM-1B-NOCHE-CGA102', 6, 25, 35, 10, '#FFFF00'),  -- CGA-102: CONTABILIDAD GENERAL PARA ADMINISTRACIÓNES
(40, 'ADM-1B-NOCHE-MAF103', 6, 26, 35, 10, '#00FF00'),  -- MAF-103: MATEMÁTICA FINANCIERA
(41, 'ADM-1B-NOCHE-ESN104', 6, 27, 35, 10, '#00B0F0'),  -- ESN-104: ESTADÍSTICA PARA LOS NEGOCIOS
(42, 'ADM-1B-NOCHE-PLT105', 6, 28, 35, 10, '#9FC5E8'),  -- PLT-105: PRÁCTICA LABORAL Y TRIBUTARIA
(43, 'ADM-1B-NOCHE-IFE106', 6, 29, 35, 10, '#76923C'),  -- IFE-106: INFORMÁTICA EMPRESARIAL
(44, 'ADM-1B-NOCHE-INT107', 6, 30, 35, 10, '#B2F0FC');  -- INT-107: INGLÉS TÉCNICO

-- ============================================
-- INSERTAR CURSOS - SEGUNDO AÑO (Periodo 2)
-- Asignaturas_plan: 31-38
-- ============================================

-- PARALELO A (paralelo_id = 7) - TARDE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(45, 'ADM-2A-TARDE-ORA201', 7, 31, 35, 10, '#B2A1C7'),  -- ORA-201: ORGANIZACIÓN DE LA ADMINISTRACIÓN
(46, 'ADM-2A-TARDE-IEM202', 7, 32, 35, 10, '#46FB2D'),  -- IEM-202: INVESTIGACIÓN Y ESTRATEGIA DE MERCADO
(47, 'ADM-2A-TARDE-ADO203', 7, 33, 35, 10, '#00B050'),  -- ADO-203: ADMINISTRACIÓN DE OPERACIONES
(48, 'ADM-2A-TARDE-GTH204', 7, 34, 35, 10, '#DBE5F1'), -- GTH-204: GESTIÓN DEL TALENTO HUMANO
(49, 'ADM-2A-TARDE-ADF205', 7, 35, 35, 10, '#548DD4'),  -- ADF-205: ADMINISTRACIÓN FINANCIERA I
(50, 'ADM-2A-TARDE-PEP206', 7, 36, 35, 10, '#CC66FF'), -- PEP-206: PREPARACIÓN Y EVALUACIÓN DE PROYECTOS
(51, 'ADM-2A-TARDE-ACP207', 7, 37, 35, 10, '#E36C09'), -- ACP-207: ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS
(52, 'ADM-2A-TARDE-EMP208', 7, 38, 35, 10, '#FFE79B'); -- EMP-208: ECONOMÍA DE LA EMPRESA

-- PARALELO B (paralelo_id = 8) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(53, 'ADM-2B-NOCHE-ORA201', 8, 31, 35, 10, '#B2A1C7'),  -- ORA-201: ORGANIZACIÓN DE LA ADMINISTRACIÓN
(54, 'ADM-2B-NOCHE-IEM202', 8, 32, 35, 10, '#46FB2D'),  -- IEM-202: INVESTIGACIÓN Y ESTRATEGIA DE MERCADO
(55, 'ADM-2B-NOCHE-ADO203', 8, 33, 35, 10, '#00B050'), -- ADO-203: ADMINISTRACIÓN DE OPERACIONES
(56, 'ADM-2B-NOCHE-GTH204', 8, 34, 35, 10, '#DBE5F1'), -- GTH-204: GESTIÓN DEL TALENTO HUMANO
(57, 'ADM-2B-NOCHE-ADF205', 8, 35, 35, 10, '#548DD4'),  -- ADF-205: ADMINISTRACIÓN FINANCIERA I
(58, 'ADM-2B-NOCHE-PEP206', 8, 36, 35, 10, '#CC66FF'), -- PEP-206: PREPARACIÓN Y EVALUACIÓN DE PROYECTOS
(59, 'ADM-2B-NOCHE-ACP207', 8, 37, 35, 10, '#E36C09'), -- ACP-207: ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS
(60, 'ADM-2B-NOCHE-EMP208', 8, 38, 35, 10, '#FFE79B'); -- EMP-208: ECONOMÍA DE LA EMPRESA

-- ============================================
-- INSERTAR CURSOS - TERCER AÑO (Periodo 3)
-- Asignaturas_plan: 39-45
-- ============================================

-- PARALELO A (paralelo_id = 9) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(61, 'ADM-3A-NOCHE-AMP301', 9, 39, 35, 10, '#B2A1C7'),  -- AMP-301: ADMINISTRACIÓN DE LA MICRO Y PEQUEÑA Y MEDIANA EMPRESA
(62, 'ADM-3A-NOCHE-IMN302', 9, 40, 35, 10, '#FF99FF'), -- IMN-302: INCUBACIÓN Y MODELOS DE NEGOCIOS
(63, 'ADM-3A-NOCHE-ADF303', 9, 41, 35, 10, '#548DD4'), -- ADF-303: ADMINISTRACIÓN FINANCIERA II
(64, 'ADM-3A-NOCHE-TMG304', 9, 42, 35, 10, '#C2D69B'), -- TMG-304: TALLER DE MODALIDAD DE GRADO
(65, 'ADM-3A-NOCHE-EMP305', 9, 43, 35, 10, '#FFE79B'), -- EMP-305: EMPRENDIMIENTO PRODUCTIVO
(66, 'ADM-3A-NOCHE-CMI306', 9, 44, 35, 10, '#00FFFF'), -- CMI-306: COMERCIO INTERNACIONAL
(67, 'ADM-3A-NOCHE-GEE307', 9, 45, 35, 10, '#FFC000'); -- GEE-307: GESTIÓN ESTRATÉGICA

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE CURSOS CREADOS
-- ============================================
-- PRIMER AÑO (Periodo 1):
--   Paralelo A (TARDE): 7 cursos (IDs 31-37)
--   Paralelo B (NOCHE): 7 cursos (IDs 38-44)
--   SUBTOTAL: 14 cursos
--
-- SEGUNDO AÑO (Periodo 2):
--   Paralelo A (TARDE): 8 cursos (IDs 45-52)
--   Paralelo B (NOCHE): 8 cursos (IDs 53-60)
--   SUBTOTAL: 16 cursos
--
-- TERCER AÑO (Periodo 3):
--   Paralelo A (NOCHE): 7 cursos (IDs 61-67)
--   SUBTOTAL: 7 cursos
--
-- TOTAL GENERAL: 37 cursos de Administración de Empresas
-- ============================================
-- FIN DEL SEEDER
-- ============================================
