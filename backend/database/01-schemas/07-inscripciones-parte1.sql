-- ============================================
-- MÓDULO DE INSCRIPCIONES
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
    estudiante_id INT NOT NULL COMMENT 'Estudiante inscrito',
    gestion_id INT NOT NULL COMMENT 'Gestión académica (año lectivo)',
    carrera_id INT NOT NULL COMMENT 'Carrera',
    periodo_id INT NOT NULL COMMENT 'Periodo de la carrera que cursa (1º, 2º, 3º, 4º semestre) - NO es etapa de gestión',
    fecha_inscripcion DATE NOT NULL DEFAULT (CURDATE()) COMMENT 'Fecha de inscripción',
    fecha_aprobacion DATE COMMENT 'Fecha de aprobación de la inscripción',
    turno ENUM('MAÑANA', 'TARDE', 'NOCHE') NOT NULL COMMENT 'Turno elegido',
    estado ENUM('BORRADOR', 'PENDIENTE', 'APROBADA', 'RECHAZADA', 'ANULADA') DEFAULT 'PENDIENTE' COMMENT 'Estado de la inscripción',
    motivo_rechazo TEXT COMMENT 'Motivo de rechazo',
    motivo_anulacion TEXT COMMENT 'Motivo de anulación',
    aprobada_por INT COMMENT 'Usuario que aprobó',
    numero_materias INT DEFAULT 0 COMMENT 'Cantidad de materias inscritas',
    carga_horaria_total INT DEFAULT 0 COMMENT 'Carga horaria total',
    observaciones TEXT COMMENT 'Observaciones',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE SET NULL,
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_carrera_id (carrera_id) COMMENT 'Búsqueda por carrera',
    INDEX idx_periodo_id (periodo_id) COMMENT 'Búsqueda por periodo',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_fecha_inscripcion (fecha_inscripcion) COMMENT 'Búsqueda por fecha',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscripciones de estudiantes por gestión y periodo de carrera. periodo_id = semestre de la carrera (1º, 2º, 3º, 4º)';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;
