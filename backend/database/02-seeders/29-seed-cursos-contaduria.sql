-- ============================================
-- SEEDER: cursos - CONTADURÍA GENERAL
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Cursos de CONTADURÍA GENERAL - TODOS LOS PARALELOS
-- ============================================
-- Orden: Carrera 3 (CON-GEN) → Plan 3 → Periodos 1-3 → Asignaturas → Paralelos
-- IDs fijos: 75-140 (CON-GEN) - Correlativos desde Administración (74)
-- Paralelos: 11 (1A), 12 (1B), 13 (1C), 14 (1D), 15 (2A), 16 (2B), 17 (3A), 18 (3B)
-- Asignaturas_plan: Periodo 1 (46-54), Periodo 2 (55-61), Periodo 3 (62-69)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos;

-- ============================================
-- INSERTAR CURSOS - PRIMER AÑO (Periodo 1)
-- Asignaturas_plan: 46-54
-- ============================================

-- PARALELO A (paralelo_id = 11) - TARDE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(75, 'CON-1A-TARDE-CON101', 11, 46, 35, 10, '#00FF00'),  -- CON-101: CONTABILIDAD I
(76, 'CON-1A-TARDE-MAF102', 11, 47, 35, 10, '#00B0F0'),  -- MAF-102: MATEMÁTICA FINANCIERA
(77, 'CON-1A-TARDE-ICO103', 11, 48, 35, 10, '#00FFFF'),  -- ICO-103: INFORMÁTICA CONTABLE
(78, 'CON-1A-TARDE-ADG104', 11, 49, 35, 10, '#B2A1C7'),  -- ADG-104: ADMINISTRACIÓN GENERAL
(79, 'CON-1A-TARDE-LSA105', 11, 50, 35, 10, '#FFFF00'),  -- LSA-105: LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA
(80, 'CON-1A-TARDE-EGA106', 11, 51, 35, 10, '#FF9900'),  -- EGA-106: ECONOMÍA GENERAL APLICADA
(81, 'CON-1A-TARDE-DCM107', 11, 52, 35, 10, '#C6D9F0'),  -- DCM-107: DOCUMENTOS COMERCIALES Y MERCANTILES
(82, 'CON-1A-TARDE-ESA108', 11, 53, 35, 10, '#00B050'),  -- ESA-108: ESTADÍSTICA APLICADA
(83, 'CON-1A-TARDE-INT109', 11, 54, 35, 10, '#FF00FF');  -- INT-109: INGLÉS TÉCNICO

-- PARALELO B (paralelo_id = 12) - TARDE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(84, 'CON-1B-TARDE-CON101', 12, 46, 35, 10, '#00FF00'),  -- CON-101: CONTABILIDAD I
(85, 'CON-1B-TARDE-MAF102', 12, 47, 35, 10, '#00B0F0'),  -- MAF-102: MATEMÁTICA FINANCIERA
(86, 'CON-1B-TARDE-ICO103', 12, 48, 35, 10, '#00FFFF'),  -- ICO-103: INFORMÁTICA CONTABLE
(87, 'CON-1B-TARDE-ADG104', 12, 49, 35, 10, '#B2A1C7'),  -- ADG-104: ADMINISTRACIÓN GENERAL
(88, 'CON-1B-TARDE-LSA105', 12, 50, 35, 10, '#FFFF00'),  -- LSA-105: LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA
(89, 'CON-1B-TARDE-EGA106', 12, 51, 35, 10, '#FF9900'),  -- EGA-106: ECONOMÍA GENERAL APLICADA
(90, 'CON-1B-TARDE-DCM107', 12, 52, 35, 10, '#C6D9F0'),  -- DCM-107: DOCUMENTOS COMERCIALES Y MERCANTILES
(91, 'CON-1B-TARDE-ESA108', 12, 53, 35, 10, '#00B050'),  -- ESA-108: ESTADÍSTICA APLICADA
(92, 'CON-1B-TARDE-INT109', 12, 54, 35, 10, '#FF00FF');  -- INT-109: INGLÉS TÉCNICO

-- PARALELO C (paralelo_id = 13) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(93, 'CON-1C-NOCHE-CON101', 13, 46, 35, 10, '#00FF00'),  -- CON-101: CONTABILIDAD I
(94, 'CON-1C-NOCHE-MAF102', 13, 47, 35, 10, '#00B0F0'),  -- MAF-102: MATEMÁTICA FINANCIERA
(95, 'CON-1C-NOCHE-ICO103', 13, 48, 35, 10, '#00FFFF'),  -- ICO-103: INFORMÁTICA CONTABLE
(96, 'CON-1C-NOCHE-ADG104', 13, 49, 35, 10, '#B2A1C7'),  -- ADG-104: ADMINISTRACIÓN GENERAL
(97, 'CON-1C-NOCHE-LSA105', 13, 50, 35, 10, '#FFFF00'),  -- LSA-105: LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA
(98, 'CON-1C-NOCHE-EGA106', 13, 51, 35, 10, '#FF9900'),  -- EGA-106: ECONOMÍA GENERAL APLICADA
(99, 'CON-1C-NOCHE-DCM107', 13, 52, 35, 10, '#C6D9F0'),  -- DCM-107: DOCUMENTOS COMERCIALES Y MERCANTILES
(100, 'CON-1C-NOCHE-ESA108', 13, 53, 35, 10, '#00B050'), -- ESA-108: ESTADÍSTICA APLICADA
(101, 'CON-1C-NOCHE-INT109', 13, 54, 35, 10, '#FF00FF'); -- INT-109: INGLÉS TÉCNICO

