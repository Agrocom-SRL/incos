-- ============================================
-- MÓDULO DE INSCRIPCIONES - PARTE 1
-- Sistema de Gestión Académica - Instituto INCOS
-- 1 Tabla: inscripciones
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS inscripciones;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: inscripciones
-- ============================================

CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_datos_academicos_id INT NULL COMMENT 'Datos académicos del estudiante (referencia a estudiantes_datos_academicos). Contiene la carrera del estudiante y su gestión de ingreso. El estudiante debe estar registrado con documentos y pago completos.',
    gestion_id INT NULL COMMENT 'Gestión académica (año lectivo) en la que se inscribe (referencia a gestiones). Diferente de gestion_ingreso_id en estudiantes_datos_academicos.',
    
    -- Tipo de inscripción
    tipo_inscripcion ENUM('NUEVO', 'REINGRESO', 'CONTINUIDAD', 'TRASPASO_ENTRADA', 'TRANSITABILIDAD_ENTRADA') DEFAULT 'CONTINUIDAD'
        COMMENT 'Tipo de inscripción: NUEVO (bloques periodo 1), REINGRESO, CONTINUIDAD (materias individuales), TRASPASO_ENTRADA (de otro instituto, traspaso_id), TRANSITABILIDAD_ENTRADA (Técnico Medio, transitabilidad_id)',
    traspaso_id INT NULL COMMENT 'Si tipo_inscripcion=TRASPASO_ENTRADA, referencia a traspasos. FK se añade en 12-traspasos.sql',
    transitabilidad_id INT NULL COMMENT 'Si tipo_inscripcion=TRANSITABILIDAD_ENTRADA, referencia a transitabilidades. FK se añade en 12-transitabilidades.sql',

    -- Fecha de inscripción
    fecha_inscripcion DATE NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha en que se realizó la inscripción',

    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones generales sobre la inscripción',
    
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
    
    FOREIGN KEY (estudiante_datos_academicos_id) REFERENCES estudiantes_datos_academicos(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_estudiante_datos_academicos_id (estudiante_datos_academicos_id) COMMENT 'Búsqueda por datos académicos del estudiante',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_tipo_inscripcion (tipo_inscripcion) COMMENT 'Filtrado por tipo de inscripción',
    INDEX idx_fecha_inscripcion (fecha_inscripcion) COMMENT 'Búsqueda por fecha',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_datos_gestion (estudiante_datos_academicos_id, gestion_id, activo, deleted_at) COMMENT 'Búsqueda de inscripciones por estudiante y gestión',
    INDEX idx_gestion_activo (gestion_id, activo, deleted_at) COMMENT 'Búsqueda de inscripciones por gestión',
    INDEX idx_tipo_activo (tipo_inscripcion, activo, deleted_at) COMMENT 'Búsqueda por tipo de inscripción',
    INDEX idx_traspaso_id (traspaso_id) COMMENT 'Búsqueda por traspaso',
    INDEX idx_transitabilidad_id (transitabilidad_id) COMMENT 'Búsqueda por transitabilidad'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscripciones de estudiantes a una gestión académica. traspaso_id y transitabilidad_id vinculan con traspasos (12-traspasos.sql) y transitabilidades (12-transitabilidades.sql).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
