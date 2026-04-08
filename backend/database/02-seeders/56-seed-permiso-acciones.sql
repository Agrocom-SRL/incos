-- ============================================
-- SEEDER: permiso_acciones
-- Catálogo de acciones válidas por permiso
-- Fuente de verdad para PermisosDominioPicker
-- y para validación en ActualizarPermisosRolUseCase
-- Ejecutar después de 54-seed-permisos.sql
--
-- MATRÍCULA: una pantalla suele combinar varios permisos (ej. listar admisiones usa
-- admision.ver + admision.editar + admision.crear + finanzas.pago.registrar según botones).
-- API pagos-aportes acepta finanzas.pago.* O matricula.pago.aporte.ver (mismo verbo).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE permiso_acciones;

INSERT INTO permiso_acciones (permiso_id, accion, activo) VALUES

-- ==========================================
-- MATRICULA
-- (1) listar/ver/exportar admisiones  (2) registrar  (3) editar/eliminar estudiante
-- (4) matrículas CRUD alta  (5) editar/eliminar inscripción  (6–8) becas  (9) documentos PDF
-- (10) aportes desde menú Matrícula: ver listado + exportar recibo / anular cuota (OR con Finanzas en API)
-- ==========================================
(1,  'VER',      TRUE),
(1,  'EXPORTAR', TRUE),
(2,  'VER',      TRUE),
(2,  'CREAR',    TRUE),
(3,  'VER',      TRUE),
(3,  'EDITAR',   TRUE),
(3,  'ELIMINAR', TRUE),
(4,  'VER',      TRUE),
(4,  'CREAR',    TRUE),
(5,  'VER',      TRUE),
(5,  'EDITAR',   TRUE),
(5,  'ELIMINAR', TRUE),
(6,  'VER',      TRUE),
(6,  'EXPORTAR', TRUE),
(7,  'VER',      TRUE),
(7,  'CREAR',    TRUE),
(7,  'EDITAR',   TRUE),
(7,  'ELIMINAR', TRUE),
(8,  'VER',      TRUE),
(8,  'APROBAR',  TRUE),
(9,  'VER',      TRUE),
(9,  'CREAR',    TRUE),
(10, 'VER',      TRUE),
(10, 'EXPORTAR', TRUE),
(10, 'ELIMINAR', TRUE),

-- ==========================================
-- ACADEMICO
-- ==========================================
(11, 'VER',      TRUE),
(12, 'VER',      TRUE),
(12, 'CREAR',    TRUE),
(13, 'VER',      TRUE),
(13, 'APROBAR',  TRUE),
(14, 'VER',      TRUE),
(14, 'CREAR',    TRUE),
(15, 'VER',      TRUE),
(15, 'CREAR',    TRUE),
(16, 'VER',      TRUE),
(16, 'CREAR',    TRUE),
(17, 'VER',      TRUE),
(17, 'EDITAR',   TRUE),
(18, 'VER',      TRUE),
(18, 'EDITAR',   TRUE),
(19, 'VER',      TRUE),
(19, 'EDITAR',   TRUE),
(20, 'VER',      TRUE),
(21, 'VER',      TRUE),
(21, 'CREAR',    TRUE),
(22, 'VER',      TRUE),
(22, 'APROBAR',  TRUE),
(23, 'VER',      TRUE),
(24, 'VER',      TRUE),
(24, 'CREAR',    TRUE),
(25, 'VER',      TRUE),
(25, 'CREAR',    TRUE),
(26, 'VER',      TRUE),
(26, 'EDITAR',   TRUE),
(27, 'VER',      TRUE),
(27, 'APROBAR',  TRUE),
(28, 'VER',      TRUE),
(29, 'VER',      TRUE),
(29, 'CREAR',    TRUE),
(30, 'VER',      TRUE),
(30, 'CREAR',    TRUE),
(31, 'VER',      TRUE),
(31, 'EDITAR',   TRUE),
(32, 'VER',      TRUE),
(32, 'APROBAR',  TRUE),
(33, 'VER',      TRUE),
(33, 'CREAR',    TRUE),
(33, 'EDITAR',   TRUE),
(34, 'VER',      TRUE),
(35, 'VER',      TRUE),
(35, 'APROBAR',  TRUE),

-- ==========================================
-- DOCENTES
-- ==========================================
(36, 'VER',      TRUE),
(36, 'CREAR',    TRUE),
(36, 'EDITAR',   TRUE),
(37, 'VER',      TRUE),
(37, 'CREAR',    TRUE),
(38, 'VER',      TRUE),
(38, 'CREAR',    TRUE),
(38, 'EDITAR',   TRUE),
(39, 'VER',      TRUE),
(40, 'VER',      TRUE),
(40, 'CREAR',    TRUE),
(41, 'VER',      TRUE),
(41, 'APROBAR',  TRUE),
(42, 'VER',      TRUE),
(42, 'CREAR',    TRUE),
(42, 'EDITAR',   TRUE),
(43, 'VER',      TRUE),
(44, 'VER',      TRUE),
(44, 'CREAR',    TRUE),
(45, 'VER',      TRUE),
(45, 'CREAR',    TRUE),
(46, 'VER',      TRUE),
(46, 'EDITAR',   TRUE),
(47, 'VER',      TRUE),
(47, 'CREAR',    TRUE),
(48, 'VER',      TRUE),
(48, 'EDITAR',   TRUE),
(49, 'VER',      TRUE),
(49, 'EDITAR',   TRUE),

