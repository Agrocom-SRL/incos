-- ============================================
-- CATÁLOGOS DE REFERENCIA
-- Sistema de Gestión Académica - Instituto INCOS
-- 6 Tablas: idiomas, estados_civiles, tipos_discapacidad, turnos_horarios, tipos_parentesco, documentacion
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS documentacion;
DROP TABLE IF EXISTS tipos_parentesco;
DROP TABLE IF EXISTS tipos_discapacidad;
DROP TABLE IF EXISTS estados_civiles;
DROP TABLE IF EXISTS idiomas;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: idiomas
-- ============================================

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
    
    -- Foreign Keys
    
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
    
    -- Foreign Keys
    
    -- Índices esenciales
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_abreviatura (abreviatura) COMMENT 'Búsqueda por abreviatura',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estados civiles';

-- ============================================
-- TABLA: tipos_discapacidad
-- ============================================

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
    
    -- Foreign Keys
    
    -- Índices esenciales
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tipos de discapacidad (para estadísticas de estudiantes)';

-- ============================================
-- TABLA: tipos_parentesco
-- ============================================

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
    
    -- Foreign Keys
    
    -- Índices esenciales
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tipos de parentesco para apoderados/tutores de estudiantes';

-- ============================================
-- TABLA: documentacion
-- ============================================

CREATE TABLE documentacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del documento requerido (ej: Cédula de Identidad, Certificado de Nacimiento, Diploma de Bachiller)',
    tipo_documento ENUM(
        'INSCRIPCION',
        'LICENCIA',
        'PASANTIA',
        'DESCUENTO',
        'TITULACION',
        'TRASPASO',
        'TRANSFERENCIA',
        'BECA',
        'OTRO'
    ) NOT NULL COMMENT 'Tipo de documento según categoría: inscripción, licencia, pasantía, descuento, titulación, traspaso, transferencia, beca u otro',
    documento_padre_id INT NULL COMMENT 'ID del documento padre al que reemplaza. Si es NULL, es un documento de primer orden. Si tiene valor, es un documento alternativo/reemplazo del padre. Permite crear jerarquías de documentos (ej: Boletín de Calificaciones como alternativa de Diploma de Bachiller)',
    acepta_fotocopia BOOLEAN DEFAULT FALSE COMMENT 'Indica si se acepta fotocopia del documento. Si es TRUE, se acepta fotocopia simple o legalizada según política del instituto. Si es FALSE, solo se acepta documento original.',
    es_original BOOLEAN DEFAULT FALSE COMMENT 'Indica si el documento debe ser original (TRUE) o puede ser fotocopia (FALSE). Documentos originales: Diploma de Bachiller, Boletín de Calificaciones, Foto 3x3, Folder con nepaco.',
    requerido BOOLEAN DEFAULT TRUE COMMENT 'Indica si el documento es requerido para completar la inscripción. Si es FALSE, no se generará acta de compromiso si falta.',
    es_documento_sistema BOOLEAN DEFAULT FALSE COMMENT 'Indica si el documento es generado automáticamente por el sistema (ej: Acta de Compromiso). Si es TRUE, el documento se genera cuando falta documentación requerida.',
    orden INT DEFAULT 0 COMMENT 'Orden de visualización en el formulario',
    descripcion TEXT COMMENT 'Descripción adicional del documento requerido',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (documento_padre_id) REFERENCES documentacion(id) ON DELETE SET NULL,
    
    -- Índices esenciales
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_tipo_documento (tipo_documento) COMMENT 'Filtrado por tipo de documento',
    INDEX idx_documento_padre_id (documento_padre_id) COMMENT 'Búsqueda de documentos alternativos por padre',
    INDEX idx_requerido (requerido) COMMENT 'Filtrado por documentos requeridos',
    INDEX idx_es_original (es_original) COMMENT 'Filtrado por documentos originales',
    INDEX idx_es_documento_sistema (es_documento_sistema) COMMENT 'Filtrado por documentos generados por el sistema',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_orden (orden) COMMENT 'Ordenamiento',
    INDEX idx_tipo_requerido (tipo_documento, requerido, activo, deleted_at) COMMENT 'Búsqueda por tipo y requerido',
    INDEX idx_activo_orden (activo, orden, deleted_at) COMMENT 'Búsqueda de activos ordenados',
    INDEX idx_padre_activo (documento_padre_id, activo, deleted_at) COMMENT 'Búsqueda de alternativas activas de un documento padre'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de documentación requerida para inscripción de estudiantes. Define qué documentos se necesitan y si aceptan fotocopia según política del instituto.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
