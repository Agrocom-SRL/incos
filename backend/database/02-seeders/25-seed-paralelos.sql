-- ============================================
-- SEEDER: paralelos
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Paralelos por carrera y periodo
-- ============================================
-- Orden: SIS-INF (carrera_id=1), ADM-EMP (carrera_id=2), CON-GEN (carrera_id=3)
-- Periodos: Plan 1 (1-3), Plan 2 (4-6), Plan 3 (7-9)
-- IDs fijos: 1-4 (SIS-INF), 5-9 (ADM-EMP), 10-17 (CON-GEN)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE paralelos;

-- ============================================
-- INSERTAR PARALELOS - SISTEMAS INFORMÁTICOS (Carrera 1)
-- ============================================

-- PRIMER AÑO (periodo_id = 1)
INSERT INTO paralelos (id, carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(1, 1, 1, 'PRIMERO A', 'NOCHE', 'Paralelo A de Primer Año - Sistemas Informáticos - Turno Noche'),
(2, 1, 1, 'PRIMERO B', 'NOCHE', 'Paralelo B de Primer Año - Sistemas Informáticos - Turno Noche');

-- SEGUNDO AÑO (periodo_id = 2)
INSERT INTO paralelos (id, carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(3, 1, 2, 'SEGUNDO A', 'NOCHE', 'Paralelo A de Segundo Año - Sistemas Informáticos - Turno Noche');

-- TERCER AÑO (periodo_id = 3)
INSERT INTO paralelos (id, carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(4, 1, 3, 'TERCERO A', 'NOCHE', 'Paralelo A de Tercer Año - Sistemas Informáticos - Turno Noche');

-- ============================================
-- INSERTAR PARALELOS - ADMINISTRACIÓN DE EMPRESAS (Carrera 2)
-- ============================================

-- PRIMER AÑO (periodo_id = 4)
INSERT INTO paralelos (id, carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(5, 2, 4, 'PRIMERO A', 'TARDE', 'Paralelo A de Primer Año - Administración de Empresas - Turno Tarde'),
(6, 2, 4, 'PRIMERO B', 'NOCHE', 'Paralelo B de Primer Año - Administración de Empresas - Turno Noche');

-- SEGUNDO AÑO (periodo_id = 5)
INSERT INTO paralelos (id, carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(7, 2, 5, 'SEGUNDO A', 'TARDE', 'Paralelo A de Segundo Año - Administración de Empresas - Turno Tarde'),
(8, 2, 5, 'SEGUNDO B', 'NOCHE', 'Paralelo B de Segundo Año - Administración de Empresas - Turno Noche');

-- TERCER AÑO (periodo_id = 6)
INSERT INTO paralelos (id, carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(9, 2, 6, 'TERCERO A', 'NOCHE', 'Paralelo A de Tercer Año - Administración de Empresas - Turno Noche');

-- ============================================
-- INSERTAR PARALELOS - CONTADURÍA GENERAL (Carrera 3)
-- ============================================

-- PRIMER AÑO (periodo_id = 7)
INSERT INTO paralelos (id, carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(10, 3, 7, 'PRIMERO A', 'TARDE', 'Paralelo A de Primer Año - Contaduría General - Turno Tarde'),
(11, 3, 7, 'PRIMERO B', 'TARDE', 'Paralelo B de Primer Año - Contaduría General - Turno Tarde'),
(12, 3, 7, 'PRIMERO C', 'NOCHE', 'Paralelo C de Primer Año - Contaduría General - Turno Noche'),
(13, 3, 7, 'PRIMERO D', 'NOCHE', 'Paralelo D de Primer Año - Contaduría General - Turno Noche');

-- SEGUNDO AÑO (periodo_id = 8)
INSERT INTO paralelos (id, carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(14, 3, 8, 'SEGUNDO A', 'TARDE', 'Paralelo A de Segundo Año - Contaduría General - Turno Tarde'),
(15, 3, 8, 'SEGUNDO B', 'NOCHE', 'Paralelo B de Segundo Año - Contaduría General - Turno Noche');

-- TERCER AÑO (periodo_id = 9)
INSERT INTO paralelos (id, carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(16, 3, 9, 'TERCERO A', 'TARDE', 'Paralelo A de Tercer Año - Contaduría General - Turno Tarde'),
(17, 3, 9, 'TERCERO B', 'TARDE', 'Paralelo B de Tercer Año - Contaduría General - Turno Tarde');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE PARALELOS CREADOS
-- ============================================
-- SISTEMAS INFORMÁTICOS (IDs 1-4):
--   Primer Año: A (NOCHE), B (NOCHE) = 2 paralelos
--   Segundo Año: A (NOCHE) = 1 paralelo
--   Tercer Año: A (NOCHE) = 1 paralelo
--   TOTAL: 4 paralelos
--
-- ADMINISTRACIÓN DE EMPRESAS (IDs 5-9):
--   Primer Año: A (TARDE), B (NOCHE) = 2 paralelos
--   Segundo Año: A (TARDE), B (NOCHE) = 2 paralelos
--   Tercer Año: A (NOCHE) = 1 paralelo
--   TOTAL: 5 paralelos
--
-- CONTADURÍA GENERAL (IDs 10-17):
--   Primer Año: A (TARDE), B (TARDE), C (NOCHE), D (NOCHE) = 4 paralelos
--   Segundo Año: A (TARDE), B (NOCHE) = 2 paralelos
--   Tercer Año: A (TARDE), B (TARDE) = 2 paralelos
--   TOTAL: 8 paralelos
--
-- TOTAL GENERAL: 17 paralelos
-- ============================================
-- FIN DEL SEEDER
-- ============================================