-- ==========================================
-- FINANZAS
-- ==========================================
(50, 'VER',      TRUE),
(50, 'EXPORTAR', TRUE),
(51, 'VER',      TRUE),
(51, 'CREAR',    TRUE),
(52, 'VER',      TRUE),
(52, 'EDITAR',   TRUE),
(52, 'ELIMINAR', TRUE),
(53, 'VER',      TRUE),
(53, 'CREAR',    TRUE),
(54, 'VER',      TRUE),
(54, 'EXPORTAR', TRUE),
(55, 'VER',      TRUE),
(55, 'EXPORTAR', TRUE),
(56, 'VER',      TRUE),
(56, 'EXPORTAR', TRUE),

-- ==========================================
-- INSTITUCIONAL
-- ==========================================
(57, 'VER',      TRUE),
(58, 'VER',      TRUE),
(58, 'CREAR',    TRUE),
(58, 'EDITAR',   TRUE),
(59, 'VER',      TRUE),
(59, 'CREAR',    TRUE),
(59, 'EDITAR',   TRUE),
(60, 'VER',      TRUE),
(60, 'CREAR',    TRUE),
(60, 'EDITAR',   TRUE),
(61, 'VER',      TRUE),
(61, 'CREAR',    TRUE),
(61, 'EDITAR',   TRUE),
(62, 'VER',      TRUE),
(62, 'CREAR',    TRUE),
(63, 'VER',      TRUE),
(64, 'VER',      TRUE),
(64, 'CREAR',    TRUE),
(64, 'EDITAR',   TRUE),
(65, 'VER',      TRUE),
(65, 'CREAR',    TRUE),
(65, 'EDITAR',   TRUE),
(66, 'VER',      TRUE),
(66, 'CREAR',    TRUE),
(66, 'EDITAR',   TRUE),
(67, 'VER',      TRUE),
(67, 'CREAR',    TRUE),
(67, 'EDITAR',   TRUE),
(68, 'VER',      TRUE),
(68, 'CREAR',    TRUE),
(68, 'EDITAR',   TRUE),
(69, 'VER',      TRUE),
(69, 'CREAR',    TRUE),
(69, 'EDITAR',   TRUE),
(70, 'VER',      TRUE),
(70, 'CREAR',    TRUE),
(70, 'EDITAR',   TRUE),
(71, 'VER',      TRUE),
(71, 'CREAR',    TRUE),
(71, 'EDITAR',   TRUE),
(72, 'VER',      TRUE),
(72, 'CREAR',    TRUE),
(72, 'EDITAR',   TRUE),
(73, 'VER',      TRUE),
(73, 'CREAR',    TRUE),
(73, 'EDITAR',   TRUE),
(74, 'VER',      TRUE),
(74, 'CREAR',    TRUE),
(74, 'EDITAR',   TRUE),
(75, 'VER',      TRUE),
(75, 'CREAR',    TRUE),
(75, 'EDITAR',   TRUE),
(76, 'VER',      TRUE),
(76, 'CREAR',    TRUE),
(76, 'EDITAR',   TRUE),
(77, 'VER',      TRUE),

-- ==========================================
-- REPORTES (todos VER + EXPORTAR)
-- ==========================================
(78, 'VER',      TRUE),
(78, 'EXPORTAR', TRUE),
(79, 'VER',      TRUE),
(79, 'EXPORTAR', TRUE),
(80, 'VER',      TRUE),
(80, 'EXPORTAR', TRUE),
(81, 'VER',      TRUE),
(81, 'EXPORTAR', TRUE),
(82, 'VER',      TRUE),
(82, 'EXPORTAR', TRUE),
(83, 'VER',      TRUE),
(83, 'EXPORTAR', TRUE),
(84, 'VER',      TRUE),
(84, 'EXPORTAR', TRUE),

-- ==========================================
-- SEGURIDAD
-- ==========================================
(85, 'VER',      TRUE),
(85, 'CREAR',    TRUE),
(86, 'VER',      TRUE),
(86, 'CREAR',    TRUE),
(86, 'EDITAR',   TRUE),
(86, 'ELIMINAR', TRUE),
(87, 'VER',      TRUE),
(87, 'CREAR',    TRUE),
(87, 'EDITAR',   TRUE);

SET FOREIGN_KEY_CHECKS = 1;
