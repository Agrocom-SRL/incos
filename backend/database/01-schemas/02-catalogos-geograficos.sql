-- ============================================
-- CATÁLOGOS GEOGRÁFICOS
-- Sistema de Gestión Académica - Instituto INCOS
-- 6 Tablas: paises, departamentos, provincias, municipios, comunidades, localidades
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLA: paises
-- ============================================

DROP TABLE IF EXISTS paises;

CREATE TABLE paises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre del país',
    codigo_iso CHAR(2) NOT NULL UNIQUE COMMENT 'Código ISO 3166-1 alpha-2',
    codigo_iso3 CHAR(3) COMMENT 'Código ISO 3166-1 alpha-3',
    codigo_numerico CHAR(3) COMMENT 'Código ISO numérico',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_codigo_iso (codigo_iso)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de países';

-- ============================================
-- TABLA: departamentos
-- ============================================

DROP TABLE IF EXISTS departamentos;

CREATE TABLE departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pais_id INT NOT NULL COMMENT 'País al que pertenece',
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
    FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_pais_id (pais_id),
    UNIQUE KEY unique_depto_pais (nombre, pais_id, deleted_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Departamentos de Bolivia';

-- ============================================
-- TABLA: provincias
-- ============================================

DROP TABLE IF EXISTS provincias;

CREATE TABLE provincias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    departamento_id INT NOT NULL COMMENT 'Departamento al que pertenece',
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
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_departamento_id (departamento_id),
    UNIQUE KEY unique_prov_depto (nombre, departamento_id, deleted_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Provincias de Bolivia';

-- ============================================
-- TABLA: municipios
-- ============================================

DROP TABLE IF EXISTS municipios;

CREATE TABLE municipios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provincia_id INT NOT NULL COMMENT 'Provincia a la que pertenece',
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
    FOREIGN KEY (provincia_id) REFERENCES provincias(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_provincia_id (provincia_id),
    UNIQUE KEY unique_muni_prov (nombre, provincia_id, deleted_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Municipios de Bolivia';

-- ============================================
-- TABLA: comunidades
-- ============================================

DROP TABLE IF EXISTS comunidades;

CREATE TABLE comunidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    municipio_id INT NOT NULL COMMENT 'Municipio al que pertenece',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la comunidad',
    tipo ENUM('URBANA', 'RURAL') DEFAULT 'URBANA' COMMENT 'Tipo de comunidad',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (municipio_id) REFERENCES municipios(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_municipio_id (municipio_id),
    INDEX idx_tipo (tipo)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Comunidades (zonas urbanas/rurales)';

-- ============================================
-- TABLA: localidades
-- ============================================

DROP TABLE IF EXISTS localidades;

CREATE TABLE localidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comunidad_id INT COMMENT 'Comunidad a la que pertenece (opcional)',
    municipio_id INT COMMENT 'Municipio directo (alternativa simplificada)',
    nombre VARCHAR(150) NOT NULL COMMENT 'Nombre de la localidad',
    tipo ENUM('ZONA', 'BARRIO', 'URBANIZACION', 'VILLA', 'OTRO') DEFAULT 'ZONA' COMMENT 'Tipo de localidad',
    descripcion TEXT COMMENT 'Descripción o referencias',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE SET NULL,
    FOREIGN KEY (municipio_id) REFERENCES municipios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_comunidad_id (comunidad_id),
    INDEX idx_municipio_id (municipio_id),
    INDEX idx_tipo (tipo),
    
    -- Constraint: al menos uno debe estar presente
    CHECK ((comunidad_id IS NOT NULL) OR (municipio_id IS NOT NULL))
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Localidades (zonas, barrios, urbanizaciones)';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Catálogos geográficos creados exitosamente' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion,
    TABLE_ROWS as filas_aprox
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME IN ('paises', 'departamentos', 'provincias', 'municipios', 'comunidades', 'localidades')
ORDER BY TABLE_NAME;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
