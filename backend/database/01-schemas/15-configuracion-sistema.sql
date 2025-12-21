-- ============================================
-- CONFIGURACIÓN DEL SISTEMA
-- Sistema de Gestión Académica - Instituto INCOS
-- 1 Tabla: configuracion_sistema
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tabla si existe
DROP TABLE IF EXISTS configuracion_sistema;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: configuracion_sistema
-- ============================================

CREATE TABLE configuracion_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Clave única de configuración
    clave VARCHAR(100) NOT NULL UNIQUE COMMENT 'Clave única de configuración (ej: codigo_estudiante_correlativo_2025)',
    
    -- Valor de configuración (puede ser texto, número, JSON, etc.)
    valor TEXT NOT NULL COMMENT 'Valor de la configuración',
    
    -- Tipo de valor para validación y conversión
    tipo ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE') DEFAULT 'STRING' COMMENT 'Tipo de dato del valor',
    
    -- Descripción
    descripcion TEXT COMMENT 'Descripción de qué representa esta configuración',
    
    -- Categoría para agrupar configuraciones relacionadas
    categoria VARCHAR(50) COMMENT 'Categoría de la configuración (ej: CODIGOS_ESTUDIANTE, NOTIFICACIONES, etc.)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_clave (clave) COMMENT 'Búsqueda por clave',
    INDEX idx_categoria (categoria) COMMENT 'Búsqueda por categoría',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_categoria_activo (categoria, activo, deleted_at) COMMENT 'Búsqueda por categoría y activo'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración del sistema: guarda settings como correlativos de códigos de estudiantes por gestión, etc.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================

-- Ejemplo: Configuración inicial para código de estudiante
-- NOTA: Estos valores se crearán automáticamente cuando se registre el primer estudiante
-- o se pueden crear manualmente para gestiones específicas

-- INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria) VALUES
-- ('codigo_estudiante_correlativo_2025', '0', 'NUMBER', 'Último número correlativo usado para códigos de estudiantes en la gestión 2025', 'CODIGOS_ESTUDIANTE'),
-- ('codigo_estudiante_gestion_activa', '2025', 'NUMBER', 'Gestión activa actual para generación de códigos de estudiantes', 'CODIGOS_ESTUDIANTE');

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Configuración del sistema creada (1 tabla)' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME = 'configuracion_sistema';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
CONFIGURACIÓN DEL SISTEMA:

Esta tabla permite guardar configuraciones del sistema de forma flexible.
Para el código de estudiantes, se usará el siguiente formato de clave:

- codigo_estudiante_correlativo_{año}: Último número correlativo usado para esa gestión
  Ejemplo: codigo_estudiante_correlativo_2025 = "1234"
  
- codigo_estudiante_gestion_activa: Gestión activa actual
  Ejemplo: codigo_estudiante_gestion_activa = "2025"

FORMATO DE CÓDIGO DE ESTUDIANTE:
- Formato: {AÑO}-{CORRELATIVO}
- Ejemplo: 2025-0001, 2025-0002, ..., 2025-1234
- El correlativo se incrementa automáticamente por gestión
- Cuando se cierra una gestión y comienza otra, el correlativo vuelve a 0 para la nueva gestión

MIGRACIÓN DE ESTUDIANTES ANTIGUOS:
- Para estudiantes antiguos que se migren, se puede establecer manualmente el correlativo
- Ejemplo: Si el último estudiante migrado tiene código 2024-1500, se puede establecer:
  INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria) VALUES
  ('codigo_estudiante_correlativo_2024', '1500', 'NUMBER', 'Último correlativo usado en migración', 'CODIGOS_ESTUDIANTE');
  
- Esto permite que los nuevos estudiantes de 2025 comiencen desde 0001, pero se mantiene
  el registro histórico de la gestión 2024.
*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
