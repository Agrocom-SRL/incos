-- ============================================
-- SEEDER: tipos_discapacidad
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Tipos de discapacidad
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE tipos_discapacidad;

-- ============================================
-- INSERTAR TIPOS DE DISCAPACIDAD
-- ============================================

INSERT INTO tipos_discapacidad (nombre, descripcion) VALUES
('Visual', 'Discapacidad visual que incluye ceguera total o parcial, baja visión o problemas de visión'),
('Auditiva', 'Discapacidad auditiva que incluye sordera total o parcial, pérdida de audición'),
('Motriz', 'Discapacidad física que afecta el movimiento, coordinación, extremidades o movilidad'),
('Intelectual', 'Discapacidad que afecta las capacidades cognitivas, aprendizaje y desarrollo intelectual'),
('Lenguaje', 'Discapacidad relacionada con el habla, comunicación verbal o dificultades en el lenguaje'),
('Concentración', 'Discapacidad que afecta la atención, concentración, memoria o procesos cognitivos'),
('Psicosocial', 'Discapacidad relacionada con trastornos mentales, psicosociales o de salud mental'),
('Múltiple', 'Personas que presentan dos o más discapacidades simultáneamente'),
('Otra', 'Otras discapacidades no especificadas en las categorías anteriores');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

