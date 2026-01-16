-- ============================================
-- SEEDER: horarios
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Horarios de clases por turno
-- ============================================
-- IDs fijos: 1-60 (30 Tarde + 25 Noche + 5 Sábado)
-- Nota: Se usa "HORARIO" en lugar de "BLOQUE" para mayor claridad

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE horarios;

-- ============================================
-- INSERTAR HORARIOS - TURNO TARDE
-- Horarios de 45 minutos de 13:45 a 18:15
-- IDs: 1-30
-- ============================================

-- LUNES - TARDE
INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(1, 'HORARIO 1 - LUNES TARDE', 'LUNES', '13:45:00', '14:30:00', 'TARDE', 1, 'CLASES'),
(2, 'HORARIO 2 - LUNES TARDE', 'LUNES', '14:30:00', '15:15:00', 'TARDE', 2, 'CLASES'),
(3, 'HORARIO 3 - LUNES TARDE', 'LUNES', '15:15:00', '16:00:00', 'TARDE', 3, 'CLASES'),
(4, 'HORARIO 4 - LUNES TARDE', 'LUNES', '16:00:00', '16:45:00', 'TARDE', 4, 'CLASES'),
(5, 'HORARIO 5 - LUNES TARDE', 'LUNES', '16:45:00', '17:30:00', 'TARDE', 5, 'CLASES'),
(6, 'HORARIO 6 - LUNES TARDE', 'LUNES', '17:30:00', '18:15:00', 'TARDE', 6, 'CLASES');

-- MARTES - TARDE
INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(7, 'HORARIO 1 - MARTES TARDE', 'MARTES', '13:45:00', '14:30:00', 'TARDE', 1, 'CLASES'),
(8, 'HORARIO 2 - MARTES TARDE', 'MARTES', '14:30:00', '15:15:00', 'TARDE', 2, 'CLASES'),
(9, 'HORARIO 3 - MARTES TARDE', 'MARTES', '15:15:00', '16:00:00', 'TARDE', 3, 'CLASES'),
(10, 'HORARIO 4 - MARTES TARDE', 'MARTES', '16:00:00', '16:45:00', 'TARDE', 4, 'CLASES'),
(11, 'HORARIO 5 - MARTES TARDE', 'MARTES', '16:45:00', '17:30:00', 'TARDE', 5, 'CLASES'),
(12, 'HORARIO 6 - MARTES TARDE', 'MARTES', '17:30:00', '18:15:00', 'TARDE', 6, 'CLASES');

-- MIERCOLES - TARDE
INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(13, 'HORARIO 1 - MIERCOLES TARDE', 'MIERCOLES', '13:45:00', '14:30:00', 'TARDE', 1, 'CLASES'),
(14, 'HORARIO 2 - MIERCOLES TARDE', 'MIERCOLES', '14:30:00', '15:15:00', 'TARDE', 2, 'CLASES'),
(15, 'HORARIO 3 - MIERCOLES TARDE', 'MIERCOLES', '15:15:00', '16:00:00', 'TARDE', 3, 'CLASES'),
(16, 'HORARIO 4 - MIERCOLES TARDE', 'MIERCOLES', '16:00:00', '16:45:00', 'TARDE', 4, 'CLASES'),
(17, 'HORARIO 5 - MIERCOLES TARDE', 'MIERCOLES', '16:45:00', '17:30:00', 'TARDE', 5, 'CLASES'),
(18, 'HORARIO 6 - MIERCOLES TARDE', 'MIERCOLES', '17:30:00', '18:15:00', 'TARDE', 6, 'CLASES');

-- JUEVES - TARDE
INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(19, 'HORARIO 1 - JUEVES TARDE', 'JUEVES', '13:45:00', '14:30:00', 'TARDE', 1, 'CLASES'),
(20, 'HORARIO 2 - JUEVES TARDE', 'JUEVES', '14:30:00', '15:15:00', 'TARDE', 2, 'CLASES'),
(21, 'HORARIO 3 - JUEVES TARDE', 'JUEVES', '15:15:00', '16:00:00', 'TARDE', 3, 'CLASES'),
(22, 'HORARIO 4 - JUEVES TARDE', 'JUEVES', '16:00:00', '16:45:00', 'TARDE', 4, 'CLASES'),
(23, 'HORARIO 5 - JUEVES TARDE', 'JUEVES', '16:45:00', '17:30:00', 'TARDE', 5, 'CLASES'),
(24, 'HORARIO 6 - JUEVES TARDE', 'JUEVES', '17:30:00', '18:15:00', 'TARDE', 6, 'CLASES');

-- VIERNES - TARDE
INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(25, 'HORARIO 1 - VIERNES TARDE', 'VIERNES', '13:45:00', '14:30:00', 'TARDE', 1, 'CLASES'),
(26, 'HORARIO 2 - VIERNES TARDE', 'VIERNES', '14:30:00', '15:15:00', 'TARDE', 2, 'CLASES'),
(27, 'HORARIO 3 - VIERNES TARDE', 'VIERNES', '15:15:00', '16:00:00', 'TARDE', 3, 'CLASES'),
(28, 'HORARIO 4 - VIERNES TARDE', 'VIERNES', '16:00:00', '16:45:00', 'TARDE', 4, 'CLASES'),
(29, 'HORARIO 5 - VIERNES TARDE', 'VIERNES', '16:45:00', '17:30:00', 'TARDE', 5, 'CLASES'),
(30, 'HORARIO 6 - VIERNES TARDE', 'VIERNES', '17:30:00', '18:15:00', 'TARDE', 6, 'CLASES');

