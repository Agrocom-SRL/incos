-- ============================================
-- SEEDER: documentacion
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Documentos requeridos para inscripción
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE documentacion;

-- ============================================
-- INSERTAR DOCUMENTACIÓN REQUERIDA
-- ============================================

INSERT INTO documentacion (nombre, tipo_documento, acepta_fotocopia, requerido, orden, descripcion) VALUES
('Cédula de Identidad', 'INSCRIPCION', TRUE, TRUE, 1, 'Fotocopia simple de carnet de identidad vigente'),
('Diploma de Bachiller', 'INSCRIPCION', TRUE, TRUE, 2, 'Diploma de bachiller (original y fotocopia simple)'),
('Certificado de Nacimiento', 'INSCRIPCION', TRUE, TRUE, 3, 'Certificado de nacimiento original o fotocopia legalizada'),
('Pago de Matrícula Anual', 'INSCRIPCION', FALSE, TRUE, 4, 'Comprobante de pago de matrícula anual (400 Bs.) - Solo original');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

