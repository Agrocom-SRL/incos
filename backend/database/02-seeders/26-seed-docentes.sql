-- ============================================
-- SEEDER: docentes
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Docentes extraídos del horario académico 2026
-- ============================================
-- Orden: por id correlativo (1-33, sin huecos). La carrera ya no coincide 1:1 con
-- el rango de id por los docentes re-incorporados; se anota inline donde aplica.
-- Docentes sin asignación 2026 (solo planilla 2023/labs): 24, 27, 32, 33 (carga 0).
-- IDs fijos para facilitar referencias consistentes
-- color_hex: identidad visual en grilla de horarios (vive en docentes)
--
-- Variantes de grafía en el Excel de horarios (mismo docente, forma canónica aquí):
--   Ybeth Camacho        ← "Ibeth Camacho"
--   Magali Ticlla        ← "Magaly Ticlla"
--   Yesmani Fernandez    ← "Yesmani Ferandez" (typo)
--   Sebastián Vargas (17)← "Vargas Morales Rafael Sebastian" (nombre legal completo, bloque 3°B CON)
--
-- NOTA: Los datos de CI, expedición, fecha_nacimiento y celular son ficticios.
-- Se deben actualizar con datos reales del instituto. CI y celular son únicos.

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- INSERTAR DOCENTES (orden por id 1-33)
-- ============================================

-- SISTEMAS INFORMÁTICOS (ids 1-7)
INSERT INTO docentes (id, ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral, color_hex) VALUES
(1, '12345001', 'SC', 'Ybeth', 'Camacho', NULL, '1988-09-12', 'FEMENINO', '70000001', 'Ingeniera', 'CONTRATO', 'ACTIVO', '#0F01B1'),
(2, '12345002', 'SC', 'Roxana', 'Justiniano', NULL, '1986-05-28', 'FEMENINO', '70000002', 'Ingeniera', 'CONTRATO', 'ACTIVO', '#B14B6B'),
(3, '12345003', 'SC', 'Magali', 'Ticlla', NULL, '1990-01-19', 'FEMENINO', '70000003', 'Ingeniera', 'CONTRATO', 'ACTIVO', '#82F0C8'),
(4, '12345004', 'SC', 'Waly', 'Vargas', NULL, '1984-10-07', 'MASCULINO', '70000004', 'Ingeniero', 'CONTRATO', 'ACTIVO', '#E0A60E'),
(5, '12345005', 'SC', 'Giovanna', 'Fernandez', NULL, '1989-04-15', 'FEMENINO', '70000005', 'Ingeniera', 'CONTRATO', 'ACTIVO', '#9C129A'),
(6, '12345006', 'SC', 'Lily', 'Arenas', NULL, '1987-12-03', 'FEMENINO', '70000006', 'Ingeniera', 'CONTRATO', 'ACTIVO', '#FAC8E0'),
(7, '12345007', 'SC', 'Yesmani', 'Fernandez', NULL, '1985-08-21', 'MASCULINO', '70000007', 'Ingeniero', 'CONTRATO', 'ACTIVO', '#87D9C9');

-- ADMINISTRACIÓN DE EMPRESAS (ids 8-15)
INSERT INTO docentes (id, ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral, color_hex) VALUES
(8, '12345011', 'SC', 'Vladimir', 'Marca', NULL, '1983-03-08', 'MASCULINO', '70000011', 'Licenciado', 'CONTRATO', 'ACTIVO', '#9694CC'),
(9, '12345012', 'SC', 'Elio', 'Honor', NULL, '1987-11-17', 'MASCULINO', '70000012', 'Licenciado', 'CONTRATO', 'ACTIVO', '#625028'),
(10, '12345013', 'SC', 'Rafael', 'Montero', NULL, '1985-07-24', 'MASCULINO', '70000013', 'Licenciado', 'CONTRATO', 'ACTIVO', '#049AE2'),
(11, '12345014', 'SC', 'René', 'Roca', NULL, '1984-04-15', 'MASCULINO', '70000014', 'Licenciado', 'CONTRATO', 'ACTIVO', '#7C72FA'),
(12, '12345015', 'SC', 'Georgina', 'Moron', NULL, '1986-08-22', 'FEMENINO', '70000015', 'Licenciada', 'CONTRATO', 'ACTIVO', '#ABCD9D'),
(13, '12345016', 'SC', 'Puma', '', NULL, '1985-03-10', 'MASCULINO', '70000016', 'Licenciado', 'CONTRATO', 'ACTIVO', '#673929'),
(14, '12345017', 'SC', 'Jose Luiz', 'Uribe', NULL, '1987-11-30', 'MASCULINO', '70000017', 'Licenciado', 'CONTRATO', 'ACTIVO', '#C5EF6F'),
(15, '12345018', 'SC', 'Paola', 'Mariaca', NULL, '1988-05-20', 'FEMENINO', '70000018', 'Licenciada', 'CONTRATO', 'ACTIVO', '#6C222A');

