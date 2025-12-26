-- ============================================
-- TABLA INTERMEDIA: estudiantes_discapacidades
-- Sistema de Gestión Académica - Instituto INCOS
-- Relación muchos a muchos entre estudiantes y tipos_discapacidad
-- Permite que un estudiante tenga múltiples discapacidades con descripciones específicas
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLA
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tabla si existe
DROP TABLE IF EXISTS estudiantes_discapacidades;

-- ============================================
-- FASE 2: CREACIÓN DE TABLA
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: estudiantes_discapacidades
-- ============================================

CREATE TABLE estudiantes_discapacidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT COMMENT 'Estudiante',
    tipo_discapacidad_id INT COMMENT 'Tipo de discapacidad',
    
    -- Detalles específicos de esta discapacidad
    descripcion TEXT COMMENT 'Descripción detallada de la discapacidad específica del estudiante (ej: grado de ceguera, tipo de problema visual, si es por diabetes, si es congénito, etc.)',
    grado_discapacidad ENUM('LEVE', 'MODERADO', 'SEVERO', 'PROFUNDO') COMMENT 'Grado de discapacidad',
    causa VARCHAR(100) COMMENT 'Causa de la discapacidad (congénito, adquirido, etc.)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_discapacidad_id) REFERENCES tipos_discapacidad(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_estudiante (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_tipo_discapacidad (tipo_discapacidad_id) COMMENT 'Búsqueda por tipo de discapacidad',
    INDEX idx_estudiante_tipo (estudiante_id, tipo_discapacidad_id, activo, deleted_at) COMMENT 'Búsqueda por estudiante y tipo de discapacidad',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación muchos a muchos entre estudiantes y tipos de discapacidad. Permite que un estudiante tenga múltiples discapacidades, cada una con su descripción específica.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

