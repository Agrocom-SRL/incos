-- ============================================
-- SEEDER: BECAS Y DESCUENTOS
-- Sistema de Gestión Académica - Instituto INCOS
-- ============================================

USE instituto_incos;

-- ============================================
-- INSERTAR BECAS Y DESCUENTOS
-- ============================================

-- Insertar becas y descuentos
-- Ajustado según el schema actual en 06-estudiantes-parte2.sql

INSERT INTO becas_descuentos (codigo, nombre, porcentaje, descripcion, activo) VALUES
('BECA-100', 'BECA 100%', 100.00, 'Beca completa del instituto', TRUE),
('BECA-50', 'BECA 50%', 50.00, 'Beca parcial del 50%', TRUE),
('BECA-25', 'BECA 25%', 25.00, 'Beca parcial del 25%', TRUE),
('BECA-CM', 'BECA CONCEJO MUNICIPAL', 100.00, 'Beca otorgada por el Concejo Municipal', TRUE),
('BECA-SOC', 'BECA SOCIAL DE 20 CUPOS', 100.00, 'Beca social con cupo limitado a 20 estudiantes', TRUE)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    porcentaje = VALUES(porcentaje),
    descripcion = VALUES(descripcion),
    activo = VALUES(activo);

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT '✅ Becas y descuentos insertados exitosamente' as mensaje;
SELECT COUNT(*) as total_becas FROM becas_descuentos WHERE activo = TRUE;