-- ============================================
-- INSERTAR HORARIOS - TURNO NOCHE
-- Horarios de 45 minutos de 18:15 a 22:00
-- IDs: 31-55
-- ============================================

-- LUNES - NOCHE
INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(31, 'HORARIO 1 - LUNES NOCHE', 'LUNES', '18:15:00', '19:00:00', 'NOCHE', 1, 'CLASES'),
(32, 'HORARIO 2 - LUNES NOCHE', 'LUNES', '19:00:00', '19:45:00', 'NOCHE', 2, 'CLASES'),
(33, 'HORARIO 3 - LUNES NOCHE', 'LUNES', '19:45:00', '20:30:00', 'NOCHE', 3, 'CLASES'),
(34, 'HORARIO 4 - LUNES NOCHE', 'LUNES', '20:30:00', '21:15:00', 'NOCHE', 4, 'CLASES'),
(35, 'HORARIO 5 - LUNES NOCHE', 'LUNES', '21:15:00', '22:00:00', 'NOCHE', 5, 'CLASES');

-- MARTES - NOCHE
INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(36, 'HORARIO 1 - MARTES NOCHE', 'MARTES', '18:15:00', '19:00:00', 'NOCHE', 1, 'CLASES'),
(37, 'HORARIO 2 - MARTES NOCHE', 'MARTES', '19:00:00', '19:45:00', 'NOCHE', 2, 'CLASES'),
(38, 'HORARIO 3 - MARTES NOCHE', 'MARTES', '19:45:00', '20:30:00', 'NOCHE', 3, 'CLASES'),
(39, 'HORARIO 4 - MARTES NOCHE', 'MARTES', '20:30:00', '21:15:00', 'NOCHE', 4, 'CLASES'),
(40, 'HORARIO 5 - MARTES NOCHE', 'MARTES', '21:15:00', '22:00:00', 'NOCHE', 5, 'CLASES');

-- MIERCOLES - NOCHE
INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(41, 'HORARIO 1 - MIERCOLES NOCHE', 'MIERCOLES', '18:15:00', '19:00:00', 'NOCHE', 1, 'CLASES'),
(42, 'HORARIO 2 - MIERCOLES NOCHE', 'MIERCOLES', '19:00:00', '19:45:00', 'NOCHE', 2, 'CLASES'),
(43, 'HORARIO 3 - MIERCOLES NOCHE', 'MIERCOLES', '19:45:00', '20:30:00', 'NOCHE', 3, 'CLASES'),
(44, 'HORARIO 4 - MIERCOLES NOCHE', 'MIERCOLES', '20:30:00', '21:15:00', 'NOCHE', 4, 'CLASES'),
(45, 'HORARIO 5 - MIERCOLES NOCHE', 'MIERCOLES', '21:15:00', '22:00:00', 'NOCHE', 5, 'CLASES');

-- JUEVES - NOCHE
INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(46, 'HORARIO 1 - JUEVES NOCHE', 'JUEVES', '18:15:00', '19:00:00', 'NOCHE', 1, 'CLASES'),
(47, 'HORARIO 2 - JUEVES NOCHE', 'JUEVES', '19:00:00', '19:45:00', 'NOCHE', 2, 'CLASES'),
(48, 'HORARIO 3 - JUEVES NOCHE', 'JUEVES', '19:45:00', '20:30:00', 'NOCHE', 3, 'CLASES'),
(49, 'HORARIO 4 - JUEVES NOCHE', 'JUEVES', '20:30:00', '21:15:00', 'NOCHE', 4, 'CLASES'),
(50, 'HORARIO 5 - JUEVES NOCHE', 'JUEVES', '21:15:00', '22:00:00', 'NOCHE', 5, 'CLASES');

-- VIERNES - NOCHE
INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(51, 'HORARIO 1 - VIERNES NOCHE', 'VIERNES', '18:15:00', '19:00:00', 'NOCHE', 1, 'CLASES'),
(52, 'HORARIO 2 - VIERNES NOCHE', 'VIERNES', '19:00:00', '19:45:00', 'NOCHE', 2, 'CLASES'),
(53, 'HORARIO 3 - VIERNES NOCHE', 'VIERNES', '19:45:00', '20:30:00', 'NOCHE', 3, 'CLASES'),
(54, 'HORARIO 4 - VIERNES NOCHE', 'VIERNES', '20:30:00', '21:15:00', 'NOCHE', 4, 'CLASES'),
(55, 'HORARIO 5 - VIERNES NOCHE', 'VIERNES', '21:15:00', '22:00:00', 'NOCHE', 5, 'CLASES');

-- ============================================
-- INSERTAR HORARIOS - SABADO
-- Horarios de 45 minutos de 15:00 a 19:00
-- IDs: 56-60
-- ============================================

INSERT INTO horarios (id, nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
(56, 'HORARIO 1 - SABADO', 'SABADO', '15:00:00', '15:45:00', 'TARDE', 1, 'CLASES'),
(57, 'HORARIO 2 - SABADO', 'SABADO', '15:45:00', '16:30:00', 'TARDE', 2, 'CLASES'),
(58, 'HORARIO 3 - SABADO', 'SABADO', '16:30:00', '17:15:00', 'TARDE', 3, 'CLASES'),
(59, 'HORARIO 4 - SABADO', 'SABADO', '17:30:00', '18:15:00', 'TARDE', 4, 'CLASES'),
(60, 'HORARIO 5 - SABADO', 'SABADO', '18:15:00', '19:00:00', 'TARDE', 5, 'CLASES');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
