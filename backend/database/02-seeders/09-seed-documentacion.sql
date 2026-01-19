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
-- Nota: Los documentos se traen originales pero no quedan en el sistema, las copias quedan dentro del sistema
-- Los documentos requeridos NO se marcan como original pero SÍ como requerido
-- No se aceptan documentos antiguos de más de 5 años (excepto libretas que generan acta de compromiso)
-- IDs fijos para facilitar migraciones y referencias consistentes
INSERT INTO documentacion (id, nombre, tipo_documento, documento_padre_id, acepta_fotocopia, es_original, requerido, es_documento_sistema, orden, descripcion) VALUES
(1, 'Diploma de Bachiller', 'INSCRIPCION', NULL, TRUE, FALSE, TRUE, FALSE, 1, 'Diploma de bachiller que acredita la finalización de estudios secundarios. Se trae original pero queda copia en el sistema. No se aceptan documentos de más de 5 años.'),
(2, 'Certificado de Nacimiento', 'INSCRIPCION', NULL, TRUE, FALSE, FALSE, FALSE, 2, 'Certificado que acredita el lugar y fecha de nacimiento. Se trae original pero queda copia en el sistema.'),
(3, 'Carnet de Identidad', 'INSCRIPCION', NULL, TRUE, FALSE, TRUE, FALSE, 3, 'Documento de identidad personal vigente. Se trae original pero queda copia en el sistema.'),
(4, 'Foto 3x3 fondo rojo', 'INSCRIPCION', NULL, FALSE, FALSE, FALSE, FALSE, 4, 'Fotografía tamaño 3x3 centímetros con fondo rojo'),
(5, 'Folder con nepaco', 'INSCRIPCION', NULL, FALSE, FALSE, FALSE, FALSE, 5, 'Folder con nepaco para organizar la documentación');

-- Documento alternativo (hijo) - Alternativa del Diploma de Bachiller
-- documento_padre_id = 1 (Diploma de Bachiller)
-- NOTA: Libretas de más de 5 años generan acta de compromiso a traer la documentación original, después se acepta la fotocopia
INSERT INTO documentacion (id, nombre, tipo_documento, documento_padre_id, acepta_fotocopia, es_original, requerido, es_documento_sistema, orden, descripcion) VALUES
(6, 'Libreta de Calificaciones del 6to de Secundaria', 'INSCRIPCION', 1, TRUE, FALSE, TRUE, FALSE, 1, 'Boletín de calificaciones del último año académico (6to de secundaria) de la gestión pasada. Alternativa al Diploma de Bachiller. Si tiene más de 5 años, se genera acta de compromiso para traer el original, después se acepta la fotocopia.');

-- Documento del sistema - Generado automáticamente cuando falta documentación requerida
INSERT INTO documentacion (id, nombre, tipo_documento, documento_padre_id, acepta_fotocopia, es_original, requerido, es_documento_sistema, orden, descripcion) VALUES
(7, 'Acta de Compromiso para la Entrega de Documentos', 'OTRO', NULL, FALSE, FALSE, FALSE, TRUE, 1, 'Acta de compromiso generada automáticamente cuando falta documentación. El estudiante se compromete a completar la documentación faltante');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

