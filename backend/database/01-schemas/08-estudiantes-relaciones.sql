-- ============================================
-- TABLAS INTERMEDIAS DE ESTUDIANTES
-- Sistema de Gestión Académica - Instituto INCOS
-- Tablas: estudiantes_discapacidades, estudiantes_origenes
-- Relaciones muchos a muchos entre estudiantes y sus características
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas si existen
DROP TABLE IF EXISTS estudiantes_discapacidades;
DROP TABLE IF EXISTS estudiantes_origenes;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: estudiantes_discapacidades
-- Relación muchos a muchos entre estudiantes y tipos_discapacidad
-- Permite que un estudiante tenga múltiples discapacidades con descripciones específicas
-- ============================================

CREATE TABLE estudiantes_discapacidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT NULL COMMENT 'Estudiante (NULL permite flexibilidad en migraciones)',
    tipo_discapacidad_id INT NULL COMMENT 'Tipo de discapacidad (NULL permite flexibilidad en migraciones)',
    
    -- Detalles específicos de esta discapacidad
    descripcion TEXT COMMENT 'Descripción detallada de la discapacidad específica del estudiante (ej: grado de ceguera, tipo de problema visual, si es por diabetes, si es congénito, etc.)',
    grado_discapacidad ENUM('LEVE', 'MODERADO', 'SEVERO', 'PROFUNDO') COMMENT 'Grado de discapacidad',
    causa VARCHAR(100) COMMENT 'Causa de la discapacidad (congénito, adquirido, etc.)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_discapacidad_id) REFERENCES tipos_discapacidad(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_estudiante (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_tipo_discapacidad (tipo_discapacidad_id) COMMENT 'Búsqueda por tipo de discapacidad',
    INDEX idx_grado_discapacidad (grado_discapacidad) COMMENT 'Búsqueda por grado de discapacidad',
    INDEX idx_estudiante_tipo (estudiante_id, tipo_discapacidad_id, activo, deleted_at) COMMENT 'Búsqueda por estudiante y tipo de discapacidad',
    INDEX idx_estudiante_grado (estudiante_id, grado_discapacidad, activo, deleted_at) COMMENT 'Búsqueda por estudiante y grado de discapacidad',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_activo (estudiante_id, activo, deleted_at) COMMENT 'Búsqueda por estudiante y estado activo'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación muchos a muchos entre estudiantes y tipos de discapacidad. Permite que un estudiante tenga múltiples discapacidades, cada una con su descripción específica.';

-- ============================================
-- TABLA: estudiantes_origenes
-- Relación muchos a muchos entre estudiantes y países/orígenes
-- Permite que un estudiante tenga múltiples nacionalidades (doble nacionalidad)
-- ============================================

CREATE TABLE estudiantes_origenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT NULL COMMENT 'Estudiante (NULL permite flexibilidad en migraciones)',
    pais_id INT NULL COMMENT 'País de origen/nacionalidad (NULL si es Bolivia y se usa municipio_nacimiento_id). LÓGICA: Si tiene municipio_nacimiento_id → Es Bolivia. Si tiene pais_id y NO tiene municipio_nacimiento_id → Es extranjero.',
    municipio_nacimiento_id INT NULL COMMENT 'Municipio de nacimiento (solo si es Bolivia, contiene toda la info geográfica). LÓGICA: Si este campo tiene valor, el origen es BOLIVIANA (los municipios son solo de Bolivia).',
    ciudad_nacimiento VARCHAR(100) COMMENT 'Ciudad/localidad de nacimiento (para extranjeros o localidad específica en Bolivia)',
    
    -- Idiomas relacionados con este origen
    idioma_materno_id INT NULL COMMENT 'Idioma materno del país de origen o comunidad donde nació (relacionado con este origen específico)',
    idioma_secundario_id INT NULL COMMENT 'Idioma secundario que más habla relacionado con este origen (ej: si es de Brasil, puede hablar más portugués que español)',
    
    -- Tipo de origen
    tipo_origen ENUM('BOLIVIANA', 'EXTRANJERA', 'DOBLE_NACIONALIDAD') DEFAULT 'BOLIVIANA' COMMENT 'Tipo de nacionalidad: BOLIVIANA (usa municipio_nacimiento_id), EXTRANJERA (usa pais_id y ciudad_nacimiento), DOBLE_NACIONALIDAD (requiere dos registros con es_principal TRUE y FALSE).',
    es_principal BOOLEAN DEFAULT TRUE COMMENT 'Indica si es la nacionalidad/origen principal. Para doble nacionalidad: TRUE para la principal, FALSE para la secundaria.',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE SET NULL,
    FOREIGN KEY (municipio_nacimiento_id) REFERENCES municipios(id) ON DELETE SET NULL,
    FOREIGN KEY (idioma_materno_id) REFERENCES idiomas(id) ON DELETE SET NULL,
    FOREIGN KEY (idioma_secundario_id) REFERENCES idiomas(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_estudiante (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_pais (pais_id) COMMENT 'Búsqueda por país',
    INDEX idx_municipio (municipio_nacimiento_id) COMMENT 'Búsqueda por municipio',
    INDEX idx_idioma_materno (idioma_materno_id) COMMENT 'Búsqueda por idioma materno',
    INDEX idx_idioma_secundario (idioma_secundario_id) COMMENT 'Búsqueda por idioma secundario',
    INDEX idx_tipo_origen (tipo_origen) COMMENT 'Búsqueda por tipo de origen',
    INDEX idx_es_principal (es_principal) COMMENT 'Búsqueda por origen principal',
    INDEX idx_estudiante_principal (estudiante_id, es_principal, activo, deleted_at) COMMENT 'Búsqueda por estudiante y origen principal',
    INDEX idx_estudiante_tipo (estudiante_id, tipo_origen, activo, deleted_at) COMMENT 'Búsqueda por estudiante y tipo de origen',
    INDEX idx_pais_municipio (pais_id, municipio_nacimiento_id, activo, deleted_at) COMMENT 'Búsqueda por país y municipio',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_activo (estudiante_id, activo, deleted_at) COMMENT 'Búsqueda por estudiante y estado activo'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación entre estudiantes y países/orígenes con sus idiomas. Permite manejar nacionalidad principal, doble nacionalidad, y origen de nacimiento. Si es Bolivia, se usa municipio_nacimiento_id; si es extranjero, se usa pais_id y ciudad_nacimiento. Los idiomas están relacionados con el origen específico (ej: si es de Brasil, idioma_materno puede ser Portugués y idioma_secundario puede ser Español).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

