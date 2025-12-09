-- ============================================
-- CATÁLOGOS DE REFERENCIA
-- Sistema de Gestión Académica - Instituto INCOS
-- 8 Tablas: tipos_sangre, idiomas, estados_civiles, tipos_discapacidad, 
--           becas_descuentos, turnos_horarios, roles, permisos
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLA: tipos_sangre
-- ============================================

DROP TABLE IF EXISTS tipos_sangre;

CREATE TABLE tipos_sangre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL UNIQUE COMMENT 'A+, A-, B+, B-, AB+, AB-, O+, O-',
    descripcion VARCHAR(50),
    factor_rh ENUM('POSITIVO', 'NEGATIVO') COMMENT 'Factor RH',
    
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
    INDEX idx_deleted_at (deleted_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tipos de sangre';

-- ============================================
-- TABLA: idiomas
-- ============================================

DROP TABLE IF EXISTS idiomas;

CREATE TABLE idiomas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE COMMENT 'Español, Quechua, Aymara, Guaraní, Inglés',
    codigo_iso CHAR(3) COMMENT 'spa, quz, aym, grn, eng',
    es_oficial BOOLEAN DEFAULT FALSE COMMENT 'Idioma oficial de Bolivia',
    
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
    INDEX idx_es_oficial (es_oficial)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Idiomas';

-- ============================================
-- TABLA: estados_civiles
-- ============================================

DROP TABLE IF EXISTS estados_civiles;

CREATE TABLE estados_civiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE COMMENT 'Soltero(a), Casado(a), Divorciado(a), Viudo(a), Conviviente',
    abreviatura VARCHAR(5) COMMENT 'S, C, D, V, CV',
    
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
    INDEX idx_deleted_at (deleted_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estados civiles';

-- ============================================
-- TABLA: tipos_discapacidad
-- ============================================

DROP TABLE IF EXISTS tipos_discapacidad;

CREATE TABLE tipos_discapacidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE COMMENT 'Visual, Auditiva, Motriz, Intelectual, Psicosocial, Múltiple, Otra',
    descripcion TEXT,
    codigo VARCHAR(10),
    requiere_adaptacion_curricular BOOLEAN DEFAULT FALSE COMMENT 'Requiere adaptaciones especiales',
    
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
    INDEX idx_deleted_at (deleted_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tipos de discapacidad';

-- ============================================
-- TABLA: becas_descuentos
-- ============================================

DROP TABLE IF EXISTS becas_descuentos;

CREATE TABLE becas_descuentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Beca 0%, Beca 25%, Beca 50%, Beca 75%, Beca 100%',
    codigo VARCHAR(20) COMMENT 'BECA_0, BECA_25, BECA_50, BECA_75, BECA_100',
    porcentaje DECIMAL(5,2) NOT NULL COMMENT 'Porcentaje de descuento (0.00 a 100.00)',
    descripcion TEXT,
    requiere_documentacion BOOLEAN DEFAULT TRUE COMMENT 'Requiere documentos de respaldo',
    requiere_aprobacion_rector BOOLEAN DEFAULT FALSE COMMENT 'Requiere aprobación del Rector (ej: Beca 100%)',
    cupo_anual INT COMMENT 'Cupo máximo de becas de este tipo por año',
    
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
    INDEX idx_porcentaje (porcentaje),
    UNIQUE KEY unique_porcentaje (porcentaje, deleted_at),
    
    -- Constraints
    CHECK (porcentaje >= 0 AND porcentaje <= 100)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de becas y descuentos';

-- ============================================
-- TABLA: turnos_horarios
-- ============================================

DROP TABLE IF EXISTS turnos_horarios;

CREATE TABLE turnos_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE COMMENT 'MAÑANA, TARDE, NOCHE',
    codigo VARCHAR(10) COMMENT 'M, T, N',
    hora_inicio TIME NOT NULL COMMENT '07:00, 14:00, 19:00',
    hora_fin TIME NOT NULL COMMENT '12:00, 18:00, 22:00',
    descripcion VARCHAR(100),
    color_hex VARCHAR(7) COMMENT 'Color para UI (#FF5733)',
    
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
    INDEX idx_deleted_at (deleted_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Turnos horarios (mañana, tarde, noche)';

-- ============================================
-- TABLA: roles
-- ============================================

DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUPER_ADMIN, RECTOR, DIRECTOR_ACADEMICO, etc.',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo del rol',
    descripcion TEXT COMMENT 'Descripción detallada del rol',
    nivel_acceso INT DEFAULT 1 COMMENT 'Nivel jerárquico (1=bajo, 5=alto)',
    es_rol_sistema BOOLEAN DEFAULT FALSE COMMENT 'Rol del sistema (no editable)',
    
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
    INDEX idx_nivel_acceso (nivel_acceso),
    INDEX idx_codigo (codigo)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Roles del sistema (RBAC)';

-- ============================================
-- TABLA: permisos
-- ============================================

DROP TABLE IF EXISTS permisos;

CREATE TABLE permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE COMMENT 'estudiantes.ver, calificaciones.registrar',
    nombre VARCHAR(150) NOT NULL COMMENT 'Nombre descriptivo del permiso',
    modulo VARCHAR(50) NOT NULL COMMENT 'ESTUDIANTES, INSCRIPCIONES, CALIFICACIONES, etc.',
    accion VARCHAR(50) NOT NULL COMMENT 'VER, CREAR, EDITAR, ELIMINAR, APROBAR, EXPORTAR',
    descripcion TEXT,
    es_critico BOOLEAN DEFAULT FALSE COMMENT 'Permiso crítico (requiere auditoría especial)',
    
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
    INDEX idx_modulo (modulo),
    INDEX idx_accion (accion),
    INDEX idx_codigo (codigo)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Permisos del sistema (RBAC)';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Catálogos de referencia creados exitosamente' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion,
    TABLE_ROWS as filas_aprox
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME IN (
    'tipos_sangre', 'idiomas', 'estados_civiles', 'tipos_discapacidad',
    'becas_descuentos', 'turnos_horarios', 'roles', 'permisos'
  )
ORDER BY TABLE_NAME;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
