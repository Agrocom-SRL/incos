-- ============================================
-- SEEDER: cursos - ADMINISTRACIÓN DE EMPRESAS
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Cursos de ADMINISTRACIÓN DE EMPRESAS - TODOS LOS PARALELOS
-- ============================================
-- Orden: Carrera 2 (ADM-EMP) → Plan 2 → Periodos 1-3 → Asignaturas → Paralelos
-- IDs fijos: 31-74 (ADM-EMP)
-- Paralelos: 5 (1A), 6 (1B), 7 (1C), 8 (2A), 9 (2B), 10 (3A)
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

-- PARALELO C (paralelo_id = 7) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(45, 'ADM-1C-NOCHE-FUA101', 7, 24, 35, 10, '#B2A1C7'),  -- FUA-101: FUNDAMENTO DE LA ADMINISTRACIÓN
(46, 'ADM-1C-NOCHE-CGA102', 7, 25, 35, 10, '#FFFF00'),  -- CGA-102: CONTABILIDAD GENERAL PARA ADMINISTRACIÓNES
(47, 'ADM-1C-NOCHE-MAF103', 7, 26, 35, 10, '#00FF00'),  -- MAF-103: MATEMÁTICA FINANCIERA
(48, 'ADM-1C-NOCHE-ESN104', 7, 27, 35, 10, '#00B0F0'),  -- ESN-104: ESTADÍSTICA PARA LOS NEGOCIOS
(49, 'ADM-1C-NOCHE-PLT105', 7, 28, 35, 10, '#9FC5E8'),  -- PLT-105: PRÁCTICA LABORAL Y TRIBUTARIA
(50, 'ADM-1C-NOCHE-IFE106', 7, 29, 35, 10, '#76923C'),  -- IFE-106: INFORMÁTICA EMPRESARIAL
(51, 'ADM-1C-NOCHE-INT107', 7, 30, 35, 10, '#B2F0FC');  -- INT-107: INGLÉS TÉCNICO

-- ============================================
-- INSERTAR CURSOS - SEGUNDO AÑO (Periodo 2)
-- Asignaturas_plan: 31-38
-- ============================================

-- PARALELO A (paralelo_id = 8) - TARDE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(52, 'ADM-2A-TARDE-ORA201', 8, 31, 35, 10, '#B2A1C7'),  -- ORA-201: ORGANIZACIÓN DE LA ADMINISTRACIÓN
(53, 'ADM-2A-TARDE-IEM202', 8, 32, 35, 10, '#46FB2D'),  -- IEM-202: INVESTIGACIÓN Y ESTRATEGIA DE MERCADO
(54, 'ADM-2A-TARDE-ADO203', 8, 33, 35, 10, '#00B050'),  -- ADO-203: ADMINISTRACIÓN DE OPERACIONES
(55, 'ADM-2A-TARDE-GTH204', 8, 34, 35, 10, '#DBE5F1'), -- GTH-204: GESTIÓN DEL TALENTO HUMANO
(56, 'ADM-2A-TARDE-ADF205', 8, 35, 35, 10, '#548DD4'),  -- ADF-205: ADMINISTRACIÓN FINANCIERA I
(57, 'ADM-2A-TARDE-PEP206', 8, 36, 35, 10, '#CC66FF'), -- PEP-206: PREPARACIÓN Y EVALUACIÓN DE PROYECTOS
(58, 'ADM-2A-TARDE-ACP207', 8, 37, 35, 10, '#E36C09'), -- ACP-207: ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS
(59, 'ADM-2A-TARDE-EMP208', 8, 38, 35, 10, '#FFE79B'); -- EMP-208: ECONOMÍA DE LA EMPRESA

