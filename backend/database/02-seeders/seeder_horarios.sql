-- ============================================
-- SEEDER: horarios
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Bloques horarios de clases por turno
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE horarios;

-- ============================================
-- INSERTAR HORARIOS - TURNO TARDE
-- Bloques de 45 minutos de 13:45 a 18:15
-- ============================================

-- LUNES - TARDE
INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - LUNES TARDE', 'LUNES', '13:45:00', '14:30:00', 'TARDE', 1, 'CLASES'),
('BLOQUE 2 - LUNES TARDE', 'LUNES', '14:30:00', '15:15:00', 'TARDE', 2, 'CLASES'),
('BLOQUE 3 - LUNES TARDE', 'LUNES', '15:15:00', '16:00:00', 'TARDE', 3, 'CLASES'),
('BLOQUE 4 - LUNES TARDE', 'LUNES', '16:00:00', '16:45:00', 'TARDE', 4, 'CLASES'),
('BLOQUE 5 - LUNES TARDE', 'LUNES', '16:45:00', '17:30:00', 'TARDE', 5, 'CLASES'),
('BLOQUE 6 - LUNES TARDE', 'LUNES', '17:30:00', '18:15:00', 'TARDE', 6, 'CLASES');

-- MARTES - TARDE
INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - MARTES TARDE', 'MARTES', '13:45:00', '14:30:00', 'TARDE', 1, 'CLASES'),
('BLOQUE 2 - MARTES TARDE', 'MARTES', '14:30:00', '15:15:00', 'TARDE', 2, 'CLASES'),
('BLOQUE 3 - MARTES TARDE', 'MARTES', '15:15:00', '16:00:00', 'TARDE', 3, 'CLASES'),
('BLOQUE 4 - MARTES TARDE', 'MARTES', '16:00:00', '16:45:00', 'TARDE', 4, 'CLASES'),
('BLOQUE 5 - MARTES TARDE', 'MARTES', '16:45:00', '17:30:00', 'TARDE', 5, 'CLASES'),
('BLOQUE 6 - MARTES TARDE', 'MARTES', '17:30:00', '18:15:00', 'TARDE', 6, 'CLASES');

-- MIERCOLES - TARDE
INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - MIERCOLES TARDE', 'MIERCOLES', '13:45:00', '14:30:00', 'TARDE', 1, 'CLASES'),
('BLOQUE 2 - MIERCOLES TARDE', 'MIERCOLES', '14:30:00', '15:15:00', 'TARDE', 2, 'CLASES'),
('BLOQUE 3 - MIERCOLES TARDE', 'MIERCOLES', '15:15:00', '16:00:00', 'TARDE', 3, 'CLASES'),
('BLOQUE 4 - MIERCOLES TARDE', 'MIERCOLES', '16:00:00', '16:45:00', 'TARDE', 4, 'CLASES'),
('BLOQUE 5 - MIERCOLES TARDE', 'MIERCOLES', '16:45:00', '17:30:00', 'TARDE', 5, 'CLASES'),
('BLOQUE 6 - MIERCOLES TARDE', 'MIERCOLES', '17:30:00', '18:15:00', 'TARDE', 6, 'CLASES');

-- JUEVES - TARDE
INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - JUEVES TARDE', 'JUEVES', '13:45:00', '14:30:00', 'TARDE', 1, 'CLASES'),
('BLOQUE 2 - JUEVES TARDE', 'JUEVES', '14:30:00', '15:15:00', 'TARDE', 2, 'CLASES'),
('BLOQUE 3 - JUEVES TARDE', 'JUEVES', '15:15:00', '16:00:00', 'TARDE', 3, 'CLASES'),
('BLOQUE 4 - JUEVES TARDE', 'JUEVES', '16:00:00', '16:45:00', 'TARDE', 4, 'CLASES'),
('BLOQUE 5 - JUEVES TARDE', 'JUEVES', '16:45:00', '17:30:00', 'TARDE', 5, 'CLASES'),
('BLOQUE 6 - JUEVES TARDE', 'JUEVES', '17:30:00', '18:15:00', 'TARDE', 6, 'CLASES');

-- VIERNES - TARDE
INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - VIERNES TARDE', 'VIERNES', '13:45:00', '14:30:00', 'TARDE', 1, 'CLASES'),
('BLOQUE 2 - VIERNES TARDE', 'VIERNES', '14:30:00', '15:15:00', 'TARDE', 2, 'CLASES'),
('BLOQUE 3 - VIERNES TARDE', 'VIERNES', '15:15:00', '16:00:00', 'TARDE', 3, 'CLASES'),
('BLOQUE 4 - VIERNES TARDE', 'VIERNES', '16:00:00', '16:45:00', 'TARDE', 4, 'CLASES'),
('BLOQUE 5 - VIERNES TARDE', 'VIERNES', '16:45:00', '17:30:00', 'TARDE', 5, 'CLASES'),
('BLOQUE 6 - VIERNES TARDE', 'VIERNES', '17:30:00', '18:15:00', 'TARDE', 6, 'CLASES');

-- ============================================
-- INSERTAR HORARIOS - TURNO NOCHE
-- Bloques de 45 minutos de 18:15 a 22:00
-- ============================================

