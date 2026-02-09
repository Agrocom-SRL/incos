-- ============================================
-- SEEDER: gestiones
-- Sistema de Gestión Académica - Instituto INCOS
-- Gestiones: año actual + 5 gestiones atrás (6 en total)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE gestiones;

-- ============================================
-- INSERTAR GESTIONES
-- Año actual (vigente=TRUE) + 5 años atrás (vigente=FALSE)
-- IMPORTANTE: La gestión vigente debe ser siempre id=2 (referencias en el sistema).
-- Las 5 gestiones anteriores usan id 1, 3, 4, 5, 6.
-- ============================================

-- Gestión 2025 (1 año atrás)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(1, '2025-REG', 'Gestión Regular 2025', 2025, 'REGULAR', '2025-01-13', '2025-12-12', FALSE);

-- Gestión año actual (VIGENTE) — id=2 fijo para no desconfigurar el sistema
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(2, '2026-REG', 'Gestión Regular 2026', 2026, 'REGULAR', '2026-01-19', '2026-12-11', TRUE);

-- Gestión 2021 (5 años atrás)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(3, '2021-REG', 'Gestión Regular 2021', 2021, 'REGULAR', '2021-01-11', '2021-12-10', FALSE);

-- Gestión 2022 (4 años atrás)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(4, '2022-REG', 'Gestión Regular 2022', 2022, 'REGULAR', '2022-01-10', '2022-12-09', FALSE);

-- Gestión 2023 (3 años atrás)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(5, '2023-REG', 'Gestión Regular 2023', 2023, 'REGULAR', '2023-01-09', '2023-12-08', FALSE);

-- Gestión 2024 (2 años atrás)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(6, '2024-REG', 'Gestión Regular 2024', 2024, 'REGULAR', '2024-01-08', '2024-12-13', FALSE);


-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
