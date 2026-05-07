-- ============================================
-- SEEDER: cursos - SISTEMAS INFORMÁTICOS
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Cursos de SISTEMAS INFORMÁTICOS - TODOS LOS PARALELOS
-- ============================================
-- Orden: Carrera 1 (SIS-INF) → Plan 1 → Periodos 1-3 → Asignaturas → Paralelos
-- IDs fijos: 1-22 (SIS-INF)
-- Paralelos: 1 (1A), 2 (1B), 3 (2A), 4 (3A)
-- Asignaturas_plan: Periodo 1 (1-7), Periodo 2 (8-15), Periodo 3 (16-23)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos;

-- ============================================
-- INSERTAR CURSOS - PRIMER AÑO (Periodo 1)
-- Asignaturas_plan: 1-7
-- ============================================

-- PARALELO A (paralelo_id = 1) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(1, 'SIS-1A-NOCHE-MPI101', 1, 1, 35, 10, '#00FF00'),   -- MPI-101: MATEMÁTICA PARA LA INFORMÁTICA
(2, 'SIS-1A-NOCHE-PRG102', 1, 2, 35, 10, '#E36C09'),   -- PRG-102: PROGRAMACIÓN I
(3, 'SIS-1A-NOCHE-INT103', 1, 3, 35, 10, '#FFFF00'),   -- INT-103: INGLÉS TECNICO
(4, 'SIS-1A-NOCHE-HDC104', 1, 4, 35, 10, '#52EFF6'),   -- HDC-104: HARDWARE DE COMPUTADORAS
(5, 'SIS-1A-NOCHE-TSO105', 1, 5, 35, 10, '#C2D69B'),   -- TSO-105: TALLER DE SISTEMAS OPERATIVOS
(6, 'SIS-1A-NOCHE-OTM106', 1, 6, 35, 10, '#52EFF6'),   -- OTM-106: OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA
(7, 'SIS-1A-NOCHE-DPW107', 1, 7, 35, 10, '#76923C');   -- DPW-107: DISEÑO Y PROGRAMACIÓN WEB I

-- PARALELO B (paralelo_id = 2) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(8, 'SIS-1B-NOCHE-MPI101', 2, 1, 35, 10, '#00FF00'),   -- MPI-101: MATEMÁTICA PARA LA INFORMÁTICA
(9, 'SIS-1B-NOCHE-PRG102', 2, 2, 35, 10, '#E36C09'),   -- PRG-102: PROGRAMACIÓN I
(10, 'SIS-1B-NOCHE-INT103', 2, 3, 35, 10, '#FFFF00'),  -- INT-103: INGLÉS TECNICO
(11, 'SIS-1B-NOCHE-HDC104', 2, 4, 35, 10, '#52EFF6'),  -- HDC-104: HARDWARE DE COMPUTADORAS
(12, 'SIS-1B-NOCHE-TSO105', 2, 5, 35, 10, '#C2D69B'),  -- TSO-105: TALLER DE SISTEMAS OPERATIVOS
(13, 'SIS-1B-NOCHE-OTM106', 2, 6, 35, 10, '#52EFF6'),  -- OTM-106: OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA
(14, 'SIS-1B-NOCHE-DPW107', 2, 7, 35, 10, '#76923C');  -- DPW-107: DISEÑO Y PROGRAMACIÓN WEB I

-- ============================================
-- INSERTAR CURSOS - SEGUNDO AÑO (Periodo 2)
-- Asignaturas_plan: 8-15
-- ============================================

-- PARALELO A (paralelo_id = 3) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(15, 'SIS-2A-NOCHE-EST201', 3, 8, 35, 10, '#52EFF6'),   -- EST-201: ESTADÍSTICA
(16, 'SIS-2A-NOCHE-PRG202', 3, 9, 35, 10, '#B3A7D6'),  -- PRG-202: PROGRAMACIÓN II
(17, 'SIS-2A-NOCHE-EDD203', 3, 10, 35, 10, '#FF3399'), -- EDD-203: ESTRUCTURA DE DATOS
(18, 'SIS-2A-NOCHE-RDC204', 3, 11, 35, 10, '#FF99FF'), -- RDC-204: REDES DE COMPUTADORAS I
(19, 'SIS-2A-NOCHE-PDM205', 3, 12, 35, 10, '#69A84F'), -- PDM-205: PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES I
(20, 'SIS-2A-NOCHE-ADS206', 3, 13, 35, 10, '#2FEF34'), -- ADS-206: ANÁLISIS Y DISEÑO DE SISTEMAS I
(21, 'SIS-2A-NOCHE-DPW207', 3, 14, 35, 10, '#00B0F0'), -- DPW-207: DISEÑO Y PROGRAMACIÓN WEB II
(22, 'SIS-2A-NOCHE-BDD208', 3, 15, 35, 10, '#66FFFF'); -- BDD-208: BASE DE DATOS I

-- ============================================
-- INSERTAR CURSOS - TERCER AÑO (Periodo 3)
-- Asignaturas_plan: 16-23
-- ============================================

-- PARALELO A (paralelo_id = 4) - NOCHE
INSERT INTO cursos (id, codigo, paralelo_id, asignatura_plan_id, cupo_maximo, cupo_minimo, color_hex) VALUES
(23, 'SIS-3A-NOCHE-EMP301', 4, 16, 35, 10, '#C2D69B'),  -- EMP-301: EMPRENDIMIENTO PRODUCTIVO
(24, 'SIS-3A-NOCHE-DPW302', 4, 17, 35, 10, '#B3A7D6'), -- DPW-302: DISEÑO Y PROGRAMACIÓN WEB III
(25, 'SIS-3A-NOCHE-GMC303', 4, 18, 35, 10, '#FFBF00'), -- GMC-303: GESTIÓN Y MEJORAMIENTO DE LA CALIDAD DE SOFTWARE
(26, 'SIS-3A-NOCHE-RDC304', 4, 19, 35, 10, '#FFBF00'), -- RDC-304: REDES DE COMPUTADORAS II
(27, 'SIS-3A-NOCHE-TMG305', 4, 20, 35, 10, '#FF66CC'), -- TMG-305: TALLER DE MODALIDAD DE GRADUACIÓN
(28, 'SIS-3A-NOCHE-ADS306', 4, 21, 35, 10, '#FFC000'), -- ADS-306: ANÁLISIS Y DISEÑO DE SISTEMAS II
(29, 'SIS-3A-NOCHE-PDM307', 4, 22, 35, 10, '#69A84F'), -- PDM-307: PROGRAMACIÓN PARA DISPOSITIVOS MOVILES II
(30, 'SIS-3A-NOCHE-BDD308', 4, 23, 35, 10, '#66FFFF'); -- BDD-308: BASE DE DATOS II

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
WHERE id BETWEEN 1 AND 30;

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE CURSOS CREADOS
-- ============================================
-- PRIMER AÑO (Periodo 1):
--   Paralelo A (NOCHE): 7 cursos (IDs 1-7)
--   Paralelo B (NOCHE): 7 cursos (IDs 8-14)
--   SUBTOTAL: 14 cursos
--
-- SEGUNDO AÑO (Periodo 2):
--   Paralelo A (NOCHE): 8 cursos (IDs 15-22)
--   SUBTOTAL: 8 cursos
--
-- TERCER AÑO (Periodo 3):
--   Paralelo A (NOCHE): 8 cursos (IDs 23-30)
--   SUBTOTAL: 8 cursos
--
-- TOTAL GENERAL: 30 cursos de Sistemas Informáticos
-- ============================================
-- FIN DEL SEEDER
-- ============================================
