-- ============================================
-- MÓDULO DE ESTUDIANTES - PARTE 2
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: becas_descuentos, estudiantes_becas, estudiantes_apoderados
-- Licencias estudiantiles: ver 18-asistencias-licencias.sql (tabla licencias)
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS estudiantes_apoderados;
DROP TABLE IF EXISTS estudiantes_becas;
DROP TABLE IF EXISTS becas_descuentos;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: becas_descuentos
-- ============================================

CREATE TABLE becas_descuentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Beca 25%, Beca 50%, Beca 75%, Beca 100%',
    codigo VARCHAR(20) COMMENT 'BECA_0, BECA_25, BECA_50, BECA_75, BECA_100',
    porcentaje DECIMAL(5,2) NOT NULL COMMENT 'Porcentaje de descuento (0.00 a 100.00)',
    descripcion TEXT,
    requiere_documentacion BOOLEAN DEFAULT TRUE COMMENT 'Requiere documentos de respaldo',
    requiere_aprobacion_rector BOOLEAN DEFAULT FALSE COMMENT 'Requiere aprobación del Rector (ej: Beca 100%)',
    
    -- Sistema de becas automáticas
    es_automatica BOOLEAN DEFAULT FALSE COMMENT 'Si la beca se asigna automáticamente',
    tipo_automatica ENUM('PROMEDIO_90', 'MANUAL') DEFAULT 'MANUAL' COMMENT 'Tipo de asignación automática: PROMEDIO_90 (si promedio >= 90), MANUAL',
    promedio_minimo DECIMAL(5,2) COMMENT 'Promedio mínimo requerido (ej: 90 para beca 100%)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    -- Índices esenciales
    INDEX idx_porcentaje (porcentaje) COMMENT 'Búsqueda por porcentaje',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_es_automatica (es_automatica) COMMENT 'Filtrado de becas automáticas'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de becas y descuentos sobre el aporte anual de matrícula (400 bs). Permite registrar cualquier tipo de descuento. Escasos recursos es un tipo de descuento más, no un atributo del sistema.';

-- ============================================
-- TABLA: estudiantes_becas
-- ============================================

CREATE TABLE estudiantes_becas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante beneficiario (NULL permite flexibilidad en migraciones)',
    beca_descuento_id INT NULL COMMENT 'Tipo de beca/descuento sobre el aporte anual de matrícula (400 bs) (NULL permite flexibilidad en migraciones)',
    gestion_id INT NULL COMMENT 'Gestión (NULL permite flexibilidad en migraciones)',
    fecha_solicitud DATE NOT NULL COMMENT 'Fecha en que se solicitó el descuento',
    estado ENUM('PENDIENTE', 'ACTIVA', 'FINALIZADA', 'RECHAZADA') DEFAULT 'PENDIENTE' COMMENT 'Estado de la beca',
    documentos_completos BOOLEAN DEFAULT FALSE COMMENT 'Documentación completa',
    fecha_inicio_entrega_documentos DATE COMMENT 'Fecha de inicio de entrega de documentos',
    fecha_fin_entrega_documentos DATE COMMENT 'Fecha de fin de entrega de documentos (puede haber múltiples documentos requeridos)',
    observaciones TEXT COMMENT 'Observaciones',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (beca_descuento_id) REFERENCES becas_descuentos(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Búsqueda de becas por estudiante y estado',
    INDEX idx_gestion_estado (gestion_id, estado, activo, deleted_at) COMMENT 'Búsqueda de becas por gestión y estado',
    INDEX idx_beca_descuento (beca_descuento_id, estado, activo) COMMENT 'Búsqueda por tipo de beca y estado',
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha de solicitud',
    INDEX idx_fechas_entrega (fecha_inicio_entrega_documentos, fecha_fin_entrega_documentos) COMMENT 'Búsqueda por rango de fechas de entrega de documentos',
    INDEX idx_estado_activa (estado, activo, deleted_at) COMMENT 'Búsqueda de becas activas'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Becas y descuentos sobre el aporte anual de matrícula de 400 bs. Reglas: 100% descuento si promedio >= 90 en año anterior, 25% descuento si escasos recursos. Tabla de referencia que el estudiante no interactúa directamente.';

-- ============================================
-- TABLA: estudiantes_apoderados
-- ============================================

CREATE TABLE estudiantes_apoderados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante (NULL permite flexibilidad en migraciones)',
    tipo_parentesco_id INT NULL COMMENT 'Tipo de parentesco (padre, madre, abuelo, tío, tutor, apoderado, orfanato, etc.) (NULL permite flexibilidad en migraciones)',
    
    -- Datos personales básicos
    nombres VARCHAR(150) COMMENT 'Nombres completos del apoderado/tutor',
    apellidos VARCHAR(150) COMMENT 'Apellidos del apoderado/tutor',
    
    -- Datos de contacto
    celular_1 VARCHAR(20) COMMENT 'Celular 1',
    celular_2 VARCHAR(20) COMMENT 'Celular 2',
    vive_con_estudiante BOOLEAN DEFAULT FALSE COMMENT 'Vive con el estudiante',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_parentesco_id) REFERENCES tipos_parentesco(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_tipo_parentesco_id (tipo_parentesco_id) COMMENT 'Búsqueda por tipo de parentesco',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_vive_con (vive_con_estudiante, activo) COMMENT 'Búsqueda por quienes viven con el estudiante'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Apoderados, tutores y referencias familiares de estudiantes. Relación 1 a muchos (un estudiante puede tener múltiples apoderados/tutores). Contempla casos de huérfanos, orfanatos, tíos, abuelos, hermanos mayores, etc.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