-- PARALELO B (paralelo_id = 9) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(60, 'ADM-2B-NOCHE-ORA201', 9, 31, 35, 10, '#B2A1C7'),  -- ORA-201: ORGANIZACIÓN DE LA ADMINISTRACIÓN
(61, 'ADM-2B-NOCHE-IEM202', 9, 32, 35, 10, '#46FB2D'),  -- IEM-202: INVESTIGACIÓN Y ESTRATEGIA DE MERCADO
(62, 'ADM-2B-NOCHE-ADO203', 9, 33, 35, 10, '#00B050'), -- ADO-203: ADMINISTRACIÓN DE OPERACIONES
(63, 'ADM-2B-NOCHE-GTH204', 9, 34, 35, 10, '#DBE5F1'), -- GTH-204: GESTIÓN DEL TALENTO HUMANO
(64, 'ADM-2B-NOCHE-ADF205', 9, 35, 35, 10, '#548DD4'),  -- ADF-205: ADMINISTRACIÓN FINANCIERA I
(65, 'ADM-2B-NOCHE-PEP206', 9, 36, 35, 10, '#CC66FF'), -- PEP-206: PREPARACIÓN Y EVALUACIÓN DE PROYECTOS
(66, 'ADM-2B-NOCHE-ACP207', 9, 37, 35, 10, '#E36C09'), -- ACP-207: ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS
(67, 'ADM-2B-NOCHE-EMP208', 9, 38, 35, 10, '#FFE79B'); -- EMP-208: ECONOMÍA DE LA EMPRESA

-- ============================================
-- INSERTAR CURSOS - TERCER AÑO (Periodo 3)
-- Asignaturas_plan: 39-45
-- ============================================

-- PARALELO A (paralelo_id = 10) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(68, 'ADM-3A-NOCHE-AMP301', 10, 39, 35, 10, '#B2A1C7'),  -- AMP-301: ADMINISTRACIÓN DE LA MICRO Y PEQUEÑA Y MEDIANA EMPRESA
(69, 'ADM-3A-NOCHE-IMN302', 10, 40, 35, 10, '#FF99FF'), -- IMN-302: INCUBACIÓN Y MODELOS DE NEGOCIOS
(70, 'ADM-3A-NOCHE-ADF303', 10, 41, 35, 10, '#548DD4'), -- ADF-303: ADMINISTRACIÓN FINANCIERA II
(71, 'ADM-3A-NOCHE-TMG304', 10, 42, 35, 10, '#C2D69B'), -- TMG-304: TALLER DE MODALIDAD DE GRADO
(72, 'ADM-3A-NOCHE-EMP305', 10, 43, 35, 10, '#FFE79B'), -- EMP-305: EMPRENDIMIENTO PRODUCTIVO
(73, 'ADM-3A-NOCHE-CMI306', 10, 44, 35, 10, '#00FFFF'), -- CMI-306: COMERCIO INTERNACIONAL
(74, 'ADM-3A-NOCHE-GEE307', 10, 45, 35, 10, '#FFC000'); -- GEE-307: GESTIÓN ESTRATÉGICA

-- ============================================
-- PALETA AUTOMÁTICA POR CÓDIGO DE CURSO
-- ============================================
-- Regla: color derivado de CRC32(codigo), con rango RGB 96-223
-- para asegurar mezcla amplia y evitar colores extremos (muy oscuros/muy claros).
UPDATE cursos
SET color_hex = CONCAT(
  '#',
  LPAD(HEX(96 + ((CRC32(codigo) >> 16) & 127)), 2, '0'),
  LPAD(HEX(96 + ((CRC32(codigo) >> 8) & 127)), 2, '0'),
  LPAD(HEX(96 + (CRC32(codigo) & 127)), 2, '0')
)
WHERE id BETWEEN 31 AND 74;

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE CURSOS CREADOS
-- ============================================
-- PRIMER AÑO (Periodo 1):
--   Paralelo A (TARDE): 7 cursos (IDs 31-37)
--   Paralelo B (NOCHE): 7 cursos (IDs 38-44)
--   Paralelo C (NOCHE): 7 cursos (IDs 45-51)
--   SUBTOTAL: 21 cursos
--
-- SEGUNDO AÑO (Periodo 2):
--   Paralelo A (TARDE): 8 cursos (IDs 52-59)
--   Paralelo B (NOCHE): 8 cursos (IDs 60-67)
--   SUBTOTAL: 16 cursos
--
-- TERCER AÑO (Periodo 3):
--   Paralelo A (NOCHE): 7 cursos (IDs 68-74)
--   SUBTOTAL: 7 cursos
--
-- TOTAL GENERAL: 44 cursos de Administración de Empresas
-- ============================================
-- FIN DEL SEEDER
-- ============================================
