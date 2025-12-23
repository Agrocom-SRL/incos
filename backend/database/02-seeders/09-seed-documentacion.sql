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
-- INSERTAR DOCUMENTACIÓN REQUERIDA PARA INSCRIPCIÓN
-- ============================================
-- Nota: Los documentos con documento_padre_id = NULL son documentos de primer orden
-- Los documentos con documento_padre_id != NULL son alternativas/reemplazos del padre
-- Estos documentos generan acta de compromiso si faltan (según ACTA DE COMPROMISO)

-- Documentos de primer orden (padres) - Según ACTA DE COMPROMISO
-- Nota: Solo 'Carnet de Identidad' y 'Certificado de Nacimiento' aceptan fotocopia
-- Solo 'Carnet de Identidad' y 'Diploma de Bachiller' son requeridos (generan acta de compromiso si faltan)
INSERT INTO documentacion (nombre, tipo_documento, documento_padre_id, acepta_fotocopia, es_original, requerido, es_documento_sistema, orden, descripcion) VALUES
('Diploma de Bachiller', 'INSCRIPCION', NULL, FALSE, TRUE, TRUE, FALSE, 1, 'Diploma de bachiller original. Documento requerido para inscripción. Si no se cuenta con él, se puede presentar el boletín de calificaciones de 6to de secundaria del último año académico (gestión pasada)'),
('Certificado de Nacimiento', 'INSCRIPCION', NULL, TRUE, FALSE, FALSE, FALSE, 2, 'Copia simple del certificado de nacimiento'),
('Carnet de Identidad', 'INSCRIPCION', NULL, TRUE, FALSE, TRUE, FALSE, 3, 'Copia simple del carnet de identidad vigente. Documento requerido para inscripción'),
('Foto 3x3 fondo rojo', 'INSCRIPCION', NULL, FALSE, TRUE, FALSE, FALSE, 4, 'Una foto tamaño 3x3 centímetros con fondo rojo - Solo original'),
('Folder con nepaco', 'INSCRIPCION', NULL, FALSE, TRUE, FALSE, FALSE, 5, 'Folder con nepaco para organizar la documentación - Solo original');

-- Obtener el ID del documento padre para crear la alternativa
SET @diploma_id = (SELECT id FROM documentacion WHERE nombre = 'Diploma de Bachiller' LIMIT 1);

-- Documento alternativo (hijo) - Alternativa del Diploma de Bachiller
INSERT INTO documentacion (nombre, tipo_documento, documento_padre_id, acepta_fotocopia, es_original, requerido, es_documento_sistema, orden, descripcion) VALUES
('Libreta de Calificaciones del 6to de Secundaria', 'INSCRIPCION', @diploma_id, FALSE, TRUE, TRUE, FALSE, 1, 'Boletín de calificaciones o certificado de notas del último año académico (6to de secundaria) de la gestión pasada. Documento alternativo al Diploma de Bachiller. Debe ser del último año académico cursado, un año atrás de la gestión actual, entregado por el Ministerio de Educación de Bolivia según la norma educativa vigente. Solo original');

-- Documento del sistema - Generado automáticamente cuando falta documentación requerida
INSERT INTO documentacion (nombre, tipo_documento, documento_padre_id, acepta_fotocopia, es_original, requerido, es_documento_sistema, orden, descripcion) VALUES
('Acta de Compromiso para la Entrega de Documentos', 'OTRO', NULL, FALSE, TRUE, FALSE, TRUE, 1, 'Acta de compromiso generada automáticamente por el sistema cuando el estudiante no presenta alguno de los documentos requeridos para la inscripción. El estudiante se compromete a completar la documentación faltante en un plazo máximo de 10 días a partir de la fecha de registro');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

