-- ============================================
-- SEEDER: TURNOS HORARIOS
-- Sistema de Gestión Académica - Instituto INCOS
-- ============================================

USE instituto_incos;

-- ============================================
-- INSERTAR TURNOS HORARIOS
-- ============================================

-- Insertar turnos horarios
-- NOTA: La tabla turnos NO tiene campo 'codigo' según el schema actual
-- Ajustado según el schema en 05-estructura-academica-parte2.sql

INSERT INTO turnos (nombre, hora_inicio, hora_fin, descripcion, activo) VALUES
('MAÑANA', '08:00:00', '12:00:00', 'Turno de mañana', TRUE),
('TARDE', '14:00:00', '18:30:00', 'Turno de tarde', TRUE),
('NOCHE', '19:00:00', '22:30:00', 'Turno de noche', TRUE)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    hora_inicio = VALUES(hora_inicio),
    hora_fin = VALUES(hora_fin),
    descripcion = VALUES(descripcion),
    activo = VALUES(activo);

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT '✅ Turnos horarios insertados exitosamente' as mensaje;
SELECT COUNT(*) as total_turnos FROM turnos WHERE activo = TRUE;
