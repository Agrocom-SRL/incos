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

-- Gestión activa actual (año 2025)
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria, activo) VALUES
('codigo_estudiante_gestion_activa', '2025', 'NUMBER', 'Gestión activa actual para generación de códigos de estudiantes', 'CODIGOS_ESTUDIANTE', TRUE);

-- Correlativo inicial para la gestión 2025 (comienza en 0)
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria, activo) VALUES
('codigo_estudiante_correlativo_2025', '0', 'NUMBER', 'Último número correlativo usado para códigos de estudiantes en la gestión 2025', 'CODIGOS_ESTUDIANTE', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Configuración del sistema inicializada' as mensaje;

SELECT 
    clave,
    valor,
    tipo,
    categoria,
    descripcion
FROM configuracion_sistema
WHERE categoria = 'CODIGOS_ESTUDIANTE'
ORDER BY clave;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

