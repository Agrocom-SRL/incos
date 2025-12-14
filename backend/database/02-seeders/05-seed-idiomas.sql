-- ============================================
-- SEEDER: idiomas
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Idiomas de Bolivia y principales
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE idiomas;

-- ============================================
-- INSERTAR IDIOMAS
-- ============================================

INSERT INTO idiomas (nombre, codigo_iso) VALUES
('Español', 'spa'),
('Quechua', 'que'),
('Aymara', 'aym'),
('Guaraní', 'grn'),
('Inglés', 'eng'),
('Portugués', 'por'),
('Francés', 'fra'),
('Alemán', 'deu');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

