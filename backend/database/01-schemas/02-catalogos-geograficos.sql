-- ============================================
-- CATÁLOGOS GEOGRÁFICOS
-- Sistema de Gestión Académica - Instituto INCOS
-- 4 Tablas: paises, departamentos, provincias, municipios
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS municipios;
DROP TABLE IF EXISTS provincias;
DROP TABLE IF EXISTS departamentos;
DROP TABLE IF EXISTS paises;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: paises
-- ============================================

CREATE TABLE paises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del país',
    codigo_iso CHAR(3) NOT NULL COMMENT 'Código ISO 3166-1 alpha-3 (ej: BOL, ARG, PER)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    -- Índices esenciales
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda frecuente por nombre',
    INDEX idx_codigo_iso (codigo_iso) COMMENT 'Búsqueda por código ISO',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de países';

-- ============================================
-- TABLA: departamentos
-- ============================================

CREATE TABLE departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pais_id INT NULL COMMENT 'País al que pertenece (NULL permite flexibilidad en migraciones)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del departamento',
    codigo VARCHAR(10) COMMENT 'Código abreviado (SC, LP, CB, etc.)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE SET NULL,
    -- NOTA: Foreign Keys a usuarios omitidas para evitar dependencias circulares
    
    -- Índices esenciales
    INDEX idx_pais_id (pais_id) COMMENT 'Búsqueda por país (JOIN frecuente)',
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_pais_nombre (pais_id, nombre, activo, deleted_at) COMMENT 'Búsqueda por país y nombre',
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Departamentos de Bolivia';

-- ============================================
-- TABLA: provincias
-- ============================================

CREATE TABLE provincias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    departamento_id INT NULL COMMENT 'Departamento al que pertenece (NULL permite flexibilidad en migraciones)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la provincia',
    codigo VARCHAR(10) COMMENT 'Código abreviado',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL,
    -- NOTA: Foreign Keys a usuarios omitidas para evitar dependencias circulares
    
    -- Índices esenciales
    INDEX idx_departamento_id (departamento_id) COMMENT 'Búsqueda por departamento (JOIN frecuente)',
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_departamento_nombre (departamento_id, nombre, activo, deleted_at) COMMENT 'Búsqueda por departamento y nombre',
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Provincias de Bolivia';

-- ============================================
-- TABLA: municipios
-- ============================================

CREATE TABLE municipios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provincia_id INT NULL COMMENT 'Provincia a la que pertenece (NULL permite flexibilidad en migraciones)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del municipio',
    codigo VARCHAR(10) COMMENT 'Código abreviado',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (provincia_id) REFERENCES provincias(id) ON DELETE SET NULL,
    -- NOTA: Foreign Keys a usuarios omitidas para evitar dependencias circulares
    
    -- Índices esenciales
    INDEX idx_provincia_id (provincia_id) COMMENT 'Búsqueda por provincia (JOIN frecuente)',
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_provincia_nombre (provincia_id, nombre, activo, deleted_at) COMMENT 'Búsqueda por provincia y nombre',
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Municipios de Bolivia';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