-- PARALELO D (paralelo_id = 14) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(102, 'CON-1D-NOCHE-CON101', 14, 46, 35, 10, '#00FF00'),  -- CON-101: CONTABILIDAD I
(103, 'CON-1D-NOCHE-MAF102', 14, 47, 35, 10, '#00B0F0'),  -- MAF-102: MATEMÁTICA FINANCIERA
(104, 'CON-1D-NOCHE-ICO103', 14, 48, 35, 10, '#00FFFF'),  -- ICO-103: INFORMÁTICA CONTABLE
(105, 'CON-1D-NOCHE-ADG104', 14, 49, 35, 10, '#B2A1C7'),  -- ADG-104: ADMINISTRACIÓN GENERAL
(106, 'CON-1D-NOCHE-LSA105', 14, 50, 35, 10, '#FFFF00'),  -- LSA-105: LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA
(107, 'CON-1D-NOCHE-EGA106', 14, 51, 35, 10, '#FF9900'), -- EGA-106: ECONOMÍA GENERAL APLICADA
(108, 'CON-1D-NOCHE-DCM107', 14, 52, 35, 10, '#C6D9F0'), -- DCM-107: DOCUMENTOS COMERCIALES Y MERCANTILES
(109, 'CON-1D-NOCHE-ESA108', 14, 53, 35, 10, '#00B050'), -- ESA-108: ESTADÍSTICA APLICADA
(110, 'CON-1D-NOCHE-INT109', 14, 54, 35, 10, '#FF00FF'); -- INT-109: INGLÉS TÉCNICO

-- ============================================
-- INSERTAR CURSOS - SEGUNDO AÑO (Periodo 2)
-- Asignaturas_plan: 55-61
-- ============================================

-- PARALELO A (paralelo_id = 15) - TARDE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(111, 'CON-2A-TARDE-CON201', 15, 55, 35, 10, '#00FF00'),  -- CON-201: CONTABILIDAD II
(112, 'CON-2A-TARDE-COC202', 15, 56, 35, 10, '#FF99FF'), -- COC-202: CONTABILIDAD DE COSTOS I
(113, 'CON-2A-TARDE-COS203', 15, 57, 35, 10, '#FDE9D9'), -- COS-203: CONTABILIDAD DE SOCIEDADES
(114, 'CON-2A-TARDE-CDS204', 15, 58, 35, 10, '#EFEFEF'), -- CDS-204: CONTABILIDAD DE SEGUROS
(115, 'CON-2A-TARDE-CBC205', 15, 59, 35, 10, '#93F193'), -- CBC-205: CONTABILIDAD BANCARIA Y COOPERATIVAS
(116, 'CON-2A-TARDE-EMP206', 15, 60, 35, 10, '#C2D69B'), -- EMP-206: EMPRENDIMIENTO PRODUCTIVO
(117, 'CON-2A-TARDE-SIT207', 15, 61, 35, 10, '#FFC000'); -- SIT-207: SISTEMA TRIBUTARIO

-- PARALELO B (paralelo_id = 16) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(118, 'CON-2B-NOCHE-CON201', 16, 55, 35, 10, '#00FF00'),  -- CON-201: CONTABILIDAD II
(119, 'CON-2B-NOCHE-COC202', 16, 56, 35, 10, '#FF99FF'), -- COC-202: CONTABILIDAD DE COSTOS I
(120, 'CON-2B-NOCHE-COS203', 16, 57, 35, 10, '#FDE9D9'), -- COS-203: CONTABILIDAD DE SOCIEDADES
(121, 'CON-2B-NOCHE-CDS204', 16, 58, 35, 10, '#EFEFEF'), -- CDS-204: CONTABILIDAD DE SEGUROS
(122, 'CON-2B-NOCHE-CBC205', 16, 59, 35, 10, '#93F193'), -- CBC-205: CONTABILIDAD BANCARIA Y COOPERATIVAS
(123, 'CON-2B-NOCHE-EMP206', 16, 60, 35, 10, '#C2D69B'), -- EMP-206: EMPRENDIMIENTO PRODUCTIVO
(124, 'CON-2B-NOCHE-SIT207', 16, 61, 35, 10, '#FFC000'); -- SIT-207: SISTEMA TRIBUTARIO

