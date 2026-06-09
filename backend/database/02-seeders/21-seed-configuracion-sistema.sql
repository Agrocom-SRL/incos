-- ============================================
-- SEEDER: configuracion_sistema
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Configuración del sistema
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE configuracion_sistema;

-- ============================================
-- INSERTAR CONFIGURACIÓN DEL SISTEMA
-- ============================================

-- Sincronizado con dump del servidor (incluye correlativos de admisión por gestión)
INSERT INTO configuracion_sistema (id, clave, valor, tipo, descripcion, activo) VALUES
(1, 'gestion_actual', '2026', 'NUMBER', 'Gestión activa actual para generación de códigos de estudiantes', TRUE),
(2, 'admision_gestion_2026', '305', 'NUMBER', 'Último número correlativo usado para códigos de estudiantes en la gestión 2026', TRUE),
(3, 'admision_gestion_2025', '96', 'NUMBER', 'Último número correlativo usado para códigos de estudiantes en la gestión 2025', TRUE),
(4, 'admision_gestion_2024', '4', 'NUMBER', 'Último número correlativo usado para códigos de estudiantes en la gestión 2024', TRUE),
(5, 'admision_gestion_2023', '1', 'NUMBER', 'Último número correlativo usado para códigos de estudiantes en la gestión 2023', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
