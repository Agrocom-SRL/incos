-- ============================================
-- SEEDER: asignaturas_plan
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Asignación de materias a periodos según Plan de Estudios RM No. 0210/2023
-- IDs fijos basados en el orden de planes y periodos
-- ============================================
-- Orden: Plan 1 (SIS-INF), Plan 2 (ADM-EMP), Plan 3 (CON-GEN)
-- Periodos: 1, 2, 3 para cada plan
-- IDs: Plan 1 (1-23), Plan 2 (24-45), Plan 3 (46-69)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaturas_plan;

-- ============================================
-- INSERTAR ASIGNATURAS PLAN - SISTEMAS INFORMÁTICOS (Plan 1)
-- ============================================

-- Plan 1, Periodo 1 (periodo_id = 1) - IDs 1-7
INSERT INTO asignaturas_plan (id, plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(1, 1, 1, 1, 4, 1),   -- MPI-101: MATEMÁTICA PARA LA INFORMÁTICA
(2, 1, 1, 2, 8, 2),   -- PRG-102: PROGRAMACIÓN I
(3, 1, 1, 3, 2, 3),   -- INT-103: INGLÉS TECNICO
(4, 1, 1, 4, 4, 4),   -- HDC-104: HARDWARE DE COMPUTADORAS
(5, 1, 1, 5, 4, 5),   -- TSO-105: TALLER DE SISTEMAS OPERATIVOS
(6, 1, 1, 6, 4, 6),   -- OTM-106: OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA
(7, 1, 1, 7, 4, 7);   -- DPW-107: DISEÑO Y PROGRAMACIÓN WEB I

-- Plan 1, Periodo 2 (periodo_id = 2) - IDs 8-15
INSERT INTO asignaturas_plan (id, plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(8, 1, 2, 8, 2, 1),   -- EST-201: ESTADÍSTICA
(9, 1, 2, 9, 6, 2),   -- PRG-202: PROGRAMACIÓN II
(10, 1, 2, 10, 2, 3),  -- EDD-203: ESTRUCTURA DE DATOS
(11, 1, 2, 11, 4, 4),  -- RDC-204: REDES DE COMPUTADORAS I
(12, 1, 2, 12, 4, 5),  -- PDM-205: PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES I
(13, 1, 2, 13, 4, 6),  -- ADS-206: ANÁLISIS Y DISEÑO DE SISTEMAS I
(14, 1, 2, 14, 4, 7),  -- DPW-207: DISEÑO Y PROGRAMACIÓN WEB II
(15, 1, 2, 15, 4, 8);  -- BDD-208: BASE DE DATOS I

-- Plan 1, Periodo 3 (periodo_id = 3) - IDs 16-23
INSERT INTO asignaturas_plan (id, plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(16, 1, 3, 16, 4, 1),  -- EMP-301: EMPRENDIMIENTO PRODUCTIVO
(17, 1, 3, 17, 4, 2),  -- DPW-302: DISEÑO Y PROGRAMACIÓN WEB III
(18, 1, 3, 18, 2, 3),  -- GMC-303: GESTIÓN Y MEJORAMIENTO DE LA CALIDAD DE SOFTWARE
(19, 1, 3, 19, 4, 4),  -- RDC-304: REDES DE COMPUTADORAS II
(20, 1, 3, 20, 4, 5),  -- TMG-305: TALLER DE MODALIDAD DE GRADUACIÓN
(21, 1, 3, 21, 4, 6),  -- ADS-306: ANÁLISIS Y DISEÑO DE SISTEMAS II
(22, 1, 3, 22, 4, 7),  -- PDM-307: PROGRAMACIÓN PARA DISPOSITIVOS MOVILES II
(23, 1, 3, 23, 4, 8);  -- BDD-308: BASE DE DATOS II

-- ============================================
-- INSERTAR ASIGNATURAS PLAN - ADMINISTRACIÓN DE EMPRESAS (Plan 2)
-- ============================================

-- Plan 2, Periodo 1 (periodo_id = 4) - IDs 24-30
INSERT INTO asignaturas_plan (id, plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(24, 2, 4, 24, 6, 1),  -- FUA-101: FUNDAMENTO DE LA ADMINISTRACIÓN
(25, 2, 4, 25, 6, 2),  -- CGA-102: CONTABILIDAD GENERAL PARA ADMINISTRACIÓNES
(26, 2, 4, 26, 4, 3),  -- MAF-103: MATEMÁTICA FINANCIERA
(27, 2, 4, 27, 4, 4),  -- ESN-104: ESTADÍSTICA PARA LOS NEGOCIOS
(28, 2, 4, 28, 4, 5),  -- PLT-105: PRÁCTICA LABORAL Y TRIBUTARIA
(29, 2, 4, 29, 2, 6),  -- IFE-106: INFORMÁTICA EMPRESARIAL
(30, 2, 4, 30, 4, 7);  -- INT-107: INGLÉS TÉCNICO

-- Plan 2, Periodo 2 (periodo_id = 5) - IDs 31-38
INSERT INTO asignaturas_plan (id, plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(31, 2, 5, 31, 2, 1),  -- ORA-201: ORGANIZACIÓN DE LA ADMINISTRACIÓN
(32, 2, 5, 32, 4, 2),  -- IEM-202: INVESTIGACIÓN Y ESTRATEGIA DE MERCADO
(33, 2, 5, 33, 4, 3),  -- ADO-203: ADMINISTRACIÓN DE OPERACIONES
(34, 2, 5, 34, 4, 4),  -- GTH-204: GESTIÓN DEL TALENTO HUMANO
(35, 2, 5, 35, 4, 5),  -- ADF-205: ADMINISTRACIÓN FINANCIERA I
(36, 2, 5, 36, 4, 6),  -- PEP-206: PREPARACIÓN Y EVALUACIÓN DE PROYECTOS
(37, 2, 5, 37, 4, 7),  -- ACP-207: ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS
(38, 2, 5, 38, 4, 8);  -- EMP-208: ECONOMÍA DE LA EMPRESA

-- Plan 2, Periodo 3 (periodo_id = 6) - IDs 39-45
INSERT INTO asignaturas_plan (id, plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(39, 2, 6, 39, 6, 1),  -- AMP-301: ADMINISTRACIÓN DE LA MICRO Y PEQUEÑA Y MEDIANA EMPRESA
(40, 2, 6, 40, 4, 2),  -- IMN-302: INCUBACIÓN Y MODELOS DE NEGOCIOS
(41, 2, 6, 41, 4, 3),  -- ADF-303: ADMINISTRACIÓN FINANCIERA II
(42, 2, 6, 42, 4, 4),  -- TMG-304: TALLER DE MODALIDAD DE GRADO
(43, 2, 6, 43, 4, 5),  -- EMP-305: EMPRENDIMIENTO PRODUCTIVO
(44, 2, 6, 44, 4, 6),  -- CMI-306: COMERCIO INTERNACIONAL
(45, 2, 6, 45, 4, 7);  -- GEE-307: GESTIÓN ESTRATÉGICA

-- ============================================
-- INSERTAR ASIGNATURAS PLAN - CONTADURÍA GENERAL (Plan 3)
-- ============================================

-- Plan 3, Periodo 1 (periodo_id = 7) - IDs 46-54
INSERT INTO asignaturas_plan (id, plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(46, 3, 7, 46, 8, 1),  -- CON-101: CONTABILIDAD I
(47, 3, 7, 47, 4, 2),  -- MAF-102: MATEMÁTICA FINANCIERA
(48, 3, 7, 48, 4, 3),  -- ICO-103: INFORMÁTICA CONTABLE
(49, 3, 7, 49, 4, 4),  -- ADG-104: ADMINISTRACIÓN GENERAL
(50, 3, 7, 50, 2, 5),  -- LSA-105: LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA
(51, 3, 7, 51, 2, 6),  -- EGA-106: ECONOMÍA GENERAL APLICADA
(52, 3, 7, 52, 2, 7),  -- DCM-107: DOCUMENTOS COMERCIALES Y MERCANTILES
(53, 3, 7, 53, 2, 8),  -- ESA-108: ESTADÍSTICA APLICADA
(54, 3, 7, 54, 2, 9);  -- INT-109: INGLÉS TÉCNICO

-- Plan 3, Periodo 2 (periodo_id = 8) - IDs 55-61
INSERT INTO asignaturas_plan (id, plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(55, 3, 8, 55, 6, 1),  -- CON-201: CONTABILIDAD II
(56, 3, 8, 56, 6, 2),  -- COC-202: CONTABILIDAD DE COSTOS I
(57, 3, 8, 57, 4, 3),  -- COS-203: CONTABILIDAD DE SOCIEDADES
(58, 3, 8, 58, 2, 4),  -- CDS-204: CONTABILIDAD DE SEGUROS
(59, 3, 8, 59, 4, 5),  -- CBC-205: CONTABILIDAD BANCARIA Y COOPERATIVAS
(60, 3, 8, 60, 4, 6),  -- EMP-206: EMPRENDIMIENTO PRODUCTIVO
(61, 3, 8, 61, 4, 7);  -- SIT-207: SISTEMA TRIBUTARIO

-- Plan 3, Periodo 3 (periodo_id = 9) - IDs 62-69
INSERT INTO asignaturas_plan (id, plan_estudio_id, periodo_id, materia_id, horas_semanales, orden_visualizacion) VALUES
(62, 3, 9, 62, 4, 1),  -- COA-301: CONTABILIDAD AGROPECUARIA
(63, 3, 9, 63, 4, 2),  -- COC-302: CONTABILIDAD DE COSTOS II
(64, 3, 9, 64, 4, 3),  -- COG-303: CONTABILIDAD GUBERNAMENTAL
(65, 3, 9, 65, 4, 4),  -- CEP-304: CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL)
(66, 3, 9, 66, 2, 5),  -- CHS-305: CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE)
(67, 3, 9, 67, 4, 6),  -- GCI-306: GABINETE CONTABLE INFORMÁTICO
(68, 3, 9, 68, 4, 7),  -- AEF-307: ANÁLISIS E INTERPRETACIONES DE ESTADOS FINANCIEROS
(69, 3, 9, 69, 4, 8);  -- TMG-308: TALLER DE MODALIDAD DE GRADUACIÓN

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
