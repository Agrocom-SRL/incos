-- ============================================
-- CATÁLOGOS DE REFERENCIA
-- Sistema de Gestión Académica - Instituto INCOS
-- 5 Tablas: idiomas, estados_civiles, tipos_discapacidad, turnos_horarios, tipos_parentesco
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLA: idiomas
-- ============================================

DROP TABLE IF EXISTS idiomas;

CREATE TABLE idiomas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL COMMENT 'Español, Quechua, Aymara, Guaraní, Inglés',
    codigo_iso CHAR(3) COMMENT 'spa, quz, aym, grn, eng',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Índices esenciales
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_codigo_iso (codigo_iso) COMMENT 'Búsqueda por código ISO',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Idiomas';

-- ============================================
-- TABLA: estados_civiles
-- ============================================

DROP TABLE IF EXISTS estados_civiles;

CREATE TABLE estados_civiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL COMMENT 'Soltero(a), Casado(a), Divorciado(a), Viudo(a), Conviviente',
    abreviatura VARCHAR(5) COMMENT 'S, C, D, V, CV',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Índices esenciales
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estados civiles';

-- ============================================
-- TABLA: tipos_discapacidad
-- ============================================

DROP TABLE IF EXISTS tipos_discapacidad;

CREATE TABLE tipos_discapacidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Visual, Auditiva, Motriz, Intelectual, Psicosocial, Múltiple, Otra',
    descripcion TEXT COMMENT 'Descripción del tipo de discapacidad',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Índices esenciales
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tipos de discapacidad (para estadísticas de estudiantes)';

-- ============================================
-- TABLA: tipos_parentesco
-- ============================================

DROP TABLE IF EXISTS tipos_parentesco;

CREATE TABLE tipos_parentesco (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL COMMENT 'Padre, Madre, Abuelo(a), Tío(a), Hermano(a), Tutor(a), Apoderado(a), Orfanato, Otro',
    descripcion TEXT COMMENT 'Descripción del tipo de parentesco',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Índices esenciales
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tipos de parentesco para apoderados/tutores de estudiantes';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