-- LUNES - NOCHE
INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - LUNES NOCHE', 'LUNES', '18:15:00', '19:00:00', 'NOCHE', 1, 'CLASES'),
('BLOQUE 2 - LUNES NOCHE', 'LUNES', '19:00:00', '19:45:00', 'NOCHE', 2, 'CLASES'),
('BLOQUE 3 - LUNES NOCHE', 'LUNES', '19:45:00', '20:30:00', 'NOCHE', 3, 'CLASES'),
('BLOQUE 4 - LUNES NOCHE', 'LUNES', '20:30:00', '21:15:00', 'NOCHE', 4, 'CLASES'),
('BLOQUE 5 - LUNES NOCHE', 'LUNES', '21:15:00', '22:00:00', 'NOCHE', 5, 'CLASES');

-- MARTES - NOCHE
INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - MARTES NOCHE', 'MARTES', '18:15:00', '19:00:00', 'NOCHE', 1, 'CLASES'),
('BLOQUE 2 - MARTES NOCHE', 'MARTES', '19:00:00', '19:45:00', 'NOCHE', 2, 'CLASES'),
('BLOQUE 3 - MARTES NOCHE', 'MARTES', '19:45:00', '20:30:00', 'NOCHE', 3, 'CLASES'),
('BLOQUE 4 - MARTES NOCHE', 'MARTES', '20:30:00', '21:15:00', 'NOCHE', 4, 'CLASES'),
('BLOQUE 5 - MARTES NOCHE', 'MARTES', '21:15:00', '22:00:00', 'NOCHE', 5, 'CLASES');

-- MIERCOLES - NOCHE
INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - MIERCOLES NOCHE', 'MIERCOLES', '18:15:00', '19:00:00', 'NOCHE', 1, 'CLASES'),
('BLOQUE 2 - MIERCOLES NOCHE', 'MIERCOLES', '19:00:00', '19:45:00', 'NOCHE', 2, 'CLASES'),
('BLOQUE 3 - MIERCOLES NOCHE', 'MIERCOLES', '19:45:00', '20:30:00', 'NOCHE', 3, 'CLASES'),
('BLOQUE 4 - MIERCOLES NOCHE', 'MIERCOLES', '20:30:00', '21:15:00', 'NOCHE', 4, 'CLASES'),
('BLOQUE 5 - MIERCOLES NOCHE', 'MIERCOLES', '21:15:00', '22:00:00', 'NOCHE', 5, 'CLASES');

-- JUEVES - NOCHE
INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - JUEVES NOCHE', 'JUEVES', '18:15:00', '19:00:00', 'NOCHE', 1, 'CLASES'),
('BLOQUE 2 - JUEVES NOCHE', 'JUEVES', '19:00:00', '19:45:00', 'NOCHE', 2, 'CLASES'),
('BLOQUE 3 - JUEVES NOCHE', 'JUEVES', '19:45:00', '20:30:00', 'NOCHE', 3, 'CLASES'),
('BLOQUE 4 - JUEVES NOCHE', 'JUEVES', '20:30:00', '21:15:00', 'NOCHE', 4, 'CLASES'),
('BLOQUE 5 - JUEVES NOCHE', 'JUEVES', '21:15:00', '22:00:00', 'NOCHE', 5, 'CLASES');

-- VIERNES - NOCHE
INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - VIERNES NOCHE', 'VIERNES', '18:15:00', '19:00:00', 'NOCHE', 1, 'CLASES'),
('BLOQUE 2 - VIERNES NOCHE', 'VIERNES', '19:00:00', '19:45:00', 'NOCHE', 2, 'CLASES'),
('BLOQUE 3 - VIERNES NOCHE', 'VIERNES', '19:45:00', '20:30:00', 'NOCHE', 3, 'CLASES'),
('BLOQUE 4 - VIERNES NOCHE', 'VIERNES', '20:30:00', '21:15:00', 'NOCHE', 4, 'CLASES'),
('BLOQUE 5 - VIERNES NOCHE', 'VIERNES', '21:15:00', '22:00:00', 'NOCHE', 5, 'CLASES');

-- ============================================
-- INSERTAR HORARIOS - SABADO
-- Bloques de 45 minutos de 15:00 a 19:00
-- ============================================

INSERT INTO horarios (nombre, dia, hora_inicio, hora_fin, turno, numero_bloque, tipo_horario) VALUES
('BLOQUE 1 - SABADO', 'SABADO', '15:00:00', '15:45:00', 'TARDE', 1, 'CLASES'),
('BLOQUE 2 - SABADO', 'SABADO', '15:45:00', '16:30:00', 'TARDE', 2, 'CLASES'),
('BLOQUE 3 - SABADO', 'SABADO', '16:30:00', '17:15:00', 'TARDE', 3, 'CLASES'),
('BLOQUE 4 - SABADO', 'SABADO', '17:30:00', '18:15:00', 'TARDE', 4, 'CLASES'),
('BLOQUE 5 - SABADO', 'SABADO', '18:15:00', '19:00:00', 'TARDE', 5, 'CLASES');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