-- ============================================
-- INSERTAR CURSOS - TERCER AÑO (Periodo 3)
-- Asignaturas_plan: 62-69
-- ============================================

-- PARALELO A (paralelo_id = 17) - TARDE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(125, 'CON-3A-TARDE-COA301', 17, 62, 35, 10, '#93F193'),  -- COA-301: CONTABILIDAD AGROPECUARIA
(126, 'CON-3A-TARDE-COC302', 17, 63, 35, 10, '#CCC0D9'), -- COC-302: CONTABILIDAD DE COSTOS II
(127, 'CON-3A-TARDE-COG303', 17, 64, 35, 10, '#FBD4B4'), -- COG-303: CONTABILIDAD GUBERNAMENTAL
(128, 'CON-3A-TARDE-CEP304', 17, 65, 35, 10, '#EFEFEF'), -- CEP-304: CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL)
(129, 'CON-3A-TARDE-CHS305', 17, 66, 35, 10, '#76923C'), -- CHS-305: CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE)
(130, 'CON-3A-TARDE-GCI306', 17, 67, 35, 10, '#B2F0FC'), -- GCI-306: GABINETE CONTABLE INFORMÁTICO
(131, 'CON-3A-TARDE-AEF307', 17, 68, 35, 10, '#EFEFEF'), -- AEF-307: ANÁLISIS E INTERPRETACIONES DE ESTADOS FINANCIEROS
(132, 'CON-3A-TARDE-TMG308', 17, 69, 35, 10, '#5EF927'); -- TMG-308: TALLER DE MODALIDAD DE GRADUACIÓN

-- PARALELO B (paralelo_id = 18) - TARDE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(133, 'CON-3B-TARDE-COA301', 18, 62, 35, 10, '#93F193'),  -- COA-301: CONTABILIDAD AGROPECUARIA
(134, 'CON-3B-TARDE-COC302', 18, 63, 35, 10, '#CCC0D9'), -- COC-302: CONTABILIDAD DE COSTOS II
(135, 'CON-3B-TARDE-COG303', 18, 64, 35, 10, '#FBD4B4'), -- COG-303: CONTABILIDAD GUBERNAMENTAL
(136, 'CON-3B-TARDE-CEP304', 18, 65, 35, 10, '#EFEFEF'), -- CEP-304: CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL)
(137, 'CON-3B-TARDE-CHS305', 18, 66, 35, 10, '#76923C'), -- CHS-305: CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE)
(138, 'CON-3B-TARDE-GCI306', 18, 67, 35, 10, '#B2F0FC'), -- GCI-306: GABINETE CONTABLE INFORMÁTICO
(139, 'CON-3B-TARDE-AEF307', 18, 68, 35, 10, '#EFEFEF'), -- AEF-307: ANÁLISIS E INTERPRETACIONES DE ESTADOS FINANCIEROS
(140, 'CON-3B-TARDE-TMG308', 18, 69, 35, 10, '#5EF927'); -- TMG-308: TALLER DE MODALIDAD DE GRADUACIÓN

-- ============================================
-- PALETA AUTOMÁTICA POR CÓDIGO DE CURSO
-- ============================================
-- Regla nueva:
-- - Color único por curso usando el id global (1-140).
-- - Salto fuerte entre tonos para evitar cursos vecinos con color similar.
-- - No depende de bloques/periodos para no "agrupar" visualmente por gama.
UPDATE cursos
SET color_hex = CONCAT(
  '#',
  LPAD(HEX((id * 47 + 83) % 256), 2, '0'),
  LPAD(HEX((id * 91 + 149) % 256), 2, '0'),
  LPAD(HEX((id * 163 + 37) % 256), 2, '0')
)
WHERE id BETWEEN 75 AND 140;

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE CURSOS CREADOS
-- ============================================
-- PRIMER AÑO (Periodo 1):
--   Paralelo A (TARDE): 9 cursos (IDs 75-83)
--   Paralelo B (TARDE): 9 cursos (IDs 84-92)
--   Paralelo C (NOCHE): 9 cursos (IDs 93-101)
--   Paralelo D (NOCHE): 9 cursos (IDs 102-110)
--   SUBTOTAL: 36 cursos
--
-- SEGUNDO AÑO (Periodo 2):
--   Paralelo A (TARDE): 7 cursos (IDs 111-117)
--   Paralelo B (NOCHE): 7 cursos (IDs 118-124)
--   SUBTOTAL: 14 cursos
--
-- TERCER AÑO (Periodo 3):
--   Paralelo A (TARDE): 8 cursos (IDs 125-132)
--   Paralelo B (TARDE): 8 cursos (IDs 133-140)
--   SUBTOTAL: 16 cursos
--
-- TOTAL GENERAL: 66 cursos de Contaduría General
-- ============================================
-- FIN DEL SEEDER
-- ============================================
