-- ============================================
-- MÓDULO DE ASISTENCIAS
-- Sistema de Gestión Académica - Instituto INCOS
-- 1 Tabla: asistencias
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS asistencias;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: asistencias
-- ============================================

CREATE TABLE asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_materia_id INT NULL COMMENT 'Inscripción materia a la que pertenece esta asistencia (referencia a inscripciones_materias). Permite obtener el estudiante y la materia.',
    
    -- Fecha y hora de la clase
    fecha_clase DATE NOT NULL COMMENT 'Fecha de la clase a la que corresponde esta asistencia',
    hora_clase TIME NULL COMMENT 'Hora de la clase (opcional, para clases con horarios específicos)',
    
    -- Estado de asistencia
    estado ENUM('PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO') NOT NULL DEFAULT 'AUSENTE' 
        COMMENT 'Estado de asistencia: PRESENTE (asistió), AUSENTE (no asistió), TARDANZA (llegó tarde), JUSTIFICADO (ausencia justificada)',
    
    -- Justificación (si estado = JUSTIFICADO)
    motivo_justificacion TEXT NULL COMMENT 'Motivo de la justificación (si estado = JUSTIFICADO)',
    documento_justificacion_id INT NULL COMMENT 'Documento que justifica la ausencia (referencia a documentos_estudiante, si aplica)',
    
    -- Observaciones
    observaciones TEXT NULL COMMENT 'Observaciones adicionales sobre la asistencia',
    
    -- Registrado por
    registrado_por INT NULL COMMENT 'Usuario que registró la asistencia (referencia a usuarios, típicamente el docente)',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se registró la asistencia',
    
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
    
    FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id) ON DELETE SET NULL,
    FOREIGN KEY (documento_justificacion_id) REFERENCES documentos_estudiante(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_inscripcion_materia_id (inscripcion_materia_id) COMMENT 'Búsqueda por inscripción materia',
    INDEX idx_fecha_clase (fecha_clase) COMMENT 'Búsqueda por fecha de clase',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado de asistencia',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_inscripcion_fecha (inscripcion_materia_id, fecha_clase, activo, deleted_at) COMMENT 'Búsqueda de asistencia por materia y fecha (evita duplicados)',
    INDEX idx_fecha_estado (fecha_clase, estado, activo, deleted_at) COMMENT 'Búsqueda de asistencias por fecha y estado',
    INDEX idx_registrado_por (registrado_por) COMMENT 'Búsqueda por usuario que registró'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de asistencia de estudiantes a clases. Cada registro representa la asistencia de un estudiante a una clase específica de una materia.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