-- CONTADURÍA GENERAL (ids 16-31) + docentes SIN asignación 2026 intercalados por id:
--   24 Ferrufino, 27 Hurtado, 32 Osinaga, 33 Marina Vargas.
--   Estos 4 solo figuran en planillas viejas del Excel (GESTION 2023 y hojas de
--   laboratorio); NO dictan en el horario 2026 vigente, por lo que NO tienen
--   asignaciones en los seeders 31-48 (aparecerán con carga 0). Se mantienen en el
--   maestro a propósito (ver decisión 2026-06); no sembrar sus horarios desde 2023.
INSERT INTO docentes (id, ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral, color_hex) VALUES
(16, '12345019', 'SC', 'Hilda', 'Barriga', NULL, '1985-05-15', 'FEMENINO', '70000019', 'Licenciada', 'CONTRATO', 'ACTIVO', '#33F585'),
(17, '12345020', 'SC', 'Sebastián', 'Vargas', NULL, '1982-03-20', 'MASCULINO', '70000020', 'Licenciado', 'CONTRATO', 'ACTIVO', '#183EE6'),
(18, '12345021', 'SC', 'Sonia', 'Carrizales', NULL, '1987-08-10', 'FEMENINO', '70000021', 'Licenciada', 'CONTRATO', 'ACTIVO', '#C0066E'),
(19, '12345022', 'SC', 'Patricia', 'Rodriguez', 'Cuellar', '1990-11-25', 'FEMENINO', '70000022', 'Técnica', 'HORARIO', 'ACTIVO', '#D4AA72'),
(20, '12345023', 'SC', 'Gonzalo', 'Icuña', NULL, '1983-07-18', 'MASCULINO', '70000023', 'Licenciado', 'CONTRATO', 'ACTIVO', '#0983E3'),
(21, '12345024', 'SC', 'Miguel', 'Padilla', NULL, '1988-04-12', 'MASCULINO', '70000024', 'Licenciado', 'CONTRATO', 'ACTIVO', '#76F42C'),
(22, '12345025', 'SC', 'Jose Luis', 'Montenegro', NULL, '1984-09-30', 'MASCULINO', '70000025', 'Licenciado', 'CONTRATO', 'ACTIVO', '#91ABCB'),
(23, '12345026', 'SC', 'Franz', 'Lujan', NULL, '1986-02-14', 'MASCULINO', '70000026', 'Licenciado', 'CONTRATO', 'ACTIVO', '#38DE86'),
(24, '12345040', 'SC', 'Manuel Ignacio', 'Ferrufino', NULL, '1983-06-10', 'MASCULINO', '70000040', 'Licenciado', 'HORARIO', 'ACTIVO', '#2E7D32'),
(25, '12345028', 'SC', 'Dory', 'Robles', NULL, '1989-12-05', 'FEMENINO', '70000028', 'Licenciada', 'CONTRATO', 'ACTIVO', '#B40AD2'),
(26, '12345029', 'SC', 'Willma', 'Fernandez', NULL, '1984-06-18', 'FEMENINO', '70000029', 'Licenciada', 'CONTRATO', 'ACTIVO', '#4C828A'),
(27, '12345041', 'SC', 'Aurelio', 'Hurtado', NULL, '1984-02-22', 'MASCULINO', '70000041', 'Licenciado', 'HORARIO', 'ACTIVO', '#6A1B9A'),
(28, '12345031', 'SC', 'Elias', 'Sarzuri', NULL, '1985-11-08', 'MASCULINO', '70000031', 'Licenciado', 'CONTRATO', 'ACTIVO', '#80C62E'),
(29, '12345032', 'SC', 'Teodora', 'Paraguayo', NULL, '1986-04-14', 'FEMENINO', '70000032', 'Licenciada', 'CONTRATO', 'ACTIVO', '#BF71A1'),
(30, '12345033', 'SC', 'José Antonio', 'Vara', NULL, '1982-12-03', 'MASCULINO', '70000033', 'Licenciado', 'CONTRATO', 'ACTIVO', '#FF97B8'),
(31, '12345034', 'SC', 'Yessica', '', NULL, '1990-01-01', 'FEMENINO', '70000034', 'Licenciada', 'CONTRATO', 'ACTIVO', '#FF5722'),
(32, '12345042', 'SC', 'José', 'Osinaga', NULL, '1985-09-14', 'MASCULINO', '70000042', 'Licenciado', 'CONTRATO', 'ACTIVO', '#00838F'),
(33, '12345043', 'SC', 'Marina', 'Vargas', NULL, '1986-07-03', 'FEMENINO', '70000043', 'Licenciada', 'CONTRATO', 'ACTIVO', '#AD1457');

SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 33 docentes — IDs 1-33 correlativos (sin huecos); CI y celular únicos.
-- 29 con asignación 2026 + 4 sin asignación (24, 27, 32, 33: planilla 2023/labs).
