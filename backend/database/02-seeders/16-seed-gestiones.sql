-- ============================================
-- SEEDER: gestiones
-- Sistema de Gestión Académica - Instituto INCOS
-- Gestiones: año vigente (id=1) + 5 gestiones atrás (ids 2-6)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE gestiones;

-- ============================================
-- INSERTAR GESTIONES
-- La gestión vigente tiene siempre id=1 (2026). Resto en orden: 2025→2, 2024→3, 2023→4, 2022→5, 2021→6.
-- El sistema resuelve "gestión actual" por configuracion_sistema (gestion_actual) + vigente, no por id fijo.
-- ============================================

-- Gestión año actual (VIGENTE) — id=1
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(1, '2026-REG', 'Gestión Regular 2026', 2026, 'REGULAR', '2026-01-19', '2026-12-11', TRUE);

-- Gestión 2025 (1 año atrás)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(2, '2025-REG', 'Gestión Regular 2025', 2025, 'REGULAR', '2025-01-13', '2025-12-12', FALSE);

-- Gestión 2024 (2 años atrás)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(3, '2024-REG', 'Gestión Regular 2024', 2024, 'REGULAR', '2024-01-08', '2024-12-13', FALSE);

-- Gestión 2023 (3 años atrás)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(4, '2023-REG', 'Gestión Regular 2023', 2023, 'REGULAR', '2023-01-09', '2023-12-08', FALSE);

-- Gestión 2022 (4 años atrás)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(5, '2022-REG', 'Gestión Regular 2022', 2022, 'REGULAR', '2022-01-10', '2022-12-09', FALSE);

-- Gestión 2021 (5 años atrás)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(6, '2021-REG', 'Gestión Regular 2021', 2021, 'REGULAR', '2021-01-11', '2021-12-10', FALSE);


-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
